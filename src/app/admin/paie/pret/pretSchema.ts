import { z } from 'zod';

export const PretSchema = z.object({
  id: z.number().optional(),
  employe_id: z.number({ required_error: "L'employé est requis" }),
  date_demande: z.string({ required_error: 'La date de demande est requise' }),
  statut: z
    .enum(
      ['Brouillon', 'En attente', 'Validé', 'Refusé', 'En cours', 'Soldé'],
      {
        required_error: 'Le statut est requis'
      }
    )
    .optional(),
  creer_par: z.number().optional(),
  valide_par: z.number().nullable().optional(),
  date_validation: z.string().nullable().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),

  montant_pret: z
    .number({ required_error: 'Le montant du prêt est requis' })
    .positive('Le montant doit être positif'),
  duree_mois: z
    .number({ required_error: 'La durée en mois est requise' })
    .int('Nombre entier')
    .positive('La durée doit être positive'),
  montant_mensualite: z.number().nonnegative().optional(),
  date_debut_remboursement: z.string().nullable().optional(),
  date_fin_prevue: z.string().nullable().optional(),
  taux_interet: z.number().min(0).default(0),
  type_pret: z.enum(
    ['Sans intérêt', 'Avec intérêt', 'Social', 'Exceptionnel'],
    { required_error: 'Le type de prêt est requis' }
  ),
  periode_paie_depart: z.object({
    mois: z.string(),
    annee: z.number()
  }),
  motif_refus: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  montant_rembourse: z.number().nonnegative().optional(),
  montant_restant: z.number().nonnegative().optional()
});
