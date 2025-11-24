const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults({});

server.use(middlewares);
server.use(jsonServer.bodyParser);

const db = router.db; // lowdb instance

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
    .push({ id: Date.now(), access_token, refresh_token, userId: user.id, expiresAt: Date.now() + 30 * 60 * 1000 })
    .write();

  return res.json({
    access_token,
    refresh_token,
    user: { id: user.id, name: user.name, email: user.email, roles: user.roles },
    role:  { id: 1, name: 'Admin', code: 'ADMIN', description: 'Administrator' },
    full_name: user.full_name
  });
});

server.post('/refresh', (req, res) => {
  const { refresh_token } = req.body || {};
  if (!refresh_token) return res.status(400).json({ message: 'refresh_token required' });

  const session = db.get('sessions').find({ refresh_token }).value();
  if (!session) return res.status(401).json({ message: 'Invalid refresh token' });

  const access_token = createToken();
  const new_refresh = createToken();

  db.get('sessions').find({ refresh_token }).assign({ access_token, refresh_token: new_refresh, updatedAt: Date.now() }).write();

  return res.json({ access_token, refresh_token: new_refresh });
});

server.get('/me', (req, res) => {
  const auth = req.headers.authorization || '';
  const token = auth.replace('Bearer ', '').trim();
  if (!token) return res.status(401).json({ message: 'No token provided' });

  const session = db.get('sessions').find({ access_token: token }).value();
  if (!session) return res.status(401).json({ message: 'Invalid token' });

  const user = db.get('users').find({ id: session.userId }).value();
  if (!user) return res.status(404).json({ message: 'User not found' });

  return res.json({ user: { id: user.id, name: user.name, email: user.email, full_name: user.full_name, roles: user.roles }, role: user.roles[0] });
});

// Let json-server handle other routes (CRUD on resources defined in db.json)
server.use(router);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Mock JSON Server running at http://localhost:${PORT}`);
  console.log('Available endpoints: POST /login, POST /refresh, GET /me, plus standard json-server routes');
});

