'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FileText } from 'lucide-react';
import { DatePickerField } from '@/components/custom/DatePickerField';
import { SelectField } from '@/components/custom/SelectField';
import type { SimplifiedContractInput } from '@/validations/contract-simplified.schema';
import type { Employee, Department } from '@/types/employee';
import { apiRoutes } from '@/config/apiRoutes';
import { Checkbox } from '@/components/ui/checkbox';

interface GeneralInfoTabProps {
  form: UseFormReturn<SimplifiedContractInput>;
  employees: Employee[];
  departments: Department[];
  loadingEmployees: boolean;
  loadingDepartments: boolean;
  contractTypeOptions: Array<{ id: string; label: string }>;
  workModeOptions: Array<{ id: string; label: string }>;
}

export function GeneralInfoTab({
  form,
  employees,
  departments,
  loadingEmployees,
  loadingDepartments,
  contractTypeOptions,
  workModeOptions
}: GeneralInfoTabProps) {
  const [conditionsCatalog, setConditionsCatalog] = React.useState<any[]>([]);
  const [conditionsError, setConditionsError] = React.useState<string | null>(
    null
  );

  React.useEffect(() => {
    let cancelled = false;
    fetch(apiRoutes.admin.contratsEtMovements.contrats.conditionsCatalog)
      .then((r) => r.json())
      .then((json) => {
        const data = Array.isArray(json?.data)
          ? json.data
          : Array.isArray(json)
            ? json
            : [];
        if (!cancelled) setConditionsCatalog(data);
      })
      .catch(
        (e) =>
          !cancelled &&
          setConditionsError(e?.message || 'Erreur chargement conditions')
      );
    return () => {
      cancelled = true;
    };
  }, []);

  const selected: string[] = (form.watch('conditions.selected') as any) || [];
  const toggleCondition = (id: string, checked: boolean) => {
    const next = checked
      ? Array.from(new Set([...(selected || []), id]))
      : (selected || []).filter((x) => x !== id);
    form.setValue('conditions.selected', next, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true
    });
  };

  return (
    <div className='space-y-4'>
      {/* Informations Générales du Contrat */}
      <Card>
        <CardHeader className='pb-3'>
          <CardTitle className='flex items-center gap-2 text-base'>
            <FileText className='h-4 w-4' />
            Informations Générales
          </CardTitle>
          <CardDescription className='text-xs'>
            Informations de base du contrat et de l&apos;employé
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-3'>
          {/* Ligne 1: Référence, Type, Titre */}
          <div className='grid grid-cols-1 gap-3 md:grid-cols-3'>
            <FormField
              control={form.control}
              name='reference'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-xs'>Référence</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='CTR-2024-001'
                      className='h-9'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <SelectField
              control={form.control}
              name='employe_id'
              label='Employé *'
              displayField='label'
              placeholder={
                loadingEmployees ? 'Chargement...' : 'Sélectionner un employé'
              }
              options={employees.map((emp) => ({
                id: emp.id.toString(),
                label: `${emp.firstName} ${emp.lastName}`
              }))}
              disabled={loadingEmployees}
            />
            <SelectField
              control={form.control}
              name='type'
              label='Type de Contrat *'
              displayField='label'
              placeholder='Sélectionner le type'
              options={contractTypeOptions.map((option) => ({
                id: option.id,
                label: option.label
              }))}
              className='h-9'
            />
          </div>

          {/* Ligne 2: Dates */}
          <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
            <FormField
              control={form.control}
              name='dates.start_date'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date de Début *</FormLabel>
                  <FormControl>
                    <DatePickerField
                      value={field.value}
                      onChange={field.onChange}
                      placeholder='Sélectionner'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='dates.end_date'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date de Fin</FormLabel>
                  <FormControl>
                    <DatePickerField
                      value={field.value || null}
                      onChange={field.onChange}
                      placeholder='Optionnelle (pour CDD)'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='dates.signature_date'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date de Signature *</FormLabel>
                  <FormControl>
                    <DatePickerField
                      value={field.value}
                      onChange={field.onChange}
                      placeholder='Sélectionner'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          {/* Ligne 1: Métier, Emploi, Poste */}
          <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
            <FormField
              control={form.control}
              name='job.metier'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Métier</FormLabel>
                  <FormControl>
                    <Input placeholder='Ex: Informatique' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='job.emploie'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Emploi</FormLabel>
                  <FormControl>
                    <Input placeholder='Ex: Développeur' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='job.poste'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Poste</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Ex: Développeur Full Stack'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Ligne 2: Mode de Travail, Classification, Lieu de Travail */}
          <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
            <SelectField
              control={form.control}
              name='job.work_mode'
              label='Mode de Travail'
              displayField='label'
              placeholder='Sélectionner le mode'
              options={workModeOptions.map((option) => ({
                id: option.id,
                label: option.label
              }))}
            />

            <FormField
              control={form.control}
              name='job.classification'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Classification</FormLabel>
                  <FormControl>
                    <Input placeholder='Ex: Niveau 5 - Échelon 2' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='job.work_location'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lieu de Travail</FormLabel>
                  <FormControl>
                    <Input placeholder='Ex: Casablanca, Maroc' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            {/* Ligne 3: Responsabilités */}
            <FormField
              control={form.control}
              name='job.responsibilities'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Responsabilités</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Décrire les responsabilités principales...'
                      className='min-h-[80px]'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Ligne 3: Description */}
            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Description optionnelle du contrat...'
                      className='min-h-[80px]'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Conditions du Contrat (sélection) */}
      <Card>
        <CardHeader className='pb-3'>
          <CardTitle className='text-base'>Conditions du Contrat</CardTitle>
          <CardDescription className='text-xs'>
            Sélectionner les conditions applicables
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-3'>
          {conditionsError && (
            <p className='text-sm text-red-600'>
              Impossible de charger le catalogue: {conditionsError}
            </p>
          )}
          <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
            {conditionsCatalog.map((cond: any) => {
              const isSelected = (selected || []).includes(cond.id);
              return (
                <div
                  key={cond.id}
                  className='group hover:bg-accent/50 space-y-1.5 rounded-lg p-3 transition-all duration-200'
                >
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center space-x-2'>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) =>
                          toggleCondition(cond.id, !!checked)
                        }
                        aria-label={`Sélectionner ${cond.label}`}
                      />
                      <span className='text-sm font-semibold'>
                        {cond.label}
                      </span>
                    </div>
                  </div>
                  <p className='text-muted-foreground text-xs'>
                    {cond.description}
                  </p>
                </div>
              );
            })}
          </div>
          {(selected?.length || 0) === 0 && (
            <p className='text-muted-foreground text-sm'>
              Aucune condition sélectionnée.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
