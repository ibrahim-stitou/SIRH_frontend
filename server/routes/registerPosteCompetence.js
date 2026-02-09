module.exports = function registerPosteCompetenceRoutes(server, db) {
  /**
   * =========================
   * GET - Compétences d’un poste
   * =========================
   * /settings/poste-competences?poste_id=103
   */


  server.get('/settings/poste-competences', (req, res) => {
  const { poste_id } = req.query;

  if (!poste_id) {
    return res.status(400).json({
      status: 'error',
      message: 'poste_id requis',
      data: null
    });
  }

  const relations = db
    .get('PosteCompetences')
    .value()
    ?.filter(r => String(r.poste_id) === String(poste_id)) || [];

  const competences = db.get('Competences').value() || [];
  const competenceNiveaux = db.get('CompetenceNiveaux').value() || [];

  const data = relations.map(r => {
    const competence = competences.find(
      c => String(c.id) === String(r.competence_id)
    );

    const niveau = competenceNiveaux.find(
      n =>
        String(n.competenceId) === String(r.competence_id) &&
        Number(n.niveau) === Number(r.niveau_requis)
    );

    return {
      competence,
      niveau: niveau || null,
      importance: r.importance
    };
  });

  return res.json({
    status: 'success',
    message: 'Compétences du poste récupérées',
    data
  });
});


  /**
   * =========================
   * POST - Associer compétence à poste
   * =========================
   */
  server.post('/settings/poste-competences', (req, res) => {
  const {
    poste_id,
    competence_id,
    niveau_requis,
    importance
  } = req.body || {};

  // 1️⃣ Validation champs obligatoires
  if (
    poste_id == null ||
    competence_id == null ||
    niveau_requis == null ||
    importance == null
  ) {
    return res.status(400).json({
      status: 'error',
      message: 'poste_id, competence_id, niveau_requis et importance sont requis',
      data: null
    });
  }

  // 2️⃣ Validation valeurs
  if (
    typeof niveau_requis !== 'number' ||
    typeof importance !== 'number'
  ) {
    return res.status(400).json({
      status: 'error',
      message: 'niveau_requis et importance doivent être des nombres',
      data: null
    });
  }

  if (niveau_requis < 1 || niveau_requis > 5) {
    return res.status(400).json({
      status: 'error',
      message: 'niveau_requis invalide (1 à 5)',
      data: null
    });
  }

  if (importance < 1 || importance > 5) {
    return res.status(400).json({
      status: 'error',
      message: 'importance invalide (1 à 5)',
      data: null
    });
  }

  // 3️⃣ Vérifier poste
  const posteExists = db
    .get('settingsPostes')
    .value()
    ?.some(p => String(p.id) === String(poste_id));

  if (!posteExists) {
    return res.status(400).json({
      status: 'error',
      message: 'Poste inconnu',
      data: null
    });
  }

  // 4️⃣ Vérifier compétence
  const competenceExists = db
    .get('Competences')
    .value()
    ?.some(c => String(c.id) === String(competence_id));

  if (!competenceExists) {
    return res.status(400).json({
      status: 'error',
      message: 'Compétence inconnue',
      data: null
    });
  }

  // 5️⃣ Éviter doublon
  const alreadyExists = db
    .get('PosteCompetences')
    .value()
    ?.some(
      r =>
        String(r.poste_id) === String(poste_id) &&
        String(r.competence_id) === String(competence_id)
    );

  if (alreadyExists) {
    return res.status(409).json({
      status: 'error',
      message: 'Compétence déjà associée à ce poste',
      data: null
    });
  }

  // 6️⃣ Création
  const row = {
    id: Date.now(),
    poste_id,
    competence_id,
    niveau_requis,
    importance
  };

  db.get('PosteCompetences').push(row).write();

  return res.status(201).json({
    status: 'success',
    message: 'Association créée',
    data: row
  });
});

  /**
   * =========================
   * PUT - Modifier niveau / importance
   * =========================
   */
  // server.put('/settings/poste-competences/:id', (req, res) => {
  //   const id = Number(req.params.id);

  //   const exists = db
  //     .get('PosteCompetences')
  //     .find({ id })
  //     .value();

  //   if (!exists) {
  //     return res.status(404).json({
  //       status: 'error',
  //       message: 'Association introuvable',
  //       data: null
  //     });
  //   }

  //   const updated = {
  //     ...exists,
  //     ...req.body,
  //     id
  //   };

  //   db.get('PosteCompetences')
  //     .find({ id })
  //     .assign(updated)
  //     .write();

  //   return res.json({
  //     status: 'success',
  //     message: 'Association mise à jour',
  //     data: updated
  //   });
  // });

  /**
   * =========================
   * DELETE - Supprimer association
   * =========================
   */
// =========================
// DELETE - par poste_id + competence_id
// =========================
server.delete('/settings/poste-competences', (req, res) => {
  const { poste_id, competence_id } = req.body || {};

  if (!poste_id || !competence_id) {
    return res.status(400).json({
      status: 'error',
      message: 'poste_id et competence_id requis',
      data: null
    });
  }

  const exists = db
    .get('PosteCompetences')
    .value()
    ?.find(
      r =>
        String(r.poste_id) === String(poste_id) &&
        String(r.competence_id) === String(competence_id)
    );

  if (!exists) {
    return res.status(404).json({
      status: 'error',
      message: 'Association introuvable',
      data: null
    });
  }

  db.get('PosteCompetences')
    .remove({
      poste_id: exists.poste_id,
      competence_id: exists.competence_id
    })
    .write();

  return res.json({
    status: 'success',
    message: 'Association supprimée',
    data: {
      poste_id,
      competence_id
    }
  });
});
server.post('/settings/poste-competences/quick-add', (req, res) => {
  const {
    poste_id,
    libelle,
    categorie,
    description,
    niveaux = [],
    niveau_id,
    importance = 1
  } = req.body || {};

  if (!poste_id || !libelle || !niveau_id) {
    return res.status(400).json({
      status: 'error',
      message: 'poste_id, libelle et niveau_id requis'
    });
  }

  // 1️⃣ Vérifier compétence existante
  let competence = db
    .get('Competences')
    .value()
    .find(c => c.libelle.toLowerCase() === libelle.toLowerCase());

  let isNewCompetence = false;

  // 2️⃣ Créer compétence si inexistante
  if (!competence) {
    isNewCompetence = true;

    competence = {
      id: Date.now(),
      libelle,
      categorie: categorie || 'Autre',
      description: description || ''
    };

    db.get('Competences').push(competence).write();
  }

  // 3️⃣ Créer niveaux SI nouvelle compétence
  if (isNewCompetence && niveaux.length > 0) {
    niveaux.forEach(n => {
      db.get('CompetenceNiveaux')
        .push({
          id: Date.now() + Math.random(),
          competenceId: competence.id,
          niveau: n.niveau,
          libelle: n.libelle,
          description: n.description
        })
        .write();
    });
  }

  // 4️⃣ Vérifier que le niveau existe pour cette compétence
  const niveau = db
    .get('CompetenceNiveaux')
    .value()
    .find(
      n =>
        String(n.id) === String(niveau_id) &&
        String(n.competenceId) === String(competence.id)
    );

  if (!niveau) {
    return res.status(400).json({
      status: 'error',
      message: 'Niveau invalide pour cette compétence'
    });
  }

  // 5️⃣ Vérifier association poste/compétence
  const exists = db
    .get('PosteCompetences')
    .value()
    .find(
      pc =>
        String(pc.poste_id) === String(poste_id) &&
        String(pc.competence_id) === String(competence.id)
    );

  if (exists) {
    return res.status(409).json({
      status: 'error',
      message: 'Cette compétence est déjà associée à ce poste'
    });
  }

  // 6️⃣ Créer association poste/compétence avec niveau choisi
  const posteCompetence = {
    id: Date.now(),
    poste_id,
    competence_id: competence.id,
    niveau_requis: niveau.niveau,
    niveau_id: niveau.id,
    importance
  };

  db.get('PosteCompetences').push(posteCompetence).write();

  return res.json({
    status: 'success',
    message: 'Compétence ajoutée au poste',
    data: {
      poste_id,
      competence,
      niveau_requis: niveau.niveau,
      niveau,
      importance
    }
  });
});



server.put(
  "/settings/postes-competences/:posteId/competences/:competenceId",
  (req, res) => {
    const posteId = Number(req.params.posteId);
    const competenceId = Number(req.params.competenceId);

    // ✅ accepter les deux noms
    const niveau_requis =
      req.body.niveau_requis ?? req.body.niveau;

    const { importance } = req.body;

    const collection = db.get("PosteCompetences");

    const row = collection
      .find({ poste_id: posteId, competence_id: competenceId })
      .value();

    if (!row) {
      return res.status(404).json({
        message: "Compétence introuvable pour ce poste"
      });
    }

    const payload = {};

    if (niveau_requis !== undefined) {
      payload.niveau_requis = Number(niveau_requis);
    }

    if (importance !== undefined) {
      payload.importance = Number(importance);
    }

    const updated = collection
      .find({ id: row.id })
      .assign(payload)
      .write();

    // ✅ retour sans poste_id
    const { poste_id, ...cleanRow } = updated;

    return res.json(cleanRow);
  }
);


};




