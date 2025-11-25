import React from 'react';
import { useFormContext } from 'react-hook-form';
import { EmployeeCreateFormValues } from '../schema';
import { Section, FormField } from '../components/Section';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Gender, MaritalStatus } from '@/types/employee';

export const StepPersonal: React.FC = () => {
  const { register, formState: { errors }, setValue, watch } = useFormContext<EmployeeCreateFormValues>();
  const gender = watch('gender');
  const maritalStatus = watch('maritalStatus');
  return (
    <div className="space-y-6">
      <Section title="Identité" description="Informations personnelles de base" icon="👤">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Prénom" isRequired error={errors.firstName?.message}><Input {...register('firstName')} placeholder="Ahmed" /></FormField>
          <FormField label="Nom" isRequired error={errors.lastName?.message}><Input {...register('lastName')} placeholder="El Idrissi" /></FormField>
          <FormField label="CIN" isRequired error={errors.cin?.message}><Input {...register('cin')} placeholder="AA123456" /></FormField>
          <FormField label="Date de naissance" isRequired error={errors.birthDate?.message}><Input type="date" {...register('birthDate')} /></FormField>
          <FormField label="Lieu de naissance" isRequired error={errors.birthPlace?.message}><Input {...register('birthPlace')} placeholder="Casablanca" /></FormField>
          <FormField label="Nationalité" isRequired error={errors.nationality?.message}><Input {...register('nationality')} placeholder="Marocaine" /></FormField>
          <FormField label="Genre" isRequired error={errors.gender?.message}>
            <Select value={gender || undefined} onValueChange={(val: Gender) => setValue('gender', val)}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Sélectionner" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="M">Homme</SelectItem>
                <SelectItem value="F">Femme</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="État civil" error={errors.maritalStatus?.message}>
            <Select value={maritalStatus || undefined} onValueChange={(val: MaritalStatus) => setValue('maritalStatus', val)}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Choisir" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="celibataire">Célibataire</SelectItem>
                <SelectItem value="marie">Marié(e)</SelectItem>
                <SelectItem value="divorce">Divorcé(e)</SelectItem>
                <SelectItem value="veuf">Veuf(ve)</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Enfants" error={errors.numberOfChildren?.message}><Input type="number" min={0} {...register('numberOfChildren', { valueAsNumber: true })} /></FormField>
        </div>
      </Section>
      <Section title="Coordonnées" description="Contact & adresse" icon="📞">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Adresse" isRequired error={errors.address?.message}><Input {...register('address')} /></FormField>
          <FormField label="Ville" isRequired error={errors.city?.message}><Input {...register('city')} /></FormField>
          <FormField label="Code postal" isRequired error={errors.postalCode?.message}><Input {...register('postalCode')} /></FormField>
          <FormField label="Pays" isRequired error={errors.country?.message}><Input {...register('country')} /></FormField>
          <FormField label="Téléphone" isRequired error={errors.phone?.message}><Input {...register('phone')} /></FormField>
          <FormField label="Email" isRequired error={errors.email?.message}><Input type="email" {...register('email')} /></FormField>
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField label="Contact urgence nom" error={errors.emergencyContactName?.message}><Input {...register('emergencyContactName')} /></FormField>
          <FormField label="Contact urgence tél" error={errors.emergencyContactPhone?.message}><Input {...register('emergencyContactPhone')} /></FormField>
          <FormField label="Relation" error={errors.emergencyContactRelationship?.message}><Input {...register('emergencyContactRelationship')} /></FormField>
        </div>
        <div className="mt-4">
          <FormField label="Notes internes" error={errors.notes?.message}><Textarea {...register('notes')} placeholder="Notes RH..." /></FormField>
        </div>
      </Section>
    </div>
  );
};
