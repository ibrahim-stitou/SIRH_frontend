import { z } from 'zod';

export const AvanceSchema = z.object({
  id: z.number({ required_error: "L'identifiant est requis." }),
  employe_id: z.number({
    required_error: "L'identifiant de l'employé est requis."
  }),
  type: z.enum(['Avance', 'Acompte'], {
    required_error: 'Le type est requis.',
    invalid_type_error: "Le type doit être 'Avance' ou 'Acompte'."
  }),
  statut: z.enum(['Brouillon', 'En_attente', 'Valide', 'Refuse'], {
    required_error: 'Le statut est requis.',
    invalid_type_error: "Le statut doit être l'une des valeurs autorisées."
  }),
  date_demande: z.string({
    required_error: 'La date de la demande est requise.'
  }),
  creer_par: z
    .number({
      invalid_type_error: "L'identifiant du créateur doit être un nombre."
    })
    .optional(),
  valide_par: z
    .number({
      invalid_type_error: "L'identifiant du valideur doit être un nombre."
    })
    .nullable()
    .optional(),
  date_validation: z
    .string({
      invalid_type_error: 'La date de validation doit être une chaîne.'
    })
    .nullable()
    .optional(),
  created_at: z.string({ required_error: 'La date de création est requise.' }),
  updated_at: z.string({
    required_error: 'La date de mise à jour est requise.'
  }),
  periode_paie: z.object(
    {
      mois: z.string({
        required_error: 'Le mois de la période de paie est requis.'
      }),
      annee: z.number({
        required_error: "L'année de la période de paie est requise."
      })
    },
    { required_error: 'La période de paie est requise.' }
  ),
  motif_refus: z
    .string({ invalid_type_error: 'Le motif du refus doit être une chaîne.' })
    .optional(),
  description: z
    .string({ invalid_type_error: 'La description doit être une chaîne.' })
    .optional(),
  // Nouveau champ: montant de l'avance (optionnel pour compatibilité)
  montant_avance: z
    .number({
      invalid_type_error: "Le montant de l'avance doit être un nombre."
    })
    .positive("Le montant de l'avance doit être positif")
    .optional()
});
