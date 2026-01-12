module.exports = function registerSettingsDepartementsRoutes(server, db) {
  // List
  server.get('/settings/departements', (req, res) => {
    const rows = db.get('settingsDepartements').value() || [];
    return res.json({ status: 'success', message: 'Récupération réussie', data: rows });
  });

  // Show by ID
  server.get('/settings/departements/:id', (req, res) => {
    const id = isNaN(+req.params.id) ? req.params.id : +req.params.id;
    const row = (db.get('settingsDepartements').value() || []).find((r) => String(r.id) === String(id));
    if (!row) return res.status(404).json({ status: 'error', message: 'Introuvable', data: null });
    return res.json({ status: 'success', message: 'Récupération réussie', data: row });
  });

  // Create
  server.post('/settings/departements', (req, res) => {
    const payload = req.body || {};
    const code = String(payload.code || '').trim();
    const libelle = String(payload.libelle || '').trim();
    if (!code || !libelle)
      return res.status(400).json({ status: 'error', message: 'Code et libellé requis', data: null });

    // Optional: prevent duplicate code
    const existsCode = (db.get('settingsDepartements').value() || []).some((r) => String(r.code).toLowerCase() === code.toLowerCase());
    if (existsCode) return res.status(409).json({ status: 'error', message: 'Code déjà existant', data: null });

    const row = {
      id: payload.id || Date.now(),
      code,
      libelle,
      is_active: payload.is_active !== false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    db.get('settingsDepartements').push(row).write();
    return res.status(201).json({ status: 'success', message: 'Création réussie', data: row });
  });

  // Update
  server.put('/settings/departements/:id', (req, res) => {
    const id = isNaN(+req.params.id) ? req.params.id : +req.params.id;
    const exists = db.get('settingsDepartements').find({ id }).value();
    if (!exists) return res.status(404).json({ status: 'error', message: 'Introuvable', data: null });
    const next = {
      ...exists,
      ...req.body,
      id,
      updated_at: new Date().toISOString()
    };
    db.get('settingsDepartements').find({ id }).assign(next).write();
    const updated = db.get('settingsDepartements').find({ id }).value();
    return res.json({ status: 'success', message: 'Mise à jour réussie', data: updated });
  });

  // Delete
  server.delete('/settings/departements/:id', (req, res) => {
    const id = isNaN(+req.params.id) ? req.params.id : +req.params.id;
    const exists = db.get('settingsDepartements').find({ id }).value();
    if (!exists) return res.status(404).json({ status: 'error', message: 'Introuvable', data: null });
    db.get('settingsDepartements').remove({ id }).write();
    return res.json({ status: 'success', message: 'Suppression réussie', data: { id } });
  });

  // Activate
  server.patch('/settings/departements/:id/activate', (req, res) => {
    const id = isNaN(+req.params.id) ? req.params.id : +req.params.id;
    const exists = db.get('settingsDepartements').find({ id }).value();
    if (!exists) return res.status(404).json({ status: 'error', message: 'Introuvable', data: null });
    db.get('settingsDepartements').find({ id }).assign({ is_active: true, updated_at: new Date().toISOString() }).write();
    const updated = db.get('settingsDepartements').find({ id }).value();
    return res.json({ status: 'success', message: 'Activation réussie', data: updated });
  });

  // Deactivate
  server.patch('/settings/departements/:id/deactivate', (req, res) => {
    const id = isNaN(+req.params.id) ? req.params.id : +req.params.id;
    const exists = db.get('settingsDepartements').find({ id }).value();
    if (!exists) return res.status(404).json({ status: 'error', message: 'Introuvable', data: null });
    db.get('settingsDepartements').find({ id }).assign({ is_active: false, updated_at: new Date().toISOString() }).write();
    const updated = db.get('settingsDepartements').find({ id }).value();
    return res.json({ status: 'success', message: 'Désactivation réussie', data: updated });
  });
};
