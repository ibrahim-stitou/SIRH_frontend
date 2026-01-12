module.exports = function registerSettingsMetiersRoutes(server, db) {
  // List
  server.get('/settings/metiers', (req, res) => {
    const rows = db.get('settingsMetiers').value() || [];
    return res.json({
      status: 'success',
      message: 'Récupération réussie',
      data: rows
    });
  });

  // Show by ID
  server.get('/settings/metiers/:id', (req, res) => {
    const id = isNaN(+req.params.id) ? req.params.id : +req.params.id;
    const row = (db.get('settingsMetiers').value() || []).find(
      (r) => String(r.id) === String(id)
    );
    if (!row)
      return res
        .status(404)
        .json({ status: 'error', message: 'Introuvable', data: null });
    return res.json({
      status: 'success',
      message: 'Récupération réussie',
      data: row
    });
  });

  // Create
  server.post('/settings/metiers', (req, res) => {
    const payload = req.body || {};
    const code = String(payload.code || '').trim();
    const libelle = String(payload.libelle || '').trim();
    const domaine = String(payload.domaine || '').trim();
    if (!code || !libelle || !domaine)
      return res
        .status(400)
        .json({
          status: 'error',
          message: 'Code, libellé et domaine requis',
          data: null
        });

    // Optional: prevent duplicate code
    const existsCode = (db.get('settingsMetiers').value() || []).some(
      (r) => String(r.code).toLowerCase() === code.toLowerCase()
    );
    if (existsCode)
      return res
        .status(409)
        .json({ status: 'error', message: 'Code déjà existant', data: null });

    const row = {
      id: payload.id || Date.now(),
      code,
      libelle,
      domaine,
      is_active: payload.is_active !== false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    db.get('settingsMetiers').push(row).write();
    return res
      .status(201)
      .json({ status: 'success', message: 'Création réussie', data: row });
  });

  // Update
  server.put('/settings/metiers/:id', (req, res) => {
    const id = isNaN(+req.params.id) ? req.params.id : +req.params.id;
    const exists = db.get('settingsMetiers').find({ id }).value();
    if (!exists)
      return res
        .status(404)
        .json({ status: 'error', message: 'Introuvable', data: null });
    const next = {
      ...exists,
      ...req.body,
      id,
      updated_at: new Date().toISOString()
    };
    db.get('settingsMetiers').find({ id }).assign(next).write();
    const updated = db.get('settingsMetiers').find({ id }).value();
    return res.json({
      status: 'success',
      message: 'Mise à jour réussie',
      data: updated
    });
  });

  // Delete
  server.delete('/settings/metiers/:id', (req, res) => {
    const id = isNaN(+req.params.id) ? req.params.id : +req.params.id;
    const exists = db.get('settingsMetiers').find({ id }).value();
    if (!exists)
      return res
        .status(404)
        .json({ status: 'error', message: 'Introuvable', data: null });
    db.get('settingsMetiers').remove({ id }).write();
    return res.json({
      status: 'success',
      message: 'Suppression réussie',
      data: { id }
    });
  });

  // Activate
  server.patch('/settings/metiers/:id/activate', (req, res) => {
    const id = isNaN(+req.params.id) ? req.params.id : +req.params.id;
    const exists = db.get('settingsMetiers').find({ id }).value();
    if (!exists)
      return res
        .status(404)
        .json({ status: 'error', message: 'Introuvable', data: null });
    db.get('settingsMetiers')
      .find({ id })
      .assign({ is_active: true, updated_at: new Date().toISOString() })
      .write();
    const updated = db.get('settingsMetiers').find({ id }).value();
    return res.json({
      status: 'success',
      message: 'Activation réussie',
      data: updated
    });
  });

  // Deactivate
  server.patch('/settings/metiers/:id/deactivate', (req, res) => {
    const id = isNaN(+req.params.id) ? req.params.id : +req.params.id;
    const exists = db.get('settingsMetiers').find({ id }).value();
    if (!exists)
      return res
        .status(404)
        .json({ status: 'error', message: 'Introuvable', data: null });
    db.get('settingsMetiers')
      .find({ id })
      .assign({ is_active: false, updated_at: new Date().toISOString() })
      .write();
    const updated = db.get('settingsMetiers').find({ id }).value();
    return res.json({
      status: 'success',
      message: 'Désactivation réussie',
      data: updated
    });
  });
};
