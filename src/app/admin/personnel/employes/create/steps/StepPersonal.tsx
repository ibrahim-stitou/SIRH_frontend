import React from 'react';
import { useFormContext } from 'react-hook-form';
import { format } from 'date-fns';
import { EmployeeCreateFormValues } from '../schema';
import { Section, FormField } from '../components/Section';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Gender, MaritalStatus } from '@/types/employee';
import { useLanguage } from '@/context/LanguageContext';
import { User, MapPin, AlertCircle, FileText } from 'lucide-react';
import { DatePickerField } from '@/components/custom/DatePickerField';

export const StepPersonal: React.FC = () => {
  const { register, formState: { errors }, setValue, watch } = useFormContext<EmployeeCreateFormValues>();
  const { t } = useLanguage();
  const gender = watch('gender');
  const maritalStatus = watch('maritalStatus');

  return (
    <div className="space-y-6">
      {/* Identity Information */}
      <Section
        title={t('employeeCreate.steps.personal')}
        description="Informations personnelles et état civil"
        icon={<User className="h-5 w-5" />}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <FormField
            label={t('employeeCreate.fields.firstName')}
            isRequired
            error={errors.firstName?.message}
            hint="Prénom officiel"
          >
            <Input
              {...register('firstName')}
              placeholder="Ahmed"
              className="transition-all focus:ring-2 focus:ring-primary"
            />
          </FormField>

          <FormField
            label={t('employeeCreate.fields.lastName')}
            isRequired
            error={errors.lastName?.message}
            hint="Nom de famille"
          >
            <Input
              {...register('lastName')}
              placeholder="El Idrissi"
              className="transition-all focus:ring-2 focus:ring-primary"
            />
          </FormField>

          <FormField
            label={t('employeeCreate.fields.cin')}
            isRequired
            error={errors.cin?.message}
            hint="Numéro CIN"
          >
            <Input
              {...register('cin')}
              placeholder="AA123456"
              className="transition-all focus:ring-2 focus:ring-primary"
            />
          </FormField>

          <DatePickerField
            name="birthDate"
            label={t('employeeCreate.fields.birthDate')}
            value={watch('birthDate') ? new Date(watch('birthDate')) : null}
            onChange={(date) => setValue('birthDate', date ? format(date, 'yyyy-MM-dd') : '')}
            required
            error={errors.birthDate?.message}
            maxDate={new Date()}
            minDate={new Date('1900-01-01')}
            hint="Date de naissance"
          />

          <FormField
            label={t('employeeCreate.fields.birthPlace')}
            isRequired
            error={errors.birthPlace?.message}
            hint="Lieu de naissance"
          >
            <Input
              {...register('birthPlace')}
              placeholder="Casablanca"
              className="transition-all focus:ring-2 focus:ring-primary"
            />
          </FormField>

          <FormField
            label={t('employeeCreate.fields.nationality')}
            isRequired
            error={errors.nationality?.message}
          >
            <Input
              {...register('nationality')}
              placeholder="Marocaine"
              className="transition-all focus:ring-2 focus:ring-primary"
            />
          </FormField>

          <FormField
            label={t('employeeDetails.fields.gender')}
            isRequired
            error={errors.gender?.message}
          >
            <Select value={gender || undefined} onValueChange={(val: Gender) => setValue('gender', val)}>
              <SelectTrigger className="w-full transition-all focus:ring-2 focus:ring-primary">
                <SelectValue placeholder={t('placeholders.select')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="M">{t('employeeCreate.enums.gender.M')}</SelectItem>
                <SelectItem value="F">{t('employeeCreate.enums.gender.F')}</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <FormField
            label={t('employeeDetails.fields.maritalStatus')}
            error={errors.maritalStatus?.message}
          >
            <Select value={maritalStatus || undefined} onValueChange={(val: MaritalStatus) => setValue('maritalStatus', val)}>
              <SelectTrigger className="w-full transition-all focus:ring-2 focus:ring-primary">
                <SelectValue placeholder={t('placeholders.choose')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="celibataire">{t('employeeCreate.enums.maritalStatus.celibataire')}</SelectItem>
                <SelectItem value="marie">{t('employeeCreate.enums.maritalStatus.marie')}</SelectItem>
                <SelectItem value="divorce">{t('employeeCreate.enums.maritalStatus.divorce')}</SelectItem>
                <SelectItem value="veuf">{t('employeeCreate.enums.maritalStatus.veuf')}</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <FormField
            label={t('employeeDetails.fields.numberOfChildren')}
            error={errors.numberOfChildren?.message}
            hint="Nombre d'enfants"
          >
            <Input
              type="number"
              min={0}
              {...register('numberOfChildren', { valueAsNumber: true })}
              placeholder="0"
              className="transition-all focus:ring-2 focus:ring-primary"
            />
          </FormField>
        </div>
      </Section>

      {/* Contact Information */}
      <Section
        title={t('employeeDetails.sections.contact')}
        description="Coordonnées et adresse"
        icon={<MapPin className="h-5 w-5" />}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label={t('employeeDetails.fields.address')}
            isRequired
            error={errors.address?.message}
            hint="Adresse complète"
          >
            <Input
              {...register('address')}
              placeholder="123 Rue Mohammed V"
              className="transition-all focus:ring-2 focus:ring-primary"
            />
          </FormField>

          <FormField
            label={t('employeeDetails.fields.city')}
            isRequired
            error={errors.city?.message}
          >
            <Input
              {...register('city')}
              placeholder="Casablanca"
              className="transition-all focus:ring-2 focus:ring-primary"
            />
          </FormField>

          <FormField
            label={t('employeeDetails.fields.postalCode')}
            isRequired
            error={errors.postalCode?.message}
          >
            <Input
              {...register('postalCode')}
              placeholder="20000"
              className="transition-all focus:ring-2 focus:ring-primary"
            />
          </FormField>

          <FormField
            label={t('employeeDetails.fields.country')}
            isRequired
            error={errors.country?.message}
          >
            <Input
              {...register('country')}
              placeholder="Maroc"
              className="transition-all focus:ring-2 focus:ring-primary"
            />
          </FormField>

          <FormField
            label={t('employeeDetails.fields.phone')}
            isRequired
            error={errors.phone?.message}
            hint="Format: +212 6XX XX XX XX"
          >
            <Input
              {...register('phone')}
              placeholder="+212 6XX XX XX XX"
              className="transition-all focus:ring-2 focus:ring-primary"
            />
          </FormField>

          <FormField
            label={t('employeeDetails.fields.email')}
            isRequired
            error={errors.email?.message}
            hint="Email professionnel"
          >
            <Input
              type="email"
              {...register('email')}
              placeholder="ahmed.elidrissi@company.com"
              className="transition-all focus:ring-2 focus:ring-primary"
            />
          </FormField>
        </div>
      </Section>

      {/* Emergency Contact */}
      <Section
        title="Contact d'urgence"
        description="Personne à contacter en cas d'urgence"
        icon={<AlertCircle className="h-5 w-5" />}
        variant="compact"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            label="Nom du contact"
            error={errors.emergencyContactName?.message}
            hint="Optionnel"
          >
            <Input
              {...register('emergencyContactName')}
              placeholder="Nom complet"
              className="transition-all focus:ring-2 focus:ring-primary"
            />
          </FormField>

          <FormField
            label="Téléphone"
            error={errors.emergencyContactPhone?.message}
            hint="Optionnel"
          >
            <Input
              {...register('emergencyContactPhone')}
              placeholder="+212 6XX XX XX XX"
              className="transition-all focus:ring-2 focus:ring-primary"
            />
          </FormField>

          <FormField
            label="Relation"
            error={errors.emergencyContactRelationship?.message}
            hint="Ex: Époux(se), Parent"
          >
            <Input
              {...register('emergencyContactRelationship')}
              placeholder="Époux(se), Parent..."
              className="transition-all focus:ring-2 focus:ring-primary"
            />
          </FormField>
        </div>
      </Section>

      {/* Notes */}
      <Section
        title={t('employeeDetails.sections.notes')}
        description="Notes internes RH"
        icon={<FileText className="h-5 w-5" />}
        variant="compact"
      >
        <FormField
          label="Notes RH (optionnel)"
          error={errors.notes?.message}
          hint="Maximum 1000 caractères"
        >
          <Textarea
            {...register('notes')}
            placeholder="Ajoutez des notes internes sur l'employé..."
            className="min-h-[100px] transition-all focus:ring-2 focus:ring-primary"
            maxLength={1000}
          />
        </FormField>
      </Section>
    </div>
  );
};
