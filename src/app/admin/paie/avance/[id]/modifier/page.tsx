'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DatePickerField } from '@/components/custom/DatePickerField';
import { SelectField } from '@/components/custom/SelectField';
import { apiRoutes } from '@/config/apiRoutes';
import apiClient from '@/lib/api';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Save } from 'lucide-react';
import { Form } from '@/components/ui/form';
import { AvanceSchema } from '../../avanceSchema';
import { Skeleton } from '@/components/ui/skeleton';

type EmployeeSimple = {
  id: number | string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  matricule?: string;
};

const EditAvanceSchema = AvanceSchema.pick({
  employe_id: true,
  date_demande: true,
  periode_paie: true,
  description: true
}).extend({
  montant_avance: z
    .number({ required_error: "Le montant de l'avance est requis." })
    .positive("Le montant de l'avance doit être positif")
});

type EditAvanceForm = z.infer<typeof EditAvanceSchema>;

const MONTHS = [
  'Janvier',
  'Février',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Août',
  'Septembre',
  'Octobre',
  'Novembre',
  'Décembre'
];

export default function ModifierAvancePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = useMemo(() => params?.id, [params]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [employees, setEmployees] = useState<EmployeeSimple[]>([]);
  const [maxAvances, setMaxAvances] = useState<number | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);

  const form = useForm<EditAvanceForm>({
    resolver: zodResolver(EditAvanceSchema),
    defaultValues: {
      employe_id: undefined as unknown as number,
      date_demande: undefined as unknown as string,
      periode_paie: { mois: '', annee: new Date().getFullYear() },
      description: '',
      montant_avance: 0
    }
  });

  // Charger employés
  useEffect(() => {
    let cancelled = false;
    async function loadEmployees() {
      try {
        const res = await apiClient.get(apiRoutes.admin.employees.simpleList);
        const data: EmployeeSimple[] = res.data?.data || res.data || [];
        if (!cancelled) setEmployees(data);
      } catch (e) {
        try {
          const res = await apiClient.get(apiRoutes.admin.employees.list);
          const data: EmployeeSimple[] = res.data?.data || res.data || [];
          if (!cancelled) setEmployees(data);
        } catch {}
      }
    }
    loadEmployees();
    return () => {
      cancelled = true;
    };
  }, []);

  // Charger l'avance existante
  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    async function load() {
      setInitialLoading(true);
      try {
        const res = await apiClient.get(apiRoutes.admin.avances.show(id));
        const d = res.data?.data || res.data;
        if (!cancelled && d) {
          form.reset({
            employe_id: d.employe_id,
            date_demande: d.date_demande,
            periode_paie: d.periode_paie,
            description: d.description || '',
            montant_avance: d.montant_avance || 0
          });
        }
      } catch (e) {
        // fallback
      } finally {
        if (!cancelled) setInitialLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [id, form]);

  // Charger max avances
  useEffect(() => {
    let cancelled = false;
    async function loadParams() {
      try {
        const res = await apiClient.get(
          apiRoutes.admin.parametres.parametreMaxGeneral.list
        );
        const rows = res.data?.data || res.data || [];
        const first = Array.isArray(rows) && rows.length ? rows[0] : null;
        if (!cancelled)
          setMaxAvances(
            typeof first?.max_avances_par_an === 'number'
              ? first.max_avances_par_an
              : null
          );
      } catch (_) {}
    }
    loadParams();
    return () => {
      cancelled = true;
    };
  }, []);

  // Recalculer restantes
  const watchedEmpId = form.watch('employe_id') as any;
  const watchedDateDemande = form.watch('date_demande') as any;
  useEffect(() => {
    async function recompute() {
      const empId = watchedEmpId;
      const dateDemande = watchedDateDemande;
      if (!empId || !dateDemande || typeof maxAvances !== 'number') {
        setRemaining(null);
        return;
      }
      const year = new Date(dateDemande).getFullYear();
      try {
        const res = await apiClient.get(
          apiRoutes.admin.avances.countForEmployeeCurrentYear(empId)
        );
        const payload = res.data?.data || res.data;
        const countThisYear = payload?.count ?? 0;
        setRemaining(Math.max(0, maxAvances - countThisYear));
      } catch (_) {
        setRemaining(null);
      }
    }
    recompute();
  }, [form, watchedEmpId, watchedDateDemande, maxAvances]);

  const employeeOptions = useMemo(
    () =>
      employees.map((e) => ({
        id: e.id,
        label:
          e.fullName ||
          `${e.firstName ?? ''} ${e.lastName ?? ''}`.trim() ||
          String(e.id),
        matricule: e.matricule
      })),
    [employees]
  );

  const reachedMax = typeof remaining === 'number' && remaining <= 0;

  const onSubmit = async (values: EditAvanceForm) => {
    if (!id) return;
    setLoading(true);
    try {
      await apiClient.put(apiRoutes.admin.avances.update(id), values);
      router.push(`/admin/paie/avance/${id}/details`);
    } catch (e) {
      alert("Erreur lors de la mise à jour de l'avance.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer scrollable>
      <div className='mx-auto w-full'>
        <Card className='w-full'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0'>
            <CardTitle>Modifier l&apos;avance</CardTitle>
            <Button variant='ghost' size='sm' onClick={() => router.back()}>
              <ArrowLeft className='mr-2 h-4 w-4' /> Retour
            </Button>
          </CardHeader>
          <Separator />
          <CardContent className='pt-6'>
            {initialLoading ? (
              <div className='space-y-6'>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className='rounded-md border p-3'>
                      <Skeleton className='mb-2 h-3 w-24' />
                      <Skeleton className='h-5 w-40' />
                    </div>
                  ))}
                  <div className='md:col-span-2'>
                    <Skeleton className='mb-2 h-3 w-28' />
                    <Skeleton className='h-24 w-full' />
                  </div>
                </div>
                <div className='flex items-center justify-end gap-3'>
                  <Skeleton className='h-9 w-24' />
                  <Skeleton className='h-9 w-32' />
                </div>
              </div>
            ) : (
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className='space-y-6'
                >
                  <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                    <SelectField
                      name='employe_id'
                      label='Employé'
                      control={form.control as any}
                      options={employeeOptions}
                      displayField='label'
                      secondaryField='matricule'
                      required
                      placeholder='Sélectionner un employé'
                      error={form.formState.errors.employe_id?.message as any}
                    />

                    <div>
                      <DatePickerField
                        name='date_demande'
                        label='Date de la demande'
                        value={form.watch('date_demande') as any}
                        onChange={(d) => form.setValue('date_demande', d || '')}
                        required
                        error={
                          form.formState.errors.date_demande?.message || null
                        }
                      />
                    </div>

                    {typeof maxAvances === 'number' && (
                      <div
                        className={`rounded-md border px-3 py-2 text-sm md:col-span-2 ${reachedMax ? 'border-red-300 bg-red-50 text-red-700' : 'text-muted-foreground bg-muted/30'}`}
                      >
                        <span>
                          Nombre maximum d’avances par an:{' '}
                          <strong>{maxAvances}</strong>
                        </span>
                        {remaining !== null && (
                          <span className='ml-3'>
                            Reste à créer cette année:{' '}
                            <strong
                              className={`${reachedMax ? 'text-red-800' : ''}`}
                            >
                              {remaining}
                            </strong>
                          </span>
                        )}
                      </div>
                    )}

                    <SelectField
                      name='periode_paie.mois'
                      label='Mois de paie'
                      control={form.control as any}
                      options={MONTHS.map((m) => ({ value: m, label: m }))}
                      required
                      placeholder='Sélectionner un mois'
                      error={
                        (form.formState.errors.periode_paie as any)?.mois
                          ?.message
                      }
                    />

                    <div className='space-y-2'>
                      <label className='text-sm font-medium'>
                        Année de paie
                      </label>
                      <Input
                        type='number'
                        min={2000}
                        max={2100}
                        value={form.watch('periode_paie.annee')}
                        onChange={(e) =>
                          form.setValue(
                            'periode_paie.annee',
                            Number(e.target.value)
                          )
                        }
                      />
                    </div>

                    <div className='space-y-2'>
                      <label className='text-sm font-medium'>
                        Montant avance (MAD)
                      </label>
                      <Input
                        type='number'
                        min={0}
                        step='0.01'
                        value={form.watch('montant_avance')}
                        onChange={(e) =>
                          form.setValue(
                            'montant_avance',
                            Number(e.target.value)
                          )
                        }
                      />
                      {form.formState.errors.montant_avance?.message && (
                        <p className='text-destructive text-xs'>
                          {form.formState.errors.montant_avance.message}
                        </p>
                      )}
                    </div>

                    <div className='space-y-2 md:col-span-2'>
                      <label className='text-sm font-medium'>Description</label>
                      <Textarea
                        placeholder='Ajouter une note (facultatif)'
                        value={form.watch('description') || ''}
                        onChange={(e) =>
                          form.setValue('description', e.target.value)
                        }
                        rows={4}
                      />
                    </div>
                  </div>

                  <div className='flex items-center justify-end gap-3'>
                    <Button
                      type='button'
                      variant='outline'
                      onClick={() =>
                        router.push(`/admin/paie/avance/${id}/details`)
                      }
                    >
                      Annuler
                    </Button>
                    <Button type='submit' disabled={loading}>
                      <Save className='mr-2 h-4 w-4' /> Enregistrer
                    </Button>
                  </div>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
