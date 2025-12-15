module.exports = function registerGenericRoutes(server, db, data) {
  const collections = Object.keys(data).filter((k) => Array.isArray(data[k]));
  collections.forEach((col) => {
    server.get(`/${col}`, (req, res) => {
      const rows = db.get(col).value();
      res.json({ status: 'success', message: 'Récupération réussie', data: rows });
    });
    server.get(`/${col}/:id`, (req, res) => {
      const id = isNaN(+req.params.id) ? req.params.id : +req.params.id;
      const row = db.get(col).find({ id }).value();
      if (!row) return res.status(404).json({ status: 'error', message: 'Introuvable', data: null });
      res.json({ status: 'success', message: 'Récupération réussie', data: row });
    });
    server.post(`/${col}`, (req, res) => {
      const payload = req.body;
      if (!payload.id) payload.id = Date.now();
      db.get(col).push(payload).write();
      res.status(201).json({ status: 'success', message: 'Création réussie', data: payload });
    });
    server.put(`/${col}/:id`, (req, res) => {
      const id = isNaN(+req.params.id) ? req.params.id : +req.params.id;
      const exists = db.get(col).find({ id }).value();
      if (!exists) return res.status(404).json({ status: 'error', message: 'Introuvable', data: null });
      db.get(col).find({ id }).assign(req.body).write();
      res.json({ status: 'success', message: 'Mise à jour réussie', data: db.get(col).find({ id }).value() });
    });
    server.patch(`/${col}/:id`, (req, res) => {
      const id = isNaN(+req.params.id) ? req.params.id : +req.params.id;
      const exists = db.get(col).find({ id }).value();
      if (!exists) return res.status(404).json({ status: 'error', message: 'Introuvable', data: null });
      db.get(col).find({ id }).assign(req.body).write();
      res.json({ status: 'success', message: 'Mise à jour partielle réussie', data: db.get(col).find({ id }).value() });
    });
    server.delete(`/${col}/:id`, (req, res) => {
      const id = isNaN(+req.params.id) ? req.params.id : +req.params.id;
      const exists = db.get(col).find({ id }).value();
      if (!exists) return res.status(404).json({ status: 'error', message: 'Introuvable', data: null });
      const removed = db.get(col).remove({ id }).write();
      res.json({ status: 'success', message: 'Suppression réussie', data: removed });
    });
  });
}

