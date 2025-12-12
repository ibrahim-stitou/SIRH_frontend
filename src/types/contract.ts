/**
 * Types et interfaces pour les contrats de travail
 * Adapté au marché du travail marocain selon le Code du Travail
 * Couvre tous les secteurs et tailles d'entreprises
 */

// ============================================
// Types de base
// ============================================

/**
 * Types de contrats selon le code du travail marocain (Dahir n° 1-03-194)
 */
export type ContractType =
  | 'CDI' // Contrat à Durée Indéterminée
  | 'CDD' // Contrat à Durée Déterminée
  | 'CDD_Saisonnier' // CDD pour travaux saisonniers
  | 'CDD_Temporaire' // CDD pour travaux temporaires
  | 'ANAPEC' // Contrat ANAPEC (Idmaj)
  | 'SIVP' // Stage d'Insertion à la Vie Professionnelle
  | 'TAHIL' // Programme TAHIL
  | 'Apprentissage' // Contrat d'apprentissage
  | 'Stage_PFE' // Stage de fin d'études
  | 'Stage_Initiation' // Stage d'initiation
  | 'Interim' // Travail intérimaire
  | 'Teletravail' // Contrat de télétravail (loi 2022)
  | 'Freelance' // Travail indépendant
  | 'Consultance'; // Contrat de consultance

/**
 * Statuts possibles d'un contrat
 */
export type ContractStatus =
  | 'Brouillon' // En cours de rédaction
  | 'En_attente_signature' // Envoyé pour signature
  | 'Actif' // En cours d'exécution
  | 'Periode_essai' // En période d'essai
  | 'Suspendu' // Suspension temporaire
  | 'En_preavis' // Période de préavis en cours
  | 'Resilie' // Résilié
  | 'Expire' // CDD expiré
  | 'Renouvele' // Renouvelé
  | 'Archive'; // Archivé

/**
 * Motifs de résiliation selon Code du Travail
 */
export type ResiliationReason =
  | 'Demission' // Démission volontaire
  | 'Demission_legitime' // Démission considérée comme légitime
  | 'Licenciement_economique' // Licenciement pour raisons économiques
  | 'Licenciement_faute_grave' // Licenciement pour faute grave
  | 'Licenciement_faute_lourde' // Licenciement pour faute lourde
  | 'Fin_CDD' // Terme du CDD
  | 'Fin_periode_essai' // Rupture pendant période d'essai
  | 'Retraite' // Départ en retraite
  | 'Retraite_anticipee' // Retraite anticipée
  | 'Deces' // Décès
  | 'Inaptitude_medicale' // Inaptitude constatée
  | 'Force_majeure' // Force majeure
  | 'Commun_accord' // Rupture d'un commun accord
  | 'Abandon_poste' // Abandon de poste
  | 'Mutation_externe' // Mutation vers autre entité
  | 'Fin_mission' // Fin de mission (intérim)
  | 'Non_renouvellement'; // Non-renouvellement CDD

/**
 * Modes de travail
 */
export type WorkMode =
  | 'Presentiel' // Sur site uniquement
  | 'Hybride' // Mixte présentiel/télétravail
  | 'Teletravail' // Télétravail complet
  | 'Itinerant' // Travail itinérant
  | 'Horaire_variable'; // Horaires variables

/**
 * Catégories professionnelles selon Convention Collective
 */
export type ProfessionalCategory =
  | 'Cadre_superieur' // Cadre supérieur
  | 'Cadre' // Cadre
  | 'Agent_maitrise' // Agent de maîtrise
  | 'Technicien' // Technicien
  | 'Employe' // Employé
  | 'Ouvrier_qualifie' // Ouvrier qualifié
  | 'Ouvrier' // Ouvrier
  | 'Manoeuvre'; // Manœuvre

/**
 * Niveaux d'échelle (classification)
 */
export type EchelleLevel =
  | 'Echelle_1'
  | 'Echelle_2'
  | 'Echelle_3'
  | 'Echelle_4'
  | 'Echelle_5'
  | 'Echelle_6'
  | 'Echelle_7'
  | 'Echelle_8'
  | 'Echelle_9'
  | 'Echelle_10'
  | 'Echelle_11'
  | 'Echelle_12'
  | 'Hors_echelle';

/**
 * Secteurs d'activité
 */
export type SecteurActivite =
  | 'Industrie'
  | 'Commerce'
  | 'Services'
  | 'BTP'
  | 'Agriculture'
  | 'Transport'
  | 'Banque'
  | 'Assurance'
  | 'Telecom'
  | 'Informatique'
  | 'Education'
  | 'Sante'
  | 'Hotellerie'
  | 'Tourisme'
  | 'Autre';

// ============================================
// Interfaces principales
// ============================================

/**
 * Période d'essai selon Code du Travail
 */
export interface TrialPeriod {
  // Simplified fields (forms):
  enabled?: boolean;
  duration_months?: number;
  duration_days?: number;
  end_date?: string | null;
  renewable?: boolean;
  max_renewals?: number;
  conditions?: string;
  // Legacy/detailed fields (optional)
  start_date?: string;
  status?: 'En_cours' | 'Validee' | 'Rompue';
  evaluation_date?: string;
  remarks?: string;
}

/**
 * Dates importantes du contrat
 */
export interface ContractDates {
  // Simplified
  signature_date?: string;
  start_date: string;
  end_date?: string | null;
  trial_period?: TrialPeriod; // now simplified-compatible
  // Legacy/detailed (optional)
  effective_start_date?: string;
  expected_end_date?: string;
  renewal_date?: string;
  last_renewal_date?: string;
  termination_date?: string;
  termination_reason?: ResiliationReason;
  termination_notice_date?: string;
  notice_period_days?: number;
  last_day_worked?: string;
}

/**
 * Informations du poste et classification
 */
export interface JobInfo {
  // Simplified fields used by forms
  metier?: string;
  emploie?: string;
  poste?: string;
  work_mode?: WorkMode | string;
  classification?: string;
  work_location?: string;
  level?: string;
  responsibilities?: string;

  // Legacy/detailed fields (optional)
  title?: string;
  title_ar?: string;
  department?: string;
  department_id?: number | string;
  manager_id?: string | number;
  manager_name?: string;
  category?: ProfessionalCategory;
  echelle?: EchelleLevel;
  coefficient?: number;
  grade?: string;
  work_location_ar?: string;
  additional_locations?: string[];
  mobility_clause?: boolean;
  missions?: string;
  missions_ar?: string;
  responsibilities_list?: string[]; // preserve array variant if used elsewhere
  objectives?: string;
}

/**
 * Temps de travail selon le Code du Travail
 */
export interface WorkTime {
  // Durées légales
  weekly_hours?: number;
  daily_hours?: number;
  annual_hours?: number; // Pour modulation

  // Horaires
  work_schedule?: string; // Horaire normal (ex: 9h-18h)
  work_schedule_type?:
    | 'Normal'
    | 'Equipe'
    | 'Continu'
    | 'Variable'
    | 'Modulation';
  schedule_details?: string;

  // Repos
  rest_day?: string; // Jour de repos hebdomadaire
  additional_rest_days?: string[]; // Repos additionnels

  // Organisation
  shift?: string | null; // Équipe (matin/soir/nuit)
  rotation?: boolean; // Rotation d'équipes
  night_work?: boolean; // Travail de nuit (21h-6h)
  weekend_work?: boolean; // Travail week-end

  // Astreintes et heures sup
  on_call?: boolean; // Astreintes
  overtime_authorized?: boolean; // Heures supplémentaires autorisées
  compensatory_rest?: boolean; // Repos compensateur

  // Congés selon Code du Travail
  annual_leave_days?: number; // Min 1.5j par mois (18j/an après 6 mois)
  seniority_leave_bonus?: number; // Jours bonus ancienneté
  special_leaves?: {
    // Congés spéciaux
    marriage: number; // 4 jours
    birth: number; // 3 jours
    death_relative: number; // 3 jours
    circumcision: number; // 2 jours
    hajj: number; // 30 jours (1 fois)
  };
}

// Simplified schedule used by forms and mock data
export interface SimplifiedSchedule {
  schedule_type: 'Administratif' | 'Continu';
  shift_work?: 'Non' | 'Oui';
  hours_per_day?: number;
  days_per_week?: number;
  hours_per_week?: number;
  start_time?: string;
  end_time?: string;
  break_duration?: number;
  working_days?: string;
  annual_leave_days?: number;
  sick_leave_days?: number;
  other_leaves?: string;
}

/**
 * Primes et indemnités détaillées
 */
export interface Primes {
  prime_anciennete?: number; // Prime d'ancienneté (5% après 2 ans)
  prime_anciennete_percentage?: number;
  prime_transport?: number; // Indemnité de transport
  prime_panier?: number; // Indemnité de panier/repas
  prime_rendement?: number; // Prime de rendement
  prime_risque?: number; // Prime de risque
  prime_salissure?: number; // Prime de salissure
  prime_nuit?: number; // Prime de nuit (majoration 25-50%)
  prime_astreinte?: number; // Prime d'astreinte
  prime_objectif?: number; // Prime sur objectifs
  prime_13eme_mois?: number; // 13ème mois
  prime_exceptionnelle?: number; // Prime exceptionnelle
  treizieme_mois?: boolean; // 13ème mois annuel
  quatorzieme_mois?: boolean; // 14ème mois
  participation_benefices?: boolean; // Participation aux bénéfices
  stock_options?: boolean; // Stock options
  other_primes?: Array<{
    name: string;
    name_ar?: string;
    amount: number;
    frequency: 'Mensuel' | 'Trimestriel' | 'Annuel' | 'Ponctuel';
    taxable: boolean;
  }>;
}

/**
 * Indemnités et remboursements
 */
export interface Indemnites {
  indemnite_logement?: number; // Indemnité de logement
  indemnite_deplacement?: number; // Indemnité de déplacement
  indemnite_representation?: number; // Indemnité de représentation
  indemnite_km?: number | null; // Indemnité kilométrique (tarif)
  indemnite_mission?: number; // Indemnité de mission
  indemnite_expatriation?: number; // Indemnité d'expatriation
  frais_telephone?: number; // Forfait téléphone
  frais_internet?: number; // Forfait internet (télétravail)
  autres?: Array<{
    name: string;
    name_ar?: string;
    amount: number;
    frequency: 'Mensuel' | 'Trimestriel' | 'Annuel';
    taxable: boolean;
  }>;
}

/**
 * Avantages en nature
 */
export interface AvantagesNature {
  voiture_fonction?: boolean; // Voiture de fonction
  voiture_details?: string;
  telephone?: boolean; // Téléphone professionnel
  telephone_model?: string;
  laptop?: boolean; // Ordinateur portable
  laptop_model?: string;
  tickets_restaurant?: boolean; // Tickets restaurant
  tickets_amount?: number;
  logement?: boolean; // Logement de fonction
  logement_details?: string;
  assurance_groupe?: boolean; // Assurance groupe
  mutuelle_famille?: boolean; // Mutuelle famille
  transport_collectif?: boolean; // Transport entreprise
  creche?: boolean; // Crèche d'entreprise
  formation?: boolean; // Formation continue
  autres?: Array<{
    name: string;
    description?: string;
    value_mensuel?: number;
  }>;
}

/**
 * Informations salariales complètes
 */
export interface SalaryInfo {
  // Salaire de base
  base_salary?: number; // Salaire de base brut
  currency?: string; // MAD par défaut
  payment_frequency?: 'Mensuel' | 'Horaire' | 'Journalier';

  // Calculs
  salary_brut?: number; // Salaire brut total
  salary_net?: number; // Salaire net avant IR
  salary_net_imposable?: number; // Salaire net imposable
  salary_net_a_payer?: number; // Salaire net à payer

  hourly_rate?: number | null; // Taux horaire
  daily_rate?: number | null; // Taux journalier

  // Composantes
  primes?: Primes & {
    items?: Array<{
      prime_type_id: string | number;
      prime_type_code?: string;
      label: string;
      amount: number;
      is_taxable?: boolean;
      is_subject_to_cnss?: boolean;
      notes?: string;
    }>;
  };
  indemnites?: Indemnites;
  avantages_nature?: AvantagesNature;

  // Simplified additions
  payment_method?: string;
  periodicity?: string; // 'Mensuel' etc.
  avantages?: {
    voiture?: boolean;
    logement?: boolean;
    telephone?: boolean;
    assurance_sante?: boolean;
    tickets_restaurant?: boolean;
  };
}

/**
 * Informations légales et protection sociale
 */
export interface LegalInfo {
  // CNSS (Caisse Nationale de Sécurité Sociale)
  cnss_affiliation: boolean;
  cnss_number?: string; // Numéro d'affiliation CNSS
  cnss_regime: 'General' | 'Agricole' | 'Artisanal' | 'Pecheurs';
  cnss_rate_employee?: number; // Taux cotisation salarié (4.48%)
  cnss_rate_employer?: number; // Taux cotisation employeur (16.46%)

  // AMO (Assurance Maladie Obligatoire)
  amo?: boolean; // legacy
  amo_affiliation?: boolean; // simplified
  amo_number?: string;
  amo_regime: 'CNSS' | 'CNOPS' | 'Autres';
  amo_family_members?: number; // Nombre d'ayants droit

  // Retraite complémentaire
  cimr?: boolean; // CIMR (legacy)
  cmir_affiliation?: boolean; // simplified
  cimr_rate_employee?: number;
  cimr_rate_employer?: number;
  rcar?: boolean; // RCAR (legacy)
  rcar_affiliation?: boolean; // simplified
  other_retirement?: string;

  // ANAPEC / Formation
  contrat_anapec?: string | null; // Numéro contrat ANAPEC
  anapec_type?: 'Idmaj' | 'TAHIL' | 'Autre';
  taxe_formation?: boolean; // Taxe de formation professionnelle (1.6%)

  // Fiscalité
  tax_ir?: {
    taux: number; // Taux effectif IR
    exonere: boolean; // Exonéré d'IR
    exoneration_reason?: string; // Raison de l'exonération
    deductions?: Array<{
      // Déductions fiscales
      type: string;
      amount: number;
    }>;
  };

  // Simplified flags
  mutuelle_affiliation?: boolean;
  assurance_groupe?: boolean;
  ir_applicable?: boolean;
  convention_collective?: string;
  clause_confidentialite?: boolean;
  clause_non_concurrence?: boolean;
  clause_mobilite?: boolean;
  duree_preavis_jours?: number;
  indemnite_depart?: number;
  conditions_speciales?: string;
  notes_legales?: string;
  cotisations?: {
    cnss_employe_pct?: number;
    cnss_employeur_pct?: number;
    amo_employe_pct?: number;
    amo_employeur_pct?: number;
    cmir_taux_pct?: number;
    cmir_numero?: string;
    rcar_taux_pct?: number;
    rcar_numero?: string;
  };

  // Convention collective applicable
  convention_date?: string;

  // Clauses contractuelles
  clauses?: {
    confidentialite: boolean; // Clause de confidentialité
    non_concurrence: boolean; // Clause de non-concurrence
    non_concurrence_duration?: number; // Durée en mois
    non_concurrence_compensation?: number; // Compensation financière
    mobilite: boolean; // Clause de mobilité
    mobilite_geographic_scope?: string; // Périmètre géographique
    exclusivite: boolean; // Clause d'exclusivité
    formation: boolean; // Clause de formation
    formation_engagement?: number; // Engagement en années
    intellectual_property: boolean; // Propriété intellectuelle
    discipline_interne: boolean; // Règlement intérieur
    deontologie: boolean; // Code de déontologie
    teletravail?: {
      // Accord de télétravail
      jours_par_semaine: number;
      materiel_fourni: string[];
      frais_rembourses: string[];
    };
  };

  // Inspection du travail
  inspection_travail_notification?: boolean;
  inspection_date?: string;

  // Médecine du travail
  visite_medicale_embauche?: boolean;
  visite_medicale_date?: string;
  visite_medicale_next?: string;
  aptitude_medicale?: 'Apte' | 'Apte_reserves' | 'Inapte_temporaire' | 'Inapte';
}

/**
 * Documents associés au contrat
 */
export interface ContractDocuments {
  contrat_signe?: string; // URL/ID du contrat signé
  avenants?: Array<{
    id: string;
    numero: number;
    date: string;
    objet: string;
    description: string;
    document_url?: string;
    signe: boolean;
  }>;
  annexes?: Array<{
    id: string;
    titre: string;
    type: string;
    document_url: string;
    date_ajout: string;
  }>;
  attestations?: Array<{
    type: 'Travail' | 'Salaire' | 'Stage' | 'Autre';
    date_emission: string;
    document_url: string;
  }>;
}

/**
 * Historique et suivi des modifications
 */
export interface ContractHistory {
  created_at: string;
  created_by: string;
  created_by_name?: string;
  updated_at: string;
  updated_by: string;
  updated_by_name?: string;

  versions?: Array<{
    version: number;
    date: string;
    author: string;
    changes: string;
    description?: string;
  }>;

  modifications?: Array<{
    date: string;
    author: string;
    field: string;
    old_value: any;
    new_value: any;
    reason?: string;
  }>;

  validations?: Array<{
    date: string;
    validator: string;
    validator_role: string;
    status: 'Approuve' | 'Rejete' | 'En_attente';
    comments?: string;
  }>;

  signatures?: Array<{
    signatory: string;
    role: 'Employe' | 'Employeur' | 'Temoin' | 'RH';
    date: string;
    method: 'Manuscrite' | 'Electronique';
    ip_address?: string;
  }>;
}

// ============================================
// Interface principale du contrat
// ============================================

/**
 * Interface complète d'un contrat de travail marocain
 * Conforme au Code du Travail et adaptée à tous les secteurs
 */
export interface Contract {
  // Identification
  id: string | number;
  reference: string; // Référence unique du contrat
  internal_reference?: string; // Référence interne entreprise
  type: ContractType;
  status: ContractStatus;
  version?: number;

  // Relations
  employe_id: string | number;
  employee_name?: string; // Cache pour affichage
  employee_matricule?: string;
  company_id?: string | number; // Pour multi-sociétés
  company_name?: string;

  // Dates et durée
  dates: ContractDates;

  // Poste et classification
  job: JobInfo;

  // Temps de travail
  work_time?: WorkTime; // legacy optional
  schedule?: SimplifiedSchedule; // simplified

  // Rémunération
  salary: SalaryInfo;

  // Aspects légaux
  legal: LegalInfo;

  // Documents
  documents?: ContractDocuments;

  // Signed document uploaded
  signed_document?: {
    url: string;
    name: string;
    uploaded_at: string;
  };

  // Historique et traçabilité
  historique: ContractHistory;

  // Remarques et notes
  notes?: string;
  internal_notes?: string; // Notes internes RH

  // Champs personnalisés par secteur/entreprise
  custom_fields?: Record<string, any>;

  // Métadonnées
  tags?: string[]; // Tags pour classification
  secteur?: SecteurActivite;
  archived?: boolean;
  archived_date?: string;
  archived_reason?: string;
}

// ============================================
// Types pour formulaires et API
// ============================================

/**
 * Input pour la création d'un contrat
 */
export interface ContractCreateInput
  extends Omit<Contract, 'id' | 'version' | 'historique'> {
  id?: string | number;
}

/**
 * Input pour la mise à jour d'un contrat
 */
export interface ContractUpdateInput extends Partial<Contract> {
  id: string | number;
}

/**
 * Réponse API
 */
export interface ContractResponse {
  data: Contract;
}

export interface ContractsResponse {
  data: Contract[];
  total?: number;
  page?: number;
  pageSize?: number;
}
