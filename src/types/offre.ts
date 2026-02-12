export type TypeContrat = "CDI" | "CDD" | "Stage";

export type StatutOffre = "brouillon" | "publiee" | "cloturee";

export interface ProfilRecherche {
  formation: string;
  experience: string;
}

export interface FourchetteSalaire {
  min: number;
  max: number;
  devise: string;
}

export interface ResponsableRecrutement {
  id: number;
  nom: string;
  email: string;
  departement?: string;
}

export interface Diffusion {
  siteCarrieres: boolean;
  linkedin: boolean;
  rekrute: boolean;
  emploiMa: boolean;
  reseauxSociaux: boolean;
}

export interface SourceCandidatures {
  siteCarrieres: number;
  linkedin: number;
  rekrute: number;
  emploiMa: number;
  reseauxSociaux: number;
}

export interface Statistiques {
  vues: number;
  candidaturesRecues: number;
  sourceCandidatures: SourceCandidatures;
}

export interface OffreEmploi {
  id: number;
  reference: string;
  intitulePoste: string;
  descriptionPoste: string;
  missionsPrincipales: string[];
  profilRecherche: ProfilRecherche;
  competencesRequises: string[];
  lieuTravail: string;
  typeContrat: TypeContrat;
  fourchetteSalaire: FourchetteSalaire | null;
  dateLimiteCandidature: string;
  responsableRecrutement: ResponsableRecrutement;
  statut: StatutOffre;
  dateCreation: string;
  datePublication: string | null;
  diffusion: Diffusion;
  lienCandidature: string | null;
  statistiques: Statistiques;
  anonyme: boolean;
}


export interface OffreFormData {
  titre: string;
  description: string;
  missions: string;
  profilRecherche: string;

  typeContrat: 
    | "CDI"
    | "CDD"
    | "STAGE"
    | "ALTERNANCE"
    | "FREELANCE";

  localisation: string;
  salaireMin?: number;
  salaireMax?: number;

  dateExpiration?: string; // ISO string

  competencesRequises: number[]; // IDs des compétences

  canauxDiffusion: number[]; // IDs des canaux sélectionnés

  statut?: "BROUILLON" | "PUBLIEE";

}

// export interface OffreFormData {
//   intitulePoste: string;
//   descriptionPoste: string;
//   missionsPrincipales: string[];
//   profilRecherche: ProfilRecherche;
//   competencesRequises: string[];
//   lieuTravail: string;
//   typeContrat: TypeContrat;
//   fourchetteSalaire: FourchetteSalaire | null;
//   dateLimiteCandidature: string;
//   responsableRecrutementId: number;
//   statut: StatutOffre;
//   diffusion: Diffusion;
//   anonyme: boolean;
// }

export interface Candidature {
  id: number;
  offreId: number;
  candidatNom: string;
  candidatEmail: string;
  datePostulation: string;
  source: keyof SourceCandidatures;
  statut: "nouveau" | "en_cours" | "retenu" | "rejete";
}




