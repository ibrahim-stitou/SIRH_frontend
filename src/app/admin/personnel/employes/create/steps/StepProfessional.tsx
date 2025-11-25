import React from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { EmployeeCreateFormValues } from '../schema';
import { Section, FormField, EmptyHint } from '../components/Section';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const AddButton: React.FC<{ onClick: () => void; label: string }> = ({ onClick, label }) => (
  <Button type="button" variant="outline" size="sm" onClick={onClick}>{label}</Button>
);
const RemoveChip: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button type="button" onClick={onClick} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full text-xs px-2 py-1 opacity-80 hover:opacity-100 shadow">Supprimer</button>
);

export const StepProfessional: React.FC = () => {
  const { register, control, formState: { errors } } = useFormContext<EmployeeCreateFormValues>();
  const educationArray = useFieldArray({ control, name: 'education' });
  const skillsArray = useFieldArray({ control, name: 'skills' });
  const certsArray = useFieldArray({ control, name: 'certifications' });
  return (
    <div className="space-y-6">
      <Section title="Poste" description="Affectation principale" icon="🏢">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField label="Département" isRequired error={errors.departmentId?.message}><Input {...register('departmentId')} placeholder="ID département" /></FormField>
          <FormField label="Poste" isRequired error={errors.position?.message}><Input {...register('position')} placeholder="Ingénieur Logiciel" /></FormField>
          <FormField label="Date d'embauche" isRequired error={errors.hireDate?.message}><Input type="date" {...register('hireDate')} /></FormField>
        </div>
      </Section>

      <Section title="Éducation" description="Diplômes & formations" icon="🎓" toolbar={<AddButton onClick={() => educationArray.append({ level: '', diploma: '', year: '', institution: '' })} label="Ajouter" />}>
        {educationArray.fields.length === 0 && <EmptyHint text="Aucun élément" />}
        <div className="space-y-4">
          {educationArray.fields.map((f, idx) => (
            <Card key={f.id} className="p-4 space-y-3 relative group">
              <RemoveChip onClick={() => educationArray.remove(idx)} />
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <FormField label="Niveau" error={errors.education?.[idx]?.level?.message}><Input {...register(`education.${idx}.level` as const)} placeholder="Licence" /></FormField>
                <FormField label="Diplôme" error={errors.education?.[idx]?.diploma?.message}><Input {...register(`education.${idx}.diploma` as const)} placeholder="Informatique" /></FormField>
                <FormField label="Année" error={errors.education?.[idx]?.year?.message}><Input {...register(`education.${idx}.year` as const)} placeholder="2023" /></FormField>
                <FormField label="Établissement" error={errors.education?.[idx]?.institution?.message}><Input {...register(`education.${idx}.institution` as const)} placeholder="Université" /></FormField>
              </div>
            </Card>
          ))}
        </div>
      </Section>

      <Section title="Compétences" description="Skills principaux" icon="🧠" toolbar={<AddButton onClick={() => skillsArray.append({ name: '', level: 1 })} label="Ajouter" />}>
        {skillsArray.fields.length === 0 && <EmptyHint text="Aucune compétence" />}
        <div className="space-y-4">
          {skillsArray.fields.map((f, idx) => (
            <Card key={f.id} className="p-4 space-y-3 relative group">
              <RemoveChip onClick={() => skillsArray.remove(idx)} />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <FormField label="Nom" error={errors.skills?.[idx]?.name?.message}><Input {...register(`skills.${idx}.name` as const)} placeholder="React" /></FormField>
                <FormField label="Niveau (1-5)" error={errors.skills?.[idx]?.level?.message}><Input type="number" min={1} max={5} {...register(`skills.${idx}.level` as const, { valueAsNumber: true })} /></FormField>
                <div className="flex items-end"><Badge variant="outline">{idx + 1}</Badge></div>
              </div>
            </Card>
          ))}
        </div>
      </Section>

      <Section title="Certifications" description="Titres & attestations" icon="📄" toolbar={<AddButton onClick={() => certsArray.append({ name: '', issuer: '', issueDate: '', expirationDate: '' })} label="Ajouter" />}>
        {certsArray.fields.length === 0 && <EmptyHint text="Aucune certification" />}
        <div className="space-y-4">
          {certsArray.fields.map((f, idx) => (
            <Card key={f.id} className="p-4 space-y-3 relative group">
              <RemoveChip onClick={() => certsArray.remove(idx)} />
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <FormField label="Nom" error={errors.certifications?.[idx]?.name?.message}><Input {...register(`certifications.${idx}.name` as const)} placeholder="AWS Architect" /></FormField>
                <FormField label="Émetteur" error={errors.certifications?.[idx]?.issuer?.message}><Input {...register(`certifications.${idx}.issuer` as const)} placeholder="Amazon" /></FormField>
                <FormField label="Date" error={errors.certifications?.[idx]?.issueDate?.message}><Input type="date" {...register(`certifications.${idx}.issueDate` as const)} /></FormField>
                <FormField label="Expiration" error={errors.certifications?.[idx]?.expirationDate?.message}><Input type="date" {...register(`certifications.${idx}.expirationDate` as const)} /></FormField>
              </div>
            </Card>
          ))}
        </div>
      </Section>
    </div>
  );
};
