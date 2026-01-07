# Paramètres max généraux (parametre_max_general)

Cette ressource centralise les plafonds de plusieurs règles de gestion :
- Nombre maximum d’avenants par contrat (max_avenants_par_contrat)
- Nombre maximum d’avances par année (max_avances_par_an)
- Nombre maximum d’acomptes (max_acomptes_par_an)

## Données mock
- Fichier: `mock-data/parametreMaxGeneral.json`
- Clé DB: `parametreMaxGeneral`
- Structure (exemple):
```json
[
  {
    "id": 1,
    "max_avenants_par_contrat": 3,
    "max_avances_par_an": 4,
    "max_acomptes_par_an": 2,
    "created_at": "2025-01-01T00:00:00Z",
    "updated_at": "2025-01-01T00:00:00Z"
  }
]
```

## API mock
- GET    `/parametre-max-general` — liste
- GET    `/parametre-max-general/:id` — détail
- POST   `/parametre-max-general` — création
- PUT    `/parametre-max-general/:id` — mise à jour
- DELETE `/parametre-max-general/:id` — suppression

Réponses standardisées : `{ status, message, data }`.

## Intégrations et contrôles
- Avenants: à la création (`POST /avenants`), on refuse si le nombre d’avenants existants du même contrat atteint `max_avenants_par_contrat`.
- Avances: à la création (`POST /avances`), on refuse si le nombre d’avances de l’employé dans l’année de `date_demande` atteint `max_avances_par_an`.
- Acomptes: le paramètre `max_acomptes_par_an` est préparé mais non encore branché (aucune route d’acomptes présente pour l’instant).

## Routes front
Dans `src/config/apiRoutes.ts` :
```ts
apiRoutes.admin.parametres.parametreMaxGeneral.list   // GET
apiRoutes.admin.parametres.parametreMaxGeneral.create // POST
apiRoutes.admin.parametres.parametreMaxGeneral.show(id)
apiRoutes.admin.parametres.parametreMaxGeneral.update(id)
apiRoutes.admin.parametres.parametreMaxGeneral.delete(id)
```

## Essais rapides (mock)
1) Lancer le mock server:
```
pnpm mock-server
```
2) Vérifier la config:
```
curl http://localhost:3001/parametre-max-general
```
3) Tester le contrôle avenants (ex: contrat CTR-2024-001):
- Créer jusqu’à la limite, puis observer l’erreur 400 au-delà.

4) Tester le contrôle avances:
- Poster plusieurs avances pour le même `employe_id` dans la même année et observer le refus au-delà de la limite.

Notes:
- En absence de configuration ou de valeur numérique, aucun blocage n’est appliqué.

