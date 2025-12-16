module.exports = function registerAvenantRoutes(server, db) {
  // List with optional pagination and sorting
  server.get('/avenants', (req, res) => {
    const start = parseInt(req.query.start || '0', 10);
    const length = parseInt(req.query.length || '10', 10);
    const sortBy = req.query.sortBy;
    const sortDir = req.query.sortDir === 'desc' ? 'desc' : 'asc';

    let all = db.get('avenants').value() || [];

    // Simple filtering by query params (excluding pagination params)
    const excluded = new Set(['start', 'length', 'sortBy', 'sortDir']);
    Object.entries(req.query).forEach(([key, value]) => {
      if (excluded.has(key) || value == null || value === '') return;
      all = all.filter((row) => {
        const v = row[key];
        if (v == null) return false;
        return String(v).toLowerCase().includes(String(value).toLowerCase());
      });
    });

    const recordsFiltered = all.length;

    if (sortBy) {
      all.sort((a, b) => {
        const av = a[sortBy];
        const bv = b[sortBy];
        if (av === bv) return 0;
        if (av === undefined) return 1;
        if (bv === undefined) return -1;
        if (typeof av === 'number' && typeof bv === 'number') {
          return sortDir === 'asc' ? av - bv : bv - av;
        }
        return sortDir === 'asc'
          ? String(av).localeCompare(String(bv))
          : String(bv).localeCompare(String(av));
      });
    }

    const recordsTotal = (db.get('avenants').value() || []).length;
    const sliced = all.slice(start, start + length);
    return res.json({
      status: 'success',
      message: 'Liste des avenants récupérée avec succès',
      data: sliced,
      recordsTotal,
      recordsFiltered
    });
  });

  server.get('/contracts/:id/avenants', (req, res) => {
    const id = req.params.id;
    const list = (db.get('avenants').value() || []).filter(
      (a) => String(a.contract_id) === String(id)
    );
    return res.json({ status: 'success', data: list });
  });

  server.get('/avenants/:id', (req, res) => {
    const id = req.params.id;
    const found = (db.get('avenants').value() || []).find(
      (a) => String(a.id) === String(id)
    );
    if (!found)
      return res
        .status(404)
        .json({ status: 'error', message: 'Avenant introuvable', data: null });
    return res.json({ status: 'success', data: found });
  });

  server.post('/avenants', (req, res) => {
    const body = req.body || {};
    const newItem = { id: body.id || `AVN-${Date.now()}`, ...body };
    db.get('avenants').push(newItem).write();
    return res
      .status(201)
      .json({ status: 'success', message: 'Création réussie', data: newItem });
  });

  server.put('/avenants/:id', (req, res) => {
    const id = req.params.id;
    const exists = db.get('avenants').find({ id }).value();
    if (!exists)
      return res
        .status(404)
        .json({ status: 'error', message: 'Avenant introuvable', data: null });
    db.get('avenants').find({ id }).assign(req.body).write();
    const updated = db.get('avenants').find({ id }).value();
    return res.json({ status: 'success', message: 'Mise à jour réussie', data: updated });
  });

  server.delete('/avenants/:id', (req, res) => {
    const id = req.params.id;
    const exists = db.get('avenants').find({ id }).value();
    if (!exists)
      return res
        .status(404)
        .json({ status: 'error', message: 'Avenant introuvable', data: null });
    db.get('avenants').remove({ id }).write();
    return res.json({ status: 'success', message: 'Suppression réussie' });
  });

  server.post('/avenants/:id/generate-pdf', (req, res) => {
    const id = req.params.id;
    const exists = db.get('avenants').find({ id }).value();
    if (!exists)
      return res
        .status(404)
        .json({ status: 'error', message: 'Avenant introuvable', data: null });
    const documentUrl = `/uploads/avenants/${id}/generated.pdf`;
    db.get('avenants').find({ id }).assign({ document_url: documentUrl }).write();
    return res.json({ status: 'success', document_url: documentUrl, message: 'PDF généré' });
  });

  server.post('/avenants/:id/upload-signed', (req, res) => {
    const id = req.params.id;
    const exists = db.get('avenants').find({ id }).value();
    if (!exists)
      return res
        .status(404)
        .json({ status: 'error', message: 'Avenant introuvable', data: null });
    const { fileUrl, fileName } = req.body;
    const signed = {
      url: fileUrl,
      name: fileName,
      uploaded_at: new Date().toISOString()
    };
    db.get('avenants').find({ id }).assign({ signed_document: signed }).write();
    return res.json({ status: 'success', signed_document: signed });
  });
};
