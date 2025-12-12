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
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Percent, Calculator } from 'lucide-react';
import type { SimplifiedContractInput } from '@/validations/contract-simplified.schema';

interface CotisationsSocialesCardProps {
  form: UseFormReturn<SimplifiedContractInput>;
}

/**
 * Composant pour la configuration des cotisations sociales
 * Note: Ce composant n'est pas utilisé dans la création de contrat mais est disponible pour d'autres usages
 */
export function CotisationsSocialesCard({
  form
}: CotisationsSocialesCardProps) {
  return (
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
            Les taux peuvent être modifiés selon votre convention collective ou
            vos accords spécifiques. Les valeurs par défaut correspondent aux
            taux légaux marocains en vigueur.
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
                    Assurance Maladie Obligatoire - Couverture santé obligatoire
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
                    Caisse Marocaine des Retraites - Régime complémentaire privé
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
  );
}
