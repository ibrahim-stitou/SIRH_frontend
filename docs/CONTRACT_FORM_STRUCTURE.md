# Structure des Formulaires de Contrat

## Vue d'ensemble

Ce document décrit la structure des formulaires de création de contrat simplifiés, organisés en 3 onglets.

## Composants du Formulaire

### 1. GeneralInfoTab (Informations Générales)

**Champs du formulaire :**

#### Section : Informations de Base
- `reference` (string, optionnel) - Référence du contrat (ex: CTR-2024-001)
- `employe_id` (string/number, requis) - ID de l'employé
- `type` (enum, requis) - Type de contrat (CDI, CDD, etc.)

#### Section : Dates
- `dates.start_date` (date, requis) - Date de début du contrat
- `dates.end_date` (date, optionnel) - Date de fin (pour CDD)
- `dates.signature_date` (date, requis) - Date de signature

#### Section : Poste
- `job.function` (string) - Fonction (ex: Développeur Full Stack)
- `job.category` (string) - Catégorie Professionnelle
- `job.work_mode` (string) - Mode de Travail (Présentiel, Hybride, Télétravail)
- `job.classification` (string) - Classification (ex: Niveau 5 - Échelon 2)
- `job.work_location` (string) - Lieu de Travail
- `job.level` (string) - Niveau (ex: Senior)
- `job.responsibilities` (string) - Responsabilités

#### Section : Description
- `description` (string) - Description optionnelle du contrat

---

### 2. WorkScheduleTab (Horaires de Travail)

**Champs du formulaire :**

#### Section : Horaires de Travail
- `schedule.hours_per_day` (number) - Heures par jour (ex: 8)
- `schedule.days_per_week` (number) - Jours par semaine (ex: 5)
- `schedule.hours_per_week` (number) - Heures par semaine (ex: 40)
- `schedule.start_time` (time) - Heure de début (ex: 09:00)
- `schedule.end_time` (time) - Heure de fin (ex: 18:00)
- `schedule.break_duration` (number) - Durée pause en minutes (ex: 60)

#### Section : Travail en Shifts
- `schedule.shift_work.enabled` (boolean) - Activer le travail en shifts
- `schedule.shift_work.type` (enum) - Type de shift (Matin, Après-midi, Nuit, Rotation, Continu)
- `schedule.shift_work.rotation_days` (number) - Rotation en jours
- `schedule.shift_work.night_shift_premium` (number) - Prime de nuit en MAD
- `schedule.shift_work.description` (string) - Description du shift

#### Section : Période d'Essai
- `dates.trial_period.enabled` (boolean) - Activer la période d'essai
- `dates.trial_period.duration_months` (number) - Durée en mois
- `dates.trial_period.duration_days` (number) - Durée en jours
- `dates.trial_period.end_date` (date) - Date de fin d'essai
- `dates.trial_period.renewable` (boolean) - Renouvelable
- `dates.trial_period.max_renewals` (number) - Nombre max de renouvellements
- `dates.trial_period.conditions` (string) - Conditions de la période d'essai

#### Section : Congés
- `schedule.annual_leave_days` (number) - Congés annuels en jours
- `schedule.other_leaves` (string) - Autres congés

---

### 3. SalaryAndLegalTab (Salaire et Aspects Légaux)

**Champs du formulaire :**

#### Section : Salaire de Base
- `salary.base_salary` (number, requis) - Salaire de base en MAD
- `salary.salary_brut` (number, calculé) - Salaire brut total
- `salary.salary_net` (number, calculé) - Salaire net à payer
- `salary.payment_method` (string) - Méthode de paiement (Virement, Chèque, Espèces)
- `salary.periodicity` (string) - Périodicité (Mensuel par défaut)

#### Section : Primes Dynamiques
- `salary.primes.items[]` - Liste de primes
  - `prime_type_id` (string/number) - ID du type de prime
  - `label` (string) - Libellé de la prime
  - `amount` (number) - Montant en MAD
  - `is_taxable` (boolean) - Imposable IR
  - `is_subject_to_cnss` (boolean) - Soumise aux cotisations
  - `notes` (string) - Notes optionnelles

#### Section : Indemnités
- `salary.indemnites` (string) - Indemnités diverses

#### Section : Avantages en Nature
- `salary.avantages.voiture` (boolean) - Voiture de fonction
- `salary.avantages.logement` (boolean) - Logement de fonction
- `salary.avantages.telephone` (boolean) - Téléphone professionnel
- `salary.avantages.assurance_sante` (boolean) - Assurance santé
- `salary.avantages.autres` (boolean) - Autres avantages

#### Section : Cotisations Sociales

##### CNSS
- `legal.cnss_affiliation` (boolean) - Affiliation CNSS
- `legal.cotisations.cnss_employe_pct` (number) - Part employé % (défaut: 4.48%)
- `legal.cotisations.cnss_employeur_pct` (number) - Part employeur % (défaut: 8.98%)

##### AMO
- `legal.amo_affiliation` (boolean) - Affiliation AMO
- `legal.cotisations.amo_employe_pct` (number) - Part employé % (défaut: 2.26%)
- `legal.cotisations.amo_employeur_pct` (number) - Part employeur % (défaut: 2.26%)

##### CMIR (optionnel)
- `legal.cmir_affiliation` (boolean) - Affiliation CMIR
- `legal.cotisations.cmir_taux_pct` (number) - Taux de cotisation % (défaut: 6.0%)
- `legal.cotisations.cmir_numero` (string) - Numéro d'affiliation CMIR

##### RCAR (optionnel)
- `legal.rcar_affiliation` (boolean) - Affiliation RCAR
- `legal.cotisations.rcar_taux_pct` (number) - Taux de cotisation % (défaut: 20.0%)
- `legal.cotisations.rcar_numero` (string) - Numéro d'affiliation RCAR

#### Section : Aspects Légaux

##### Affiliations
- `legal.ir_applicable` (boolean) - IR Applicable
- `legal.mutuelle_affiliation` (boolean) - Affiliation Mutuelle
- `legal.assurance_groupe` (boolean) - Assurance Groupe

##### Clauses Contractuelles
- `legal.clause_confidentialite` (boolean) - Clause de Confidentialité
- `legal.clause_non_concurrence` (boolean) - Clause de Non-Concurrence
- `legal.clause_mobilite` (boolean) - Clause de Mobilité

##### Conditions
- `legal.duree_preavis_jours` (number) - Durée de préavis en jours
- `legal.indemnite_depart` (number) - Indemnité de départ en MAD
- `legal.conditions_speciales` (string) - Conditions spéciales
- `legal.notes_legales` (string) - Notes légales

---

## Calculs Automatiques

### Salaire Brut
```
Salaire Brut = Salaire de Base + Somme de toutes les primes
```

### Salaire Net
Le calcul du salaire net prend en compte :

1. **Base de calcul CNSS** = Salaire de base + Primes soumises à CNSS
2. **Cotisations employé** :
   - CNSS : Base CNSS × 4.48%
   - AMO : Base CNSS × 2.26%
   - CMIR (si applicable) : Base CNSS × Taux CMIR
   - RCAR (si applicable) : Base CNSS × Taux RCAR

3. **Base imposable IR** = Salaire de base + Primes imposables - Cotisations employé

4. **IR** (barème progressif marocain) :
   - 0 à 30 000 MAD/an : 0%
   - 30 001 à 50 000 MAD/an : 10%
   - 50 001 à 60 000 MAD/an : 20%
   - 60 001 à 80 000 MAD/an : 30%
   - 80 001 à 180 000 MAD/an : 34%
   - Au-delà de 180 000 MAD/an : 38%

5. **Salaire Net** = Salaire Brut - Cotisations employé - IR

---

## Types de Primes

Les primes peuvent être configurées avec :
- **Imposable IR** : Indique si la prime est soumise à l'impôt sur le revenu
- **Soumise aux cotisations** : Indique si la prime est incluse dans la base de calcul CNSS/AMO

Exemples :
- Prime de Transport : Non imposable, Non soumise aux cotisations
- Prime de Responsabilité : Imposable, Soumise aux cotisations
- Prime de Panier : Non imposable, Non soumise aux cotisations

---

## Fichiers Concernés

### Schémas et Validation
- `src/validations/contract-simplified.schema.ts` - Schéma Zod de validation

### Types TypeScript
- `src/types/contract.ts` - Définitions des types (référence complète)

### Composants
- `src/features/contract/components/GeneralInfoTab.tsx` - Onglet 1
- `src/features/contract/components/WorkScheduleTab.tsx` - Onglet 2
- `src/features/contract/components/SalaryAndLegalTab.tsx` - Onglet 3
- `src/features/contract/components/ContractRecapModal.tsx` - Modal de récapitulation
- `src/app/admin/contrats-mouvements/contrats/create/page.tsx` - Page de création

### Données Mock
- `mock-data/contracts.json` - Exemples de contrats

---

## Notes Importantes

1. **Champs obligatoires** :
   - `employe_id`
   - `type`
   - `dates.start_date`
   - `dates.signature_date`
   - `salary.base_salary`

2. **Calculs automatiques** :
   - Les salaires brut et net sont calculés automatiquement
   - Les modifications des primes, cotisations et IR recalculent immédiatement les salaires

3. **Conformité légale** :
   - Les taux de cotisations par défaut correspondent à la législation marocaine en vigueur
   - Le barème IR appliqué est le barème progressif marocain

4. **Primes dynamiques** :
   - Utilisation d'un système de primes dynamiques avec types prédéfinis
   - Possibilité d'ajouter plusieurs primes avec paramètres individuels

---

## Changements Effectués

### 1. Schema de Validation (`contract-simplified.schema.ts`)
- ✅ Supprimé `employee_details` et `title` (non présents dans les formulaires)
- ✅ Ajouté `cotisationsSchema` pour supporter les taux de cotisations
- ✅ Ajouté champs CMIR et RCAR dans `legal`
- ✅ Ajouté champs `clause_mobilite`, `duree_preavis_jours`, `indemnite_depart`
- ✅ Mis à jour les valeurs par défaut

### 2. Modal de Récapitulation (`ContractRecapModal.tsx`)
- ✅ Supprimé section "Informations Employé" (non présente dans formulaire)
- ✅ Ajouté affichage des primes dynamiques
- ✅ Ajouté affichage des shifts et période d'essai
- ✅ Ajouté affichage des avantages en nature
- ✅ Ajouté affichage des affiliations CMIR/RCAR
- ✅ Ajouté affichage de la clause de mobilité
- ✅ Amélioré la présentation visuelle

### 3. Données Mock (`contracts.json`)
- ✅ Ajouté 2 exemples de contrats avec la nouvelle structure
- ✅ Exemples incluent : CDI avec primes dynamiques, CDD avec travail en shifts
- ✅ Données cohérentes avec les champs des formulaires

---

## Exemple d'Utilisation

```typescript
import { SimplifiedContractInput } from '@/validations/contract-simplified.schema';

const contractData: SimplifiedContractInput = {
  reference: 'CTR-2025-001',
  type: 'CDI',
  employe_id: 1001,
  description: 'Contrat développeur senior',
  
  dates: {
    start_date: '2025-03-01',
    signature_date: '2025-02-15',
    trial_period: {
      enabled: true,
      duration_months: 3,
      duration_days: 90,
      renewable: true,
    }
  },
  
  job: {
    function: 'Développeur Full Stack',
    category: 'Cadre',
    work_mode: 'Hybride',
    work_location: 'Casablanca',
    level: 'Senior',
  },
  
  schedule: {
    hours_per_day: 8,
    days_per_week: 5,
    hours_per_week: 40,
    annual_leave_days: 22,
  },
  
  salary: {
    base_salary: 9000,
    payment_method: 'Virement',
    primes: {
      items: [
        {
          prime_type_id: 'transport',
          label: 'Prime Transport',
          amount: 500,
          is_taxable: false,
          is_subject_to_cnss: false,
        }
      ]
    },
    avantages: {
      telephone: true,
      assurance_sante: true,
    }
  },
  
  legal: {
    cnss_affiliation: true,
    amo_affiliation: true,
    ir_applicable: true,
    clause_confidentialite: true,
  }
};
```

