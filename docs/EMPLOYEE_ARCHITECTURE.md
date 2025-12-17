# Architecture des Employés - Documentation

## Vue d'ensemble

Cette documentation décrit l'architecture complète du module Employés dans le système SIRH, incluant les types, schémas de validation, et l'intégration du nouveau champ `numero_cnss`.

## Structure des fichiers

```
src/
├── types/
│   └── employee.ts                    # Types TypeScript centralisés
├── app/admin/personnel/employes/
│   ├── create/
│   │   ├── page.tsx                   # Page de création d'employé
│   │   └── schema.ts                  # Schéma de validation Zod
│   └── [id]/details/
│       └── components/
│           └── PersonalTab.tsx        # Onglet des informations personnelles
└── mock-data/
    ├── employees.json                 # Données simplifiées des employés
    └── hrEmployees.json               # Données complètes des employés
```

## Types d'employés

Le fichier `src/types/employee.ts` centralise tous les types liés aux employés :

### Types principaux

1. **`HREmployee`** - Interface complète (utilisée dans hrEmployees.json)

   - Contient toutes les informations détaillées d'un employé
   - Inclut les relations avec d'autres entités
   - Utilisé pour l'affichage détaillé et la modification

2. **`Employee`** - Interface simplifiée (utilisée dans employees.json)

   - Version allégée pour les listes et affichages basiques
   - Contient les champs essentiels
   - Optimisé pour les performances

3. **Types auxiliaires** :
   - `EmployeeCreateInput` - Pour la création
   - `EmployeeUpdateInput` - Pour les mises à jour
   - `EmployeeRow` - Pour l'affichage en tableau
   - `EmployeeFilter` - Pour le filtrage

### Types énumérés

```typescript
type Gender = 'M' | 'F' | 'Homme' | 'Femme' | 'Autre';
type MaritalStatus = 'celibataire' | 'marie' | 'divorce' | 'veuf';
type Nationality = 'maroc' | 'Marocaine' | 'autre';
type ContractType = 'CDI' | 'CDD' | 'Stage' | 'Freelance' | 'Interim';
type EmployeeStatus =
  | 'actif'
  | 'active'
  | 'inactif'
  | 'inactive'
  | 'suspendu'
  | 'demissionaire';
```

### Relations avec d'autres entités

Les employés sont liés à :

- **Department** - Département de travail
- **Location** - Localisation géographique
- **Contract** - Contrat(s) de travail
- **Manager** - Employé manager (relation récursive)
- **Documents** - Documents associés (CIN, diplômes, etc.)

## Schéma de validation

Le fichier `src/app/admin/personnel/employes/ajouter/schema.ts` définit :

### Schema Zod

```typescript
export const employeeSchema = z.object({
  // Identité
  matricule: z.string().min(1, 'Matricule requis'),
  firstName: z.string().min(1, 'Prénom requis'),
  lastName: z.string().min(1, 'Nom requis'),
  cin: z.string().min(1, 'CIN requis'),
  numero_cnss: z.string().optional(),

  // Date et lieu de naissance
  birthDate: z.string().min(1, 'Date de naissance requise'),
  birthPlace: z.string().optional(),

  // Informations personnelles
  nationality: z.enum(['maroc', 'autre']),
  gender: z.enum(['Homme', 'Femme', 'Autre']),
  maritalStatus: z.enum(['celibataire', 'marie', 'divorce', 'veuf']),
  children: z.number().min(0).optional(),

  // Contact
  phone: z
    .string()
    .min(1)
    .regex(/^[+\d]?(?:[\s.\-]?\d){7,15}$/),
  email: z.string().email().optional().or(z.literal('')),

  // Professionnel
  departmentId: z.number().min(1),
  position: z.string().min(1)
  // ... autres champs
});
```

### Valeurs par défaut

```typescript
export const employeeDefaultValues: Partial<EmployeeFormValues> = {
  nationality: 'maroc',
  gender: 'Homme',
  maritalStatus: 'celibataire',
  children: 0,
  country: 'Maroc'
  // ... valeurs par défaut
};
```

## Nouveau champ : numero_cnss

### Description

Le champ `numero_cnss` (Numéro de la Caisse Nationale de Sécurité Sociale) a été ajouté pour gérer l'identification de l'employé auprès de la CNSS marocaine.

### Caractéristiques

- **Type** : `string` (optionnel)
- **Format** : 10 chiffres (ex: "1000123456")
- **Validation** : Optionnel, pas de validation stricte pour le moment
- **Affichage** : Dans l'onglet "Informations personnelles" après le champ CIN

### Intégration

#### 1. Dans le formulaire de création (`page.tsx`)

```tsx
<FormField
  control={form.control}
  name='numero_cnss'
  render={({ field }) => (
    <FormItem>
      <FormLabel>Numéro CNSS</FormLabel>
      <FormControl>
        <Input {...field} placeholder='Ex: 123456789' />
      </FormControl>
      <FormDescription>
        Numéro de la Caisse Nationale de Sécurité Sociale
      </FormDescription>
      <FormMessage />
    </FormItem>
  )}
/>
```

#### 2. Dans l'onglet personnel (`PersonalTab.tsx`)

```tsx
<EditableInfoRow
  label='Numéro CNSS'
  value={employee?.numero_cnss}
  type='text'
  onSave={(v) => onUpdate('numero_cnss', v)}
/>
```

#### 3. Dans les données mock

```json
{
  "id": 1000,
  "cin": "AE123456",
  "numero_cnss": "1000123456"
  // ... autres champs
}
```

## Utilisation

### Import des types

```typescript
import {
  Employee,
  HREmployee,
  EmployeeCreateInput,
  EmployeeUpdateInput
} from '@/types/employee';
```

### Import du schéma

```typescript
import {
  employeeSchema,
  employeeDefaultValues,
  type EmployeeFormValues
} from './schema';
```

### Création d'un formulaire

```typescript
const form = useForm<EmployeeFormValues>({
  resolver: zodResolver(employeeSchema),
  defaultValues: employeeDefaultValues,
  mode: 'onBlur'
});
```

### Soumission des données

```typescript
const onSubmit = async (data: EmployeeFormValues) => {
  const payload: EmployeeCreateInput = {
    firstName: data.firstName,
    lastName: data.lastName,
    cin: data.cin,
    numero_cnss: data.numero_cnss
    // ... autres champs
  };

  await apiClient.post(apiRoutes.admin.employees.list, payload);
};
```

## Bonnes pratiques

### 1. Cohérence des types

- Toujours utiliser les types définis dans `types/employee.ts`
- Ne pas créer de types inline dans les composants
- Réutiliser les types pour les props et les états

### 2. Validation

- Utiliser le schéma Zod centralisé
- Ne pas dupliquer les règles de validation
- Étendre le schéma si nécessaire avec `.extend()`

### 3. Données mock

- Maintenir la cohérence entre `employees.json` et `hrEmployees.json`
- Utiliser des données réalistes
- Inclure tous les champs obligatoires

### 4. Formulaires

- Importer les valeurs par défaut du schéma
- Utiliser le mode de validation approprié (`onBlur`, `onChange`, etc.)
- Gérer les erreurs de manière cohérente

## Évolutions futures

### Améliorations possibles

1. **Validation CNSS** : Ajouter une validation stricte du format du numéro CNSS
2. **Vérification en temps réel** : Vérifier l'unicité du numéro CNSS
3. **API CNSS** : Intégrer avec l'API de la CNSS pour validation
4. **Historique** : Tracker les modifications du numéro CNSS
5. **Exports** : Inclure le numéro CNSS dans les exports Excel/PDF

### Champs additionnels envisagés

- `numero_immatriculation_fiscale` - Numéro d'identification fiscale
- `numero_amo` - Numéro d'Assurance Maladie Obligatoire
- `rib` - Relevé d'Identité Bancaire
- `numero_passeport` - Numéro de passeport

## Résumé des changements

### Fichiers créés

- ✅ `src/types/employee.ts` - Types centralisés
- ✅ `src/app/admin/personnel/employes/ajouter/schema.ts` - Schéma de validation

### Fichiers modifiés

- ✅ `src/app/admin/personnel/employes/ajouter/page.tsx` - Ajout champ numero_cnss
- ✅ `src/app/admin/personnel/employes/[id]/details/components/PersonalTab.tsx` - Affichage numero_cnss
- ✅ `mock-data/employees.json` - Ajout numero_cnss et cin
- ✅ `mock-data/hrEmployees.json` - Ajout numero_cnss

### Améliorations apportées

1. **Architecture cohérente** : Tous les types sont centralisés
2. **Réutilisabilité** : Schéma et types importables partout
3. **Maintenabilité** : Une seule source de vérité pour les types
4. **Extensibilité** : Facile d'ajouter de nouveaux champs
5. **Type safety** : TypeScript garantit la cohérence

## Support

Pour toute question ou suggestion d'amélioration, veuillez consulter la documentation principale ou contacter l'équipe de développement.
