module.exports = function registerSettingsPostesRoutes(server, db) {
  // =====================================================
  // Helper : enrich poste with metier + emploi (via metier)
  // =====================================================
function enrichPoste(poste) {
  const metier = poste.metier_id
    ? db
        .get('settingsMetiers')
        .value()
        ?.find((m) => String(m.id) === String(poste.metier_id))
    : null;

  const emploi =
    metier && metier.emploi_id
      ? db
          .get('settingsEmplois')
          .value()
          ?.find((e) => String(e.id) === String(metier.emploi_id))
      : null;

  // ⛔ retirer metier_id de l'objet retourné
  const { metier_id, ...posteSansMetierId } = poste;

  return {
    ...posteSansMetierId,

    // 🔹 objet métier
    metier: metier
      ? {
          id: metier.id,
          code: metier.code,
          libelle: metier.libelle
        }
      : null,

    // 🔹 objet emploi
    emploi: emploi
      ? {
          id: emploi.id,
          code: emploi.code,
          libelle: emploi.libelle
        }
      : null
  };
}


  // =========================
  // LIST
  // =========================
  server.get('/settings/postes', (req, res) => {
    const rows = db.get('settingsPostes').value() || [];
    const enriched = rows.map(enrichPoste);

    return res.json({
      status: 'success',
      message: 'Récupération réussie',
      data: enriched
    });
  });

  // =========================
  // SHOW BY ID
  // =========================
  server.get('/settings/postes/:id', (req, res) => {
    const id = isNaN(+req.params.id) ? req.params.id : +req.params.id;

    const row = (db.get('settingsPostes').value() || []).find(
      (r) => String(r.id) === String(id)
    );

    if (!row) {
      return res.status(404).json({
        status: 'error',
        message: 'Introuvable',
        data: null
      });
    }

  return res.json(enrichPoste(row));

  });

  // =========================
  // CREATE
  // =========================
  server.post('/settings/postes', (req, res) => {
    const payload = req.body || {};
    const code = String(payload.code || '').trim();
    const libelle = String(payload.libelle || '').trim();
    const metier_id = payload.metier_id;

    if (!code || !libelle || !metier_id) {
      return res.status(400).json({
        status: 'error',
        message: 'Code, libellé et métier requis',
        data: null
      });
    }

    // 🔒 code unique
    const existsCode = (db.get('settingsPostes').value() || []).some(
      (r) => String(r.code).toLowerCase() === code.toLowerCase()
    );

    if (existsCode) {
      return res.status(409).json({
        status: 'error',
        message: 'Code déjà existant',
        data: null
      });
    }

    // 🔒 métier doit exister
    const metierExists = db
      .get('settingsMetiers')
      .value()
      ?.some((m) => String(m.id) === String(metier_id));

    if (!metierExists) {
      return res.status(400).json({
        status: 'error',
        message: 'Métier inconnu',
        data: null
      });
    }

    const row = {
      id: payload.id || Date.now(),
      code,
      libelle,
      metier_id,
      is_active: payload.is_active !== false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    db.get('settingsPostes').push(row).write();

    return res.status(201).json({
      status: 'success',
      message: 'Création réussie',
      data: enrichPoste(row)
    });
  });

  // =========================
  // UPDATE
  // =========================
  server.put('/settings/postes/:id', (req, res) => {
    const id = isNaN(+req.params.id) ? req.params.id : +req.params.id;
    const exists = db.get('settingsPostes').find({ id }).value();

    if (!exists) {
      return res.status(404).json({
        status: 'error',
        message: 'Introuvable',
        data: null
      });
    }

    // 🔒 si changement de métier → vérifier existence
    if (req.body.metier_id) {
      const metierExists = db
        .get('settingsMetiers')
        .value()
        ?.some((m) => String(m.id) === String(req.body.metier_id));

      if (!metierExists) {
        return res.status(400).json({
          status: 'error',
          message: 'Métier inconnu',
          data: null
        });
      }
    }

    const next = {
      ...exists,
      ...req.body,
      id,
      updated_at: new Date().toISOString()
    };

    db.get('settingsPostes').find({ id }).assign(next).write();

    const updated = db.get('settingsPostes').find({ id }).value();

    return res.json({
      status: 'success',
      message: 'Mise à jour réussie',
      data: enrichPoste(updated)
    });
  });

  // =========================
  // DELETE
  // =========================
  server.delete('/settings/postes/:id', (req, res) => {
    const id = isNaN(+req.params.id) ? req.params.id : +req.params.id;

    const exists = db.get('settingsPostes').find({ id }).value();
    if (!exists) {
      return res.status(404).json({
        status: 'error',
        message: 'Introuvable',
        data: null
      });
    }

    db.get('settingsPostes').remove({ id }).write();

    return res.json({
      status: 'success',
      message: 'Suppression réussie',
      data: { id }
    });
  });

  // =========================
  // ACTIVATE
  // =========================
  server.patch('/settings/postes/:id/activate', (req, res) => {
    const id = isNaN(+req.params.id) ? req.params.id : +req.params.id;

    db.get('settingsPostes')
      .find({ id })
      .assign({ is_active: true, updated_at: new Date().toISOString() })
      .write();

    const updated = db.get('settingsPostes').find({ id }).value();

    return res.json({
      status: 'success',
      message: 'Activation réussie',
      data: enrichPoste(updated)
    });
  });

  // =========================
  // DEACTIVATE
  // =========================
  server.patch('/settings/postes/:id/deactivate', (req, res) => {
    const id = isNaN(+req.params.id) ? req.params.id : +req.params.id;

    db.get('settingsPostes')
      .find({ id })
      .assign({ is_active: false, updated_at: new Date().toISOString() })
      .write();

    const updated = db.get('settingsPostes').find({ id }).value();

    return res.json({
      status: 'success',
      message: 'Désactivation réussie',
      data: enrichPoste(updated)
    });
  });
};
