"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getCompetenceNiveaux } from "@/services/competenceService";
import { LevelTooltip } from "./level-tooltip";
import { CompetenceNiveau } from "@/types/competence-niveau";

interface Props {
  open: boolean;
  loading?: boolean;
  onClose: () => void;
  competenceId: number; 
  competenceLabel: string; 
  initialLevel: number;
  initialImportance: number;
  onSubmit: (niveau: number, importance: number) => Promise<void>;
}
export function EditCompetenceModal({
  open,
  loading = false,
  onClose,
  competenceId, 
  competenceLabel,
  initialLevel,
  initialImportance,
  onSubmit
}: Props) 
 {
  const [niveaux, setNiveaux] = useState<CompetenceNiveau[]>([]);
  const [niveau, setNiveau] = useState(initialLevel);
  const [importance, setImportance] = useState(initialImportance);

  /** 🔄 Sync quand on ouvre le modal - TRÈS IMPORTANT */
  useEffect(() => {
    if (open) {
      setNiveau(initialLevel);
      setImportance(initialImportance); // ✅ Ceci met à jour l'état avec la valeur initiale
    }
  }, [initialLevel, initialImportance, open]);

useEffect(() => {
  if (!open || !competenceId) return;

  getCompetenceNiveaux(competenceId)
    .then(setNiveaux)
    .catch(console.error);
}, [open, competenceId]);


  const handleSave = async () => {
    await onSubmit(niveau, importance);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader className="space-y-1">
  <DialogTitle>Modifier la compétence</DialogTitle>

  {/* ✅ Nom de la compétence */}
  <div className="inline-flex items-center rounded-md bg-slate-100 px-4 py-3 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
    {competenceLabel}
  </div>
</DialogHeader>


        {/* ===== Niveaux ===== */}
        <div className="space-y-2">
          <div className="text-sm font-medium">Niveau requis</div>

          <div className="flex gap-2 flex-wrap">
            {niveaux.map(n => (
              <button
                key={n.id}
                type="button"
                onClick={() => setNiveau(n.niveau)}
                disabled={loading}
                className={`px-3 py-2 border rounded-md text-sm transition disabled:opacity-50 disabled:cursor-not-allowed
                  ${
                    niveau === n.niveau
                      ? "bg-primary text-white"
                      : "hover:bg-muted"
                  }
                `}
              >
                <LevelTooltip
                  level={n.niveau}
                  description={n.description}
                />
              </button>
            ))}
          </div>
        </div>

        {/* ===== Importance ===== */}
        <div className="space-y-2 mt-4">
          <div className="text-sm font-medium">Importance</div>

          <select
            value={importance} // ✅ Ceci affiche la valeur actuelle (1 ou 5)
            onChange={(e) => setImportance(Number(e.target.value))}
            disabled={loading}
            className="border rounded-md p-2 w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value={1}>Indispensable</option> {/* ✅ Si importance=1, celle-ci sera sélectionnée */}
            <option value={5}>Souhaitable</option> {/* ✅ Si importance=5, celle-ci sera sélectionnée */}
          </select>
        </div>

        {/* ===== Actions ===== */}
        <div className="flex justify-end gap-2 mt-6">
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={loading}
          >
            Annuler
          </Button>
          <Button 
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}