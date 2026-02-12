// /schemas/offreForm.schema.ts
import { z } from "zod";

export const offreFormSchema = z.object({
  intitulePoste: z.string().min(3),
  descriptionPoste: z.string().min(10),
  missionsPrincipales: z.array(z.string()).min(1),

  profilRecherche: z.object({
    formation: z.string().min(2),
    experience: z.string().min(2),
  }),

  competencesRequises: z.array(z.string()).min(1),
  lieuTravail: z.string().min(2),

  typeContrat: z.enum(["CDI", "CDD", "Stage"]),
  dateLimiteCandidature: z.string().min(1),

  responsableRecrutementId: z.number().min(1),
  statut: z.enum(["brouillon", "publiee"]),

  fourchetteSalaire: z
    .object({
      min: z.number(),
      max: z.number(),
      devise: z.string(),
    })
    .nullable(),

  diffusion: z.object({
    siteCarrieres: z.boolean(),
    linkedin: z.boolean(),
    rekrute: z.boolean(),
    emploiMa: z.boolean(),
    reseauxSociaux: z.boolean(),
  }),

  anonyme: z.boolean(),
});
