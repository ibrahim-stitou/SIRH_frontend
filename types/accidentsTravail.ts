// filepath: types/accidentsTravail.ts

export interface Temoin {
  nom: string;
  contact: string;
}

export interface ArretTravail {
  existe: boolean;
  dureePrevisionnelle?: number;
  dateDebut?: string;
  dateFin?: string;
}

export interface SuiviCNSS {
  dateEnvoi: string | null;
  numeroRecepisse: string | null;
  decision: 'En cours' | 'Accepté' | 'Refusé' | null;
  tauxIPP: number | null;
  dateDecision: string | null;
  montantIndemnite: number | null;
}

export interface SuiviMedical {
  id: number;
  date: string;
  type: string;
  medecin: string;
  diagnostic: string;
  prescriptions: string;
  fichier?: string;
}

export interface ImpactPaie {
  indemnitesJournalieres: number;
  joursIndemnises: number;
  priseEnCharge: 'CNSS' | 'Employeur' | 'Partiel' | null;
  impactBulletin: boolean;
  montantDeduction: number;
}

export interface PieceJointe {
  id: number;
  type: string;
  fichier: string;
  dateUpload: string;
  uploadePar: string;
}

export interface HistoriqueAT {
  date: string;
  action: string;
  utilisateur: string;
  details: string;
}

export interface RelanceCNSS {
  date: string;
  motif: string;
  reponse: string | null;
}

export interface Employe {
  id: number | string;
  nom: string;
  prenom: string;
  matricule?: string;
  numeroCNSS?: string;
  departement?: string;
}

export interface AccidentTravail {
  id: number | string;
  employeId: number | string;
  employe: Employe;
  dateHeureAccident: string;
  typeAccident: 'Sur site' | 'Trajet';
  lieu: string;
  circonstances: string;
  lesions: string;
  gravite: 'Léger' | 'Moyen' | 'Grave';
  temoins: Temoin[];
  arretTravail: ArretTravail;
  statut: 'Brouillon' | 'Déclaré' | 'Transmis CNSS' | 'En instruction' | 'Accepté' | 'Refusé' | 'Clos';
  dateDeclaration: string;
  declarePar: string;
  delaiDeclarationRespect: boolean;
  heuresDepuisAccident: number;
  suiviCNSS: SuiviCNSS;
  suiviMedical: SuiviMedical[];
  impactPaie: ImpactPaie;
  piecesJointes: PieceJointe[];
  historique: HistoriqueAT[];
  relancesCNSS: RelanceCNSS[];
  dateCreation: string;
  dateModification: string;
  dateCloture?: string;
  archivageObligatoire: boolean;
  dureeArchivage: number;
}

export interface AccidentTravailFormData {
  employeId: string | number;
  dateHeureAccident: string;
  typeAccident: 'Sur site' | 'Trajet';
  lieu: string;
  circonstances: string;
  lesions: string;
  gravite: 'Léger' | 'Moyen' | 'Grave';
  temoins: Temoin[];
  arretTravail: ArretTravail;
  statut?: 'Brouillon' | 'Déclaré';
}

export interface StatistiquesAT {
  nombreTotal: number;
  avecArret: number;
  sansArret: number;
  joursPerdus: number;
  parType: {
    surSite: number;
    trajet: number;
  };
  parGravite: {
    leger: number;
    moyen: number;
    grave: number;
  };
  parStatut: {
    brouillon: number;
    declare: number;
    transmisCNSS: number;
    enInstruction: number;
    accepte: number;
    refuse: number;
    clos: number;
  };
  delaisRespect: {
    respect: number;
    horsDelai: number;
  };
  montantIndemnites: number;
}

