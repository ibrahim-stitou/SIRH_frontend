# Gestion des Avances et Acomptes - Documentation

## Vue d'ensemble

Ce document décrit les modifications apportées au système de gestion des avances pour inclure également la gestion des acomptes. La différence principale est l'ajout d'un champ `type` qui permet de distinguer entre "Avance" et "Acompte".

## Modifications apportées

### 1. Types TypeScript (`src/types/avance.ts`)

**Ajout du champ `type`:**

```typescript
export interface AvanceInterface {
  id: number;
  employe_id: number;
  type: 'Avance' | 'Acompte'; // ✨ NOUVEAU CHAMP
  statut: 'Brouillon' | 'En_attente' | 'Valide' | 'Refuse';
  date_demande: string;
  // ... autres champs
}
```

### 2. Schéma de validation Zod (`src/app/admin/paie/avance/avanceSchema.tsx`)

**Validation du champ type:**

```typescript
export const AvanceSchema = z.object({
  // ...
  type: z.enum(['Avance', 'Acompte'], {
    required_error: 'Le type est requis.',
    invalid_type_error: "Le type doit être 'Avance' ou 'Acompte'."
  })
  // ...
});
```

### 3. Données mockées (`mock-data/avances.json`)

**Exemples de données avec type:**

```json
[
  {
    "id": 1,
    "type": "Avance"
    // ...
  },
  {
    "id": 2,
    "type": "Acompte"
    // ...
  }
]
```

### 4. Interface de listing (`src/features/paie/avances/avances-listing.tsx`)

**Modifications:**

- Ajout du champ `type` dans l'interface `Avance`
- Nouvelle colonne "Type" dans le tableau avec badges visuels
- Nouveau filtre par type (Avance/Acompte)
- Mise à jour du titre: "Gestion des avances et acomptes"
- Mise à jour du bouton: "Ajouter une nouvelle demande"

**Colonne Type:**

```typescript
{
  data: 'type',
  label: 'Type',
  sortable: true,
  render: (value) => (
    <Badge variant={value === 'Avance' ? 'default' : 'outline'}>
      {value}
    </Badge>
  )
}
```

**Filtre Type:**

```typescript
{
  field: 'type',
  label: 'Type',
  type: 'datatable-select',
  options: [
    { label: 'Tous', value: '' },
    { label: 'Avance', value: 'Avance' },
    { label: 'Acompte', value: 'Acompte' }
  ]
}
```

### 5. Formulaire d'ajout (`src/app/admin/paie/avance/ajouter/page.tsx`)

**Modifications:**

- Inclusion du champ `type` dans le schéma de création
- Valeur par défaut: `'Avance'`
- Nouveau champ SelectField pour choisir le type
- Mise à jour du titre: "Nouvelle demande d'avance/acompte"

**Champ de sélection:**

```typescript
<SelectField
  name='type'
  label='Type'
  control={form.control as any}
  options={[
    { id: 'Avance', label: 'Avance' },
    { id: 'Acompte', label: 'Acompte' }
  ]}
  displayField='label'
  required
  placeholder='Sélectionner le type'
  error={form.formState.errors.type?.message as any}
/>
```

### 6. Formulaire de modification (`src/app/admin/paie/avance/[id]/modifier/page.tsx`)

**Modifications:**

- Inclusion du champ `type` dans le schéma d'édition
- Chargement de la valeur existante avec fallback sur 'Avance'
- Même champ SelectField que dans le formulaire d'ajout
- Mise à jour du titre: "Modifier la demande"

### 7. Page de détails (`src/app/admin/paie/avance/[id]/details/page.tsx`)

**Modifications:**

- Ajout du champ `type` dans l'interface `AvanceDetails`
- Affichage du type avec badge visuel
- Mise à jour du titre: "Détails de la demande"

**Affichage du type:**

```typescript
<div className='rounded-md border p-3'>
  <div className='text-muted-foreground text-sm'>Type</div>
  <div className='font-medium'>
    <Badge variant={data.type === 'Avance' ? 'default' : 'outline'}>
      {data.type || 'Avance'}
    </Badge>
  </div>
</div>
```

### 8. Traductions (`public/locales/fr.json`)

**Mise à jour:**

```json
{
  "sidebar": {
    "avances": "Avances & Acomptes"
  }
}
```

## Routes API (Backend)

Les routes existantes dans `server/routes/avances.js` supportent déjà le nouveau champ `type` car elles traitent les données de manière générique. Aucune modification spécifique n'est nécessaire.

**Routes disponibles:**

- `GET /avances` - Liste avec filtrage
- `GET /avances/:id` - Détails
- `POST /avances` - Création
- `PUT /avances/:id` - Modification
- `DELETE /avances/:id` - Suppression

## Styles visuels

### Badges Type

- **Avance**: Badge bleu (variant: 'default')
- **Acompte**: Badge gris outline (variant: 'outline')

### Badges Statut

- **Brouillon**: Badge jaune (outline)
- **En attente**: Badge gris (default)
- **Valide**: Badge vert (secondary)
- **Refusé**: Badge rouge (destructive)

## Migration des données

Pour les données existantes sans champ `type`, le système utilise 'Avance' comme valeur par défaut. Il est recommandé de mettre à jour les enregistrements existants dans la base de données:

```sql
-- Exemple SQL (à adapter selon votre base de données)
UPDATE avances
SET type = 'Avance'
WHERE type IS NULL;
```

## Validation

Le champ `type` est:

- ✅ Requis lors de la création
- ✅ Requis lors de la modification
- ✅ Validé comme enum ('Avance' | 'Acompte')
- ✅ Affiché dans la liste et les détails
- ✅ Filtrable dans la liste

## Tests recommandés

1. ✅ Créer une nouvelle avance
2. ✅ Créer un nouveau acompte
3. ✅ Filtrer par type dans la liste
4. ✅ Modifier le type d'une demande existante
5. ✅ Vérifier l'affichage des badges
6. ✅ Vérifier la validation du formulaire
7. ✅ Vérifier la persistance des données

## Compatibilité

- ✅ Rétrocompatible avec les données existantes
- ✅ Valeur par défaut 'Avance' si non spécifié
- ✅ Pas de breaking changes dans l'API
- ✅ Interface utilisateur mise à jour

## Résumé des fichiers modifiés

1. `src/types/avance.ts` - Interface TypeScript
2. `src/app/admin/paie/avance/avanceSchema.tsx` - Schéma de validation
3. `mock-data/avances.json` - Données de test
4. `src/features/paie/avances/avances-listing.tsx` - Liste et filtres
5. `src/app/admin/paie/avance/ajouter/page.tsx` - Formulaire d'ajout
6. `src/app/admin/paie/avance/[id]/modifier/page.tsx` - Formulaire de modification
7. `src/app/admin/paie/avance/[id]/details/page.tsx` - Page de détails
8. `public/locales/fr.json` - Traductions

---

_Dernière mise à jour: 2026-01-09_
