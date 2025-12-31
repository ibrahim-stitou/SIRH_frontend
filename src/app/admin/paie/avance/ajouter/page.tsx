'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { ArrowLeft, PlusCircle, Save } from 'lucide-react';
import { Form } from '@/components/ui/form';
import { AvanceSchema } from '../avanceSchema';

type EmployeeSimple = {
  id: number | string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  matricule?: string;
};

// Construire le schéma de création à partir de AvanceSchema
const CreateAvanceSchema = AvanceSchema.pick({
  employe_id: true,
  date_demande: true,
  periode_paie: true
}).extend({
  description: z.string().optional(),
  montant_avance: z
    .number({ required_error: "Le montant de l'avance est requis." })
    .positive("Le montant de l'avance doit être positif")
});

type CreateAvanceForm = z.infer<typeof CreateAvanceSchema>;

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

export default function AjouterAvancePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<EmployeeSimple[]>([]);

  const current = useMemo(() => new Date(), []);

  const form = useForm<CreateAvanceForm>({
    resolver: zodResolver(CreateAvanceSchema),
    defaultValues: {
      employe_id: undefined as unknown as number,
      date_demande: undefined as unknown as string,
      periode_paie: {
        mois: MONTHS[current.getMonth()],
        annee: current.getFullYear()
      },
      description: '',
      montant_avance: 0
    }
  });

  // Charger la liste des employés
  useEffect(() => {
    let cancelled = false;
    async function loadEmployees() {
      try {
        const res = await apiClient.get(apiRoutes.admin.employees.simpleList);
        const data: EmployeeSimple[] = res.data?.data || res.data || [];
        if (!cancelled) setEmployees(data);
      } catch (e) {
        // Fallback sur /employees si simpleList indisponible
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

  const employeeOptions = useMemo(
    () =>
      employees.map((e) => ({
        id: e.id,
        label:
          e.fullName || `${e.firstName ?? ''} ${e.lastName ?? ''}`.trim() || String(e.id),
        matricule: e.matricule
      })),
    [employees]
  );

  const onSubmit = async (values: CreateAvanceForm) => {
    setLoading(true);
    try {
      const payload = {
        ...values,
        statut: 'Brouillon',
        creer_par: 1 // mock: utilisateur courant
      } as any;
      const res = await apiClient.post(apiRoutes.admin.avances.create, payload);
      const created = res.data?.data || res.data;
      // Rediriger vers la page détails si possible
      if (created?.id) {
        router.push(`/admin/paie/avance/${created.id}/details`);
      } else {
        router.push('/admin/paie/avance');
      }
    } catch (e) {
      // simple fallback UX
      alert("Erreur lors de l'enregistrement de l'avance.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer scrollable={true}>
      <div className='w-full mx-auto'>
        <Card className='w-full'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0'>
            <CardTitle className='flex items-center gap-2'>
              <PlusCircle className='h-5 w-5 text-primary' />
              Nouvelle demande d&apos;avance
            </CardTitle>
            <Button variant='ghost' size='sm' onClick={() => router.back()}>
              <ArrowLeft className='mr-2 h-4 w-4' /> Retour
            </Button>
          </CardHeader>
        <Separator />
        <CardContent className='pt-6'>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
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
                    error={form.formState.errors.date_demande?.message || null}
                  />
                </div>

                <SelectField
                  name='periode_paie.mois'
                  label='Mois de paie'
                  control={form.control as any}
                  options={MONTHS.map((m) => ({ value: m, label: m }))}
                  required
                  placeholder='Sélectionner un mois'
                  error={
                    (form.formState.errors.periode_paie as any)?.mois?.message
                  }
                />

                <div className='space-y-2'>
                  <label className='text-sm font-medium'>Année de paie</label>
                  <Input
                    type='number'
                    min={2000}
                    max={2100}
                    value={form.watch('periode_paie.annee')}
                    onChange={(e) =>
                      form.setValue('periode_paie.annee', Number(e.target.value))
                    }
                  />
                </div>


                <div className='space-y-2'>
                  <label className='text-sm font-medium'>Montant avance (MAD)</label>
                  <Input
                    type='number'
                    min={0}
                    step='0.01'
                    value={form.watch('montant_avance')}
                    onChange={(e) =>
                      form.setValue('montant_avance', Number(e.target.value))
                    }
                  />
                  {form.formState.errors.montant_avance?.message && (
                    <p className='text-xs text-destructive'>
                      {form.formState.errors.montant_avance.message}
                    </p>
                  )}
                </div>

                <div className='md:col-span-2 space-y-2'>
                  <label className='text-sm font-medium'>Description</label>
                  <Textarea
                    placeholder="Ajouter une note (facultatif)"
                    value={form.watch('description') || ''}
                    onChange={(e) => form.setValue('description', e.target.value)}
                    rows={4}
                  />
                </div>
              </div>

              <div className='flex items-center justify-end gap-3'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => router.push('/admin/paie/avance')}
                >
                  Annuler
                </Button>
                <Button type='submit' disabled={loading}>
                  <Save className='mr-2 h-4 w-4' /> Enregistrer
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}