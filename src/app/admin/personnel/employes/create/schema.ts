/**
 * Schéma de validation pour la création d'employé
 * Utilise Zod pour la validation des données du formulaire
 */

import * as z from 'zod';

/**
 * Options de catégories professionnelles
 */
export const PROFESSIONAL_CATEGORY_OPTIONS = [
  { label: "Cadres et assimilés", id: "cadres_assimiles" },
  { label: "Employés et assimilés", id: "employes_assimiles" },
  { label: "Ouvriers et assimilés", id: "ouvriers_assimiles" },
] as const;

/**
 * Schéma de validation pour la création d'un employé
 */
export const employeeSchema = z.object({
  // Identité
  matricule: z.string().min(1, 'Matricule requis'),
  firstName: z.string().min(1, 'Prénom requis'),
  lastName: z.string().min(1, 'Nom requis'),
  firstNameAr: z.string().optional(),
  lastNameAr: z.string().optional(),

  // Documents d'identité
  cin: z.string().min(1, 'CIN requis'),
  numero_cnss: z.string().optional(),

  // Date et lieu de naissance
  birthDate: z.string().min(1, 'Date de naissance requise'),
  birthPlace: z.string().optional(),

  // Informations personnelles
  nationality: z.enum(['maroc', 'autre'], {
    required_error: 'Nationalité requise'
  }),
  gender: z.enum(['Homme', 'Femme', 'Autre'], {
    required_error: 'Genre requis'
  }),
  maritalStatus: z.enum(['celibataire', 'marie', 'divorce', 'veuf'], {
    required_error: 'État civil requis'
  }),
  children: z
    .number({ invalid_type_error: 'Doit être un nombre' })
    .min(0, 'Doit être >= 0')
    .optional(),

  // Coordonnées
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  phone: z
    .string()
    .min(1, 'Téléphone requis')
    .regex(/^[+\d]?(?:[\s.\-]?\d){7,15}$/, 'Numéro de téléphone invalide'),
  email: z.string().email('Email invalide').optional().or(z.literal('')),

  // Contact d'urgence
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  emergencyContactRelationship: z.string().optional(),

  // Informations professionnelles
  departmentId: z
    .number({ invalid_type_error: 'Département requis' })
    .min(1, 'Département requis'),
  hireDate: z.string().optional(),
  professionalCategory: z.enum(
    PROFESSIONAL_CATEGORY_OPTIONS.map((o) => o.id) as [
      "cadres_assimiles",
      "employes_assimiles",
      "ouvriers_assimiles"
    ],
    {
      required_error: "La catégorie professionnelle est requise",
      invalid_type_error: "Catégorie professionnelle invalide",
    }
  ),
});

/**
 * Type inféré du schéma pour l'utilisation dans les formulaires
 */
export type EmployeeFormValues = z.infer<typeof employeeSchema>;

/**
 * Valeurs par défaut pour le formulaire de création d'employé
 */
export const employeeDefaultValues: Partial<EmployeeFormValues> = {
  firstName: '',
  matricule: '',
  lastName: '',
  firstNameAr: '',
  lastNameAr: '',
  cin: '',
  numero_cnss: '',
  birthDate: (() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 18);
    return d.toISOString().split('T')[0];
  })(),
  birthPlace: '',
  nationality: 'maroc',
  gender: 'Homme',
  maritalStatus: 'celibataire',
  children: 0,
  address: '',
  city: '',
  postalCode: '',
  country: 'Maroc',
  phone: '',
  email: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  emergencyContactRelationship: '',
  departmentId: undefined,
  hireDate: new Date().toISOString().split('T')[0],
  professionalCategory: PROFESSIONAL_CATEGORY_OPTIONS[0].id,
};
