'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
              {renderField('Salaire de Base', contract.salary.base_salary, 'salary.base_salary', 'currency')}
              {renderField('Salaire Brut', contract.salary.salary_brut, 'salary.salary_brut', 'currency')}
              {renderField('Salaire Net', contract.salary.salary_net, 'salary.salary_net', 'currency')}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {renderField('Fréquence de Paiement', contract.salary.payment_frequency)}
              {renderField('Méthode de Paiement', contract.salary.payment_method)}
              {renderField('Jour de Paie', contract.salary.payment_day, 'salary.payment_day', 'number')}
            </div>

            {(contract.salary.hourly_rate || contract.salary.daily_rate) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {contract.salary.hourly_rate && renderField('Taux Horaire', contract.salary.hourly_rate, 'salary.hourly_rate', 'currency')}
                {contract.salary.daily_rate && renderField('Taux Journalier', contract.salary.daily_rate, 'salary.daily_rate', 'currency')}
              </div>
            )}

            {contract.salary.bank_name && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {renderField('Banque', contract.salary.bank_name, 'salary.bank_name', 'text')}
                {renderField('RIB', contract.salary.rib, 'salary.rib', 'text')}
              </div>
            )}
          </div>
        </div>

        {/* Primes et Indemnités */}
        {(contract.salary.primes || contract.salary.indemnites) && (
          <div className="border-t pt-4">
            <h3 className="text-sm font-bold mb-3 text-orange-700 dark:text-orange-400 flex items-center gap-2">
              <Award className="h-4 w-4" />
              Primes et Indemnités
            </h3>
            <div className="space-y-3">
              {contract.salary.primes && Object.keys(contract.salary.primes).length > 0 && (
                <div>
                  <h4 className="text-xs font-bold mb-3 text-orange-600 dark:text-orange-400 flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-orange-500"></div>
                    Primes
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {contract.salary.primes.prime_anciennete && renderField('Prime d\'Ancienneté', contract.salary.primes.prime_anciennete, 'salary.primes.prime_anciennete', 'currency')}
                  {contract.salary.primes.prime_transport && renderField('Prime de Transport', contract.salary.primes.prime_transport, 'salary.primes.prime_transport', 'currency')}
                  {contract.salary.primes.prime_panier && renderField('Prime de Panier', contract.salary.primes.prime_panier, 'salary.primes.prime_panier', 'currency')}
                  {contract.salary.primes.prime_rendement && renderField('Prime de Rendement', contract.salary.primes.prime_rendement, 'salary.primes.prime_rendement', 'currency')}
                  {contract.salary.primes.prime_risque && renderField('Prime de Risque', contract.salary.primes.prime_risque, 'salary.primes.prime_risque', 'currency')}
                  {contract.salary.primes.prime_nuit && renderField('Prime de Nuit', contract.salary.primes.prime_nuit, 'salary.primes.prime_nuit', 'currency')}
                  {contract.salary.primes.prime_astreinte && renderField('Prime d\'Astreinte', contract.salary.primes.prime_astreinte, 'salary.primes.prime_astreinte', 'currency')}
                    {contract.salary.primes.prime_objectif && renderField('Prime sur Objectifs', contract.salary.primes.prime_objectif, 'salary.primes.prime_objectif', 'currency')}
                  </div>

                  {(contract.salary.primes.treizieme_mois || contract.salary.primes.quatorzieme_mois) && (
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                      {contract.salary.primes.treizieme_mois && renderField('13ème Mois', contract.salary.primes.treizieme_mois, 'salary.primes.treizieme_mois', 'checkbox')}
                      {contract.salary.primes.quatorzieme_mois && renderField('14ème Mois', contract.salary.primes.quatorzieme_mois, 'salary.primes.quatorzieme_mois', 'checkbox')}
                    </div>
                  )}
                </div>
              )}

              {contract.salary.indemnites && Object.keys(contract.salary.indemnites).length > 0 && (
                <div className="pt-3 mt-3 border-t border-dashed">
                  <h4 className="text-xs font-bold mb-3 text-orange-600 dark:text-orange-400 flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-orange-500"></div>
                    Indemnités
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {contract.salary.indemnites.indemnite_logement && renderField('Indemnité de Logement', contract.salary.indemnites.indemnite_logement, 'salary.indemnites.indemnite_logement', 'currency')}
                  {contract.salary.indemnites.indemnite_deplacement && renderField('Indemnité de Déplacement', contract.salary.indemnites.indemnite_deplacement, 'salary.indemnites.indemnite_deplacement', 'currency')}
                  {contract.salary.indemnites.indemnite_representation && renderField('Indemnité de Représentation', contract.salary.indemnites.indemnite_representation, 'salary.indemnites.indemnite_representation', 'currency')}
                  {contract.salary.indemnites.indemnite_km && renderField('Indemnité Kilométrique', contract.salary.indemnites.indemnite_km, 'salary.indemnites.indemnite_km', 'currency')}
                  {contract.salary.indemnites.frais_telephone && renderField('Forfait Téléphone', contract.salary.indemnites.frais_telephone, 'salary.indemnites.frais_telephone', 'currency')}
                    {contract.salary.indemnites.frais_internet && renderField('Forfait Internet', contract.salary.indemnites.frais_internet, 'salary.indemnites.frais_internet', 'currency')}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Avantages en Nature */}
        {contract.salary.avantages_nature && Object.values(contract.salary.avantages_nature).some(v => v === true) && (
          <div className="border-t pt-4">
            <h3 className="text-sm font-bold mb-3 text-pink-700 dark:text-pink-400 flex items-center gap-2">
              <Gift className="h-4 w-4" />
              Avantages en Nature
            </h3>
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {contract.salary.avantages_nature.voiture_fonction && (
                <div className="space-y-2">
                  {renderField('Voiture de Fonction', contract.salary.avantages_nature.voiture_fonction, 'salary.avantages_nature.voiture_fonction', 'checkbox')}
                  {contract.salary.avantages_nature.voiture_details && (
                    <p className="text-xs text-muted-foreground ml-6">{contract.salary.avantages_nature.voiture_details}</p>
                  )}
                </div>
              )}
              {contract.salary.avantages_nature.telephone && (
                <div className="space-y-2">
                  {renderField('Téléphone Professionnel', contract.salary.avantages_nature.telephone, 'salary.avantages_nature.telephone', 'checkbox')}
                  {contract.salary.avantages_nature.telephone_model && (
                    <p className="text-xs text-muted-foreground ml-6">{contract.salary.avantages_nature.telephone_model}</p>
                  )}
                </div>
              )}
              {contract.salary.avantages_nature.laptop && (
                <div className="space-y-2">
                  {renderField('Ordinateur Portable', contract.salary.avantages_nature.laptop, 'salary.avantages_nature.laptop', 'checkbox')}
                  {contract.salary.avantages_nature.laptop_model && (
                    <p className="text-xs text-muted-foreground ml-6">{contract.salary.avantages_nature.laptop_model}</p>
                  )}
                </div>
              )}
              {contract.salary.avantages_nature.tickets_restaurant && renderField('Tickets Restaurant', contract.salary.avantages_nature.tickets_restaurant, 'salary.avantages_nature.tickets_restaurant', 'checkbox')}
              {contract.salary.avantages_nature.logement && renderField('Logement de Fonction', contract.salary.avantages_nature.logement, 'salary.avantages_nature.logement', 'checkbox')}
              {contract.salary.avantages_nature.assurance_groupe && renderField('Assurance Groupe', contract.salary.avantages_nature.assurance_groupe, 'salary.avantages_nature.assurance_groupe', 'checkbox')}
                {contract.salary.avantages_nature.mutuelle_famille && renderField('Mutuelle Famille', contract.salary.avantages_nature.mutuelle_famille, 'salary.avantages_nature.mutuelle_famille', 'checkbox')}
                {contract.salary.avantages_nature.transport_collectif && renderField('Transport Collectif', contract.salary.avantages_nature.transport_collectif, 'salary.avantages_nature.transport_collectif', 'checkbox')}
              </div>
            </div>
          </div>
        )}

        {/* Informations Légales */}
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
