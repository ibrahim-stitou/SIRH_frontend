'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Clock, Calendar as CalendarIcon, Coffee, Pencil, Check, X } from 'lucide-react';
import { Contract } from '@/types/contract';

interface WorkScheduleDisplayProps {
  contract: Contract;
  isEditing: boolean;
  onUpdate?: (data: Partial<Contract>) => void;
}

export default function WorkScheduleDisplay({ contract, isEditing, onUpdate }: WorkScheduleDisplayProps) {
  const [editedData, setEditedData] = useState(contract);
  const [activeFields, setActiveFields] = useState<Record<string, boolean>>({});
  const isDraft = contract.status === 'Brouillon';

  const handleChange = (field: string, value: any) => {
    const keys = field.split('.');
    const newData = { ...editedData };
    let current: any = newData;

    for (let i = 0; i < keys.length - 1; i++) {
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
    onUpdate?.(keys.length === 1 ? { [field]: editedCursor[lastKey] } : keys.slice(0, -1).reduceRight((acc, key, idx, arr) => ({ [arr[0]]: arr.length === 1 ? { [lastKey]: editedCursor[lastKey] } : acc }), { [lastKey]: editedCursor[lastKey] }));
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

  const renderField = (label: string, value: any, fieldName?: string, type: 'text' | 'number' | 'checkbox' | 'select' = 'text', options?: any[]) => {
    const fieldIsActive = !!(fieldName && activeFields[fieldName]);
    const canEditThisField = Boolean(isEditing && isDraft && fieldName);

    if (canEditThisField && fieldIsActive) {
      switch (type) {
        case 'number':
          return (
            <div className="space-y-2 animate-in fade-in duration-200">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-semibold text-foreground">{label}</Label>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    title="Valider"
                    aria-label="Valider"
                    onClick={() => saveField(fieldName!)}
                    className="inline-flex items-center justify-center h-7 w-7 rounded-md bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1 transition-all duration-150 shadow-sm hover:shadow"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    title="Annuler"
                    aria-label="Annuler"
                    onClick={() => cancelField(fieldName!)}
                    className="inline-flex items-center justify-center h-7 w-7 rounded-md bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 transition-all duration-150 shadow-sm hover:shadow"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <Input
                type="number"
                value={value ?? ''}
                onChange={(e) => {
                  const v = e.target.value;
                  const num = v === '' ? '' : Number(v);
                  handleChange(fieldName!, num === '' ? null : (Number.isNaN(num) ? null : num));
                }}
                className="focus:ring-2 focus:ring-primary transition-all"
              />
            </div>
          );
        case 'checkbox':
          return (
            <div className="space-y-2 animate-in fade-in duration-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={fieldName}
                    checked={!!value}
                    onCheckedChange={(checked) => handleChange(fieldName!, checked)}
                    className="transition-all"
                  />
                  <Label htmlFor={fieldName} className="text-sm font-semibold cursor-pointer">
                    {label}
                  </Label>
                </div>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    title="Valider"
                    aria-label="Valider"
                    onClick={() => saveField(fieldName!)}
                    className="inline-flex items-center justify-center h-7 w-7 rounded-md bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1 transition-all duration-150 shadow-sm hover:shadow"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    title="Annuler"
                    aria-label="Annuler"
                    onClick={() => cancelField(fieldName!)}
                    className="inline-flex items-center justify-center h-7 w-7 rounded-md bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 transition-all duration-150 shadow-sm hover:shadow"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        case 'select':
          return (
            <div className="space-y-2 animate-in fade-in duration-200">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-semibold text-foreground">{label}</Label>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    title="Valider"
                    aria-label="Valider"
                    onClick={() => saveField(fieldName!)}
                    className="inline-flex items-center justify-center h-7 w-7 rounded-md bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1 transition-all duration-150 shadow-sm hover:shadow"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    title="Annuler"
                    aria-label="Annuler"
                    onClick={() => cancelField(fieldName!)}
                    className="inline-flex items-center justify-center h-7 w-7 rounded-md bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 transition-all duration-150 shadow-sm hover:shadow"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <Select value={value} onValueChange={(val) => handleChange(fieldName!, val)}>
                <SelectTrigger className="focus:ring-2 focus:ring-primary transition-all">
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
            <div className="space-y-2 animate-in fade-in duration-200">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-semibold text-foreground">{label}</Label>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    title="Valider"
                    aria-label="Valider"
                    onClick={() => saveField(fieldName!)}
                    className="inline-flex items-center justify-center h-7 w-7 rounded-md bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1 transition-all duration-150 shadow-sm hover:shadow"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    title="Annuler"
                    aria-label="Annuler"
                    onClick={() => cancelField(fieldName!)}
                    className="inline-flex items-center justify-center h-7 w-7 rounded-md bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 transition-all duration-150 shadow-sm hover:shadow"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <Input
                value={value || ''}
                onChange={(e) => handleChange(fieldName!, e.target.value)}
                className="focus:ring-2 focus:ring-primary transition-all"
              />
            </div>
          );
      }
    }

    // Mode affichage
    if (type === 'checkbox') {
      return (
        <div className="group space-y-1.5 p-3 rounded-lg hover:bg-accent/50 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className={`h-5 w-5 rounded-md border-2 flex items-center justify-center transition-all ${value ? 'bg-primary border-primary shadow-sm' : 'border-input'}`}>
                {value && (
                  <Check className="h-3.5 w-3.5 text-primary-foreground" strokeWidth={3} />
                )}
              </div>
              <Label className="text-sm font-semibold cursor-default">{label}</Label>
            </div>
            {canEditThisField && (
              <button
                type="button"
                onClick={() => setActiveFields((prev) => ({ ...prev, [fieldName!]: true }))}
                className="inline-flex items-center justify-center h-6 w-6 rounded-md opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-primary hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 transition-all duration-150"
                aria-label={`Éditer ${label}`}
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="group space-y-1.5 p-3 rounded-lg hover:bg-accent/50 transition-all duration-200">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</Label>
          {canEditThisField && (
            <button
              type="button"
              onClick={() => setActiveFields((prev) => ({ ...prev, [fieldName!]: true }))}
              className="inline-flex items-center justify-center h-6 w-6 rounded-md opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-primary hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 transition-all duration-150"
              aria-label={`Éditer ${label}`}
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <p className="text-sm font-semibold text-foreground leading-relaxed">
          {value !== null && value !== undefined ? value : <span className="text-muted-foreground italic">Non renseigné</span>}
        </p>
      </div>
    );
  };

  return (
    <Card className="border-t-4 border-t-primary shadow-sm">
      <CardContent className="p-4 space-y-6">
        {/* Horaires de Travail */}
        <div>
          <h3 className="text-sm font-bold mb-3 text-cyan-700 dark:text-cyan-400 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Horaires de Travail
          </h3>
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {renderField('Heures Hebdomadaires', contract.work_time.weekly_hours, 'work_time.weekly_hours', 'number')}
              {renderField('Heures Journalières', contract.work_time.daily_hours, 'work_time.daily_hours', 'number')}
              {renderField('Heures Annuelles', contract.work_time.annual_hours, 'work_time.annual_hours', 'number')}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {renderField('Horaire de Travail', contract.work_time.work_schedule, 'work_time.work_schedule', 'text')}
              {renderField(
                'Type d\'Horaire',
                contract.work_time.work_schedule_type,
                'work_time.work_schedule_type',
                'select',
                [
                  { value: 'Normal', label: 'Normal' },
                  { value: 'Equipe', label: 'En équipe' },
                  { value: 'Continu', label: 'Continu' },
                  { value: 'Variable', label: 'Variable' },
                  { value: 'Modulation', label: 'Modulation' },
                ]
              )}
            </div>
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="text-sm font-bold mb-3 text-indigo-700 dark:text-indigo-400 flex items-center gap-2">
            <Coffee className="h-4 w-4" />
            Organisation du Travail
          </h3>
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {renderField('Jour de Repos', contract.work_time.rest_day, 'work_time.rest_day', 'text')}
              {renderField('Équipe', contract.work_time.shift || 'Aucune', 'work_time.shift', 'text')}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {renderField('Rotation d\'équipes', contract.work_time.rotation, 'work_time.rotation', 'checkbox')}
              {renderField('Travail de nuit', contract.work_time.night_work, 'work_time.night_work', 'checkbox')}
              {renderField('Travail le week-end', contract.work_time.weekend_work, 'work_time.weekend_work', 'checkbox')}
              {renderField('Astreintes', contract.work_time.on_call, 'work_time.on_call', 'checkbox')}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {renderField('Heures supplémentaires autorisées', contract.work_time.overtime_authorized, 'work_time.overtime_authorized', 'checkbox')}
              {renderField('Repos compensateur', contract.work_time.compensatory_rest, 'work_time.compensatory_rest', 'checkbox')}
            </div>
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="text-sm font-bold mb-3 text-teal-700 dark:text-teal-400 flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            Congés et Absences
          </h3>
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {renderField('Jours de Congés Annuels', contract.work_time.annual_leave_days, 'work_time.annual_leave_days', 'number')}
              {renderField('Bonus Ancienneté', contract.work_time.seniority_leave_bonus, 'work_time.seniority_leave_bonus', 'number')}
            </div>

            {contract.work_time.special_leaves && (
              <div className="pt-3 mt-3 border-t border-dashed">
                <h4 className="text-xs font-bold mb-3 text-teal-600 dark:text-teal-400 flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-teal-500"></div>
                  Congés Spéciaux
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {renderField('Mariage', contract.work_time.special_leaves.marriage, 'work_time.special_leaves.marriage', 'number')}
                  {renderField('Naissance', contract.work_time.special_leaves.birth, 'work_time.special_leaves.birth', 'number')}
                  {renderField('Décès', contract.work_time.special_leaves.death_relative, 'work_time.special_leaves.death_relative', 'number')}
                  {renderField('Circoncision', contract.work_time.special_leaves.circumcision, 'work_time.special_leaves.circumcision', 'number')}
                  {renderField('Hajj', contract.work_time.special_leaves.hajj, 'work_time.special_leaves.hajj', 'number')}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
