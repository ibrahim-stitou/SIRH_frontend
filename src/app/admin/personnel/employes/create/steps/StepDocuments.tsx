import React from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { EmployeeCreateFormValues } from '../schema';
import { Section, FormField, EmptyHint } from '../components/Section';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { FileUploader } from '@/components/file-uploader';
import { Button } from '@/components/ui/button';

const AddButton: React.FC<{ onClick: () => void; label: string }> = ({ onClick, label }) => (
  <Button type="button" variant="outline" size="sm" onClick={onClick}>{label}</Button>
);
const RemoveChip: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button type="button" onClick={onClick} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full text-xs px-2 py-1 opacity-80 hover:opacity-100 shadow">Supprimer</button>
);

export const StepDocuments: React.FC = () => {
  const { control, formState: { errors }, register, setValue, watch } = useFormContext<EmployeeCreateFormValues>();
  const documentsArray = useFieldArray({ control, name: 'documents' });
  const documentsFiles = watch('documentsFiles') || [];

  const handleFilesChange = (index: number, action: React.SetStateAction<File[]>) => {
    const current = documentsFiles.slice();
    const previous = current[index] || [];
    const next = typeof action === 'function' ? action(previous) : action;
    current[index] = next;
    setValue('documentsFiles', current, { shouldDirty: true });
  };

  return (
    <div className="space-y-6">
      <Section title="Documents" description="Ajouter les documents avec un titre" icon="📂" toolbar={<AddButton onClick={() => documentsArray.append({ title: '' })} label="Ajouter document" />}>
        {documentsArray.fields.length === 0 && <EmptyHint text="Aucun document" />}
        <div className="space-y-4">
          {documentsArray.fields.map((f, idx) => (
            <Card key={f.id} className="p-4 space-y-3 relative group">
              <RemoveChip onClick={() => {
                documentsArray.remove(idx);
                const current = (watch('documentsFiles') || []).slice();
                current.splice(idx, 1);
                setValue('documentsFiles', current);
              }} />
              <FormField label="Titre" isRequired error={errors.documents?.[idx]?.title?.message}>
                <Input {...register(`documents.${idx}.title` as const)} placeholder="CIN" />
              </FormField>
              <div>
                <Label className="text-sm mb-2 block">Fichier</Label>
                <FileUploader
                  value={documentsFiles[idx]}
                  onValueChange={(f) => handleFilesChange(idx, f)}
                  maxFiles={1}
                  accept={{ 'image/*': [], 'application/pdf': [] }}
                  description="PDF ou image (max 2MB)"
                />
              </div>
            </Card>
          ))}
        </div>
      </Section>
    </div>
  );
};
