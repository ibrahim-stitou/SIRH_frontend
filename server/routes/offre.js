// Configuration des routes pour JSON Server
// Ce fichier définit les routes personnalisées si nécessaire

/**
 * Routes disponibles avec JSON Server (auto-générées depuis db.json):
 *
 * GET    /offres           - Liste toutes les offres
 * GET    /offres/:id       - Récupère une offre par ID
 * POST   /offres           - Crée une nouvelle offre
 * PUT    /offres/:id       - Remplace une offre
 * PATCH  /offres/:id       - Met à jour partiellement une offre
 * DELETE /offres/:id       - Supprime une offre
 *
 * GET    /responsables     - Liste tous les responsables
 * GET    /responsables/:id - Récupère un responsable par ID
 *
 * GET    /candidatures           - Liste toutes les candidatures
 * GET    /candidatures/:id       - Récupère une candidature par ID
 * GET    /candidatures?offreId=1 - Filtre les candidatures par offre
 * POST   /candidatures           - Crée une nouvelle candidature
 * PATCH  /candidatures/:id       - Met à jour une candidature
 * DELETE /candidatures/:id       - Supprime une candidature
 */

module.exports = (server, db) => {
  // Route personnalisée pour les offres récentes
  server.get('/offres/nouveau', (req, res) => {
    const offres = db.get('offres').value() || [];
    const recent = offres.slice(-1); // Dernière offre
    res.json(recent);
  });

  // Route pour les offres actives
  server.get('/offres/actives', (req, res) => {
    const offres = db.get('offres').value() || [];
    const actives = offres.filter(o => o.statut === 'publiee');
    res.json(actives);
  });

  // Route pour les offres en brouillon
  server.get('/offres/brouillons', (req, res) => {
    const offres = db.get('offres').value() || [];
    const brouillons = offres.filter(o => o.statut === 'brouillon');
    res.json(brouillons);
  });

  // Route pour les offres clôturées
  server.get('/offres/cloturees', (req, res) => {
    const offres = db.get('offres').value() || [];
    const cloturees = offres.filter(o => o.statut === 'cloturee');
    res.json(cloturees);
  });
};
