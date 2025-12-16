# Fonctionnalité d'Édition d'Avenant

## Vue d'ensemble

Cette fonctionnalité permet de modifier un avenant existant pour un contrat.

## Route

`/admin/contrats-mouvements/contrats/[id]/avenants/[avenantId]/edit`

### Exemple d'URL

`http://localhost:3003/admin/contrats-mouvements/contrats/CTR-2024-002/avenants/AVN-2024-002/edit`

## Fonctionnalités

### 1. Chargement des Données

- Charge l'avenant existant depuis l'API
- Charge le contrat associé pour le contexte
- Charge les départements pour les sélections
- Pré-remplit le formulaire avec les valeurs existantes de l'avenant

### 2. Formulaire d'Édition

Le formulaire est organisé en 4 onglets:

#### a) Informations

- Date d'effet
- Type de modification (Salaire, Horaire, Poste)
- Objet de l'avenant
- Motif

#### b) Modifications

Selon le type sélectionné:

- **Salaire**: Salaire brut, net, devise, mode de paiement
- **Horaire**: Type d'horaire, travail posté, jours de congés
- **Poste**: Poste, département, classification, mode de travail

Affiche les valeurs actuelles du contrat pour comparaison.

#### c) Justification

- Justification détaillée de la modification
- Notes internes (visibles uniquement par RH)

#### d) Validation

- Case à cocher pour validation du manager
- Case à cocher pour validation RH

### 3. Gestion des États

- **Brouillon**: Peut être modifié librement
- **Approuvé**: Affiche un avertissement que les modifications nécessiteront une nouvelle validation

### 4. Sauvegarde

- Enregistre les modifications via API PUT
- Préserve l'état "avant" dans les changements
- Redirige vers la page de détails de l'avenant après sauvegarde
- Affiche des notifications toast pour le feedback utilisateur

## Schéma de Validation

Le formulaire utilise Zod pour la validation avec les règles suivantes:

- Date d'effet: obligatoire
- Objet: minimum 10 caractères
- Motif: minimum 20 caractères
- Justification: minimum 20 caractères
- Type de modification: 'salary', 'schedule', ou 'job'
- Valeurs numériques pour les salaires doivent être positives

## Navigation

- Bouton "Modifier" disponible sur la page de détails de l'avenant (uniquement pour les avenants en brouillon)
- Bouton "Annuler" pour revenir à la page de détails sans sauvegarder
- Bouton "Enregistrer les modifications" pour sauvegarder

## API Endpoints Utilisés

- `GET /avenants/{id}` - Récupérer les détails de l'avenant
- `GET /contracts/{id}` - Récupérer les détails du contrat
- `GET /departments` - Récupérer la liste des départements
- `PUT /avenants/{id}` - Mettre à jour l'avenant

## Structure de Données

```typescript
interface Avenant {
  id: string;
  contract_id: string;
  numero: number;
  date: string;
  objet: string;
  motif: string;
  description: string;
  status: 'Brouillon' | 'Valide';
  type_modification: 'salary' | 'schedule' | 'job';
  changes: {
    [key: string]: {
      avant: Record<string, any>;
      apres: Record<string, any>;
    };
  };
  validations?: {
    manager: boolean;
    rh: boolean;
  };
  notes?: string;
  created_at: string;
  created_by: string;
  updated_at?: string;
}
```

## Notes Techniques

- Utilise React Hook Form pour la gestion du formulaire
- Validation côté client avec Zod
- Composants UI de Shadcn/UI
- Gestion d'état local avec useState
- Navigation avec Next.js App Router
- Toast notifications avec Sonner

## Tests

Pour tester la fonctionnalité:

1. Naviguer vers un contrat avec des avenants
2. Cliquer sur un avenant en statut "Brouillon"
3. Cliquer sur le bouton "Modifier"
4. Modifier les champs souhaités
5. Cliquer sur "Enregistrer les modifications"
6. Vérifier que les changements sont sauvegardés

## Améliorations Futures

- Historique des modifications de l'avenant
- Comparaison visuelle des changements
- Validation en temps réel des champs
- Prévisualisation du PDF avant génération
- Gestion des pièces jointes
