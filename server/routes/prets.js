const express = require('express');
const router = express.Router();

module.exports = function registerPretsRoutes(server, db) {
  // Helpers
  function enrichEmployee(record) {
    const employeesById = Object.fromEntries(
      (db.get('hrEmployees').value() || []).map((e) => [String(e.id), e])
    );
    const emp = employeesById[String(record.employe_id)] || null;
    const employee = emp
      ? {
          matricule: emp.matricule,
          fullName: `${emp.firstName || ''} ${emp.lastName || ''}`.trim()
        }
      : null;
    return { ...record, employee };
  }

  function enrichUsers(record) {
    const usersById = Object.fromEntries(
      (db.get('users').value() || []).map((u) => [String(u.id), u])
    );
    const creerParUser = record.creer_par
      ? usersById[String(record.creer_par)]
      : null;
    const valideParUser = record.valide_par
      ? usersById[String(record.valide_par)]
      : null;
    return {
      ...record,
      creer_par_user: creerParUser
        ? { id: creerParUser.id, fullName: creerParUser.full_name || '' }
        : null,
      valide_par_user: valideParUser
        ? { id: valideParUser.id, fullName: valideParUser.full_name || '' }
        : null
    };
  }

  function computeMensualite(montant, duree, taux) {
    const M = Number(montant) || 0;
    const n = Number(duree) || 1;
    const t = Number(taux) || 0; // annual percent, e.g., 6 => 6%
    if (M <= 0 || n <= 0) return 0;
    const monthlyRate = t > 0 ? t / 100 / 12 : 0;
    if (monthlyRate === 0) return Math.round(M / n);
    // annuity formula: A = M * r / (1 - (1+r)^-n)
    const r = monthlyRate;
    const a = M * (r / (1 - Math.pow(1 + r, -n)));
    return Math.round(a);
  }

  // LIST
  server.get('/prets', (req, res) => {
    const start = parseInt(req.query.start || '0', 10);
    const length = parseInt(req.query.length || '10', 10);
    const sortBy = req.query.sortBy;
    const sortDir = req.query.sortDir === 'desc' ? 'desc' : 'asc';
    let all = db.get('prets').value() || [];

    // Filtering by query params (simple contains)
    const excludedKeys = new Set(['start', 'length', 'sortBy', 'sortDir']);
    Object.entries(req.query).forEach(([key, value]) => {
      if (excludedKeys.has(key) || value === undefined || value === '') return;
      all = all.filter((pret) => {
        const fieldVal = pret[key];
        if (fieldVal === undefined || fieldVal === null) return false;
        return String(fieldVal).toLowerCase().includes(String(value).toLowerCase());
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

    const recordsTotal = db.get('prets').value()?.length || 0;
    const enriched = all.map((p) => enrichEmployee(p));
    const sliced = enriched.slice(start, start + length);

    return res.json({
      status: 'success',
      message: 'Liste des prêts récupérée avec succès',
      data: sliced,
      recordsTotal,
      recordsFiltered
    });
  });

  // SHOW
  server.get('/prets/:id', (req, res) => {
    const pret = db.get('prets').find({ id: parseInt(req.params.id) }).value();
    if (!pret) {
      return res.status(404).json({ status: 'error', message: 'Prêt non trouvé' });
    }
    const enriched = enrichUsers(enrichEmployee(pret));
    return res.json({ status: 'success', data: enriched });
  });

  // CREATE
  server.post('/prets', (req, res) => {
    const nowIso = new Date().toISOString();
    const body = req.body || {};
    const mensualite = body.montant_mensualite && Number(body.montant_mensualite) > 0
      ? Number(body.montant_mensualite)
      : computeMensualite(body.montant_pret, body.duree_mois, body.taux_interet);
    const newPret = {
      ...body,
      id: Date.now(),
      statut: 'En attente',
      montant_mensualite: mensualite,
      montant_rembourse: body.montant_rembourse ?? 0,
      montant_restant: body.montant_restant ?? Math.max(0, Number(body.montant_pret || 0) - Number(body.montant_rembourse || 0)),
      created_at: nowIso,
      updated_at: nowIso
    };
    db.get('prets').push(newPret).write();
    return res.status(201).json({ status: 'success', data: newPret });
  });

  // UPDATE
  server.put('/prets/:id', (req, res) => {
    const pret = db.get('prets').find({ id: parseInt(req.params.id) }).value();
    if (!pret) {
      return res.status(404).json({ status: 'error', message: 'Prêt non trouvé' });
    }
    const body = req.body || {};
    const updated = {
      ...pret,
      ...body,
      // Recompute mensualité if needed
      montant_mensualite:
        body.montant_mensualite !== undefined
          ? Number(body.montant_mensualite)
          : computeMensualite(body.montant_pret ?? pret.montant_pret, body.duree_mois ?? pret.duree_mois, body.taux_interet ?? pret.taux_interet),
      updated_at: new Date().toISOString()
    };
    db.get('prets').find({ id: parseInt(req.params.id) }).assign(updated).write();
    return res.json({ status: 'success', data: updated });
  });

  // DELETE
  server.delete('/prets/:id', (req, res) => {
    const pret = db.get('prets').find({ id: parseInt(req.params.id) }).value();
    if (!pret) {
      return res.status(404).json({ status: 'error', message: 'Prêt non trouvé' });
    }
    db.get('prets').remove({ id: parseInt(req.params.id) }).write();
    return res.status(204).end();
  });

  // ACTIONS
  server.post('/prets/:id/valider', (req, res) => {
    const pret = db.get('prets').find({ id: parseInt(req.params.id) }).value();
    if (!pret) return res.status(404).json({ status: 'error', message: 'Prêt non trouvé' });
    db.get('prets')
      .find({ id: parseInt(req.params.id) })
      .assign({
        statut: 'Validé',
        valide_par: req.body?.valide_par || 'system',
        date_validation: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .write();
    return res.json({ status: 'success', message: 'Prêt validé' });
  });

  server.post('/prets/:id/refuse', (req, res) => {
    const pret = db.get('prets').find({ id: parseInt(req.params.id) }).value();
    if (!pret) return res.status(404).json({ status: 'error', message: 'Prêt non trouvé' });
    db.get('prets')
      .find({ id: parseInt(req.params.id) })
      .assign({
        statut: 'Refusé',
        motif_refus: req.body?.motif_refus || '',
        updated_at: new Date().toISOString(),
        valide_par: req.body?.valide_par || 'system',
        date_validation: new Date().toISOString()
      })
      .write();
    return res.json({ status: 'success', message: 'Prêt refusé' });
  });

  server.post('/prets/:id/demarrer', (req, res) => {
    const pret = db.get('prets').find({ id: parseInt(req.params.id) }).value();
    if (!pret) return res.status(404).json({ status: 'error', message: 'Prêt non trouvé' });
    const startDate = req.body?.date_debut_remboursement || pret.date_debut_remboursement || new Date().toISOString().slice(0, 10);
    // Compute date_fin_prevue by adding duree_mois months (approximate)
    const dateStart = new Date(startDate);
    const endDate = new Date(dateStart);
    const months = Number(pret.duree_mois || 0);
    endDate.setMonth(endDate.getMonth() + months);
    const endIso = endDate.toISOString().slice(0, 10);
    db.get('prets')
      .find({ id: parseInt(req.params.id) })
      .assign({
        statut: 'En cours',
        date_debut_remboursement: startDate,
        date_fin_prevue: endIso,
        updated_at: new Date().toISOString()
      })
      .write();
    return res.json({ status: 'success', message: 'Remboursement démarré' });
  });

  server.post('/prets/:id/solde', (req, res) => {
    const pret = db.get('prets').find({ id: parseInt(req.params.id) }).value();
    if (!pret) return res.status(404).json({ status: 'error', message: 'Prêt non trouvé' });
    const montant_pret = Number(pret.montant_pret || 0);
    const montant_rembourse = Number(pret.montant_rembourse || 0);
    const restant = Math.max(0, montant_pret - montant_rembourse);
    db.get('prets')
      .find({ id: parseInt(req.params.id) })
      .assign({
        statut: 'Soldé',
        montant_rembourse: montant_pret,
        montant_restant: 0,
        updated_at: new Date().toISOString()
      })
      .write();
    return res.json({ status: 'success', message: 'Prêt soldé' });
  });
};
