module.exports = function registerSettingsConditionsPeriodeEssaieRoutes(server, db) {
  // List
  server.get('/settings/conditions-periode-essaie', (req, res) => {
    const rows = db.get('settingsConditionsPeriodeEssaie').value() || [];
    return res.json({ status: 'success', message: 'Récupération réussie', data: rows });
  });

  // Show by ID
  server.get('/settings/conditions-periode-essaie/:id', (req, res) => {
    const id = isNaN(+req.params.id) ? req.params.id : +req.params.id;
    const row = (db.get('settingsConditionsPeriodeEssaie').value() || []).find((r) => String(r.id) === String(id));
    if (!row) return res.status(404).json({ status: 'error', message: 'Introuvable', data: null });
    return res.json({ status: 'success', message: 'Récupération réussie', data: row });
  });

  // Create
  server.post('/settings/conditions-periode-essaie', (req, res) => {
    const p = req.body || {};
    const name = String(p.name || '').trim();
    const description = String(p.description || '').trim();
    if (!name)
      return res.status(400).json({ status: 'error', message: 'Nom requis', data: null });

    const exists = (db.get('settingsConditionsPeriodeEssaie').value() || []).some((r) => String(r.name).toLowerCase() === name.toLowerCase());
    if (exists) return res.status(409).json({ status: 'error', message: 'Nom déjà existant', data: null });

    const row = {
      id: p.id || Date.now(),
      name,
      description,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    db.get('settingsConditionsPeriodeEssaie').push(row).write();
    return res.status(201).json({ status: 'success', message: 'Création réussie', data: row });
  });

  // Update
  server.put('/settings/conditions-periode-essaie/:id', (req, res) => {
    const id = isNaN(+req.params.id) ? req.params.id : +req.params.id;
    const exists = db.get('settingsConditionsPeriodeEssaie').find({ id }).value();
    if (!exists) return res.status(404).json({ status: 'error', message: 'Introuvable', data: null });
    const next = { ...exists, ...req.body, id, updated_at: new Date().toISOString() };
    if (next.name) next.name = String(next.name).trim();
    next.description = String(next.description || '').trim();
    // Ensure no lingering value field
    delete next.value;
    db.get('settingsConditionsPeriodeEssaie').find({ id }).assign(next).write();
    const updated = db.get('settingsConditionsPeriodeEssaie').find({ id }).value();
    return res.json({ status: 'success', message: 'Mise à jour réussie', data: updated });
  });

  // Delete
  server.delete('/settings/conditions-periode-essaie/:id', (req, res) => {
    const id = isNaN(+req.params.id) ? req.params.id : +req.params.id;
    const exists = db.get('settingsConditionsPeriodeEssaie').find({ id }).value();
    if (!exists) return res.status(404).json({ status: 'error', message: 'Introuvable', data: null });
    db.get('settingsConditionsPeriodeEssaie').remove({ id }).write();
    return res.json({ status: 'success', message: 'Suppression réussie', data: { id } });
  });
};
