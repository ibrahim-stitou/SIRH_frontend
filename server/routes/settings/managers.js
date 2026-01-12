module.exports = function registerSettingsManagersRoutes(server, db) {
  // List with enriched names
  server.get('/settings/managers', (req, res) => {
    const rows = db.get('settingsManagers').value() || [];
    const employees = db.get('hrEmployees').value() || [];
    const departments = db.get('departments').value() || [];
    const data = rows.map((r) => {
      const emp = (employees.find((e) => String(e.id) === String(r.employe_id)) || {});
      const dept = (departments.find((d) => String(d.id) === String(r.departement_id)) || {});
      const full = emp.full_name || emp.name || null;
      const first = emp.firstName || emp.prenom || (full ? String(full).trim().split(/\s+/).slice(0, -1).join(' ') : null);
      const last = emp.lastName || emp.nom || (full ? String(full).trim().split(/\s+/).slice(-1)[0] : null);
      const deptName = dept.name || dept.libelle || null;
      return {
        ...r,
        employee_name: full || [first, last].filter(Boolean).join(' ').trim() || null,
        employee_first_name: first || null,
        employee_last_name: last || null,
        departement_name: deptName
      };
    });
    return res.json({ status: 'success', message: 'Récupération réussie', data });
  });

  // Show by ID
  server.get('/settings/managers/:id', (req, res) => {
    const id = isNaN(+req.params.id) ? req.params.id : +req.params.id;
    const row = (db.get('settingsManagers').value() || []).find((r) => String(r.id) === String(id));
    if (!row) return res.status(404).json({ status: 'error', message: 'Introuvable', data: null });
    return res.json({ status: 'success', message: 'Récupération réussie', data: row });
  });

  // Create
  server.post('/settings/managers', (req, res) => {
    const p = req.body || {};
    const employe_id = Number(p.employe_id);
    const departement_id = Number(p.departement_id);
    if (Number.isNaN(employe_id) || Number.isNaN(departement_id))
      return res.status(400).json({ status: 'error', message: 'employe_id et departement_id requis (numériques)', data: null });

    // Optional: ensure referenced entities exist
    const hasEmp = (db.get('hrEmployees').value() || []).some((e) => Number(e.id) === employe_id);
    const hasDept = (db.get('departments').value() || []).some((d) => Number(d.id) === departement_id);
    if (!hasEmp || !hasDept) return res.status(422).json({ status: 'error', message: 'Employé ou département inexistant', data: null });

    const row = {
      id: p.id || Date.now(),
      employe_id,
      departement_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    db.get('settingsManagers').push(row).write();
    return res.status(201).json({ status: 'success', message: 'Création réussie', data: row });
  });

  // Update
  server.put('/settings/managers/:id', (req, res) => {
    const id = isNaN(+req.params.id) ? req.params.id : +req.params.id;
    const exists = db.get('settingsManagers').find({ id }).value();
    if (!exists) return res.status(404).json({ status: 'error', message: 'Introuvable', data: null });
    const next = { ...exists, ...req.body, id, updated_at: new Date().toISOString() };
    if (typeof next.employe_id !== 'undefined') next.employe_id = Number(next.employe_id);
    if (typeof next.departement_id !== 'undefined') next.departement_id = Number(next.departement_id);
    if (Number.isNaN(next.employe_id) || Number.isNaN(next.departement_id))
      return res.status(400).json({ status: 'error', message: 'IDs numériques requis', data: null });
    // Validate refs
    const hasEmp = (db.get('hrEmployees').value() || []).some((e) => Number(e.id) === next.employe_id);
    const hasDept = (db.get('departments').value() || []).some((d) => Number(d.id) === next.departement_id);
    if (!hasEmp || !hasDept) return res.status(422).json({ status: 'error', message: 'Employé ou département inexistant', data: null });
    db.get('settingsManagers').find({ id }).assign(next).write();
    const updated = db.get('settingsManagers').find({ id }).value();
    return res.json({ status: 'success', message: 'Mise à jour réussie', data: updated });
  });

  // Delete
  server.delete('/settings/managers/:id', (req, res) => {
    const id = isNaN(+req.params.id) ? req.params.id : +req.params.id;
    const exists = db.get('settingsManagers').find({ id }).value();
    if (!exists) return res.status(404).json({ status: 'error', message: 'Introuvable', data: null });
    db.get('settingsManagers').remove({ id }).write();
    return res.json({ status: 'success', message: 'Suppression réussie', data: { id } });
  });
};
