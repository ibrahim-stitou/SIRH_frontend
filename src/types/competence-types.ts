export interface Competence {
  id: number;
  libelle: string;
  categorie: string;
  description: string;
}

export interface PosteCompetenceRow {
  id?: number;
  poste_id: number;
  competence_id: number;
  niveau_requis: 1 | 2 | 3 | 4 | 5;
  importance: 'INDISPENSABLE' | 'SOUHAITABLE';
  competence: Competence;
}
