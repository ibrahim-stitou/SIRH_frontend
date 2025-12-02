import React from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { format } from 'date-fns';
import { EmployeeCreateFormValues } from '../schema';
import { Section, FormField, EmptyHint } from '../components/Section';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { Plus, Trash2, GraduationCap, Brain, Award, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DatePickerField } from '@/components/custom/DatePickerField';

const AddButton: React.FC<{ onClick: () => void; label: string; icon?: React.ReactNode }> = ({
  onClick,
  label,
  icon = <Plus className="h-4 w-4" />
}) => (
  <Button
    type="button"
    variant="outline"
    size="sm"
    onClick={onClick}
    className="gap-2 hover:bg-primary hover:text-primary-foreground transition-colors"
  >
    {icon}
    {label}
  </Button>
);

const RemoveButton: React.FC<{ onClick: () => void; label?: string }> = ({ onClick, label }) => {
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
      <span className="sr-only">{label || t('common.delete')}</span>
    </Button>
  );
};

const SkillLevelIndicator: React.FC<{ level: number; max?: number }> = ({ level, max = 5 }) => (
  <div className="flex items-center gap-1">
    {Array.from({ length: max }, (_, i) => (
      <div
        key={i}
        className={cn(
          "h-2 w-8 rounded-full transition-all",
          i < level ? "bg-primary" : "bg-muted"
        )}
      />
    ))}
  </div>
);

export const StepProfessional: React.FC = () => {
  const { register, control, formState: { errors }, watch, setValue } = useFormContext<EmployeeCreateFormValues>();
  const { t } = useLanguage();
  const educationArray = useFieldArray({ control, name: 'education' });
  const skillsArray = useFieldArray({ control, name: 'skills' });
  const certsArray = useFieldArray({ control, name: 'certifications' });

  const skills = watch('skills') || [];
  const certifications = watch('certifications') || [];

  return (
    <div className="space-y-6">
      {/* Job Information */}
      <Section
        title={t('employeeCreate.fields.position')}
        description={t('employeeCreate.steps.professional')}
        icon={<Briefcase className="h-5 w-5" />}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            label={t('employeeCreate.fields.departmentId')}
            isRequired
            error={errors.departmentId?.message}
            hint="Sélectionner le département"
          >
            <Input
              {...register('departmentId')}
              placeholder={t('employeeCreate.fields.departmentId')}
              className="transition-all focus:ring-2 focus:ring-primary"
            />
          </FormField>
          <FormField
            label={t('employeeCreate.fields.position')}
            isRequired
            error={errors.position?.message}
            hint="Ex: Ingénieur, Manager"
          >
            <Input
              {...register('position')}
              placeholder="Engineer"
              className="transition-all focus:ring-2 focus:ring-primary"
            />
          </FormField>
          <DatePickerField
            name="hireDate"
            label={t('employeeCreate.fields.hireDate')}
            value={watch('hireDate') ? new Date(watch('hireDate')) : null}
            onChange={(date) => setValue('hireDate', date ? format(date, 'yyyy-MM-dd') : '')}
            required
            error={errors.hireDate?.message}
            minDate={new Date('2000-01-01')}
            maxDate={new Date()}
            hint="Date d'embauche"
          />
        </div>
      </Section>

      {/* Education */}
      <Section
        title={t('employeeDetails.sections.education')}
        description="Parcours académique et formations"
        icon={<GraduationCap className="h-5 w-5" />}
        toolbar={
          <AddButton
            onClick={() => educationArray.append({ level: '', diploma: '', year: '', institution: '' })}
            label={t('common.add')}
          />
        }
      >
        {educationArray.fields.length === 0 && (
          <EmptyHint text={t('employeeDetails.empty.noEducation')} icon="🎓" />
        )}
        <div className="space-y-3">
          {educationArray.fields.map((f, idx) => (
            <Card
              key={f.id}
              className="p-5 relative group border-l-4 border-l-primary/20 hover:border-l-primary/50 transition-all hover:shadow-md animate-in slide-in-from-top-2"
            >
              <RemoveButton onClick={() => educationArray.remove(idx)} />
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="secondary" className="gap-1">
                    <GraduationCap className="h-3 w-3" />
                    Formation {idx + 1}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <FormField
                    label={t('employeeCreate.fields.educationLevel')}
                    error={errors.education?.[idx]?.level?.message}
                  >
                    <Input
                      {...register(`education.${idx}.level` as const)}
                      placeholder="Licence, Master..."
                      className="transition-all focus:ring-2 focus:ring-primary"
                    />
                  </FormField>
                  <FormField
                    label={t('employeeCreate.fields.diploma') || 'Diplôme'}
                    error={errors.education?.[idx]?.diploma?.message}
                  >
                    <Input
                      {...register(`education.${idx}.diploma` as const)}
                      placeholder="Informatique"
                      className="transition-all focus:ring-2 focus:ring-primary"
                    />
                  </FormField>
                  <FormField
                    label={t('employeeCreate.fields.diplomaYear')}
                    error={errors.education?.[idx]?.year?.message}
                  >
                    <Input
                      {...register(`education.${idx}.year` as const)}
                      placeholder="2023"
                      type="number"
                      min="1950"
                      max={new Date().getFullYear()}
                      className="transition-all focus:ring-2 focus:ring-primary"
                    />
                  </FormField>
                  <FormField
                    label={t('employeeCreate.fields.university')}
                    error={errors.education?.[idx]?.institution?.message}
                  >
                    <Input
                      {...register(`education.${idx}.institution` as const)}
                      placeholder="Université..."
                      className="transition-all focus:ring-2 focus:ring-primary"
                    />
                  </FormField>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Section>

      {/* Skills */}
      <Section
        title={t('employeeDetails.sections.skills')}
        description="Compétences techniques et professionnelles"
        icon={<Brain className="h-5 w-5" />}
        toolbar={
          <AddButton
            onClick={() => skillsArray.append({ name: '', level: 3 })}
            label={t('common.add')}
          />
        }
      >
        {skillsArray.fields.length === 0 && (
          <EmptyHint text={t('employeeDetails.empty.noSkills')} icon="🧠" />
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {skillsArray.fields.map((f, idx) => (
            <Card
              key={f.id}
              className="p-4 relative group border-l-4 border-l-blue-500/20 hover:border-l-blue-500/50 transition-all hover:shadow-md animate-in slide-in-from-left-2"
            >
              <RemoveButton onClick={() => skillsArray.remove(idx)} />
              <div className="space-y-3 pr-8">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="gap-1">
                    <Brain className="h-3 w-3" />
                    #{idx + 1}
                  </Badge>
                </div>
                <FormField
                  label={t('common.name') || 'Nom'}
                  error={errors.skills?.[idx]?.name?.message}
                >
                  <Input
                    {...register(`skills.${idx}.name` as const)}
                    placeholder="React, TypeScript, Design..."
                    className="transition-all focus:ring-2 focus:ring-primary"
                  />
                </FormField>
                <FormField
                  label={t('employeeCreate.fields.skillLevel') || 'Niveau'}
                  error={errors.skills?.[idx]?.level?.message}
                  hint="1 (Débutant) à 5 (Expert)"
                >
                  <div className="space-y-2">
                    <Input
                      type="number"
                      min={1}
                      max={5}
                      {...register(`skills.${idx}.level` as const, { valueAsNumber: true })}
                      className="transition-all focus:ring-2 focus:ring-primary"
                    />
                    <SkillLevelIndicator level={skills[idx]?.level || 1} />
                  </div>
                </FormField>
              </div>
            </Card>
          ))}
        </div>
      </Section>

      {/* Certifications */}
      <Section
        title={t('employeeDetails.sections.certifications')}
        description="Certifications professionnelles et accréditations"
        icon={<Award className="h-5 w-5" />}
        toolbar={
          <AddButton
            onClick={() => certsArray.append({ name: '', issuer: '', issueDate: '', expirationDate: '' })}
            label={t('common.add')}
          />
        }
      >
        {certsArray.fields.length === 0 && (
          <EmptyHint text={t('employeeDetails.empty.noCertifications')} icon="📄" />
        )}
        <div className="space-y-3">
          {certsArray.fields.map((f, idx) => (
            <Card
              key={f.id}
              className="p-5 relative group border-l-4 border-l-amber-500/20 hover:border-l-amber-500/50 transition-all hover:shadow-md animate-in slide-in-from-right-2"
            >
              <RemoveButton onClick={() => certsArray.remove(idx)} />
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="secondary" className="gap-1">
                    <Award className="h-3 w-3" />
                    Certification {idx + 1}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <FormField
                    label={t('common.name') || 'Nom'}
                    error={errors.certifications?.[idx]?.name?.message}
                  >
                    <Input
                      {...register(`certifications.${idx}.name` as const)}
                      placeholder="AWS Architect, PMP..."
                      className="transition-all focus:ring-2 focus:ring-primary"
                    />
                  </FormField>
                  <FormField
                    label={t('employeeCreate.fields.issuer') || 'Émetteur'}
                    error={errors.certifications?.[idx]?.issuer?.message}
                  >
                    <Input
                      {...register(`certifications.${idx}.issuer` as const)}
                      placeholder="Amazon, PMI..."
                      className="transition-all focus:ring-2 focus:ring-primary"
                    />
                  </FormField>
                  <DatePickerField
                    name={`certifications.${idx}.issueDate`}
                    label={t('employeeCreate.fields.issueDate') || 'Date obtention'}
                    value={certifications[idx]?.issueDate ? new Date(certifications[idx].issueDate!) : null}
                    onChange={(date) => setValue(`certifications.${idx}.issueDate`, date ? format(date, 'yyyy-MM-dd') : '')}
                    error={errors.certifications?.[idx]?.issueDate?.message}
                    maxDate={new Date()}
                  />
                  <DatePickerField
                    name={`certifications.${idx}.expirationDate`}
                    label={t('employeeCreate.fields.expirationDate') || 'Expiration'}
                    value={certifications[idx]?.expirationDate ? new Date(certifications[idx].expirationDate!) : null}
                    onChange={(date) => setValue(`certifications.${idx}.expirationDate`, date ? format(date, 'yyyy-MM-dd') : '')}
                    error={errors.certifications?.[idx]?.expirationDate?.message}
                    minDate={certifications[idx]?.issueDate ? new Date(certifications[idx].issueDate!) : undefined}
                    hint="Optionnel"
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Section>
    </div>
  );
};
