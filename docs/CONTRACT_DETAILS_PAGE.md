# Page de Détails du Contrat

## Vue d'ensemble

La page de détails du contrat est une interface moderne et professionnelle qui permet de visualiser et modifier toutes les informations d'un contrat de travail. Elle est organisée en 4 onglets principaux avec un système de gestion des permissions basé sur le statut du contrat.

## Structure

```
src/app/admin/contrats-mouvements/contrats/[id]/details/
├── page.tsx                 # Page principale
├── loading.tsx              # État de chargement
└── loading-skeleton.tsx     # Composant skeleton
```

## Composants

### 1. Page Principale (`page.tsx`)

**Fonctionnalités :**

- Chargement dynamique des données du contrat depuis l'API
- Gestion des états (chargement, édition, sauvegarde)
- Système de permissions basé sur le statut
- Validation du contrat
- Affichage des badges de statut
- Menu d'actions contextuelles

**États du contrat :**

- **Brouillon** : Peut être modifié et validé
- **Actif** : Lecture seule, modifications via avenant
- **Autres statuts** : Lecture seule

### 2. Onglets de Contenu

#### Onglet 1 : Informations Générales

**Composant :** `GeneralInfoDisplay.tsx`

Sections :

- **Informations de Base**

  - Référence du contrat
  - Référence interne
  - Type de contrat (CDI, CDD, etc.)

- **Informations Employé**

  - Nom et prénom
  - Matricule
  - Entreprise

- **Dates du Contrat**

  - Date de signature
  - Date de début
  - Date de fin (si CDD)
  - Période d'essai (si applicable)

- **Informations du Poste**
  - Intitulé du poste
  - Département
  - Catégorie professionnelle
  - Mode de travail
  - Lieu de travail
  - Responsable hiérarchique
  - Missions et responsabilités

#### Onglet 2 : Temps de Travail

**Composant :** `WorkScheduleDisplay.tsx`

Sections :

- **Horaires de Travail**

  - Heures hebdomadaires
  - Heures journalières
  - Heures annuelles
  - Horaire de travail
  - Type d'horaire

- **Organisation du Travail**

  - Jour de repos
  - Équipe/Shift
  - Rotation d'équipes
  - Travail de nuit
  - Travail le week-end
  - Astreintes
  - Heures supplémentaires
  - Repos compensateur

- **Congés et Absences**
  - Jours de congés annuels
  - Bonus d'ancienneté
  - Congés spéciaux (mariage, naissance, décès, etc.)

#### Onglet 3 : Rémunération & Légal

**Composant :** `SalaryAndLegalDisplay.tsx`

Sections :

- **Rémunération de Base**

  - Salaire de base
  - Salaire brut
  - Salaire net
  - Fréquence de paiement
  - Méthode de paiement
  - Taux horaire/journalier
  - Informations bancaires (RIB)

- **Primes et Indemnités**

  - Prime d'ancienneté
  - Prime de transport
  - Prime de panier
  - Prime de rendement
  - Prime de nuit
  - Prime d'astreinte
  - 13ème/14ème mois
  - Indemnités diverses

- **Avantages en Nature**

  - Voiture de fonction
  - Téléphone professionnel
  - Ordinateur portable
  - Tickets restaurant
  - Logement de fonction
  - Assurances
  - Transport collectif

- **Informations Légales**
  - CNSS (affiliation, numéro, régime)
  - AMO (couverture, régime, ayants droit)
  - Retraite complémentaire (CIMR, RCAR)
  - Convention collective
  - Clauses contractuelles (confidentialité, non-concurrence, mobilité, etc.)

#### Onglet 4 : Documents

**Composant :** `ContractDocuments.tsx`

Sections :

- **Contrat Principal**

  - Document signé
  - Date de signature
  - Actions : Visualiser, Télécharger

- **Avenants**

  - Liste des avenants
  - Numéro, objet, date
  - Statut (Signé/En attente)
  - Actions : Ajouter, Visualiser, Télécharger

- **Annexes**

  - Documents annexes
  - Type, titre, date d'ajout
  - Actions : Visualiser, Télécharger

- **Attestations**
  - Attestations émises
  - Type, date d'émission
  - Actions : Visualiser, Télécharger

### 3. Composants Auxiliaires

#### ContractActions (`ContractActions.tsx`)

Menu dropdown avec actions contextuelles :

- Générer le contrat
- Télécharger
- Envoyer pour signature
- Dupliquer
- Renouveler (pour CDD)
- Archiver
- Supprimer

## Fonctionnalités Clés

### 1. Mode Édition

- **Activation** : Bouton "Modifier" (visible uniquement si statut = Brouillon)
- **Comportement** :
  - Les champs deviennent éditables
  - Affichage des boutons "Annuler" et "Enregistrer"
  - Validation en temps réel
- **Sauvegarde** : Envoi PATCH à l'API avec les données modifiées

### 2. Validation du Contrat

- **Condition** : Statut = Brouillon
- **Action** : POST vers `/contracts/{id}/validate`
- **Effet** :
  - Changement de statut
  - Verrouillage des modifications
  - Affichage du message d'information

### 3. Affichage Dynamique

- **Champs conditionnels** : Affichage selon les données disponibles
- **Format adaptatif** :
  - Dates : Format français (ex: 5 décembre 2024)
  - Devises : Format MAD (ex: 15 000,00 MAD)
  - Booléens : Checkbox visuelles

### 4. Gestion des Permissions

```typescript
const canEdit = contract?.status === 'Brouillon';
const canValidate = contract?.status === 'Brouillon' && !isEditing;
```

### 5. États de Chargement

- **Skeleton Loading** : Animation pendant le chargement
- **Gestion d'erreurs** : Message si contrat introuvable
- **Feedback utilisateur** : Toasts pour les actions

## Style et Design

### Thème

- **Moderne et professionnel**
- **Responsive** : Grilles adaptatives (mobile, tablette, desktop)
- **Cohérence** : Utilisation du système de design (shadcn/ui)

### Badges de Statut

Chaque statut a son propre style visuel :

- 🟡 **Brouillon** : Secondary, icône FileText
- 🔵 **En attente signature** : Warning, icône Clock
- 🟢 **Actif** : Default, icône Check
- 🟠 **Suspendu** : Destructive, icône AlertCircle
- 🔴 **Résilié** : Destructive, icône AlertCircle
- ⚪ **Archivé** : Secondary, icône FileText

### Layout

- **Grilles** : 2-3 colonnes selon l'écran
- **Espacement** : Cohérent avec gap-4 et gap-6
- **Cards** : Sections bien délimitées
- **Hiérarchie** : Titres clairs avec icônes

## API Integration

### Endpoints Utilisés

```typescript
// Récupérer les détails
GET / contracts / { id };

// Mettre à jour
PATCH / contracts / { id };

// Valider
POST / contracts / { id } / validate;

// Générer le document
POST / contracts / { id } / generate;
```

### Format de Réponse

```typescript
interface ContractResponse {
  data: Contract;
}
```

## Améliorations Futures

### Phase 2

- [ ] Ajout d'avenants en ligne
- [ ] Prévisualisation des documents PDF
- [ ] Signature électronique intégrée
- [ ] Historique détaillé des modifications
- [ ] Export en différents formats

### Phase 3

- [ ] Notifications automatiques
- [ ] Workflows de validation multi-niveaux
- [ ] Templates personnalisables
- [ ] Intégration avec la paie
- [ ] Génération automatique des attestations

## Utilisation

### Navigation

1. Liste des contrats → Clic sur un contrat
2. URL : `/admin/contrats-mouvements/contrats/{id}/details`

### Modification

1. Vérifier que le statut est "Brouillon"
2. Cliquer sur "Modifier"
3. Modifier les champs dans les onglets
4. Cliquer sur "Enregistrer" (ou "Annuler")

### Validation

1. S'assurer que toutes les informations sont correctes
2. Cliquer sur "Valider le contrat"
3. Le contrat passe en statut "Actif" ou "En attente signature"

## Tests

### Scénarios à Tester

1. **Chargement** : Vérifier l'affichage du skeleton
2. **Affichage** : Tous les champs sont visibles
3. **Édition** : Mode édition fonctionne (si Brouillon)
4. **Sauvegarde** : Les modifications sont persistées
5. **Validation** : Le statut change après validation
6. **Permissions** : Pas de modification si non-Brouillon
7. **Erreurs** : Gestion des erreurs réseau

## Notes Techniques

- **Framework** : Next.js 14 (App Router)
- **UI Library** : shadcn/ui
- **Gestion d'état** : React hooks (useState, useEffect)
- **Formatage** : date-fns pour les dates
- **Notifications** : sonner (toasts)
- **Icons** : lucide-react

## Support

Pour toute question ou problème, consultez la documentation complète dans `/docs/CONTRACT_SYSTEM_COMPLETE.md`
