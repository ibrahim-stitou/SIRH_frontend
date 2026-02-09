import { Competence } from "./competence-types"
import { CompetenceNiveau } from "./competence-niveau"

export interface PosteCompetence {
  id: number
  poste_id: number
  competence: Competence

  // 🔥 les deux (pratique)
  niveau_requis: number
  niveau: CompetenceNiveau   // ✅ OBJET COMPLET

  importance: 1 | 5
}
