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
  | 'CDI'              // Contrat à Durée Indéterminée
  | 'CDD'              // Contrat à Durée Déterminée
  | 'CDD_Saisonnier'   // CDD pour travaux saisonniers
  | 'CDD_Temporaire'   // CDD pour travaux temporaires
  | 'ANAPEC'           // Contrat ANAPEC (Idmaj)
  | 'SIVP'             // Stage d'Insertion à la Vie Professionnelle
  | 'TAHIL'            // Programme TAHIL
  | 'Apprentissage'    // Contrat d'apprentissage
  | 'Stage_PFE'        // Stage de fin d'études
  | 'Stage_Initiation' // Stage d'initiation
  | 'Interim'          // Travail intérimaire
  | 'Teletravail'      // Contrat de télétravail (loi 2022)
  | 'Freelance'        // Travail indépendant
  | 'Consultance';     // Contrat de consultance

/**
 * Statuts possibles d'un contrat
 */
export type ContractStatus =
  | 'Brouillon'       // En cours de rédaction
  | 'En_attente_signature' // Envoyé pour signature
  | 'Actif'           // En cours d'exécution
  | 'Periode_essai'   // En période d'essai
  | 'Suspendu'        // Suspension temporaire
  | 'En_preavis'      // Période de préavis en cours
  | 'Resilie'         // Résilié
  | 'Expire'          // CDD expiré
  | 'Renouvele'       // Renouvelé
  | 'Archive';        // Archivé

/**
 * Motifs de résiliation selon Code du Travail
 */
export type ResiliationReason =
  | 'Demission'                    // Démission volontaire
  | 'Demission_legitime'           // Démission considérée comme légitime
  | 'Licenciement_economique'      // Licenciement pour raisons économiques
  | 'Licenciement_faute_grave'     // Licenciement pour faute grave
  | 'Licenciement_faute_lourde'    // Licenciement pour faute lourde
  | 'Fin_CDD'                      // Terme du CDD
  | 'Fin_periode_essai'            // Rupture pendant période d'essai
  | 'Retraite'                     // Départ en retraite
  | 'Retraite_anticipee'           // Retraite anticipée
  | 'Deces'                        // Décès
  | 'Inaptitude_medicale'          // Inaptitude constatée
  | 'Force_majeure'                // Force majeure
  | 'Commun_accord'                // Rupture d'un commun accord
  | 'Abandon_poste'                // Abandon de poste
  | 'Mutation_externe'             // Mutation vers autre entité
  | 'Fin_mission'                  // Fin de mission (intérim)
  | 'Non_renouvellement';          // Non-renouvellement CDD

/**
 * Modes de travail
 */
export type WorkMode =
  | 'Presentiel'      // Sur site uniquement
  | 'Hybride'         // Mixte présentiel/télétravail
  | 'Teletravail'     // Télétravail complet
  | 'Itinerant'       // Travail itinérant
  | 'Horaire_variable'; // Horaires variables

/**
 * Catégories professionnelles selon Convention Collective
 */
export type ProfessionalCategory =
  | 'Cadre_superieur'    // Cadre supérieur
  | 'Cadre'              // Cadre
  | 'Agent_maitrise'     // Agent de maîtrise
  | 'Technicien'         // Technicien
  | 'Employe'            // Employé
  | 'Ouvrier_qualifie'   // Ouvrier qualifié
  | 'Ouvrier'            // Ouvrier
  | 'Manoeuvre';         // Manœuvre

/**
 * Niveaux d'échelle (classification)
 */
export type EchelleLevel =
  | 'Echelle_1' | 'Echelle_2' | 'Echelle_3' | 'Echelle_4' | 'Echelle_5'
  | 'Echelle_6' | 'Echelle_7' | 'Echelle_8' | 'Echelle_9' | 'Echelle_10'
  | 'Echelle_11' | 'Echelle_12' | 'Hors_echelle';

/**
 * Secteurs d'activité
 */
export type SecteurActivite =
  | 'Industrie' | 'Commerce' | 'Services' | 'BTP'
  | 'Agriculture' | 'Transport' | 'Banque' | 'Assurance'
  | 'Telecom' | 'Informatique' | 'Education' | 'Sante'
  | 'Hotellerie' | 'Tourisme' | 'Autre';

// ============================================
// Interfaces principales
// ============================================

/**
 * Période d'essai selon Code du Travail
 */
export interface TrialPeriod {
  duration_months: number;        // 3 mois cadres, 1.5 mois employés, 15j ouvriers
  duration_days?: number;         // Pour les ouvriers (15 jours)
  renewable: boolean;             // Renouvelable 1 fois
  start_date: string;
  end_date: string;
  status: 'En_cours' | 'Validee' | 'Rompue';
  evaluation_date?: string;
  remarks?: string;
}

/**
 * Dates importantes du contrat
 */
export interface ContractDates {
  signature_date?: string;
  start_date: string;
  effective_start_date?: string;  // Date d'effet réelle
  end_date?: string | null;       // Pour CDD
  expected_end_date?: string;     // Date de fin prévue
  renewal_date?: string;
  last_renewal_date?: string;
  termination_date?: string;
  termination_reason?: ResiliationReason;
  termination_notice_date?: string; // Date de notification
  notice_period_days?: number;    // Durée du préavis (8j-3mois)
  last_day_worked?: string;       // Dernier jour travaillé
  trial_period?: TrialPeriod;
}

/**
 * Informations du poste et classification
 */
export interface JobInfo {
  title: string;                      // Intitulé du poste
  title_ar?: string;                  // Intitulé en arabe
  department: string;                 // Département/Service
  department_id?: number | string;
  manager_id?: string | number;       // Responsable hiérarchique
  manager_name?: string;

  // Classification professionnelle
  category: ProfessionalCategory;     // Catégorie professionnelle
  echelle?: EchelleLevel;            // Niveau d'échelle
  coefficient?: number;               // Coefficient selon Convention Collective
  grade?: string;                     // Grade

  // Localisation
  work_location: string;              // Lieu de travail principal
  work_location_ar?: string;
  additional_locations?: string[];    // Autres lieux possibles

  work_mode: WorkMode;                // Mode de travail
  mobility_clause: boolean;           // Clause de mobilité

  // Missions et responsabilités
  missions: string;                   // Description des missions
  missions_ar?: string;
  responsibilities?: string[];        // Responsabilités principales
  objectives?: string;                // Objectifs annuels
}

/**
 * Temps de travail selon le Code du Travail
 */
export interface WorkTime {
  // Durées légales
  weekly_hours: number;               // Max 44h (loi), possibilité 40-48h
  daily_hours: number;                // Max 10h par jour
  annual_hours?: number;              // Pour modulation

  // Horaires
  work_schedule: string;              // Horaire normal (ex: 9h-18h)
  work_schedule_type: 'Normal' | 'Equipe' | 'Continu' | 'Variable' | 'Modulation';
  schedule_details?: string;

  // Repos
  rest_day: string;                   // Jour de repos hebdomadaire
  additional_rest_days?: string[];    // Repos additionnels

  // Organisation
  shift?: string | null;              // Équipe (matin/soir/nuit)
  rotation?: boolean;                 // Rotation d'équipes
  night_work?: boolean;               // Travail de nuit (21h-6h)
  weekend_work?: boolean;             // Travail week-end

  // Astreintes et heures sup
  on_call?: boolean;                  // Astreintes
  overtime_authorized?: boolean;      // Heures supplémentaires autorisées
  compensatory_rest?: boolean;        // Repos compensateur

  // Congés selon Code du Travail
  annual_leave_days: number;          // Min 1.5j par mois (18j/an après 6 mois)
  seniority_leave_bonus?: number;     // Jours bonus ancienneté
  special_leaves?: {                  // Congés spéciaux
    marriage: number;                 // 4 jours
    birth: number;                    // 3 jours
    death_relative: number;           // 3 jours
    circumcision: number;             // 2 jours
    hajj: number;                     // 30 jours (1 fois)
  };
}

/**
 * Primes et indemnités détaillées
 */
export interface Primes {
  prime_anciennete?: number;          // Prime d'ancienneté (5% après 2 ans)
  prime_anciennete_percentage?: number;
  prime_transport?: number;           // Indemnité de transport
  prime_panier?: number;              // Indemnité de panier/repas
  prime_rendement?: number;           // Prime de rendement
  prime_risque?: number;              // Prime de risque
  prime_salissure?: number;           // Prime de salissure
  prime_nuit?: number;                // Prime de nuit (majoration 25-50%)
  prime_astreinte?: number;           // Prime d'astreinte
  prime_objectif?: number;            // Prime sur objectifs
  prime_13eme_mois?: number;          // 13ème mois
  prime_exceptionnelle?: number;      // Prime exceptionnelle
  treizieme_mois?: boolean;           // 13ème mois annuel
  quatorzieme_mois?: boolean;         // 14ème mois
  participation_benefices?: boolean;  // Participation aux bénéfices
  stock_options?: boolean;            // Stock options
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
  indemnite_logement?: number;        // Indemnité de logement
  indemnite_deplacement?: number;     // Indemnité de déplacement
  indemnite_representation?: number;  // Indemnité de représentation
  indemnite_km?: number | null;       // Indemnité kilométrique (tarif)
  indemnite_mission?: number;         // Indemnité de mission
  indemnite_expatriation?: number;    // Indemnité d'expatriation
  frais_telephone?: number;           // Forfait téléphone
  frais_internet?: number;            // Forfait internet (télétravail)
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
  voiture_fonction?: boolean;         // Voiture de fonction
  voiture_details?: string;
  telephone?: boolean;                // Téléphone professionnel
  telephone_model?: string;
  laptop?: boolean;                   // Ordinateur portable
  laptop_model?: string;
  tickets_restaurant?: boolean;       // Tickets restaurant
  tickets_amount?: number;
  logement?: boolean;                 // Logement de fonction
  logement_details?: string;
  assurance_groupe?: boolean;         // Assurance groupe
  mutuelle_famille?: boolean;         // Mutuelle famille
  transport_collectif?: boolean;      // Transport entreprise
  creche?: boolean;                   // Crèche d'entreprise
  formation?: boolean;                // Formation continue
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
  base_salary: number;                // Salaire de base brut
  currency: string;                   // MAD par défaut
  payment_frequency: 'Mensuel' | 'Horaire' | 'Journalier';

  // Calculs
  salary_brut: number;                // Salaire brut total
  salary_net: number;                 // Salaire net avant IR
  salary_net_imposable: number;       // Salaire net imposable
  salary_net_a_payer?: number;        // Salaire net à payer

  hourly_rate?: number | null;        // Taux horaire
  daily_rate?: number | null;         // Taux journalier

  // Composantes
  primes?: Primes;
  indemnites?: Indemnites;
  avantages_nature?: AvantagesNature;

  // Modalités de paiement
  payment_method: 'Virement' | 'Cheque' | 'Especes';
  bank_name?: string;
  rib?: string;                       // RIB bancaire
  payment_day?: number;               // Jour de paie (ex: 5 du mois)

  // Augmentations et révisions
  last_increase_date?: string;
  last_increase_percentage?: number;
  next_review_date?: string;

  // Historique
  salary_history?: Array<{
    date: string;
    base_salary: number;
    reason: string;
  }>;
}

/**
 * Informations légales et protection sociale
 */
export interface LegalInfo {
  // CNSS (Caisse Nationale de Sécurité Sociale)
  cnss_affiliation: boolean;
  cnss_number?: string;               // Numéro d'affiliation CNSS
  cnss_regime: 'General' | 'Agricole' | 'Artisanal' | 'Pecheurs';
  cnss_rate_employee?: number;        // Taux cotisation salarié (4.48%)
  cnss_rate_employer?: number;        // Taux cotisation employeur (16.46%)

  // AMO (Assurance Maladie Obligatoire)
  amo: boolean;
  amo_number?: string;
  amo_regime: 'CNSS' | 'CNOPS' | 'Autres';
  amo_family_members?: number;        // Nombre d'ayants droit

  // Retraite complémentaire
  cimr?: boolean;                     // CIMR
  cimr_rate_employee?: number;
  cimr_rate_employer?: number;
  rcar?: boolean;                     // RCAR (secteur public)
  other_retirement?: string;

  // ANAPEC / Formation
  contrat_anapec?: string | null;     // Numéro contrat ANAPEC
  anapec_type?: 'Idmaj' | 'TAHIL' | 'Autre';
  taxe_formation?: boolean;           // Taxe de formation professionnelle (1.6%)

  // Fiscalité
  tax_ir?: {
    taux: number;                     // Taux effectif IR
    exonere: boolean;                 // Exonéré d'IR
    exoneration_reason?: string;      // Raison de l'exonération
    deductions?: Array<{              // Déductions fiscales
      type: string;
      amount: number;
    }>;
  };

  // Convention collective applicable
  convention_collective?: string;     // Ex: "Commerce", "Banque", etc.
  convention_date?: string;

  // Clauses contractuelles
  clauses?: {
    confidentialite: boolean;         // Clause de confidentialité
    non_concurrence: boolean;         // Clause de non-concurrence
    non_concurrence_duration?: number; // Durée en mois
    non_concurrence_compensation?: number; // Compensation financière
    mobilite: boolean;                // Clause de mobilité
    mobilite_geographic_scope?: string; // Périmètre géographique
    exclusivite: boolean;             // Clause d'exclusivité
    formation: boolean;               // Clause de formation
    formation_engagement?: number;     // Engagement en années
    intellectual_property: boolean;   // Propriété intellectuelle
    discipline_interne: boolean;      // Règlement intérieur
    deontologie: boolean;             // Code de déontologie
    teletravail?: {                   // Accord de télétravail
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
  contrat_signe?: string;             // URL/ID du contrat signé
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
  reference: string;                  // Référence unique du contrat
  internal_reference?: string;        // Référence interne entreprise
  type: ContractType;
  status: ContractStatus;
  version: number;

  // Relations
  employe_id: string | number;
  employee_name?: string;             // Cache pour affichage
  employee_matricule?: string;
  company_id?: string | number;       // Pour multi-sociétés
  company_name?: string;

  // Dates et durée
  dates: ContractDates;

  // Poste et classification
  job: JobInfo;

  // Temps de travail
  work_time: WorkTime;

  // Rémunération
  salary: SalaryInfo;

  // Aspects légaux
  legal: LegalInfo;

  // Documents
  documents?: ContractDocuments;

  // Historique et traçabilité
  historique: ContractHistory;

  // Remarques et notes
  notes?: string;
  internal_notes?: string;            // Notes internes RH

  // Champs personnalisés par secteur/entreprise
  custom_fields?: Record<string, any>;

  // Métadonnées
  tags?: string[];                    // Tags pour classification
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
export interface ContractCreateInput extends Omit<Contract, 'id' | 'version' | 'historique'> {
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

