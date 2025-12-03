# Module Attestations - Documentation

## Vue d'ensemble

Le module Attestations permet de gérer les demandes et la génération de certificats officiels pour les employés. Il offre une interface complète pour créer, approuver, rejeter et générer des attestations au format PDF.

## Fonctionnalités

### 1. Types d'attestations supportés

- **Attestation de travail** : Certifie l'emploi actuel d'un employé
- **Attestation de salaire** : Inclut les informations salariales
- **Attestation de travail et salaire** : Combine les deux informations
- **Attestation de stage** : Pour les stagiaires avec dates de début et fin

### 2. Workflow des demandes

1. **Création de demande** : Un employé ou RH crée une demande d'attestation
2. **Approbation/Rejet** : Les RH approuvent ou rejettent la demande
3. **Génération PDF** : Une fois approuvée, l'attestation peut être générée
4. **Téléchargement** : Le PDF est téléchargé automatiquement

### 3. Génération directe

Il est possible de générer une attestation directement sans passer par une demande, utile pour des besoins urgents.

## Structure des données

### AttestationRequest (Demandes)

```typescript
{
  id: number;
  employeeId: number;
  typeAttestation: 'travail' | 'salaire' | 'stage' | 'travail_salaire' | 'autre';
  dateRequest: string;
  status: 'en_attente' | 'approuve' | 'rejete' | 'genere';
  raisonRejet?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
```

### Attestation (Documents générés)

```typescript
{
  id: number;
  requestId?: number | null;
  employeeId: number;
  typeAttestation: AttestationType;
  dateGeneration: string;
  documentPath: string;
  numeroAttestation: string; // Format: ATT-YYYY-XXX
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
```

## Fichiers créés

### 1. Types TypeScript

**`src/types/attestation.ts`**
- Définit tous les types TypeScript pour les attestations
- Interfaces pour les requêtes et documents
- Types d'énumération pour statuts et types

### 2. Générateur PDF

**`src/lib/pdf/attestation-generator.ts`**
- Classe `AttestationPDFGenerator` pour générer les PDFs
- Méthodes spécifiques pour chaque type d'attestation
- Gestion du formatage des dates et calcul d'ancienneté
- Personnalisation des en-têtes et pieds de page

### 3. Interface utilisateur

**`src/app/admin/personnel/attestations/page_old.tsx`**
- Page principale du module
- Gestion des demandes et attestations générées
- Dialogues pour création, approbation, rejet
- Statistiques en temps réel
- Tables interactives

### 4. Mock Data

**`mock-data/attestationRequests.json`**
- Données de test pour les demandes

**`mock-data/attestations.json`**
- Données de test pour les documents générés

### 5. Traductions

Ajout des traductions dans :
- `public/locales/fr.json` (Français)
- `public/locales/en.json` (Anglais)
- `public/locales/ar.json` (Arabe)

Section `attestations` avec toutes les clés nécessaires.

## API Endpoints

Le module utilise les endpoints REST suivants :

```
GET    /attestationRequests       - Liste des demandes
POST   /attestationRequests       - Créer une demande
PATCH  /attestationRequests/:id   - Mettre à jour une demande
DELETE /attestationRequests/:id   - Supprimer une demande

GET    /attestations              - Liste des attestations générées
POST   /attestations              - Créer une attestation
GET    /attestations/:id          - Détails d'une attestation
DELETE /attestations/:id          - Supprimer une attestation

GET    /employees                 - Liste des employés
```

## Utilisation

### Créer une nouvelle demande

1. Cliquer sur "Nouvelle demande"
2. Sélectionner un employé
3. Choisir le type d'attestation
4. Ajouter des notes (optionnel)
5. Soumettre

### Approuver/Rejeter une demande

1. Dans l'onglet "Demandes", trouver la demande en attente
2. Cliquer sur "Approuver" ou "Rejeter"
3. Pour un rejet, indiquer la raison

### Générer l'attestation

1. Pour une demande approuvée, cliquer sur "Générer PDF"
2. Le PDF est automatiquement téléchargé
3. L'attestation est enregistrée dans l'historique

### Génération directe

1. Cliquer sur "Générer une attestation"
2. Sélectionner l'employé et le type
3. Pour les stages, indiquer les dates
4. Générer directement le PDF

## Personnalisation

### Modifier les templates PDF

Dans `src/lib/pdf/attestation-generator.ts`, chaque type d'attestation a sa propre méthode :

- `generateAttestationTravail()`
- `generateAttestationSalaire()`
- `generateAttestationTravailSalaire()`
- `generateAttestationStage()`

Vous pouvez personnaliser :
- Le contenu du texte
- Le formatage
- Les informations de l'entreprise
- Le style et la mise en page

### Informations de l'entreprise

Par défaut, les informations suivantes sont utilisées :

```typescript
const DEFAULT_COMPANY = {
  name: 'SIRH COMPANY',
  address: '123 Avenue Mohammed V',
  city: 'Casablanca 20000, Maroc',
  phone: '+212 5 22 XX XX XX',
  email: 'contact@sirh-company.ma',
  ice: 'ICE000123456789',
  rc: 'RC 12345',
};
```

Modifiez ces valeurs dans le fichier PDF generator.

## Améliorations possibles

### Fonctionnalités avancées

1. **Signatures électroniques** : Intégrer une solution de signature numérique
2. **Envoi par email** : Envoyer automatiquement l'attestation par email
3. **Templates personnalisés** : Permettre plusieurs templates par type
4. **Multi-langues PDF** : Générer des PDFs en arabe ou anglais
5. **Cachet et logo** : Ajouter automatiquement le logo et le cachet de l'entreprise
6. **Historique détaillé** : Tracer toutes les actions sur une attestation
7. **Notifications** : Alerter les employés lors des changements de statut
8. **Export Excel** : Exporter la liste des attestations
9. **Statistiques avancées** : Graphiques et rapports

### Sécurité

1. **Permissions** : Contrôler qui peut approuver/générer
2. **Audit trail** : Logger toutes les actions
3. **Watermark** : Ajouter un filigrane de sécurité
4. **Numérotation sécurisée** : Garantir l'unicité des numéros

## Dépendances

- **jsPDF** (v3.0.4) : Génération de PDF
- **jspdf-autotable** (v5.0.2) : Tables dans les PDFs (pour évolutions futures)
- **date-fns** (v4.1.0) : Manipulation et formatage des dates
- **React** + **Next.js** : Framework frontend
- **shadcn/ui** : Composants UI

## Support multi-langues

Le module supporte trois langues :
- 🇫🇷 Français (fr)
- 🇬🇧 Anglais (en)
- 🇸🇦 Arabe (ar)

Toutes les traductions sont gérées via le contexte `LanguageContext` et les fichiers JSON dans `public/locales/`.

## Tests

Pour tester le module :

1. Démarrer le serveur mock : `npm run mock-server`
2. Démarrer l'application : `npm run dev`
3. Accéder à `/admin/personnel/attestations`
4. Les données de test sont automatiquement chargées

## Maintenance

### Ajouter un nouveau type d'attestation

1. Ajouter le type dans `src/types/attestation.ts`
2. Créer une méthode de génération dans `attestation-generator.ts`
3. Ajouter les traductions dans les 3 fichiers de langue
4. Mettre à jour l'interface utilisateur pour inclure le nouveau type

### Modifier le format de numérotation

Dans `page_old.tsx`, fonction `handleGenerate()` :

```typescript
const numeroAttestation = `ATT-${year}-${String(nextNum).padStart(3, '0')}`;
```

Personnalisez ce format selon vos besoins.

## Troubleshooting

### Le PDF ne se télécharge pas

- Vérifier que les données de l'employé sont complètes
- Vérifier la console pour les erreurs JavaScript
- S'assurer que jsPDF est correctement installé

### Les traductions ne s'affichent pas

- Vérifier que le fichier de langue contient la section `attestations`
- Recharger la page après avoir changé de langue
- Vérifier le contexte `LanguageContext`

### Les données ne se chargent pas

- Vérifier que le serveur mock est démarré
- Vérifier les endpoints dans le fichier `db.js`
- Vérifier les fichiers JSON dans `mock-data/`

## Auteur

Module développé pour SIRH Frontend - Système Intégré de Ressources Humaines

## Licence

Propriétaire - Tous droits réservés

