export type AvenantStatus =
  | 'Brouillon'
  | 'En_attente_signature'
  | 'Signe'
  | 'Archive';

export interface AvenantChangeSet {
  // Partial changes aligned to simplified contract schema
  dates?: Partial<{
    start_date: string;
    end_date: string;
    signature_date: string;
  }>;
  job?: Partial<{
    metier: string;
    emploie: string;
    poste: string;
    work_mode: string;
    classification: string;
    work_location: string;
    level: string;
    responsibilities: string;
  }>;
  schedule?: Partial<{
    schedule_type: 'Administratif' | 'Continu';
    shift_work: 'Non' | 'Oui';
    hours_per_day: number;
    days_per_week: number;
    hours_per_week: number;
    start_time: string;
    end_time: string;
    break_duration: number;
    annual_leave_days: number;
    other_leaves: string;
  }>;
  salary?: Partial<{
    salary_brut: number;
    salary_net: number;
    currency: string;
    payment_method: string;
    periodicity: string;
  }> & {
    primes?: Array<{
      prime_type_id: string | number;
      label: string;
      amount: number;
      is_taxable?: boolean;
      is_subject_to_cnss?: boolean;
      notes?: string;
    }>;
    avantages?: Partial<{
      voiture: boolean;
      logement: boolean;
      telephone: boolean;
      assurance_sante: boolean;
      tickets_restaurant: boolean;
    }>;
    indemnites?: string;
  };
  legal?: Partial<{
    cnss_affiliation: boolean;
    amo_affiliation: boolean;
    ir_applicable: boolean;
    clause_confidentialite: boolean;
    clause_non_concurrence: boolean;
  }>;
}

export interface Avenant {
  id: string;
  contract_id: string | number;
  numero: number;
  date: string; // ISO date
  objet: string;
  description?: string;
  status: AvenantStatus;
  document_url?: string;
  changes: AvenantChangeSet;
  created_at?: string;
  created_by?: string;
}
