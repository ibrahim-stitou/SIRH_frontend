// Custom routes for Absences module (listing, filters, simple lists)
module.exports = function registerAbsencesRoutes(server, db) {
  // Simple list of absence types for selects
  server.get('/absence-types/simple-list', (req, res) => {
    const types = db.get('absenceTypes').value() || [];
    const simple = types
      .filter((t) => t.actif !== false)
      .sort((a, b) => (a.ordre || 0) - (b.ordre || 0))
      .map((t) => ({ id: t.id, code: t.code, libelle: t.libelle }));
    return res.json({ status: 'success', data: simple });
  });

  // Full list of absence types
  server.get('/absence-types', (req, res) => {
    const types = (db.get('absenceTypes').value() || []).sort(
      (a, b) => (a.ordre || 0) - (b.ordre || 0)
    );
    return res.json({ status: 'success', data: types });
  });

  // Paginated absences listing with filters
  server.get('/absences', (req, res) => {
    const start = parseInt(req.query.start || '0', 10);
    const length = parseInt(req.query.length || '10', 10);
    const sortBy = req.query.sortBy;
    const sortDir = req.query.sortDir === 'desc' ? 'desc' : 'asc';

    const employeeId = req.query.employeeId || req.query.employee || req.query.employe;
    const typeId = req.query.type || req.query.type_absence_id;
    const status = req.query.status || req.query.statut;
    const from = req.query.from || req.query.periodStart || req.query.startDate;
    const to = req.query.to || req.query.periodEnd || req.query.endDate;

    let all = db.get('absences').value() || [];

    // Filter by employee
    if (employeeId) {
      all = all.filter((a) => String(a.employeeId) === String(employeeId));
    }
    // Filter by type
    if (typeId) {
      all = all.filter((a) => String(a.type_absence_id) === String(typeId));
    }
    // Filter by status
    if (status) {
      all = all.filter((a) => String(a.statut).toLowerCase() === String(status).toLowerCase());
    }
    // Filter by overlapping period
    if (from || to) {
      const fromDate = from ? new Date(from) : null;
      const toDate = to ? new Date(to) : null;
      all = all.filter((a) => {
        const aStart = new Date(a.date_debut);
        const aEnd = new Date(a.date_fin);
        if (fromDate && aEnd < fromDate) return false;
        if (toDate && aStart > toDate) return false;
        return true;
      });
    }

    // Sort
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

    const recordsTotal = db.get('absences').value()?.length || 0;

    // Enrich with type and employee minimal info
    const typesById = Object.fromEntries((db.get('absenceTypes').value() || []).map((t) => [String(t.id), t]));
    const employeesById = Object.fromEntries((db.get('hrEmployees').value() || []).map((e) => [String(e.id), e]));

    const enriched = all.map((a) => ({
      ...a,
      type_absence: typesById[String(a.type_absence_id)] || null,
      employee: employeesById[String(a.employeeId)]
        ? {
            id: employeesById[String(a.employeeId)].id,
            firstName: employeesById[String(a.employeeId)].firstName,
            lastName: employeesById[String(a.employeeId)].lastName,
            matricule: employeesById[String(a.employeeId)].matricule
          }
        : null
    }));

    const recordsFiltered = enriched.length;
    const sliced = enriched.slice(start, start + length);

    return res.json({
      status: 'success',
      message: 'Liste des absences récupérée avec succès',
      data: sliced,
      recordsTotal,
      recordsFiltered
    });
  });

  // Cancel an absence (set statut = 'annulee')
  server.patch('/absences/:id/cancel', (req, res) => {
    const id = isNaN(+req.params.id) ? req.params.id : +req.params.id;
    const exists = db.get('absences').find({ id }).value();
    if (!exists) return res.status(404).json({ status: 'error', message: 'Absence introuvable', data: null });
    db.get('absences').find({ id }).assign({ statut: 'annulee', updatedAt: new Date().toISOString() }).write();
    const row = db.get('absences').find({ id }).value();
    return res.json({ status: 'success', message: 'Absence annulée', data: row });
  });

  // Validate an absence (set statut = 'validee')
  server.patch('/absences/:id/validate', (req, res) => {
    const id = isNaN(+req.params.id) ? req.params.id : +req.params.id;
    const exists = db.get('absences').find({ id }).value();
    if (!exists) return res.status(404).json({ status: 'error', message: 'Absence introuvable', data: null });
    db.get('absences').find({ id }).assign({ statut: 'validee', updatedAt: new Date().toISOString() }).write();
    const row = db.get('absences').find({ id }).value();
    return res.json({ status: 'success', message: 'Absence validée', data: row });
  });

  // Close (clôturer) an absence (set statut = 'cloture')
  server.patch('/absences/:id/close', (req, res) => {
    const id = isNaN(+req.params.id) ? req.params.id : +req.params.id;
    const exists = db.get('absences').find({ id }).value();
    if (!exists) return res.status(404).json({ status: 'error', message: 'Absence introuvable', data: null });
    db.get('absences').find({ id }).assign({ statut: 'cloture', updatedAt: new Date().toISOString() }).write();
    const row = db.get('absences').find({ id }).value();
    return res.json({ status: 'success', message: 'Absence clôturée', data: row });
  });
};
