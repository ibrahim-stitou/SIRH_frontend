module.exports = function registerAvenantRoutes(server, db) {
  server.get('/avenants', (req, res) => {
    res.json(db.avenants || []);
  });
  server.get('/contracts/:id/avenants', (req, res) => {
    const id = req.params.id;
    const list = (db.avenants || []).filter((a) => String(a.contract_id) === String(id));
    res.json(list);
  });
  server.get('/avenants/:id', (req, res) => {
    const id = req.params.id;
    const found = (db.avenants || []).find((a) => String(a.id) === String(id));
    if (!found) return res.status(404).json({ message: 'Avenant not found' });
    res.json(found);
  });
  server.post('/avenants', (req, res) => {
    const body = req.body || {};
    const newItem = { id: body.id || `AVN-${Date.now()}`, ...body };
    db.avenants = db.avenants || [];
    db.avenants.push(newItem);
    res.status(201).json(newItem);
  });
  server.put('/avenants/:id', (req, res) => {
    const id = req.params.id;
    const idx = (db.avenants || []).findIndex((a) => String(a.id) === String(id));
    if (idx === -1) return res.status(404).json({ message: 'Avenant not found' });
    db.avenants[idx] = { ...db.avenants[idx], ...req.body };
    res.json(db.avenants[idx]);
  });
  server.delete('/avenants/:id', (req, res) => {
    const id = req.params.id;
    const before = db.avenants || [];
    db.avenants = before.filter((a) => String(a.id) !== String(id));
    res.json({ success: true });
  });
  server.post('/avenants/:id/generate-pdf', (req, res) => {
    const id = req.params.id;
    const avenant = (db.avenants || []).find((a) => String(a.id) === String(id));
    if (!avenant) {
      return res.status(404).json({ message: 'Avenant not found' });
    }
    const documentUrl = `/uploads/avenants/${id}/generated.pdf`;
    const idx = (db.avenants || []).findIndex((a) => String(a.id) === String(id));
    if (idx !== -1) {
      db.avenants[idx].document_url = documentUrl;
    }
    res.json({ success: true, document_url: documentUrl, message: 'PDF generated successfully' });
  });
  server.post('/avenants/:id/upload-signed', (req, res) => {
    const id = req.params.id;
    const { fileUrl, fileName } = req.body;
    const avenant = (db.avenants || []).find((a) => String(a.id) === String(id));
    if (!avenant) {
      return res.status(404).json({ message: 'Avenant not found' });
    }
    const idx = (db.avenants || []).findIndex((a) => String(a.id) === String(id));
    if (idx !== -1) {
      db.avenants[idx].signed_document = { url: fileUrl, name: fileName, uploaded_at: new Date().toISOString() };
    }
    res.json({ success: true, signed_document: db.avenants[idx].signed_document });
  });
}

