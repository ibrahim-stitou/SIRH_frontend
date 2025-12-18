module.expots = function registerCongeRoutes(server, db) {
  // List with optional pagination and sorting
  server.get('/congeCompteurs', (req, res) => {
    const start = parseInt(req.query.start || '0', 10);
    const length = parseInt(req.query.length || '10', 10);
    const sortBy = req.query.sortBy;
    const sortDir = req.query.sortDir === 'desc' ? 'desc' : 'asc';

    let all = db.get('congeCompteurs').value() || [];
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

    const recordsTotal = (db.get('congeCompteurs').value() || []).length;
    const sliced = all.slice(start, start + length);
    return res.json({
      status: 'success',
      message: 'Liste des compteurs de congés récupérée avec succès',
      data: sliced,
      recordsTotal,
      recordsFiltered
    });
  });

  server.get('/congeCompteurs/:id', (req, res) => {
    const id = req.params.id;
    const congeCompteur = db
      .get('congeCompteurs')
      .find({ id: Number(id) })
      .value();
    if (congeCompteur) {
      return res.json({
        status: 'success',
        message: 'Compteur de congés récupéré avec succès',
        data: congeCompteur
      });
    }
    return res.status(404).json({
      status: 'error',
      message: 'Compteur de congés non trouvé'
    });
  });

  server.ger('/congeCompteurs/employee/:employeeId', (req, res) => {
    const employeeId = req.params.employeeId;
    const congeCompteurs = db
      .get('congeCompteurs')
      .filter({ employee_id: Number(employeeId) })
      .value();
    return res.json({
      status: 'success',
      message: "Compteurs de congés de l'employé récupérés avec succès",
      data: congeCompteurs
    });
  });

  server.post('/congeCompteurs', (req, res) => {
    const body = req.body || {};
    const newCompteur = { id: Date.now(), ...body };
    db.get('congeCompteurs').push(newCompteur).write();
    return res.status(201).json({
      status: 'success',
      message: 'Compteur de congés créé avec succès',
      data: newCompteur
    });
  });
};
