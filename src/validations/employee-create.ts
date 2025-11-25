import { z } from 'zod';

export const identitySchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  cin: z.string().min(5),
  birthDate: z.string().min(4),
  birthPlace: z.string().min(2),
  gender: z.enum(['M','F']),
  nationality: z.string().min(2),
  maritalStatus: z.enum(['celibataire','marie','divorce','veuf']).optional(),
  numberOfChildren: z.coerce.number().optional(),
});

export const contactSchema = z.object({
  address: z.string().min(3),
  city: z.string().min(2),
  postalCode: z.string().min(2),
  country: z.string().min(2),
  phone: z.string().min(6),
  email: z.string().email(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  emergencyContactRelationship: z.string().optional(),
});

export const jobSchema = z.object({
  departmentId: z.string().min(1),
  position: z.string().min(2),
  hireDate: z.string().min(4),
});

export const contractSchema = z.object({
  contractType: z.enum(['CDI','CDD','Stage','Intérim','Apprentissage']),
  contractStartDate: z.string().min(4),
  contractEndDate: z.string().optional(),
});

export const worktimeSchema = z.object({
  weeklyHours: z.coerce.number().min(1),
  workingDays: z.coerce.number().min(1),
});

export const salarySchema = z.object({
  baseSalary: z.coerce.number().min(0),
  currency: z.string().min(1),
  salaryFrequency: z.enum(['mensuel','horaire']),
});

export const socialSchema = z.object({
  cnssNumber: z.string().optional(),
  mutualNumber: z.string().optional(),
});

export type IdentityValues = z.infer<typeof identitySchema>;
export type ContactValues = z.infer<typeof contactSchema>;
export type JobValues = z.infer<typeof jobSchema>;
export type ContractValues = z.infer<typeof contractSchema>;
export type WorktimeValues = z.infer<typeof worktimeSchema>;
export type SalaryValues = z.infer<typeof salarySchema>;
export type SocialValues = z.infer<typeof socialSchema>;
