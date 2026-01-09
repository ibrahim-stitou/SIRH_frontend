module.exports = function (server, db) {
  const wrap = (data, message = 'Succès') => ({
    status: 'success',
    message,
    data
  });

  // GET /accidents-travail - Liste avec filtres
  server.get('/accidents-travail', (req, res) => {
    let accidents = db.get('accidentsTravail').value() || [];
    const {
      employeeId,
      typeAccident,
      statut,
      from,
      to,
      gravite,
      arretTravail
    } = req.query;

    // Filtrage
    if (employeeId) {
      accidents = accidents.filter(a => String(a.employeId) === String(employeeId));
    }
    if (typeAccident) {
      accidents = accidents.filter(a => a.typeAccident === typeAccident);
    }
    if (statut) {
      accidents = accidents.filter(a => a.statut === statut);
    }
    if (gravite) {
      accidents = accidents.filter(a => a.gravite === gravite);
    }
    if (arretTravail) {
      const hasArret = arretTravail === 'true';
      accidents = accidents.filter(a => a.arretTravail.existe === hasArret);
    }
    if (from) {
      accidents = accidents.filter(a => new Date(a.dateHeureAccident) >= new Date(from));
    }
    if (to) {
      accidents = accidents.filter(a => new Date(a.dateHeureAccident) <= new Date(to));
    }

    // Tri par date décroissante
    accidents.sort((a, b) => new Date(b.dateHeureAccident) - new Date(a.dateHeureAccident));

    res.json(wrap(accidents, 'Liste des accidents du travail'));
  });

  // GET /accidents-travail/statistiques - Statistiques (AVANT :id pour éviter le conflit)
  server.get('/accidents-travail/statistiques', (req, res) => {
    const accidents = db.get('accidentsTravail').value() || [];
    const { annee } = req.query;

    let filteredAccidents = accidents;
    if (annee) {
      filteredAccidents = accidents.filter(a =>
        new Date(a.dateHeureAccident).getFullYear() === parseInt(annee)
      );
    }

    const stats = {
      nombreTotal: filteredAccidents.length,
      avecArret: filteredAccidents.filter(a => a.arretTravail.existe).length,
      sansArret: filteredAccidents.filter(a => !a.arretTravail.existe).length,
      joursPerdus: filteredAccidents.reduce((sum, a) =>
        sum + (a.arretTravail.dureePrevisionnelle || 0), 0
      ),
      parType: {
        surSite: filteredAccidents.filter(a => a.typeAccident === 'Sur site').length,
        trajet: filteredAccidents.filter(a => a.typeAccident === 'Trajet').length
      },
      parGravite: {
        leger: filteredAccidents.filter(a => a.gravite === 'Léger').length,
        moyen: filteredAccidents.filter(a => a.gravite === 'Moyen').length,
        grave: filteredAccidents.filter(a => a.gravite === 'Grave').length
      },
      parStatut: {
        brouillon: filteredAccidents.filter(a => a.statut === 'Brouillon').length,
        declare: filteredAccidents.filter(a => a.statut === 'Déclaré').length,
        transmisCNSS: filteredAccidents.filter(a => a.statut === 'Transmis CNSS').length,
        enInstruction: filteredAccidents.filter(a => a.statut === 'En instruction').length,
        accepte: filteredAccidents.filter(a => a.statut === 'Accepté').length,
        refuse: filteredAccidents.filter(a => a.statut === 'Refusé').length,
        clos: filteredAccidents.filter(a => a.statut === 'Clos').length
      },
      delaisRespect: {
        respect: filteredAccidents.filter(a => a.delaiDeclarationRespect).length,
        horsDelai: filteredAccidents.filter(a => !a.delaiDeclarationRespect).length
      },
      montantIndemnites: filteredAccidents.reduce((sum, a) =>
        sum + (a.suiviCNSS?.montantIndemnite || 0), 0
      )
    };

    res.json(wrap(stats, 'Statistiques des accidents du travail'));
  });

  // GET /accidents-travail/:id - Détail
  server.get('/accidents-travail/:id', (req, res) => {
    const accident = db.get('accidentsTravail').find({ id: parseInt(req.params.id) }).value();
    if (!accident) {
      return res.status(404).json({
        status: 'error',
        message: 'Accident non trouvé',
        data: null
      });
    }
    res.json(wrap(accident, 'Détail de l\'accident'));
  });

  // POST /accidents-travail - Création
  server.post('/accidents-travail', (req, res) => {
    const accidents = db.get('accidentsTravail').value() || [];
    const newId = accidents.length > 0 ? Math.max(...accidents.map(a => a.id)) + 1 : 1;

    const now = new Date().toISOString();
    const heuresDepuisAccident = req.body.dateHeureAccident
      ? Math.abs(new Date() - new Date(req.body.dateHeureAccident)) / 36e5
      : 0;

    const delaiDeclarationRespect = heuresDepuisAccident <= 48;

    const newAccident = {
      id: newId,
      ...req.body,
      statut: req.body.statut || 'Brouillon',
      dateDeclaration: now,
      declarePar: req.body.declarePar || 'RH Manager',
      delaiDeclarationRespect,
      heuresDepuisAccident: parseFloat(heuresDepuisAccident.toFixed(2)),
      suiviCNSS: req.body.suiviCNSS || {
        dateEnvoi: null,
        numeroRecepisse: null,
        decision: null,
        tauxIPP: null,
        dateDecision: null,
        montantIndemnite: null
      },
      suiviMedical: req.body.suiviMedical || [],
      impactPaie: req.body.impactPaie || {
        indemnitesJournalieres: 0,
        joursIndemnises: 0,
        priseEnCharge: null,
        impactBulletin: false,
        montantDeduction: 0
      },
      piecesJointes: req.body.piecesJointes || [],
      historique: [
        {
          date: now,
          action: 'Création dossier',
          utilisateur: req.body.declarePar || 'RH Manager',
          details: 'Dossier AT créé'
        }
      ],
      relancesCNSS: [],
      dateCreation: now,
      dateModification: now,
      archivageObligatoire: true,
      dureeArchivage: 40
    };

    db.get('accidentsTravail').push(newAccident).write();
    res.status(201).json(wrap(newAccident, 'Accident créé avec succès'));
  });

  // PUT /accidents-travail/:id - Mise à jour
  server.put('/accidents-travail/:id', (req, res) => {
    const accident = db.get('accidentsTravail').find({ id: parseInt(req.params.id) }).value();
    if (!accident) {
      return res.status(404).json({
        status: 'error',
        message: 'Accident non trouvé',
        data: null
      });
    }

    const updated = {
      ...accident,
      ...req.body,
      id: accident.id,
      dateCreation: accident.dateCreation,
      dateModification: new Date().toISOString(),
      historique: [
        ...(accident.historique || []),
        {
          date: new Date().toISOString(),
          action: 'Modification',
          utilisateur: req.body.modifiePar || 'RH Manager',
          details: 'Dossier modifié'
        }
      ]
    };

    db.get('accidentsTravail').find({ id: parseInt(req.params.id) }).assign(updated).write();
    res.json(wrap(updated, 'Accident mis à jour'));
  });

  // PATCH /accidents-travail/:id/declarer-cnss - Déclarer à la CNSS
  server.patch('/accidents-travail/:id/declarer-cnss', (req, res) => {
    const accident = db.get('accidentsTravail').find({ id: parseInt(req.params.id) }).value();
    if (!accident) {
      return res.status(404).json({
        status: 'error',
        message: 'Accident non trouvé',
        data: null
      });
    }

    const now = new Date().toISOString();
    const numeroRecepisse = `CNSS-AT-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 999999)).padStart(6, '0')}`;

    const updated = {
      ...accident,
      statut: 'Transmis CNSS',
      suiviCNSS: {
        ...accident.suiviCNSS,
        dateEnvoi: now,
        numeroRecepisse,
        decision: 'En cours'
      },
      dateModification: now,
      historique: [
        ...(accident.historique || []),
        {
          date: now,
          action: 'Envoi CNSS',
          utilisateur: req.body.utilisateur || 'RH Manager',
          details: `Dossier transmis à la CNSS - Récépissé: ${numeroRecepisse}`
        }
      ]
    };

    db.get('accidentsTravail').find({ id: parseInt(req.params.id) }).assign(updated).write();
    res.json(wrap(updated, 'Dossier transmis à la CNSS'));
  });

  // PATCH /accidents-travail/:id/decision-cnss - Décision CNSS
  server.patch('/accidents-travail/:id/decision-cnss', (req, res) => {
    const accident = db.get('accidentsTravail').find({ id: parseInt(req.params.id) }).value();
    if (!accident) {
      return res.status(404).json({
        status: 'error',
        message: 'Accident non trouvé',
        data: null
      });
    }

    const { decision, tauxIPP, montantIndemnite } = req.body;
    const now = new Date().toISOString();

    const updated = {
      ...accident,
      statut: decision === 'Accepté' ? 'Accepté' : 'Refusé',
      suiviCNSS: {
        ...accident.suiviCNSS,
        decision,
        tauxIPP: tauxIPP || null,
        montantIndemnite: montantIndemnite || null,
        dateDecision: now
      },
      dateModification: now,
      historique: [
        ...(accident.historique || []),
        {
          date: now,
          action: 'Décision CNSS',
          utilisateur: 'Système',
          details: `AT ${decision.toLowerCase()}${tauxIPP ? ' - IPP ' + tauxIPP + '%' : ''}`
        }
      ]
    };

    db.get('accidentsTravail').find({ id: parseInt(req.params.id) }).assign(updated).write();
    res.json(wrap(updated, 'Décision CNSS enregistrée'));
  });

  // PATCH /accidents-travail/:id/cloturer - Clôturer
  server.patch('/accidents-travail/:id/cloturer', (req, res) => {
    const accident = db.get('accidentsTravail').find({ id: parseInt(req.params.id) }).value();
    if (!accident) {
      return res.status(404).json({
        status: 'error',
        message: 'Accident non trouvé',
        data: null
      });
    }

    const now = new Date().toISOString();
    const updated = {
      ...accident,
      statut: 'Clos',
      dateCloture: now,
      dateModification: now,
      historique: [
        ...(accident.historique || []),
        {
          date: now,
          action: 'Clôture',
          utilisateur: req.body.utilisateur || 'RH Manager',
          details: 'Dossier clôturé'
        }
      ]
    };

    db.get('accidentsTravail').find({ id: parseInt(req.params.id) }).assign(updated).write();
    res.json(wrap(updated, 'Accident clôturé'));
  });

  // DELETE /accidents-travail/:id - Suppression
  server.delete('/accidents-travail/:id', (req, res) => {
    const accident = db.get('accidentsTravail').find({ id: parseInt(req.params.id) }).value();
    if (!accident) {
      return res.status(404).json({
        status: 'error',
        message: 'Accident non trouvé',
        data: null
      });
    }

    db.get('accidentsTravail').remove({ id: parseInt(req.params.id) }).write();
    res.json(wrap(null, 'Accident supprimé'));
  });

  // GET /accidents-travail/statistiques - Statistiques
  server.get('/accidents-travail/statistiques', (req, res) => {
    const accidents = db.get('accidentsTravail').value() || [];
    const { annee } = req.query;

    let filteredAccidents = accidents;
    if (annee) {
      filteredAccidents = accidents.filter(a =>
        new Date(a.dateHeureAccident).getFullYear() === parseInt(annee)
      );
    }

    const stats = {
      nombreTotal: filteredAccidents.length,
      avecArret: filteredAccidents.filter(a => a.arretTravail.existe).length,
      sansArret: filteredAccidents.filter(a => !a.arretTravail.existe).length,
      joursPerdus: filteredAccidents.reduce((sum, a) =>
        sum + (a.arretTravail.dureePrevisionnelle || 0), 0
      ),
      parType: {
        surSite: filteredAccidents.filter(a => a.typeAccident === 'Sur site').length,
        trajet: filteredAccidents.filter(a => a.typeAccident === 'Trajet').length
      },
      parGravite: {
        leger: filteredAccidents.filter(a => a.gravite === 'Léger').length,
        moyen: filteredAccidents.filter(a => a.gravite === 'Moyen').length,
        grave: filteredAccidents.filter(a => a.gravite === 'Grave').length
      },
      parStatut: {
        brouillon: filteredAccidents.filter(a => a.statut === 'Brouillon').length,
        declare: filteredAccidents.filter(a => a.statut === 'Déclaré').length,
        transmisCNSS: filteredAccidents.filter(a => a.statut === 'Transmis CNSS').length,
        enInstruction: filteredAccidents.filter(a => a.statut === 'En instruction').length,
        accepte: filteredAccidents.filter(a => a.statut === 'Accepté').length,
        refuse: filteredAccidents.filter(a => a.statut === 'Refusé').length,
        clos: filteredAccidents.filter(a => a.statut === 'Clos').length
      },
      delaisRespect: {
        respect: filteredAccidents.filter(a => a.delaiDeclarationRespect).length,
        horsDelai: filteredAccidents.filter(a => !a.delaiDeclarationRespect).length
      },
      montantIndemnites: filteredAccidents.reduce((sum, a) =>
        sum + (a.suiviCNSS?.montantIndemnite || 0), 0
      )
    };

    res.json(wrap(stats, 'Statistiques des accidents du travail'));
  });
};

