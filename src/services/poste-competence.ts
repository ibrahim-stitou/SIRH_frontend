import { apiRoutes } from "@/config/apiRoutes";
import apiClient from "@/lib/api";

/**
 * =========================
 * GET – compétences d’un poste
 * =========================
 */
export async function getPosteCompetences(posteId: number) {
  const res = await fetch(
    apiRoutes.admin.parametres.posteCompetences.byPoste(posteId)
  );

  if (!res.ok) {
    throw new Error("Erreur lors du chargement des compétences du poste");
  }

  return res.json();
}

/**
 * =========================
 * POST – associer compétence à poste
 * =========================
 */
export async function addPosteCompetence(payload: any) {
  try {
    const res = await apiClient.post(
      apiRoutes.admin.parametres.posteCompetences.create,
      payload
    );
    return res.data;
  } catch (err: any) {
    throw err; // 🔥 IMPORTANT
  }
}


/**
 * =========================
 * PUT – modifier niveau / importance
 * =========================
 */
export async function updatePosteCompetence(
  posteId: number,
  competenceId: number,
  payload: {
    niveau_requis: number;
    importance: number;
  }
) {
  return apiClient.put(
    `/settings/postes-competences/${posteId}/competences/${competenceId}`,
    payload
  );
}

/**
 * =========================
 * DELETE – supprimer association
 * (poste_id + competence_id dans l’URL)
 * =========================
 */
export async function deletePosteCompetence(
  posteId: number,
  competenceId: number
) {
  const res = await fetch(
    apiRoutes.admin.parametres.posteCompetences.delete,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        poste_id: posteId,
        competence_id: competenceId,
      }),
    }
  );

  if (!res.ok) {
    throw new Error("Erreur lors de la suppression");
  }

  return res.json();
}

export async function quickAddCompetence(payload: {
  poste_id: number;
  libelle: string;
  categorie: string;
  description?: string;
}) {
  const res = await fetch(
    apiRoutes.admin.parametres.posteCompetences.quickAdd,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );

  if (!res.ok) {
    throw new Error("Erreur Quick Add compétence");
  }

  return res.json();

}



// @/types/poste-competence.ts
export interface QuickAddPosteCompetencePayload {
  poste_id: number;
  libelle: string;
  categorie?: string;
  description?: string;

  /** Affectation directe au poste */
  niveau_requis: number;
  importance: number;
}


export async function quickAddPosteCompetence(
  payload: QuickAddPosteCompetencePayload
) {
  const res = await fetch(
    apiRoutes.admin.parametres.posteCompetences.quickAdd,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  const data = await res.json();

  if (!res.ok) {
    // ⚠️ Gestion propre des erreurs backend (409 inclus)
    throw new Error(data?.message || "Erreur lors de l’ajout de la compétence");
  }

  return data;
}
