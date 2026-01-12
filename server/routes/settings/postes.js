module.exports = function registerSettingsPostesRoutes(server, db) {
  // List
  server.get('/settings/postes', (req, res) => {
    const rows = db.get('settingsPostes').value() || [];
    return res.json({
      status: 'success',
      message: 'Récupération réussie',
      data: rows
    });
  });

  // Show by ID
  server.get('/settings/postes/:id', (req, res) => {
    const id = isNaN(+req.params.id) ? req.params.id : +req.params.id;
    const row = (db.get('settingsPostes').value() || []).find(
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
  server.post('/settings/postes', (req, res) => {
    const payload = req.body || {};
    const code = String(payload.code || '').trim();
    const libelle = String(payload.libelle || '').trim();
    const departement_id = payload.departement_id;
    if (!code || !libelle || !departement_id)
      return res
        .status(400)
        .json({
          status: 'error',
          message: 'Code, libellé et département requis',
          data: null
        });

    // Optional: prevent duplicate code
    const existsCode = (db.get('settingsPostes').value() || []).some(
      (r) => String(r.code).toLowerCase() === code.toLowerCase()
    );
    if (existsCode)
      return res
        .status(409)
        .json({ status: 'error', message: 'Code déjà existant', data: null });

    // Soft validate departement exists
    const depExists = (db.get('settingsDepartements').value() || []).some(
      (d) => String(d.id) === String(departement_id)
    );
    if (!depExists)
      return res
        .status(400)
        .json({ status: 'error', message: 'Département inconnu', data: null });

    const row = {
      id: payload.id || Date.now(),
      code,
      libelle,
      departement_id,
      is_active: payload.is_active !== false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    db.get('settingsPostes').push(row).write();
    return res
      .status(201)
      .json({ status: 'success', message: 'Création réussie', data: row });
  });

  // Update
  server.put('/settings/postes/:id', (req, res) => {
    const id = isNaN(+req.params.id) ? req.params.id : +req.params.id;
    const exists = db.get('settingsPostes').find({ id }).value();
    if (!exists)
      return res
        .status(404)
        .json({ status: 'error', message: 'Introuvable', data: null });

    let next = {
      ...exists,
      ...req.body,
      id,
      updated_at: new Date().toISOString()
    };
    if (next.departement_id) {
      const depExists = (db.get('settingsDepartements').value() || []).some(
        (d) => String(d.id) === String(next.departement_id)
      );
      if (!depExists)
        return res
          .status(400)
          .json({
            status: 'error',
            message: 'Département inconnu',
            data: null
          });
    }
    db.get('settingsPostes').find({ id }).assign(next).write();
    const updated = db.get('settingsPostes').find({ id }).value();
    return res.json({
      status: 'success',
      message: 'Mise à jour réussie',
      data: updated
    });
  });

  // Delete
  server.delete('/settings/postes/:id', (req, res) => {
    const id = isNaN(+req.params.id) ? req.params.id : +req.params.id;
    const exists = db.get('settingsPostes').find({ id }).value();
    if (!exists)
      return res
        .status(404)
        .json({ status: 'error', message: 'Introuvable', data: null });
    db.get('settingsPostes').remove({ id }).write();
    return res.json({
      status: 'success',
      message: 'Suppression réussie',
      data: { id }
    });
  });

  // Activate
  server.patch('/settings/postes/:id/activate', (req, res) => {
    const id = isNaN(+req.params.id) ? req.params.id : +req.params.id;
    const exists = db.get('settingsPostes').find({ id }).value();
    if (!exists)
      return res
        .status(404)
        .json({ status: 'error', message: 'Introuvable', data: null });
    db.get('settingsPostes')
      .find({ id })
      .assign({ is_active: true, updated_at: new Date().toISOString() })
      .write();
    const updated = db.get('settingsPostes').find({ id }).value();
    return res.json({
      status: 'success',
      message: 'Activation réussie',
      data: updated
    });
  });

  // Deactivate
  server.patch('/settings/postes/:id/deactivate', (req, res) => {
    const id = isNaN(+req.params.id) ? req.params.id : +req.params.id;
    const exists = db.get('settingsPostes').find({ id }).value();
    if (!exists)
      return res
        .status(404)
        .json({ status: 'error', message: 'Introuvable', data: null });
    db.get('settingsPostes')
      .find({ id })
      .assign({ is_active: false, updated_at: new Date().toISOString() })
      .write();
    const updated = db.get('settingsPostes').find({ id }).value();
    return res.json({
      status: 'success',
      message: 'Désactivation réussie',
      data: updated
    });
  });
};
