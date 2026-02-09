import { Poste } from "@/types/poste";
import { BookOpen, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PosteInfoCardProps {
  poste: Poste;
  competencesCount?: number;
  onQuickAdd?: () => void;
}

export function PosteInfoCard({
  poste,
  competencesCount = 0,
  onQuickAdd
}: PosteInfoCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:shadow-lg dark:border-slate-800 dark:bg-slate-950">
      {/* Gradient accent */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

      <div className="p-6 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {poste.libelle}
            </h1>

            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Code
              </span>
              <code className="rounded-md bg-slate-100 px-2.5 py-1 font-mono text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                {poste.code}
              </code>
            </div>
          </div>

          {/* QUICK ADD */}
          {onQuickAdd && (
            <Button
              size="sm"
              onClick={onQuickAdd}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Ajouter compétence
            </Button>
          )}
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent dark:via-slate-700" />

        {/* Details Grid */}
        <div className="grid gap-4 sm:grid-cols-3">
          {/* Métier */}
          <div className="space-y-1.5 rounded-lg bg-slate-50 p-4 transition-colors hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Métier
              </span>
            </div>
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
              {poste.metier?.libelle || (
                <span className="text-slate-400 dark:text-slate-600">
                  Non défini
                </span>
              )}
            </p>
          </div>

          {/* Emploi */}
          <div className="space-y-1.5 rounded-lg bg-slate-50 p-4 transition-colors hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-purple-500" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Emploi
              </span>
            </div>
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
              {poste.emploi?.libelle || (
                <span className="text-slate-400 dark:text-slate-600">
                  Non défini
                </span>
              )}
            </p>
          </div>

          {/* Compétences */}
          <div className="space-y-1.5 rounded-lg bg-slate-50 p-4 transition-colors hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-pink-500" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Compétences
              </span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-slate-400 dark:text-slate-500" />
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                {competencesCount}{" "}
                {competencesCount > 1 ? "compétences" : "compétence"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
