const jsonServer = require('json-server');
const server = jsonServer.create();
const middlewares = jsonServer.defaults({});
server.use(middlewares);
server.use(jsonServer.bodyParser);

// Load modular data object
const data = require('./db.js');
const router = jsonServer.router(data);
const db = router.db;

// Add router.render for automatic wrapping of resource responses
router.render = (req, res) => {
  const body = res.locals.data;
  let message;
  switch (req.method) {
    case 'GET':
      message = 'Récupération réussie';
      break;
    case 'POST':
      message = 'Création réussie';
      break;
    case 'PUT':
      message = 'Mise à jour réussie';
      break;
    case 'PATCH':
      message = 'Mise à jour partielle réussie';
      break;
    case 'DELETE':
      message = 'Suppression réussie';
      break;
    default:
      message = 'Opération réussie';
  }
  res.json({ status: 'success', message, data: body });
};

// Ensure a users collection exists with a default user
if (!db.get('users').value()) {
  db.set('users', [
    {
      id: 1,
      email: 'admin@example.com',
      password: 'password',
      name: 'Admin User',
      full_name: 'Admin User',
      roles: [
        { id: 1, name: 'Admin', code: 'ADMIN', description: 'Administrator' }
      ]
    }
  ]).write();
}

if (!db.get('sessions').value()) {
  db.set('sessions', []).write();
}

function createToken() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

server.post('/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password required' });
  }

  const user = db.get('users').find({ email, password }).value();

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const access_token = createToken();
  const refresh_token = createToken();

  // store session
  db.get('sessions')
    .push({
      id: Date.now(),
      access_token,
      refresh_token,
      userId: user.id,
      expiresAt: Date.now() + 30 * 60 * 1000
    })
    .write();

  return res.json({
    status: 'success',
    message: 'Connexion réussie',
    data: {
      access_token,
      refresh_token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        roles: user.roles
      },
      role: {
        id: 1,
        name: 'Admin',
        code: 'ADMIN',
        description: 'Administrator'
      },
      full_name: user.full_name
    }
  });
});

server.post('/refresh', (req, res) => {
  const { refresh_token } = req.body || {};
  if (!refresh_token)
    return res.status(400).json({ message: 'refresh_token required' });

  const session = db.get('sessions').find({ refresh_token }).value();
  if (!session)
    return res.status(401).json({ message: 'Invalid refresh token' });

  const access_token = createToken();
  const new_refresh = createToken();

  db.get('sessions')
    .find({ refresh_token })
    .assign({ access_token, refresh_token: new_refresh, updatedAt: Date.now() })
    .write();

  return res.json({
    status: 'success',
    message: 'Jeton rafraîchi',
    data: { access_token, refresh_token: new_refresh }
  });
});

server.get('/me', (req, res) => {
  const auth = req.headers.authorization || '';
  const token = auth.replace('Bearer ', '').trim();
  if (!token) return res.status(401).json({ message: 'No token provided' });

  const session = db.get('sessions').find({ access_token: token }).value();
  if (!session) return res.status(401).json({ message: 'Invalid token' });

  const user = db.get('users').find({ id: session.userId }).value();
  if (!user) return res.status(404).json({ message: 'User not found' });

  return res.json({
    status: 'success',
    message: 'Profil récupéré',
    data: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        full_name: user.full_name,
        roles: user.roles
      },
      role: user.roles[0]
    }
  });
});

// Custom HR Employees listing with unified response format
server.get('/hrEmployees', (req, res) => {
  console.log('Custom /hrEmployees handler hit');
  const start = parseInt(req.query.start || '0', 10);
  const length = parseInt(req.query.length || '10', 10);
  const sortBy = req.query.sortBy;
  const sortDir = req.query.sortDir === 'desc' ? 'desc' : 'asc';

  let all = db.get('hrEmployees').value() || [];

  // Apply filters from query (excluding pagination/sort params)
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

  // Sorting
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

// Custom delete endpoint to standardize response
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

// Simple list for employees (id, firstName, lastName, matricule)
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

// Custom Contracts listing with unified response format
server.get('/contracts', (req, res) => {
  console.log('Custom /contracts handler hit');
  const start = parseInt(req.query.start || '0', 10);
  const length = parseInt(req.query.length || '10', 10);
  const sortBy = req.query.sortBy;
  const sortDir = req.query.sortDir === 'desc' ? 'desc' : 'asc';

  let all = db.get('contracts').value() || [];

  // Enrich with employee data
  const hrEmployees = db.get('hrEmployees').value() || [];
  all = all.map((contract) => {
    // Support both employee_id and employe_id
    const empId = contract.employee_id || contract.employe_id;
    const employee = hrEmployees.find((emp) => emp.id === empId);

    return {
      ...contract,
      // Ensure employee_name is present (from contract or from employee lookup)
      employee_name:
        contract.employee_name ||
        (employee ? `${employee.firstName} ${employee.lastName}` : 'N/A'),
      employee_matricule: contract.employee_matricule || employee?.matricule,
      employee: employee
        ? {
            id: employee.id,
            firstName: employee.firstName,
            lastName: employee.lastName,
            matricule: employee.matricule,
            email: employee.email
          }
        : null
    };
  });

  // Apply filters from query (excluding pagination/sort params)
  const excludedKeys = new Set(['start', 'length', 'sortBy', 'sortDir']);
  Object.entries(req.query).forEach(([key, value]) => {
    if (excludedKeys.has(key) || value === undefined || value === '') return;
    all = all.filter((contract) => {
      const fieldVal = contract[key];
      if (fieldVal === undefined || fieldVal === null) return false;
      return String(fieldVal)
        .toLowerCase()
        .includes(String(value).toLowerCase());
    });
  });

  const recordsFiltered = all.length;

  // Sorting
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

  const recordsTotal = db.get('contracts').value()?.length || 0;
  const sliced = all
    .slice(start, start + length)
    .map((row) => ({ ...row, actions: 1 }));

  return res.json({
    status: 'success',
    message: 'Liste des contrats récupérée avec succès',
    data: sliced,
    recordsTotal,
    recordsFiltered
  });
});

// Contract details with employee enrichment
server.get('/contracts/:id', (req, res) => {
  const id = req.params.id;
  // Support both string and numeric IDs
  const contract = db
    .get('contracts')
    .find((c) => c.id == id || c.id === id)
    .value();

  if (!contract) {
    return res
      .status(404)
      .json({ status: 'error', message: 'Contrat introuvable' });
  }

  const hrEmployees = db.get('hrEmployees').value() || [];
  // Support both employee_id and employe_id
  const empId = contract.employee_id || contract.employe_id;
  const employee = hrEmployees.find((emp) => emp.id === empId);

  const enriched = {
    ...contract,
    // Ensure employee_name is present
    employee_name:
      contract.employee_name ||
      (employee ? `${employee.firstName} ${employee.lastName}` : 'N/A'),
    employee_matricule: contract.employee_matricule || employee?.matricule,
    employee: employee
      ? {
          id: employee.id,
          firstName: employee.firstName,
          lastName: employee.lastName,
          matricule: employee.matricule,
          email: employee.email,
          departmentId: employee.departmentId,
          position: employee.position
        }
      : null
  };

  return res.json({
    status: 'success',
    message: 'Contrat récupéré avec succès',
    data: enriched
  });
});

// Validate contract (POST endpoint)
server.post('/contracts/:id/validate', (req, res) => {
  const id = req.params.id;
  const contract = db
    .get('contracts')
    .find((c) => c.id == id || c.id === id)
    .value();

  if (!contract) {
    return res
      .status(404)
      .json({ status: 'error', message: 'Contrat introuvable' });
  }

  // Support both 'statut' and 'status' fields
  const currentStatus = contract.status || contract.statut;
  if (currentStatus !== 'Brouillon') {
    return res.status(400).json({
      status: 'error',
      message: 'Seuls les contrats en brouillon peuvent être validés'
    });
  }

  // Update both status and statut for compatibility
  const updates = {
    status: 'Actif',
    statut: 'Actif',
    updated_at: new Date().toISOString()
  };

  if (contract.historique) {
    updates['historique.updated_at'] = new Date().toISOString();
  }

  db.get('contracts')
    .find((c) => c.id == id || c.id === id)
    .assign(updates)
    .write();
  return res.json({
    status: 'success',
    message: 'Contrat validé avec succès',
    data: db
      .get('contracts')
      .find((c) => c.id == id || c.id === id)
      .value()
  });
});

// Generate PDF (mock)
server.post('/contracts/:id/generate', (req, res) => {
  const id = req.params.id;
  const contract = db
    .get('contracts')
    .find((c) => c.id == id || c.id === id)
    .value();

  if (!contract) {
    return res
      .status(404)
      .json({ status: 'error', message: 'Contrat introuvable' });
  }

  return res.json({
    status: 'success',
    message: 'PDF généré avec succès',
    data: { url: `/generated/contract-${id}.pdf` }
  });
});

// Custom delete endpoint for contracts
server.delete('/contracts/:id', (req, res) => {
  const id = req.params.id;
  const exists = db
    .get('contracts')
    .find((c) => c.id == id || c.id === id)
    .value();

  if (!exists) {
    return res
      .status(404)
      .json({ status: 'error', message: 'Contrat introuvable' });
  }

  // Support both 'statut' and 'status' fields
  const currentStatus = exists.status || exists.statut;
  if (currentStatus !== 'Brouillon') {
    return res.status(400).json({
      status: 'error',
      message: 'Seuls les contrats en brouillon peuvent être supprimés'
    });
  }

  db.get('contracts')
    .remove((c) => c.id == id || c.id === id)
    .write();
  return res.json({ status: 'success', message: `Contrat #${id} supprimé` });
});

// Upload signed contract file (mock)
server.post('/contracts/:id/upload-signed', (req, res) => {
  const id = req.params.id;
  const contract = db
    .get('contracts')
    .find((c) => c.id == id || c.id === id)
    .value();

  if (!contract) {
    return res
      .status(404)
      .json({ status: 'error', message: 'Contrat introuvable' });
  }

  const { fileUrl, fileName } = req.body || {};
  const signedDoc = {
    url: fileUrl || `/uploads/contracts/${id}/signed.pdf`,
    name: fileName || `contrat-signe-${id}.pdf`,
    uploaded_at: new Date().toISOString()
  };

  db.get('contracts')
    .find((c) => c.id == id || c.id === id)
    .assign({ signed_document: signedDoc, status: 'Actif', statut: 'Actif' })
    .write();

  return res.json({
    status: 'success',
    message: 'Contrat signé téléversé avec succès',
    data: db.get('contracts').find((c) => c.id == id || c.id === id).value()
  });
});

// Cancel contract (mock)
server.post('/contracts/:id/cancel', (req, res) => {
  const id = req.params.id;
  const contract = db
    .get('contracts')
    .find((c) => c.id == id || c.id === id)
    .value();

  if (!contract) {
    return res
      .status(404)
      .json({ status: 'error', message: 'Contrat introuvable' });
  }

  const reason = req.body?.reason || 'Annulation via mock';
  const updates = {
    status: 'Annulé',
    statut: 'Annulé',
    cancelled_at: new Date().toISOString(),
    cancellation_reason: reason
  };

  db.get('contracts')
    .find((c) => c.id == id || c.id === id)
    .assign(updates)
    .write();

  return res.json({
    status: 'success',
    message: 'Contrat annulé avec succès',
    data: db.get('contracts').find((c) => c.id == id || c.id === id).value()
  });
});

// Explicit userMedia route (safety if not initialized yet)
server.get('/userMedia', (req, res) => {
  const rows = db.get('userMedia').value() || [];
  return res.json({
    status: 'success',
    message: 'Récupération réussie',
    data: rows
  });
});

// Simple list for departments (id, name)
server.get('/departments/simple-list', (req, res) => {
  const all = db.get('departments').value() || [];
  const simple = all.map((d) => ({
    id: d.id || String(d.id),
    name: d.name || d.label || d.title
  }));
  return res.json({ status: 'success', data: simple });
});

// Generic CRUD envelope endpoints for each top-level collection
const collections = Object.keys(data).filter((k) => Array.isArray(data[k]));
collections.forEach((col) => {
  // List
  server.get(`/${col}`, (req, res) => {
    const rows = db.get(col).value();
    res.json({
      status: 'success',
      message: 'Récupération réussie',
      data: rows
    });
  });
  // Item
  server.get(`/${col}/:id`, (req, res) => {
    const id = isNaN(+req.params.id) ? req.params.id : +req.params.id;
    const row = db.get(col).find({ id }).value();
    if (!row)
      return res
        .status(404)
        .json({ status: 'error', message: 'Introuvable', data: null });
    res.json({ status: 'success', message: 'Récupération réussie', data: row });
  });
  // Create
  server.post(`/${col}`, (req, res) => {
    const payload = req.body;
    if (!payload.id) payload.id = Date.now();
    db.get(col).push(payload).write();
    res
      .status(201)
      .json({ status: 'success', message: 'Création réussie', data: payload });
  });
  // Replace
  server.put(`/${col}/:id`, (req, res) => {
    const id = isNaN(+req.params.id) ? req.params.id : +req.params.id;
    const exists = db.get(col).find({ id }).value();
    if (!exists)
      return res
        .status(404)
        .json({ status: 'error', message: 'Introuvable', data: null });
    db.get(col).find({ id }).assign(req.body).write();
    res.json({
      status: 'success',
      message: 'Mise à jour réussie',
      data: db.get(col).find({ id }).value()
    });
  });
  // Patch
  server.patch(`/${col}/:id`, (req, res) => {
    const id = isNaN(+req.params.id) ? req.params.id : +req.params.id;
    const exists = db.get(col).find({ id }).value();
    if (!exists)
      return res
        .status(404)
        .json({ status: 'error', message: 'Introuvable', data: null });
    db.get(col).find({ id }).assign(req.body).write();
    res.json({
      status: 'success',
      message: 'Mise à jour partielle réussie',
      data: db.get(col).find({ id }).value()
    });
  });
  // Delete
  server.delete(`/${col}/:id`, (req, res) => {
    const id = isNaN(+req.params.id) ? req.params.id : +req.params.id;
    const exists = db.get(col).find({ id }).value();
    if (!exists)
      return res
        .status(404)
        .json({ status: 'error', message: 'Introuvable', data: null });
    const removed = db.get(col).remove({ id }).write();
    res.json({
      status: 'success',
      message: 'Suppression réussie',
      data: removed
    });
  });
});

// Avenants endpoints
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

// Generate avenant PDF
server.post('/avenants/:id/generate-pdf', (req, res) => {
  const id = req.params.id;
  const avenant = (db.avenants || []).find((a) => String(a.id) === String(id));

  if (!avenant) {
    return res.status(404).json({ message: 'Avenant not found' });
  }

  // Mock PDF generation - return success with document URL
  const documentUrl = `/uploads/avenants/${id}/generated.pdf`;

  // Update avenant with document URL
  const idx = (db.avenants || []).findIndex((a) => String(a.id) === String(id));
  if (idx !== -1) {
    db.avenants[idx].document_url = documentUrl;
  }

  res.json({
    success: true,
    document_url: documentUrl,
    message: 'PDF generated successfully'
  });
});

// Upload signed avenant document
server.post('/avenants/:id/upload-signed', (req, res) => {
  const id = req.params.id;
  const { fileUrl, fileName } = req.body;

  const avenant = (db.avenants || []).find((a) => String(a.id) === String(id));

  if (!avenant) {
    return res.status(404).json({ message: 'Avenant not found' });
  }

  // Update avenant with signed document
  const idx = (db.avenants || []).findIndex((a) => String(a.id) === String(id));
  if (idx !== -1) {
    db.avenants[idx].signed_document = {
      url: fileUrl,
      name: fileName,
      uploaded_at: new Date().toISOString()
    };
  }

  res.json({
    success: true,
    signed_document: db.avenants[idx].signed_document
  });
});

// Let json-server handle other routes (CRUD on resources defined in db.json)
server.use(router);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Mock JSON Server running at http://localhost:${PORT}`);
  console.log(
    'Available endpoints: POST /login, POST /refresh, GET /me, plus standard json-server routes'
  );
});
