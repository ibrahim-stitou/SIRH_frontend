import React from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { EmployeeCreateFormValues } from '../schema';
import { Section, FormField, EmptyHint } from '../components/Section';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { FileUploader } from '@/components/file-uploader';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { Plus, Trash2, FileText, Upload } from 'lucide-react';

const AddButton: React.FC<{ onClick: () => void; label: string }> = ({ onClick, label }) => (
  <Button
    type="button"
    variant="outline"
    size="sm"
    onClick={onClick}
    className="gap-2 hover:bg-primary hover:text-primary-foreground transition-colors"
  >
    <Plus className="h-4 w-4" />
    {label}
  </Button>
);

const RemoveButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  const { t } = useLanguage();
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={onClick}
      className="absolute top-2 right-2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground"
    >
      <Trash2 className="h-4 w-4" />
      <span className="sr-only">{t('common.delete')}</span>
    </Button>
  );
};

export const StepDocuments: React.FC = () => {
  const { control, formState: { errors }, register, setValue, watch } = useFormContext<EmployeeCreateFormValues>();
  const { t } = useLanguage();
  const documentsArray = useFieldArray({ control, name: 'documents' });
  const documentsFiles = watch('documentsFiles') || [];

  const handleFilesChange = (index: number, action: React.SetStateAction<File[]>) => {
    const current = documentsFiles.slice();
    const previous = current[index] || [];
    current[index] = typeof action === 'function' ? action(previous) : action;
    setValue('documentsFiles', current, { shouldDirty: true });
  };

  const handleRemoveDocument = (idx: number) => {
    documentsArray.remove(idx);
    const current = (watch('documentsFiles') || []).slice();
    current.splice(idx, 1);
    setValue('documentsFiles', current);
  };

  return (
    <div className="space-y-6">
      <Section
        title={t('employeeCreate.steps.documents')}
        description={t('employeeCreate.documents.help')}
        icon={<FileText className="h-5 w-5" />}
        toolbar={
          <AddButton
            onClick={() => documentsArray.append({ title: '' })}
            label={t('common.add')}
          />
        }
      >
        {documentsArray.fields.length === 0 && (
          <EmptyHint text={t('employeeDetails.empty.noDocuments')} icon="📄" />
        )}

        <div className="space-y-4">
          {documentsArray.fields.map((f, idx) => (
            <Card
              key={f.id}
              className="p-5 relative group border-l-4 border-l-primary/20 hover:border-l-primary/50 transition-all hover:shadow-md animate-in slide-in-from-top-2"
            >
              <RemoveButton onClick={() => handleRemoveDocument(idx)} />

              <div className="space-y-4">
                {/* Document Header */}
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="secondary" className="gap-1">
                    <FileText className="h-3 w-3" />
                    Document {idx + 1}
                  </Badge>
                </div>

                {/* Document Title */}
                <FormField
                  label="Titre du document"
                  isRequired
                  error={errors.documents?.[idx]?.title?.message}
                  hint="Ex: CIN, Diplôme, Photo..."
                >
                  <Input
                    {...register(`documents.${idx}.title` as const)}
                    placeholder="CIN, Diplôme, Photo..."
                    className="transition-all focus:ring-2 focus:ring-primary"
                  />
                </FormField>

                {/* File Uploader */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    {t('common.uploaded') || 'Fichier'}
                  </Label>
                  <FileUploader
                    value={documentsFiles[idx]}
                    onValueChange={(f) => handleFilesChange(idx, f)}
                    maxFiles={1}
                    accept={{ 'image/*': [], 'application/pdf': [] }}
                    description="PDF ou image (max 2MB)"
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Helper Text */}
        {documentsArray.fields.length > 0 && (
          <div className="flex items-start gap-2 p-4 rounded-lg bg-muted/50 border border-muted-foreground/20">
            <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium">Documents recommandés</p>
              <p className="text-xs text-muted-foreground">
                CIN (recto/verso), Photo d'identité, Diplômes, Attestations de travail, Relevé d'identité bancaire (RIB)
              </p>
            </div>
          </div>
        )}
      </Section>
    </div>
  );
};
