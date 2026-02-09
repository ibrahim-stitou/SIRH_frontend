"use client";

import { useState } from "react";
import { Trash2, Pencil, Star, Sparkles } from "lucide-react";
import { PosteCompetence } from "@/types/postecompetence";
import { LevelTooltip } from "./level-tooltip";
import { EditCompetenceModal } from "./EditCompetenceModal";

interface Props {
  data: PosteCompetence;
  onDelete: (competenceId: number) => void;
  onUpdate: (
    competenceId: number,
    niveau: number,
    importance: number
  ) => Promise<void>;
}

export function CompetenceCard({ data, onDelete, onUpdate }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // 🔥 Règle métier: 1 = Indispensable, 5 = Souhaitable
  const isEssential = data.importance === 1;

  const handleUpdate = async (niveau: number, importance: number) => {
    try {
      setLoading(true);
      await onUpdate(data.competence.id, niveau, importance);
      setOpen(false);
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      alert("Erreur lors de la mise à jour de la compétence");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="group relative overflow-hidden rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-950">
        {/* Accent bar */}
        <div
          className={`absolute inset-x-0 top-0 h-0.5 ${
            isEssential
              ? "bg-gradient-to-r from-amber-500 to-orange-500"
              : "bg-gradient-to-r from-blue-500 to-purple-500"
          }`}
        />

        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                  {data.competence.libelle}
                </h3>

                {isEssential ? (
                  <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                ) : (
                  <Star className="h-4 w-4 fill-blue-500 text-blue-500" />
                )}
              </div>

              <div className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2 py-0.5 dark:bg-slate-800">
                <div className={`h-1.5 w-1.5 rounded-full ${isEssential ? 'bg-amber-500' : 'bg-blue-500'}`} />
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  {data.competence.categorie}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                onClick={() => !loading && setOpen(true)}
                className="rounded-md p-1.5 text-blue-600 transition-colors hover:bg-blue-50 disabled:opacity-50 dark:text-blue-400 dark:hover:bg-blue-950"
                aria-label="Modifier"
                disabled={loading}
              >
                <Pencil className="h-4 w-4" />
              </button>

              <button
                onClick={() => !loading && onDelete(data.competence.id)}
                className="rounded-md p-1.5 text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-950"
                aria-label="Supprimer"
                disabled={loading}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent dark:via-slate-700" />

          {/* Footer */}
          <div className="flex items-center justify-between text-sm">
            <LevelTooltip
              level={data.niveau_requis}
              description={data.niveau?.description || undefined}
            />

            <div className="flex items-center gap-1.5">
              {isEssential ? (
                <>
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  <span className="font-semibold text-amber-600 dark:text-amber-500">
                    Indispensable
                  </span>
                </>
              ) : (
                <>
                  <Star className="h-3.5 w-3.5 text-blue-500" />
                  <span className="font-medium text-blue-600 dark:text-blue-400">
                    Souhaitable
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <EditCompetenceModal
        open={open}
        loading={loading}
        onClose={() => !loading && setOpen(false)}
        competenceId={data.competence.id}
        competenceLabel={data.competence.libelle}
        initialLevel={data.niveau_requis}
        initialImportance={data.importance}
        onSubmit={handleUpdate}
      />
    </>
  );
}