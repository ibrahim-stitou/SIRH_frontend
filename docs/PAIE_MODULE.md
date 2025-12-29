# Module de Gestion de la Paie

## Vue d'ensemble

Le module de gestion de la paie permet de gérer l'ensemble du processus de paie de l'entreprise, de la saisie des éléments variables jusqu'à l'exécution des virements bancaires.

## Architecture

### Structure des fichiers

```
src/
├── app/admin/paie/
│   ├── page.tsx                    # Page de liste des périodes de paie
│   └── [id]/
│       └── page.tsx                # Page de détail d'une période de paie
├── features/paie/
│   ├── employees-tab.tsx           # Onglet liste des employés
│   ├── bulletin-tab.tsx            # Onglet bulletin de paie détaillé
│   └── virements-tab.tsx           # Onglet gestion des virements
├── types/
│   └── paie.ts                     # Types TypeScript
server/routes/
    └── paies.js                    # Routes API backend
mock-data/
    ├── periodePaie.json            # Données des périodes de paie
    ├── bulletinPaie.json           # Données des bulletins
    ├── rubriquePaie.json           # Rubriques de paie (gains, cotisations, etc.)
    └── elementVariable.json        # Éléments variables
```

## Fonctionnalités principales

### 1. Gestion des périodes de paie

- **Liste des périodes** : Vue d'ensemble de toutes les périodes de paie
- **Création de période** : Créer une nouvelle période mensuelle
- **Suivi du statut** : En cours, Validé, Payé
- **Statistiques** : Nombre d'employés, montant total, échéances

### 2. Onglet Employés

Affiche la liste de tous les employés rattachés à une période de paie :

- Liste complète avec numéro employé, nom, poste, département
- Montant du salaire net pour chaque employé
- Action "Voir la paie" qui redirige vers l'onglet Bulletin
- Recherche et filtrage

### 3. Onglet Bulletin de paie

Interface détaillée du bulletin de paie d'un employé :

#### Zone supérieure - Informations de temps

- Jours travaillés
- Nombre de jours de congé
- Nombre de jours d'absence
- Nombre de jours de récupération payés
- Heures travaillées

#### Panneau latéral - Éléments variables (Sheet)

- Formulaire d'ajout d'éléments variables
- Sélection de rubrique
- Saisie du montant, base, taux, quantité
- Commentaire optionnel

#### Zone centrale - Bulletin détaillé

**Section 1 : Gains (Badge vert)**

- Salaire de base
- Heures travaillées × Taux horaire
- Éléments variables de type "Gain"
  - Prime d'ancienneté
  - Prime de rendement
  - Heures supplémentaires 125%
  - Heures supplémentaires 150%
- **Totaux** :
  - Salaire brut
  - Salaire brut imposable

**Section 2 : Cotisations (Badge rouge)**

- CNSS Part Salariale
- AMO Part Salariale
- Impôt sur le revenu
- Mutuelle
- **Total cotisations** (valeur négative)

**Section 3 : Autres éléments (Badge bleu)**

- Avance sur salaire (négatif)
- Remboursement prêt (négatif)
- Indemnité de transport (positif)
- Autres déductions/additions

**Totaux finaux**

- **Salaire net à payer** (encadré principal)
- Cumuls annuels :
  - Salaire brut cumulé
  - Cotisations cumulées
  - Salaire net cumulé
  - IR cumulé

### 4. Onglet Virements

Gestion des virements bancaires de la période :

#### Statistiques

- Total des virements
- Virements en attente
- Virements payés

#### Fonctionnalités

- Sélection multiple des virements à exécuter
- Export au format SEPA/CSV
- Exécution groupée des virements
- Recherche par employé, numéro, RIB
- Tableau détaillé avec :
  - N° Employé
  - Nom complet
  - RIB
  - Montant
  - Statut (En attente / Payé)

## API Endpoints

### Périodes de paie

```
GET    /api/paies                     # Liste des périodes
GET    /api/paies/:id                 # Détail d'une période
```

### Bulletins de paie

```
GET    /api/paies/:id/bulletins                    # Bulletins d'une période
GET    /api/paies/:periodeId/bulletins/:employeId  # Bulletin d'un employé
PUT    /api/paies/:periodeId/bulletins/:employeId  # Mise à jour bulletin
```

### Éléments variables

```
POST   /api/paies/:periodeId/bulletins/:employeId/elements            # Ajouter élément
DELETE /api/paies/:periodeId/bulletins/:employeId/elements/:rubriqueId # Supprimer élément
```

### Rubriques

```
GET    /api/paies/rubriques/all          # Toutes les rubriques
GET    /api/paies/rubriques/type/:type   # Rubriques par type
```

### Virements

```
GET    /api/paies/:id/virements          # Liste des virements
POST   /api/paies/:id/virements/executer # Exécuter les virements
```

## Workflow d'utilisation

### 1. Création d'une période

1. Accéder à `/admin/paie`
2. Cliquer sur "Nouvelle période"
3. Définir le mois, l'année, les dates

### 2. Saisie des bulletins

1. Sélectionner une période
2. Onglet "Employés" : voir la liste
3. Cliquer sur "Voir la paie" pour un employé
4. Dans l'onglet "Bulletin" :
   - Les informations de temps sont pré-remplies
   - Le salaire de base est calculé automatiquement
   - Ajouter des éléments variables via le bouton "Ajouter une rubrique"
   - Les totaux se calculent automatiquement

### 3. Validation et virements

1. Vérifier tous les bulletins
2. Passer à l'onglet "Virements"
3. Sélectionner les virements à exécuter
4. Exporter au format SEPA si nécessaire
5. Cliquer sur "Exécuter les virements"

## Types de rubriques de paie

### Gains (type: 'gain')

- `SAL_BASE` - Salaire de base
- `PRIME_ANCIE` - Prime d'ancienneté
- `PRIME_REND` - Prime de rendement
- `HS_125` - Heures supplémentaires 125%
- `HS_150` - Heures supplémentaires 150%

### Cotisations (type: 'cotisation')

- `CNSS_PAT` - CNSS Part Patronale (16%)
- `CNSS_SAL` - CNSS Part Salariale (4.48%)
- `AMO_PAT` - AMO Part Patronale (3.51%)
- `AMO_SAL` - AMO Part Salariale (2.26%)
- `IR` - Impôt sur le revenu (barème)
- `MUTUELLE` - Mutuelle

### Autres (type: 'autre')

- `AVANCE` - Avance sur salaire
- `PRET` - Remboursement prêt
- `INDEM_TRANS` - Indemnité de transport

## Calculs automatiques

### Salaire brut

```
Salaire brut = Salaire de base + Σ(Éléments variables de type "gain")
```

### Cotisations

- CNSS : Plafonnée à 6000 MAD
- AMO : Sans plafond
- IR : Selon barème progressif marocain

### Salaire net

```
Salaire net = Salaire brut + Total cotisations (négatif) + Total autres éléments
```

## Sécurité et validations

- Vérification des montants négatifs/positifs selon le type
- Validation des RIB
- Contrôle des doublons
- Historique des modifications
- Traçabilité des virements exécutés

## Améliorations futures

- [ ] Génération automatique des périodes
- [ ] Import des pointages/absences
- [ ] Calcul automatique de l'IR selon le barème
- [ ] Génération de fichier SEPA XML conforme
- [ ] Impression PDF des bulletins
- [ ] Envoi par email des bulletins
- [ ] Tableau de bord analytique
- [ ] Export comptable
- [ ] Archivage des périodes clôturées

## Support

Pour toute question sur le module de paie, consultez la documentation complète ou contactez l'équipe de développement.
