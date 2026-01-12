const { ContractTypes } = require('../../utils/contract-types');

module.exports = function registerSettingsEmploisRoutes(server, db) {
  const isValidContractType = (t) => {
    if (!t) return false;
    const s = String(t);
    const allowed = (ContractTypes && Array.isArray(ContractTypes)) ? ContractTypes : [
      'CDI','CDD','CDD_Saisonnier','CDD_Temporaire','ANAPEC','SIVP','TAHIL','Apprentissage','Stage_PFE','Stage_Initiation','Interim','Teletravail','Freelance','Consultance'
    ];
    return allowed.includes(s);
  };

  // List
  server.get('/settings/emplois', (req, res) => {
    const rows = db.get('settingsEmplois').value() || [];
    return res.json({ status: 'success', message: 'Récupération réussie', data: rows });
  });

  // Show
  server.get('/settings/emplois/:id', (req, res) => {
    const id = isNaN(+req.params.id) ? req.params.id : +req.params.id;
    const row = (db.get('settingsEmplois').value() || []).find((r) => String(r.id) === String(id));
    if (!row) return res.status(404).json({ status: 'error', message: 'Introuvable', data: null });
    return res.json({ status: 'success', message: 'Récupération réussie', data: row });
  });

  // Create
  server.post('/settings/emplois', (req, res) => {
    const payload = req.body || {};
    const code = String(payload.code || '').trim();
    const libelle = String(payload.libelle || '').trim();
    const type_contrat = String(payload.type_contrat || '').trim();
    if (!code || !libelle || !type_contrat)
      return res.status(400).json({ status: 'error', message: 'Code, libellé et type de contrat requis', data: null });

    if (!isValidContractType(type_contrat))
      return res.status(400).json({ status: 'error', message: 'Type de contrat invalide', data: null });

    const existsCode = (db.get('settingsEmplois').value() || []).some((r) => String(r.code).toLowerCase() === code.toLowerCase());
    if (existsCode) return res.status(409).json({ status: 'error', message: 'Code déjà existant', data: null });

    const row = {
      id: payload.id || Date.now(),
      code,
      libelle,
      type_contrat,
      is_active: payload.is_active !== false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    db.get('settingsEmplois').push(row).write();
    return res.status(201).json({ status: 'success', message: 'Création réussie', data: row });
  });

  // Update
  server.put('/settings/emplois/:id', (req, res) => {
    const id = isNaN(+req.params.id) ? req.params.id : +req.params.id;
    const exists = db.get('settingsEmplois').find({ id }).value();
    if (!exists) return res.status(404).json({ status: 'error', message: 'Introuvable', data: null });
    const next = { ...exists, ...req.body, id, updated_at: new Date().toISOString() };
    if (next.type_contrat && !isValidContractType(next.type_contrat))
      return res.status(400).json({ status: 'error', message: 'Type de contrat invalide', data: null });
    db.get('settingsEmplois').find({ id }).assign(next).write();
    const updated = db.get('settingsEmplois').find({ id }).value();
    return res.json({ status: 'success', message: 'Mise à jour réussie', data: updated });
  });

  // Delete
  server.delete('/settings/emplois/:id', (req, res) => {
    const id = isNaN(+req.params.id) ? req.params.id : +req.params.id;
    const exists = db.get('settingsEmplois').find({ id }).value();
    if (!exists) return res.status(404).json({ status: 'error', message: 'Introuvable', data: null });
    db.get('settingsEmplois').remove({ id }).write();
    return res.json({ status: 'success', message: 'Suppression réussie', data: { id } });
  });

  // Activate
  server.patch('/settings/emplois/:id/activate', (req, res) => {
    const id = isNaN(+req.params.id) ? req.params.id : +req.params.id;
    const exists = db.get('settingsEmplois').find({ id }).value();
    if (!exists) return res.status(404).json({ status: 'error', message: 'Introuvable', data: null });
    db.get('settingsEmplois').find({ id }).assign({ is_active: true, updated_at: new Date().toISOString() }).write();
    const updated = db.get('settingsEmplois').find({ id }).value();
    return res.json({ status: 'success', message: 'Activation réussie', data: updated });
  });

  // Deactivate
  server.patch('/settings/emplois/:id/deactivate', (req, res) => {
    const id = isNaN(+req.params.id) ? req.params.id : +req.params.id;
    const exists = db.get('settingsEmplois').find({ id }).value();
    if (!exists) return res.status(404).json({ status: 'error', message: 'Introuvable', data: null });
    db.get('settingsEmplois').find({ id }).assign({ is_active: false, updated_at: new Date().toISOString() }).write();
    const updated = db.get('settingsEmplois').find({ id }).value();
    return res.json({ status: 'success', message: 'Désactivation réussie', data: updated });
  });
};
