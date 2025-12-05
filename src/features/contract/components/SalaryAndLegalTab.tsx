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
  Shield,
  Percent,
  Calculator,
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

  // Watch for changes in salary components to auto-calculate brut and net
  const salaryValues = form.watch('salary');
  const legalValues = form.watch('legal');

  // Field array for dynamic primes
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'salary.primes.items' as any
  });

  // Watch prime items to auto-apply properties when type changes
  useEffect(() => {
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

  // Auto-calculate salaire brut and net
  useEffect(() => {
    const baseSalary = salaryValues?.base_salary || 0;

    // Calculate primes with distinction between taxable and non-taxable
    let totalPrimes = 0;
    let totalPrimesImposables = 0;
    let totalPrimesSoumisesCNSS = 0;

    // Old format primes (for backward compatibility)
    const primeTransport = salaryValues?.primes?.prime_transport || 0;
    const primeResponsabilite = salaryValues?.primes?.prime_responsabilite || 0;
    const primePerformance = salaryValues?.primes?.prime_performance || 0;
    const primePanier = salaryValues?.primes?.prime_panier || 0;
    const autresPrimes = salaryValues?.primes?.autres_primes || 0;

    totalPrimes +=
      primeTransport +
      primeResponsabilite +
      primePerformance +
      primePanier +
      autresPrimes;

    // New format: dynamic primes with taxability
    const primeItems = (salaryValues?.primes as any)?.items || [];

    primeItems.forEach((prime: any, index: number) => {
      const amount = prime.amount || 0;
      console.log(`Prime ${index}:`, {
        label: prime.label,
        amount,
        is_taxable: prime.is_taxable,
        is_subject_to_cnss: prime.is_subject_to_cnss
      });

      totalPrimes += amount;

      // Vérifier explicitement si la prime est imposable
      if (prime.is_taxable === true) {
        totalPrimesImposables += amount;
        console.log(`  → Ajouté aux primes imposables: ${amount} MAD`);
      } else {
        console.log(`  → Prime NON imposable (exonérée d'IR)`);
      }

      // Vérifier si soumise aux cotisations
      if (prime.is_subject_to_cnss === true) {
        totalPrimesSoumisesCNSS += amount;
        console.log(`  → Ajouté aux primes soumises CNSS: ${amount} MAD`);
      } else {
        console.log(`  → Prime NON soumise aux cotisations`);
      }
    });

    console.log('📊 Totaux calculés:', {
      totalPrimes,
      totalPrimesImposables,
      totalPrimesSoumisesCNSS
    });

    // Salaire brut total = salaire de base + toutes les primes
    const salaireBrut = baseSalary + totalPrimes;

    // Base de calcul CNSS = salaire de base + primes soumises à CNSS
    const baseCNSS = baseSalary + totalPrimesSoumisesCNSS;

    console.log('💰 Bases de calcul:', {
      baseSalary,
      salaireBrut,
      baseCNSS
    });

    // Get cotisation rates
    const cotisations = (legalValues as any)?.cotisations || {};
    const cnssEmployePct = cotisations.cnss_employe_pct || 4.48;
    const amoEmployePct = cotisations.amo_employe_pct || 2.26;
    const cmirTauxPct = cotisations.cmir_taux_pct || 0;
    const rcarTauxPct = cotisations.rcar_taux_pct || 0;

    // Calculate social contributions (employee part only for net salary)
    let cotisationsEmploye = 0;
    const detailCotisations: any = {};

    if (legalValues?.cnss_affiliation) {
      const cnss = (baseCNSS * cnssEmployePct) / 100;
      cotisationsEmploye += cnss;
      detailCotisations.cnss = cnss;
    }

    if (legalValues?.amo_affiliation) {
      const amo = (baseCNSS * amoEmployePct) / 100;
      cotisationsEmploye += amo;
      detailCotisations.amo = amo;
    }

    if ((legalValues as any)?.cmir_affiliation) {
      const cmir = (baseCNSS * cmirTauxPct) / 100;
      cotisationsEmploye += cmir;
      detailCotisations.cmir = cmir;
    }

    if ((legalValues as any)?.rcar_affiliation) {
      const rcar = (baseCNSS * rcarTauxPct) / 100;
      cotisationsEmploye += rcar;
      detailCotisations.rcar = rcar;
    }

    console.log('📉 Cotisations employé:', {
      detail: detailCotisations,
      total: cotisationsEmploye
    });

    // Calcul de l'IR
    // Base imposable = salaire de base + primes imposables - cotisations
    const baseImposable =
      baseSalary + totalPrimesImposables - cotisationsEmploye;

    console.log('🧮 Base imposable IR:', {
      baseSalary,
      totalPrimesImposables,
      cotisationsEmploye,
      baseImposable
    });

    let ir = 0;
    if (legalValues?.ir_applicable && baseImposable > 0) {
      // Barème progressif marocain (annuel divisé par 12 pour mensuel)
      const annuelImposable = baseImposable * 12;

      if (annuelImposable <= 30000) {
        ir = 0;
      } else if (annuelImposable <= 50000) {
        ir = ((annuelImposable - 30000) * 0.1) / 12;
      } else if (annuelImposable <= 60000) {
        ir = (20000 * 0.1 + (annuelImposable - 50000) * 0.2) / 12;
      } else if (annuelImposable <= 80000) {
        ir = (20000 * 0.1 + 10000 * 0.2 + (annuelImposable - 60000) * 0.3) / 12;
      } else if (annuelImposable <= 180000) {
        ir =
          (20000 * 0.1 +
            10000 * 0.2 +
            20000 * 0.3 +
            (annuelImposable - 80000) * 0.34) /
          12;
      } else {
        ir =
          (20000 * 0.1 +
            10000 * 0.2 +
            20000 * 0.3 +
            100000 * 0.34 +
            (annuelImposable - 180000) * 0.38) /
          12;
      }

      console.log('💸 IR calculé:', {
        annuelImposable,
        irMensuel: ir
      });
    } else {
      console.log('❌ IR non applicable ou base négative');
    }

    // Salaire net = Salaire brut - cotisations - IR
    const salaireNet = salaireBrut - cotisationsEmploye - ir;

    console.log('✅ RÉSULTAT FINAL:', {
      salaireBrut: salaireBrut.toFixed(2),
      cotisationsEmploye: cotisationsEmploye.toFixed(2),
      ir: ir.toFixed(2),
      salaireNet: salaireNet.toFixed(2)
    });
    console.log('═══════════════════════════════════════');

    // Always update to ensure calculation is triggered
    const newBrut = parseFloat(salaireBrut.toFixed(2));
    const newNet = parseFloat(salaireNet.toFixed(2));

    if (salaryValues?.salary_brut !== newBrut) {
      form.setValue('salary.salary_brut', newBrut, { shouldValidate: false });
    }
    if (salaryValues?.salary_net !== newNet) {
      form.setValue('salary.salary_net', newNet, { shouldValidate: false });
    }
  }, [
    // Dépendances stringifiées pour détecter les changements profonds
    JSON.stringify(salaryValues),
    JSON.stringify(legalValues),
    form
  ]);

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
          {/* Ligne 1: Salaire base, brut, net */}
          <div className='grid grid-cols-1 gap-3 md:grid-cols-3'>
            <FormField
              control={form.control}
              name='salary.base_salary'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='flex items-center gap-2 text-xs'>
                    Salaire de Base (MAD) *
                  </FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      placeholder='5000'
                      className='h-9'
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value))
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='salary.salary_brut'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-xs'>Salaire Brut (MAD)</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      placeholder='Calculé automatiquement'
                      className='bg-muted h-9'
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value))
                      }
                      disabled
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
                  <FormLabel className='text-xs'>Salaire Net (MAD)</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      placeholder='Calculé automatiquement'
                      className='bg-muted h-9'
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value))
                      }
                      disabled
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Récapitulatif du Calcul */}
          {salaryValues?.salary_brut && salaryValues?.salary_brut > 0 ? (
            <Alert className='bg-primary/5 border-primary/20'>
              <Calculator className='h-4 w-4' />
              <AlertDescription>
                <div className='space-y-1 text-xs'>
                  <div className='mb-2 font-semibold'>Détail du Calcul:</div>
                  <div className='grid grid-cols-2 gap-x-4 gap-y-1'>
                    <span>Salaire de base:</span>
                    <span className='text-right font-medium'>
                      {(salaryValues?.base_salary || 0).toFixed(2)} MAD
                    </span>
                    <span>+ Primes totales:</span>
                    <span className='text-right font-medium'>
                      {(() => {
                        const primeItems =
                          (salaryValues?.primes as any)?.items || [];
                        const total = primeItems.reduce(
                          (sum: number, p: any) => sum + (p.amount || 0),
                          0
                        );
                        return total.toFixed(2);
                      })()}{' '}
                      MAD
                    </span>
                    <span className='font-semibold'>= Salaire Brut:</span>
                    <span className='text-right font-semibold'>
                      {salaryValues.salary_brut.toFixed(2)} MAD
                    </span>
                    <span className='text-destructive'>
                      - Cotisations employé:
                    </span>
                    <span className='text-destructive text-right'>
                      {(() => {
                        const baseSalary = salaryValues?.base_salary || 0;
                        const primeItems =
                          (salaryValues?.primes as any)?.items || [];
                        const primesSoumisesCNSS = primeItems
                          .filter((p: any) => p.is_subject_to_cnss)
                          .reduce(
                            (sum: number, p: any) => sum + (p.amount || 0),
                            0
                          );
                        const baseCNSS = baseSalary + primesSoumisesCNSS;
                        const cotisations =
                          (legalValues as any)?.cotisations || {};
                        let total = 0;
                        if (legalValues?.cnss_affiliation)
                          total +=
                            (baseCNSS *
                              (cotisations.cnss_employe_pct || 4.48)) /
                            100;
                        if (legalValues?.amo_affiliation)
                          total +=
                            (baseCNSS * (cotisations.amo_employe_pct || 2.26)) /
                            100;
                        if ((legalValues as any)?.cmir_affiliation)
                          total +=
                            (baseCNSS * (cotisations.cmir_taux_pct || 0)) / 100;
                        if ((legalValues as any)?.rcar_affiliation)
                          total +=
                            (baseCNSS * (cotisations.rcar_taux_pct || 0)) / 100;
                        return total.toFixed(2);
                      })()}{' '}
                      MAD
                    </span>
                    <span className='text-destructive'>- IR:</span>
                    <span className='text-destructive text-right'>
                      {(
                        (salaryValues.salary_brut || 0) -
                        (salaryValues.salary_net || 0) -
                        (() => {
                          const baseSalary = salaryValues?.base_salary || 0;
                          const primeItems =
                            (salaryValues?.primes as any)?.items || [];
                          const primesSoumisesCNSS = primeItems
                            .filter((p: any) => p.is_subject_to_cnss)
                            .reduce(
                              (sum: number, p: any) => sum + (p.amount || 0),
                              0
                            );
                          const baseCNSS = baseSalary + primesSoumisesCNSS;
                          const cotisations =
                            (legalValues as any)?.cotisations || {};
                          let total = 0;
                          if (legalValues?.cnss_affiliation)
                            total +=
                              (baseCNSS *
                                (cotisations.cnss_employe_pct || 4.48)) /
                              100;
                          if (legalValues?.amo_affiliation)
                            total +=
                              (baseCNSS *
                                (cotisations.amo_employe_pct || 2.26)) /
                              100;
                          if ((legalValues as any)?.cmir_affiliation)
                            total +=
                              (baseCNSS * (cotisations.cmir_taux_pct || 0)) /
                              100;
                          if ((legalValues as any)?.rcar_affiliation)
                            total +=
                              (baseCNSS * (cotisations.rcar_taux_pct || 0)) /
                              100;
                          return total;
                        })()
                      ).toFixed(2)}{' '}
                      MAD
                    </span>
                    <span className='font-semibold text-green-600'>
                      = Salaire Net à payer:
                    </span>
                    <span className='text-right text-base font-semibold text-green-600'>
                      {(salaryValues.salary_net || 0).toFixed(2)} MAD
                    </span>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          ):("")}

          {/* Ligne 2: Devise, Méthode de paiement, Périodicité */}
          <div className='grid grid-cols-1 gap-3 md:grid-cols-3'>
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

            <FormField
              control={form.control}
              name='salary.periodicity'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-xs'>Périodicité</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Mensuel'
                      className='h-9'
                      {...field}
                      value={field.value || 'Mensuel'}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Section Primes Dynamiques */}
          <div className='mt-4 space-y-3'>
            <div className='flex items-center justify-between'>
              <div>
                <h4 className='text-sm font-semibold'>Primes et Indemnités</h4>
                <p className='text-muted-foreground text-xs'>
                  Ajoutez des primes avec indication si elles sont imposables ou
                  soumises aux cotisations
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

      {/* Cotisations Sociales */}
      <Card>
        <CardHeader className='pb-3'>
          <CardTitle className='flex items-center gap-2 text-base'>
            <Percent className='h-4 w-4' />
            Cotisations Sociales
          </CardTitle>
          <CardDescription className='text-xs'>
            Configuration des taux de cotisations employeur et employé
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <Alert>
            <Calculator className='h-4 w-4' />
            <AlertDescription className='text-xs'>
              Les taux peuvent être modifiés selon votre convention collective
              ou vos accords spécifiques. Les valeurs par défaut correspondent
              aux taux légaux marocains en vigueur.
            </AlertDescription>
          </Alert>

          {/* CNSS Configuration */}
          <div className='space-y-3'>
            <FormField
              control={form.control}
              name='legal.cnss_affiliation'
              render={({ field }) => (
                <FormItem className='flex flex-row items-start space-y-0 space-x-3'>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className='flex-1 space-y-2'>
                    <FormLabel className='text-sm font-semibold'>
                      Affiliation CNSS
                    </FormLabel>
                    <FormDescription className='text-xs'>
                      Caisse Nationale de Sécurité Sociale - Obligatoire pour le
                      secteur privé
                    </FormDescription>

                    {field.value && (
                      <div className='bg-muted/50 mt-2 grid grid-cols-1 gap-3 rounded-md p-3 md:grid-cols-2'>
                        <FormField
                          control={form.control}
                          name={'legal.cotisations.cnss_employe_pct' as any}
                          render={({ field: pctField }) => (
                            <FormItem>
                              <FormLabel className='text-xs'>
                                Part Employé (%)
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type='number'
                                  step='0.01'
                                  placeholder='4.48'
                                  className='h-9'
                                  value={pctField.value || 4.48}
                                  onChange={(e) =>
                                    pctField.onChange(
                                      e.target.value
                                        ? parseFloat(e.target.value)
                                        : 4.48
                                    )
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={'legal.cotisations.cnss_employeur_pct' as any}
                          render={({ field: pctField }) => (
                            <FormItem>
                              <FormLabel className='text-xs'>
                                Part Employeur (%)
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type='number'
                                  step='0.01'
                                  placeholder='8.98'
                                  className='h-9'
                                  value={pctField.value || 8.98}
                                  onChange={(e) =>
                                    pctField.onChange(
                                      e.target.value
                                        ? parseFloat(e.target.value)
                                        : 8.98
                                    )
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                  </div>
                </FormItem>
              )}
            />
          </div>

          {/* AMO Configuration */}
          <div className='space-y-3'>
            <FormField
              control={form.control}
              name='legal.amo_affiliation'
              render={({ field }) => (
                <FormItem className='flex flex-row items-start space-y-0 space-x-3'>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className='flex-1 space-y-2'>
                    <FormLabel className='text-sm font-semibold'>
                      Affiliation AMO
                    </FormLabel>
                    <FormDescription className='text-xs'>
                      Assurance Maladie Obligatoire - Couverture santé
                      obligatoire
                    </FormDescription>

                    {field.value && (
                      <div className='bg-muted/50 mt-2 grid grid-cols-1 gap-3 rounded-md p-3 md:grid-cols-2'>
                        <FormField
                          control={form.control}
                          name={'legal.cotisations.amo_employe_pct' as any}
                          render={({ field: pctField }) => (
                            <FormItem>
                              <FormLabel className='text-xs'>
                                Part Employé (%)
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type='number'
                                  step='0.01'
                                  placeholder='2.26'
                                  className='h-9'
                                  value={pctField.value || 2.26}
                                  onChange={(e) =>
                                    pctField.onChange(
                                      e.target.value
                                        ? parseFloat(e.target.value)
                                        : 2.26
                                    )
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={'legal.cotisations.amo_employeur_pct' as any}
                          render={({ field: pctField }) => (
                            <FormItem>
                              <FormLabel className='text-xs'>
                                Part Employeur (%)
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type='number'
                                  step='0.01'
                                  placeholder='2.26'
                                  className='h-9'
                                  value={pctField.value || 2.26}
                                  onChange={(e) =>
                                    pctField.onChange(
                                      e.target.value
                                        ? parseFloat(e.target.value)
                                        : 2.26
                                    )
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                  </div>
                </FormItem>
              )}
            />
          </div>

          {/* CMIR Configuration */}
          <div className='space-y-3'>
            <FormField
              control={form.control}
              name={'legal.cmir_affiliation' as any}
              render={({ field }) => (
                <FormItem className='flex flex-row items-start space-y-0 space-x-3'>
                  <FormControl>
                    <Checkbox
                      checked={!!field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className='flex-1 space-y-2'>
                    <FormLabel className='text-sm font-semibold'>
                      Affiliation CMIR
                    </FormLabel>
                    <FormDescription className='text-xs'>
                      Caisse Marocaine des Retraites - Régime complémentaire
                      privé
                    </FormDescription>

                    {field.value && (
                      <div className='bg-muted/50 mt-2 grid grid-cols-1 gap-3 rounded-md p-3 md:grid-cols-2'>
                        <FormField
                          control={form.control}
                          name={'legal.cotisations.cmir_taux_pct' as any}
                          render={({ field: pctField }) => (
                            <FormItem>
                              <FormLabel className='text-xs'>
                                Taux de Cotisation (%)
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type='number'
                                  step='0.01'
                                  placeholder='6.00'
                                  className='h-9'
                                  value={pctField.value || 6.0}
                                  onChange={(e) =>
                                    pctField.onChange(
                                      e.target.value
                                        ? parseFloat(e.target.value)
                                        : 6.0
                                    )
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={'legal.cotisations.cmir_numero' as any}
                          render={({ field: numField }) => (
                            <FormItem>
                              <FormLabel className='text-xs'>
                                Numéro d&apos;affiliation CMIR
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder='Ex: CMIR123456'
                                  className='h-9'
                                  value={numField.value || ''}
                                  onChange={numField.onChange}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                  </div>
                </FormItem>
              )}
            />
          </div>

          {/* RCAR Configuration */}
          <div className='space-y-3'>
            <FormField
              control={form.control}
              name={'legal.rcar_affiliation' as any}
              render={({ field }) => (
                <FormItem className='flex flex-row items-start space-y-0 space-x-3'>
                  <FormControl>
                    <Checkbox
                      checked={!!field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className='flex-1 space-y-2'>
                    <FormLabel className='text-sm font-semibold'>
                      Affiliation RCAR
                    </FormLabel>
                    <FormDescription className='text-xs'>
                      Régime Collectif d&apos;Allocation de Retraite - Pour le
                      secteur public et semi-public
                    </FormDescription>

                    {field.value && (
                      <div className='bg-muted/50 mt-2 grid grid-cols-1 gap-3 rounded-md p-3 md:grid-cols-2'>
                        <FormField
                          control={form.control}
                          name={'legal.cotisations.rcar_taux_pct' as any}
                          render={({ field: pctField }) => (
                            <FormItem>
                              <FormLabel className='text-xs'>
                                Taux de Cotisation (%)
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type='number'
                                  step='0.01'
                                  placeholder='20.00'
                                  className='h-9'
                                  value={pctField.value || 20.0}
                                  onChange={(e) =>
                                    pctField.onChange(
                                      e.target.value
                                        ? parseFloat(e.target.value)
                                        : 20.0
                                    )
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={'legal.cotisations.rcar_numero' as any}
                          render={({ field: numField }) => (
                            <FormItem>
                              <FormLabel className='text-xs'>
                                Numéro d&apos;affiliation RCAR
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder='Ex: RCAR789012'
                                  className='h-9'
                                  value={numField.value || ''}
                                  onChange={numField.onChange}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                  </div>
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Aspects Légaux */}
      <Card>
        <CardHeader className='pb-3'>
          <CardTitle className='flex items-center gap-2 text-base'>
            <Shield className='h-4 w-4' />
            Aspects Légaux et Conformité
          </CardTitle>
          <CardDescription className='text-xs'>
            Conformité au Code du Travail marocain
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-3'>
          {/* Ligne 1: IR et autres obligations */}
          <div className='grid grid-cols-1 gap-3 md:grid-cols-3'>
            <FormField
              control={form.control}
              name='legal.ir_applicable'
              render={({ field }) => (
                <FormItem className='flex flex-row items-start space-y-0 space-x-3 rounded-md border p-3'>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className='space-y-0.5 leading-none'>
                    <FormLabel className='text-xs'>IR Applicable</FormLabel>
                    <FormDescription className='mt-1 text-xs'>
                      Impôt sur le Revenu
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={'legal.mutuelle_affiliation' as any}
              render={({ field }) => (
                <FormItem className='flex flex-row items-start space-y-0 space-x-3 rounded-md border p-3'>
                  <FormControl>
                    <Checkbox
                      checked={!!field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className='space-y-0.5 leading-none'>
                    <FormLabel className='text-xs'>
                      Affiliation Mutuelle
                    </FormLabel>
                    <FormDescription className='mt-1 text-xs'>
                      Complémentaire santé
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={'legal.assurance_groupe' as any}
              render={({ field }) => (
                <FormItem className='flex flex-row items-start space-y-0 space-x-3 rounded-md border p-3'>
                  <FormControl>
                    <Checkbox
                      checked={!!field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className='space-y-0.5 leading-none'>
                    <FormLabel className='text-xs'>Assurance Groupe</FormLabel>
                    <FormDescription className='mt-1 text-xs'>
                      Couverture collective
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </div>

          {/* Ligne 2: Clauses contractuelles */}
          <div className='grid grid-cols-1 gap-3 md:grid-cols-3'>
            <FormField
              control={form.control}
              name='legal.clause_confidentialite'
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
                      Clause Confidentialité
                    </FormLabel>
                    <FormDescription className='mt-1 text-xs'>
                      Protection des informations
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='legal.clause_non_concurrence'
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
                      Clause Non-Concurrence
                    </FormLabel>
                    <FormDescription className='mt-1 text-xs'>
                      Limitation après départ
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={'legal.clause_mobilite' as any}
              render={({ field }) => (
                <FormItem className='flex flex-row items-start space-y-0 space-x-3 rounded-md border p-3'>
                  <FormControl>
                    <Checkbox
                      checked={!!field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className='space-y-0.5 leading-none'>
                    <FormLabel className='text-xs'>
                      Clause de Mobilité
                    </FormLabel>
                    <FormDescription className='mt-1 text-xs'>
                      Changement de lieu de travail
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </div>

          {/* Périodes et durées */}
          <div className='grid grid-cols-1 gap-3 md:grid-cols-3'>
            <FormField
              control={form.control}
              name={'legal.duree_preavis_jours' as any}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-xs'>
                    Durée de Préavis (jours)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      placeholder='30'
                      className='h-9'
                      value={field.value || ''}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? parseInt(e.target.value) : undefined
                        )
                      }
                    />
                  </FormControl>
                  <FormDescription className='text-xs'>
                    Période de préavis en jours
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={'legal.indemnite_depart' as any}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-xs'>
                    Indemnité de Départ (MAD)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      placeholder='0'
                      className='h-9'
                      value={field.value || ''}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value
                            ? parseFloat(e.target.value)
                            : undefined
                        )
                      }
                    />
                  </FormControl>
                  <FormDescription className='text-xs'>
                    Montant prévu en cas de départ
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Conditions spéciales et notes légales */}
          <div className='grid grid-cols-2 gap-3'>
            <FormField
              control={form.control}
              name='legal.conditions_speciales'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-xs'>
                    Conditions Spéciales
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Ex: Clause de mobilité, heures supplémentaires...'
                      className='min-h-[50px]'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='legal.notes_legales'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-xs'>Notes Légales</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Remarques juridiques supplémentaires...'
                      className='min-h-[50px]'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
