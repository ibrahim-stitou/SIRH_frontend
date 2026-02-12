'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import apiClient from '@/lib/api';
import { apiRoutes } from '@/config/apiRoutes';
import { CompetenceRow } from './competence-list';

import * as z from 'zod';

// ✅ Schéma de validation pour l'édition d'une compétence
const editCompetenceSchema = z.object({
  libelle: z.string().min(1, 'Le libellé est obligatoire'),
  categorie: z.string().optional(),
  description: z.string().optional()
});

type ValidationErrors = {
  libelle?: string;
  categorie?: string;
  description?: string;
};

interface Props {
  open: boolean;
  onClose: () => void;
  competence: CompetenceRow | null;
  onSuccess: () => void;
}

export default function EditCompetenceDialog({
  open,
  onClose,
  competence,
  onSuccess
}: Props) {
  const [libelle, setLibelle] = useState('');
  const [categorie, setCategorie] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  /* Pré-remplir */
  useEffect(() => {
    if (competence) {
      setLibelle(competence.libelle);
      setCategorie(competence.categorie || '');
      setDescription(competence.description || '');
      setValidationErrors({}); // ✅ Reset des erreurs
    }
  }, [competence]);

  /** ✅ Validation avec Zod */
  const validateForm = (): boolean => {
    const result = editCompetenceSchema.safeParse({
      libelle,
      categorie,
      description
    });

    if (!result.success) {
      const zodErrors = result.error.flatten();
      const errors: ValidationErrors = {};

      if (zodErrors.fieldErrors.libelle) {
        errors.libelle = zodErrors.fieldErrors.libelle[0];
      }
      if (zodErrors.fieldErrors.categorie) {
        errors.categorie = zodErrors.fieldErrors.categorie[0];
      }
      if (zodErrors.fieldErrors.description) {
        errors.description = zodErrors.fieldErrors.description[0];
      }

      setValidationErrors(errors);
      
      // ✅ Afficher le toast d'erreur pour la première erreur trouvée
      const firstError = errors.libelle || errors.categorie || errors.description;
      if (firstError) {
        toast.error(firstError);
      }
      
      return false;
    }

    setValidationErrors({});
    return true;
  };

  const handleSubmit = async () => {
    if (!competence) return;

    // ✅ Validation avant soumission
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      await apiClient.put(
        apiRoutes.admin.parametres.competences.update(competence.id),
        {
          libelle,
          categorie,
          description
        }
      );

      toast.success('Compétence mise à jour');
      onSuccess();
      onClose();
    } catch (e: any) {
      toast.error(
        e?.response?.data?.message ||
          'Erreur lors de la mise à jour'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Modifier la compétence</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1">
            <Label>Libellé *</Label>
            <Input
              value={libelle}
              onChange={(e) => {
                setLibelle(e.target.value);
                // ✅ Reset l'erreur quand l'utilisateur tape
                setValidationErrors(prev => ({ ...prev, libelle: undefined }));
              }}
              className={validationErrors.libelle ? 'border-red-500' : ''}
            />
            {validationErrors.libelle && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.libelle}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label>Catégorie</Label>
            <Input
              value={categorie}
              onChange={(e) => {
                setCategorie(e.target.value);
                // ✅ Reset l'erreur quand l'utilisateur tape
                setValidationErrors(prev => ({ ...prev, categorie: undefined }));
              }}
              className={validationErrors.categorie ? 'border-red-500' : ''}
            />
            {validationErrors.categorie && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.categorie}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label>Description</Label>
            <Input
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                // ✅ Reset l'erreur quand l'utilisateur tape
                setValidationErrors(prev => ({ ...prev, description: undefined }));
              }}
              className={validationErrors.description ? 'border-red-500' : ''}
            />
            {validationErrors.description && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.description}</p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Annuler
            </Button>

            <Button onClick={handleSubmit} disabled={loading}>
              Enregistrer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}