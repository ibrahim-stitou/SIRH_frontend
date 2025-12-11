import { z } from 'zod';

/**
 * Schéma simplifié pour le formulaire avec 3 onglets
 * Adapté aux champs existants dans GeneralInfoTab, WorkScheduleTab, SalaryAndLegalTab
 */

// Schéma pour les dates (GeneralInfoTab)
const simplifiedDatesSchema = z.object({
  start_date: z.string().min(1, 'Date de début requise'),
  end_date: z.string().nullable().optional(),
  signature_date: z.string().min(1, 'Date de signature requise'),
  trial_period: z.object({
    enabled: z.boolean().default(false),
    duration_months: z.number().min(0).max(12).optional(),
    duration_days: z.number().min(0).max(365).optional(),
    end_date: z.string().nullable().optional(),
    renewable: z.boolean().optional(),
    max_renewals: z.number().min(0).max(3).optional(),
    conditions: z.string().optional(),
  }).optional(),
});

// Schéma pour le poste (GeneralInfoTab)
const simplifiedJobSchema = z.object({
  metier: z.string().optional(),
  emploie: z.string().optional(),
  poste: z.string().optional(),
  work_mode: z.string().optional(),
  classification: z.string().optional(),
  work_location: z.string().optional(),
  level: z.string().optional(),
  responsibilities: z.string().optional(),
});

// Schéma pour les horaires (simplifié)
const simplifiedScheduleSchema = z.object({
  // Champs principaux utilisés
  schedule_type: z.enum(['Administratif', 'Continu'] as const),
  shift_work: z.enum(['Non', 'Oui'] as const).optional(),
  // Champs optionnels conservés pour compatibilité
  hours_per_day: z.number().min(4).max(10).optional(),
  days_per_week: z.number().min(1).max(7).optional(),
  hours_per_week: z.number().min(20).max(48).optional(),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  break_duration: z.number().min(0).optional(),
  working_days: z.string().optional(),
  annual_leave_days: z.number().min(18).max(30).optional(),
  sick_leave_days: z.number().min(0).optional(),
  other_leaves: z.string().optional(),
});

// Schéma pour une prime individuelle
const primeItemSchema = z.object({
  prime_type_id: z.union([z.string(), z.number()]),
  prime_type_code: z.string().optional(),
  label: z.string(),
  amount: z.number().min(0),
  is_taxable: z.boolean().default(true),
  is_subject_to_cnss: z.boolean().default(true),
  notes: z.string().optional(),
});

// Schéma pour les primes (ancien format pour compatibilité)
const simplifiedPrimesSchema = z.object({
  prime_anciennete: z.number().min(0).optional(),
  prime_transport: z.number().min(0).optional(),
  prime_responsabilite: z.number().min(0).optional(),
  prime_performance: z.number().min(0).optional(),
  prime_panier: z.number().min(0).optional(),
  autres_primes: z.number().min(0).optional(),
  // Nouveau: liste dynamique de primes
  items: z.array(primeItemSchema).optional(),
});

// Schéma pour les avantages
const simplifiedAvantagesSchema = z.object({
  voiture: z.boolean().default(false),
  logement: z.boolean().default(false),
  telephone: z.boolean().default(false),
  assurance_sante: z.boolean().default(false),
  tickets_restaurant: z.boolean().default(false),
});

// Schéma pour le salaire
const simplifiedSalarySchema = z.object({
  salary_brut: z.number().min(1, 'Salaire brut requis'),
  salary_net: z.number().min(1, 'Salaire net requis'),
  salary_net_imposable: z.number().optional(),
  currency: z.string().default('MAD'),
  payment_method: z.string().optional(),
  periodicity: z.string().default('Mensuel'),
  primes: simplifiedPrimesSchema.optional(),
  avantages: simplifiedAvantagesSchema.optional(),
  indemnites: z.string().optional(),
});

// Schéma pour les cotisations sociales (SalaryAndLegalTab)
const cotisationsSchema = z.object({
  cnss_employe_pct: z.number().min(0).max(100).optional(),
  cnss_employeur_pct: z.number().min(0).max(100).optional(),
  amo_employe_pct: z.number().min(0).max(100).optional(),
  amo_employeur_pct: z.number().min(0).max(100).optional(),
  cmir_taux_pct: z.number().min(0).max(100).optional(),
  cmir_numero: z.string().optional(),
  rcar_taux_pct: z.number().min(0).max(100).optional(),
  rcar_numero: z.string().optional(),
});

// Schéma pour les informations légales (SalaryAndLegalTab)
const simplifiedLegalSchema = z.object({
  cnss_affiliation: z.boolean().default(true),
  amo_affiliation: z.boolean().default(true),
  cmir_affiliation: z.boolean().default(false).optional(),
  rcar_affiliation: z.boolean().default(false).optional(),
  mutuelle_affiliation: z.boolean().default(false).optional(),
  assurance_groupe: z.boolean().default(false).optional(),
  ir_applicable: z.boolean().default(true),
  convention_collective: z.string().optional(),
  clause_confidentialite: z.boolean().default(false),
  clause_non_concurrence: z.boolean().default(false),
  clause_mobilite: z.boolean().default(false).optional(),
  duree_preavis_jours: z.number().min(0).optional(),
  indemnite_depart: z.number().min(0).optional(),
  conditions_speciales: z.string().optional(),
  notes_legales: z.string().optional(),
  cotisations: cotisationsSchema.optional(),
});

// Schéma principal simplifié (adapté aux 3 onglets du formulaire)
export const simplifiedContractSchema = z.object({
  // Identification
  id: z.union([z.string(), z.number()]).optional(),
  reference: z.string().optional(),
  type: z.enum([
    'CDI', 'CDD', 'CDD_Saisonnier', 'CDD_Temporaire',
    'ANAPEC', 'SIVP', 'TAHIL', 'Apprentissage',
    'Stage_PFE', 'Stage_Initiation', 'Interim',
    'Teletravail', 'Freelance', 'Consultance'
  ] as const),
  description: z.string().optional(),

  // Employé (GeneralInfoTab)
  employe_id: z.union([z.string(), z.number()])
    .refine(val => val !== '' && val !== null && val !== undefined, {
      message: 'Employé requis'
    }),

  // Sections
  dates: simplifiedDatesSchema,
  job: simplifiedJobSchema.optional(),
  schedule: simplifiedScheduleSchema.optional(),
  salary: simplifiedSalarySchema,
  legal: simplifiedLegalSchema.optional(),
});

export type SimplifiedContractInput = z.infer<typeof simplifiedContractSchema>;

export const simplifiedContractDefaultValues: Partial<SimplifiedContractInput> = {
  reference: '',
  type: 'CDI',
  description: '',
  employe_id: '',

  dates: {
    start_date: new Date().toISOString().split('T')[0],
    end_date: null,
    signature_date: new Date().toISOString().split('T')[0],
    trial_period: {
      enabled: false,
      duration_months: 3,
      duration_days: 90,
      renewable: false,
      max_renewals: 1,
      conditions: '',
    },
  },

  job: {
    metier: '',
    emploie: '',
    poste: '',
    work_mode: 'Presentiel',
    classification: '',
    work_location: '',
    level: '',
    responsibilities: '',
  },

  schedule: {
    schedule_type: 'Administratif',
    shift_work: 'Non',
    hours_per_day: 8,
    days_per_week: 5,
    hours_per_week: 40,
    start_time: '09:00',
    end_time: '18:00',
    break_duration: 60,
    annual_leave_days: 22,
    other_leaves: '',
  },

  salary: {
    salary_brut: 0,
    salary_net: 0,
    currency: 'MAD',
    payment_method: 'Virement',
    periodicity: 'Mensuel',
    primes: {
      items: [],
    },
    avantages: {
      voiture: false,
      logement: false,
      telephone: false,
      assurance_sante: false,
      tickets_restaurant: false
    },
    indemnites: '',
  },

  legal: {
    cnss_affiliation: true,
    amo_affiliation: true,
    cmir_affiliation: false,
    rcar_affiliation: false,
    mutuelle_affiliation: false,
    assurance_groupe: false,
    ir_applicable: true,
    convention_collective: 'Code du Travail',
    clause_confidentialite: false,
    clause_non_concurrence: false,
    clause_mobilite: false,
    duree_preavis_jours: 30,
    indemnite_depart: 0,
    conditions_speciales: '',
    notes_legales: '',
    cotisations: {
      cnss_employe_pct: 4.48,
      cnss_employeur_pct: 8.98,
      amo_employe_pct: 2.26,
      amo_employeur_pct: 2.26,
      cmir_taux_pct: 6.0,
      cmir_numero: '',
      rcar_taux_pct: 20.0,
      rcar_numero: '',
    },
  },
};

