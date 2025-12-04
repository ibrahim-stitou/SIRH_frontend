/**
 * Schéma de validation Zod pour les contrats de travail
 * Adapté au marché du travail marocain
 */

import * as z from 'zod';
import type { ContractType, ContractStatus, ProfessionalCategory, WorkMode } from '@/types/contract';

// ============================================
// Schémas auxiliaires
// ============================================

/**
 * Schéma pour la période d'essai
 */
const trialPeriodSchema = z.object({
  duration_months: z.number().min(0).max(6),
  duration_days: z.number().min(0).max(90).optional(),
  renewable: z.boolean(),
  start_date: z.string(),
  end_date: z.string(),
  status: z.enum(['En_cours', 'Validee', 'Rompue']),
  evaluation_date: z.string().optional(),
  remarks: z.string().optional(),
});

/**
 * Schéma pour les dates du contrat
 */
const contractDatesSchema = z.object({
  signature_date: z.string().optional(),
  start_date: z.string().min(1, 'Date de début requise'),
  effective_start_date: z.string().optional(),
  end_date: z.string().nullable().optional(),
  expected_end_date: z.string().optional(),
  renewal_date: z.string().optional(),
  last_renewal_date: z.string().optional(),
  termination_date: z.string().optional(),
  termination_reason: z.string().optional(),
  termination_notice_date: z.string().optional(),
  notice_period_days: z.number().min(0).max(90).optional(),
  last_day_worked: z.string().optional(),
  trial_period: trialPeriodSchema.optional(),
}).refine((data) => {
  // Pour un CDD, la date de fin est obligatoire (sera vérifié au niveau parent)
  return true;
}, { message: "Validation des dates" });

/**
 * Schéma pour les informations du poste
 */
const jobInfoSchema = z.object({
  title: z.string().min(1, 'Intitulé du poste requis'),
  title_ar: z.string().optional(),
  department: z.string().min(1, 'Département requis'),
  department_id: z.union([z.string(), z.number()]).optional(),
  manager_id: z.union([z.string(), z.number()]).optional(),
  manager_name: z.string().optional(),

  // Classification
  category: z.enum([
    'Cadre_superieur', 'Cadre', 'Agent_maitrise', 'Technicien',
    'Employe', 'Ouvrier_qualifie', 'Ouvrier', 'Manoeuvre'
  ] as const),
  echelle: z.enum([
    'Echelle_1', 'Echelle_2', 'Echelle_3', 'Echelle_4', 'Echelle_5',
    'Echelle_6', 'Echelle_7', 'Echelle_8', 'Echelle_9', 'Echelle_10',
    'Echelle_11', 'Echelle_12', 'Hors_echelle'
  ] as const).optional(),
  coefficient: z.number().min(100).max(1000).optional(),
  grade: z.string().optional(),

  // Localisation
  work_location: z.string().min(1, 'Lieu de travail requis'),
  work_location_ar: z.string().optional(),
  additional_locations: z.array(z.string()).optional(),

  work_mode: z.enum(['Presentiel', 'Hybride', 'Teletravail', 'Itinerant', 'Horaire_variable'] as const),
  mobility_clause: z.boolean(),

  // Missions
  missions: z.string().min(10, 'Description des missions requise'),
  missions_ar: z.string().optional(),
  responsibilities: z.array(z.string()).optional(),
  objectives: z.string().optional(),
});

/**
 * Schéma pour le temps de travail
 */
const workTimeSchema = z.object({
  weekly_hours: z.number().min(20).max(48, 'Maximum 48h selon le Code du Travail'),
  daily_hours: z.number().min(4).max(10, 'Maximum 10h par jour'),
  annual_hours: z.number().optional(),

  work_schedule: z.string().min(1, 'Horaire de travail requis'),
  work_schedule_type: z.enum(['Normal', 'Equipe', 'Continu', 'Variable', 'Modulation'] as const),
  schedule_details: z.string().optional(),

  rest_day: z.string().min(1, 'Jour de repos requis'),
  additional_rest_days: z.array(z.string()).optional(),

  shift: z.string().nullable().optional(),
  rotation: z.boolean().optional(),
  night_work: z.boolean().optional(),
  weekend_work: z.boolean().optional(),

  on_call: z.boolean().optional(),
  overtime_authorized: z.boolean().optional(),
  compensatory_rest: z.boolean().optional(),

  annual_leave_days: z.number().min(18, 'Minimum 18 jours selon la loi').max(30),
  seniority_leave_bonus: z.number().min(0).max(10).optional(),
  special_leaves: z.object({
    marriage: z.number().default(4),
    birth: z.number().default(3),
    death_relative: z.number().default(3),
    circumcision: z.number().default(2),
    hajj: z.number().default(30),
  }).optional(),
});

/**
 * Schéma pour les primes
 */
const primesSchema = z.object({
  prime_anciennete: z.number().min(0).optional(),
  prime_anciennete_percentage: z.number().min(0).max(100).optional(),
  prime_transport: z.number().min(0).optional(),
  prime_panier: z.number().min(0).optional(),
  prime_rendement: z.number().min(0).optional(),
  prime_risque: z.number().min(0).optional(),
  prime_salissure: z.number().min(0).optional(),
  prime_nuit: z.number().min(0).optional(),
  prime_astreinte: z.number().min(0).optional(),
  prime_objectif: z.number().min(0).optional(),
  prime_13eme_mois: z.number().min(0).optional(),
  prime_exceptionnelle: z.number().min(0).optional(),
  treizieme_mois: z.boolean().optional(),
  quatorzieme_mois: z.boolean().optional(),
  participation_benefices: z.boolean().optional(),
  stock_options: z.boolean().optional(),
  other_primes: z.array(z.object({
    name: z.string(),
    name_ar: z.string().optional(),
    amount: z.number().min(0),
    frequency: z.enum(['Mensuel', 'Trimestriel', 'Annuel', 'Ponctuel'] as const),
    taxable: z.boolean(),
  })).optional(),
});

/**
 * Schéma pour les indemnités
 */
const indemnitesSchema = z.object({
  indemnite_logement: z.number().min(0).optional(),
  indemnite_deplacement: z.number().min(0).optional(),
  indemnite_representation: z.number().min(0).optional(),
  indemnite_km: z.number().min(0).nullable().optional(),
  indemnite_mission: z.number().min(0).optional(),
  indemnite_expatriation: z.number().min(0).optional(),
  frais_telephone: z.number().min(0).optional(),
  frais_internet: z.number().min(0).optional(),
  autres: z.array(z.object({
    name: z.string(),
    name_ar: z.string().optional(),
    amount: z.number().min(0),
    frequency: z.enum(['Mensuel', 'Trimestriel', 'Annuel'] as const),
    taxable: z.boolean(),
  })).optional(),
});

/**
 * Schéma pour les avantages en nature
 */
const avantagesNatureSchema = z.object({
  voiture_fonction: z.boolean().optional(),
  voiture_details: z.string().optional(),
  telephone: z.boolean().optional(),
  telephone_model: z.string().optional(),
  laptop: z.boolean().optional(),
  laptop_model: z.string().optional(),
  tickets_restaurant: z.boolean().optional(),
  tickets_amount: z.number().min(0).optional(),
  logement: z.boolean().optional(),
  logement_details: z.string().optional(),
  assurance_groupe: z.boolean().optional(),
  mutuelle_famille: z.boolean().optional(),
  transport_collectif: z.boolean().optional(),
  creche: z.boolean().optional(),
  formation: z.boolean().optional(),
  autres: z.array(z.object({
    name: z.string(),
    description: z.string().optional(),
    value_mensuel: z.number().min(0).optional(),
  })).optional(),
});

/**
 * Schéma pour les informations salariales
 */
const salaryInfoSchema = z.object({
  base_salary: z.number().min(3112.85, 'Salaire minimum SMIG 2025: 3112.85 MAD'),
  currency: z.string().default('MAD'),
  payment_frequency: z.enum(['Mensuel', 'Horaire', 'Journalier'] as const),

  salary_brut: z.number().min(0),
  salary_net: z.number().min(0),
  salary_net_imposable: z.number().min(0),
  salary_net_a_payer: z.number().min(0).optional(),

  hourly_rate: z.number().min(0).nullable().optional(),
  daily_rate: z.number().min(0).nullable().optional(),

  primes: primesSchema.optional(),
  indemnites: indemnitesSchema.optional(),
  avantages_nature: avantagesNatureSchema.optional(),

  payment_method: z.enum(['Virement', 'Cheque', 'Especes'] as const),
  bank_name: z.string().optional(),
  rib: z.string().length(24, 'RIB doit contenir 24 chiffres').optional(),
  payment_day: z.number().min(1).max(31).optional(),

  last_increase_date: z.string().optional(),
  last_increase_percentage: z.number().min(0).max(100).optional(),
  next_review_date: z.string().optional(),

  salary_history: z.array(z.object({
    date: z.string(),
    base_salary: z.number(),
    reason: z.string(),
  })).optional(),
});

/**
 * Schéma pour les informations légales
 */
const legalInfoSchema = z.object({
  // CNSS
  cnss_affiliation: z.boolean(),
  cnss_number: z.string().optional(),
  cnss_regime: z.enum(['General', 'Agricole', 'Artisanal', 'Pecheurs'] as const),
  cnss_rate_employee: z.number().min(0).max(20).default(4.48),
  cnss_rate_employer: z.number().min(0).max(30).default(16.46),

  // AMO
  amo: z.boolean(),
  amo_number: z.string().optional(),
  amo_regime: z.enum(['CNSS', 'CNOPS', 'Autres'] as const),
  amo_family_members: z.number().min(0).max(10).optional(),

  // Retraite
  cimr: z.boolean().optional(),
  cimr_rate_employee: z.number().min(0).max(10).optional(),
  cimr_rate_employer: z.number().min(0).max(10).optional(),
  rcar: z.boolean().optional(),
  other_retirement: z.string().optional(),

  // ANAPEC
  contrat_anapec: z.string().nullable().optional(),
  anapec_type: z.enum(['Idmaj', 'TAHIL', 'Autre'] as const).optional(),
  taxe_formation: z.boolean().optional(),

  // Fiscalité
  tax_ir: z.object({
    taux: z.number().min(0).max(38),
    exonere: z.boolean(),
    exoneration_reason: z.string().optional(),
    deductions: z.array(z.object({
      type: z.string(),
      amount: z.number(),
    })).optional(),
  }).optional(),

  // Convention collective
  convention_collective: z.string().optional(),
  convention_date: z.string().optional(),

  // Clauses
  clauses: z.object({
    confidentialite: z.boolean(),
    non_concurrence: z.boolean(),
    non_concurrence_duration: z.number().min(0).max(24).optional(),
    non_concurrence_compensation: z.number().min(0).optional(),
    mobilite: z.boolean(),
    mobilite_geographic_scope: z.string().optional(),
    exclusivite: z.boolean(),
    formation: z.boolean(),
    formation_engagement: z.number().min(0).max(5).optional(),
    intellectual_property: z.boolean(),
    discipline_interne: z.boolean(),
    deontologie: z.boolean(),
    teletravail: z.object({
      jours_par_semaine: z.number().min(1).max(5),
      materiel_fourni: z.array(z.string()),
      frais_rembourses: z.array(z.string()),
    }).optional(),
  }).optional(),

  // Médecine du travail
  visite_medicale_embauche: z.boolean().optional(),
  visite_medicale_date: z.string().optional(),
  visite_medicale_next: z.string().optional(),
  aptitude_medicale: z.enum(['Apte', 'Apte_reserves', 'Inapte_temporaire', 'Inapte'] as const).optional(),

  inspection_travail_notification: z.boolean().optional(),
  inspection_date: z.string().optional(),
});

/**
 * Schéma pour l'historique
 */
const contractHistorySchema = z.object({
  created_at: z.string(),
  created_by: z.string(),
  created_by_name: z.string().optional(),
  updated_at: z.string(),
  updated_by: z.string(),
  updated_by_name: z.string().optional(),
  versions: z.array(z.any()).optional(),
  modifications: z.array(z.any()).optional(),
  validations: z.array(z.any()).optional(),
  signatures: z.array(z.any()).optional(),
});

// ============================================
// Schéma principal du contrat
// ============================================

/**
 * Schéma de validation pour la création d'un contrat
 */
export const contractSchema = z.object({
  // Identification
  id: z.union([z.string(), z.number()]).optional(),
  reference: z.string().min(1, 'Référence du contrat requise'),
  internal_reference: z.string().optional(),
  type: z.enum([
    'CDI', 'CDD', 'CDD_Saisonnier', 'CDD_Temporaire',
    'ANAPEC', 'SIVP', 'TAHIL', 'Apprentissage',
    'Stage_PFE', 'Stage_Initiation', 'Interim',
    'Teletravail', 'Freelance', 'Consultance'
  ] as const),
  status: z.enum([
    'Brouillon', 'En_attente_signature', 'Actif', 'Periode_essai',
    'Suspendu', 'En_preavis', 'Resilie', 'Expire', 'Renouvele', 'Archive'
  ] as const),
  version: z.number().min(1).default(1),

  // Relations
  employe_id: z.union([z.string(), z.number()]).refine(val => val !== '', {
    message: 'Employé requis'
  }),
  employee_name: z.string().optional(),
  employee_matricule: z.string().optional(),
  company_id: z.union([z.string(), z.number()]).optional(),
  company_name: z.string().optional(),

  // Sections principales
  dates: contractDatesSchema,
  job: jobInfoSchema,
  work_time: workTimeSchema,
  salary: salaryInfoSchema,
  legal: legalInfoSchema,

  // Documents
  documents: z.any().optional(),

  // Historique
  historique: contractHistorySchema,

  // Notes
  notes: z.string().optional(),
  internal_notes: z.string().optional(),

  // Métadonnées
  custom_fields: z.record(z.any()).optional(),
  tags: z.array(z.string()).optional(),
  secteur: z.enum([
    'Industrie', 'Commerce', 'Services', 'BTP', 'Agriculture',
    'Transport', 'Banque', 'Assurance', 'Telecom', 'Informatique',
    'Education', 'Sante', 'Hotellerie', 'Tourisme', 'Autre'
  ] as const).optional(),
  archived: z.boolean().optional(),
  archived_date: z.string().optional(),
  archived_reason: z.string().optional(),
}).refine((data) => {
  // Pour un CDD, la date de fin est obligatoire
  if (data.type.startsWith('CDD') && !data.dates.end_date) {
    return false;
  }
  return true;
}, {
  message: "La date de fin est obligatoire pour un CDD",
  path: ["dates", "end_date"]
}).refine((data) => {
  // Vérifier la cohérence SMIG selon secteur
  const smig_general = 3112.85; // MAD/mois 2025
  const smig_agricole = 87.00; // MAD/jour 2025

  if (data.salary.payment_frequency === 'Mensuel' && data.salary.base_salary < smig_general) {
    return false;
  }
  return true;
}, {
  message: "Salaire inférieur au SMIG légal",
  path: ["salary", "base_salary"]
});

/**
 * Type inféré pour la création de contrat
 */
export type ContractCreateInput = z.infer<typeof contractSchema>;

/**
 * Valeurs par défaut pour le formulaire
 */
export const contractDefaultValues: Partial<ContractCreateInput> = {
  reference: '',
  type: 'CDI',
  status: 'Brouillon',
  version: 1,

  dates: {
    start_date: new Date().toISOString().split('T')[0],
    end_date: null,
    notice_period_days: 30,
    trial_period: {
      duration_months: 3,
      duration_days: 0,
      renewable: false,
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'En_cours',
    },
  },

  job: {
    title: '',
    department: '',
    category: 'Employe',
    work_location: '',
    work_mode: 'Presentiel',
    mobility_clause: false,
    missions: '',
  },

  work_time: {
    weekly_hours: 44,
    daily_hours: 8,
    work_schedule: '09:00 - 18:00',
    work_schedule_type: 'Normal',
    rest_day: 'Dimanche',
    annual_leave_days: 18,
    overtime_authorized: true,
    special_leaves: {
      marriage: 4,
      birth: 3,
      death_relative: 3,
      circumcision: 2,
      hajj: 30,
    },
  },

  salary: {
    base_salary: 3500,
    currency: 'MAD',
    payment_frequency: 'Mensuel',
    salary_brut: 3500,
    salary_net: 3000,
    salary_net_imposable: 3000,
    payment_method: 'Virement',
    primes: {
      prime_anciennete: 0,
      prime_transport: 0,
      prime_panier: 0,
    },
    indemnites: {},
    avantages_nature: {
      laptop: false,
      telephone: false,
      voiture_fonction: false,
    },
  },

  legal: {
    cnss_affiliation: true,
    cnss_regime: 'General',
    cnss_rate_employee: 4.48,
    cnss_rate_employer: 16.46,
    amo: true,
    amo_regime: 'CNSS',
    cimr: false,
    taxe_formation: true,
    tax_ir: {
      taux: 0,
      exonere: false,
    },
    clauses: {
      confidentialite: true,
      non_concurrence: false,
      mobilite: false,
      exclusivite: true,
      formation: true,
      intellectual_property: true,
      discipline_interne: true,
      deontologie: true,
    },
    visite_medicale_embauche: true,
  },

  historique: {
    created_at: new Date().toISOString(),
    created_by: 'admin',
    updated_at: new Date().toISOString(),
    updated_by: 'admin',
  },

  archived: false,
};

