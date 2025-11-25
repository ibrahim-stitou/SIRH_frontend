import React from 'react';
import { useFormContext } from 'react-hook-form';
import { EmployeeCreateFormValues } from '../schema';
import { Section, FormField } from '../components/Section';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Gender, MaritalStatus } from '@/types/employee';
import { useLanguage } from '@/context/LanguageContext';

export const StepPersonal: React.FC = () => {
  const { register, formState: { errors }, setValue, watch } = useFormContext<EmployeeCreateFormValues>();
  const { t } = useLanguage();
  const gender = watch('gender');
  const maritalStatus = watch('maritalStatus');
  return (
    <div className="space-y-6">
      <Section title={t('employeeCreate.steps.personal')} description={t('employeeCreate.subtitle')} icon="👤">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label={t('employeeCreate.fields.firstName')} isRequired error={errors.firstName?.message}><Input {...register('firstName')} placeholder="Ahmed" /></FormField>
          <FormField label={t('employeeCreate.fields.lastName')} isRequired error={errors.lastName?.message}><Input {...register('lastName')} placeholder="El Idrissi" /></FormField>
          <FormField label={t('employeeCreate.fields.cin')} isRequired error={errors.cin?.message}><Input {...register('cin')} placeholder="AA123456" /></FormField>
          <FormField label={t('employeeCreate.fields.birthDate')} isRequired error={errors.birthDate?.message}><Input type="date" {...register('birthDate')} /></FormField>
          <FormField label={t('employeeCreate.fields.birthPlace')} isRequired error={errors.birthPlace?.message}><Input {...register('birthPlace')} placeholder="Casablanca" /></FormField>
          <FormField label={t('employeeCreate.fields.nationality')} isRequired error={errors.nationality?.message}><Input {...register('nationality')} placeholder="Marocaine" /></FormField>
          <FormField label={t('employeeDetails.fields.gender')} isRequired error={errors.gender?.message}>
            <Select value={gender || undefined} onValueChange={(val: Gender) => setValue('gender', val)}>
              <SelectTrigger className="w-full"><SelectValue placeholder={t('placeholders.select')} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="M">{t('employeeCreate.enums.gender.M')}</SelectItem>
                <SelectItem value="F">{t('employeeCreate.enums.gender.F')}</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label={t('employeeDetails.fields.maritalStatus')} error={errors.maritalStatus?.message}>
            <Select value={maritalStatus || undefined} onValueChange={(val: MaritalStatus) => setValue('maritalStatus', val)}>
              <SelectTrigger className="w-full"><SelectValue placeholder={t('placeholders.choose')} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="celibataire">{t('employeeCreate.enums.maritalStatus.celibataire')}</SelectItem>
                <SelectItem value="marie">{t('employeeCreate.enums.maritalStatus.marie')}</SelectItem>
                <SelectItem value="divorce">{t('employeeCreate.enums.maritalStatus.divorce')}</SelectItem>
                <SelectItem value="veuf">{t('employeeCreate.enums.maritalStatus.veuf')}</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label={t('employeeDetails.fields.numberOfChildren')} error={errors.numberOfChildren?.message}><Input type="number" min={0} {...register('numberOfChildren', { valueAsNumber: true })} /></FormField>
        </div>
      </Section>
      <Section title={t('employeeDetails.sections.contact')} description="" icon="📞">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label={t('employeeDetails.fields.address')} isRequired error={errors.address?.message}><Input {...register('address')} /></FormField>
          <FormField label={t('employeeDetails.fields.city')} isRequired error={errors.city?.message}><Input {...register('city')} /></FormField>
          <FormField label={t('employeeDetails.fields.postalCode')} isRequired error={errors.postalCode?.message}><Input {...register('postalCode')} /></FormField>
          <FormField label={t('employeeDetails.fields.country')} isRequired error={errors.country?.message}><Input {...register('country')} /></FormField>
          <FormField label={t('employeeDetails.fields.phone')} isRequired error={errors.phone?.message}><Input {...register('phone')} /></FormField>
          <FormField label={t('employeeDetails.fields.email')} isRequired error={errors.email?.message}><Input type="email" {...register('email')} /></FormField>
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField label="Contact urgence nom" error={errors.emergencyContactName?.message}><Input {...register('emergencyContactName')} /></FormField>
          <FormField label="Contact urgence tél" error={errors.emergencyContactPhone?.message}><Input {...register('emergencyContactPhone')} /></FormField>
          <FormField label="Relation" error={errors.emergencyContactRelationship?.message}><Input {...register('emergencyContactRelationship')} /></FormField>
        </div>
        <div className="mt-4">
          <FormField label={t('employeeDetails.sections.notes')} error={errors.notes?.message}><Textarea {...register('notes')} placeholder="Notes RH..." /></FormField>
        </div>
      </Section>
    </div>
  );
};
