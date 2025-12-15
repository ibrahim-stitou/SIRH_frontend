module.exports = function registerContractRoutes(server, db) {
  server.get('/contracts', (req, res) => {
    const start = parseInt(req.query.start || '0', 10);
    const length = parseInt(req.query.length || '10', 10);
    const sortBy = req.query.sortBy;
    const sortDir = req.query.sortDir === 'desc' ? 'desc' : 'asc';

    let all = db.get('contracts').value() || [];
    const hrEmployees = db.get('hrEmployees').value() || [];
    all = all.map((contract) => {
      const empId = contract.employee_id || contract.employe_id;
      const employee = hrEmployees.find((emp) => emp.id === empId);
      return {
        ...contract,
        employee_name: contract.employee_name || (employee ? `${employee.firstName} ${employee.lastName}` : 'N/A'),
        employee_matricule: contract.employee_matricule || employee?.matricule,
        employee: employee ? { id: employee.id, firstName: employee.firstName, lastName: employee.lastName, matricule: employee.matricule, email: employee.email } : null
      };
    });

    const excludedKeys = new Set(['start', 'length', 'sortBy', 'sortDir']);
    Object.entries(req.query).forEach(([key, value]) => {
      if (excludedKeys.has(key) || value === undefined || value === '') return;
      all = all.filter((contract) => {
        const fieldVal = contract[key];
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

    const recordsTotal = db.get('contracts').value()?.length || 0;
    const sliced = all.slice(start, start + length).map((row) => ({ ...row, actions: 1 }));

    return res.json({ status: 'success', message: 'Liste des contrats récupérée avec succès', data: sliced, recordsTotal, recordsFiltered });
  });

  server.get('/contracts/:id', (req, res) => {
    const id = req.params.id;
    const contract = db.get('contracts').find((c) => String(c.id) === String(id)).value();
    if (!contract) {
      return res.status(404).json({ status: 'error', message: 'Contrat introuvable' });
    }
    const hrEmployees = db.get('hrEmployees').value() || [];
    const empId = contract.employee_id || contract.employe_id;
    const employee = hrEmployees.find((emp) => emp.id === empId);
    const enriched = {
      ...contract,
      employee_name: contract.employee_name || (employee ? `${employee.firstName} ${employee.lastName}` : 'N/A'),
      employee_matricule: contract.employee_matricule || employee?.matricule,
      employee: employee ? { id: employee.id, firstName: employee.firstName, lastName: employee.lastName, matricule: employee.matricule, email: employee.email, departmentId: employee.departmentId, position: employee.position } : null
    };
    return res.json({ status: 'success', message: 'Contrat récupéré avec succès', data: enriched });
  });

  server.post('/contracts/:id/validate', (req, res) => {
    const id = req.params.id;
    const contract = db.get('contracts').find((c) => String(c.id) === String(id)).value();
    if (!contract) {
      return res.status(404).json({ status: 'error', message: 'Contrat introuvable' });
    }
    const currentStatus = contract.status || contract.statut;
    if (currentStatus !== 'Brouillon') {
      return res.status(400).json({ status: 'error', message: 'Seuls les contrats en brouillon peuvent être validés' });
    }
    const updates = { status: 'Actif', statut: 'Actif', updated_at: new Date().toISOString() };
    if (contract.historique) updates['historique.updated_at'] = new Date().toISOString();
    db.get('contracts').find((c) => String(c.id) === String(id)).assign(updates).write();
    return res.json({ status: 'success', message: 'Contrat validé avec succès', data: db.get('contracts').find((c) => String(c.id) === String(id)).value() });
  });

  server.post('/contracts/:id/generate', (req, res) => {
    const id = req.params.id;
    const contract = db.get('contracts').find((c) => String(c.id) === String(id)).value();
    if (!contract) {
      return res.status(404).json({ status: 'error', message: 'Contrat introuvable' });
    }
    return res.json({ status: 'success', message: 'PDF généré avec succès', data: { url: `/generated/contract-${id}.pdf` } });
  });

  server.delete('/contracts/:id', (req, res) => {
    const id = req.params.id;
    const exists = db.get('contracts').find((c) => String(c.id) === String(id)).value();
    if (!exists) {
      return res.status(404).json({ status: 'error', message: 'Contrat introuvable' });
    }
    const currentStatus = exists.status || exists.statut;
    if (currentStatus !== 'Brouillon') {
      return res.status(400).json({ status: 'error', message: 'Seuls les contrats en brouillon peuvent être supprimés' });
    }
    db.get('contracts').remove((c) => String(c.id) === String(id)).write();
    return res.json({ status: 'success', message: `Contrat #${id} supprimé` });
  });

  server.post('/contracts/:id/upload-signed', (req, res) => {
    const id = req.params.id;
    const contract = db.get('contracts').find((c) => String(c.id) === String(id)).value();
    if (!contract) {
      return res.status(404).json({ status: 'error', message: 'Contrat introuvable' });
    }
    const { fileUrl, fileName } = req.body || {};
    const signedDoc = { url: fileUrl || `/uploads/contracts/${id}/signed.pdf`, name: fileName || `contrat-signe-${id}.pdf`, uploaded_at: new Date().toISOString() };
    db.get('contracts').find((c) => String(c.id) === String(id)).assign({ signed_document: signedDoc, status: 'Actif', statut: 'Actif' }).write();
    return res.json({ status: 'success', message: 'Contrat signé téléversé avec succès', data: db.get('contracts').find((c) => String(c.id) === String(id)).value() });
  });

  server.post('/contracts/:id/cancel', (req, res) => {
    const id = req.params.id;
    const contract = db.get('contracts').find((c) => String(c.id) === String(id)).value();
    if (!contract) {
      return res.status(404).json({ status: 'error', message: 'Contrat introuvable' });
    }
    const reason = req.body?.reason || 'Annulation via mock';
    const updates = { status: 'Annulé', statut: 'Annulé', cancelled_at: new Date().toISOString(), cancellation_reason: reason };
    db.get('contracts').find((c) => String(c.id) === String(id)).assign(updates).write();
    return res.json({ status: 'success', message: 'Contrat annulé avec succès', data: db.get('contracts').find((c) => String(c.id) === String(id)).value() });
  });
}

