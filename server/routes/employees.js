module.exports = function registerEmployeeRoutes(server, db) {
  server.get('/hrEmployees', (req, res) => {
    const start = parseInt(req.query.start || '0', 10);
    const length = parseInt(req.query.length || '10', 10);
    const sortBy = req.query.sortBy;
    const sortDir = req.query.sortDir === 'desc' ? 'desc' : 'asc';

    let all = db.get('hrEmployees').value() || [];

    const excludedKeys = new Set(['start', 'length', 'sortBy', 'sortDir']);
    Object.entries(req.query).forEach(([key, value]) => {
      if (excludedKeys.has(key) || value === undefined || value === '') return;
      all = all.filter((emp) => {
        const fieldVal = emp[key];
        if (fieldVal === undefined || fieldVal === null) return false;
        return String(fieldVal)
          .toLowerCase()
          .includes(String(value).toLowerCase());
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

    const recordsTotal = db.get('hrEmployees').value()?.length || 0;
    const sliced = all
      .slice(start, start + length)
      .map((row) => ({ ...row, actions: 1 }));

    return res.json({
      status: 'success',
      message: 'Liste des employés récupérée avec succès',
      data: sliced,
      recordsTotal,
      recordsFiltered
    });
  });

  server.delete('/hrEmployees/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    const exists = db.get('hrEmployees').find({ id }).value();
    if (!exists) {
      return res
        .status(404)
        .json({ status: 'error', message: 'Employé introuvable' });
    }
    db.get('hrEmployees').remove({ id }).write();
    return res.json({ status: 'success', message: `Employé #${id} supprimé` });
  });

  server.get('/hrEmployees/simple-list', (req, res) => {
    const all = db.get('hrEmployees').value() || [];
    const simple = all.map((e) => ({
      id: e.id,
      firstName: e.firstName,
      lastName: e.lastName,
      matricule: e.matricule
    }));
    return res.json({ status: 'success', data: simple });
  });

  // New: managers simple list
  server.get('/hrEmployees/managers/simple-list', (req, res) => {
    const all = db.get('hrEmployees').value() || [];
    const managers = all.filter((e) => {
      const tags = Array.isArray(e.tags)
        ? e.tags.map((t) => String(t).toLowerCase())
        : [];
      const hasMgmtTag = tags.some(
        (t) => t.includes('management') || t.includes('manager')
      );
      const titles = []
        .concat(e.position || [])
        .concat(e.jobTitle || [])
        .concat(e.notes || [])
        .concat(
          Array.isArray(e.experiences)
            ? e.experiences.map((ex) => ex.title || '')
            : []
        )
        .map((s) => String(s).toLowerCase());
      const hasMgrTitle = titles.some(
        (s) =>
          s.includes('manager') || s.includes('gestion') || s.includes('chef')
      );
      return hasMgmtTag || hasMgrTitle;
    });
    const simple = managers.map((e) => ({
      id: e.id,
      firstName: e.firstName,
      lastName: e.lastName,
      matricule: e.matricule,
      email: e.email
    }));
    return res.json({ status: 'success', data: simple });
  });

  server.get('/hrEmployees/:id/history', (req, res) => {
    const id = parseInt(req.params.id, 10);
    const employee = db.get('hrEmployees').find({ id }).value();
    if (!employee) {
      return res
        .status(404)
        .json({ status: 'error', message: 'Employé introuvable' });
    }
    const history = (db.get('employeeHistory').value() || []).filter(
      (h) => h.employeeId === id
    );
    const sorted = history.sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );
    return res.json({ status: 'success', data: sorted });
  });

  server.get('/movement-types', (req, res) => {
    const types = db.get('movementTypes').value() || [];
    return res.json({ status: 'success', data: types });
  });

  server.post('/hrEmployees/:id/history', (req, res) => {
    const id = parseInt(req.params.id, 10);
    const employee = db.get('hrEmployees').find({ id }).value();
    if (!employee) {
      return res
        .status(404)
        .json({ status: 'error', message: 'Employé introuvable' });
    }
    const body = req.body || {};
    const item = {
      id: `eh-${id}-${Date.now()}`,
      employeeId: id,
      type: body.type || 'custom',
      title: body.title || 'Mouvement',
      description: body.description || null,
      oldValue: body.oldValue || null,
      newValue: body.newValue || null,
      ref: body.ref || null,
      createdAt: body.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const coll = db.get('employeeHistory');
    coll.push(item).write();
    return res.json({ status: 'success', data: item });
  });
};
