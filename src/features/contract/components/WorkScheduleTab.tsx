'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Clock, Calendar, Sun, Moon } from 'lucide-react';
import { DatePickerField } from '@/components/custom/DatePickerField';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { SimplifiedContractInput } from '@/validations/contract-simplified.schema';

interface WorkScheduleTabProps {
  form: UseFormReturn<SimplifiedContractInput>;
}

export function WorkScheduleTab({ form }: WorkScheduleTabProps) {
  const hasShiftWork = form.watch('schedule')?.shift_work?.enabled || false;
  const hasTrialPeriod = form.watch('dates')?.trial_period?.enabled || false;

  const shiftTypeOptions = [
    { id: 'Matin', label: 'Matin (6h-14h)' },
    { id: 'Apres_midi', label: 'Après-midi (14h-22h)' },
    { id: 'Nuit', label: 'Nuit (22h-6h)' },
    { id: 'Rotation', label: 'Rotation (alternance)' },
    { id: 'Continu', label: 'Continu (3x8)' },
  ];

  return (
    <div className="space-y-4">
      {/* Horaires et Congés */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-4 w-4" />
            Horaires et Congés
          </CardTitle>
          <CardDescription className="text-xs">
            Configuration des horaires de travail, shifts, période d&apos;essai et congés
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Section: Horaires de Travail */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-1.5 text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              Horaires de Travail
            </h3>

            {/* Ligne 1: Heures par jour, jours par semaine, heures par semaine */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <FormField
                control={form.control}
                name="schedule.hours_per_day"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Heures par Jour</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="8"
                        className="h-9"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="schedule.days_per_week"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Jours par Semaine</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="5"
                        className="h-9"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="schedule.hours_per_week"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Heures par Semaine</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="40"
                        className="h-9"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Ligne 2: Horaires de début et fin */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <FormField
                control={form.control}
                name="schedule.start_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Heure de Début</FormLabel>
                    <FormControl>
                      <Input type="time" className="h-9" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="schedule.end_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Heure de Fin</FormLabel>
                    <FormControl>
                      <Input type="time" className="h-9" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="schedule.break_duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Durée Pause (min)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="60"
                        className="h-9"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="border-t pt-4" />

          {/* Section: Travail en Shifts */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-1.5 text-muted-foreground">
              <Sun className="h-3.5 w-3.5" />
              Travail en Shifts
            </h3>

            <FormField
              control={form.control}
              name="schedule.shift_work.enabled"
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
                      Activer le travail en shifts
                    </FormLabel>
                    <FormDescription className="text-xs">
                      Cochez cette case si l&apos;employé travaille en horaires décalés
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            {hasShiftWork && (
              <>
                {/* Ligne 1: Type, Rotation, Prime */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="schedule.shift_work.type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type de Shift</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner le type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {shiftTypeOptions.map((option) => (
                              <SelectItem key={option.id} value={option.id}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="schedule.shift_work.rotation_days"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rotation (jours)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="7"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="schedule.shift_work.night_shift_premium"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prime Nuit (MAD)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="500"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Description du shift */}
                <FormField
                  control={form.control}
                  name="schedule.shift_work.description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description du Shift</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Ex: Rotation hebdomadaire matin/après-midi..."
                          className="min-h-[60px]"
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

          <div className="border-t pt-6" />

          {/* Section: Période d'Essai */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Période d&apos;Essai
            </h3>

            <FormField
              control={form.control}
              name="dates.trial_period.enabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Activer la période d&apos;essai
                    </FormLabel>
                    <FormDescription>
                      Période d&apos;essai conforme au Code du Travail marocain
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            {hasTrialPeriod && (
              <>
                {/* Ligne 1: Durée mois, jours, date de fin */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="dates.trial_period.duration_months"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Durée (mois)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.5"
                            placeholder="3"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
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
                        <FormLabel>Durée (jours)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="90"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
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
                        <FormLabel>Date de Fin</FormLabel>
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="dates.trial_period.renewable"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
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
                        <FormLabel>Nb Max Renouvellements</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="1"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
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
                      <FormLabel>Conditions</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Conditions spécifiques de la période d'essai..."
                          className="min-h-[60px]"
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

          <div className="border-t pt-6" />

          {/* Section: Congés */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Moon className="h-4 w-4" />
              Congés
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="schedule.annual_leave_days"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Congés Annuels (jours)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="22"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
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
                    <FormLabel>Autres Congés</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: congés exceptionnels"
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

