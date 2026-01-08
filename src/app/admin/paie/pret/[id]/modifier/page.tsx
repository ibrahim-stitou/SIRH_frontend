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
import { PretSchema } from '../../pretSchema';
import { Skeleton } from '@/components/ui/skeleton';

type EmployeeSimple = {
  id: number | string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  matricule?: string;
};

const EditPretSchema = PretSchema.pick({
  employe_id: true,
  date_demande: true,
  montant_pret: true,
  duree_mois: true,
  taux_interet: true,
  type_pret: true,
  periode_paie_depart: true,
  description: true,
  date_debut_remboursement: true
});

type EditPretForm = z.infer<typeof EditPretSchema>;

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

const PRET_TYPES = [
  'Sans intérêt',
  'Avec intérêt',
  'Social',
  'Exceptionnel'
] as const;

export default function ModifierPretPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = useMemo(() => params?.id, [params]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [employees, setEmployees] = useState<EmployeeSimple[]>([]);

  const form = useForm<EditPretForm>({
    resolver: zodResolver(EditPretSchema),
    defaultValues: {
      employe_id: undefined as unknown as number,
      date_demande: undefined as unknown as string,
      montant_pret: 0,
      duree_mois: 12,
      taux_interet: 0,
      type_pret: 'Sans intérêt',
      periode_paie_depart: { mois: '', annee: new Date().getFullYear() },
      description: '',
      date_debut_remboursement: null
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

  // Charger le prêt existant
  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    async function load() {
      setInitialLoading(true);
      try {
        const res = await apiClient.get(apiRoutes.admin.prets.show(id));
        const d = res.data?.data || res.data;
        if (!cancelled && d) {
          form.reset({
            employe_id: d.employe_id,
            date_demande: d.date_demande,
            montant_pret: d.montant_pret,
            duree_mois: d.duree_mois,
            taux_interet: d.taux_interet,
            type_pret: d.type_pret,
            periode_paie_depart: d.periode_paie_depart,
            description: d.description || '',
            date_debut_remboursement: d.date_debut_remboursement || null
          });
        }
      } catch (e) {
        // ignore
      } finally {
        if (!cancelled) setInitialLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [form, id]);

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

  const onSubmit = async (values: EditPretForm) => {
    if (!id) return;
    setLoading(true);
    try {
      await apiClient.put(apiRoutes.admin.prets.update(id), values);
      router.push(`/admin/paie/pret/${id}/details`);
    } catch (e) {
      alert('Erreur lors de la mise à jour du prêt.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer scrollable>
      <div className='mx-auto w-full'>
        <Card className='w-full'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0'>
            <CardTitle>Modifier le prêt</CardTitle>
            <Button variant='ghost' size='sm' onClick={() => router.back()}>
              <ArrowLeft className='mr-2 h-4 w-4' /> Retour
            </Button>
          </CardHeader>
          <Separator />
          <CardContent className='pt-6'>
            {initialLoading ? (
              <div className='space-y-6'>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  {Array.from({ length: 8 }).map((_, i) => (
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

                    <div className='space-y-2'>
                      <label className='text-sm font-medium'>
                        Montant du prêt (MAD)
                      </label>
                      <Input
                        type='number'
                        min={0}
                        step='1'
                        value={form.watch('montant_pret') as any}
                        onChange={(e) =>
                          form.setValue('montant_pret', Number(e.target.value))
                        }
                      />
                      {form.formState.errors.montant_pret?.message && (
                        <p className='text-destructive text-xs'>
                          {form.formState.errors.montant_pret.message}
                        </p>
                      )}
                    </div>

                    <div className='space-y-2'>
                      <label className='text-sm font-medium'>
                        Durée (mois)
                      </label>
                      <Input
                        type='number'
                        min={1}
                        step='1'
                        value={form.watch('duree_mois') as any}
                        onChange={(e) =>
                          form.setValue('duree_mois', Number(e.target.value))
                        }
                      />
                      {form.formState.errors.duree_mois?.message && (
                        <p className='text-destructive text-xs'>
                          {form.formState.errors.duree_mois.message}
                        </p>
                      )}
                    </div>

                    <div className='space-y-2'>
                      <label className='text-sm font-medium'>
                        Taux d&lsquo;intérêt (%)
                      </label>
                      <Input
                        type='number'
                        min={0}
                        step='0.1'
                        value={form.watch('taux_interet') as any}
                        onChange={(e) =>
                          form.setValue('taux_interet', Number(e.target.value))
                        }
                      />
                    </div>

                    <SelectField
                      name='type_pret'
                      label='Type de prêt'
                      control={form.control as any}
                      options={PRET_TYPES.map((t) => ({ value: t, label: t }))}
                      required
                      placeholder='Sélectionner un type'
                      error={form.formState.errors.type_pret?.message as any}
                    />

                    <SelectField
                      name='periode_paie_depart.mois'
                      label='Mois de départ (paie)'
                      control={form.control as any}
                      options={MONTHS.map((m) => ({ value: m, label: m }))}
                      required
                      placeholder='Sélectionner un mois'
                      error={
                        (form.formState.errors.periode_paie_depart as any)?.mois
                          ?.message
                      }
                    />

                    <div className='space-y-2'>
                      <label className='text-sm font-medium'>
                        Année de départ
                      </label>
                      <Input
                        type='number'
                        min={2000}
                        max={2100}
                        value={form.watch('periode_paie_depart.annee') as any}
                        onChange={(e) =>
                          form.setValue(
                            'periode_paie_depart.annee',
                            Number(e.target.value)
                          )
                        }
                      />
                    </div>

                    <div className='space-y-2'>
                      <label className='text-sm font-medium'>
                        Date de début de remboursement (optionnel)
                      </label>
                      <DatePickerField
                        name='date_debut_remboursement'
                        value={form.watch('date_debut_remboursement') as any}
                        onChange={(d) =>
                          form.setValue('date_debut_remboursement', d)
                        }
                      />
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
                        router.push(`/admin/paie/pret/${id}/details`)
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
