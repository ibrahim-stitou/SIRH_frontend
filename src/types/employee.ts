/**
 * Types et interfaces pour les employés
 * Ce fichier centralise tous les types liés aux employés et leurs relations
 */

// ============================================
// Types de base
// ============================================

export type Gender = 'M' | 'F' | 'Homme' | 'Femme';
export type MaritalStatus = 'celibataire' | 'marie';
export type Nationality = 'maroc' | 'Marocaine' | 'autre';
export type ContractType = 'CDI' | 'CDD' | 'Stage' | 'Freelance' | 'Interim';
export type EmployeeStatus = 'actif' | 'active' | 'inactif' | 'inactive' | 'suspendu' | 'demissionaire';

// ============================================
// Interfaces de base
// ============================================

/**
 * Contact d'urgence
 */
export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

/**
 * Éducation
 */
export interface Education {
  level: string;
  diploma: string;
  year: string;
  institution: string;
}

/**
 * Compétences
 */
export interface Skill {
  name: string;
  level: number; // 1-5
}

/**
 * Certifications
 */
export interface Certification {
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
}

/**
 * Documents de l'employé
 */
export interface EmployeeDocument {
  id: string;
  title: string;
  fileName: string;
  mimeType: string;
  size: number;
  uploadedAt?: string;
  category?: string;
}

// ============================================
// Relations avec d'autres entités
// ============================================

/**
 * Département (relation)
 */
export interface Department {
  id: number | string;
  name: string;
  nameAr?: string;
  managerUserId?: number;
  description?: string;
}

/**
 * Location (relation)
 */
export interface Location {
  id: number;
  name: string;
  country: string;
  city?: string;
  address?: string;
}

/**
 * Contrat (relation)
 */
export interface Contract {
  id: number;
  employee_id: number;
  type_contrat: ContractType;
  date_debut: string;
  date_fin?: string | null;
  salaire_base: number;
  salaire_devise: string;
  statut_contrat: string;
  poste: string;
  departement: string;
  horaires: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  statut: string;
}

// ============================================
// Interface principale Employee (Version complète - hrEmployees)
// ============================================

/**
 * Employé complet (utilisé dans hrEmployees.json)
 * Contient toutes les informations détaillées d'un employé
 */
export interface HREmployee {
  id: number;
  matricule: string;

  // Identité
  firstName: string;
  lastName: string;
  firstNameAr?: string;
  lastNameAr?: string;
  cin: string;
  numero_cnss?: string;

  // Date et lieu de naissance
  birthDate: string;
  birthPlace?: string;

  // Informations personnelles
  gender: Gender;
  nationality: Nationality | string;
  maritalStatus: MaritalStatus;
  numberOfChildren?: number;

  // Coordonnées
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  phone: string;
  email: string;

  // Contact d'urgence
  emergencyContact?: EmergencyContact;

  // Informations professionnelles
  departmentId: string | number;
  departement?: Department;
  position: string;
  positionAr?: string;
  hireDate: string;

  // Éducation, compétences et certifications
  education?: Education[];
  skills?: Skill[];
  certifications?: Certification[];

  // Documents
  documents?: EmployeeDocument[];

  // Statut
  status?: EmployeeStatus | string;
  isActive?: boolean;

  // Métadonnées
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

// ============================================
// Interface Employee simple (Version basique - employees.json)
// ============================================

/**
 * Employé simple (utilisé dans employees.json)
 * Version simplifiée pour les listes et affichages basiques
 */
export interface Employee {
  id: number;
  userId?: number | null;
  matricule: string;

  // Identité
  firstName: string;
  lastName: string;
  cin?: string;
  numero_cnss?: string;

  // Contact
  email: string;
  phone?: string;

  // Informations professionnelles
  departmentId: number;
  position: string;
  hireDate: string;
  contractType: ContractType;
  locationId?: number;

  // Hiérarchie
  managerEmployeeId?: number | null;

  // Salaire
  salaryBase?: number;

  // Statut
  status: EmployeeStatus | string;
  isActive?: boolean;

  // Relations (optionnelles)
  department?: Department;
  location?: Location;
  manager?: Employee;
  contracts?: Contract[];

  // Métadonnées
  createdAt?: string;
  updatedAt?: string;
}

// ============================================
// Types pour les formulaires et l'API
// ============================================

/**
 * Données pour créer un employé
 */
export interface EmployeeCreateInput {
  matricule: string;
  firstName: string;
  lastName: string;
  firstNameAr?: string;
  lastNameAr?: string;
  cin: string;
  numero_cnss?: string;
  birthDate: string;
  birthPlace?: string;
  nationality: string;
  gender: string;
  maritalStatus: string;
  numberOfChildren?: number;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  phone: string;
  email?: string;
  departmentId: number;
  position: string;
  positionAr?: string;
  hireDate?: string;
  emergencyContact?: EmergencyContact;
  status?: string;
  isActive?: boolean;
}

/**
 * Données pour mettre à jour un employé
 */
export interface EmployeeUpdateInput extends Partial<EmployeeCreateInput> {
  id: number;
}

/**
 * Réponse API liste d'employés
 */
export interface EmployeesResponse {
  data: Employee[] | HREmployee[];
  total?: number;
  page?: number;
  pageSize?: number;
}

/**
 * Réponse API employé unique
 */
export interface EmployeeResponse {
  data: Employee | HREmployee;
}

// ============================================
// Types utilitaires
// ============================================

/**
 * Filtre pour la liste des employés
 */
export interface EmployeeFilter {
  search?: string;
  departmentId?: number;
  status?: EmployeeStatus;
  contractType?: ContractType;
  locationId?: number;
  managerId?: number;
  page?: number;
  pageSize?: number;
}

/**
 * Ligne d'employé pour les tableaux
 */
export interface EmployeeRow {
  id: number;
  matricule: string;
  name: string;
  email: string;
  department: string;
  position: string;
  status: string;
  hireDate: string;
  phone?: string;
  numero_cnss?: string;
}

// ============================================
// Types pour les exports
// ============================================

export type EmployeeExportFormat = 'csv' | 'excel' | 'pdf';

export interface EmployeeExportOptions {
  format: EmployeeExportFormat;
  fields?: (keyof Employee)[];
  filters?: EmployeeFilter;
}

