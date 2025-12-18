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

// Ensure basic collections
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

// Register modular routes
require('./server/routes/auth')(server, db);
require('./server/routes/employees')(server, db);
require('./server/routes/contracts')(server, db);
require('./server/routes/avenants')(server, db);
require('./server/routes/siegesGroups')(server, db);
require('./server/routes/departments')(server, db);
require('./server/routes/absences')(server, db);
require('./server/routes/conges')(server, db);
require('./server/routes/generic')(server, db, data);

server.use(router);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Mock JSON Server running at http://localhost:${PORT}`);
  console.log(
    'Available endpoints: modular routes plus standard json-server routes'
  );
});
