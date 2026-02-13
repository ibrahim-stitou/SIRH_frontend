import { apiRoutes } from "@/config/apiRoutes";
import apiClient from "@/lib/api";
import { CanalDiffusion } from "@/types/canalDiffusion";
import { OffreFormData, ResponsableRecrutement } from "@/types/offre";
import type { Competence, OffreEmploi, OffreEmploiUI, StatutOffre } from "@/types/PosteOffre";

export function mapOffreToUI(offre: OffreEmploi): OffreEmploiUI {
  // Mapper le statut de l'API vers le format UI
  const statutMapping: Record<StatutOffre, "brouillon" | "publiee" | "cloturee"> = {
    BROUILLON: "brouillon",
    PUBLIQUE: "publiee",
    CLOTUREE: "cloturee",
  };

  return {
    id: offre.id,
    reference: offre.reference,
    intitulePoste: offre.poste?.libelle || "Poste non défini",
    descriptionPoste: offre.description,
    lieuTravail: offre.lieuTravail,
    typeContrat: offre.typeContrat,
    fourchetteSalaire:
      offre.salaireMin && offre.salaireMax
        ? {
            min: offre.salaireMin,
            max: offre.salaireMax,
            devise: "MAD",
          }
        : null,
    dateLimiteCandidature: offre.dateLimiteCandidature,
    statut: statutMapping[offre.statut],
    lienCandidature: offre.lienCandidature,
    competencesRequises: offre.competencesRequises || [],
    responsableRecrutement: {
  nom: offre.responsable?.nom || "Non assigné",
 // email: offre.responsable?.email || "",
},

    statistiques: {
      vues: offre.OffreStatistiques?.nombreVues || 0,
      candidaturesRecues: offre.OffreStatistiques?.nombreCandidatures || 0,
    },
  };
}



export const changerStatutOffre = async (
  id: number,
  statut: "BROUILLON" | "PUBLIQUE" | "CLOTUREE"
) => {
  const response = await fetch(apiRoutes.offres.changeStatut(id), {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ statut }),
  });

  if (!response.ok) {
    throw new Error("Erreur lors du changement de statut");
  }

  return response.json();
};

/**
 * Récupérer une offre spécifique par ID
 */
export async function getOffreById(id: number): Promise<OffreEmploi> {
  const response = await fetch(apiRoutes.offres.byId(id));

  if (!response.ok) {
    throw new Error("Erreur lors du chargement de l'offre");
  }

  return response.json();
}







export async function getResponsables(): Promise<ResponsableRecrutement[]> {
  const response = await fetch(apiRoutes.responsables.list);
  if (!response.ok)
    throw new Error("Erreur lors de la récupération des responsables");
  const json = await response.json();
  return Array.isArray(json) ? json : json?.data ?? [];
}





export async function createOffre(
  formData: OffreFormData,
  responsable: ResponsableRecrutement
): Promise<OffreEmploi> {

  const competenceIds = formData.competencesRequises.map((c) =>
    typeof c === "object" ? c.id : c
  );

  const payload = {
    ...formData,
    competencesRequises: competenceIds,
    responsableRecrutementId: responsable.id,
  };

  const { data } = await apiClient.post(
    apiRoutes.offres.nouveau,
    payload
  );

  return data;
}


export async function getOffres(): Promise<OffreEmploiUI[]> {
  const { data } = await apiClient.get(apiRoutes.offres.list);

  return data.map(mapOffreToUI);
}

export async function deleteOffre(
  id: number
): Promise<void> {
  await apiClient.delete(
    apiRoutes.offres.delete(id)
  );
}


  




  export async function getCanaux(): Promise<CanalDiffusion[]> {
  try {
    const { data } = await apiClient.get(
      apiRoutes.canaux.list
    );

    return data;
  } catch (error) {
    console.error("getCanaux error:", error);
    return [];
  }
}














