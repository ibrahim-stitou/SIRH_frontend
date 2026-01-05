'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { createFrais, updateFrais, getFrais } from '@/services/frais';
import type { NoteDeFrais, FraisLine } from '@/types/frais';
import { noteDeFraisSchema } from '@/schemas/frais';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
import apiClient from '@/lib/api';
import { apiRoutes } from '@/config/apiRoutes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import PageContainer from '@/components/layout/page-container';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { DatePickerField } from '@/components/custom/DatePickerField';
import { SelectField } from '@/components/custom/SelectField';
import { ArrowLeft } from 'lucide-react';
import { Heading } from '@/components/ui/heading';


function defaultLine(): FraisLine {
  return {
    id: Date.now(),
    date: new Date().toISOString().slice(0, 10),
    category: 'Transport',
    amount: 0,
    attachments: [],
    transportMode: null,
    route: null
  } as FraisLine;
}

export default function FraisForm({ id }: { id?: number }) {
  const [error, setError] = React.useState<string | null>(null);
  const [employees, setEmployees] = React.useState<{ label: string; id: number }[]>([]);

  const form = useForm<NoteDeFrais>({
    resolver: zodResolver(noteDeFraisSchema),
    defaultValues: {
      id: id,
      employeeId: undefined as any,
      matricule: '',
      status: 'draft',
      subject: '',
      startDate: '',
      endDate: '',
      total: 0,
      lines: [defaultLine()],
      history: []
    },
    mode: 'onBlur'
  });

  const { control, handleSubmit, setValue } = form;
  const { fields, append, replace } = useFieldArray({ name: 'lines', control });
const router = useRouter();
  React.useEffect(() => {
    let mounted = true;
    apiClient.get(apiRoutes.admin.employees.simpleList).then((res) => {
      const opts = (res.data?.data || []).map((e: any) => ({
        label: `${e.firstName} ${e.lastName}${e.matricule ? ' — ' + e.matricule : ''}`,
        id: e.id
      }));
      if (mounted) setEmployees(opts);
    }).catch(() => void 0);

    if (id) {
      getFrais(id).then((data) => {
        setValue('id', data.id);
        setValue('employeeId', data.employeeId as any);
        setValue('matricule', data.matricule);
        setValue('status', data.status);
        setValue('subject', data.subject);
        setValue('startDate', data.startDate);
        setValue('endDate', data.endDate);
        setValue('total', data.total);
        if (Array.isArray(data.lines)) {
          replace(data.lines as any);
        }
      }).catch((e) => setError(String(e?.message || e)));
    }
    return () => { mounted = false; };
  }, [id, setValue, replace]);

  async function onSubmit(values: NoteDeFrais) {
    setError(null);
    try {
      if (!id) await createFrais(values);
      else await updateFrais(id, values);
    } catch (e: any) {
      setError(e.message);
    }
  }

  return (
    <PageContainer>
      <div className='mx-auto w-full py-6'>
        <div className='flex items-center justify-between mb-6'>
          <Heading
            title={id ? 'Modifier la note de frais' : 'Nouvelle note de frais'}
            description={id ? 'Modifiez la note de frais existante.' : 'Créez une note de frais avec vos déplacements et justificatifs.'}
          />
          <Button variant='outline' onClick={() => router.push('/admin/paie/frais')}>
            <ArrowLeft className='mr-2 h-4 w-4' />
            Retour à la liste
          </Button>
        </div>
        <Card className='w-full'>
          <CardHeader>
            <div className='flex w-full flex-col gap-3 md:flex-row md:items-center md:justify-between'>
              <div>
                <CardTitle className='text-lg leading-tight font-semibold md:text-xl'>
                  Note de frais
                </CardTitle>
                <CardDescription className='text-muted-foreground mt-1'>
                  Créez et gérez une note de frais avec ses lignes
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
                  <FormField
                    control={control}
                    name='employeeId'
                    render={() => (
                      <FormItem>
                        <FormLabel>Employé *</FormLabel>
                        <FormControl>
                          <SelectField<NoteDeFrais, 'employeeId'>
                            name='employeeId'
                            control={control}
                            options={employees}
                            placeholder='Sélectionner un employé'
                            required
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name='subject'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Objet *</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Removed currency input: always MAD */}

                  <FormField
                    control={control}
                    name='startDate'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date début *</FormLabel>
                        <FormControl>
                          <DatePickerField
                            name='startDate'
                            value={field.value}
                            onChange={(val) => field.onChange(val)}
                            required
                            placeholder='Sélectionner la date début'
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name='endDate'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date fin *</FormLabel>
                        <FormControl>
                          <DatePickerField
                            name='endDate'
                            value={field.value}
                            onChange={(val) => field.onChange(val)}
                            required
                            placeholder='Sélectionner la date fin'
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className='flex items-center justify-between'>
                  <h4 className='text-base font-semibold'>Lignes de frais</h4>
                  <Button type='button' variant='outline' onClick={() => append(defaultLine())}>Ajouter une ligne</Button>
                </div>

                <div className='space-y-3'>
                  {fields.map((field, index) => (
                    <div key={field.id} className='rounded-md border p-3 grid grid-cols-1 gap-4 md:grid-cols-6'>
                      {/* Date */}
                      <FormField
                        control={control}
                        name={`lines.${index}.date` as const}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date</FormLabel>
                            <FormControl>
                              <DatePickerField
                                name={`lines.${index}.date`}
                                value={field.value}
                                onChange={(val) => field.onChange(val)}
                                placeholder='Sélectionner une date'
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Catégorie */}
                      <FormField
                        control={control}
                        name={`lines.${index}.category` as const}
                        render={() => (
                          <FormItem className='md:col-span-2'>
                            <FormLabel>Catégorie</FormLabel>
                            <FormControl>
                              <SelectField<Record<string, any>, string>
                                name={`lines.${index}.category` as const}
                                control={control as any}
                                options={[
                                  { label: 'Transport', value: 'Transport' },
                                  { label: 'Restauration', value: 'Restauration' },
                                  { label: 'Hôtel', value: 'Hôtel' },
                                  { label: 'Autre', value: 'Autre' }
                                ]}
                                placeholder='Sélectionner une catégorie'
                                required
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Montant */}
                      <FormField
                        control={control}
                        name={`lines.${index}.amount` as const}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Montant</FormLabel>
                            <FormControl>
                              <Input type='number' {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Removed currency per line: defaults to MAD in schema */}

                      {/* Commentaire */}
                      <FormField
                        control={control}
                        name={`lines.${index}.comment` as const}
                        render={({ field }) => (
                          <FormItem className='md:col-span-3'>
                            <FormLabel>Commentaire</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  ))}
                </div>

                <div className='flex justify-end'>
                  <Button type='submit'>Enregistrer</Button>
                </div>

                {error && <div className='text-red-600 text-sm'>{error}</div>}
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
