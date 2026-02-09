module.exports = function registerCompetenceRoutes(server, db) {

  // =========================
  // LIST COMPETENCES
  // =========================
  server.get("/settings/competences", (req, res) => {
    return res.json({
   
      data: db.get("Competences").value()
    });
  });

  // =========================
  // AUTOCOMPLETE
  // =========================
  // server.get("/settings/competences/search", (req, res) => {
  //   const q = (req.query.q || "").toLowerCase();

  //   const result = db
  //     .get("settingsCompetences")
  //     .filter(c => c.libelle.toLowerCase().includes(q))
  //     .value();

  //   return res.json(result);
  // });

  // =========================
  // QUICK ADD
  // =========================
//   server.post('/settings/competences', (req, res) => {
//   const {
//     libelle,
//     categorie,
//     description,
//     niveaux = []
//   } = req.body || {};

//   if (!libelle) {
//     return res.status(400).json({
//       message: 'libelle requis'
//     });
//   }

//   // 1️⃣ Vérifier unicité du libelle
//   const existing = db
//     .get('Competences')
//     .value()
//     .find(
//       c => c.libelle.toLowerCase() === libelle.toLowerCase()
//     );

//   if (existing) {
//     return res.status(409).json({
//       message: 'Cette compétence existe déjà'
//     });
//   }

//   // 2️⃣ Créer compétence
//   const competence = {
//     id: Date.now(),
//     libelle,
//     categorie: categorie || 'Autre',
//     description: description || ''
//   };

//   db.get('Competences')
//     .push(competence)
//     .write();

//   // 3️⃣ Créer niveaux
//   const niveauxCreated = [];

//   niveaux.forEach(n => {
//     const niveau = {
//       id: Date.now() + Math.random(),
//       competenceId: competence.id,
//       niveau: n.niveau,
//       libelle: n.libelle,
//       description: n.description
//     };

//     niveauxCreated.push(niveau);

//     db.get('CompetenceNiveaux')
//       .push(niveau)
//       .write();
//   });

//   return res.status(201).json({
//     message: 'Compétence créée avec succès',
//     data: {
//       competence,
//       niveaux: niveauxCreated
//     }
//   });
// });


//   server.get('/settings/competence-niveaux', (req, res) => {
//   const niveaux = db
//     .get('CompetenceNiveaux')
//     .sortBy('niveau')
//     .value();

//   res.status(200).json(niveaux);
// });


// =========================
// GET NIVEAUX D'UNE COMPÉTENCE
// =========================
server.get("/settings/competences/:competenceId/niveaux", (req, res) => {
  const competenceId = Number(req.params.competenceId);

  if (!competenceId) {
    return res.status(400).json({
      status: "error",
      message: "competenceId requis",
      data: null
    });
  }

  // Vérifier que la compétence existe
  const competenceExists = db
    .get("Competences")
    .find({ id: competenceId })
    .value();

  if (!competenceExists) {
    return res.status(404).json({
      status: "error",
      message: "Compétence introuvable",
      data: null
    });
  }

  // Récupérer les niveaux de cette compétence
  const niveaux = db
    .get("CompetenceNiveaux")
    .filter(n => Number(n.competenceId) === competenceId)
    .sortBy("niveau")
    .value()
    .map(n => ({
      id: n.id,
      niveau: n.niveau,
      libelle: n.libelle,
      description: n.description
    }));

  return res.status(200).json({
    status: "success",
    message: "Niveaux de la compétence récupérés",
    data: niveaux
  });
});




// =========================
// POST COMPETENCE (QUICK ADD)
// =========================
server.post("/settings/competences", (req, res) => {
  const {
    libelle,
    categorie,
    description,
    niveaux = []
  } = req.body || {};

  if (!libelle) {
    return res.status(400).json({
      message: "libelle requis"
    });
  }

  // 🔎 Vérifier unicité du libelle
  const existing = db
    .get("Competences")
    .find(c => c.libelle.toLowerCase() === libelle.toLowerCase())
    .value();

  if (existing) {
    return res.status(409).json({
      message: "Cette compétence existe déjà"
    });
  }

  // 🆕 Créer la compétence
  const competenceId = Date.now();
  const now = new Date().toISOString(); // ✅ date de création

  const competence = {
    id: competenceId,
    libelle,
    categorie: categorie || "Autre",
    description: description || "",
    createdAt: now // ✅ ajouté
  };

  db.get("Competences")
    .push(competence)
    .write();

  // 🧩 Créer les niveaux
  const niveauxCreated = [];

  niveaux.forEach(n => {
    const niveau = {
      id: Date.now() + Math.random(),
      competenceId,
      niveau: n.niveau,
      libelle: n.libelle,
      description: n.description,
      createdAt: now // (optionnel mais cohérent)
    };

    niveauxCreated.push(niveau);

    db.get("CompetenceNiveaux")
      .push(niveau)
      .write();
  });

  return res.status(201).json({
    message: "Compétence créée avec succès",
    data: {
      competence,
      niveaux: niveauxCreated
    }
  });
});


server.delete("/settings/competences/:id", (req, res) => {
  const competenceId = Number(req.params.id);

  // 1️⃣ Vérifier si la compétence existe
  const competence = db
    .get("Competences")
    .find({ id: competenceId })
    .value();

  if (!competence) {
    return res.status(404).json({ message: "Compétence non trouvée" });
  }

  // 2️⃣ Supprimer les associations PosteCompetences
  db.get("PosteCompetences")
    .remove({ competence_id: competenceId })
    .write();

  // 3️⃣ Supprimer la compétence
  db.get("Competences")
    .remove({ id: competenceId })
    .write();

  return res.status(200).json({
    message: "Compétence supprimée avec succès",
    competence
  });
});


server.put("/settings/competences/:id", (req, res) => {
  const competenceId = Number(req.params.id);
  const { libelle, categorie, description } = req.body || {};

  // 🔎 Vérifier existence
  const competence = db
    .get("Competences")
    .find({ id: competenceId })
    .value();

  if (!competence) {
    return res.status(404).json({
      message: "Compétence non trouvée"
    });
  }

  // 🔎 Vérifier unicité du libelle (sauf lui-même)
  if (libelle) {
    const existing = db
      .get("Competences")
      .find(
        c =>
          c.id !== competenceId &&
          c.libelle.toLowerCase() === libelle.toLowerCase()
      )
      .value();

    if (existing) {
      return res.status(409).json({
        message: "Une autre compétence avec ce libellé existe déjà"
      });
    }
  }

  // 🆕 Update
  const updatedCompetence = {
    ...competence,
    libelle: libelle ?? competence.libelle,
    categorie: categorie ?? competence.categorie,
    description: description ?? competence.description,
    updatedAt: new Date().toISOString()
  };

  db.get("Competences")
    .find({ id: competenceId })
    .assign(updatedCompetence)
    .write();

  return res.status(200).json({
    message: "Compétence mise à jour avec succès",
    data: updatedCompetence
  });
});

};
