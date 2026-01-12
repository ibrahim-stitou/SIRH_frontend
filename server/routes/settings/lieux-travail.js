module.exports = function registerSettingsLieuxTravailRoutes(server, db) {
  // List
  server.get('/settings/lieux-travail', (req, res) => {
    const rows = db.get('settingsLieuxTravail').value() || [];
    return res.json({ status: 'success', message: 'Récupération réussie', data: rows });
  });

  // Show by ID
  server.get('/settings/lieux-travail/:id', (req, res) => {
    const id = isNaN(+req.params.id) ? req.params.id : +req.params.id;
    const row = (db.get('settingsLieuxTravail').value() || []).find((r) => String(r.id) === String(id));
    if (!row) return res.status(404).json({ status: 'error', message: 'Introuvable', data: null });
    return res.json({ status: 'success', message: 'Récupération réussie', data: row });
  });

  // Create
  server.post('/settings/lieux-travail', (req, res) => {
    const payload = req.body || {};
    const code = String(payload.code || '').trim();
    const libelle = String(payload.libelle || '').trim();
    const adresse = String(payload.adresse || '').trim();
    if (!code || !libelle || !adresse)
      return res.status(400).json({ status: 'error', message: 'Code, libellé et adresse requis', data: null });

    const existsCode = (db.get('settingsLieuxTravail').value() || []).some((r) => String(r.code).toLowerCase() === code.toLowerCase());
    if (existsCode) return res.status(409).json({ status: 'error', message: 'Code déjà existant', data: null });

    const row = {
      id: payload.id || Date.now(),
      code,
      libelle,
      adresse,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    db.get('settingsLieuxTravail').push(row).write();
    return res.status(201).json({ status: 'success', message: 'Création réussie', data: row });
  });

  // Update
  server.put('/settings/lieux-travail/:id', (req, res) => {
    const id = isNaN(+req.params.id) ? req.params.id : +req.params.id;
    const exists = db.get('settingsLieuxTravail').find({ id }).value();
    if (!exists) return res.status(404).json({ status: 'error', message: 'Introuvable', data: null });
    const next = { ...exists, ...req.body, id, updated_at: new Date().toISOString() };
    db.get('settingsLieuxTravail').find({ id }).assign(next).write();
    const updated = db.get('settingsLieuxTravail').find({ id }).value();
    return res.json({ status: 'success', message: 'Mise à jour réussie', data: updated });
  });

  // Delete
  server.delete('/settings/lieux-travail/:id', (req, res) => {
    const id = isNaN(+req.params.id) ? req.params.id : +req.params.id;
    const exists = db.get('settingsLieuxTravail').find({ id }).value();
    if (!exists) return res.status(404).json({ status: 'error', message: 'Introuvable', data: null });
    db.get('settingsLieuxTravail').remove({ id }).write();
    return res.json({ status: 'success', message: 'Suppression réussie', data: { id } });
  });
};
