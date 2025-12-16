module.exports = function registerSiegesGroupsRoutes(server, db) {
  server.get('/sieges', (req, res) => {
    const sieges = db.get('headquarters').value() || [];
    const groups = db.get('groups').value() || [];
    const enriched = sieges.map((s) => ({
      ...s,
      groups: groups
        .filter((g) => g.headquartersId === s.id)
        .map((g) => ({ id: g.id, name: g.name, code: g.code }))
    }));
    return res.json({
      status: 'success',
      message: 'Récupération réussie',
      data: enriched
    });
  });

  server.get('/sieges/:id', (req, res) => {
    const id = req.params.id;
    const siege = db
      .get('headquarters')
      .find((h) => String(h.id) === String(id))
      .value();
    if (!siege)
      return res
        .status(404)
        .json({ status: 'error', message: 'Siège introuvable' });
    const groups =
      db.get('groups').filter({ headquartersId: siege.id }).value() || [];
    const withGroups = { ...siege, groups };
    return res.json({
      status: 'success',
      message: 'Récupération réussie',
      data: withGroups
    });
  });

  server.get('/sieges/:id/groups', (req, res) => {
    const id = req.params.id;
    const siege = db
      .get('headquarters')
      .find((h) => String(h.id) === String(id))
      .value();
    if (!siege)
      return res
        .status(404)
        .json({ status: 'error', message: 'Siège introuvable' });
    const groups =
      db.get('groups').filter({ headquartersId: siege.id }).value() || [];
    return res.json({
      status: 'success',
      message: 'Récupération réussie',
      data: groups
    });
  });

  server.get('/groups', (req, res) => {
    const groups = db.get('groups').value() || [];
    const hqs = db.get('headquarters').value() || [];
    const enriched = groups.map((g) => ({
      ...g,
      headquarters: hqs.find((h) => h.id === g.headquartersId) || null
    }));
    return res.json({
      status: 'success',
      message: 'Récupération réussie',
      data: enriched
    });
  });

  server.get('/groups/:id', (req, res) => {
    const id = req.params.id;
    const g = db
      .get('groups')
      .find((row) => String(row.id) === String(id))
      .value();
    if (!g)
      return res
        .status(404)
        .json({ status: 'error', message: 'Groupe introuvable' });
    const hq =
      db.get('headquarters').find({ id: g.headquartersId }).value() || null;
    return res.json({
      status: 'success',
      message: 'Récupération réussie',
      data: { ...g, headquarters: hq }
    });
  });

  server.get('/groups/:id/members', (req, res) => {
    const id = req.params.id;
    const group = db
      .get('groups')
      .find((row) => String(row.id) === String(id))
      .value();
    if (!group)
      return res
        .status(404)
        .json({ status: 'error', message: 'Groupe introuvable' });

    const members = (db.get('groupMembers').value() || []).filter(
      (m) => String(m.groupId) === String(id)
    );
    const employees = db.get('hrEmployees').value() || [];

    const detailedMembers = members.map((m) => {
      const emp = employees.find((e) => String(e.id) === String(m.employeeId));
      return {
        id: m.id,
        isManager: !!m.isManager,
        employee: emp
          ? {
              id: emp.id,
              firstName: emp.firstName,
              lastName: emp.lastName,
              matricule: emp.matricule,
              email: emp.email,
              departmentId: emp.departmentId,
              position: emp.position
            }
          : null
      };
    });

    const managers = detailedMembers
      .filter((m) => m.isManager)
      .map((m) => m.employee)
      .filter(Boolean);

    return res.json({
      status: 'success',
      message: 'Récupération réussie',
      data: {
        group: {
          id: group.id,
          name: group.name,
          code: group.code,
          headquartersId: group.headquartersId
        },
        members: detailedMembers,
        managers
      }
    });
  });
};
