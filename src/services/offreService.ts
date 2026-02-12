import { apiRoutes } from "@/config/apiRoutes";
import { ResponsableRecrutement } from "@/types/offre";
import type { OffreEmploi, OffreEmploiUI, StatutOffre } from "@/types/PosteOffre";



/**
 * Fonction utilitaire pour mapper les données de l'API vers le format UI
 */
export function mapOffreToUI(offre: OffreEmploi): OffreEmploiUI {
  // Extraire les compétences du ProfilRecherche de type COMPETENCE
  const competences = offre.ProfilRecherche
    .filter((profil) => profil.type === "COMPETENCE")
    .map((profil) => profil.contenu);

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
    anonyme: offre.anonymisee,
    lienCandidature: offre.lienCandidature,
    competencesRequises: competences,
    responsableRecrutement: {
      nom: offre.responsable.nom,
      email: offre.responsable.email,
    },
    statistiques: {
      vues: offre.OffreStatistiques[0]?.nombreVues || 0,
      candidaturesRecues: offre.OffreStatistiques[0]?.nombreCandidatures || 0,
    },
  };
}

/**
 * Récupérer toutes les offres d'emploi
 */
export async function getOffres(): Promise<OffreEmploiUI[]> {
 const response = await fetch(apiRoutes.offres.list);
  

  if (!response.ok) {
    throw new Error(`Erreur HTTP: ${response.status}`);
  }

  const data: OffreEmploi[] = await response.json();
  
  // Mapper les données vers le format UI
  return data.map(mapOffreToUI);
}

/**
 * Récupérer une offre spécifique par ID
 */
export async function getOffreById(id: number): Promise<OffreEmploiUI> {
  const response = await fetch(apiRoutes.offres.byId(id));

  if (!response.ok) {
    throw new Error("Erreur lors du chargement de l'offre");
  }

  return response.json();
}


/**
 * Mettre à jour le statut d'une offre
 */
export async function updateOffreStatut(
  id: number,
  newStatut: "brouillon" | "publiee" | "cloturee"
): Promise<void> {
  // Mapper le statut UI vers le format API
  const statutMapping: Record<"brouillon" | "publiee" | "cloturee", StatutOffre> = {
    brouillon: "BROUILLON",
    publiee: "PUBLIQUE",
    cloturee: "CLOTUREE",
  };

  const response = await fetch(`http://localhost:3001//offres/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      statut: statutMapping[newStatut],
    }),
  });

  if (!response.ok) {
    throw new Error(`Erreur HTTP: ${response.status}`);
  }
}

/**
 * Supprimer une offre
 */
export async function deleteOffre(id: number): Promise<void> {
  const response = await fetch(`http://localhost:3001//offres/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Erreur HTTP: ${response.status}`);
  }
}

/**
 * Créer une nouvelle offre
 */
export async function createOffre(offre: Partial<OffreEmploi>): Promise<OffreEmploi> {
  const response = await fetch(`http://localhost:3001/offres`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(offre),
  });

  if (!response.ok) {
    throw new Error(`Erreur HTTP: ${response.status}`);
  }

  return response.json();
}

/**
 * Mettre à jour une offre complète
 */
export async function updateOffre(
  id: number,
  offre: Partial<OffreEmploi>
): Promise<OffreEmploi> {
  const response = await fetch(`http://localhost:3001//offres/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(offre),
  });

  if (!response.ok) {
    throw new Error(`Erreur HTTP: ${response.status}`);
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

