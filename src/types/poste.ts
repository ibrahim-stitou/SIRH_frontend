export interface poste {
  id: number;
  code: string;
  libelle: string;
}
// types/poste.ts

export interface Poste {
  id: number;
  code: string;
  libelle: string;

  departement_id: number;
  metier_id: number;

  is_active: boolean;

  created_at: string;
  updated_at: string;

  metier?: Metier;
  emploi?: Emploi;
}

export interface Metier {
  id: number;
  code: string;
  libelle: string;
}

export interface Emploi {
  id: number;
  code: string;
  libelle: string;
}
