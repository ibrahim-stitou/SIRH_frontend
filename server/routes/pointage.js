module.exports = function registerPointageRoutes(server, db) {// Helper to build datetime string from record
  function resolveDateTime(rec, key) {
    const v = rec[key];
    if (v && /T|\d{2}:\d{2}/.test(String(v))) {
      // If already combined like YYYY-MM-DDTHH:mm or contains time, use as-is
      if (String(v).includes('T')) return String(v);
      // Legacy time-only, combine with rec.date if present
      if (rec.date) return `${rec.date}T${v}`;
    }
    // Fallback: if date exists use date at 00:00
    return rec.date ? `${rec.date}T00:00` : undefined;
  }

  // Paginated pointages listing with filters
  server.get('/pointages', (req, res) => {
    const start = parseInt(req.query.start || '0', 10);
    const length = parseInt(req.query.length || '10', 10);
    const sortBy = req.query.sortBy;
    const sortDir = req.query.sortDir === 'desc' ? 'desc' : 'asc';

    const employeeId = req.query.employeeId || req.query.employee || req.query.employe;
    const from = req.query.from || req.query.startDate; // expect datetime or date
    const to = req.query.to || req.query.endDate;

    let all = db.get('pointages').value() || [];

    // Filter by employee
    if (employeeId) {
      all = all.filter((p) => String(p.employeeId) === String(employeeId));
    }

    // Filter by datetime range (based on check_in)
    if (from || to) {
      const fromDate = from ? new Date(from) : null;
      const toDate = to ? new Date(to) : null;
      all = all.filter((p) => {
        const ci = resolveDateTime(p, 'check_in');
        const dt = ci ? new Date(ci) : p.date ? new Date(`${p.date}T00:00`) : null;
        if (!dt || isNaN(dt.getTime())) return false;
        if (fromDate && dt < fromDate) return false;
        if (toDate && dt > toDate) return false;
        return true;
      });
    }

    // Sort
    if (sortBy) {
      all.sort((a, b) => {
        const av = sortBy === 'check_in' || sortBy === 'check_out'
          ? resolveDateTime(a, sortBy) || ''
          : a[sortBy];
        const bv = sortBy === 'check_in' || sortBy === 'check_out'
          ? resolveDateTime(b, sortBy) || ''
          : b[sortBy];
        if (av === bv) return 0;
        if (av === undefined) return 1;
        if (bv === undefined) return -1;
        // Date strings compare lexicographically fine in ISO-like format
        if (typeof av === 'number' && typeof bv === 'number') {
          return sortDir === 'asc' ? av - bv : bv - av;
        }
        return sortDir === 'asc'
          ? String(av).localeCompare(String(bv))
          : String(bv).localeCompare(String(av));
      });
    }

    const recordsTotal = (db.get('pointages').value() || []).length;
    const employeesById = Object.fromEntries(
      (db.get('hrEmployees').value() || []).map((e) => [String(e.id), e])
    );

    const enriched = all.map((pointage) => {
      const check_in = resolveDateTime(pointage, 'check_in');
      const check_out = resolveDateTime(pointage, 'check_out');

      let employee = null;
      const hr = employeesById[String(pointage.employeeId)];
      if (hr) {
        employee = {
          id: hr.id,
          first_name: hr.firstName,
          last_name: hr.lastName,
          matricule: hr.matricule
        };
      } else if (pointage.employee) {
        const e = pointage.employee;
        employee = {
          id: e.id,
          first_name: e.first_name ?? e.firstName,
          last_name: e.last_name ?? e.lastName,
          matricule: e.matricule
        };
      }

      return {
        ...pointage,
        check_in,
        check_out,
        employee
      };
    });

    const recordsFiltered = enriched.length;
    const sliced = enriched.slice(start, start + length);
    return res.status(200).json({
      status: 'success',
      recordsTotal,
      recordsFiltered,
      data: sliced
    });
  });

  // Get single pointage by ID
  server.get('/pointages/:id', (req, res) => {
    const id = isNaN(+req.params.id) ? req.params.id : +req.params.id;
    const pointage = db.get('pointages').find({ id }).value();
    if (!pointage) {
      return res.status(404).json({ status: 'error', message: 'Pointage introuvable', data: null });
    }

    const employeesById = Object.fromEntries(
      (db.get('hrEmployees').value() || []).map((e) => [String(e.id), e])
    );

    const hr = employeesById[String(pointage.employeeId)];
    let employee = null;
    if (hr) {
      employee = { id: hr.id, first_name: hr.firstName, last_name: hr.lastName, matricule: hr.matricule };
    } else if (pointage.employee) {
      const e = pointage.employee;
      employee = { id: e.id, first_name: e.first_name ?? e.firstName, last_name: e.last_name ?? e.lastName, matricule: e.matricule };
    }

    return res.status(200).json({
      status: 'success',
      data: {
        ...pointage,
        check_in: resolveDateTime(pointage, 'check_in'),
        check_out: resolveDateTime(pointage, 'check_out'),
        employee
      }
    });
  });

  // Create pointage (mock): accept combined check_in/check_out datetime strings
  server.post('/pointages', (req, res) => {
    const now = new Date().toISOString();
    const newPointage = {
      id: Date.now(),
      employeeId: req.body.employeeId,
      check_in: req.body.check_in, // expect 'YYYY-MM-DDTHH:mm'
      check_out: req.body.check_out,
      source: req.body.source ?? 'manuel',
      status: req.body.status ?? 'bruillon',
      created_at: now,
      updated_at: now,
      updated_by: req.body.updated_by ?? 'system'
    };
    db.get('pointages').push(newPointage).write();
    return res.status(201).json({ status: 'success', message: 'Pointage créé avec succès', data: newPointage });
  });

  // Update pointage (mock)
  server.put('/pointages/:id', (req, res) => {
    const id = isNaN(+req.params.id) ? req.params.id : +req.params.id;
    const exists = db.get('pointages').find({ id }).value();
    if (!exists) return res.status(404).json({ status: 'error', message: 'Pointage introuvable', data: null });

    const updatedPointage = {
      employeeId: req.body.employeeId ?? exists.employeeId,
      check_in: req.body.check_in ?? exists.check_in,
      check_out: req.body.check_out ?? exists.check_out,
      source: req.body.source ?? exists.source,
      status: req.body.status ?? exists.status,
      updated_at: new Date().toISOString(),
      updated_by: req.body.updated_by ?? 'system'
    };

    db.get('pointages').find({ id }).assign(updatedPointage).write();
    const row = db.get('pointages').find({ id }).value();
    return res.json({ status: 'success', message: 'Pointage mis à jour avec succès', data: row });
  });

  // Validate a pointage (mock)
  server.patch('/pointages/:id/validate', (req, res) => {
    const id = isNaN(+req.params.id) ? req.params.id : +req.params.id;
    const exists = db.get('pointages').find({ id }).value();
    if (!exists) return res.status(404).json({ status: 'error', message: 'Pointage introuvable', data: null });
    db.get('pointages').find({ id }).assign({ status: 'valide', motif_rejet: null, updated_at: new Date().toISOString(), updated_by: req.body?.updated_by || 'system' }).write();
    const row = db.get('pointages').find({ id }).value();
    return res.json({ status: 'success', message: 'Pointage validé', data: row });
  });

  // Refuse a pointage (mock)
  server.patch('/pointages/:id/refuse', (req, res) => {
    const id = isNaN(+req.params.id) ? req.params.id : +req.params.id;
    const exists = db.get('pointages').find({ id }).value();
    if (!exists) return res.status(404).json({ status: 'error', message: 'Pointage introuvable', data: null });
    const motif = req.body?.motif_rejet || req.body?.motif || req.body?.reason || null;
    db.get('pointages').find({ id }).assign({ status: 'rejete', motif_rejet: motif, updated_at: new Date().toISOString(), updated_by: req.body?.updated_by || 'system' }).write();
    const row = db.get('pointages').find({ id }).value();
    return res.json({ status: 'success', message: 'Pointage refusé', data: row });
  });

  // Delete pointage (mock)
  server.delete('/pointages/:id', (req, res) => {
    const id = isNaN(+req.params.id) ? req.params.id : +req.params.id;
    const exists = db.get('pointages').find({ id }).value();
    if (!exists) return res.status(404).json({ status: 'error', message: 'Pointage introuvable', data: null });
    db.get('pointages').remove({ id }).write();
    return res.json({ status: 'success', message: 'Pointage supprimé avec succès' });
  });

  // ===== Mock Export/Import Endpoints =====
  // Export model CSV with combined datetime fields
  server.get('/pointages/export/model.csv', (req, res) => {
    const csvHeader = 'employeeId,check_in,check_out,source\n';
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="pointages-model.csv"');
    return res.status(200).send(csvHeader);
  });

  // Export model XLSX (mock)
  server.get('/pointages/export/model.xlsx', (req, res) => {
    return res.status(200).json({ status: 'success', message: 'Modèle Excel (mock) généré', columns: ['employeeId', 'check_in', 'check_out', 'source'] });
  });

  // Export all pointages CSV
  server.get('/pointages/export.csv', (req, res) => {
    const rows = db.get('pointages').value() || [];
    const header = ['id', 'employeeId', 'check_in', 'check_out', 'source', 'status'];
    const toVal = (v) => (v == null ? '' : String(v).replace(/\n/g, ' '));
    const data = [header.join(',')].concat(
      rows.map((r) => [
        r.id,
        r.employeeId,
        resolveDateTime(r, 'check_in') || '',
        resolveDateTime(r, 'check_out') || '',
        r.source ?? '',
        r.status ?? ''
      ].map(toVal).join(','))
    ).join('\n') + '\n';
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="pointages.csv"');
    return res.status(200).send(data);
  });

  // Export all pointages XLSX (mock)
  server.get('/pointages/export.xlsx', (req, res) => {
    return res.status(200).json({ status: 'success', message: 'Export Excel (mock) généré', total: (db.get('pointages').value() || []).length });
  });

  // Import CSV/Excel (mock) — accepts rows with combined datetime strings
  server.post('/pointages/import', (req, res) => {
    const rows = Array.isArray(req.body?.rows) ? req.body.rows : [];
    const processed = rows.length;
    let imported = 0;
    rows.slice(0, 5).forEach((r) => {
      const now = new Date().toISOString();
      const rec = {
        id: Date.now() + Math.floor(Math.random() * 1000),
        employeeId: r.employeeId,
        check_in: r.check_in,
        check_out: r.check_out,
        source: r.source ?? 'manuel',
        status: r.status ?? 'bruillon',
        created_at: now,
        updated_at: now,
        updated_by: 'import'
      };
      db.get('pointages').push(rec).write();
      imported += 1;
    });

    return res.status(200).json({ status: 'success', message: 'Import (mock) terminé', summary: { processed, imported, errors: 0 }, sample: rows.slice(0, 3) });
  });
};
