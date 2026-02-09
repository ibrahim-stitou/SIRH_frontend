"use client";

import { PosteCompetence } from "@/types/postecompetence";
import {
  deletePosteCompetence,
  updatePosteCompetence,
} from "@/services/poste-competence";
import { CompetenceCard } from "./competence-card";


interface Props {
  posteId: number;
  data: PosteCompetence[];
  onRefresh: () => void;
}

export function CompetenceGrid({ posteId, data, onRefresh }: Props) {
  const handleDelete = async (competenceId: number) => {
    if (!confirm("Supprimer cette compétence ?")) return;
    await deletePosteCompetence(posteId, competenceId);
    onRefresh();
  };

  const handleUpdate = async (
    competenceId: number,
    niveau: number,
    importance: number
  ) => {
    await updatePosteCompetence(posteId, competenceId, {
      niveau_requis: niveau,
      importance,
    });

    onRefresh();
  };

  return (
    <div className="space-y-4">
      {/* GRID 4 PAR LIGNE */}
      <div className="grid grid-cols-4 gap-4">
        {data.map((item) => (
          <CompetenceCard
            key={item.competence.id}
            data={item}
            onDelete={handleDelete}
            onUpdate={handleUpdate}
          />
        ))}
      </div>
    </div>
  );
}