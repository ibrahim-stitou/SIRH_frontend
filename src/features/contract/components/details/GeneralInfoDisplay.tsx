'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePickerField } from '@/components/custom/DatePickerField';
import { Calendar as CalendarIcon, FileText, Briefcase, Pencil, Check, X } from 'lucide-react';
import { Contract, ContractType, WorkMode } from '@/types/contract';
import { formatDateLong } from '@/lib/date-utils';

interface GeneralInfoDisplayProps {
  contract: Contract;
  isEditing: boolean;
  onUpdate?: (data: Partial<Contract>) => void;
}

const contractTypeLabels: Record<ContractType, string> = {
  CDI: 'CDI - Contrat à Durée Indéterminée',
  CDD: 'CDD - Contrat à Durée Déterminée',
  CDD_Saisonnier: 'CDD Saisonnier',
  CDD_Temporaire: 'CDD Temporaire',
  ANAPEC: 'Contrat ANAPEC (Idmaj)',
  SIVP: 'Stage d\'Insertion à la Vie Professionnelle',
  TAHIL: 'Programme TAHIL',
  Apprentissage: 'Contrat d\'apprentissage',
  Stage_PFE: 'Stage de fin d\'études',
  Stage_Initiation: 'Stage d\'initiation',
  Interim: 'Travail intérimaire',
  Teletravail: 'Contrat de télétravail',
  Freelance: 'Travail indépendant',
  Consultance: 'Contrat de consultance',
};

const workModeLabels: Record<WorkMode, string> = {
  Presentiel: 'Présentiel',
  Hybride: 'Hybride',
  Teletravail: 'Télétravail',
  Itinerant: 'Itinérant',
  Horaire_variable: 'Horaire variable',
};

export default function GeneralInfoDisplay({ contract, isEditing, onUpdate }: GeneralInfoDisplayProps) {
  const [editedData, setEditedData] = useState(contract);
  const [activeFields, setActiveFields] = useState<Record<string, boolean>>({});

  const isDraft = contract.status === 'Brouillon';

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
    const keys = field.split('.');
    const lastKey = keys[keys.length - 1];
    let editedCursor: any = editedData;
    for (let i = 0; i < keys.length - 1; i++) {
      editedCursor = editedCursor[keys[i]];
    }
    onUpdate?.(
      keys.length === 1
        ? { [field]: editedCursor[lastKey] }
        : keys.slice(0, -1).reduceRight(
            (acc, key, idx, arr) => ({ [arr[0]]: arr.length === 1 ? { [lastKey]: editedCursor[lastKey] } : acc }),
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
      editedCursor[keys[i]] = editedCursor[keys[i]] ?? {};
      editedCursor = editedCursor[keys[i]];
      originalCursor = (originalCursor as any)?.[keys[i]] ?? {};
    }
    editedCursor[keys[keys.length - 1]] = originalCursor[keys[keys.length - 1]];

    setEditedData({ ...newData });
    setActiveFields((prev) => ({ ...prev, [field]: false }));
  };

  const renderField = (
    label: string,
    value: any,
    fieldName?: string,
    type: 'text' | 'date' | 'select' | 'textarea' | 'checkbox' = 'text',
    options?: any[]
  ) => {
    const fieldIsActive = !!(fieldName && activeFields[fieldName]);
    const canEditThisField = Boolean(isEditing && isDraft && fieldName);

    if (canEditThisField && fieldIsActive) {
      switch (type) {
        case 'date':
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
              <DatePickerField
                label=""
                value={value}
                onChange={(date) => handleChange(fieldName!, date)}
              />
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
        case 'textarea':
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
              <Textarea
                value={value || ''}
                onChange={(e) => handleChange(fieldName!, e.target.value)}
                rows={3}
                className="focus:ring-2 focus:ring-primary transition-all resize-none"
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
          {type === 'date' ? formatDateLong(value) : (value !== null && value !== undefined ? value : <span className="text-muted-foreground italic">Non renseigné</span>)}
        </p>
      </div>
    );
  };

  return (
    <Card className="border-t-4 border-t-primary shadow-sm">
      <CardContent className="p-4 space-y-6">
        {/* Informations de Base */}
        <div>
          <h3 className="text-sm font-bold mb-3 text-blue-700 dark:text-blue-400 flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Informations de Base
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {renderField('Référence', (contract as any).reference, 'reference', 'text')}
            {/* Employé: afficher le nom si présent, sinon l'ID sélectionné */}
            {renderField("Employé", (contract as any).employee_name ?? (contract as any).employe_id, 'employe_id', 'text')}
            {renderField(
              'Type de Contrat',
              isEditing ? (contract as any).type : contractTypeLabels[(contract as any).type as ContractType],
              'type',
              'select',
              Object.entries(contractTypeLabels).map(([value, label]) => ({ value, label }))
            )}
          </div>
        </div>

        {/* Dates du Contrat */}
        <div className="border-t pt-4">
          <h3 className="text-sm font-bold mb-3 text-amber-700 dark:text-amber-400 flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            Dates du Contrat
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            {renderField('Date de Signature', (contract as any).dates?.signature_date, 'dates.signature_date', 'date')}
            {renderField('Date de Début', (contract as any).dates?.start_date, 'dates.start_date', 'date')}
            {renderField('Date de Fin', (contract as any).dates?.end_date || 'Indéterminée', 'dates.end_date', 'date')}
          </div>

          {/* Nouvelle structure de période d'essai (activable) */}
          {((contract as any).dates?.trial_period?.enabled) && (
            <div className="pt-3 mt-3 border-t border-dashed">
              <h4 className="text-xs font-bold mb-3 text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-amber-500"></div>
                Période d&apos;Essai
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {renderField('Durée (mois)', (contract as any).dates?.trial_period?.duration_months, 'dates.trial_period.duration_months', 'text')}
                {renderField('Durée (jours)', (contract as any).dates?.trial_period?.duration_days, 'dates.trial_period.duration_days', 'text')}
                {renderField('Date de Fin', (contract as any).dates?.trial_period?.end_date, 'dates.trial_period.end_date', 'date')}
              </div>
              {renderField('Conditions', (contract as any).dates?.trial_period?.conditions, 'dates.trial_period.conditions', 'textarea')}
            </div>
          )}
        </div>

        {/* Informations du Poste selon nouveau schéma */}
        <div className="border-t pt-4">
          <h3 className="text-sm font-bold mb-3 text-purple-700 dark:text-purple-400 flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            Informations du Poste
          </h3>
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {renderField('Métier', (contract as any).job?.metier ?? (contract as any).job?.title, 'job.metier', 'text')}
              {renderField('Emploi', (contract as any).job?.emploie ?? (contract as any).job?.department, 'job.emploie', 'text')}
              {renderField('Poste', (contract as any).job?.poste ?? (contract as any).job?.title, 'job.poste', 'text')}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {renderField('Mode de Travail', isEditing ? (contract as any).job?.work_mode : workModeLabels[((contract as any).job?.work_mode) as WorkMode], 'job.work_mode', 'select', Object.entries(workModeLabels).map(([value, label]) => ({ value, label })))}
              {renderField('Classification', (contract as any).job?.classification ?? (contract as any).job?.category, 'job.classification', 'text')}
              {renderField('Lieu de Travail', (contract as any).job?.work_location, 'job.work_location', 'text')}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {renderField('Responsabilités', (contract as any).job?.responsibilities ?? (contract as any).job?.missions, 'job.responsibilities', 'textarea')}
              {renderField('Description', (contract as any).description, 'description', 'textarea')}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
