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
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePickerField } from '@/components/custom/DatePickerField';
import { SelectField } from '@/components/custom/SelectField';
import type { SimplifiedContractInput } from '@/validations/contract-simplified.schema';
import { Timer } from 'lucide-react';

interface WorkScheduleTabProps {
  form: UseFormReturn<SimplifiedContractInput>;
}

export function WorkScheduleTab({ form }: WorkScheduleTabProps) {
  const hasTrialPeriod = form.watch('dates')?.trial_period?.enabled || false;


  return (
    <div className="space-y-4">
      {/* Horaires et Congés */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Timer className="h-4 w-4" />
            Horaires de Travail et Congés
          </CardTitle>
          <CardDescription className="text-xs">
            Définissez les horaires de travail, les shifts et les congés
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Section: Type d'Horaire et Travail en Shift */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectField
              control={form.control}
              name="schedule.schedule_type"
              label="Type d'Horaire *"
              displayField="label"
              placeholder="Sélectionner le type"
              options={[
                { id: 'Administratif', label: 'Horaire Administratif' },
                { id: 'Continu', label: 'Horaire Continu' },
              ]}
            />

            <SelectField
              control={form.control}
              name="schedule.shift_work"
              label="Travail en Shift"
              displayField="label"
              placeholder="Sélectionner si applicable"
              options={[
                { id: 'Non', label: 'Non' },
                { id: 'Oui', label: 'Oui' },
              ]}
            />
          </div>
          {/* Section: Période d'Essai */}
          <div className="space-y-3">
            <FormField
              control={form.control}
              name="dates.trial_period.enabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-0.5 leading-none">
                    <FormLabel className="text-xs">
                      Activer la période d&apos;essai
                    </FormLabel>
                    <FormDescription className="text-xs">
                      Période d&apos;essai conforme au Code du Travail marocain
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            {hasTrialPeriod && (
              <>
                {/* Ligne 1: Durée mois, jours, date de fin */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <FormField
                    control={form.control}
                    name="dates.trial_period.duration_months"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Durée (mois)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.5"
                            placeholder="3"
                            className="h-9"
                            value={field.value || ''}
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(value === '' ? undefined : parseFloat(value));
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dates.trial_period.duration_days"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Durée (jours)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="90"
                            className="h-9"
                            value={field.value || ''}
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(value === '' ? undefined : parseFloat(value));
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dates.trial_period.end_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Date de Fin</FormLabel>
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <FormField
                    control={form.control}
                    name="dates.trial_period.renewable"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-0.1 leading-none">
                          <FormLabel className="text-xs">
                            Renouvelable
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dates.trial_period.max_renewals"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Nb Max Renouvellements</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="1"
                            className="h-9"
                            value={field.value || ''}
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(value === '' ? undefined : parseFloat(value));
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Conditions */}
                <FormField
                  control={form.control}
                  name="dates.trial_period.conditions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Conditions</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Conditions spécifiques de la période d'essai..."
                          className="min-h-[50px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
          </div>
          {/* Section: Congés */}
          <div className="space-y-3">

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <FormField
                control={form.control}
                name="schedule.annual_leave_days"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Congés Annuels (jours)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="22"
                        className="h-9"
                        value={field.value || ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value === '' ? undefined : parseFloat(value));
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="schedule.other_leaves"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Autres Congés</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: congés exceptionnels"
                        className="h-9"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

