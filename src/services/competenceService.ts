import apiClient from '@/lib/api';
import { apiRoutes } from '@/config/apiRoutes';
import { poste } from '@/types/poste';
import { PosteCompetence } from '@/types/postecompetence';
import { CompetenceNiveau } from '@/types/competence-niveau';
import { toast } from 'sonner';
import { Competence } from '@/types/competence-types';

/* =====================================================
   POSTE
===================================================== */

export const getPosteById = async (posteId: number): Promise<poste> => {
  const res = await apiClient.get(
    apiRoutes.admin.parametres.postes.show(posteId)
  );

  return res.data?.data ?? res.data;
};

/* =====================================================
   RÉFÉRENTIEL DES COMPÉTENCES
===================================================== */

export const getAllCompetences = async (): Promise<any[]> => {
  const res = await apiClient.get('/competences');
  const payload = res.data?.data ?? res.data;
  return Array.isArray(payload) ? payload : [];
};


/* =====================================================
   POSTE ↔ COMPÉTENCES
===================================================== */





export async function createCompetence(payload: {
  libelle: string;
  categorie?: string;
  description?: string;
  niveaux: {
    niveau: number;
    libelle: string;
    description: string;
  }[];
}) {
  try {
    const res = await apiClient.post(
      apiRoutes.admin.parametres.competences.create,
      payload
    );

    return res.data;
  } catch (error: any) {
    // 👉 message envoyé par le backend (409, 400, etc.)
    const message =
      error?.response?.data?.message ||
      "Erreur lors de la création de la compétence";

    throw new Error(message);
  }
}

export const getCompetencesByPoste = async (
  posteId: number | string
): Promise<PosteCompetence[]> => {
  const res = await apiClient.get(
    apiRoutes.admin.parametres.posteCompetences.byPoste(posteId)
  );

  const payload = res.data?.data ?? res.data;
  return Array.isArray(payload) ? payload : [];
};

export const assignCompetenceToPoste = async (
  posteId: number | string,
  competenceId: number | string,
  payload?: Partial<PosteCompetence>
) => {
  return apiClient.post(
    apiRoutes.admin.parametres.posteCompetences.create,
    {
      poste_id: posteId,
      competence_id: competenceId,
      niveau_requis: payload?.niveau_requis ?? 1,
      importance: payload?.importance ?? 2 // 1 = indispensable, 2 = souhaitable
    }
  );
};





// services/competenceService.ts
// src/services/competenceService.ts

export async function getCompetenceNiveaux(competenceId: number) {
  if (!competenceId) {
    throw new Error("competenceId est requis");
  }

  const res = await fetch(
    apiRoutes.admin.parametres.competences.competenceNiveaux.byCompetence(
      competenceId
    )
  );

  if (!res.ok) {
    throw new Error("Erreur lors du chargement des niveaux");
  }

  const data = await res.json();

  return data.data ?? data;
}


const onDelete = async (competenceId: number) => {
  try {
    await apiClient.delete(
      apiRoutes.admin.parametres.competences.delete(competenceId)
    );

    toast.success('Compétence supprimée avec succès');

    // si ton CustomTable expose un refresh :
    // tableInstance?.refresh?.();

  } catch (error) {
    console.error(error);
    toast.error('Erreur lors de la suppression de la compétence');
  }


};


// 🔹 Récupérer les compétences
export async function getCompetences(): Promise<Competence[]> {
  try {
    const response = await apiClient.get(
      apiRoutes.admin.parametres.competences.list
    );

    return response.data;
  } catch (error) {
    console.error("getCompetences error:", error);
    return [];
  }
};



