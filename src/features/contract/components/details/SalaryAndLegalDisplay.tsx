'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Shield, Award, Gift, Pencil, Check, X } from 'lucide-react';
import { Contract } from '@/types/contract';
import { DatePickerField } from '@/components/custom/DatePickerField';
import { formatDateLong } from '@/lib/date-utils';

interface SalaryAndLegalDisplayProps {
  contract: Contract;
  isEditing: boolean;
  onUpdate?: (data: Partial<Contract>) => void;
}

export default function SalaryAndLegalDisplay({ contract, isEditing, onUpdate }: SalaryAndLegalDisplayProps) {
  const [editedData, setEditedData] = useState(contract);
  const [activeFields, setActiveFields] = useState<Record<string, boolean>>({});
  const isDraft = contract.status === 'Brouillon';

  const salary = (contract as any).salary ?? {};

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
    const keys = field.split('.');
    const lastKey = keys[keys.length - 1];
    let editedCursor: any = editedData;
    for (let i = 0; i < keys.length - 1; i++) {
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

  const formatCurrency = (amount: number | undefined | null) => {
    if (!amount && amount !== 0) return 'N/A';
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD',
    }).format(amount);
  };

  const renderField = (label: string, value: any, fieldName?: string, type: 'text' | 'number' | 'checkbox' | 'currency' | 'date' = 'text') => {
    const fieldIsActive = !!(fieldName && activeFields[fieldName]);
    const canEditThisField = Boolean(isEditing && isDraft && fieldName);

    if (canEditThisField && fieldIsActive) {
      switch (type) {
        case 'number':
        case 'currency':
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
                step="0.01"
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
          {type === 'currency' ? formatCurrency(value) : type === 'date' ? formatDateLong(value) : (value !== null && value !== undefined ? value : <span className="text-muted-foreground italic">Non renseigné</span>)}
        </p>
      </div>
    );
  };

  return (
    <Card className="border-t-4 border-t-primary shadow-sm">
      <CardContent className="p-4 space-y-6">
        {/* Rémunération de Base */}
        <div>
          <h3 className="text-sm font-bold mb-3 text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Rémunération de Base
          </h3>
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {renderField('Salaire Brut', salary.salary_brut, 'salary.salary_brut', 'currency')}
              {renderField('Salaire Net', salary.salary_net, 'salary.salary_net', 'currency')}
              {renderField('Périodicité', salary.periodicity, 'salary.periodicity', 'text')}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {renderField('Méthode de Paiement', salary.payment_method, 'salary.payment_method', 'text')}
              {renderField('Devise', salary.currency, 'salary.currency', 'text')}
            </div>
          </div>
        </div>

        {/* Primes dynamiques */}
        <div className="border-t pt-4">
          <h3 className="text-sm font-bold mb-3 text-orange-700 dark:text-orange-400 flex items-center gap-2">
            <Award className="h-4 w-4" />
            Primes
          </h3>
          <div className="space-y-3">
            {Array.isArray(salary.primes?.items) && salary.primes.items.length > 0 ? (
              <div className="space-y-3">
                {(salary.primes.items as any[]).map((item, index) => (
                  <div key={index} className="border rounded-md p-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {renderField('Type de Prime', item.label, `salary.primes.items.${index}.label`, 'text')}
                      {renderField('Montant', item.amount, `salary.primes.items.${index}.amount`, 'currency')}
                      {renderField('Imposable IR', item.is_taxable, `salary.primes.items.${index}.is_taxable`, 'checkbox')}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                      {renderField('Soumise CNSS/AMO', item.is_subject_to_cnss, `salary.primes.items.${index}.is_subject_to_cnss`, 'checkbox')}
                      {renderField('Notes', item.notes, `salary.primes.items.${index}.notes`, 'text')}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Aucune prime.</p>
            )}
          </div>
        </div>

        {/* Avantages & Indemnités */}
        <div className="border-t pt-4">
          <h3 className="text-sm font-bold mb-3 text-sky-700 dark:text-sky-400 flex items-center gap-2">
            <Gift className="h-4 w-4" />
            Avantages & Indemnités
          </h3>
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {renderField('Voiture de Fonction', salary.avantages?.voiture, 'salary.avantages.voiture', 'checkbox')}
              {renderField('Logement de Fonction', salary.avantages?.logement, 'salary.avantages.logement', 'checkbox')}
              {renderField('Téléphone Professionnel', salary.avantages?.telephone, 'salary.avantages.telephone', 'checkbox')}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {renderField('Assurance Santé', salary.avantages?.assurance_sante, 'salary.avantages.assurance_sante', 'checkbox')}
              {renderField('Tickets Restaurant', salary.avantages?.tickets_restaurant, 'salary.avantages.tickets_restaurant', 'checkbox')}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-1 gap-3">
              {renderField('Indemnités Diverses', salary.indemnites, 'salary.indemnites', 'text')}
            </div>
          </div>
        </div>

        {/* Bloc légal conservé tel quel */}
        <div className="border-t pt-4">
          <h3 className="text-sm font-bold mb-3 text-slate-700 dark:text-slate-400 flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Informations Légales et Protection Sociale
          </h3>
          <div className="space-y-4">
            {/* CNSS */}
            <div>
              <h4 className="text-xs font-bold mb-3 flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                <div className="h-1.5 w-1.5 rounded-full bg-slate-500"></div>
                CNSS
                {contract.legal.cnss_affiliation && <Badge variant="default" className="ml-2 text-xs h-5">Affilié</Badge>}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {renderField('Affiliation CNSS', contract.legal.cnss_affiliation, 'legal.cnss_affiliation', 'checkbox')}
                {contract.legal.cnss_number && renderField('Numéro CNSS', contract.legal.cnss_number, 'legal.cnss_number', 'text')}
                {contract.legal.cnss_regime && renderField('Régime CNSS', contract.legal.cnss_regime)}
              </div>
            </div>

            {/* AMO */}
            <div className="pt-3 mt-3 border-t border-dashed">
              <h4 className="text-xs font-bold mb-3 flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                <div className="h-1.5 w-1.5 rounded-full bg-slate-500"></div>
                AMO
                {contract.legal.amo && <Badge variant="default" className="ml-2 text-xs h-5">Couvert</Badge>}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {renderField('AMO', contract.legal.amo, 'legal.amo', 'checkbox')}
              {contract.legal.amo_number && renderField('Numéro AMO', contract.legal.amo_number, 'legal.amo_number', 'text')}
              {contract.legal.amo_regime && renderField('Régime AMO', contract.legal.amo_regime)}
                {contract.legal.amo_family_members !== undefined && renderField('Ayants Droit', contract.legal.amo_family_members, 'legal.amo_family_members', 'number')}
              </div>
            </div>

            {/* Retraite Complémentaire */}
            {(contract.legal.cimr || contract.legal.rcar) && (
              <div className="pt-3 mt-3 border-t border-dashed">
                <h4 className="text-xs font-bold mb-3 text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-slate-500"></div>
                  Retraite Complémentaire
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {contract.legal.cimr && renderField('CIMR', contract.legal.cimr, 'legal.cimr', 'checkbox')}
                  {contract.legal.rcar && renderField('RCAR', contract.legal.rcar, 'legal.rcar', 'checkbox')}
                </div>
              </div>
            )}

            {/* Convention Collective */}
            {contract.legal.convention_collective && (
              <div className="pt-3 mt-3 border-t border-dashed">
                <h4 className="text-xs font-bold mb-3 text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-slate-500"></div>
                  Convention Collective
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {renderField('Convention Collective', contract.legal.convention_collective, 'legal.convention_collective', 'text')}
                  {contract.legal.convention_date && renderField('Date', contract.legal.convention_date, 'legal.convention_date', 'date')}
                </div>
              </div>
            )}

            {/* Clauses Contractuelles */}
            {contract.legal.clauses && (
              <div className="pt-3 mt-3 border-t border-dashed">
                <h4 className="text-xs font-bold mb-3 text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-slate-500"></div>
                  Clauses Contractuelles
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {contract.legal.clauses.confidentialite && renderField('Clause de Confidentialité', contract.legal.clauses.confidentialite, 'legal.clauses.confidentialite', 'checkbox')}
                {contract.legal.clauses.non_concurrence && renderField('Clause de Non-Concurrence', contract.legal.clauses.non_concurrence, 'legal.clauses.non_concurrence', 'checkbox')}
                {contract.legal.clauses.mobilite && renderField('Clause de Mobilité', contract.legal.clauses.mobilite, 'legal.clauses.mobilite', 'checkbox')}
                {contract.legal.clauses.exclusivite && renderField('Clause d\'Exclusivité', contract.legal.clauses.exclusivite, 'legal.clauses.exclusivite', 'checkbox')}
                  {contract.legal.clauses.formation && renderField('Clause de Formation', contract.legal.clauses.formation, 'legal.clauses.formation', 'checkbox')}
                  {contract.legal.clauses.intellectual_property && renderField('Propriété Intellectuelle', contract.legal.clauses.intellectual_property, 'legal.clauses.intellectual_property', 'checkbox')}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
