'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Banknote, Shield, FileCheck, AlertCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { SimplifiedContractInput } from '@/validations/contract-simplified.schema';
import { Badge } from '@/components/ui/badge';

interface SalaryAndLegalTabProps {
  form: UseFormReturn<SimplifiedContractInput>;
  paymentMethodOptions: Array<{ id: string; label: string }>;
}

export function SalaryAndLegalTab({ form, paymentMethodOptions }: SalaryAndLegalTabProps) {
  // Removed unused variables

  return (
    <div className="space-y-6">
      {/* Salaire de Base */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Banknote className="h-5 w-5" />
            Salaire de Base
          </CardTitle>
          <CardDescription>
            Configuration de la rémunération de base
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Ligne 1: Salaire base, brut, net */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="salary.base_salary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    Salaire de Base (MAD) *
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="5000"
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
              name="salary.salary_brut"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Salaire Brut (MAD)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Calculé automatiquement"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      disabled
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="salary.salary_net"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Salaire Net (MAD)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Calculé automatiquement"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      disabled
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Après CNSS (4.48%)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Ligne 2: Devise, Méthode de paiement, Périodicité */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="salary.currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Devise</FormLabel>
                  <FormControl>
                    <Input placeholder="MAD" {...field} value={field.value || 'MAD'} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="salary.payment_method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Méthode de Paiement</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner la méthode" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {paymentMethodOptions.map((option) => (
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
              name="salary.periodicity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Périodicité</FormLabel>
                  <FormControl>
                    <Input placeholder="Mensuel" {...field} value={field.value || 'Mensuel'} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          {/* Ligne 1: Primes principales */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="salary.primes.prime_anciennete"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prime d&apos;Ancienneté (MAD)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
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
              name="salary.primes.prime_transport"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prime de Transport (MAD)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
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
              name="salary.primes.prime_responsabilite"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prime de Responsabilité (MAD)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Ligne 2: Primes secondaires */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="salary.primes.prime_performance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prime de Performance (MAD)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
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
              name="salary.primes.prime_panier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prime Panier (MAD)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
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
              name="salary.primes.autres_primes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Autres Primes (MAD)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Indemnités */}
          <FormField
            control={form.control}
            name="salary.indemnites"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Indemnités Diverses</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Ex: Indemnité de logement, téléphone, etc."
                    className="min-h-[60px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Ligne 1: Voiture, Logement, Téléphone */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="salary.avantages.voiture"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Voiture de Fonction</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="salary.avantages.logement"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Logement de Fonction</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="salary.avantages.telephone"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Téléphone Professionnel</FormLabel>
                  </div>
                </FormItem>
              )}
            />
          </div>

          {/* Ligne 2: Assurance, Tickets restaurant, Autres */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="salary.avantages.assurance_sante"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Assurance Santé</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="salary.avantages.tickets_restaurant"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Tickets Restaurant</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="salary.avantages.autres"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Autres Avantages</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Formation, etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          {/* Ligne 1: CNSS, AMO, IR */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="legal.cnss_affiliation"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Affiliation CNSS</FormLabel>
                    <FormDescription>
                      Cotisation 4.48%
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="legal.amo_affiliation"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Affiliation AMO</FormLabel>
                    <FormDescription>
                      Assurance Maladie
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="legal.ir_applicable"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>IR Applicable</FormLabel>
                    <FormDescription>
                      Impôt sur le revenu
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </div>

          {/* Ligne 2: Convention collective, clauses */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="legal.clause_confidentialite"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Clause Confidentialité</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="legal.clause_non_concurrence"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Clause Non-Concurrence</FormLabel>
                  </div>
                </FormItem>
              )}
            />
          </div>

          {/* Conditions spéciales et notes légales */}
          <div className="grid grid-cols-1 gap-4">
            <FormField
              control={form.control}
              name="legal.conditions_speciales"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Conditions Spéciales</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ex: Clause de mobilité, heures supplémentaires..."
                      className="min-h-[60px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="legal.notes_legales"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes Légales</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Remarques juridiques supplémentaires..."
                      className="min-h-[60px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Alerte conformité */}
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-amber-900 mb-1">Conformité Code du Travail</h4>
                <p className="text-sm text-amber-800">
                  Ce contrat doit respecter les dispositions du Code du Travail marocain (Loi n° 65-99).
                  Assurez-vous que tous les éléments obligatoires sont renseignés.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

