module.exports = (server, db) => {
  const routerName = 'frais';
  const base = `/${routerName}`;

  function readMeta() {
    try {
      const meta = require('../../mock-data/fraisCategories.json');
      return meta;
    } catch (e) {
      return { categories: [], kilometerRates: [], currencies: [{ code: 'MAD', rateToMAD: 1 }] };
    }
  }

  function rateOf(code, meta) {
    const c = (meta.currencies || []).find(c => c.code === code);
    return c ? c.rateToMAD : 1;
  }

  function computeTotals(note, meta) {
    let totalMAD = 0;
    note.lines = (note.lines || []).map(line => {
      let amount = Number(line.amount) || 0;
      if (line.kilometers && line.vehicleType) {
        const kr = (meta.kilometerRates || []).find(k => k.vehicle === line.vehicleType);
        if (kr) amount += kr.ratePerKm * Number(line.kilometers);
      }
      const cat = (meta.categories || []).find(c => c.name === line.category);
      if (cat && amount > cat.ceiling) {
        line.approvedAmount = cat.ceiling;
      } else {
        line.approvedAmount = amount;
      }
      const rate = rateOf(line.currency || note.currency || 'MAD', meta);
      totalMAD += (line.approvedAmount || amount) * rate;
      return line;
    });
    note.total = totalMAD;
    return note;
  }

  function nextSeq(matricule, year) {
    const prefix = `NDF-${year}-${matricule}-`;
    const items = db.get('notesFrais').value() || [];
    const seqs = items
      .filter(i => i.matricule === matricule && String(i.number || '').startsWith(prefix))
      .map(i => parseInt(String(i.number).slice(prefix.length), 10))
      .filter(n => !isNaN(n));
    const next = (seqs.length ? Math.max(...seqs) : 0) + 1;
    return `${prefix}${String(next).padStart(3, '0')}`;
  }

  // List all notes
  server.get(`/api/admin/${routerName}`, (req, res) => {
    const items = db.get('notesFrais').value() || [];
    res.json(items);
  });

  // Get one note
  server.get(`/api/admin/${routerName}/:id`, (req, res) => {
    const id = Number(req.params.id);
    const item = db.get('notesFrais').find({ id }).value();
    if (!item) return res.status(404).json({ message: 'Not found' });
    res.json(item);
  });

  // Create note
  server.post(`/api/admin/${routerName}`, (req, res) => {
    const body = req.body || {};
    const meta = readMeta();
    const list = db.get('notesFrais').value() || [];
    const id = (list.length ? Math.max(...list.map(i => i.id)) : 0) + 1;
    const year = new Date().getFullYear();
    const number = nextSeq(body.matricule || 'EMP000', year);
    const note = computeTotals({
      id,
      number,
      status: 'draft',
      history: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lines: [],
      ...body,
    }, meta);
    db.get('notesFrais').push(note).write();
    res.status(201).json(note);
  });

  // Update note
  server.put(`/api/admin/${routerName}/:id`, (req, res) => {
    const id = Number(req.params.id);
    const meta = readMeta();
    const existing = db.get('notesFrais').find({ id }).value();
    if (!existing) return res.status(404).json({ message: 'Not found' });
    const updated = computeTotals({ ...existing, ...req.body, updatedAt: new Date().toISOString() }, meta);
    db.get('notesFrais').find({ id }).assign(updated).write();
    res.json(updated);
  });

  // Delete note
  server.delete(`/api/admin/${routerName}/:id`, (req, res) => {
    const id = Number(req.params.id);
    const existing = db.get('notesFrais').find({ id }).value();
    if (!existing) return res.status(404).json({ message: 'Not found' });
    db.get('notesFrais').remove({ id }).write();
    res.json(existing);
  });

  // Validation actions
  server.post(`/api/admin/${routerName}/:id/validate`, (req, res) => {
    const id = Number(req.params.id);
    const meta = readMeta();
    const note = db.get('notesFrais').find({ id }).value();
    if (!note) return res.status(404).json({ message: 'Not found' });
    const { action, adjustments, reason, comment } = req.body || {};
    if (action === 'approve_total') {
      note.status = 'approved';
    } else if (action === 'approve_partial') {
      if (Array.isArray(adjustments)) {
        note.lines = (note.lines || []).map(line => {
          const adj = adjustments.find(a => String(a.id) === String(line.id));
          if (adj && typeof adj.approvedAmount === 'number') {
            line.approvedAmount = adj.approvedAmount;
            line.managerComment = adj.managerComment || line.managerComment || '';
          }
          return line;
        });
      }
      note.status = 'approved_partial';
    } else if (action === 'refuse') {
      note.status = 'refused';
      note.refuseReason = reason || comment || '';
    } else if (action === 'request_complement') {
      note.status = 'needs_complement';
      note.managerComment = comment || '';
    } else {
      return res.status(400).json({ message: 'Invalid action' });
    }
    computeTotals(note, meta);
    note.history = note.history || [];
    note.history.push({ at: new Date().toISOString(), action, by: 'manager', comment: comment || '' });
    db.get('notesFrais').find({ id }).assign(note).write();
    res.json(note);
  });
};
