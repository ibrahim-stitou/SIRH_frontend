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
  FormMessage,
  FormDescription
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { apiRoutes } from '@/config/apiRoutes';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePickerField } from '@/components/custom/DatePickerField';
import { SelectField } from '@/components/custom/SelectField';
import type { SimplifiedContractInput } from '@/validations/contract-simplified.schema';
import { Timer } from 'lucide-react';

export function WorkScheduleTab({
  form
}: {
  form: UseFormReturn<SimplifiedContractInput>;
}) {
  const hasTrialPeriod = form.watch('dates')?.trial_period?.enabled || false;

  const [criteriaCatalog, setCriteriaCatalog] = React.useState<any[]>([]);
  const [criteriaError, setCriteriaError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    fetch(apiRoutes.admin.contratsEtMovements.contrats.trialCriteriaCatalog)
      .then((r) => r.json())
      .then((json) => {
        const data = Array.isArray(json?.data)
          ? json.data
          : Array.isArray(json)
            ? json
            : [];
        if (!cancelled) setCriteriaCatalog(data);
      })
      .catch(
        (e) =>
          !cancelled &&
          setCriteriaError(e?.message || 'Erreur chargement critères')
      );
    return () => {
      cancelled = true;
    };
  }, []);

  const dates = form.watch('dates');
  const trial: any = dates?.trial_period || {};
  const selected: string[] = (trial.acceptance_criteria as any) || [];
  const toggleCriteria = (id: string, checked: boolean) => {
    const next = checked
      ? Array.from(new Set([...(selected || []), id]))
      : (selected || []).filter((x) => x !== id);
    const nextDates = {
      ...(dates || {}),
      trial_period: {
        ...(dates?.trial_period || {}),
        acceptance_criteria: next
      }
    };
    form.setValue('dates', nextDates as any, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true
    });
  };

  return (
    <div className='space-y-4'>
      <Card>
        <CardHeader className='pb-3'>
          <CardTitle className='flex items-center gap-2 text-base'>
            <Timer className='h-4 w-4' />
            Horaires de Travail et Congés
          </CardTitle>
          <CardDescription className='text-xs'>
            Définissez les horaires de travail, les shifts et les congés
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          {/* Section: Type d'Horaire et Travail en Shift */}
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <SelectField
              control={form.control}
              name='schedule.schedule_type'
              label="Type d'Horaire *"
              displayField='label'
              placeholder='Sélectionner le type'
              options={[
                { id: 'Administratif', label: 'Horaire Administratif' },
                { id: 'Continu', label: 'Horaire Continu' }
              ]}
            />

            <SelectField
              control={form.control}
              name='schedule.shift_work'
              label='Travail en Shift'
              displayField='label'
              placeholder='Sélectionner si applicable'
              options={[
                { id: 'Non', label: 'Non' },
                { id: 'Oui', label: 'Oui' }
              ]}
            />
          </div>
          {/* Section: Période d'Essai */}
          <div className='space-y-3'>
            <FormField
              control={form.control}
              name='dates.trial_period.enabled'
              render={({ field }) => (
                <FormItem className='flex flex-row items-start space-y-0 space-x-3 rounded-md border p-3'>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className='space-y-0.5 leading-none'>
                    <FormLabel className='text-xs'>
                      Activer la période d&apos;essai
                    </FormLabel>
                    <FormDescription className='text-xs'>
                      Période d&apos;essai conforme au Code du Travail marocain
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            {hasTrialPeriod && (
              <>
                {/* Ligne 1: Durée mois, jours, date de fin */}
                <div className='grid grid-cols-1 gap-3 md:grid-cols-3'>
                  <FormField
                    control={form.control}
                    name='dates.trial_period.duration_months'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='text-xs'>Durée (mois)</FormLabel>
                        <FormControl>
                          <Input
                            type='number'
                            step='0.5'
                            placeholder='3'
                            className='h-9'
                            value={field.value || ''}
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(
                                value === '' ? undefined : parseFloat(value)
                              );
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='dates.trial_period.duration_days'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='text-xs'>Durée (jours)</FormLabel>
                        <FormControl>
                          <Input
                            type='number'
                            placeholder='90'
                            className='h-9'
                            value={field.value || ''}
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(
                                value === '' ? undefined : parseFloat(value)
                              );
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='dates.trial_period.end_date'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='text-xs'>Date de Fin</FormLabel>
                        <FormControl>
                          <DatePickerField
                            value={field.value || null}
                            onChange={field.onChange}
                            placeholder="Date de fin d'essai"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Ligne 2: Renouvellement */}
                <div className='grid grid-cols-1 gap-3 md:grid-cols-3'>
                  <FormField
                    control={form.control}
                    name='dates.trial_period.renewable'
                    render={({ field }) => (
                      <FormItem className='flex flex-row items-start space-y-0 space-x-3 rounded-md border p-3'>
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className='space-y-0.1 leading-none'>
                          <FormLabel className='text-xs'>
                            Renouvelable
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='dates.trial_period.max_renewals'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='text-xs'>
                          Nb Max Renouvellements
                        </FormLabel>
                        <FormControl>
                          <Input
                            type='number'
                            placeholder='1'
                            className='h-9'
                            value={field.value || ''}
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(
                                value === '' ? undefined : parseFloat(value)
                              );
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </>
            )}
          </div>
          {/* Section: Congés */}
          <div className='space-y-3'>
            <div className='grid grid-cols-1 gap-3 md:grid-cols-3'>
              <FormField
                control={form.control}
                name='schedule.annual_leave_days'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-xs'>
                      Congés Annuels (jours)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        placeholder='22'
                        className='h-9'
                        value={field.value || ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(
                            value === '' ? undefined : parseFloat(value)
                          );
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='schedule.other_leaves'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-xs'>Autres Congés</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Ex: congés exceptionnels'
                        className='h-9'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Critères d'acceptation (Période d'essai) - afficher uniquement si période d'essai activée */}
          {hasTrialPeriod && (
            <div className='border-t pt-4'>
              <h3 className='mb-3 text-sm font-bold text-amber-700 dark:text-amber-400'>
                Critères d&apos;acceptation (Période d&apos;essai)
              </h3>
              {criteriaError && (
                <p className='text-sm text-red-600'>
                  Impossible de charger les critères: {criteriaError}
                </p>
              )}
              {!criteriaError && criteriaCatalog.length === 0 && (
                <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className='animate-pulse rounded-lg border p-3'
                    >
                      <div className='bg-muted mb-2 h-4 w-1/3 rounded' />
                      <div className='bg-muted h-3 w-2/3 rounded' />
                    </div>
                  ))}
                </div>
              )}
              {criteriaCatalog.length > 0 && (
                <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
                  {criteriaCatalog.map((crit: any) => {
                    const isSelected = (selected || []).includes(crit.id);
                    return (
                      <div
                        key={crit.id}
                        className='group hover:bg-accent/50 space-y-1.5 rounded-lg p-3 transition-all duration-200'
                      >
                        <div className='flex items-center justify-between'>
                          <div className='flex items-center space-x-2'>
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={(checked) =>
                                toggleCriteria(crit.id, !!checked)
                              }
                              aria-label={`Sélectionner ${crit.label}`}
                            />
                            <span className='text-sm font-semibold'>
                              {crit.label}
                            </span>
                          </div>
                        </div>
                        <p className='text-muted-foreground text-xs'>
                          {crit.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
              {(selected?.length || 0) === 0 && criteriaCatalog.length > 0 && (
                <p className='text-muted-foreground text-sm'>
                  Aucun critère sélectionné.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
