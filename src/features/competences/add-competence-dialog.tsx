'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';


import { createCompetenceSchema , CreateCompetenceFormValues} from '@/app/admin/gpec/postes/components/competence.schema';

interface Props {
  open: boolean;
  onClose: () => void;
    onSubmit: (data: CreateCompetenceFormValues) => void;

  onSuccess?: () => void;
  loading?: boolean;
}


export default function AddCompetenceModal({
  open,
  onClose,
  onSubmit,
  loading = false
}: Props) 
 {
  const form = useForm<CreateCompetenceFormValues>({
    resolver: zodResolver(createCompetenceSchema),
    defaultValues: {
      libelle: '',
      categorie: '',
      description: '',
      niveaux: [{ niveau: 1, libelle: '', description: '' }]
    }
  });

  const {
    register,
    control,
    handleSubmit,
    formState: { errors }
  } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'niveaux'
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Ajouter une compétence</DialogTitle>
        </DialogHeader>

        {/* ================= CONTENU SCROLLABLE ================= */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-4">
          {/* Libellé */}
          <div className="space-y-1">
            <Label>Libellé</Label>
            <Input {...register('libelle')} />
            {errors.libelle && (
              <p className="text-sm text-red-500">
                {errors.libelle.message}
              </p>
            )}
          </div>

          {/* Catégorie */}
          <div className="space-y-1">
            <Label>Catégorie</Label>
            <Input {...register('categorie')} />
            {errors.categorie && (
              <p className="text-sm text-red-500">
                {errors.categorie.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1">
            <Label>Description</Label>
            <Input {...register('description')} />
            {errors.description && (
              <p className="text-sm text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* ================= NIVEAUX ================= */}
          <div className="space-y-3">
            <Label>Niveaux</Label>

            {fields.map((field, index) => (
              <div
                key={field.id}
                className="border rounded-lg p-3 space-y-2"
              >
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Niveau"
                    {...register(`niveaux.${index}.niveau`, {
                      valueAsNumber: true
                    })}
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => remove(index)}
                    disabled={fields.length === 1}
                  >
                    ✕
                  </Button>
                </div>

                {errors.niveaux?.[index]?.niveau && (
                  <p className="text-sm text-red-500">
                    {errors.niveaux[index]?.niveau?.message}
                  </p>
                )}

                <Input
                  placeholder="Libellé du niveau"
                  {...register(`niveaux.${index}.libelle`)}
                />
                {errors.niveaux?.[index]?.libelle && (
                  <p className="text-sm text-red-500">
                    {errors.niveaux[index]?.libelle?.message}
                  </p>
                )}

                <Input
                  placeholder="Description"
                  {...register(`niveaux.${index}.description`)}
                />
                {errors.niveaux?.[index]?.description && (
                  <p className="text-sm text-red-500">
                    {errors.niveaux[index]?.description?.message}
                  </p>
                )}
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={() =>
                append({
                  niveau: fields.length + 1,
                  libelle: '',
                  description: ''
                })
              }
            >
              + Ajouter un niveau
            </Button>

            {errors.niveaux?.message && (
              <p className="text-sm text-red-500">
                {errors.niveaux.message}
              </p>
            )}
          </div>
        </div>

        {/* ================= FOOTER FIXE ================= */}
        <DialogFooter className="pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={loading}
          >
            {loading ? 'Ajout...' : 'Ajouter'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
