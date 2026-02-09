// src/services/posteService.ts
import { apiRoutes } from "@/config/apiRoutes";
import { Poste, poste } from "@/types/poste";
import { PosteCompetence } from "@/types/postecompetence";

// =======================
// POSTE
// =======================
export const getPosteById = async (posteId: number) => {
  const res = await fetch(
    `http://localhost:3001/settings/postes/${posteId}`
  );

  if (!res.ok) throw new Error("Erreur API");

  return res.json();
};


// =======================
// POSTE ↔ COMPÉTENCES
// =======================
// export const getCompetencesByPoste = async (
//   posteId: number
// ): Promise<PosteCompetence[]> => {
//   const res = await fetch(
//     apiRoutes.admin.parametres.posteCompetences.byPoste(posteId)
//   );

//   if (!res.ok) {
//     throw new Error("Erreur chargement compétences du poste");
//   }

//   return res.json();
// };

// =======================
// SAVE ALL STRATEGY
// =======================
// export const savePosteCompetences = async (
//   posteId: number,
//   competences: PosteCompetence[]
// ) => {
//   // 1️⃣ récupérer l’existant
//   const existing = await getCompetencesByPoste(posteId);

//   // 2️⃣ supprimer l’existant
//   await Promise.all(
//     existing.map((pc) =>
//       fetch(
//         apiRoutes.admin.parametres.posteCompetences.delete(pc.id as number),
//         { method: "DELETE" }
//       )
//     )
//   );

//   // 3️⃣ recréer les relations
//   await Promise.all(
//     competences.map((pc) =>
//       fetch(
//         apiRoutes.admin.parametres.posteCompetences.create,
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             poste_id: posteId,
//             competence_id: pc.competence_id,
//             niveau_requis: pc.niveau_requis,
//             importance: pc.importance
//           })
//         }
//       )
//     )
//   );
// };

// =======================
// EXPORT
// =======================
const posteService = {
  getPosteById,
  // getCompetencesByPoste,
  // savePosteCompetences
};

export default posteService;
