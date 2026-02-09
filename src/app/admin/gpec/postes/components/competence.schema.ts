import * as z from 'zod';

export const competenceNiveauSchema = z.object({
  niveau: z.number().min(1, 'Niveau minimum = 1'),
  libelle: z.string().min(1, 'Libellé requis'),
  description: z.string().min(1, 'Description requise')
});

export const createCompetenceSchema = z.object({
  libelle: z.string().min(1, 'Libellé requis'),
  categorie: z.string().min(1, 'Catégorie requise'),
  description: z.string().min(1, 'Description requise'),
  niveaux: z.array(competenceNiveauSchema).min(1)
});

export type CreateCompetenceFormValues = z.infer<
  typeof createCompetenceSchema
>;

export const affectationCompetenceSchema = z.object({
  posteId: z.number().min(1, 'Poste requis'),
  competenceId: z.number().min(1, 'Compétence requise'),
  niveauRequis: z.number().min(1, 'Niveau requis'),
  importance: z.number().min(1).max(5)
});

export type AffectationCompetenceFormValues = z.infer<
  typeof affectationCompetenceSchema
>;

export const editCompetenceSchema = z.object({
  libelle: z.string().min(1, 'Le libellé est obligatoire'),
  categorie: z.string().optional(),
  description: z.string().optional()
});
