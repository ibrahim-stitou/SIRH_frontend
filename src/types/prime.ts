/**
 * Types pour la gestion des primes
 */

export interface PrimeType {
  id: string | number;
  code: string;
  label: string;
  description?: string;
  is_taxable: boolean; // Imposable ou non
  is_subject_to_cnss: boolean; // Soumis aux cotisations CNSS
  default_amount?: number;
  is_active: boolean;
  category?: 'transport' | 'performance' | 'anciennete' | 'responsabilite' | 'panier' | 'autre';
  order?: number;
}

export interface PrimeValue {
  prime_type_id: string | number;
  amount: number;
  is_taxable?: boolean; // Peut être override
  is_subject_to_cnss?: boolean; // Peut être override
  notes?: string;
}

export interface PrimeCalculation {
  prime_type_id: string | number;
  label: string;
  amount: number;
  is_taxable: boolean;
  is_subject_to_cnss: boolean;
  taxable_amount: number; // Montant soumis à l'IR
  cnss_amount: number; // Montant soumis aux cotisations
}

