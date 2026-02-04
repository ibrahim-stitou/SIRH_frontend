import { apiRoutes } from '@/config/apiRoutes';
import { Candidature, OffreEmploi, OffreFormData, ResponsableRecrutement, StatutOffre } from "@/types/offre";

// ==================== OFFRES ====================

export async function getOffres(): Promise<OffreEmploi[]> {
  const response = await fetch(apiRoutes.offres.list);
  if (!response.ok) throw new Error("Erreur lors de la récupération des offres");
  const json = await response.json();
  return Array.isArray(json) ? json : json?.data ?? [];
}

export async function getOffreById(id: number): Promise<OffreEmploi> {
  const response = await fetch(apiRoutes.offres.byId(id));
  if (!response.ok) throw new Error("Offre non trouvée");
  const json = await response.json();
  return json?.data ?? json;
}

export async function createOffre(
  data: OffreFormData,
  responsable: ResponsableRecrutement
): Promise<OffreEmploi> {
  const year = new Date().getFullYear();
  const offres = await getOffres();
  const seq = String(offres.length + 1).padStart(3, "0");
  const reference = `OFF-${year}-${seq}`;

  const newOffre: Omit<OffreEmploi, "id"> = {
    reference,
    intitulePoste: data.intitulePoste,
    descriptionPoste: data.descriptionPoste,
    missionsPrincipales: data.missionsPrincipales,
    profilRecherche: data.profilRecherche,
    competencesRequises: data.competencesRequises,
    lieuTravail: data.lieuTravail,
    typeContrat: data.typeContrat,
    fourchetteSalaire: data.fourchetteSalaire,
    dateLimiteCandidature: data.dateLimiteCandidature,
    responsableRecrutement: responsable,
    statut: data.statut,
    dateCreation: new Date().toISOString().split("T")[0],
    datePublication:
      data.statut === "publiee" ? new Date().toISOString().split("T")[0] : null,
    diffusion: data.diffusion,
    lienCandidature:
      data.statut === "publiee"
        ? `https://carrieres.entreprise.ma/postuler/${reference}`
        : null,
    statistiques: {
      vues: 0,
      candidaturesRecues: 0,
      sourceCandidatures: {
        siteCarrieres: 0,
        linkedin: 0,
        rekrute: 0,
        emploiMa: 0,
        reseauxSociaux: 0,
      },
    },
    anonyme: data.anonyme,
  };

  const response = await fetch(apiRoutes.offres.list, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newOffre),
  });

  if (!response.ok) throw new Error("Erreur lors de la création de l'offre");
  const json = await response.json();
  return json?.data ?? json;
}

export async function updateOffre(
  id: number,
  data: Partial<OffreEmploi>
): Promise<OffreEmploi> {
  const response = await fetch(apiRoutes.offres.byId(id), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) throw new Error("Erreur lors de la mise à jour de l'offre");
  const json = await response.json();
  return json?.data ?? json;
}

export async function updateOffreStatut(
  id: number,
  statut: StatutOffre
): Promise<OffreEmploi> {
  const offre = await getOffreById(id);
  const updates: Partial<OffreEmploi> = { statut };

  if (statut === "publiee" && !offre.datePublication) {
    updates.datePublication = new Date().toISOString().split("T")[0];
    updates.lienCandidature = `https://carrieres.entreprise.ma/postuler/${offre.reference}`;
  }

  return updateOffre(id, updates);
}

export async function deleteOffre(id: number): Promise<void> {
  const response = await fetch(apiRoutes.offres.byId(id), {
    method: "DELETE",
  });

  if (!response.ok) throw new Error("Erreur lors de la suppression de l'offre");
}

// ==================== RESPONSABLES ====================

export async function getResponsables(): Promise<ResponsableRecrutement[]> {
  const response = await fetch(apiRoutes.responsables.list);
  if (!response.ok)
    throw new Error("Erreur lors de la récupération des responsables");
  const json = await response.json();
  return Array.isArray(json) ? json : json?.data ?? [];
}

export async function getResponsableById(
  id: number
): Promise<ResponsableRecrutement> {
  const response = await fetch(apiRoutes.responsables.byId(id));
  if (!response.ok) throw new Error("Responsable non trouvé");
  const json = await response.json();
  return json?.data ?? json;
}

// ==================== CANDIDATURES ====================

export async function getCandidaturesByOffre(
  offreId: number
): Promise<Candidature[]> {
  const response = await fetch(apiRoutes.candidatures.byOffre(offreId));
  if (!response.ok)
    throw new Error("Erreur lors de la récupération des candidatures");
  const json = await response.json();
  return Array.isArray(json) ? json : json?.data ?? [];
}

export async function getAllCandidatures(): Promise<Candidature[]> {
  const response = await fetch(apiRoutes.candidatures.list);
  if (!response.ok)
    throw new Error("Erreur lors de la récupération des candidatures");
  const json = await response.json();
  return Array.isArray(json) ? json : json?.data ?? [];
}
