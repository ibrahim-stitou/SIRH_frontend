module.exports = function registerParametresRoutes(server, db) {
  // GET list
  server.get('/parametre-max-general', (req, res) => {
    const rows = db.get('parametreMaxGeneral').value() || [];
    return res.json({ status: 'success', message: 'Récupération réussie', data: rows });
  });

  // GET by id
  server.get('/parametre-max-general/:id', (req, res) => {
    const id = isNaN(+req.params.id) ? req.params.id : +req.params.id;
    const row = (db.get('parametreMaxGeneral').value() || []).find((r) => String(r.id) === String(id));
    if (!row) return res.status(404).json({ status: 'error', message: 'Introuvable', data: null });
    return res.json({ status: 'success', message: 'Récupération réussie', data: row });
  });

  // CREATE
  server.post('/parametre-max-general', (req, res) => {
    const payload = req.body || {};
    if (!payload.id) payload.id = Date.now();
    payload.created_at = payload.created_at || new Date().toISOString();
    payload.updated_at = new Date().toISOString();
    db.get('parametreMaxGeneral').push(payload).write();
    return res.status(201).json({ status: 'success', message: 'Création réussie', data: payload });
  });

  // UPDATE
  server.put('/parametre-max-general/:id', (req, res) => {
    const id = isNaN(+req.params.id) ? req.params.id : +req.params.id;
    const exists = (db.get('parametreMaxGeneral').value() || []).find((r) => String(r.id) === String(id));
    if (!exists) return res.status(404).json({ status: 'error', message: 'Introuvable', data: null });
    const next = { ...req.body, id, created_at: exists.created_at || new Date().toISOString(), updated_at: new Date().toISOString() };
    db.get('parametreMaxGeneral').find({ id }).assign(next).write();
    const updated = db.get('parametreMaxGeneral').find({ id }).value();
    return res.json({ status: 'success', message: 'Mise à jour réussie', data: updated });
  });

  // DELETE
  server.delete('/parametre-max-general/:id', (req, res) => {
    const id = isNaN(+req.params.id) ? req.params.id : +req.params.id;
    const exists = (db.get('parametreMaxGeneral').value() || []).find((r) => String(r.id) === String(id));
    if (!exists) return res.status(404).json({ status: 'error', message: 'Introuvable', data: null });
    const removed = db.get('parametreMaxGeneral').remove({ id }).write();
    return res.json({ status: 'success', message: 'Suppression réussie', data: removed });
  });
};

