import { z } from 'zod';

export const avenantStatusEnum = z.enum([
  'Brouillon',
  'En_attente_signature',
  'Signe',
  'Archive'
]);

export const avenantSchema = z.object({
  contract_id: z.union([
    z.string().min(1, 'Contrat requis'),
    z.number().min(1, 'Contrat requis')
  ]),
  numero: z.number().int().positive().optional(),
  date: z.string().min(1, 'Date requise'),
  objet: z.string().min(3, "L'objet est requis"),
  description: z.string().optional(),
  status: avenantStatusEnum.default('Brouillon'),
  document_url: z.string().url().optional().or(z.literal('')),
  changes: z
    .object({
      dates: z
        .object({
          start_date: z.string().optional(),
          end_date: z.string().optional(),
          signature_date: z.string().optional()
        })
        .partial()
        .optional(),
      job: z
        .object({
          metier: z.string().optional(),
          emploie: z.string().optional(),
          poste: z.string().optional(),
          work_mode: z.string().optional(),
          classification: z.string().optional(),
          work_location: z.string().optional(),
          level: z.string().optional(),
          responsibilities: z.string().optional()
        })
        .partial()
        .optional(),
      schedule: z
        .object({
          schedule_type: z.enum(['Administratif', 'Continu']).optional(),
          shift_work: z.enum(['Non', 'Oui']).optional(),
          hours_per_day: z.number().optional(),
          days_per_week: z.number().optional(),
          hours_per_week: z.number().optional(),
          start_time: z.string().optional(),
          end_time: z.string().optional(),
          break_duration: z.number().optional(),
          annual_leave_days: z.number().optional(),
          other_leaves: z.string().optional()
        })
        .partial()
        .optional(),
      salary: z
        .object({
          salary_brut: z.number().optional(),
          salary_net: z.number().optional(),
          currency: z.string().optional(),
          payment_method: z.string().optional(),
          periodicity: z.string().optional(),
          primes: z
            .array(
              z.object({
                prime_type_id: z.union([z.string(), z.number()]),
                label: z.string(),
                amount: z.number().nonnegative(),
                is_taxable: z.boolean().optional(),
                is_subject_to_cnss: z.boolean().optional(),
                notes: z.string().optional()
              })
            )
            .optional(),
          avantages: z
            .object({
              voiture: z.boolean().optional(),
              logement: z.boolean().optional(),
              telephone: z.boolean().optional(),
              assurance_sante: z.boolean().optional(),
              tickets_restaurant: z.boolean().optional()
            })
            .partial()
            .optional(),
          indemnites: z.string().optional()
        })
        .partial()
        .optional(),
      legal: z
        .object({
          cnss_affiliation: z.boolean().optional(),
          amo_affiliation: z.boolean().optional(),
          ir_applicable: z.boolean().optional(),
          clause_confidentialite: z.boolean().optional(),
          clause_non_concurrence: z.boolean().optional()
        })
        .partial()
        .optional()
    })
    .passthrough()
});

export type AvenantFormValues = z.infer<typeof avenantSchema>;
