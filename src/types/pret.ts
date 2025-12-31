export type PretStatut =
  | 'Brouillon'
  | 'En attente'
  | 'Validé'
  | 'Refusé'
  | 'En cours'
  | 'Soldé';

export type PretType =
  | 'Sans intérêt'
  | 'Avec intérêt'
  | 'Social'
  | 'Exceptionnel';

export interface PretInterface {
  id: number;
  employe_id: number;
  date_demande: string;
  statut: PretStatut;
  creer_par?: number;
  valide_par?: number | null;
  date_validation?: string | null;
  created_at?: string;
  updated_at?: string;

  montant_pret: number;
  duree_mois: number;
  montant_mensualite: number;
  date_debut_remboursement?: string | null;
  date_fin_prevue?: string | null;
  taux_interet: number;
  type_pret: PretType;
  periode_paie_depart: { mois: string; annee: number };
  motif_refus?: string | null;
  description?: string | null;
  montant_rembourse?: number;
  montant_restant?: number;
  employee?: { matricule?: string; fullName?: string } | null;
}
