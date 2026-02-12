import { z } from "zod";

export const offreSchema = z.object({
  titre: z.string().min(1, "Le titre est requis"),
  description: z.string().min(1, "La description est requise"),
  competencesRequises: z.string().min(1, "Les compétences requises sont nécessaires"),
  localisation: z.string().min(1, "La localisation est requise"),
  typeContrat: z.enum(["CDI", "CDD", "Stage", "Alternance", "Freelance"], {
    errorMap: () => ({ message: "Type de contrat invalide" }),
  }),
  salaire: z.string().optional(),
  datePublication: z.string().optional(),
  dateExpiration: z.string().optional(),
  statut: z.enum(["active", "inactive", "pourvue"], {
    errorMap: () => ({ message: "Statut invalide" }),
  }).optional().default("active"),
});

export type OffreFormData = z.infer<typeof offreSchema>;