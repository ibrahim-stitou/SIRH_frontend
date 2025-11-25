import React from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { EmployeeCreateFormValues } from '../schema';
import { Section, FormField, EmptyHint } from '../components/Section';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';

const AddButton: React.FC<{ onClick: () => void; label: string }> = ({ onClick, label }) => (
  <Button type="button" variant="outline" size="sm" onClick={onClick}>{label}</Button>
);
const RemoveChip: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button type="button" onClick={onClick} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full text-xs px-2 py-1 opacity-80 hover:opacity-100 shadow">{useLanguage().t('common.delete')}</button>
);

export const StepProfessional: React.FC = () => {
  const { register, control, formState: { errors } } = useFormContext<EmployeeCreateFormValues>();
  const { t } = useLanguage();
  const educationArray = useFieldArray({ control, name: 'education' });
  const skillsArray = useFieldArray({ control, name: 'skills' });
  const certsArray = useFieldArray({ control, name: 'certifications' });
  return (
    <div className="space-y-6">
      <Section title={t('employeeCreate.fields.position')} description={t('employeeCreate.steps.professional')} icon="🏢">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField label={t('employeeCreate.fields.departmentId')} isRequired error={errors.departmentId?.message}><Input {...register('departmentId')} placeholder={t('employeeCreate.fields.departmentId')} /></FormField>
          <FormField label={t('employeeCreate.fields.position')} isRequired error={errors.position?.message}><Input {...register('position')} placeholder="Engineer" /></FormField>
          <FormField label={t('employeeCreate.fields.hireDate')} isRequired error={errors.hireDate?.message}><Input type="date" {...register('hireDate')} /></FormField>
        </div>
      </Section>

      <Section title={t('employeeDetails.sections.education')} description={t('employeeDetails.sections.education')} icon="🎓" toolbar={<AddButton onClick={() => educationArray.append({ level: '', diploma: '', year: '', institution: '' })} label={t('common.add')} />}>
        {educationArray.fields.length === 0 && <EmptyHint text={t('employeeDetails.empty.noEducation')} />}
        <div className="space-y-4">
          {educationArray.fields.map((f, idx) => (
            <Card key={f.id} className="p-4 space-y-3 relative group">
              <RemoveChip onClick={() => educationArray.remove(idx)} />
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <FormField label={t('employeeCreate.fields.educationLevel')} error={errors.education?.[idx]?.level?.message}><Input {...register(`education.${idx}.level` as const)} placeholder={t('employeeCreate.fields.educationLevel')} /></FormField>
                <FormField label={t('employeeCreate.fields.diploma') || 'Diplôme'} error={errors.education?.[idx]?.diploma?.message}><Input {...register(`education.${idx}.diploma` as const)} placeholder={t('employeeCreate.fields.diploma') || 'Diplôme'} /></FormField>
                <FormField label={t('employeeCreate.fields.diplomaYear')} error={errors.education?.[idx]?.year?.message}><Input {...register(`education.${idx}.year` as const)} placeholder="2023" /></FormField>
                <FormField label={t('employeeCreate.fields.university')} error={errors.education?.[idx]?.institution?.message}><Input {...register(`education.${idx}.institution` as const)} placeholder={t('employeeCreate.fields.university')} /></FormField>
              </div>
            </Card>
          ))}
        </div>
      </Section>

      <Section title={t('employeeDetails.sections.skills')} description={t('employeeDetails.sections.skills')} icon="🧠" toolbar={<AddButton onClick={() => skillsArray.append({ name: '', level: 1 })} label={t('common.add')} />}>
        {skillsArray.fields.length === 0 && <EmptyHint text={t('employeeDetails.empty.noSkills')} />}
        <div className="space-y-4">
          {skillsArray.fields.map((f, idx) => (
            <Card key={f.id} className="p-4 space-y-3 relative group">
              <RemoveChip onClick={() => skillsArray.remove(idx)} />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <FormField label={t('common.name') || 'Nom'} error={errors.skills?.[idx]?.name?.message}><Input {...register(`skills.${idx}.name` as const)} placeholder="React" /></FormField>
                <FormField label={t('employeeCreate.fields.skillLevel') || 'Niveau (1-5)'} error={errors.skills?.[idx]?.level?.message}><Input type="number" min={1} max={5} {...register(`skills.${idx}.level` as const, { valueAsNumber: true })} /></FormField>
                <div className="flex items-end"><Badge variant="outline">{idx + 1}</Badge></div>
              </div>
            </Card>
          ))}
        </div>
      </Section>

      <Section title={t('employeeDetails.sections.certifications')} description={t('employeeDetails.sections.certifications')} icon="📄" toolbar={<AddButton onClick={() => certsArray.append({ name: '', issuer: '', issueDate: '', expirationDate: '' })} label={t('common.add')} />}>
        {certsArray.fields.length === 0 && <EmptyHint text={t('employeeDetails.empty.noCertifications')} />}
        <div className="space-y-4">
          {certsArray.fields.map((f, idx) => (
            <Card key={f.id} className="p-4 space-y-3 relative group">
              <RemoveChip onClick={() => certsArray.remove(idx)} />
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <FormField label={t('common.name') || 'Nom'} error={errors.certifications?.[idx]?.name?.message}><Input {...register(`certifications.${idx}.name` as const)} placeholder="AWS Architect" /></FormField>
                <FormField label={t('employeeCreate.fields.issuer') || 'Émetteur'} error={errors.certifications?.[idx]?.issuer?.message}><Input {...register(`certifications.${idx}.issuer` as const)} placeholder="Amazon" /></FormField>
                <FormField label={t('employeeCreate.fields.issueDate') || 'Date'} error={errors.certifications?.[idx]?.issueDate?.message}><Input type="date" {...register(`certifications.${idx}.issueDate` as const)} /></FormField>
                <FormField label={t('employeeCreate.fields.expirationDate') || 'Expiration'} error={errors.certifications?.[idx]?.expirationDate?.message}><Input type="date" {...register(`certifications.${idx}.expirationDate` as const)} /></FormField>
              </div>
            </Card>
          ))}
        </div>
      </Section>
    </div>
  );
};
