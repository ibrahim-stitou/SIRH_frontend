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
        return String(fieldVal).toLowerCase().includes(String(value).toLowerCase());
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
      const bulletins = db
        .get('bulletinPaie')
        .filter({ periodePaieId: periode.id })
        .value() || [];

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
      const nombreEmployes = typeof periode.nombreEmployes === 'number'
        ? periode.nombreEmployes
        : employees.length;
      const montantTotal = typeof periode.montantTotal === 'number'
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
      return res.status(404).json({ status: 'error', message: 'Période de paie non trouvée' });
    }

    return res.json({ status: 'success', data: periode });
  });

  // GET /paies/:id/bulletins - Obtenir tous les bulletins d'une période (format DataTable)
  server.get('/paies/:id/bulletins', (req, res) => {
    const start = parseInt(req.query.start || '0', 10);
    const length = parseInt(req.query.length || '10', 10);
    const sortBy = req.query.sortBy || 'numeroEmploye';
    const sortDir = req.query.sortDir === 'desc' ? 'desc' : 'asc';

    let all = db.get('bulletinPaie').filter({ periodePaieId: req.params.id }).value() || [];

    // Filtrage
    const excludedKeys = new Set(['start', 'length', 'sortBy', 'sortDir']);
    Object.entries(req.query).forEach(([key, value]) => {
      if (excludedKeys.has(key) || value === undefined || value === '') return;
      all = all.filter((bulletin) => {
        const fieldVal = bulletin[key];
        if (fieldVal === undefined || fieldVal === null) return false;
        return String(fieldVal).toLowerCase().includes(String(value).toLowerCase());
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
    const recordsTotal = db.get('bulletinPaie').filter({ periodePaieId: req.params.id }).value()?.length || 0;
    const employeesById = Object.fromEntries(
      (db.get('hrEmployees').value() || []).map((e) => [String(e.id), e])
    );

    const enriched = data.map((bulletin) => ({
      ...bulletin,
      employe: employeesById[String(bulletin.employeId)]
    }))
    return res.json({
      status: 'success',
      message: "Liste des bulletins de paie récupérée avec succès",
      data,
      recordsTotal,
      recordsFiltered
    });
  });

  // GET /paies/:periodeId/bulletins/:employeId - Obtenir le bulletin d'un employé pour une période
  server.get('/paies/:periodeId/bulletins/:employeId', (req, res) => {
    const bulletin = db
      .get('bulletinPaie')
      .find({ periodePaieId: req.params.periodeId, employeId: req.params.employeId })
      .value();

    if (!bulletin) {
      return res.status(404).json({ status: 'error', message: 'Bulletin de paie non trouvé' });
    }

    return res.json({ status: 'success', data: bulletin });
  });

  // PUT /paies/:periodeId/bulletins/:employeId - Mettre à jour un bulletin de paie
  server.put('/paies/:periodeId/bulletins/:employeId', (req, res) => {
    const bulletin = db
      .get('bulletinPaie')
      .find({ periodePaieId: req.params.periodeId, employeId: req.params.employeId })
      .value();

    if (!bulletin) {
      return res.status(404).json({ status: 'error', message: 'Bulletin de paie non trouvé' });
    }

    const updatedBulletin = {
      ...bulletin,
      ...req.body,
      dateModification: new Date().toISOString()
    };

    db.get('bulletinPaie')
      .find({ periodePaieId: req.params.periodeId, employeId: req.params.employeId })
      .assign(updatedBulletin)
      .write();

    return res.json({ status: 'success', data: updatedBulletin });
  });

  // GET /paies/rubriques - Obtenir toutes les rubriques de paie
  server.get('/paies/rubriques/all', (req, res) => {
    const rubriques = db.get('rubriquePaie').value() || [];
    return res.json({ status: 'success', data: rubriques });
  });

  // GET /paies/rubriques/:type - Obtenir les rubriques par type
  server.get('/paies/rubriques/type/:type', (req, res) => {
    const rubriques = db.get('rubriquePaie').filter({ type: req.params.type }).value() || [];
    return res.json({ status: 'success', data: rubriques });
  });

  // POST /paies/:periodeId/bulletins/:employeId/elements - Ajouter un élément variable
  server.post('/paies/:periodeId/bulletins/:employeId/elements', (req, res) => {
    const bulletin = db
      .get('bulletinPaie')
      .find({ periodePaieId: req.params.periodeId, employeId: req.params.employeId })
      .value();

    if (!bulletin) {
      return res.status(404).json({ status: 'error', message: 'Bulletin de paie non trouvé' });
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
      .find({ periodePaieId: req.params.periodeId, employeId: req.params.employeId })
      .assign(bulletin)
      .write();

    return res.json({ status: 'success', data: bulletin });
  });

  // DELETE /paies/:periodeId/bulletins/:employeId/elements/:rubriqueId - Supprimer un élément variable
  server.delete('/paies/:periodeId/bulletins/:employeId/elements/:rubriqueId', (req, res) => {
    const bulletin = db
      .get('bulletinPaie')
      .find({ periodePaieId: req.params.periodeId, employeId: req.params.employeId })
      .value();

    if (!bulletin) {
      return res.status(404).json({ status: 'error', message: 'Bulletin de paie non trouvé' });
    }

    const rubriqueId = req.params.rubriqueId;

    // Supprimer de toutes les catégories possibles
    bulletin.elementsVariables = bulletin.elementsVariables?.filter((e) => e.rubriquePaieId !== rubriqueId) || [];
    bulletin.cotisations = bulletin.cotisations?.filter((c) => c.rubriquePaieId !== rubriqueId) || [];
    bulletin.autresElements = bulletin.autresElements?.filter((a) => a.rubriquePaieId !== rubriqueId) || [];

    bulletin.dateModification = new Date().toISOString();

    db.get('bulletinPaie')
      .find({ periodePaieId: req.params.periodeId, employeId: req.params.employeId })
      .assign(bulletin)
      .write();

    return res.json({ status: 'success', data: bulletin });
  });

  // GET /paies/:id/virements - Obtenir les virements d'une période
  server.get('/paies/:id/virements', (req, res) => {
    const bulletins = db.get('bulletinPaie').filter({ periodePaieId: req.params.id }).value() || [];

    const virements = bulletins.map((b) => ({
      id: b.id,
      employeId: b.employeId,
      numeroEmploye: b.numeroEmploye,
      nomComplet: b.nomComplet,
      rib: b.rib,
      montant: b.salaireNet,
      statut: b.statut || 'en_attente'
    }));

    return res.json({ status: 'success', message: 'Virements récupérés avec succès', data: virements });
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
};
