// Types adaptés à votre API backend

export type StatutOffre = "BROUILLON" | "PUBLIQUE" | "CLOTUREE";
export type TypeContrat = "CDI" | "CDD" | "Stage" | "Freelance";
export type TypeProfil = "FORMATION" | "EXPERIENCE" | "COMPETENCE";
export type SourceCandidature = "linkedin" | "siteCarrieres" | "recommandation" | "autre";
export type StatutCandidature = "nouveau" | "en_cours" | "accepte" | "refuse";

export interface Poste {
  id: number;
  code: string;
  libelle: string;
  departement_id: number;
  metier_id: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Responsable {
  id: number;
  nom: string;
  email: string;
  departement: string;
}

export interface Mission {
  id: number;
  offreId: number;
  libelle: string;
}

export interface ProfilRecherche {
  id: number;
  offreId: number;
  type: TypeProfil;
  contenu: string;
}

export interface Candidature {
  id: number;
  offreId: number;
  candidatNom: string;
  candidatEmail: string;
  cvUrl: string;
  datePostulation: string;
  source: SourceCandidature;
  statut: StatutCandidature;
}

export interface OffreStatistique {
  id: number;
  offreId: number;
  nombreVues: number;
  nombreCandidatures: number;
}

export interface OffreEmploi {
  id: number;
  reference: string;
  description: string;
  posteId: number;
  lieuTravail: string;
  typeContrat: TypeContrat;
  salaireMin: number | null;
  salaireMax: number | null;
  dateLimiteCandidature: string;
  statut: StatutOffre;
  anonymisee: boolean;
  responsableId: number;
  validatedManager: boolean;
  validatedRH: boolean;
  slug: string;
  lienCandidature: string;
  createdAt: string;
  
  // Relations
  poste: Poste | null;
  responsable: Responsable;
  Missions: Mission[];
  ProfilRecherche: ProfilRecherche[];
  candidatures: Candidature[];
  OffreStatistiques: OffreStatistique[];
}

// Type pour l'affichage dans l'interface (mapping)
export interface OffreEmploiUI {
  id: number;
  reference: string;
  intitulePoste: string;
  descriptionPoste: string;
  lieuTravail: string;
  typeContrat: TypeContrat;
  fourchetteSalaire: {
    min: number;
    max: number;
    devise: string;
  } | null;
  dateLimiteCandidature: string;
  statut: "brouillon" | "publiee" | "cloturee";
  anonyme: boolean;
  lienCandidature: string;
  competencesRequises: string[];
  responsableRecrutement: {
    nom: string;
    email: string;
  };
  statistiques: {
    vues: number;
    candidaturesRecues: number;
  };
}