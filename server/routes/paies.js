const express = require('express');
const router = express.Router();

module.exports = function registerPaiesRoutes(server, db) {
  // GET /paies - Obtenir toutes les périodes de paie (format DataTable)
  server.get('/paies', (req, res) => {
    const start = parseInt(req.query.start || '0', 10);
    const length = parseInt(req.query.length || '10', 10);
    const sortBy = req.query.sortBy; // optional
    const sortDir = req.query.sortDir === 'desc' ? 'desc' : 'asc';

    let all = db.get('periodePaie').value() || [];

    // Filtrage
    const excludedKeys = new Set(['start', 'length', 'sortBy', 'sortDir']);
    Object.entries(req.query).forEach(([key, value]) => {
      if (excludedKeys.has(key) || value === undefined || value === '') return;
      all = all.filter((periode) => {
        const fieldVal = periode[key];
        if (fieldVal === undefined || fieldVal === null) return false;
        return String(fieldVal)
          .toLowerCase()
          .includes(String(value).toLowerCase());
      });
    });

    const recordsFiltered = all.length;

    // Tri (optionnel)
    if (sortBy) {
      all.sort((a, b) => {
        const av = a[sortBy];
        const bv = b[sortBy];
        if (av === bv) return 0;
        if (av === undefined) return 1;
        if (bv === undefined) return -1;
        if (typeof av === 'number' && typeof bv === 'number') {
          return sortDir === 'asc' ? av - bv : bv - av;
        }
        return sortDir === 'asc'
          ? String(av).localeCompare(String(bv))
          : String(bv).localeCompare(String(av));
      });
    }

    const recordsTotal = db.get('periodePaie').value()?.length || 0;
    const sliced = all.slice(start, start + length).map((periode) => {
      // Enrich with employees (from bulletins of this period)
      const bulletins =
        db.get('bulletinPaie').filter({ periodePaieId: periode.id }).value() ||
        [];

      const employees = bulletins.map((b) => ({
        id: b.employeId,
        employeId: b.employeId,
        numeroEmploye: b.numeroEmploye,
        nomComplet: b.nomComplet,
        departement: b.departement,
        rib: b.rib,
        salaireNet: b.salaireNet,
        statut: b.statut || 'en_cours'
      }));

      // Optionally compute aggregates if not present
      const nombreEmployes =
        typeof periode.nombreEmployes === 'number'
          ? periode.nombreEmployes
          : employees.length;
      const montantTotal =
        typeof periode.montantTotal === 'number'
          ? periode.montantTotal
          : employees.reduce((acc, e) => acc + (Number(e.salaireNet) || 0), 0);

      return {
        ...periode,
        nombreEmployes,
        montantTotal,
        employees
      };
    });

    return res.json({
      status: 'success',
      message: 'Liste des périodes de paie récupérée avec succès',
      data: sliced,
      recordsTotal,
      recordsFiltered
    });
  });

  // GET /paies/:id - Obtenir une période de paie spécifique
  server.get('/paies/:id', (req, res) => {
    const periode = db.get('periodePaie').find({ id: req.params.id }).value();

    if (!periode) {
      return res
        .status(404)
        .json({ status: 'error', message: 'Période de paie non trouvée' });
    }

    return res.json({ status: 'success', data: periode });
  });

  // Helper pour trouver une période par id (string ou number)
  function findPeriodeById(db, id) {
    const all = db.get('periodePaie').value() || [];
    return all.find((p) => String(p.id) === String(id));
  }

  // POST /paies/:id/cloture - Clôturer une période de paie
  server.post('/paies/:id/cloture', (req, res) => {
    const periode = findPeriodeById(db, req.params.id);

    if (!periode) {
      return res
        .status(404)
        .json({ status: 'error', message: 'Période de paie non trouvée' });
    }

    if (periode.statut === 'cloture') {
      return res.status(400).json({
        status: 'error',
        message: 'Cette période de paie est déjà clôturée'
      });
    }

    // Mettre à jour le statut de la période
    db.get('periodePaie')
      .find((p) => String(p.id) === String(req.params.id))
      .assign({
        statut: 'cloture',
        dateCloture: new Date().toISOString()
      })
      .write();

    // Mettre à jour tous les bulletins de la période
    const bulletins =
      db.get('bulletinPaie').filter({ periodePaieId: req.params.id }).value() ||
      [];
    bulletins.forEach((bulletin) => {
      if (bulletin.statut === 'en_cours') {
        db.get('bulletinPaie')
          .find({ id: bulletin.id })
          .assign({
            statut: 'valide',
            dateModification: new Date().toISOString()
          })
          .write();
      }
    });

    const updatedPeriode = findPeriodeById(db, req.params.id);

    return res.json({
      status: 'success',
      message: 'Période de paie clôturée avec succès',
      data: updatedPeriode
    });
  });

  // POST /paies/:id/generate-pdf - Générer les PDFs de tous les bulletins d'une période
  server.post('/paies/:id/generate-pdf', (req, res) => {
    const periode = db.get('periodePaie').find({ id: req.params.id }).value();

    if (!periode) {
      return res
        .status(404)
        .json({ status: 'error', message: 'Période de paie non trouvée' });
    }

    const bulletins =
      db.get('bulletinPaie').filter({ periodePaieId: req.params.id }).value() ||
      [];

    // Simuler la génération de PDF
    bulletins.forEach((bulletin) => {
      db.get('bulletinPaie')
        .find({ id: bulletin.id })
        .assign({
          pdfGenere: true,
          urlPdf: `/pdfs/bulletins/${bulletin.id}.pdf`,
          dateGenerationPdf: new Date().toISOString()
        })
        .write();
    });

    return res.json({
      status: 'success',
      message: `${bulletins.length} bulletin(s) de paie généré(s) en PDF`,
      data: {
        nombreBulletins: bulletins.length,
        periodePaieId: req.params.id
      }
    });
  });

  // POST /paies/:id/send-emails - Envoyer les bulletins par email à tous les employés
  server.post('/paies/:id/send-emails', (req, res) => {
    const periode = db.get('periodePaie').find({ id: req.params.id }).value();

    if (!periode) {
      return res
        .status(404)
        .json({ status: 'error', message: 'Période de paie non trouvée' });
    }

    const bulletins =
      db.get('bulletinPaie').filter({ periodePaieId: req.params.id }).value() ||
      [];

    // Simuler l'envoi d'emails
    let emailsEnvoyes = 0;
    bulletins.forEach((bulletin) => {
      // Vérifier si le bulletin a un PDF généré
      if (bulletin.pdfGenere) {
        db.get('bulletinPaie')
          .find({ id: bulletin.id })
          .assign({
            emailEnvoye: true,
            dateEnvoiEmail: new Date().toISOString()
          })
          .write();
        emailsEnvoyes++;
      }
    });

    return res.json({
      status: 'success',
      message: `${emailsEnvoyes} email(s) envoyé(s) avec succès`,
      data: {
        emailsEnvoyes,
        totalBulletins: bulletins.length,
        periodePaieId: req.params.id
      }
    });
  });

  // GET /paies/:id/export - Exporter les données d'une période de paie en Excel
  server.get('/paies/:id/export', (req, res) => {
    const periode = db.get('periodePaie').find({ id: req.params.id }).value();

    if (!periode) {
      return res
        .status(404)
        .json({ status: 'error', message: 'Période de paie non trouvée' });
    }

    const bulletins =
      db.get('bulletinPaie').filter({ periodePaieId: req.params.id }).value() ||
      [];

    // Simuler l'export Excel - en production, utiliser une bibliothèque comme exceljs
    const csvData = [
      [
        'N° Employé',
        'Nom Complet',
        'Poste',
        'Département',
        'Salaire Net',
        'Statut'
      ],
      ...bulletins.map((b) => [
        b.numeroEmploye,
        b.nomComplet,
        b.poste,
        b.departement,
        b.salaireNet,
        b.statut
      ])
    ];

    const csvString = csvData.map((row) => row.join(',')).join('\n');

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=paie_${periode.nom}_${Date.now()}.xlsx`
    );

    // En mode mock, on retourne du CSV au lieu d'Excel
    return res.send(csvString);
  });

  // GET /paies/:id/bulletins - Obtenir tous les bulletins d'une période (format DataTable)
  server.get('/paies/:id/bulletins', (req, res) => {
    const start = parseInt(req.query.start || '0', 10);
    const length = parseInt(req.query.length || '10', 10);
    const sortBy = req.query.sortBy || 'numeroEmploye';
    const sortDir = req.query.sortDir === 'desc' ? 'desc' : 'asc';

    let all =
      db.get('bulletinPaie').filter({ periodePaieId: req.params.id }).value() ||
      [];

    // Filtrage
    const excludedKeys = new Set(['start', 'length', 'sortBy', 'sortDir']);
    Object.entries(req.query).forEach(([key, value]) => {
      if (excludedKeys.has(key) || value === undefined || value === '') return;
      all = all.filter((bulletin) => {
        const fieldVal = bulletin[key];
        if (fieldVal === undefined || fieldVal === null) return false;
        return String(fieldVal)
          .toLowerCase()
          .includes(String(value).toLowerCase());
      });
    });

    const recordsFiltered = all.length;

    // Tri
    if (sortBy) {
      all.sort((a, b) => {
        const av = a[sortBy];
        const bv = b[sortBy];
        if (av === bv) return 0;
        if (av === undefined) return 1;
        if (bv === undefined) return -1;
        if (typeof av === 'number' && typeof bv === 'number') {
          return sortDir === 'asc' ? av - bv : bv - av;
        }
        return sortDir === 'asc'
          ? String(av).localeCompare(String(bv))
          : String(bv).localeCompare(String(av));
      });
    }

    // Pagination
    const data = all.slice(start, start + length);
    const recordsTotal =
      db.get('bulletinPaie').filter({ periodePaieId: req.params.id }).value()
        ?.length || 0;
    const employeesById = Object.fromEntries(
      (db.get('hrEmployees').value() || []).map((e) => [String(e.id), e])
    );

    const enriched = data.map((bulletin) => ({
      ...bulletin,
      employe: employeesById[String(bulletin.employeId)]
    }));
    return res.json({
      status: 'success',
      message: 'Liste des bulletins de paie récupérée avec succès',
      data,
      recordsTotal,
      recordsFiltered
    });
  });

  // GET /paies/:periodeId/bulletins/:employeId - Obtenir le bulletin d'un employé pour une période
  server.get('/paies/:periodeId/bulletins/:employeId', (req, res) => {
    const bulletin = db
      .get('bulletinPaie')
      .find({
        periodePaieId: req.params.periodeId,
        employeId: req.params.employeId
      })
      .value();

    if (!bulletin) {
      return res
        .status(404)
        .json({ status: 'error', message: 'Bulletin de paie non trouvé' });
    }

    return res.json({ status: 'success', data: bulletin });
  });

  // PUT /paies/:periodeId/bulletins/:employeId - Mettre à jour un bulletin de paie
  server.put('/paies/:periodeId/bulletins/:employeId', (req, res) => {
    const bulletin = db
      .get('bulletinPaie')
      .find({
        periodePaieId: req.params.periodeId,
        employeId: req.params.employeId
      })
      .value();

    if (!bulletin) {
      return res
        .status(404)
        .json({ status: 'error', message: 'Bulletin de paie non trouvé' });
    }

    const updatedBulletin = {
      ...bulletin,
      ...req.body,
      dateModification: new Date().toISOString()
    };

    db.get('bulletinPaie')
      .find({
        periodePaieId: req.params.periodeId,
        employeId: req.params.employeId
      })
      .assign(updatedBulletin)
      .write();

    return res.json({ status: 'success', data: updatedBulletin });
  });

  // PUT /paies/:periodeId/bulletins/:employeId/temps-travail - Mettre à jour le temps de travail
  server.put(
    '/paies/:periodeId/bulletins/:employeId/temps-travail',
    (req, res) => {
      const bulletin = db
        .get('bulletinPaie')
        .find({
          periodePaieId: req.params.periodeId,
          employeId: req.params.employeId
        })
        .value();

      if (!bulletin) {
        return res
          .status(404)
          .json({ status: 'error', message: 'Bulletin de paie non trouvé' });
      }

      const {
        joursTravailles,
        joursConges,
        joursAbsences,
        joursRecuperationPayes,
        heuresTravaillees
      } = req.body;

      // Recalculer le salaire de base avec les nouvelles heures
      const salaireBase = heuresTravaillees * bulletin.tauxHoraire;

      // Recalculer les éléments variables si nécessaire
      const elementsVariables = bulletin.elementsVariables || [];

      // Recalculer le salaire brut
      const totalElementsVariables = elementsVariables.reduce(
        (sum, el) => sum + el.montant,
        0
      );
      const salaireBrut = salaireBase + totalElementsVariables;

      // Recalculer les cotisations avec la nouvelle base
      const cotisations = (bulletin.cotisations || []).map((cot) => {
        const base =
          cot.baseCalcul === 'salaireBrut' ? salaireBrut : salaireBase;
        const montant = base * (cot.taux / 100);
        const montantPatronal = cot.tauxPatronal
          ? base * (cot.tauxPatronal / 100)
          : 0;
        return {
          ...cot,
          base,
          montant,
          montantPatronal
        };
      });

      const totalCotisations = cotisations.reduce(
        (sum, cot) => sum + cot.montant,
        0
      );
      const salaireBrutImposable = salaireBrut - totalCotisations;

      // Calcul IR simplifié (à adapter selon la logique métier)
      const ir =
        salaireBrutImposable > 2500 ? (salaireBrutImposable - 2500) * 0.1 : 0;
      const salaireNet = salaireBrutImposable - ir;

      const updatedBulletin = {
        ...bulletin,
        joursTravailles,
        joursConges,
        joursAbsences,
        joursRecuperationPayes,
        heuresTravaillees,
        salaireBase,
        salaireBrut,
        cotisations,
        totalCotisations,
        salaireBrutImposable,
        ir,
        salaireNet,
        dateModification: new Date().toISOString()
      };

      db.get('bulletinPaie')
        .find({
          periodePaieId: req.params.periodeId,
          employeId: req.params.employeId
        })
        .assign(updatedBulletin)
        .write();

      return res.json(updatedBulletin);
    }
  );

  // POST /paies/:periodeId/bulletins/:employeId/reset - Réinitialiser le bulletin selon le profil
  server.post('/paies/:periodeId/bulletins/:employeId/reset', (req, res) => {
    const bulletin = db
      .get('bulletinPaie')
      .find({
        periodePaieId: req.params.periodeId,
        employeId: req.params.employeId
      })
      .value();

    if (!bulletin) {
      return res
        .status(404)
        .json({ status: 'error', message: 'Bulletin de paie non trouvé' });
    }

    // Récupérer l'employé pour avoir son profil
    const employee = db
      .get('employees')
      .find({ id: req.params.employeId })
      .value();

    if (!employee) {
      return res
        .status(404)
        .json({ status: 'error', message: 'Employé non trouvé' });
    }

    // Réinitialiser les éléments variables (garder seulement les éléments du profil de base)
    const resetBulletin = {
      ...bulletin,
      elementsVariables: [], // On peut ajouter les éléments du profil ici si nécessaire
      autresElements: [],
      dateModification: new Date().toISOString()
    };

    // Recalculer le bulletin
    const salaireBase =
      resetBulletin.heuresTravaillees * resetBulletin.tauxHoraire;
    const salaireBrut = salaireBase;

    const cotisations = (bulletin.cotisations || []).map((cot) => {
      const base = cot.baseCalcul === 'salaireBrut' ? salaireBrut : salaireBase;
      const montant = base * (cot.taux / 100);
      const montantPatronal = cot.tauxPatronal
        ? base * (cot.tauxPatronal / 100)
        : 0;
      return { ...cot, base, montant, montantPatronal };
    });

    const totalCotisations = cotisations.reduce(
      (sum, cot) => sum + cot.montant,
      0
    );
    const salaireBrutImposable = salaireBrut - totalCotisations;
    const ir =
      salaireBrutImposable > 2500 ? (salaireBrutImposable - 2500) * 0.1 : 0;
    const salaireNet = salaireBrutImposable - ir;

    const finalBulletin = {
      ...resetBulletin,
      salaireBase,
      salaireBrut,
      cotisations,
      totalCotisations,
      salaireBrutImposable,
      ir,
      salaireNet
    };

    db.get('bulletinPaie')
      .find({
        periodePaieId: req.params.periodeId,
        employeId: req.params.employeId
      })
      .assign(finalBulletin)
      .write();

    return res.json(finalBulletin);
  });

  // POST /paies/:periodeId/bulletins/:employeId/generate - Générer le bulletin (PDF/Excel)
  server.post('/paies/:periodeId/bulletins/:employeId/generate', (req, res) => {
    const bulletin = db
      .get('bulletinPaie')
      .find({
        periodePaieId: req.params.periodeId,
        employeId: req.params.employeId
      })
      .value();

    if (!bulletin) {
      return res
        .status(404)
        .json({ status: 'error', message: 'Bulletin de paie non trouvé' });
    }

    const format = req.body.format || 'pdf';

    // Simuler la génération d'un document
    // Dans une vraie application, vous utiliseriez une bibliothèque comme pdfkit, puppeteer, ou exceljs
    const mockPdfContent = `
      BULLETIN DE PAIE
      ================
      
      Employé: ${bulletin.nomComplet}
      Période: ${bulletin.mois}/${bulletin.annee}
      
      GAINS:
      - Salaire de base: ${bulletin.salaireBase.toFixed(2)} MAD
      
      COTISATIONS:
      - Total: ${bulletin.totalCotisations.toFixed(2)} MAD
      
      NET À PAYER: ${bulletin.salaireNet.toFixed(2)} MAD
    `;

    if (format === 'pdf') {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=bulletin_${bulletin.employeId}.pdf`
      );
      return res.send(Buffer.from(mockPdfContent));
    } else {
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=bulletin_${bulletin.employeId}.xlsx`
      );
      return res.send(Buffer.from(mockPdfContent));
    }
  });

  // POST /paies/:periodeId/bulletins/:employeId/close - Clôturer le bulletin
  server.post('/paies/:periodeId/bulletins/:employeId/close', (req, res) => {
    const bulletin = db
      .get('bulletinPaie')
      .find({
        periodePaieId: req.params.periodeId,
        employeId: req.params.employeId
      })
      .value();

    if (!bulletin) {
      return res
        .status(404)
        .json({ status: 'error', message: 'Bulletin de paie non trouvé' });
    }

    if (bulletin.statut === 'cloture') {
      return res
        .status(400)
        .json({ status: 'error', message: 'Le bulletin est déjà clôturé' });
    }

    const closedBulletin = {
      ...bulletin,
      statut: 'cloture',
      dateCloture: new Date().toISOString(),
      dateModification: new Date().toISOString()
    };

    db.get('bulletinPaie')
      .find({
        periodePaieId: req.params.periodeId,
        employeId: req.params.employeId
      })
      .assign(closedBulletin)
      .write();

    return res.json(closedBulletin);
  });

  // GET /paies/rubriques - Obtenir toutes les rubriques de paie
  server.get('/paies/rubriques/all', (req, res) => {
    const rubriques = db.get('rubriquePaie').value() || [];
    return res.json({ status: 'success', data: rubriques });
  });

  // GET /paies/rubriques/:type - Obtenir les rubriques par type
  server.get('/paies/rubriques/type/:type', (req, res) => {
    const rubriques =
      db.get('rubriquePaie').filter({ type: req.params.type }).value() || [];
    return res.json({ status: 'success', data: rubriques });
  });

  // POST /paies/:periodeId/bulletins/:employeId/elements - Ajouter un élément variable
  server.post('/paies/:periodeId/bulletins/:employeId/elements', (req, res) => {
    const bulletin = db
      .get('bulletinPaie')
      .find({
        periodePaieId: req.params.periodeId,
        employeId: req.params.employeId
      })
      .value();

    if (!bulletin) {
      return res
        .status(404)
        .json({ status: 'error', message: 'Bulletin de paie non trouvé' });
    }

    const newElement = req.body;

    // Ajouter l'élément à la bonne catégorie selon son type
    if (newElement.type === 'gain') {
      bulletin.elementsVariables = bulletin.elementsVariables || [];
      bulletin.elementsVariables.push(newElement);
    } else if (newElement.type === 'cotisation') {
      bulletin.cotisations = bulletin.cotisations || [];
      bulletin.cotisations.push(newElement);
    } else if (newElement.type === 'autre') {
      bulletin.autresElements = bulletin.autresElements || [];
      bulletin.autresElements.push(newElement);
    }

    bulletin.dateModification = new Date().toISOString();

    db.get('bulletinPaie')
      .find({
        periodePaieId: req.params.periodeId,
        employeId: req.params.employeId
      })
      .assign(bulletin)
      .write();

    return res.json({ status: 'success', data: bulletin });
  });

  // DELETE /paies/:periodeId/bulletins/:employeId/elements/:rubriqueId - Supprimer un élément variable
  server.delete(
    '/paies/:periodeId/bulletins/:employeId/elements/:rubriqueId',
    (req, res) => {
      const bulletin = db
        .get('bulletinPaie')
        .find({
          periodePaieId: req.params.periodeId,
          employeId: req.params.employeId
        })
        .value();

      if (!bulletin) {
        return res
          .status(404)
          .json({ status: 'error', message: 'Bulletin de paie non trouvé' });
      }

      const rubriqueId = req.params.rubriqueId;

      // Supprimer de toutes les catégories possibles
      bulletin.elementsVariables =
        bulletin.elementsVariables?.filter(
          (e) => e.rubriquePaieId !== rubriqueId
        ) || [];
      bulletin.cotisations =
        bulletin.cotisations?.filter((c) => c.rubriquePaieId !== rubriqueId) ||
        [];
      bulletin.autresElements =
        bulletin.autresElements?.filter(
          (a) => a.rubriquePaieId !== rubriqueId
        ) || [];

      bulletin.dateModification = new Date().toISOString();

      db.get('bulletinPaie')
        .find({
          periodePaieId: req.params.periodeId,
          employeId: req.params.employeId
        })
        .assign(bulletin)
        .write();

      return res.json({ status: 'success', data: bulletin });
    }
  );

  // GET /paies/:id/virements - Obtenir les virements d'une période
  server.get('/paies/:id/virements', (req, res) => {
    const bulletins =
      db.get('bulletinPaie').filter({ periodePaieId: req.params.id }).value() ||
      [];

    const virements = bulletins.map((b) => ({
      id: b.id,
      employeId: b.employeId,
      numeroEmploye: b.numeroEmploye,
      nomComplet: b.nomComplet,
      rib: b.rib,
      montant: b.salaireNet,
      statut: b.statut || 'en_attente'
    }));

    return res.json({
      status: 'success',
      message: 'Virements récupérés avec succès',
      data: virements
    });
  });

  // POST /paies/:id/virements/executer - Exécuter les virements
  server.post('/paies/:id/virements/executer', (req, res) => {
    const { employeIds } = req.body;

    const bulletins =
      db
        .get('bulletinPaie')
        .filter((b) => {
          const match = b.periodePaieId === req.params.id;
          return match && (!employeIds || employeIds.includes(b.employeId));
        })
        .value() || [];

    bulletins.forEach((bulletin) => {
      db.get('bulletinPaie')
        .find({ id: bulletin.id })
        .assign({
          statut: 'paye',
          dateModification: new Date().toISOString()
        })
        .write();
    });

    return res.json({
      status: 'success',
      message: 'Virements exécutés avec succès',
      count: bulletins.length
    });
  });

  // Création d'une période de paie et génération des bulletins pour tous les employés
  server.post('/paies', async (req, res) => {
    try {
      const { mois, annee } = req.body;
      if (!mois || !annee) {
        return res
          .status(400)
          .json({ status: 'error', message: 'Mois et année requis' });
      }
      // Générer un nouvel id unique pour la période
      const periodes = db.get('periodePaie').value() || [];
      const newId =
        periodes.length > 0
          ? (parseInt(periodes[periodes.length - 1].id, 10) + 1).toString()
          : '1';
      // Générer le nom de la période
      const moisNoms = [
        'Janvier',
        'Février',
        'Mars',
        'Avril',
        'Mai',
        'Juin',
        'Juillet',
        'Août',
        'Septembre',
        'Octobre',
        'Novembre',
        'Décembre'
      ];
      const nom = `${moisNoms[mois - 1]} ${annee}`;
      // Déterminer les dates de début et de fin
      const dateDebut = `${annee}-${String(mois).padStart(2, '0')}-01`;
      const dateFin = new Date(annee, mois, 0); // dernier jour du mois
      const dateFinStr = `${annee}-${String(mois).padStart(2, '0')}-${String(dateFin.getDate()).padStart(2, '0')}`;
      // Créer la période
      const periode = {
        id: newId,
        nom,
        mois,
        annee,
        dateDebut,
        dateFin: dateFinStr,
        statut: 'en_cours',
        nombreEmployes: 0,
        montantTotal: 0,
        dateCreation: new Date().toISOString(),
        dateModification: new Date().toISOString(),
        creePar: 'system',
        modifiePar: 'system'
      };
      // Ajouter la période à la base
      db.get('periodePaie').push(periode).write();
      // Charger les employés actifs
      const employees =
        db.get('hrEmployees').filter({ isActive: true }).value() || [];
      let montantTotal = 0;
      // Générer les bulletins pour chaque employé
      const bulletins = employees.map((emp, idx) => {
        const salaireBase = emp.baseSalary || 0;
        const tauxHoraire =
          Math.round((salaireBase / (emp.weeklyHours * 4)) * 100) / 100;
        const heuresTravaillees = emp.weeklyHours * 4;
        const bulletin = {
          id: `${newId}-${emp.id}`,
          periodePaieId: newId,
          employeId: String(emp.id),
          numeroEmploye: emp.matricule || String(emp.id),
          nomComplet: `${emp.firstName} ${emp.lastName}`.trim(),
          poste: emp.poste || '',
          departement: emp.departement?.name || '',
          dateEmbauche: emp.hireDate || '',
          rib: emp.rib || '',
          cnss: emp.numero_cnss || '',
          joursTravailles: 22,
          joursConges: 2,
          joursAbsences: 0,
          joursRecuperationPayes: 0,
          heuresTravaillees,
          salaireBase,
          tauxHoraire,
          elementsVariables: [],
          cotisations: [],
          autresElements: [],
          salaireBrut: salaireBase,
          totalCotisations: 0,
          salaireBrutImposable: salaireBase,
          ir: 0,
          salaireNet: salaireBase,
          statut: 'en_cours',
          cumulAnnuel: {},
          dateCreation: new Date().toISOString(),
          dateModification: new Date().toISOString()
        };
        montantTotal += salaireBase;
        return bulletin;
      });
      // Ajouter les bulletins à la base
      bulletins.forEach((b) => db.get('bulletinPaie').push(b).write());
      // Mettre à jour la période avec le nombre d'employés et le montant total
      db.get('periodePaie')
        .find({ id: newId })
        .assign({ nombreEmployes: bulletins.length, montantTotal })
        .write();
      res.json({
        status: 'success',
        message: 'Création réussie',
        data: { periode, bulletinsCount: bulletins.length }
      });
    } catch (err) {
      res.status(500).json({ status: 'error', message: 'Erreur serveur' });
    }
  });
};
