module.exports = function registerDepartmentsRoutes(server, db) {
  server.get('/departments/simple-list', (req, res) => {
    const list = db.get('departments').value() || [];
    const simple = list.map((d) => ({ id: d.id, name: d.name }));
    return res.json({ status: 'success', data: simple });
  });
};
