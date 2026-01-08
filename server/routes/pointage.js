module.exports = function registerPointageRoutes(server, db) {
  // Helper to build datetime string from record
  function resolveDateTime(rec, key) {
    const v = rec[key];
    if (!v) return undefined;
    const s = String(v);
    // If already combined like YYYY-MM-DDTHH:mm
    if (s.includes('T')) return s;
    // If value is time-only (HH:mm or HH:mm:ss), combine with worked_day (or legacy 'date')
    if (/^\d{2}:\d{2}(:\d{2})?$/.test(s)) {
      const day = rec.worked_day || rec.date || null;
      if (day) return `${day}T${s.slice(0, 5)}`;
      return undefined;
    }
    // If value is a date-only string, use 00:00 as time
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return `${s}T00:00`;
    return undefined;
  }
  function extractDatePart(iso) {
    if (!iso) return null;
    const [d] = String(iso).split('T');
    return d || null;
  }
  function extractTimePart(isoOrTime) {
    if (!isoOrTime) return null;
    const s = String(isoOrTime);
    if (s.includes('T')) {
      const t = s.split('T')[1] || '';
      return t.slice(0, 5) || null;
    }
    if (/^\d{2}:\d{2}(:\d{2})?$/.test(s)) return s.slice(0, 5);
    return null;
  }

  // Paginated pointages listing with filters
  server.get('/pointages', (req, res) => {
    const start = parseInt(req.query.start || '0', 10);
    const length = parseInt(req.query.length || '10', 10);
    const sortBy = req.query.sortBy;
    const sortDir = req.query.sortDir === 'desc' ? 'desc' : 'asc';

    const employeeId =
      req.query.employeeId || req.query.employee || req.query.employe;
    const from = req.query.from || req.query.startDate; // expect date or datetime
    const to = req.query.to || req.query.endDate;
    const groupId = req.query.groupId || req.query.group || req.query.groupe;

    let all = db.get('pointages').value() || [];

    // Filter by group membership if provided
    if (groupId) {
      const gm = db.get('groupMembers').value() || [];
      const memberIds = new Set(
        gm
          .filter((m) => String(m.groupId) === String(groupId))
          .map((m) => String(m.employeeId ?? m.employee?.id))
          .filter(Boolean)
      );
      all = all.filter((p) => memberIds.has(String(p.employeeId)));
    }

    // Filter by employee
    if (employeeId) {
      all = all.filter((p) => String(p.employeeId) === String(employeeId));
    }

    // Filter by date range (based on combined worked_day + check_in time)
    if (from || to) {
      const fromDate = from ? new Date(from) : null;
      const toDate = to ? new Date(to) : null;
      all = all.filter((p) => {
        const ci =
          resolveDateTime(p, 'check_in') ||
          (p.worked_day ? `${p.worked_day}T00:00` : null);
        const dt = ci ? new Date(ci) : null;
        if (!dt || isNaN(dt.getTime())) return false;
        if (fromDate && dt < fromDate) return false;
        if (toDate && dt > toDate) return false;
        return true;
      });
    }

    // Sort
    if (sortBy) {
      all.sort((a, b) => {
        const datetimeKeys = [
          'check_in',
          'check_out',
          'planned_check_in',
          'planned_check_out'
        ];
        const av = datetimeKeys.includes(sortBy)
          ? resolveDateTime(a, sortBy) || ''
          : a[sortBy];
        const bv = datetimeKeys.includes(sortBy)
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
      const check_in_dt = resolveDateTime(pointage, 'check_in');
      const check_out_dt = resolveDateTime(pointage, 'check_out');
      const planned_check_in_dt = resolveDateTime(pointage, 'planned_check_in');
      const planned_check_out_dt = resolveDateTime(
        pointage,
        'planned_check_out'
      );

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

      // ensure worked_day exists if possible
      const worked_day =
        pointage.worked_day ||
        extractDatePart(check_in_dt) ||
        extractDatePart(check_out_dt) ||
        null;

      return {
        ...pointage,
        // Preserve original time-only fields if present
        check_in:
          extractTimePart(pointage.check_in) || extractTimePart(check_in_dt),
        check_out:
          extractTimePart(pointage.check_out) || extractTimePart(check_out_dt),
        planned_check_in:
          extractTimePart(pointage.planned_check_in) ||
          extractTimePart(planned_check_in_dt),
        planned_check_out:
          extractTimePart(pointage.planned_check_out) ||
          extractTimePart(planned_check_out_dt),
        worked_day,
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
      return res
        .status(404)
        .json({ status: 'error', message: 'Pointage introuvable', data: null });
    }

    const employeesById = Object.fromEntries(
      (db.get('hrEmployees').value() || []).map((e) => [String(e.id), e])
    );

    const hr = employeesById[String(pointage.employeeId)];
    let employee = null;
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

    // Respond with time-only for check_in/out and worked_day as date
    return res.status(200).json({
      status: 'success',
      data: {
        ...pointage,
        check_in:
          extractTimePart(pointage.check_in) ||
          extractTimePart(resolveDateTime(pointage, 'check_in')),
        check_out:
          extractTimePart(pointage.check_out) ||
          extractTimePart(resolveDateTime(pointage, 'check_out')),
        planned_check_in:
          extractTimePart(pointage.planned_check_in) ||
          extractTimePart(resolveDateTime(pointage, 'planned_check_in')),
        planned_check_out:
          extractTimePart(pointage.planned_check_out) ||
          extractTimePart(resolveDateTime(pointage, 'planned_check_out')),
        worked_day:
          pointage.worked_day ||
          extractDatePart(resolveDateTime(pointage, 'check_in')) ||
          extractDatePart(resolveDateTime(pointage, 'check_out')) ||
          null,
        employee
      }
    });
  });

  // Create pointage (mock): accept time-only HH:mm and worked_day (YYYY-MM-DD)
  server.post('/pointages', (req, res) => {
    const now = new Date().toISOString();
    const computedWorkedDay = req.body.worked_day || null; // with time-only inputs, worked_day must be provided
    const newPointage = {
      id: Date.now(),
      employeeId: req.body.employeeId,
      check_in: req.body.check_in, // expect 'HH:mm'
      check_out: req.body.check_out, // expect 'HH:mm'
      planned_check_in: req.body.planned_check_in ?? null,
      planned_check_out: req.body.planned_check_out ?? null,
      worked_day: computedWorkedDay,
      source: req.body.source ?? 'manuel',
      status: req.body.status ?? 'bruillon',
      created_at: now,
      updated_at: now,
      updated_by: req.body.updated_by ?? 'system'
    };
    db.get('pointages').push(newPointage).write();
    return res.status(201).json({
      status: 'success',
      message: 'Pointage créé avec succès',
      data: newPointage
    });
  });

  // Update pointage (mock)
  server.put('/pointages/:id', (req, res) => {
    const id = isNaN(+req.params.id) ? req.params.id : +req.params.id;
    const exists = db.get('pointages').find({ id }).value();
    if (!exists)
      return res
        .status(404)
        .json({ status: 'error', message: 'Pointage introuvable', data: null });

    const nextCheckIn = req.body.check_in ?? exists.check_in;
    const nextCheckOut = req.body.check_out ?? exists.check_out;
    const updatedPointage = {
      employeeId: req.body.employeeId ?? exists.employeeId,
      check_in: nextCheckIn, // HH:mm
      check_out: nextCheckOut, // HH:mm
      planned_check_in:
        req.body.planned_check_in ?? exists.planned_check_in ?? null,
      planned_check_out:
        req.body.planned_check_out ?? exists.planned_check_out ?? null,
      worked_day: req.body.worked_day ?? exists.worked_day ?? null,
      source: req.body.source ?? exists.source,
      status: req.body.status ?? exists.status,
      updated_at: new Date().toISOString(),
      updated_by: req.body.updated_by ?? 'system'
    };

    db.get('pointages').find({ id }).assign(updatedPointage).write();
    const row = db.get('pointages').find({ id }).value();
    return res.json({
      status: 'success',
      message: 'Pointage mis à jour avec succès',
      data: row
    });
  });

  // Validate a pointage (mock)
  server.patch('/pointages/:id/validate', (req, res) => {
    const id = isNaN(+req.params.id) ? req.params.id : +req.params.id;
    const exists = db.get('pointages').find({ id }).value();
    if (!exists)
      return res
        .status(404)
        .json({ status: 'error', message: 'Pointage introuvable', data: null });
    db.get('pointages')
      .find({ id })
      .assign({
        status: 'valide',
        motif_rejet: null,
        updated_at: new Date().toISOString(),
        updated_by: req.body?.updated_by || 'system'
      })
      .write();
    const row = db.get('pointages').find({ id }).value();
    return res.json({
      status: 'success',
      message: 'Pointage validé',
      data: row
    });
  });

  // Refuse a pointage (mock)
  server.patch('/pointages/:id/refuse', (req, res) => {
    const id = isNaN(+req.params.id) ? req.params.id : +req.params.id;
    const exists = db.get('pointages').find({ id }).value();
    if (!exists)
      return res
        .status(404)
        .json({ status: 'error', message: 'Pointage introuvable', data: null });
    const motif =
      req.body?.motif_rejet || req.body?.motif || req.body?.reason || null;
    db.get('pointages')
      .find({ id })
      .assign({
        status: 'rejete',
        motif_rejet: motif,
        updated_at: new Date().toISOString(),
        updated_by: req.body?.updated_by || 'system'
      })
      .write();
    const row = db.get('pointages').find({ id }).value();
    return res.json({
      status: 'success',
      message: 'Pointage refusé',
      data: row
    });
  });

  // Delete pointage (mock)
  server.delete('/pointages/:id', (req, res) => {
    const id = isNaN(+req.params.id) ? req.params.id : +req.params.id;
    const exists = db.get('pointages').find({ id }).value();
    if (!exists)
      return res
        .status(404)
        .json({ status: 'error', message: 'Pointage introuvable', data: null });
    db.get('pointages').remove({ id }).write();
    return res.json({
      status: 'success',
      message: 'Pointage supprimé avec succès'
    });
  });

  // ===== Mock Export/Import Endpoints =====
  // Export model CSV with time-only fields
  server.get('/pointages/export/model.csv', (req, res) => {
    const csvHeader =
      'employeeId,check_in,check_out,planned_check_in,planned_check_out,worked_day,source\n';
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="pointages-model.csv"'
    );
    return res.status(200).send(csvHeader);
  });

  // Export model XLSX (mock)
  server.get('/pointages/export/model.xlsx', (req, res) => {
    return res.status(200).json({
      status: 'success',
      message: 'Modèle Excel (mock) généré',
      columns: [
        'employeeId',
        'check_in (HH:mm)',
        'check_out (HH:mm)',
        'worked_day (YYYY-MM-DD)',
        'planned_check_in (HH:mm)',
        'planned_check_out (HH:mm)',
        'source'
      ]
    });
  });

  // Export all pointages CSV (time-only for in/out)
  server.get('/pointages/export.csv', (req, res) => {
    const rows = db.get('pointages').value() || [];
    const header = [
      'id',
      'employeeId',
      'check_in',
      'check_out',
      'planned_check_in',
      'planned_check_out',
      'worked_day',
      'source',
      'status'
    ];
    const toVal = (v) => (v == null ? '' : String(v).replace(/\n/g, ' '));
    const data =
      [header.join(',')]
        .concat(
          rows.map((r) =>
            [
              r.id,
              r.employeeId,
              extractTimePart(r.check_in) ||
                extractTimePart(resolveDateTime(r, 'check_in')) ||
                '',
              extractTimePart(r.check_out) ||
                extractTimePart(resolveDateTime(r, 'check_out')) ||
                '',
              extractTimePart(r.planned_check_in) ||
                extractTimePart(resolveDateTime(r, 'planned_check_in')) ||
                '',
              extractTimePart(r.planned_check_out) ||
                extractTimePart(resolveDateTime(r, 'planned_check_out')) ||
                '',
              r.worked_day ?? '',
              r.source ?? '',
              r.status ?? ''
            ]
              .map(toVal)
              .join(',')
          )
        )
        .join('\n') + '\n';
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="pointages.csv"'
    );
    return res.status(200).send(data);
  });

  // Export all pointages XLSX (mock)
  server.get('/pointages/export.xlsx', (req, res) => {
    return res.status(200).json({
      status: 'success',
      message: 'Export Excel (mock) généré',
      total: (db.get('pointages').value() || []).length
    });
  });

  // Import CSV/Excel (mock) — accepts rows with time-only strings + worked_day
  server.post('/pointages/import', (req, res) => {
    const rows = Array.isArray(req.body?.rows) ? req.body.rows : [];
    const processed = rows.length;
    let imported = 0;
    rows.slice(0, 5).forEach((r) => {
      const now = new Date().toISOString();
      const rec = {
        id: Date.now() + Math.floor(Math.random() * 1000),
        employeeId: r.employeeId,
        check_in: r.check_in, // HH:mm
        check_out: r.check_out, // HH:mm
        planned_check_in: r.planned_check_in ?? null,
        planned_check_out: r.planned_check_out ?? null,
        worked_day: r.worked_day ?? null, // required to resolve date
        source: r.source ?? 'manuel',
        status: r.status ?? 'bruillon',
        created_at: now,
        updated_at: now,
        updated_by: 'import'
      };
      db.get('pointages').push(rec).write();
      imported += 1;
    });

    return res.status(200).json({
      status: 'success',
      message: 'Import (mock) terminé',
      summary: { processed, imported, errors: 0 },
      sample: rows.slice(0, 3)
    });
  });
};
