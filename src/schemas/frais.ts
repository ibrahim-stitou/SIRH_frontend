import { z } from 'zod';

export const fraisLineSchema = z.object({
  id: z.number().optional(),
  date: z.string(),
  category: z.enum(['Transport', 'Restauration', 'Hôtel', 'Autre']),
  transportMode: z.string().nullable().optional(),
  route: z.object({ from: z.string(), to: z.string() }).nullable().optional(),
  amount: z.number().nonnegative(),
  vatRecoverable: z.number().min(0).optional(),
  currency: z.string(),
  attachments: z.array(z.string()).default([]),
  comment: z.string().optional(),
  kilometers: z.number().min(0).optional(),
  vehicleType: z.enum(['car', 'motorcycle']).nullable().optional(),
  approvedAmount: z.number().min(0).optional(),
  managerComment: z.string().optional(),
});

export const noteDeFraisSchema = z.object({
  id: z.number().optional(),
  number: z.string().optional(),
  employeeId: z.number(),
  matricule: z.string(),
  status: z.enum(['draft', 'submitted', 'approved', 'approved_partial', 'refused', 'needs_complement']).optional(),
  subject: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  currency: z.string().default('MAD'),
  total: z.number().min(0).optional(),
  lines: z.array(fraisLineSchema),
  history: z.array(z.object({ at: z.string(), action: z.string(), by: z.union([z.string(), z.number()]), comment: z.string().optional() })).optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  refuseReason: z.string().optional(),
  managerComment: z.string().optional(),
});
