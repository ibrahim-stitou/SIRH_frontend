module.exports = (server, db) => {

  // 🔹 GET ALL
  server.get('/canaux/getAll', (req, res) => {
    const canaux = db.get('CanauxDiffusion').value() || [];
    res.json(canaux);
  });


  // 🔹 CREATE
  server.post('/canaux/create', (req, res) => {
    try {
      const { libelle, code } = req.body;

      const canaux = db.get('CanauxDiffusion').value() || [];

      const newId = canaux.length > 0
        ? Math.max(...canaux.map(c => c.id)) + 1
        : 1;

      const newCanal = {
        id: newId,
        code: code || libelle?.toUpperCase().replace(/\s/g, "_"),
        libelle,
        createdAt: new Date().toISOString()
      };

      db.get('CanauxDiffusion').push(newCanal).write();

      res.status(201).json({
        message: "Canal créé avec succès",
        canal: newCanal
      });

    } catch (error) {
      res.status(500).json({
        message: "Erreur lors de la création",
        error: error.message
      });
    }
  });


  // 🔹 DELETE
  server.delete('/canaux/delete/:id', (req, res) => {
    try {
      const id = parseInt(req.params.id);

      const canal = db.get('CanauxDiffusion')
        .find({ id })
        .value();

      if (!canal) {
        return res.status(404).json({
          message: "Canal introuvable"
        });
      }

      db.get('CanauxDiffusion')
        .remove({ id })
        .write();

      res.json({
        message: "Canal supprimé avec succès"
      });

    } catch (error) {
      res.status(500).json({
        message: "Erreur lors de la suppression",
        error: error.message
      });
    }
  });

};
