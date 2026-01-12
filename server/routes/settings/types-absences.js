module.exports = function registerSettingsTypesAbsencesRoutes(server, db) {
  // List
  server.get('/settings/types-absences', (req, res) => {
    const rows = db.get('settingsTypesAbsences').value() || [];
    return res.json({ status: 'success', message: 'Récupération réussie', data: rows });
  });

  // Show by ID
  server.get('/settings/types-absences/:id', (req, res) => {
    const id = isNaN(+req.params.id) ? req.params.id : +req.params.id;
    const row = (db.get('settingsTypesAbsences').value() || []).find((r) => String(r.id) === String(id));
    if (!row) return res.status(404).json({ status: 'error', message: 'Introuvable', data: null });
    return res.json({ status: 'success', message: 'Récupération réussie', data: row });
  });

  // Create
  server.post('/settings/types-absences', (req, res) => {
    const p = req.body || {};
    const code = String(p.code || '').trim();
    const libelle = String(p.libelle || '').trim();
    if (!code || !libelle)
      return res.status(400).json({ status: 'error', message: 'Code et libellé requis', data: null });

    const existsCode = (db.get('settingsTypesAbsences').value() || []).some((r) => String(r.code).toLowerCase() === code.toLowerCase());
    if (existsCode) return res.status(409).json({ status: 'error', message: 'Code déjà existant', data: null });

    const row = {
      id: p.id || Date.now(),
      code,
      libelle,
      remunere: !!p.remunere,
      deduit_compteur: !!p.deduit_compteur,
      delai_prevenance_jours: Number(p.delai_prevenance_jours || 0),
      duree_max: Number(p.duree_max || 0),
      acquisition_mensuelle: Number(p.acquisition_mensuelle || 0),
      plafond_annuel: Number(p.plafond_annuel || 0),
      report_possible: !!p.report_possible,
      description: String(p.description || '').trim(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    db.get('settingsTypesAbsences').push(row).write();
    return res.status(201).json({ status: 'success', message: 'Création réussie', data: row });
  });

  // Update
  server.put('/settings/types-absences/:id', (req, res) => {
    const id = isNaN(+req.params.id) ? req.params.id : +req.params.id;
    const exists = db.get('settingsTypesAbsences').find({ id }).value();
    if (!exists) return res.status(404).json({ status: 'error', message: 'Introuvable', data: null });
    const next = { ...exists, ...req.body, id, updated_at: new Date().toISOString() };
    // Normalize booleans and numbers
    next.remunere = !!next.remunere;
    next.deduit_compteur = !!next.deduit_compteur;
    next.delai_prevenance_jours = Number(next.delai_prevenance_jours || 0);
    next.duree_max = Number(next.duree_max || 0);
    next.acquisition_mensuelle = Number(next.acquisition_mensuelle || 0);
    next.plafond_annuel = Number(next.plafond_annuel || 0);
    next.report_possible = !!next.report_possible;
    next.description = String(next.description || '').trim();
    db.get('settingsTypesAbsences').find({ id }).assign(next).write();
    const updated = db.get('settingsTypesAbsences').find({ id }).value();
    return res.json({ status: 'success', message: 'Mise à jour réussie', data: updated });
  });

  // Delete
  server.delete('/settings/types-absences/:id', (req, res) => {
    const id = isNaN(+req.params.id) ? req.params.id : +req.params.id;
    const exists = db.get('settingsTypesAbsences').find({ id }).value();
    if (!exists) return res.status(404).json({ status: 'error', message: 'Introuvable', data: null });
    db.get('settingsTypesAbsences').remove({ id }).write();
    return res.json({ status: 'success', message: 'Suppression réussie', data: { id } });
  });
};
