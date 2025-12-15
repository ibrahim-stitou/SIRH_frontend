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
        return String(fieldVal).toLowerCase().includes(String(value).toLowerCase());
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
        return sortDir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
      });
    }

    const recordsTotal = db.get('hrEmployees').value()?.length || 0;
    const sliced = all.slice(start, start + length).map((row) => ({ ...row, actions: 1 }));

    return res.json({ status: 'success', message: 'Liste des employés récupérée avec succès', data: sliced, recordsTotal, recordsFiltered });
  });

  server.delete('/hrEmployees/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    const exists = db.get('hrEmployees').find({ id }).value();
    if (!exists) {
      return res.status(404).json({ status: 'error', message: 'Employé introuvable' });
    }
    db.get('hrEmployees').remove({ id }).write();
    return res.json({ status: 'success', message: `Employé #${id} supprimé` });
  });

  server.get('/hrEmployees/simple-list', (req, res) => {
    const all = db.get('hrEmployees').value() || [];
    const simple = all.map((e) => ({ id: e.id, firstName: e.firstName, lastName: e.lastName, matricule: e.matricule }));
    return res.json({ status: 'success', data: simple });
  });
}

