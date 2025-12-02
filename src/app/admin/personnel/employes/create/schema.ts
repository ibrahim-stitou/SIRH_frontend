import { z } from 'zod';
import { identitySchema, contactSchema, jobSchema } from '@/validations/employee-create';

// Education validation with better error messages
export const educationItemSchema = z.object({
  level: z.string()
    .min(2, '⚠️ Le niveau d\'éducation est requis (min. 2 caractères)')
    .max(100, 'Le niveau ne doit pas dépasser 100 caractères'),
  diploma: z.string()
    .max(200, 'Le diplôme ne doit pas dépasser 200 caractères')
    .optional(),
  year: z.string()
    .regex(/^\d{4}$/, 'Année invalide (format: YYYY)')
    .refine(
      (val) => !val || (parseInt(val) >= 1950 && parseInt(val) <= new Date().getFullYear()),
      'L\'année doit être entre 1950 et aujourd\'hui'
    )
    .optional(),
  institution: z.string()
    .max(200, 'L\'institution ne doit pas dépasser 200 caractères')
    .optional(),
});

// Skills validation with level constraint
export const skillItemSchema = z.object({
  name: z.string()
    .min(2, '⚠️ Le nom de la compétence est requis (min. 2 caractères)')
    .max(100, 'Le nom ne doit pas dépasser 100 caractères')
    .regex(/^[a-zA-Z0-9\s\-\+\#\.]+$/, 'Caractères invalides dans le nom'),
  level: z.coerce.number()
    .min(1, '⚠️ Le niveau minimum est 1')
    .max(5, '⚠️ Le niveau maximum est 5')
    .default(3),
});

// Certification validation with date logic
export const certificationItemSchema = z.object({
  name: z.string()
    .min(2, '⚠️ Le nom de la certification est requis (min. 2 caractères)')
    .max(200, 'Le nom ne doit pas dépasser 200 caractères'),
  issuer: z.string()
    .max(200, 'L\'émetteur ne doit pas dépasser 200 caractères')
    .optional(),
  issueDate: z.string()
    .refine(
      (val) => !val || !isNaN(Date.parse(val)),
      'Date d\'émission invalide'
    )
    .optional(),
  expirationDate: z.string()
    .refine(
      (val) => !val || !isNaN(Date.parse(val)),
      'Date d\'expiration invalide'
    )
    .optional(),
}).refine(
  (data) => {
    if (data.issueDate && data.expirationDate) {
      return new Date(data.issueDate) < new Date(data.expirationDate);
    }
    return true;
  },
  {
    message: 'La date d\'expiration doit être après la date d\'émission',
    path: ['expirationDate'],
  }
);

// Document validation
export const documentItemSchema = z.object({
  title: z.string()
    .min(2, '⚠️ Le titre du document est requis (min. 2 caractères)')
    .max(200, 'Le titre ne doit pas dépasser 200 caractères'),
});

// Step schemas with optional arrays
export const step1Schema = identitySchema.merge(contactSchema).extend({
  notes: z.string()
    .max(1000, 'Les notes ne doivent pas dépasser 1000 caractères')
    .optional(),
});

export const step2Schema = jobSchema.extend({
  education: z.array(educationItemSchema)
    .max(20, 'Maximum 20 formations')
    .optional()
    .default([]),
  skills: z.array(skillItemSchema)
    .max(50, 'Maximum 50 compétences')
    .optional()
    .default([]),
  certifications: z.array(certificationItemSchema)
    .max(30, 'Maximum 30 certifications')
    .optional()
    .default([]),
});

export const step3Schema = z.object({
  documents: z.array(documentItemSchema)
    .max(50, 'Maximum 50 documents')
    .optional()
    .default([]),
});

// Full schema
export const fullSchema = step1Schema.merge(step2Schema).merge(step3Schema);

export type EmployeeCreateFormValues = z.infer<typeof fullSchema> & {
  documentsFiles?: (File[] | undefined)[];
};

// Step field mapping for validation
export const stepFields: (keyof EmployeeCreateFormValues)[][] = [
  [
    'firstName','lastName','cin','birthDate','birthPlace','gender','nationality','maritalStatus','numberOfChildren','address','city','postalCode','country','phone','email','emergencyContactName','emergencyContactPhone','emergencyContactRelationship','notes'
  ],
  ['departmentId','position','hireDate','education','skills','certifications'],
  ['documents'],
];
