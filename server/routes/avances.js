const express = require('express');
const router = express.Router();

module.exports = function registerAvancesRoutes(server, db) {
  // GET /avances - DataTable listing
  server.get('/avances', (req, res) => {
    const start = parseInt(req.query.start || '0', 10);
    const length = parseInt(req.query.length || '10', 10);
    const sortBy = req.query.sortBy;
    const sortDir = req.query.sortDir === 'desc' ? 'desc' : 'asc';
    let all = db.get('avances').value() || [];
    // Filtrage
    const excludedKeys = new Set(['start', 'length', 'sortBy', 'sortDir']);
    Object.entries(req.query).forEach(([key, value]) => {
      if (excludedKeys.has(key) || value === undefined || value === '') return;
      all = all.filter((avance) => {
        const fieldVal = avance[key];
        if (fieldVal === undefined || fieldVal === null) return false;
        return String(fieldVal)
          .toLowerCase()
          .includes(String(value).toLowerCase());
      });
    });
    const recordsFiltered = all.length;
    // Tri
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
    const recordsTotal = db.get('avances').value()?.length || 0;
    const employeesById = Object.fromEntries(
      (db.get('hrEmployees').value() || []).map((e) => [String(e.id), e])
    );
    const allWithEmployee = all.map((avance) => {
      const emp = employeesById[String(avance.employe_id)] || null;
      const employee = emp
        ? {
            matricule: emp.matricule,
            fullName: `${emp.firstName || ''} ${emp.lastName || ''}`.trim()
          }
        : null;
      return { ...avance, employee };
    });
    all = allWithEmployee;

    const sliced = all.slice(start, start + length);
    return res.json({
      status: 'success',
      message: 'Liste des avances récupérée avec succès',
      data: sliced,
      recordsTotal,
      recordsFiltered
    });
  });

  // GET /avances/:id - Détail avance
  server.get('/avances/:id', (req, res) => {
    const avance = db
      .get('avances')
      .find({ id: parseInt(req.params.id) })
      .value();
    if (!avance) {
      return res
        .status(404)
        .json({ status: 'error', message: 'Avance non trouvée' });
    }
    // Utiliser la table users pour les infos utilisateur
    const usersById = Object.fromEntries(
      (db.get('users').value() || []).map((u) => [String(u.id), u])
    );
    const creerParUser = avance.creer_par
      ? usersById[String(avance.creer_par)]
      : null;
    const valideParUser = avance.valide_par
      ? usersById[String(avance.valide_par)]
      : null;
    // Enrichir avec infos employé (comme dans le listing)
    const employeesById = Object.fromEntries(
      (db.get('hrEmployees').value() || []).map((e) => [String(e.id), e])
    );
    const emp = employeesById[String(avance.employe_id)] || null;
    const employee = emp
      ? {
          matricule: emp.matricule,
          fullName: `${emp.firstName || ''} ${emp.lastName || ''}`.trim()
        }
      : null;
    return res.json({
      status: 'success',
      data: {
        ...avance,
        employee,
        creer_par_user: creerParUser
          ? {
              id: creerParUser.id,
              fullName: creerParUser.full_name || ''
            }
          : null,
        valide_par_user: valideParUser
          ? {
              id: valideParUser.id,
              fullName: valideParUser.full_name || ''
            }
          : null
      }
    });
  });

  // POST /avances - Soumettre une avance
  server.post('/avances', (req, res) => {
    const body = req.body || {};
    // Validate against max avances per year if available
    try {
      const paramsList = db.get('parametreMaxGeneral').value() || [];
      const cfg =
        Array.isArray(paramsList) && paramsList.length > 0
          ? paramsList[0]
          : null;
      const maxAvances = cfg?.max_avances_par_an;
      if (
        typeof maxAvances === 'number' &&
        body.employe_id &&
        body.date_demande
      ) {
        const year = new Date(body.date_demande).getFullYear();
        const countThisYear = (db.get('avances').value() || []).filter((a) => {
          if (String(a.employe_id) !== String(body.employe_id)) return false;
          const y = a.date_demande
            ? new Date(a.date_demande).getFullYear()
            : null;
          return y === year;
        }).length;
        if (countThisYear >= maxAvances) {
          return res.status(400).json({
            status: 'error',
            message: `Nombre maximum d’avances (${maxAvances}) atteint pour l’année ${year}`,
            data: null
          });
        }
      }
    } catch (_) {}

    const newAvance = {
      ...req.body,
      id: Date.now(),
      // Statut unifié
      statut: 'En_attente',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    db.get('avances').push(newAvance).write();
    return res.status(201).json({ status: 'success', data: newAvance });
  });

  // PUT /avances/:id - Modifier une avance
  server.put('/avances/:id', (req, res) => {
    const avance = db
      .get('avances')
      .find({ id: parseInt(req.params.id) })
      .value();
    if (!avance) {
      return res
        .status(404)
        .json({ status: 'error', message: 'Avance non trouvée' });
    }
    const updatedAvance = {
      ...avance,
      ...req.body,
      updated_at: new Date().toISOString()
    };
    db.get('avances')
      .find({ id: parseInt(req.params.id) })
      .assign(updatedAvance)
      .write();
    return res.json({ status: 'success', data: updatedAvance });
  });

  // DELETE /avances/:id - Supprimer une avance
  server.delete('/avances/:id', (req, res) => {
    const avance = db
      .get('avances')
      .find({ id: parseInt(req.params.id) })
      .value();
    if (!avance) {
      return res
        .status(404)
        .json({ status: 'error', message: 'Avance non trouvée' });
    }
    db.get('avances')
      .remove({ id: parseInt(req.params.id) })
      .write();
    return res.status(204).end();
  });

  // POST /avances/:id/valider - Valider une avance
  server.post('/avances/:id/valider', (req, res) => {
    const avance = db
      .get('avances')
      .find({ id: parseInt(req.params.id) })
      .value();
    if (!avance) {
      return res
        .status(404)
        .json({ status: 'error', message: 'Avance non trouvée' });
    }
    db.get('avances')
      .find({ id: parseInt(req.params.id) })
      .assign({
        // Statut unifié
        statut: 'Valide',
        valide_par: req.body.valide_par || 'system',
        date_validation: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .write();
    return res.json({ status: 'success', message: 'Avance validée' });
  });

  // POST /avances/:id/refuse - Refuser une avance
  server.post('/avances/:id/refuse', (req, res) => {
    const avance = db
      .get('avances')
      .find({ id: parseInt(req.params.id) })
      .value();
    if (!avance) {
      return res
        .status(404)
        .json({ status: 'error', message: 'Avance non trouvée' });
    }
    db.get('avances')
      .find({ id: parseInt(req.params.id) })
      .assign({
        // Statut unifié
        statut: 'Refuse',
        motif_refus: req.body.motif_refus || '',
        valide_par: req.body.valide_par || 'system',
        date_validation: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .write();
    return res.json({ status: 'success', message: 'Avance refusée' });
  });

  // GET /avances/employee/:id/count-current-year
  server.get('/avances/employee/:id/count-current-year', (req, res) => {
    const employeeId = req.params.id;
    const yearParam = new Date().getFullYear();
    const list = db.get('avances').value() || [];
    const count = list.filter((a) => {
      if (String(a.employe_id) !== String(employeeId)) return false;
      const y = a.date_demande ? new Date(a.date_demande).getFullYear() : null;
      return y === yearParam;
    }).length;
    return res.json({
      status: 'success',
      data: { employeeId, year: yearParam, count }
    });
  });
};
