import { z } from 'zod';

export const generateTableauPresenceSchema = z.object({
  mois: z.coerce.number().min(1, 'Le mois est requis').max(12, 'Mois invalide'),
  annee: z.coerce.number().min(2020, 'Année invalide').max(2100, 'Année invalide'),
  mode: z.enum(['automatique', 'import'], {
    required_error: 'Sélectionnez un mode de génération'
  })
});

export type GenerateTableauPresenceInput = z.infer<typeof generateTableauPresenceSchema>;

