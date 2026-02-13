import { z } from "zod";

export const offreSchema = z.object({
  reference: z
    .string()
    .min(1, "La référence est obligatoire"),

  description: z
    .string()
    .min(1, "La description est obligatoire"),

  posteId: z
    .number({
      required_error: "Le poste est obligatoire",
      invalid_type_error: "Le poste est obligatoire",
    })
    .nullable()
    .refine((val) => val !== null, {
      message: "Le poste est obligatoire",
    }),

  intitulePoste: z
    .string()
    .min(1, "L’intitulé du poste est obligatoire"),

  lieuTravail: z
    .string()
    .min(1, "Le lieu de travail est obligatoire"),

  typeContrat: z.enum(["CDI", "CDD", "Stage"], {
    errorMap: () => ({ message: "Type de contrat invalide" }),
  }),

  salaireMin: z.number().optional(),
  salaireMax: z.number().optional(),

  dateLimiteCandidature: z
    .string()
    .min(1, "La date limite est obligatoire"),

  responsableId: z
    .number({
      required_error: "Le responsable est obligatoire",
    })
    .nullable()
    .refine((val) => val !== null, {
      message: "Le responsable est obligatoire",
    }),

  missions: z
    .array(
      z.string().min(1, "Une mission ne peut pas être vide")
    )
    .min(1, "Au moins une mission est requise"),

  profilRecherche: z.object({
    formation: z
      .string()
      .min(1, "La formation est obligatoire"),

    experience: z
      .string()
      .min(1, "L’expérience est obligatoire"),
  }),

  competenceIds: z
    .array(z.number())
    .min(1, "Au moins une compétence est requise"),

  canalIds: z
    .array(z.number())
    .optional(),
});
