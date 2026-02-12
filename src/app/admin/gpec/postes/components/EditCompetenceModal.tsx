"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
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
import { SelectField } from "@/components/custom/SelectField"; // Ajout

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
}: Props) {
  const [niveaux, setNiveaux] = useState<CompetenceNiveau[]>([]);
  const [niveau, setNiveau] = useState(initialLevel);

  // ✅ Formulaire react-hook-form pour l'importance
  const importanceForm = useForm({
    defaultValues: {
      importance: initialImportance
    }
  });

  /** 🔄 Sync quand on ouvre le modal - TRÈS IMPORTANT */
  useEffect(() => {
    if (open) {
      setNiveau(initialLevel);
      importanceForm.reset({ importance: initialImportance }); // ✅ Reset du formulaire
    }
  }, [initialLevel, initialImportance, open, importanceForm]);

  useEffect(() => {
    if (!open || !competenceId) return;

    getCompetenceNiveaux(competenceId)
      .then(setNiveaux)
      .catch(console.error);
  }, [open, competenceId]);

  const handleSave = async () => {
    const importance = importanceForm.getValues("importance"); // ✅ Récupérer la valeur
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

          <SelectField
            name="importance"
            control={importanceForm.control}
            options={[
              { id: 1, label: 'Indispensable' },
              { id: 5, label: 'Souhaitable' }
            ]}
            displayField="label"
            placeholder="Sélectionner l'importance"
            className="w-full"
          />
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