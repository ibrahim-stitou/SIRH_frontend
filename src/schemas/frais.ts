import { z } from 'zod';

export const fraisLineSchema = z.object({
  id: z.number().optional(),
  date: z.string({ required_error: 'La date de dépense est requise' }).min(1, 'La date de dépense est requise'),
  category: z.enum(['Transport', 'Restauration', 'Hôtel', 'Autre'], { required_error: 'La catégorie est requise' }),
  transportMode: z.string().nullable().optional(),
  route: z.object({ from: z.string().min(1, 'Ville départ requise'), to: z.string().min(1, 'Ville arrivée requise') }).nullable().optional(),
  amount: z.number({ invalid_type_error: 'Le montant doit être numérique' }).nonnegative('Le montant ne peut pas être négatif'),
  vatRecoverable: z.number({ invalid_type_error: 'La TVA doit être numérique' }).min(0, 'TVA minimale 0').optional(),
  attachments: z.array(z.string()).default([]),
  comment: z.string().optional(),
  kilometers: z.number({ invalid_type_error: 'Les kilomètres doivent être numériques' }).min(0, 'Kilométrage minimal 0').optional(),
  vehicleType: z.enum(['car', 'motorcycle']).nullable().optional(),
  approvedAmount: z.number({ invalid_type_error: 'Le montant approuvé doit être numérique' }).min(0, 'Montant approuvé minimal 0').optional(),
  managerComment: z.string().optional(),
});

export const noteDeFraisSchema = z.object({
  id: z.number().optional(),
  number: z.string().optional(),
  employeeId: z.number({ required_error: "L'employé est requis", invalid_type_error: "L'employé est requis" }),
  matricule: z.string().min(1, 'Le matricule est requis'),
  status: z.enum(['draft', 'submitted', 'approved', 'approved_partial', 'refused', 'needs_complement']).optional(),
  subject: z.string({ required_error: "L'objet/mission est requis" }).min(1, "L'objet/mission est requis"),
  startDate: z.string({ required_error: 'La date début est requise' }).min(1, 'La date début est requise'),
  endDate: z.string({ required_error: 'La date fin est requise' }).min(1, 'La date fin est requise'),
  total: z.number({ invalid_type_error: 'Le total doit être numérique' }).min(0, 'Total minimal 0').optional(),
  lines: z.array(fraisLineSchema).min(1, 'Ajoutez au moins une ligne de frais'),
  history: z.array(z.object({ at: z.string(), action: z.string(), by: z.union([z.string(), z.number()]), comment: z.string().optional() })).optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  refuseReason: z.string().optional(),
  managerComment: z.string().optional(),
}).refine((data) => {
  if (!data.startDate || !data.endDate) return true;
  return new Date(data.endDate) >= new Date(data.startDate);
}, {
  message: 'La date fin doit être postérieure ou égale à la date début',
  path: ['endDate']
});
