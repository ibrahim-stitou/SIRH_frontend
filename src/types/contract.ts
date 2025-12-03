export type ContractType = 'CDI' | 'CDD' | 'Stage' | 'Intérim' | 'Apprentissage' | 'Autre';

export type ContractStatus = 'actif' | 'termine' | 'suspendu' | 'renouvelé';

export type ContractStatut = 'Brouillon' | 'Actif' | 'Terminé' | 'Annulé';

export interface Contract {
  id: number;
  employee_id: number;
  type_contrat: ContractType;
  date_debut: string;
  date_fin: string | null;
  salaire_base: number;
  salaire_devise: string;
  statut_contrat: ContractStatus;
  poste: string;
  departement: string;
  horaires: string;
  notes: string;
  created_at: string;
  updated_at: string;
  statut: ContractStatut;
  // For joined data in responses
  employee?: {
    id: number;
    firstName: string;
    lastName: string;
    matricule: string;
    email: string;
  };
}

export interface ContractFormData {
  employee_id: number | string;
  type_contrat: ContractType;
  date_debut: string;
  date_fin?: string | null;
  salaire_base: number | string;
  salaire_devise: string;
  statut_contrat: ContractStatus;
  poste: string;
  departement: string;
  horaires: string;
  notes?: string;
  statut: ContractStatut;
}

export interface ContractFilters {
  employee_id?: number | string;
  type_contrat?: ContractType;
  statut?: ContractStatut;
  departement?: string;
  search?: string;
}

