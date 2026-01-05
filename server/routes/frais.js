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
      } else if (typeof line.approvedAmount !== 'number') {
        line.approvedAmount = amount;
      }
      // Always MAD: no conversion
      totalMAD += (line.approvedAmount || amount);
      return line;
    });
    note.total = Number(totalMAD.toFixed(2));
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

  // Helpers for listing
  const norm = (s) => String(s || '').replace(/[^A-Za-z0-9]/g, '').toLowerCase();

  const resolveEmployee = (note, employeesById, employeesByMat) => {
    const byId = note.employeeId != null ? employeesById[String(note.employeeId)] : null;
    if (byId) return byId;
    if (note.employee && note.employee.id != null) {
      const e = employeesById[String(note.employee.id)];
      if (e) return e;
    }
    const m = note.matricule || (note.employee && note.employee.matricule);
    if (m) return employeesByMat[norm(m)] || null;
    return null;
  };

  const parseSorting = (req) => {
    let sortBy = req.query.sortBy || req.query.orderBy || null;
    let sortDir = (req.query.sortDir || req.query.orderDir || 'desc').toLowerCase() === 'desc' ? 'desc' : 'asc';

    // DataTables style
    const colIndex = req.query['order[0][column]'];
    const dtSortDir = req.query['order[0][dir]'];
    const candidate = colIndex != null ? (req.query[`columns[${colIndex}][data]`] || req.query[`columns[${colIndex}][name]`]) : null;
    if (!sortBy && candidate) sortBy = candidate;
    if (dtSortDir) sortDir = dtSortDir === 'desc' ? 'desc' : 'asc';

    return { sortBy, sortDir };
  };

  const compareBy = (key, dir) => (a, b) => {
    const av = a[key];
    const bv = b[key];
    if (av === bv) return 0;
    if (av === undefined) return 1;
    if (bv === undefined) return -1;
    if (typeof av === 'number' && typeof bv === 'number') {
      return dir === 'asc' ? av - bv : bv - av;
    }
    return dir === 'asc'
      ? String(av).localeCompare(String(bv))
      : String(bv).localeCompare(String(av));
  };

  // --- Workflow helpers ---
  const isActionAllowed = (status, action) => {
    const map = {
      draft: [], // validation not allowed
      submitted: ['approve_total', 'approve_partial', 'refuse', 'request_complement'],
      approved: [],
      approved_partial: [],
      refused: [],
      needs_complement: []
    };
    return (map[status] || []).includes(action);
  };

  const canSubmitFrom = (status) => ['draft', 'needs_complement', 'refused'].includes(status);

  const nowIso = () => new Date().toISOString();

  // List all notes (datatable style)
  server.get(`/api/admin/${routerName}`, (req, res) => {
    const start = parseInt(req.query.start || '0', 10);
    const length = parseInt(req.query.length || '10', 10);
    const q = req.query.q || req.query.search || req.query['search[value]'] || '';
    const status = req.query.status || req.query.statut;
    const employeeId = req.query.employeeId || req.query.employee || req.query.employe;
    const matricule = req.query.matricule;
    const from = req.query.from || req.query.periodStart || req.query.startDate;
    const to = req.query.to || req.query.periodEnd || req.query.endDate;

    const meta = readMeta();

    const recordsTotal = (db.get('notesFrais').value() || []).length;

    // Build maps for employees
    const employees = db.get('hrEmployees').value() || [];
    const employeesById = Object.fromEntries(employees.map(e => [String(e.id), e]));
    const employeesByMat = Object.fromEntries(employees.map(e => [norm(e.matricule), e]));

    // Load notes and enrich minimally for filters
    let all = (db.get('notesFrais').value() || []).map(n => ({ ...n }));

    // Attach totals if missing using lignesFrais when note.lines not present
    const linesAll = db.get('lignesFrais').value() || [];
    all = all.map(n => {
      const note = { ...n };
      if (!Array.isArray(note.lines) || note.lines.length === 0) {
        const lines = linesAll.filter(l => String(l.noteId) === String(note.id));
        if (lines.length) note.lines = lines.map(l => ({ ...l }));
      }
      computeTotals(note, meta);
      // Attach employee minimal info
      const emp = resolveEmployee(note, employeesById, employeesByMat);
      note.employee = emp
        ? { id: emp.id, firstName: emp.firstName, lastName: emp.lastName, matricule: emp.matricule, departmentId: emp.departmentId }
        : null;
      note.linesCount = Array.isArray(note.lines) ? note.lines.length : 0;
      return note;
    });

    // Filters
    if (status) {
      all = all.filter(n => String(n.status).toLowerCase() === String(status).toLowerCase());
    }
    if (employeeId) {
      all = all.filter(n => String(n.employeeId) === String(employeeId) || (n.employee && String(n.employee.id) === String(employeeId)));
    }
    if (matricule) {
      const m = norm(matricule);
      all = all.filter(n => norm(n.matricule) === m || (n.employee && norm(n.employee.matricule) === m));
    }
    if (from || to) {
      const fromDate = from ? new Date(from) : null;
      const toDate = to ? new Date(to) : null;
      all = all.filter(n => {
        const s = n.startDate ? new Date(n.startDate) : null;
        const e = n.endDate ? new Date(n.endDate) : null;
        // Overlap logic: [s,e] overlaps [from,to]
        if (fromDate && e && e < fromDate) return false;
        if (toDate && s && s > toDate) return false;
        return true;
      });
    }
    if (q) {
      const nq = norm(q);
      all = all.filter(n => {
        const hay = [n.number, n.subject, n.status, n.matricule, n.employee && n.employee.firstName, n.employee && n.employee.lastName]
          .filter(Boolean)
          .map(norm)
          .join(' ');
        return hay.includes(nq);
      });
    }

    const recordsFiltered = all.length;

    // Sorting
    const { sortBy, sortDir } = parseSorting(req);
    if (sortBy) {
      all.sort(compareBy(sortBy, sortDir));
    } else {
      // default: createdAt desc if present, else id desc
      all.sort((a, b) => {
        const av = a.createdAt || a.id;
        const bv = b.createdAt || b.id;
        return String(bv).localeCompare(String(av));
      });
    }

    // Pagination
    const data = all.slice(start, start + length);

    return res.json({
      status: 'success',
      message: 'Liste des notes de frais récupérée avec succès',
      data,
      recordsTotal,
      recordsFiltered
    });
  });

  // Get one note
  server.get(`/api/admin/${routerName}/:id`, (req, res) => {
    const id = Number(req.params.id);
    const item = db.get('notesFrais').find({ id }).value();
    if (!item) return res.status(404).json({ message: 'Not found' });

    const meta = readMeta();

    // Attach lines if not already present
    const note = { ...item };
    if (!Array.isArray(note.lines) || note.lines.length === 0) {
      const lines = db.get('lignesFrais').filter({ noteId: id }).value();
      if (lines && lines.length) note.lines = lines.map(l => ({ ...l }));
    }

    computeTotals(note, meta);
    return res.json(note);
  });

  // Create note
  server.post(`/api/admin/${routerName}`, (req, res) => {
    const now = new Date();
    const year = now.getFullYear();
    const note = req.body;

    // Defaults
    if (!note.status) note.status = 'draft';

    // compute totals and number
    const meta = readMeta();
    const employee = (db.get('hrEmployees').find({ id: note.employeeId }).value()) || null;
    const matricule = note.matricule || (employee && employee.matricule) || 'UNKNOWN';

    note.number = nextSeq(matricule, year);
    note.createdAt = now.toISOString();
    note.updatedAt = now.toISOString();

    computeTotals(note, meta);

    db.get('notesFrais').push(note).write();

    return res.status(201).json(note);
  });

  // Update note
  server.put(`/api/admin/${routerName}/:id`, (req, res) => {
    const id = Number(req.params.id);
    const existing = db.get('notesFrais').find({ id }).value();
    if (!existing) return res.status(404).json({ message: 'Not found' });

    const note = { ...existing, ...req.body, id };
    note.updatedAt = new Date().toISOString();

    const meta = readMeta();
    computeTotals(note, meta);

    db.get('notesFrais').find({ id }).assign(note).write();

    return res.json(note);
  });

  // Delete note
  server.delete(`/api/admin/${routerName}/:id`, (req, res) => {
    const id = Number(req.params.id);
    const existing = db.get('notesFrais').find({ id }).value();
    if (!existing) return res.status(404).json({ message: 'Not found' });

    db.get('notesFrais').remove({ id }).write();
    db.get('lignesFrais').remove({ noteId: id }).write();

    return res.json({ status: 'success' });
  });

  // --- Submit for validation ---
  server.post(`/api/admin/${routerName}/:id/submit`, (req, res) => {
    const id = Number(req.params.id);
    const existing = db.get('notesFrais').find({ id }).value();
    if (!existing) return res.status(404).json({ message: 'Not found' });

    const currentStatus = existing.status || 'draft';
    if (!canSubmitFrom(currentStatus)) {
      return res.status(400).json({ message: `Impossible de soumettre depuis le statut '${currentStatus}'` });
    }

    // Ensure lines present for totals
    const meta = readMeta();
    const note = { ...existing };
    if (!Array.isArray(note.lines) || note.lines.length === 0) {
      const lines = db.get('lignesFrais').filter({ noteId: id }).value();
      if (Array.isArray(lines)) note.lines = lines.map(l => ({ ...l }));
    }

    // Set status to submitted
    note.status = 'submitted';
    note.updatedAt = nowIso();
    note.history = Array.isArray(note.history) ? note.history : [];
    note.history.push({ at: note.updatedAt, action: 'SUBMITTED', by: 'system' });

    computeTotals(note, meta);

    db.get('notesFrais').find({ id }).assign(note).write();
    return res.json(note);
  });

  // --- Validation actions ---
  server.post(`/api/admin/${routerName}/:id/validate`, (req, res) => {
    const id = Number(req.params.id);
    const payload = req.body || {};
    const action = payload.action;

    const existing = db.get('notesFrais').find({ id }).value();
    if (!existing) return res.status(404).json({ message: 'Not found' });

    const status = existing.status || 'draft';
    if (!isActionAllowed(status, action)) {
      return res.status(400).json({ message: `Action '${action}' non permise depuis le statut '${status}'` });
    }

    const meta = readMeta();
    const note = { ...existing };
    // Ensure lines
    if (!Array.isArray(note.lines) || note.lines.length === 0) {
      const lines = db.get('lignesFrais').filter({ noteId: id }).value();
      if (Array.isArray(lines)) note.lines = lines.map(l => ({ ...l }));
    }

    note.history = Array.isArray(note.history) ? note.history : [];
    const ts = nowIso();

    if (action === 'approve_total') {
      // Approve all at requested amount
      note.lines = (note.lines || []).map(l => ({ ...l, approvedAmount: Number(l.amount) || 0 }));
      note.status = 'approved';
      note.history.push({ at: ts, action: 'APPROVED', by: 'system' });
    } else if (action === 'approve_partial') {
      const adjustments = Array.isArray(payload.adjustments) ? payload.adjustments : [];
      const adjById = Object.fromEntries(adjustments.map(a => [String(a.id), a]));
      note.lines = (note.lines || []).map(l => {
        const a = adjById[String(l.id)];
        const approvedAmount = a && typeof a.approvedAmount === 'number' ? a.approvedAmount : (Number(l.approvedAmount ?? l.amount) || 0);
        const managerComment = (a && a.managerComment) || l.managerComment;
        return { ...l, approvedAmount, managerComment };
      });
      note.status = 'approved_partial';
      note.history.push({ at: ts, action: 'APPROVED_PARTIAL', by: 'system' });
    } else if (action === 'refuse') {
      const reason = String(payload.reason || '').trim();
      if (!reason) {
        return res.status(400).json({ message: 'La raison du refus est requise' });
      }
      note.refuseReason = reason;
      note.status = 'refused';
      note.history.push({ at: ts, action: 'REFUSED', by: 'system', comment: reason });
    } else if (action === 'request_complement') {
      const comment = String(payload.comment || '').trim();
      if (!comment) {
        return res.status(400).json({ message: 'Le commentaire est requis pour la demande de complément' });
      }
      note.managerComment = comment;
      note.status = 'needs_complement';
      note.history.push({ at: ts, action: 'NEEDS_COMPLEMENT', by: 'system', comment });
    } else {
      return res.status(400).json({ message: 'Action inconnue' });
    }

    note.updatedAt = ts;

    // Recompute totals with approved amounts
    computeTotals(note, meta);

    // Persist note
    db.get('notesFrais').find({ id }).assign(note).write();

    // Also sync lignesFrais collection if exists
    try {
      const currentLines = db.get('lignesFrais').filter({ noteId: id }).value() || [];
      if (currentLines && currentLines.length) {
        (note.lines || []).forEach(l => {
          db.get('lignesFrais').find({ noteId: id, id: l.id }).assign({ approvedAmount: l.approvedAmount, managerComment: l.managerComment }).write();
        });
      }
    } catch (_) {}

    return res.json(note);
  });
};
