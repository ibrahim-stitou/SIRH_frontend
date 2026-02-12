

module.exports = (server, db) => {

server.get('/offres/getAll', (req, res) => {
  const offres = db.get('offres').value() || [];
  const responsables = db.get('responsables').value() || [];
  const missions = db.get('Missions').value() || [];
  const profils = db.get('ProfilRecherche').value() || [];
  const candidatures = db.get('candidatures').value() || [];
  const stats = db.get('OffreStatistiques').value() || [];
  const postes = db.get('settingsPostes').value() || [];

  const result = offres.map(offre => ({
    ...offre,

    poste: postes.find(p => p.id === offre.posteId) || null,

    responsable: responsables.find(r => r.id === offre.responsableId) || null,

    Missions: missions.filter(m => m.offreId === offre.id),
    ProfilRecherche: profils.filter(p => p.offreId === offre.id),
    candidatures: candidatures.filter(c => c.offreId === offre.id),
    OffreStatistiques: stats.filter(s => s.offreId === offre.id)
  }));

  res.json(result);
});






server.get('/offres/:id/detail', (req, res) => {
  const id = parseInt(req.params.id);

  const offres = db.get('offres').value() || [];
  const responsables = db.get('responsables').value() || [];
  const missions = db.get('Missions').value() || [];
  const profils = db.get('ProfilRecherche').value() || [];
  const candidatures = db.get('candidatures').value() || [];
  const stats = db.get('OffreStatistiques').value() || [];
  const diffusions = db.get('OffreDiffusions').value() || [];
  const offreCompetences = db.get('OffreCompetences').value() || [];
  const competences = db.get('Competences').value() || [];
  const postes = db.get('settingsPostes').value() || [];

  const offre = offres.find(o => o.id === id);

  if (!offre) {
    return res.status(404).json({ message: "Offre introuvable" });
  }

  // Poste
  const poste = postes.find(p => p.id === offre.posteId);

  // Responsable
  const responsable = responsables.find(r => r.id === offre.responsableId);

  // Missions
  const missionsPrincipales = missions
    .filter(m => m.offreId === id)
    .map(m => m.libelle);

  // Compétences
  const competenceIds = offreCompetences
    .filter(oc => oc.offreId === id)
    .map(oc => oc.competenceId);

  const competencesRequises = competences
    .filter(c => competenceIds.includes(c.id))
    .map(c => c.libelle);

  // Profil
  const profilData = profils.filter(p => p.offreId === id);

  const formation = profilData.find(p => p.type === "FORMATION")?.contenu || null;
  const experience = profilData.find(p => p.type === "EXPERIENCE")?.contenu || null;

  // Statistiques
  const statistique = stats.find(s => s.offreId === id);

  // Diffusion
  const diffusionData = diffusions.filter(d => d.offreId === id);

const response = {
  id: offre.id,
  reference: offre.reference,

  poste: poste || null,   // 👈 poste complet ici

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
    nom: responsable?.nom || null,
    email: responsable?.email || null
  },

  statistiques: {
    vues: statistique?.nombreVues || 0,
    candidaturesRecues: statistique?.nombreCandidatures || 0
  },

  diffusion: {
    siteCarrieres: diffusionData.some(d => d.canal === "SITE_CARRIERE"),
    linkedin: diffusionData.some(d => d.canal === "LinkedIn"),
    rekrute: diffusionData.some(d => d.canal === "REKRUTE"),
    emploiMa: diffusionData.some(d => d.canal === "EMPLOI_MA"),
    reseauxSociaux: diffusionData.some(d => d.canal === "RESEAUX_SOCIAUX")
  }
};


  res.json(response);
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
