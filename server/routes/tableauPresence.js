module.exports = function registerTableauPresenceRoutes(server, db) {
  // Liste des tableaux de présence
  server.get('/tableau-presence', (req, res) => {
    const list = db.get('tableauPresence').value() || [];
    return res.status(200).json({ status: 'success', data: list });
  });

  // Détail d'un tableau par ID
  server.get('/tableau-presence/:id', (req, res) => {
    const id = isNaN(+req.params.id) ? req.params.id : +req.params.id;
    const tp = db.get('tableauPresence').find({ id }).value();
    if (!tp)
      return res
        .status(404)
        .json({ status: 'error', message: 'Tableau introuvable', data: null });
    return res.status(200).json({ status: 'success', data: tp });
  });

  // Employés (synthèse) pour un tableau donné
  server.get('/tableau-presence/:id/employees', (req, res) => {
    const id = isNaN(+req.params.id) ? req.params.id : +req.params.id;
    const groupId = req.query.groupId || req.query.group || req.query.groupe;
    let rows = (db.get('tableauPresenceEmployees').value() || []).filter(
      (r) => String(r.tableauPresenceId) === String(id)
    );

    // Optional filter by group membership
    if (groupId) {
      const gm = db.get('groupMembers').value() || [];
      const memberIds = new Set(
        gm
          .filter((m) => String(m.groupId) === String(groupId))
          .map((m) => String(m.employeeId ?? m.employee?.id))
          .filter(Boolean)
      );
      rows = rows.filter((r) => memberIds.has(String(r.employeeId)));
    }

    const hrIndex = Object.fromEntries(
      (db.get('hrEmployees').value() || []).map((e) => [String(e.id), e])
    );

    const enriched = rows.map((r) => {
      const hr = hrIndex[String(r.employeeId)];
      return {
        ...r,
        employee: hr
          ? {
              id: hr.id,
              first_name: hr.firstName,
              last_name: hr.lastName,
              matricule: hr.matricule
            }
          : null
      };
    });

    return res.status(200).json({ status: 'success', data: enriched });
  });

  // Détails journaliers; filtre optionnel par employeeId
  server.get('/tableau-presence/:id/days', (req, res) => {
    const employeeId = req.query.employeeId;
    let days = db.get('tableauPresenceDays').value() || [];
    if (employeeId) {
      days = days.filter((d) => String(d.employeeId) === String(employeeId));
    }
    return res.status(200).json({ status: 'success', data: days });
  });

  // Générer un nouveau tableau (mock)
  server.post('/tableau-presence/generate', (req, res) => {
    const { mois, annee } = req.body || {};
    if (!mois || !annee)
      return res
        .status(400)
        .json({ status: 'error', message: 'Mois et année requis', data: null });

    const id = Number(annee) * 100 + Number(mois);
    const exists = db.get('tableauPresence').find({ id }).value();
    if (exists)
      return res
        .status(400)
        .json({ status: 'error', message: 'Tableau déjà généré', data: null });

    const now = new Date().toISOString();
    const tp = {
      id,
      mois: Number(mois),
      annee: Number(annee),
      statut: 'EN_COURS',
      generatedAt: now,
      generatedBy: 'system',
      locked: false
    };

    db.get('tableauPresence').push(tp).write();
    return res.status(201).json({ status: 'success', data: tp });
  });

  // Import d'un fichier (mock) – crée le tableau s'il n'existe pas
  server.post('/tableau-presence/import', (req, res) => {
    const mois = req.body?.mois || req.query?.mois;
    const annee = req.body?.annee || req.query?.annee;
    if (!mois || !annee) {
      return res.status(400).json({
        status: 'error',
        message: 'Paramètres mois/année requis',
        data: null
      });
    }
    const id = Number(annee) * 100 + Number(mois);
    const now = new Date().toISOString();
    const exists = db.get('tableauPresence').find({ id }).value();
    if (!exists) {
      db.get('tableauPresence')
        .push({
          id,
          mois: Number(mois),
          annee: Number(annee),
          statut: 'EN_COURS',
          generatedAt: now,
          generatedBy: 'import',
          locked: false
        })
        .write();
    } else {
      db.get('tableauPresence')
        .find({ id })
        .assign({ generatedAt: now })
        .write();
    }

    return res.status(200).json({
      status: 'success',
      message: 'Fichier importé (mock)',
      data: { id }
    });
  });

  // Modèle d'export (mock)
  server.get('/tableau-presence/export-model', (req, res) => {
    const lines = [
      'Matricule;Date;Code;Heures',
      'EMP-0001;2025-01-02;P;8',
      'EMP-0002;2025-01-03;HS;10'
    ];
    const csv = lines.join('\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=modele-tableau-presence.csv'
    );
    return res.status(200).send(csv);
  });

  // Valider manager
  server.patch('/tableau-presence/:id/validate-manager', (req, res) => {
    const id = isNaN(+req.params.id) ? req.params.id : +req.params.id;
    const tp = db.get('tableauPresence').find({ id }).value();
    if (!tp)
      return res
        .status(404)
        .json({ status: 'error', message: 'Tableau introuvable', data: null });

    db.get('tableauPresence')
      .find({ id })
      .assign({
        statut: 'VALIDE_MANAGER',
        validatedAt: new Date().toISOString(),
        validatedBy: 'manager'
      })
      .write();

    return res.status(200).json({
      status: 'success',
      message: 'Validé manager',
      data: db.get('tableauPresence').find({ id }).value()
    });
  });

  // Valider RH
  server.patch('/tableau-presence/:id/validate-rh', (req, res) => {
    const id = isNaN(+req.params.id) ? req.params.id : +req.params.id;
    const tp = db.get('tableauPresence').find({ id }).value();
    if (!tp)
      return res
        .status(404)
        .json({ status: 'error', message: 'Tableau introuvable', data: null });

    db.get('tableauPresence')
      .find({ id })
      .assign({
        statut: 'VALIDE_RH',
        validatedAt: new Date().toISOString(),
        validatedBy: 'drh'
      })
      .write();

    return res.status(200).json({
      status: 'success',
      message: 'Validé RH',
      data: db.get('tableauPresence').find({ id }).value()
    });
  });

  // Clôturer
  server.patch('/tableau-presence/:id/close', (req, res) => {
    const id = isNaN(+req.params.id) ? req.params.id : +req.params.id;
    const tp = db.get('tableauPresence').find({ id }).value();
    if (!tp)
      return res
        .status(404)
        .json({ status: 'error', message: 'Tableau introuvable', data: null });

    db.get('tableauPresence')
      .find({ id })
      .assign({ statut: 'CLOTURE', locked: true })
      .write();

    return res.status(200).json({
      status: 'success',
      message: 'Clôturé',
      data: db.get('tableauPresence').find({ id }).value()
    });
  });

  // Supprimer un tableau (autorisé uniquement si BROUILLON ou EN_COURS et non verrouillé)
  server.delete('/tableau-presence/:id', (req, res) => {
    const id = isNaN(+req.params.id) ? req.params.id : +req.params.id;
    const tp = db.get('tableauPresence').find({ id }).value();
    if (!tp)
      return res
        .status(404)
        .json({ status: 'error', message: 'Tableau introuvable', data: null });
    if (tp.locked || (tp.statut !== 'BROUILLON' && tp.statut !== 'EN_COURS')) {
      return res.status(400).json({
        status: 'error',
        message: 'Suppression non autorisée',
        data: null
      });
    }
    db.get('tableauPresence').remove({ id }).write();
    return res.status(200).json({ status: 'success', message: 'Supprimé' });
  });

  // Régénérer un tableau (met à jour generatedAt et remet statut EN_COURS si non clos)
  server.post('/tableau-presence/:id/regenerate', (req, res) => {
    const id = isNaN(+req.params.id) ? req.params.id : +req.params.id;
    const tp = db.get('tableauPresence').find({ id }).value();
    if (!tp)
      return res
        .status(404)
        .json({ status: 'error', message: 'Tableau introuvable', data: null });
    if (tp.locked || tp.statut === 'CLOTURE') {
      return res.status(400).json({
        status: 'error',
        message: 'Régénération non autorisée',
        data: null
      });
    }
    db.get('tableauPresence')
      .find({ id })
      .assign({ generatedAt: new Date().toISOString(), statut: 'EN_COURS' })
      .write();
    return res.status(200).json({
      status: 'success',
      message: 'Régénéré',
      data: db.get('tableauPresence').find({ id }).value()
    });
  });

  // Export CSV (ouvrable avec Excel)
  server.get('/tableau-presence/:id/export.xlsx', (req, res) => {
    const id = isNaN(+req.params.id) ? req.params.id : +req.params.id;
    const tp = db.get('tableauPresence').find({ id }).value();
    if (!tp)
      return res
        .status(404)
        .json({ status: 'error', message: 'Tableau introuvable', data: null });
    const rows = (db.get('tableauPresenceEmployees').value() || []).filter(
      (r) => String(r.tableauPresenceId) === String(id)
    );
    const hrIndex = Object.fromEntries(
      (db.get('hrEmployees').value() || []).map((e) => [String(e.id), e])
    );
    const lines = [
      'Matricule;Nom;Prénom;Heures;HS;Absences;Résumé',
      ...rows.map((r) => {
        const hr = hrIndex[String(r.employeeId)];
        const matricule = hr?.matricule || '';
        const nom = hr?.lastName || '';
        const prenom = hr?.firstName || '';
        return [
          matricule,
          nom,
          prenom,
          r.totalHours,
          r.overtimeHours,
          r.absenceDays,
          r.statusSummary
        ].join(';');
      })
    ];
    const csv = lines.join('\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=tableau-presence-${id}.csv`
    );
    return res.status(200).send(csv);
  });

  // Alias attendu par le front: /:id/export-excel
  server.get('/tableau-presence/:id/export-excel', (req, res) => {
    const id = isNaN(+req.params.id) ? req.params.id : +req.params.id;
    const rows = (db.get('tableauPresenceEmployees').value() || []).filter(
      (r) => String(r.tableauPresenceId) === String(id)
    );
    const hrIndex = Object.fromEntries(
      (db.get('hrEmployees').value() || []).map((e) => [String(e.id), e])
    );
    const lines = [
      'Matricule;Nom;Prénom;Heures;HS;Absences;Résumé',
      ...rows.map((r) => {
        const hr = hrIndex[String(r.employeeId)];
        const matricule = hr?.matricule || '';
        const nom = hr?.lastName || '';
        const prenom = hr?.firstName || '';
        return [
          matricule,
          nom,
          prenom,
          r.totalHours,
          r.overtimeHours,
          r.absenceDays,
          r.statusSummary
        ].join(';');
      })
    ];
    const csv = lines.join('\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=tableau-presence-${id}.xlsx`
    );
    return res.status(200).send(csv);
  });

  // Créer un jour de présence
  server.post('/tableau-presence/:tableauId/days', (req, res) => {
    const { employeeId, date, statusCode, hoursWorked } = req.body;

    const days = db.get('tableauPresenceDays').value() || [];
    const newId =
      days.length > 0 ? Math.max(...days.map((d) => d.id)) + 1 : 10001;

    const newDay = {
      id: newId,
      employeeId: +employeeId,
      date,
      statusCode: statusCode || '',
      hoursWorked: +hoursWorked || 0,
      source: 'MANUEL',
      isOvertime: false
    };

    db.get('tableauPresenceDays').push(newDay).write();

    return res.status(201).json({
      status: 'success',
      message: 'Jour créé',
      data: newDay
    });
  });

  // Mettre à jour un jour de présence
  server.patch('/tableau-presence/:tableauId/days/:dayId', (req, res) => {
    const dayId = isNaN(+req.params.dayId)
      ? req.params.dayId
      : +req.params.dayId;
    const { statusCode, hoursWorked } = req.body;

    const day = db.get('tableauPresenceDays').find({ id: dayId }).value();

    if (!day) {
      return res.status(404).json({
        status: 'error',
        message: 'Jour introuvable',
        data: null
      });
    }

    db.get('tableauPresenceDays')
      .find({ id: dayId })
      .assign({
        statusCode: statusCode !== undefined ? statusCode : day.statusCode,
        hoursWorked: hoursWorked !== undefined ? +hoursWorked : day.hoursWorked
      })
      .write();

    const updated = db.get('tableauPresenceDays').find({ id: dayId }).value();

    return res.status(200).json({
      status: 'success',
      message: 'Jour mis à jour',
      data: updated
    });
  });

  // Mettre à jour la synthèse d'un employé pour un tableau (recalcule heures/HS/absences)
  server.patch(
    '/tableau-presence/:tableauId/employees/:employeeId',
    (req, res) => {
      const tableauId = isNaN(+req.params.tableauId)
        ? req.params.tableauId
        : +req.params.tableauId;
      const employeeId = isNaN(+req.params.employeeId)
        ? req.params.employeeId
        : +req.params.employeeId;

      const tp = db.get('tableauPresence').find({ id: tableauId }).value();
      if (!tp) {
        return res.status(404).json({
          status: 'error',
          message: 'Tableau introuvable',
          data: null
        });
      }

      const body = req.body || {};
      const hasDirectUpdate = [
        'totalHours',
        'overtimeHours',
        'absenceDays',
        'statusSummary'
      ].some((k) => body[k] !== undefined);

      // Upsert helper
      const upsert = (patch) => {
        const existing = db
          .get('tableauPresenceEmployees')
          .find({ tableauPresenceId: tableauId, employeeId: employeeId })
          .value();
        if (existing) {
          const updated = { ...existing, ...patch };
          db.get('tableauPresenceEmployees')
            .find({ tableauPresenceId: tableauId, employeeId: employeeId })
            .assign(updated)
            .write();
        } else {
          const rows = db.get('tableauPresenceEmployees').value() || [];
          const newId =
            rows.length > 0 ? Math.max(...rows.map((r) => r.id || 0)) + 1 : 1;
          db.get('tableauPresenceEmployees')
            .push({
              id: newId,
              tableauPresenceId: tableauId,
              employeeId: employeeId,
              totalHours: 0,
              overtimeHours: 0,
              absenceDays: 0,
              statusSummary: '',
              ...patch
            })
            .write();
        }
        return db
          .get('tableauPresenceEmployees')
          .find({ tableauPresenceId: tableauId, employeeId: employeeId })
          .value();
      };

      if (hasDirectUpdate) {
        const patch = {};
        if (body.totalHours !== undefined)
          patch.totalHours = Number(body.totalHours) || 0;
        if (body.overtimeHours !== undefined)
          patch.overtimeHours = Number(body.overtimeHours) || 0;
        if (body.absenceDays !== undefined)
          patch.absenceDays = Number(body.absenceDays) || 0;
        if (body.statusSummary !== undefined)
          patch.statusSummary = String(body.statusSummary || '');
        const updated = upsert(patch);
        return res.status(200).json({
          status: 'success',
          message: 'Synthèse employé mise à jour',
          data: updated
        });
      }

      // Sinon: recalcul depuis les jours du mois
      const { mois, annee } = tp;
      const targetPrefix = `${annee}-${String(mois).padStart(2, '0')}-`;

      const days = (db.get('tableauPresenceDays').value() || []).filter(
        (d) =>
          String(d.employeeId) === String(employeeId) &&
          String(d.date || '').startsWith(targetPrefix)
      );

      let totalHours = 0;
      let overtimeHours = 0;
      let absenceDays = 0;
      const counts = { A: 0, HS: 0, CP: 0, CM: 0 };

      for (const d of days) {
        const code = d.statusCode || '';
        const hw = typeof d.hoursWorked === 'number' ? d.hoursWorked : 0;
        if (code === 'P') {
          totalHours += hw || 8;
        } else if (code === 'HS') {
          const worked = hw || 8;
          totalHours += worked;
          overtimeHours += Math.max(0, worked - 8);
          counts.HS += 1;
        } else if (code === 'CP') {
          absenceDays += 1;
          counts.CP += 1;
        } else if (code === 'CM') {
          absenceDays += 1;
          counts.CM += 1;
        } else if (code === 'A') {
          absenceDays += 1;
          counts.A += 1;
        }
      }

      const parts = [];
      if (counts.A) parts.push(`${counts.A}A`);
      if (counts.HS) parts.push(`${counts.HS}HS`);
      if (counts.CP) parts.push(`${counts.CP}CP`);
      if (counts.CM) parts.push(`${counts.CM}CM`);
      const statusSummary = parts.join(', ');

      const updated = upsert({
        totalHours,
        overtimeHours,
        absenceDays,
        statusSummary
      });
      return res.status(200).json({
        status: 'success',
        message: 'Synthèse employé recalculée',
        data: updated
      });
    }
  );
};
