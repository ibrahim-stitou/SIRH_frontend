export interface AvanceInterface {
  id: number;
  "employe_id": number;
  statut:"Brouillon" | "En_attente" | "Valide" | "Refuse";
  date_demande: string;
  creer_par?: number;
  valide_par?: number;
  date_validation?: string;
  created_at: string;
  updated_at: string;
  periode_paie:{
    "mois": "string";
    "annee": number;
  }
  motif_refus?: string;
  description?: string;
  montant_avance?: number;
}