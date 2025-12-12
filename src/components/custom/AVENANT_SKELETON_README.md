# Avenants Skeleton Components

Ce fichier contient les composants de skeleton pour les pages liées aux avenants de contrats.

## Composants Disponibles

### 1. `AvenantDetailsSkeleton`

Skeleton pour la page de détails d'un avenant (`/contrats/[id]/avenants/[avenantId]`).

**Utilisation:**
```tsx
import { AvenantDetailsSkeleton } from '@/components/custom/AvenantSkeleton';

if (loading) {
  return (
    <PageContainer scrollable>
      <AvenantDetailsSkeleton />
    </PageContainer>
  );
}
```

**Affiche:**
- Header avec titre et badges
- Informations générales de l'avenant
- Modifications (avant/après)
- Documents liés

---

### 2. `AvenantFormSkeleton`

Skeleton pour les pages de création et d'édition d'avenant.

**Utilisation:**
```tsx
import { AvenantFormSkeleton } from '@/components/custom/AvenantSkeleton';

if (loading) {
  return (
    <PageContainer scrollable={true}>
      <AvenantFormSkeleton />
    </PageContainer>
  );
}
```

**Affiche:**
- Header avec titre et actions
- Sidebar avec informations du contrat (25%)
- Formulaire principal (75%)
- Sections avec tabs

---

### 3. `CardSkeleton`

Skeleton générique pour une card.

**Utilisation:**
```tsx
import { CardSkeleton } from '@/components/custom/AvenantSkeleton';

<CardSkeleton rows={5} />
```

**Props:**
- `rows` (optional): Nombre de lignes à afficher (défaut: 3)

---

### 4. `FormFieldSkeleton`

Skeleton pour un champ de formulaire.

**Utilisation:**
```tsx
import { FormFieldSkeleton } from '@/components/custom/AvenantSkeleton';

<div className="grid grid-cols-2 gap-4">
  <FormFieldSkeleton />
  <FormFieldSkeleton />
</div>
```

---

### 5. `DocumentListSkeleton`

Skeleton pour une liste de documents.

**Utilisation:**
```tsx
import { DocumentListSkeleton } from '@/components/custom/AvenantSkeleton';

<DocumentListSkeleton count={5} />
```

**Props:**
- `count` (optional): Nombre de documents à afficher (défaut: 3)

---

## Exemple Complet

```tsx
'use client';

import { useState, useEffect } from 'react';
import PageContainer from '@/components/layout/page-container';
import { AvenantFormSkeleton } from '@/components/custom/AvenantSkeleton';

export default function EditAvenantPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    // Fetch data...
    fetchData().finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <PageContainer scrollable={true}>
        <AvenantFormSkeleton />
      </PageContainer>
    );
  }

  return (
    <PageContainer scrollable={true}>
      {/* Votre contenu ici */}
    </PageContainer>
  );
}
```

---

## Personnalisation

Les skeletons utilisent les classes Tailwind CSS suivantes:
- `bg-muted`: Couleur de fond
- `animate-pulse`: Animation de pulsation
- `rounded`: Bordures arrondies

Vous pouvez facilement personnaliser l'apparence en modifiant ces classes dans le fichier `AvenantSkeleton.tsx`.

---

## Notes

- Les skeletons sont conçus pour correspondre exactement à la structure des pages réelles
- Ils utilisent les mêmes composants UI (Card, CardHeader, CardContent)
- L'animation `animate-pulse` est fournie par Tailwind CSS
- Les skeletons sont responsive et s'adaptent aux différentes tailles d'écran

