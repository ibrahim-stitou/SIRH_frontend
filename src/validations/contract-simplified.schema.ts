import { z } from 'zod';

/**
 * Schéma simplifié pour le formulaire avec 3 onglets
 */

// Schéma pour les dates
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

// Schéma pour les informations de l'employé
const employeeDetailsSchema = z.object({
  cin: z.string().optional(),
  cnss_number: z.string().optional(),
  birth_place: z.string().optional(),
  nationality: z.string().optional(),
});

// Schéma pour le poste
const simplifiedJobSchema = z.object({
  function: z.string().optional(),
  category: z.string().optional(),
  work_mode: z.string().optional(),
  classification: z.string().optional(),
  work_location: z.string().optional(),
  level: z.string().optional(),
  responsibilities: z.string().optional(),
  departement_id: z.union([z.string(), z.number()]).optional(),
});

// Schéma pour les horaires
const simplifiedScheduleSchema = z.object({
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
  // Travail en shifts
  shift_work: z.object({
    enabled: z.boolean().default(false),
    type: z.enum(['Matin', 'Apres_midi', 'Nuit', 'Rotation', 'Continu'] as const).optional(),
    rotation_days: z.number().min(1).max(30).optional(),
    night_shift_premium: z.number().min(0).optional(),
    description: z.string().optional(),
  }).optional(),
});

// Schéma pour les primes
const simplifiedPrimesSchema = z.object({
  prime_anciennete: z.number().min(0).optional(),
  prime_transport: z.number().min(0).optional(),
  prime_responsabilite: z.number().min(0).optional(),
  prime_performance: z.number().min(0).optional(),
  prime_panier: z.number().min(0).optional(),
  autres_primes: z.number().min(0).optional(),
});

// Schéma pour les avantages
const simplifiedAvantagesSchema = z.object({
  voiture: z.boolean().default(false),
  logement: z.boolean().default(false),
  telephone: z.boolean().default(false),
  assurance_sante: z.boolean().default(false),
  tickets_restaurant: z.boolean().default(false),
  autres: z.string().optional(),
});

// Schéma pour le salaire
const simplifiedSalarySchema = z.object({
  base_salary: z.number().min(1, 'Salaire de base requis'),
  salary_brut: z.number().optional(),
  salary_net: z.number().optional(),
  salary_net_imposable: z.number().optional(),
  currency: z.string().default('MAD'),
  payment_method: z.string().optional(),
  periodicity: z.string().default('Mensuel'),
  primes: simplifiedPrimesSchema.optional(),
  avantages: simplifiedAvantagesSchema.optional(),
  indemnites: z.string().optional(),
});

// Schéma pour les informations légales
const simplifiedLegalSchema = z.object({
  cnss_affiliation: z.boolean().default(true),
  amo_affiliation: z.boolean().default(true),
  ir_applicable: z.boolean().default(true),
  convention_collective: z.string().optional(),
  clause_confidentialite: z.boolean().default(false),
  clause_non_concurrence: z.boolean().default(false),
  conditions_speciales: z.string().optional(),
  notes_legales: z.string().optional(),
});

// Schéma principal simplifié
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
  title: z.string().optional(),
  description: z.string().optional(),

  // Employé
  employe_id: z.union([z.string(), z.number()]).refine(val => val !== '', {
    message: 'Employé requis'
  }),
  employee_details: employeeDetailsSchema.optional(),

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
  title: '',
  description: '',
  employe_id: '',

  employee_details: {
    cin: '',
    cnss_number: '',
    birth_place: '',
    nationality: 'Marocaine',
  },

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
    },
  },

  job: {
    function: '',
    category: 'Employe',
    work_mode: 'Presentiel',
    classification: '',
    work_location: '',
    level: '',
    responsibilities: '',
  },

  schedule: {
    hours_per_day: 8,
    days_per_week: 5,
    hours_per_week: 40,
    start_time: '09:00',
    end_time: '18:00',
    break_duration: 60,
    working_days: 'Lundi au Vendredi',
    annual_leave_days: 22,
    sick_leave_days: 10,
    shift_work: {
      enabled: false,
    },
  },

  salary: {
    base_salary: 0,
    salary_brut: 0,
    salary_net: 0,
    currency: 'MAD',
    payment_method: 'Virement',
    periodicity: 'Mensuel',
    primes: {
      prime_anciennete: 0,
      prime_transport: 0,
      prime_responsabilite: 0,
      prime_performance: 0,
      prime_panier: 0,
      autres_primes: 0,
    },
    avantages: {
      voiture: false,
      logement: false,
      telephone: false,
      assurance_sante: false,
      tickets_restaurant: false,
    },
  },

  legal: {
    cnss_affiliation: true,
    amo_affiliation: true,
    ir_applicable: true,
    convention_collective: 'Code du Travail',
    clause_confidentialite: false,
    clause_non_concurrence: false,
  },
};

