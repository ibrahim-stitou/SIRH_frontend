module.exports = function registerParametreMaxGeneralRoutes(server, db) {
  // List
  server.get('/parametre-max-general', (req, res) => {
    const rows = db.get('parametreMaxGeneral').value() || [];
    return res.json({ status: 'success', message: 'Récupération réussie', data: rows });
  });

  // Show by ID
  server.get('/parametre-max-general/:id', (req, res) => {
    const id = isNaN(+req.params.id) ? req.params.id : +req.params.id;
    const row = (db.get('parametreMaxGeneral').value() || []).find((r) => String(r.id) === String(id));
    if (!row) return res.status(404).json({ status: 'error', message: 'Introuvable', data: null });
    return res.json({ status: 'success', message: 'Récupération réussie', data: row });
  });

  // Create
  server.post('/parametre-max-general', (req, res) => {
    const p = req.body || {};
    const type = String(p.type || '').trim();
    const max = Number(p.max);
    const description = String(p.description || '').trim();
    const is_required = !!p.is_required; // default false if not provided
    if (!type || Number.isNaN(max))
      return res.status(400).json({ status: 'error', message: 'Type et valeur maximale requis', data: null });

    const exists = (db.get('parametreMaxGeneral').value() || []).some((r) => String(r.type).toLowerCase() === type.toLowerCase());
    if (exists) return res.status(409).json({ status: 'error', message: 'Type déjà existant', data: null });

    const row = {
      id: p.id || Date.now(),
      type,
      max,
      description,
      is_required,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    db.get('parametreMaxGeneral').push(row).write();
    return res.status(201).json({ status: 'success', message: 'Création réussie', data: row });
  });

  // Update
  server.put('/parametre-max-general/:id', (req, res) => {
    const id = isNaN(+req.params.id) ? req.params.id : +req.params.id;
    const exists = db.get('parametreMaxGeneral').find({ id }).value();
    if (!exists) return res.status(404).json({ status: 'error', message: 'Introuvable', data: null });
    if (exists.is_required) {
      return res.status(403).json({ status: 'error', message: 'Modification interdite pour un paramètre requis', data: null });
    }
    const next = { ...exists, ...req.body, id, updated_at: new Date().toISOString() };
    if (next.type) next.type = String(next.type).trim();
    next.description = String(next.description || '').trim();
    next.max = Number(next.max);
    next.is_required = !!exists.is_required; // preserve original flag
    if (Number.isNaN(next.max)) return res.status(400).json({ status: 'error', message: 'Valeur maximale invalide', data: null });
    db.get('parametreMaxGeneral').find({ id }).assign(next).write();
    const updated = db.get('parametreMaxGeneral').find({ id }).value();
    return res.json({ status: 'success', message: 'Mise à jour réussie', data: updated });
  });

  // Delete
  server.delete('/parametre-max-general/:id', (req, res) => {
    const id = isNaN(+req.params.id) ? req.params.id : +req.params.id;
    const exists = db.get('parametreMaxGeneral').find({ id }).value();
    if (!exists) return res.status(404).json({ status: 'error', message: 'Introuvable', data: null });
    if (exists.is_required) {
      return res.status(403).json({ status: 'error', message: 'Suppression interdite pour un paramètre requis', data: null });
    }
    db.get('parametreMaxGeneral').remove({ id }).write();
    return res.json({ status: 'success', message: 'Suppression réussie', data: { id } });
  });
};
