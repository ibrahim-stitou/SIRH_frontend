'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Clock, Pencil, Check, X } from 'lucide-react';
import { Contract } from '@/types/contract';
import { apiRoutes } from '@/config/apiRoutes';

interface WorkScheduleDisplayProps {
  contract: Contract;
  isEditing: boolean;
  onUpdate?: (data: Partial<Contract>) => void;
}

export default function WorkScheduleDisplay({
  contract,
  isEditing,
  onUpdate
}: WorkScheduleDisplayProps) {
  const [editedData, setEditedData] = useState(contract);
  const [activeFields, setActiveFields] = useState<Record<string, boolean>>({});
  const [criteriaCatalog, setCriteriaCatalog] = React.useState<any[]>([]);
  const [criteriaError, setCriteriaError] = React.useState<string | null>(null);
  const isDraft = contract.status === 'Brouillon';

  const schedule =
    (contract as any).schedule ?? (contract as any).work_time ?? {};
  const trial = (contract as any).dates?.trial_period ?? {};

  React.useEffect(() => {
    let cancelled = false;
    fetch(apiRoutes.admin.contratsEtMovements.contrats.trialCriteriaCatalog)
      .then((r) => r.json())
      .then((json) => {
        const data = Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : [];
        if (!cancelled) setCriteriaCatalog(data);
      })
      .catch((e) => !cancelled && setCriteriaError(e?.message || 'Erreur chargement critères'));
    return () => { cancelled = true; };
  }, []);

  const selected = (contract?.dates?.trial_period?.acceptance_criteria ?? []) as string[];
  const toggleCriteria = (id: string, checked: boolean) => {
    const next = checked ? Array.from(new Set([...(selected || []), id])) : (selected || []).filter((x) => x !== id);
    onUpdate?.({ dates: { trial_period: { acceptance_criteria: next } } } as any);
  };

  const handleChange = (field: string, value: any) => {
    const keys = field.split('.');
    const newData = { ...editedData } as any;
    let current: any = newData;

    for (let i = 0; i < keys.length - 1; i++) {
      current[keys[i]] = current[keys[i]] ?? {};
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;

    setEditedData(newData);
  };

  const saveField = (field: string) => {
    setActiveFields((prev) => ({ ...prev, [field]: false }));
    // Ne transmettre que le champ modifié
    const keys = field.split('.');
    const lastKey = keys[keys.length - 1];
    let originalCursor: any = contract;
    let editedCursor: any = editedData;
    for (let i = 0; i < keys.length - 1; i++) {
      originalCursor = originalCursor[keys[i]];
      editedCursor = editedCursor[keys[i]];
    }
    onUpdate?.(
      keys.length === 1
        ? { [field]: editedCursor[lastKey] }
        : keys.slice(0, -1).reduceRight(
            (acc, key, idx, arr) => ({
              [arr[0]]:
                arr.length === 1 ? { [lastKey]: editedCursor[lastKey] } : acc
            }),
            { [lastKey]: editedCursor[lastKey] }
          )
    );
  };

  const cancelField = (field: string) => {
    const keys = field.split('.');
    const newData = { ...editedData } as any;
    let editedCursor: any = newData;
    let originalCursor: any = contract;

    for (let i = 0; i < keys.length - 1; i++) {
      editedCursor = editedCursor[keys[i]];
      originalCursor = originalCursor[keys[i]];
    }
    editedCursor[keys[keys.length - 1]] = originalCursor[keys[keys.length - 1]];

    setEditedData({ ...newData });
    setActiveFields((prev) => ({ ...prev, [field]: false }));
  };

  const renderField = (
    label: string,
    value: any,
    fieldName?: string,
    type: 'text' | 'number' | 'checkbox' | 'select' = 'text',
    options?: any[]
  ) => {
    const fieldIsActive = !!(fieldName && activeFields[fieldName]);
    const canEditThisField = Boolean(isEditing && isDraft && fieldName);

    if (canEditThisField && fieldIsActive) {
      switch (type) {
        case 'number':
          return (
            <div className='animate-in fade-in space-y-2 duration-200'>
              <div className='mb-2 flex items-center justify-between'>
                <Label className='text-foreground text-sm font-semibold'>
                  {label}
                </Label>
                <div className='flex gap-1.5'>
                  <button
                    type='button'
                    title='Valider'
                    aria-label='Valider'
                    onClick={() => saveField(fieldName!)}
                    className='inline-flex h-7 w-7 items-center justify-center rounded-md bg-green-50 text-green-600 shadow-sm transition-all duration-150 hover:bg-green-100 hover:text-green-700 hover:shadow focus:ring-2 focus:ring-green-500 focus:ring-offset-1 focus:outline-none'
                  >
                    <Check className='h-3.5 w-3.5' />
                  </button>
                  <button
                    type='button'
                    title='Annuler'
                    aria-label='Annuler'
                    onClick={() => cancelField(fieldName!)}
                    className='inline-flex h-7 w-7 items-center justify-center rounded-md bg-red-50 text-red-600 shadow-sm transition-all duration-150 hover:bg-red-100 hover:text-red-700 hover:shadow focus:ring-2 focus:ring-red-500 focus:ring-offset-1 focus:outline-none'
                  >
                    <X className='h-3.5 w-3.5' />
                  </button>
                </div>
              </div>
              <Input
                type='number'
                value={value ?? ''}
                onChange={(e) => {
                  const v = e.target.value;
                  const num = v === '' ? '' : Number(v);
                  handleChange(
                    fieldName!,
                    num === '' ? null : Number.isNaN(num) ? null : num
                  );
                }}
                className='focus:ring-primary transition-all focus:ring-2'
              />
            </div>
          );
        case 'checkbox':
          return (
            <div className='animate-in fade-in space-y-2 duration-200'>
              <div className='mb-2 flex items-center justify-between'>
                <div className='flex items-center space-x-2'>
                  <Checkbox
                    id={fieldName}
                    checked={!!value}
                    onCheckedChange={(checked) =>
                      handleChange(fieldName!, checked)
                    }
                    className='transition-all'
                  />
                  <Label
                    htmlFor={fieldName}
                    className='cursor-pointer text-sm font-semibold'
                  >
                    {label}
                  </Label>
                </div>
                <div className='flex gap-1.5'>
                  <button
                    type='button'
                    title='Valider'
                    aria-label='Valider'
                    onClick={() => saveField(fieldName!)}
                    className='inline-flex h-7 w-7 items-center justify-center rounded-md bg-green-50 text-green-600 shadow-sm transition-all duration-150 hover:bg-green-100 hover:text-green-700 hover:shadow focus:ring-2 focus:ring-green-500 focus:ring-offset-1 focus:outline-none'
                  >
                    <Check className='h-3.5 w-3.5' />
                  </button>
                  <button
                    type='button'
                    title='Annuler'
                    aria-label='Annuler'
                    onClick={() => cancelField(fieldName!)}
                    className='inline-flex h-7 w-7 items-center justify-center rounded-md bg-red-50 text-red-600 shadow-sm transition-all duration-150 hover:bg-red-100 hover:text-red-700 hover:shadow focus:ring-2 focus:ring-red-500 focus:ring-offset-1 focus:outline-none'
                  >
                    <X className='h-3.5 w-3.5' />
                  </button>
                </div>
              </div>
            </div>
          );
        case 'select':
          return (
            <div className='animate-in fade-in space-y-2 duration-200'>
              <div className='mb-2 flex items-center justify-between'>
                <Label className='text-foreground text-sm font-semibold'>
                  {label}
                </Label>
                <div className='flex gap-1.5'>
                  <button
                    type='button'
                    title='Valider'
                    aria-label='Valider'
                    onClick={() => saveField(fieldName!)}
                    className='inline-flex h-7 w-7 items-center justify-center rounded-md bg-green-50 text-green-600 shadow-sm transition-all duration-150 hover:bg-green-100 hover:text-green-700 hover:shadow focus:ring-2 focus:ring-green-500 focus:ring-offset-1 focus:outline-none'
                  >
                    <Check className='h-3.5 w-3.5' />
                  </button>
                  <button
                    type='button'
                    title='Annuler'
                    aria-label='Annuler'
                    onClick={() => cancelField(fieldName!)}
                    className='inline-flex h-7 w-7 items-center justify-center rounded-md bg-red-50 text-red-600 shadow-sm transition-all duration-150 hover:bg-red-100 hover:text-red-700 hover:shadow focus:ring-2 focus:ring-red-500 focus:ring-offset-1 focus:outline-none'
                  >
                    <X className='h-3.5 w-3.5' />
                  </button>
                </div>
              </div>
              <Select
                value={value}
                onValueChange={(val) => handleChange(fieldName!, val)}
              >
                <SelectTrigger className='focus:ring-primary transition-all focus:ring-2'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {options?.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          );
        default:
          return (
            <div className='animate-in fade-in space-y-2 duration-200'>
              <div className='mb-2 flex items-center justify-between'>
                <Label className='text-foreground text-sm font-semibold'>
                  {label}
                </Label>
                <div className='flex gap-1.5'>
                  <button
                    type='button'
                    title='Valider'
                    aria-label='Valider'
                    onClick={() => saveField(fieldName!)}
                    className='inline-flex h-7 w-7 items-center justify-center rounded-md bg-green-50 text-green-600 shadow-sm transition-all duration-150 hover:bg-green-100 hover:text-green-700 hover:shadow focus:ring-2 focus:ring-green-500 focus:ring-offset-1 focus:outline-none'
                  >
                    <Check className='h-3.5 w-3.5' />
                  </button>
                  <button
                    type='button'
                    title='Annuler'
                    aria-label='Annuler'
                    onClick={() => cancelField(fieldName!)}
                    className='inline-flex h-7 w-7 items-center justify-center rounded-md bg-red-50 text-red-600 shadow-sm transition-all duration-150 hover:bg-red-100 hover:text-red-700 hover:shadow focus:ring-2 focus:ring-red-500 focus:ring-offset-1 focus:outline-none'
                  >
                    <X className='h-3.5 w-3.5' />
                  </button>
                </div>
              </div>
              <Input
                value={value || ''}
                onChange={(e) => handleChange(fieldName!, e.target.value)}
                className='focus:ring-primary transition-all focus:ring-2'
              />
            </div>
          );
      }
    }

    // Mode affichage
    if (type === 'checkbox') {
      return (
        <div className='group hover:bg-accent/50 space-y-1.5 rounded-lg p-3 transition-all duration-200'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-2.5'>
              <div
                className={`flex h-5 w-5 items-center justify-center rounded-md border-2 transition-all ${value ? 'bg-primary border-primary shadow-sm' : 'border-input'}`}
              >
                {value && (
                  <Check
                    className='text-primary-foreground h-3.5 w-3.5'
                    strokeWidth={3}
                  />
                )}
              </div>
              <Label className='cursor-default text-sm font-semibold'>
                {label}
              </Label>
            </div>
            {canEditThisField && (
              <button
                type='button'
                onClick={() =>
                  setActiveFields((prev) => ({ ...prev, [fieldName!]: true }))
                }
                className='text-muted-foreground hover:text-primary hover:bg-primary/10 focus:ring-primary inline-flex h-6 w-6 items-center justify-center rounded-md opacity-0 transition-all duration-150 group-hover:opacity-100 focus:ring-2 focus:ring-offset-1 focus:outline-none'
                aria-label={`Éditer ${label}`}
              >
                <Pencil className='h-3.5 w-3.5' />
              </button>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className='group hover:bg-accent/50 space-y-1.5 rounded-lg p-3 transition-all duration-200'>
        <div className='flex items-center justify-between'>
          <Label className='text-muted-foreground text-xs font-medium tracking-wider uppercase'>
            {label}
          </Label>
          {canEditThisField && (
            <button
              type='button'
              onClick={() =>
                setActiveFields((prev) => ({ ...prev, [fieldName!]: true }))
              }
              className='text-muted-foreground hover:text-primary hover:bg-primary/10 focus:ring-primary inline-flex h-6 w-6 items-center justify-center rounded-md opacity-0 transition-all duration-150 group-hover:opacity-100 focus:ring-2 focus:ring-offset-1 focus:outline-none'
              aria-label={`Éditer ${label}`}
            >
              <Pencil className='h-3.5 w-3.5' />
            </button>
          )}
        </div>
        <p className='text-foreground text-sm leading-relaxed font-semibold'>
          {value !== null && value !== undefined ? (
            value
          ) : (
            <span className='text-muted-foreground italic'>Non renseigné</span>
          )}
        </p>
      </div>
    );
  };

  return (
    <Card className='border-t-primary border-t-4 shadow-sm'>
      <CardContent className='space-y-6 p-4'>
        {/* Horaires de Travail */}
        <div>
          <h3 className='mb-3 flex items-center gap-2 text-sm font-bold text-cyan-700 dark:text-cyan-400'>
            <Clock className='h-4 w-4' />
            Horaires de Travail
          </h3>
          <div className='space-y-3'>
            <div className='grid grid-cols-1 gap-3 md:grid-cols-3'>
              {renderField(
                "Type d'Horaire",
                schedule.schedule_type,
                'schedule.schedule_type',
                'select',
                [
                  { value: 'Administratif', label: 'Horaire Administratif' },
                  { value: 'Continu', label: 'Horaire Continu' }
                ]
              )}
              {renderField(
                'Travail en Shift',
                schedule.shift_work ?? 'Non',
                'schedule.shift_work',
                'select',
                [
                  { value: 'Non', label: 'Non' },
                  { value: 'Oui', label: 'Oui' }
                ]
              )}
              {renderField(
                'Jours de Congés Annuels',
                schedule.annual_leave_days,
                'schedule.annual_leave_days',
                'number'
              )}
            </div>

            {/* Removed fields not present in creation tab: hours_per_day, days_per_week, hours_per_week, start_time, end_time, break_duration */}

            <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
              {renderField(
                'Autres congés',
                schedule.other_leaves,
                'schedule.other_leaves',
                'text'
              )}
            </div>
          </div>
        </div>

        {/* Période d'Essai */}
        <div>
          <h3 className='mb-3 flex items-center gap-2 text-sm font-bold text-cyan-700 dark:text-cyan-400'>
            <Clock className='h-4 w-4' />
            Période d&apos;Essai
          </h3>
          <div className='space-y-3'>
            {/* Activation */}
            {renderField(
              "Activer la période d'essai",
              !!trial.enabled,
              'dates.trial_period.enabled',
              'checkbox'
            )}

            {/* Only show additional fields if enabled */}
            {trial.enabled && (
              <div className='space-y-3'>
                <div className='grid grid-cols-1 gap-3 md:grid-cols-3'>
                  {renderField(
                    'Durée (mois)',
                    trial.duration_months,
                    'dates.trial_period.duration_months',
                    'number'
                  )}
                  {renderField(
                    'Durée (jours)',
                    trial.duration_days,
                    'dates.trial_period.duration_days',
                    'number'
                  )}
                  {renderField(
                    'Date de Fin',
                    trial.end_date,
                    'dates.trial_period.end_date',
                    'text'
                  )}
                </div>

                <div className='grid grid-cols-1 gap-3 md:grid-cols-3'>
                  {renderField(
                    'Renouvelable',
                    !!trial.renewable,
                    'dates.trial_period.renewable',
                    'checkbox'
                  )}
                  {renderField(
                    'Nb Max Renouvellements',
                    trial.max_renewals,
                    'dates.trial_period.max_renewals',
                    'number'
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className='border-t pt-4'>
          <h3 className='mb-3 flex items-center gap-2 text-sm font-bold text-amber-700 dark:text-amber-400'>
            Critères d'acceptation (Période d'essai)
          </h3>
          {criteriaError && (
            <p className='text-red-600 text-sm'>Impossible de charger les critères: {criteriaError}</p>
          )}
          {criteriaCatalog.length === 0 && !criteriaError && (
            <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className='animate-pulse rounded-lg border p-3'>
                  <div className='mb-2 h-4 w-1/3 rounded bg-muted' />
                  <div className='h-3 w-2/3 rounded bg-muted' />
                </div>
              ))}
            </div>
          )}
          {criteriaCatalog.length > 0 && (
            <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
              {criteriaCatalog.map((crit: any) => {
                const isSelected = (selected || []).includes(crit.id);
                const canEdit = Boolean(isEditing && isDraft);
                return (
                  <div key={crit.id} className='group hover:bg-accent/50 space-y-1.5 rounded-lg p-3 transition-all duration-200'>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center space-x-2.5'>
                        <div className={`flex h-5 w-5 items-center justify-center rounded-md border-2 transition-all ${isSelected ? 'bg-primary border-primary shadow-sm' : 'border-input'}`}></div>
                        <span className='text-sm font-semibold'>{crit.label}</span>
                      </div>
                      {canEdit && (
                        <button
                          className='text-sm underline'
                          onClick={() => toggleCriteria(crit.id, !isSelected)}
                        >
                          {isSelected ? 'Retirer' : 'Ajouter'}
                        </button>
                      )}
                    </div>
                    <p className='text-muted-foreground text-xs'>{crit.description}</p>
                  </div>
                );
              })}
            </div>
          )}
          {(selected?.length || 0) === 0 && criteriaCatalog.length > 0 && (
            <p className='text-muted-foreground text-sm'>Aucun critère sélectionné.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
