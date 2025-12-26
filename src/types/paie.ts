// Types pour le module de gestion de la paie

export interface PeriodePaie {
  id: string;
  nom: string;
  mois: number;
  annee: number;
  dateDebut: string;
  dateFin: string;
  dateEcheance: string;
  statut: 'en_cours' | 'valide' | 'paye';
  nombreEmployes: number;
  montantTotal: number;
  dateCreation?: string;
  dateModification?: string;
  creePar?: string;
  modifiePar?: string;
}

export interface RubriquePaie {
  id: string;
  code: string;
  libelle: string;
  type: 'gain' | 'cotisation' | 'autre';
  categorie: string;
  base: 'fixe' | 'variable' | 'pourcentage' | 'horaire' | 'bareme';
  taux: number | null;
  plafond: number | null;
  soumisImpot: boolean;
  soumisSecuriteSociale: boolean;
  actif: boolean;
}

export interface ElementVariable {
  rubriquePaieId: string;
  libelle: string;
  type: 'gain' | 'cotisation' | 'autre';
  montant: number;
  base?: number;
  taux?: number;
  quantite?: number;
  commentaire?: string;
}

export interface CumulAnnuel {
  salaireBrut: number;
  cotisations: number;
  salaireNet: number;
  ir: number;
}

export interface BulletinPaie {
  id: string;
  periodePaieId: string;
  employeId: string;
  numeroEmploye: string;
  nomComplet: string;
  poste: string;
  departement: string;
  dateEmbauche: string;
  rib: string;
  cnss: string;
  joursTravailles: number;
  joursConges: number;
  joursAbsences: number;
  joursRecuperationPayes: number;
  heuresTravaillees: number;
  salaireBase: number;
  tauxHoraire: number;
  elementsVariables: ElementVariable[];
  totalGains: number;
  salaireBrut: number;
  salaireBrutImposable: number;
  cotisations: ElementVariable[];
  totalCotisations: number;
  autresElements: ElementVariable[];
  totalAutres: number;
  salaireNet: number;
  cumulAnnuel: CumulAnnuel;
  cotisationsPatronales?: ElementVariable[];
  totalCotisationsPatronales?: number;
  statut: 'en_cours' | 'valide' | 'paye';
  dateCreation?: string;
  dateModification?: string;
}

export interface Virement {
  id: string;
  employeId: string;
  numeroEmploye: string;
  nomComplet: string;
  rib: string;
  montant: number;
  statut: 'en_attente' | 'paye';
}

export interface PaieFilters {
  annee?: number;
  mois?: number;
  statut?: string;
  searchTerm?: string;
}

