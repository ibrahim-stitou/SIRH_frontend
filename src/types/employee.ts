// types/employee.ts

export type EmployeeStatus = 'actif' | 'suspendu' | 'parti';
export type Gender = 'M' | 'F';
export type ContractType = 'CDI' | 'CDD' | 'Stage' | 'Intérim' | 'Apprentissage';
export type MaritalStatus = 'celibataire' | 'marie' | 'divorce' | 'veuf';

export interface Employee {
  id: string;
  matricule: string; // Auto-généré

  // ========================================
  // IDENTITÉ
  // ========================================
  firstName: string;
  lastName: string;
  firstNameAr?: string; // Prénom en arabe
  lastNameAr?: string; // Nom en arabe
  cin: string;
  passport?: string;
  birthDate: string;
  birthPlace: string;
  gender: Gender;
  nationality: string;
  maritalStatus?: MaritalStatus;
  numberOfChildren?: number;


  // ========================================
  // COORDONNÉES
  // ========================================
  address: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
  mobilePhone?: string;
  email: string;
  personalEmail?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
    address?: string;
  };

  // ========================================
  // INFORMATIONS PROFESSIONNELLES
  // ========================================
  departmentId: string;
  department?: Department;
  position: string;
  positionAr?: string;
  grade?: string;
  classification?: string; // Cadre, Non-cadre, Agent de maîtrise
  managerId?: string;
  manager?: Employee;
  hireDate: string;
  seniorityDate?: string; // Date d'ancienneté (peut différer de hireDate)
  workLocation?: string; // Lieu de travail

  // ========================================
  // CONTRAT
  // ========================================
  contractType: ContractType;
  contractNumber?: string;
  contractStartDate: string;
  contractEndDate?: string;
  contractSignatureDate?: string;
  trialPeriodDuration?: number; // En jours
  trialPeriodEndDate?: string;
  trialPeriodRenewals?: number;

  // ========================================
  // TEMPS DE TRAVAIL
  // ========================================
  weeklyHours: number; // Heures hebdomadaires (ex: 44h)
  workingDays: number; // Jours travaillés par semaine (ex: 5 ou 6)
  scheduleId?: string; // Référence au planning horaire

  // ========================================
  // RÉMUNÉRATION
  // ========================================
  baseSalary: number; // Salaire de base brut
  currency: string; // MAD
  salaryFrequency: 'mensuel' | 'horaire'; // Fréquence de paie
  bankName?: string;
  bankAccountNumber?: string; // RIB/IBAN
  bankBranch?: string;

  // ========================================
  // CONGÉS & ABSENCES
  // ========================================
  annualLeaveDays: number; // Jours de congé annuel (18 par défaut au Maroc, peut être augmenté)
  leaveBalance?: number; // Solde congés disponible
  leaveAcquisitionRate?: number; // Taux d'acquisition (1.5 jours/mois par défaut)

  // ========================================
  // SOCIAL & MUTUELLE
  // ========================================
  cnssNumber?: string; // Numéro d'affiliation CNSS
  cnssAffiliationDate?: string;
  mutualId?: string; // Référence mutuelle
  mutualNumber?: string; // Numéro adhérent mutuelle
  mutualAffiliationDate?: string;
  familyMembersCovered?: number; // Nombre d'ayants droit

  // ========================================
  // FORMATION & COMPÉTENCES
  // ========================================
  educationLevel?: string; // Bac, Licence, Master, Doctorat
  diploma?: string;
  diplomaYear?: number;
  university?: string;
  skills?: Skill[]; // Compétences de l'employé
  certifications?: Certification[];
  languages?: Language[];

  // ========================================
  // STATUT & WORKFLOW
  // ========================================
  status: EmployeeStatus;
  exitDate?: string; // Date de départ
  exitReason?: string; // Motif départ (démission, licenciement, retraite)
  isActive: boolean; // Actif/Inactif

  // ========================================
  // MÉTADONNÉES
  // ========================================
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy?: string;
  notes?: string; // Notes internes RH
  tags?: string[]; // Tags pour classification

  // ========================================
  // RELATIONS (chargées si besoin) il seront de type many to many
  // ========================================
  contracts?: Contract[]; // Historique des contrats
  documents?: EmployeeDocument[];
  absences?: Absence[];
  movements?: Movement[];
  trainings?: Training[];
  evaluations?: Evaluation[];
  loans?: Loan[];
}

// ========================================
// INTERFACES COMPLÉMENTAIRES
// ========================================

export interface Department {
  id: string;
  code: string;
  name: string;
  nameAr?: string;
  parentId?: string;
  managerId?: string;
  costCenter?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

//parametrables
export interface Skill {
  id: string;
  skillId: string; // Référence au référentiel
  skillName: string;
  level: 1 | 2 | 3 | 4 | 5; // 1=Notions, 5=Expertise
  acquiredDate?: string;
  certificationId?: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  expirationDate?: string;
  certificateNumber?: string;
  documentUrl?: string;
}

//parametrables
export interface Language {
  id: string;
  language: string;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'; // CECRL
  spokenLevel?: 'basique' | 'intermediaire' | 'avance' | 'courant';
  writtenLevel?: 'basique' | 'intermediaire' | 'avance' | 'courant';
}

export interface Contract {
  id: string;
  employeeId: string;
  contractNumber: string;
  type: ContractType;
  startDate: string;
  endDate?: string;
  signatureDate?: string;
  position: string;
  department: string;
  baseSalary: number;
  weeklyHours: number;
  trialPeriodDuration?: number;
  trialPeriodEndDate?: string;
  status: 'brouillon' | 'actif' | 'termine' | 'annule';
  documentUrl?: string;
  amendments?: ContractAmendment[];
  createdAt: string;
  createdBy: string;
}

export interface ContractAmendment {
  id: string;
  contractId: string;
  amendmentNumber: string;
  type: 'salaire' | 'poste' | 'lieu' | 'duree' | 'autre';
  effectiveDate: string;
  description: string;
  oldValue?: string;
  newValue?: string;
  documentUrl?: string;
  createdAt: string;
  createdBy: string;
}

export interface EmployeeDocument {
  id: string;
  employeeId: string;
  category: DocumentCategory;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  version: number;
  expirationDate?: string;
  uploadedAt: string;
  uploadedBy: string;
  description?: string;
  isExpired?: boolean;
  alertDays?: number; // Nombre de jours avant expiration pour alerte
}

export type DocumentCategory =
  | 'CIN'
  | 'RIB'
  | 'Diplomes'
  | 'Contrat'
  | 'Attestations'
  | 'Autorisation_Travail'
  | 'Certificat_Medical'
  | 'Photo_Identite'
  | 'CV'
  | 'Autre';

export interface Movement {
  id: string;
  employeeId: string;
  type: 'embauche' | 'mutation' | 'promotion' | 'retrogradation' | 'sanction' | 'demission' | 'licenciement' | 'retraite' | 'deces';
  effectiveDate: string;
  reason: string;

  // Origine
  fromDepartment?: string;
  fromPosition?: string;
  fromSalary?: number;
  fromLocation?: string;

  // Destination
  toDepartment?: string;
  toPosition?: string;
  toSalary?: number;
  toLocation?: string;

  // Workflow
  status: 'brouillon' | 'soumis' | 'valide_n1' | 'valide_n2' | 'valide_rh' | 'effectif' | 'refuse';
  validations?: Validation[];

  documents?: string[];
  createdAt: string;
  createdBy: string;
}

export interface Validation {
  id: string;
  validatorId: string;
  validatorName: string;
  validatorRole: string;
  status: 'en_attente' | 'approuve' | 'refuse';
  comment?: string;
  validatedAt?: string;
}

export interface Absence {
  id: string;
  employeeId: string;
  typeId: string;
  typeName: string;
  startDate: string;
  endDate: string;
  halfDayStart?: 'matin' | 'apres-midi';
  halfDayEnd?: 'matin' | 'apres-midi';
  workingDays: number; // Nombre de jours ouvrés
  reason?: string;
  justificationUrl?: string;
  status: 'soumise' | 'approuvee' | 'refusee' | 'annulee';
  approvedBy?: string;
  approvedAt?: string;
  refusalReason?: string;
  createdAt: string;
}

export interface Training {
  id: string;
  employeeId: string;
  sessionId: string;
  trainingName: string;
  startDate: string;
  endDate: string;
  duration: number; // En heures
  status: 'inscrit' | 'confirme' | 'present' | 'absent' | 'annule';
  location?: string;
  provider?: string;
  cost?: number;
  evaluation?: {
    satisfaction: number; // 1-5
    knowledgeAcquired: number; // 1-5
    trainerQuality: number; // 1-5
    comments?: string;
  };
  certificateUrl?: string;
}

export interface Evaluation {
  id: string;
  employeeId: string;
  campaignId: string;
  period: string; // "2024"
  type: '180' | '360';
  status: 'en_cours' | 'terminee' | 'validee';

  // Auto-évaluation
  selfEvaluationDate?: string;
  selfEvaluationScore?: number;

  // Évaluation manager
  managerEvaluationDate?: string;
  managerEvaluationScore?: number;

  // Scores
  objectivesScore?: number; // Atteinte des objectifs
  competenciesScore?: number; // Compétences
  overallScore?: number;

  // Qualitatif
  strengths?: string;
  areasForImprovement?: string;
  careerAspirations?: string;
  trainingNeeds?: string[];

  // Entretien
  interviewDate?: string;
  interviewNotes?: string;

  createdAt: string;
}

export interface Loan {
  id: string;
  employeeId: string;
  type: 'avance_salaire' | 'pret_social' | 'pret_logement' | 'pret_consommation';
  amount: number;
  duration: number; // En mois
  monthlyPayment: number;
  interestRate: number;
  totalAmount: number; // Montant total avec intérêts
  remainingAmount: number;
  startDate: string;
  endDate: string;
  status: 'en_attente' | 'approuve' | 'refuse' | 'en_cours' | 'termine' | 'annule';
  reason?: string;
  approvedBy?: string;
  approvedAt?: string;
  payments?: LoanPayment[];
  createdAt: string;
}

export interface LoanPayment {
  id: string;
  loanId: string;
  month: string; // "2025-01"
  amount: number;
  isPaid: boolean;
  paidAt?: string;
  payrollId?: string; // Référence au bulletin de paie
}

export interface EmployeeEvent {
  id: string;
  employeeId: string;
  type: 'creation' | 'modification' | 'mouvement' | 'absence' | 'document' | 'contrat' | 'formation' | 'evaluation';
  description: string;
  timestamp: string;
  userId: string;
  userName?: string;
  metadata?: Record<string, any>;
  changes?: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
}

export interface employeeDatatable{
  id:string;
  matricule:string;
  firstName:string;
  lastName:string;
  department:string;
  position:string;
  status:string;
  ContractType:ContractType;
  manager:string;
}

export interface EmployeeFilter {
  departmentId?: string;
  position?: string;
  status?: EmployeeStatus;
  contractType?: ContractType;
  managerId?: string;
  matricule?: string;
  search?: string;
}


