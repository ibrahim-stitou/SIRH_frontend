

module.exports = (server, db) => {
server.get('/offres/getAll', (req, res) => {
  const offres = db.get('offres').value() || [];
  const responsables = db.get('responsables').value() || [];
  const missions = db.get('Missions').value() || [];
  const profils = db.get('ProfilRecherche').value() || [];
  const candidatures = db.get('candidatures').value() || [];
  const stats = db.get('OffreStatistiques').value() || [];
  const postes = db.get('settingsPostes').value() || [];
  const offreCompetences = db.get('OffreCompetences').value() || [];
  const competences = db.get('Competences').value() || [];

  const result = offres.map(offre => {

    // 🔹 Compétences liées à l’offre
    const competencesRequises = offreCompetences
      .filter(oc => oc.offreId === offre.id)
      .map(oc => {
        const competence = competences.find(c => c.id === oc.competenceId);
        if (!competence) return null;

        return {
          id: competence.id,
          libelle: competence.libelle,
          categorie: competence.categorie,
          niveauRequis: oc.niveauRequis,
          importance: oc.importance
        };
      })
      .filter(Boolean);

    return {
      ...offre,

      poste: postes.find(p => p.id === offre.posteId) || null,

      responsable: responsables.find(r => r.id === offre.responsableId) || null,

      Missions: missions.filter(m => m.offreId === offre.id),

      ProfilRecherche: profils.filter(p => p.offreId === offre.id),

      candidatures: candidatures.filter(c => c.offreId === offre.id),

      OffreStatistiques: stats.find(s => s.offreId === offre.id) || null,

      competencesRequises
    };
  });

  res.json(result);
});


server.post('/offres/create', (req, res) => {
  try {
    const {
      offre,
      missions,
      profilRecherche,
      competenceIds,
      canalIds
    } = req.body;

    const offres = db.get('offres').value() || [];

    // Générer ID
    const newId = offres.length > 0
      ? Math.max(...offres.map(o => o.id)) + 1
      : 1;

    // 🔥 Génération automatique du lien
    const BASE_URL = "http://localhost:3000"; // change en prod
    const lienCandidature = `${BASE_URL}/candidature/${newId}`;

    const newOffre = {
      id: newId,
      ...offre,
      statut: offre.statut || "BROUILLON",
      lienCandidature, // 👈 ajouté automatiquement
      createdAt: new Date().toISOString()
    };

    // 1️⃣ Sauvegarde offre
    db.get('offres').push(newOffre).write();

    // 2️⃣ Missions
    if (missions?.length) {
      missions.forEach((libelle, index) => {
        db.get('Missions').push({
          id: Date.now() + index,
          offreId: newId,
          libelle
        }).write();
      });
    }

    // 3️⃣ Profil recherché
    if (profilRecherche?.formation) {
      db.get('ProfilRecherche').push({
        id: Date.now() + 100,
        offreId: newId,
        type: "FORMATION",
        contenu: profilRecherche.formation
      }).write();
    }

    if (profilRecherche?.experience) {
      db.get('ProfilRecherche').push({
        id: Date.now() + 200,
        offreId: newId,
        type: "EXPERIENCE",
        contenu: profilRecherche.experience
      }).write();
    }

    // 4️⃣ Compétences
    if (competenceIds?.length) {
      competenceIds.forEach((competenceId, index) => {
        db.get('OffreCompetences').push({
          id: Date.now() + index,
          offreId: newId,
          competenceId
        }).write();
      });
    }

    // 5️⃣ Diffusion
    if (canalIds?.length) {
      canalIds.forEach((canalId, index) => {
        db.get('OffreDiffusions').push({
          id: Date.now() + index,
          offreId: newId,
          canalId,
          dateDiffusion: new Date().toISOString(),
          statut: "DIFFUSEE"
        }).write();
      });
    }

    // 6️⃣ Initialiser statistiques
    db.get('OffreStatistiques').push({
      id: Date.now(),
      offreId: newId,
      nombreVues: 0,
      nombreCandidatures: 0
    }).write();

    res.status(201).json({
      message: "Offre créée avec succès",
      offre: newOffre
    });

  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la création",
      error: error.message
    });
  }
});



server.get('/offres/:id/detail', (req, res) => {
  const id = parseInt(req.params.id);

  const offres = db.get('offres').value() || [];
  const responsables = db.get('responsables').value() || [];
  const missions = db.get('Missions').value() || [];
  const profils = db.get('ProfilRecherche').value() || [];
  const stats = db.get('OffreStatistiques').value() || [];
  const diffusions = db.get('OffreDiffusions').value() || [];
  const offreCompetences = db.get('OffreCompetences').value() || [];
  const competences = db.get('Competences').value() || [];
  const postes = db.get('settingsPostes').value() || [];
  const canaux = db.get('CanauxDiffusion').value() || [];

  const offre = offres.find(o => o.id === id);

  if (!offre) {
    return res.status(404).json({ message: "Offre introuvable" });
  }

  const poste = postes.find(p => p.id === offre.posteId);
  const responsable = responsables.find(r => r.id === offre.responsableId);

  // Missions
  const missionsPrincipales = missions
    .filter(m => m.offreId === id)
    .map(m => m.libelle);

  // ✅ COMPÉTENCES AVEC OBJET COMPLET
  const competencesRequises = offreCompetences
    .filter(oc => oc.offreId === id)
    .map(oc => {
      const competence = competences.find(c => c.id === oc.competenceId);
      if (!competence) return null;

      return {
        id: competence.id,
        libelle: competence.libelle,
        categorie: competence.categorie,
        niveauRequis: oc.niveauRequis,
        importance: oc.importance
      };
    })
    .filter(Boolean);

  // Profil recherché
  const profilData = profils.filter(p => p.offreId === id);

  const formation = profilData.find(p => p.type === "FORMATION")?.contenu || null;
  const experience = profilData.find(p => p.type === "EXPERIENCE")?.contenu || null;

  // Statistiques
  const statistique = stats.find(s => s.offreId === id);

  // ✅ DIFFUSION PROPRE (objet canal)
  const diffusion = diffusions
    .filter(d => d.offreId === id)
    .map(d => {
      const canal = canaux.find(c => c.id === d.canalId);
      if (!canal) return null;

      return {
        id: canal.id,
        code: canal.code,
        libelle: canal.libelle,
        dateDiffusion: d.dateDiffusion,
        statut: d.statut
      };
    })
    .filter(Boolean);

  const response = {
    id: offre.id,
    reference: offre.reference,
    poste: poste || null,
    descriptionPoste: offre.description,
    missionsPrincipales,
    competencesRequises,
    lieuTravail: offre.lieuTravail,
    typeContrat: offre.typeContrat,
    statut: offre.statut,
    anonyme: offre.anonymisee,
    dateLimiteCandidature: offre.dateLimiteCandidature,
    dateCreation: offre.createdAt,

    profilRecherche: {
      formation,
      experience
    },

    responsableRecrutement: {
      id: responsable?.id || null,
      nom: responsable?.nom || null,
      email: responsable?.email || null
    },

    statistiques: {
      vues: statistique?.nombreVues || 0,
      candidaturesRecues: statistique?.nombreCandidatures || 0
    },

    diffusion
  };

  res.json(response);
});



server.patch('/offres/:id/statut', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { statut } = req.body;

    const statutsAutorises = ["BROUILLON", "PUBLIQUE", "CLOTUREE"];

    if (!statut || !statutsAutorises.includes(statut)) {
      return res.status(400).json({
        message: "Statut invalide. Valeurs autorisées: BROUILLON, PUBLIQUE, CLOTUREE"
      });
    }

    const offre = db.get('offres').find({ id }).value();

    if (!offre) {
      return res.status(404).json({ message: "Offre introuvable" });
    }

    db.get('offres')
      .find({ id })
      .assign({ statut })
      .write();

    res.json({
      message: "Statut mis à jour avec succès",
      id,
      nouveauStatut: statut
    });

  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la mise à jour du statut",
      error: error.message
    });
  }
});


server.patch('/offres/:id', (req, res) => {

  const id = parseInt(req.params.id);

  // 🔥 IMPORTANT : déclarer les variables
  const {
    offre,
    missions,
    profilRecherche,
    competenceIds,
    canalIds
  } = req.body;

  const existingOffre = db.get('offres').find({ id: id }).value();

  if (!existingOffre) {
    return res.status(404).json({ message: "Offre non trouvée" });
  }

  // ===================================================
  // 1️⃣ UPDATE OFFRE (partiel)
  // ===================================================
  if (offre !== undefined) {
    db.get('offres')
      .find({ id: id })
      .assign({ ...offre })
      .write();
  }

  // ===================================================
  // 2️⃣ UPDATE MISSIONS (remplacement complet)
  // ===================================================
  if (missions !== undefined) {

    db.get('Missions')
      .remove({ offreId: id })
      .write();

    missions.forEach((mission, index) => {
      db.get('Missions')
        .push({
          id: Date.now() + index,
          offreId: id,
          libelle: mission   // ⚠️ ta base utilise libelle
        })
        .write();
    });
  }

  // ===================================================
  // 3️⃣ UPDATE PROFIL RECHERCHE (FORMATION / EXPERIENCE)
  // ===================================================
  if (profilRecherche !== undefined) {

    // 🔹 FORMATION
    if (profilRecherche.formation !== undefined) {

      const formationRow = db.get('ProfilRecherche')
        .find({ offreId: id, type: "FORMATION" })
        .value();

      if (formationRow) {
        db.get('ProfilRecherche')
          .find({ offreId: id, type: "FORMATION" })
          .assign({ contenu: profilRecherche.formation })
          .write();
      } else {
        db.get('ProfilRecherche')
          .push({
            id: Date.now(),
            offreId: id,
            type: "FORMATION",
            contenu: profilRecherche.formation
          })
          .write();
      }
    }

    // 🔹 EXPERIENCE
    if (profilRecherche.experience !== undefined) {

      const experienceRow = db.get('ProfilRecherche')
        .find({ offreId: id, type: "EXPERIENCE" })
        .value();

      if (experienceRow) {
        db.get('ProfilRecherche')
          .find({ offreId: id, type: "EXPERIENCE" })
          .assign({ contenu: profilRecherche.experience })
          .write();
      } else {
        db.get('ProfilRecherche')
          .push({
            id: Date.now(),
            offreId: id,
            type: "EXPERIENCE",
            contenu: profilRecherche.experience
          })
          .write();
      }
    }
  }

  // ===================================================
  // 4️⃣ UPDATE COMPETENCES (remplacement complet)
  // ===================================================
  if (competenceIds !== undefined) {

    db.get('OffreCompetences')
      .remove({ offreId: id })
      .write();

    competenceIds.forEach((compId) => {
      db.get('OffreCompetences')
        .push({
          offreId: id,
          competenceId: compId
        })
        .write();
    });
  }

  // ===================================================
  // 5️⃣ UPDATE CANAUX (remplacement complet via OffreDiffusions)
  // ===================================================
  if (canalIds !== undefined) {

    db.get('OffreDiffusions')
      .remove({ offreId: id })
      .write();

    canalIds.forEach((canalId, index) => {
      db.get('OffreDiffusions')
        .push({
          id: Date.now() + index,
          offreId: id,
          canalId: canalId,
          dateDiffusion: new Date().toISOString(),
          statut: "SUCCES"
        })
        .write();
    });
  }

  return res.status(200).json({
    message: "Offre mise à jour avec succès"
  });

});


//   // Route personnalisée pour les offres récentes
//   server.get('/offres/nouveau', (req, res) => {
//     const offres = db.get('offres').value() || [];
//     const recent = offres.slice(-1); // Dernière offre
//     res.json(recent);
//   });

//   // Route pour les offres actives
//   server.get('/offres/actives', (req, res) => {
//     const offres = db.get('offres').value() || [];
//     const actives = offres.filter(o => o.statut === 'publiee');
//     res.json(actives);
//   });

//   // Route pour les offres en brouillon
//   server.get('/offres/brouillons', (req, res) => {
//     const offres = db.get('offres').value() || [];
//     const brouillons = offres.filter(o => o.statut === 'brouillon');
//     res.json(brouillons);
//   });

//   // Route pour les offres clôturées
//   server.get('/offres/cloturees', (req, res) => {
//     const offres = db.get('offres').value() || [];
//     const cloturees = offres.filter(o => o.statut === 'cloturee');
//     res.json(cloturees);
//   });
// 
};
