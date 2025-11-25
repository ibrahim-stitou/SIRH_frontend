import { z } from 'zod';
import { identitySchema, contactSchema, jobSchema } from '@/validations/employee-create';

export const educationItemSchema = z.object({
  level: z.string().min(2, 'Niveau obligatoire'),
  diploma: z.string().optional(),
  year: z.string().optional(),
  institution: z.string().optional(),
});

export const skillItemSchema = z.object({
  name: z.string().min(2, 'Nom skill'),
  level: z.coerce.number().min(1).max(5).default(1),
});

export const certificationItemSchema = z.object({
  name: z.string().min(2, 'Nom certification'),
  issuer: z.string().optional(),
  issueDate: z.string().optional(),
  expirationDate: z.string().optional(),
});

export const documentItemSchema = z.object({
  title: z.string().min(2, 'Titre obligatoire'),
});

export const step1Schema = identitySchema.merge(contactSchema).extend({
  notes: z.string().optional(),
});

export const step2Schema = jobSchema.extend({
  education: z.array(educationItemSchema).optional(),
  skills: z.array(skillItemSchema).optional(),
  certifications: z.array(certificationItemSchema).optional(),
});

export const step3Schema = z.object({
  documents: z.array(documentItemSchema).optional(),
});

export const fullSchema = step1Schema.merge(step2Schema).merge(step3Schema);

export type EmployeeCreateFormValues = z.infer<typeof fullSchema> & {
  documentsFiles?: (File[] | undefined)[];
};

export const stepFields: (keyof EmployeeCreateFormValues)[][] = [
  [
    'firstName','lastName','cin','birthDate','birthPlace','gender','nationality','maritalStatus','numberOfChildren','address','city','postalCode','country','phone','email','emergencyContactName','emergencyContactPhone','emergencyContactRelationship'
  ],
  ['departmentId','position','hireDate','education','skills','certifications'],
  ['documents'],
];
