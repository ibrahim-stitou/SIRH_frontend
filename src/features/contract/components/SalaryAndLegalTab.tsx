'use client';

import React, { useEffect } from 'react';
import { UseFormReturn, useFieldArray } from 'react-hook-form';
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
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import {
  Banknote,
  Plus,
  Trash2,
  Info
} from 'lucide-react';
import { SelectField } from '@/components/custom/SelectField';
import type { SimplifiedContractInput } from '@/validations/contract-simplified.schema';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { usePrimeTypes } from '@/services/primeService';
import type { PrimeType } from '@/types/prime';
import { Badge } from '@/components/ui/badge';

interface SalaryAndLegalTabProps {
  form: UseFormReturn<SimplifiedContractInput>;
  paymentMethodOptions: Array<{ id: string; label: string }>;
}

export function SalaryAndLegalTab({
  form,
  paymentMethodOptions
}: SalaryAndLegalTabProps) {
  // Get available prime types
  const primeTypes = usePrimeTypes();

  // Watch salary values for prime display
  const salaryValues = form.watch('salary');

  // Field array for dynamic primes
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'salary.primes.items' as any
  });

  // Watch prime items to auto-apply properties when type changes
  useEffect(() => {
    if (!salaryValues) return;
    const primeItems = (salaryValues?.primes as any)?.items || [];

    primeItems.forEach((item: any, index: number) => {
      if (item?.prime_type_id) {
        const prime = primeTypes.find(
          (p: PrimeType) => p.id === item.prime_type_id
        );
        if (prime && (!item.label || item.label === '')) {
          // Auto-apply properties from prime type
          form.setValue(
            `salary.primes.items.${index}.label` as any,
            prime.label
          );
          form.setValue(
            `salary.primes.items.${index}.is_taxable` as any,
            prime.is_taxable
          );
          form.setValue(
            `salary.primes.items.${index}.is_subject_to_cnss` as any,
            prime.is_subject_to_cnss
          );
        }
      }
    });
  }, [salaryValues, primeTypes, form]);

  return (
    <div className='space-y-4'>
      {/* Salaire de Base */}
      <Card>
        <CardHeader className='pb-3'>
          <CardTitle className='flex items-center gap-2 text-base'>
            <Banknote className='h-4 w-4' />
            Salaire et Aspects Légaux
          </CardTitle>
          <CardDescription className='text-xs'>
            Configuration du salaire, primes et conformité légale
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-3'>
          {/* Ligne 1: Salaire brut et net - Saisie manuelle */}
          <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
            <FormField
              control={form.control}
              name='salary.salary_brut'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-xs'>Salaire Brut (MAD) *</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      placeholder='5000'
                      className='h-9'
                      value={field.value || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(value === '' ? 0 : parseFloat(value));
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='salary.salary_net'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-xs'>Salaire Net (MAD) *</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      placeholder='4000'
                      className='h-9'
                      value={field.value || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(value === '' ? 0 : parseFloat(value));
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>



          {/* Ligne 2: Méthode de paiement et Périodicité */}
          <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
            <SelectField
              control={form.control}
              name='salary.payment_method'
              label='Méthode de Paiement'
              displayField='label'
              placeholder='Sélectionner la méthode'
              options={paymentMethodOptions.map((option) => ({
                id: option.id,
                label: option.label
              }))}
              className='h-9'
            />

            <SelectField
              control={form.control}
              name='salary.periodicity'
              label='Périodicité'
              displayField='label'
              placeholder='Sélectionner la périodicité'
              options={[
                { id: 'Mensuel', label: 'Mensuel' },
                { id: 'Bimensuel', label: 'Bimensuel' },
                { id: 'Hebdomadaire', label: 'Hebdomadaire' },
                { id: 'Annuel', label: 'Annuel' },
              ]}
              className='h-9'
            />
          </div>

          {/* Section Primes Dynamiques */}
          <div className='mt-4 space-y-3'>
            <div className='flex items-center justify-between'>
              <div>
                <h4 className='text-sm font-semibold'>Primes</h4>
                <p className='text-muted-foreground text-xs'>
                  Ajoutez les primes manuellement (sans calcul automatique)
                </p>
              </div>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() => {
                  const defaultPrime = primeTypes[0];
                  append({
                    prime_type_id: defaultPrime?.id || '',
                    label: defaultPrime?.label || '',
                    amount: 0,
                    is_taxable: defaultPrime?.is_taxable ?? true,
                    is_subject_to_cnss:
                      defaultPrime?.is_subject_to_cnss ?? true,
                    notes: ''
                  } as any);
                }}
              >
                <Plus className='mr-1 h-4 w-4' />
                Ajouter une Prime
              </Button>
            </div>

            {fields.length > 0 ? (
              <div className='space-y-3'>
                {fields.map((field, index) => {
                  const primeValue = (salaryValues?.primes as any)?.items?.[
                    index
                  ];
                  const selectedPrime = primeTypes.find(
                    (p: PrimeType) => p.id === primeValue?.prime_type_id
                  );

                  return (
                    <Card key={field.id} className='p-4'>
                      <div className='space-y-3'>
                        <div className='flex items-start gap-3'>
                          <div className='grid flex-1 grid-cols-1 gap-3 md:grid-cols-2'>
                            {/* Type de Prime avec SelectField */}
                            <div className='space-y-2'>
                              <FormLabel className='text-xs'>
                                Type de Prime *
                              </FormLabel>
                              <SelectField
                                control={form.control}
                                name={
                                  `salary.primes.items.${index}.prime_type_id` as any
                                }
                                label=''
                                displayField='label'
                                placeholder='Sélectionner un type de prime'
                                options={primeTypes.map((prime: PrimeType) => ({
                                  id: prime.id,
                                  label: prime.label,
                                  description: prime.description
                                }))}
                              />
                            </div>

                            {/* Montant */}
                            <FormField
                              control={form.control}
                              name={
                                `salary.primes.items.${index}.amount` as any
                              }
                              render={({ field: amountField }) => (
                                <FormItem>
                                  <FormLabel className='text-xs'>
                                    Montant (MAD) *
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      type='number'
                                      step='0.01'
                                      placeholder='0.00'
                                      className='h-9'
                                      value={amountField.value || ''}
                                      onChange={(e) =>
                                        amountField.onChange(
                                          e.target.value
                                            ? parseFloat(e.target.value)
                                            : 0
                                        )
                                      }
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <Button
                            type='button'
                            variant='ghost'
                            size='icon'
                            className='text-destructive hover:bg-destructive/10 h-9 w-9'
                            onClick={() => remove(index)}
                          >
                            <Trash2 className='h-4 w-4' />
                          </Button>
                        </div>

                        {/* Informations automatiques du type de prime */}
                        {selectedPrime && (
                          <div className='bg-muted/50 flex items-center gap-2 rounded-md p-2'>
                            <Info className='text-muted-foreground h-4 w-4 flex-shrink-0' />
                            <div className='text-muted-foreground flex flex-1 flex-wrap items-center gap-2 text-xs'>
                              <Badge variant='outline' className='text-xs'>
                                {selectedPrime.category}
                              </Badge>
                              <span>•</span>
                              <span
                                className={
                                  selectedPrime.is_taxable
                                    ? 'text-orange-600'
                                    : 'text-green-600'
                                }
                              >
                                {selectedPrime.is_taxable
                                  ? 'Imposable IR'
                                  : 'Non imposable IR'}
                              </span>
                              <span>•</span>
                              <span
                                className={
                                  selectedPrime.is_subject_to_cnss
                                    ? 'text-blue-600'
                                    : 'text-gray-600'
                                }
                              >
                                {selectedPrime.is_subject_to_cnss
                                  ? 'Soumise CNSS/AMO'
                                  : 'Non soumise CNSS'}
                              </span>
                              {selectedPrime.description && (
                                <>
                                  <span>•</span>
                                  <span className='italic'>
                                    {selectedPrime.description}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Notes optionnelles */}
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Alert>
                <Info className='h-4 w-4' />
                <AlertDescription className='text-xs'>
                  Aucune prime ajoutée. Cliquez sur &quot;Ajouter une
                  Prime&quot; pour en ajouter.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Indemnités */}
          <FormField
            control={form.control}
            name='salary.indemnites'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-xs'>Indemnités Diverses</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder='Ex: Indemnité de déplacement, frais de mission...'
                    className='min-h-[50px]'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Avantages en Nature */}
          <div className='grid grid-cols-1 gap-3 md:grid-cols-3'>
            <FormField
              control={form.control}
              name='salary.avantages.voiture'
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
                      Voiture de Fonction
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='salary.avantages.logement'
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
                      Logement de Fonction
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='salary.avantages.telephone'
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
                      Téléphone Professionnel
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />
          </div>

          <div className='grid grid-cols-1 gap-3 md:grid-cols-3'>
            <FormField
              control={form.control}
              name='salary.avantages.assurance_sante'
              render={({ field }) => (
                <FormItem className='flex flex-row items-start space-y-0 space-x-3 rounded-md border p-3'>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className='space-y-0.5 leading-none'>
                    <FormLabel className='text-xs'>Assurance Santé</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='salary.avantages.tickets_restaurant'
              render={({ field }) => (
                <FormItem className='flex flex-row items-start space-y-0 space-x-3 rounded-md border p-3'>
                  <FormControl>
                    {/*@ts-ignore*/}
                    <Checkbox checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className='space-y-0.5 leading-none'>
                    <FormLabel className='text-xs'>
                      Tickets Restaurant
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>


    </div>
  );
}
