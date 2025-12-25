'use client';
import { useEffect, useMemo, useState } from 'react';
import PageContainer from '@/components/layout/page-container';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select';
import { apiRoutes } from '@/config/apiRoutes';
import apiClient from '@/lib/api';
import { toast } from 'sonner';
import { ArrowLeft, Save, Clock } from 'lucide-react';
import { DatePickerField } from '@/components/custom/DatePickerField';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { SelectField } from '@/components/custom/SelectField';

interface EmployeeOption {
  label: string | undefined;
  value: string | undefined;
}

// Validation schema for editing a pointage
const editPointageSchema = z.object({
  employeeId: z
    .union([z.string(), z.number()])
    .refine((v) => v !== null && v !== undefined && String(v).trim() !== '', {
      message: "L'employé est requis"
    }),
  check_in: z
    .string({ required_error: "L'entrée est requise" })
    .min(1, "L'entrée est requise"),
  check_out: z
    .string({ required_error: 'La sortie est requise' })
    .min(1, 'La sortie est requise'),
  planned_check_in: z
    .string({ required_error: "L'entrée planifiée est requise" })
    .min(1, "L'entrée planifiée est requise"),
  planned_check_out: z
    .string({ required_error: 'La sortie planifiée est requise' })
    .min(1, 'La sortie planifiée est requise'),
  worked_day: z
    .string({ required_error: 'Le jour presté est requis' })
    .min(1, 'Le jour presté est requis'),
  status: z.enum(['bruillon', 'valide', 'rejete']).default('bruillon'),
  source: z.enum(['manuel', 'automatique']).default('manuel')
});

type EditPointageForm = z.infer<typeof editPointageSchema>;

export default function ModifierPointagePage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);

  const form = useForm<EditPointageForm>({
    resolver: zodResolver(editPointageSchema),
    defaultValues: {
      employeeId: '' as unknown as string,
      check_in: '',
      check_out: '',
      planned_check_in: '',
      planned_check_out: '',
      worked_day: '',
      status: 'bruillon',
      source: 'manuel'
    }
  });
  const { control, handleSubmit, reset, formState, watch } = form;
  const { errors, isSubmitting } = formState;

  useEffect(() => {
    let mounted = true;
    Promise.all([
      apiClient.get(apiRoutes.admin.employees.simpleList),
      apiClient.get(apiRoutes.admin.pointages.show(id))
    ])
      .then(([empRes, ptgRes]) => {
        if (!mounted) return;
        const opts = (empRes.data?.data || []).map((e: any) => ({
          label: `${e.firstName} ${e.lastName}${e.matricule ? ' — ' + e.matricule : ''}`,
          value: e.id
        }));
        setEmployees(opts);
        const row = ptgRes.data?.data;
        if (row) {
          reset({
            employeeId: row.employeeId ?? ('' as unknown as string),
            check_in: row.check_in ?? '',
            check_out: row.check_out ?? '',
            planned_check_in: row.planned_check_in ?? null,
            planned_check_out: row.planned_check_out ?? null,
            worked_day: row.worked_day ?? null,
            status: (row.status as EditPointageForm['status']) || 'bruillon',
            source: (row.source as EditPointageForm['source']) || 'manuel'
          });
        }
      })
      .catch((e) => {
        toast.error(e?.response?.data?.message || 'Erreur de chargement');
      })
      .finally(() => setLoading(false));
    return () => {
      mounted = false;
    };
  }, [id, reset]);

  function parseDatePart(value?: string | null): string | null {
    if (!value) return null;
    const [d] = String(value).split('T');
    return d || null;
  }
  function parseTimePart(value?: string | null): string | null {
    if (!value) return null;
    const parts = String(value).split('T');
    const time = parts[1] || '';
    return time.length >= 5 ? time.slice(0, 5) : null;
  }
  function combineDateTime(
    date: string | null,
    time: string | null
  ): string | null {
    if (!date || !time) return null;
    return `${date}T${time}`;
  }
  function pad2(n: number) {
    return n.toString().padStart(2, '0');
  }
  function parseTime(value?: string | null): { h: number; m: number } {
    if (!value) return { h: 9, m: 0 };
    const [hh, mm] = String(value).split(':');
    const h = Math.min(23, Math.max(0, parseInt(hh || '0', 10)));
    const m = Math.min(59, Math.max(0, parseInt(mm || '0', 10)));
    return { h: isNaN(h) ? 9 : h, m: isNaN(m) ? 0 : m };
  }
  const HOURS = Array.from({ length: 24 }, (_, i) => i);
  const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

  function TimePicker({
    value,
    onChange
  }: {
    value?: string | null;
    onChange: (val: string) => void;
  }) {
    const { h, m } = parseTime(value);
    return (
      <div className='flex items-center gap-2'>
        <Select
          value={pad2(h)}
          onValueChange={(v: string) => onChange(`${v}:${pad2(m)}`)}
        >
          <SelectTrigger className='w-24'>
            <SelectValue placeholder='HH' />
          </SelectTrigger>
          <SelectContent className='max-h-64'>
            {HOURS.map((hh) => (
              <SelectItem key={hh} value={pad2(hh)}>
                {pad2(hh)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className='text-muted-foreground'>:</span>
        <Select
          value={pad2(m)}
          onValueChange={(v: string) => onChange(`${pad2(h)}:${v}`)}
        >
          <SelectTrigger className='w-24'>
            <SelectValue placeholder='MM' />
          </SelectTrigger>
          <SelectContent className='max-h-64'>
            {MINUTES.map((mm) => (
              <SelectItem key={mm} value={pad2(mm)}>
                {pad2(mm)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  function DateTimePicker({
    value,
    onChange
  }: {
    value?: string | null;
    onChange: (val: string | null) => void;
  }) {
    const date = parseDatePart(value);
    const time = parseTimePart(value) || '09:00';
    return (
      <div className='grid grid-cols-1 gap-2 md:grid-cols-2'>
        <DatePickerField
          value={date || ''}
          onChange={(d) => onChange(combineDateTime(d, time))}
          placeholder='Sélectionner la date'
        />
        <TimePicker
          value={time}
          onChange={(t) => onChange(combineDateTime(date, t))}
        />
      </div>
    );
  }

  const wCheckIn = watch('check_in');
  const wCheckOut = watch('check_out');
  const estimatedMinutes = useMemo(() => {
    if (!wCheckIn || !wCheckOut) return undefined;
    const di = new Date(wCheckIn);
    const doo = new Date(wCheckOut);
    if (isNaN(di.getTime()) || isNaN(doo.getTime())) return undefined;
    const diff = (doo.getTime() - di.getTime()) / 60000;
    return diff >= 0 ? Math.round(diff) : undefined;
  }, [wCheckIn, wCheckOut]);

  const onSubmit = async (data: EditPointageForm) => {
    setSaving(true);
    try {
      await apiClient.put(apiRoutes.admin.pointages.update(id), {
        employeeId: data.employeeId,
        check_in: data.check_in,
        check_out: data.check_out,
        planned_check_in: data.planned_check_in ?? undefined,
        planned_check_out: data.planned_check_out ?? undefined,
        worked_day: data.worked_day ?? undefined,
        source: data.source,
        status: data.status
      });
      toast.success('Pointage modifié');
      router.push('/admin/pointages');
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const isValid = useMemo(
    () => !errors.employeeId && !errors.check_in && !errors.check_out,
    [errors]
  );

  return (
    <PageContainer scrollable>
      <div className='flex flex-1 flex-col space-y-6'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div>
              <h1 className='text-2xl font-bold tracking-tight'>
                Modifier le pointage
              </h1>
              <p className='text-muted-foreground text-sm'>
                MAJ des informations d&apos;un pointage
              </p>
            </div>
          </div>
          <div className='flex items-center gap-2'>
            <Button
              variant='secondary'
              onClick={() => router.push('/admin/pointages')}
            >
              <ArrowLeft /> Retour aux pointages
            </Button>
            <Button
              onClick={handleSubmit(onSubmit)}
              disabled={!isValid || saving || isSubmitting}
            >
              <Save className='mr-2 h-4 w-4' />{' '}
              {saving ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
          </div>
        </div>

        <Card className='shadow-sm'>
          <CardHeader className=''>
            <CardTitle>Détails</CardTitle>
          </CardHeader>
          <CardContent className=''>
            {loading ? (
              <div className='space-y-4'>
                <div className='grid animate-pulse grid-cols-1 gap-3 md:grid-cols-2'>
                  <div>
                    <div className='bg-muted mb-2 h-4 w-40 rounded'></div>
                    <div className='bg-muted h-10 rounded'></div>
                  </div>
                  <div>
                    <div className='bg-muted mb-2 h-4 w-32 rounded'></div>
                    <div className='bg-muted h-10 rounded'></div>
                  </div>
                  <div>
                    <div className='bg-muted mb-2 h-4 w-56 rounded'></div>
                    <div className='grid grid-cols-1 gap-2 md:grid-cols-2'>
                      <div className='bg-muted h-10 rounded'></div>
                      <div className='bg-muted h-10 rounded'></div>
                    </div>
                  </div>
                  <div>
                    <div className='bg-muted mb-2 h-4 w-56 rounded'></div>
                    <div className='grid grid-cols-1 gap-2 md:grid-cols-2'>
                      <div className='bg-muted h-10 rounded'></div>
                      <div className='bg-muted h-10 rounded'></div>
                    </div>
                  </div>
                  <div>
                    <div className='bg-muted mb-2 h-4 w-24 rounded'></div>
                    <div className='bg-muted h-10 rounded'></div>
                  </div>
                  <div className='md:col-span-2'>
                    <div className='bg-muted h-4 w-64 rounded'></div>
                  </div>
                </div>
              </div>
            ) : (
              <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
                <div>
                  <SelectField
                    name='employeeId'
                    label={'Employé'}
                    control={control}
                    options={employees.map((opt) => ({
                      id: opt.value,
                      label: opt.label
                    }))}
                    required
                    placeholder='Choisir un employé'
                    error={errors.employeeId?.message as string | undefined}
                  />
                </div>
                <div>
                  <Label className='mb-1 block'>
                    Statut <span className='text-destructive'>*</span>
                  </Label>
                  <Controller
                    control={control}
                    name='status'
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className='w-full'>
                          <SelectValue placeholder='Sélectionner un statut' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='bruillon'>Brouillon</SelectItem>
                          <SelectItem value='valide'>Validé</SelectItem>
                          <SelectItem value='rejete'>Rejeté</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div>
                  <Label className='mb-1 block'>
                    Entrée (date et heure){' '}
                    <span className='text-destructive'>*</span>
                  </Label>
                  <Controller
                    control={control}
                    name='check_in'
                    render={({ field }) => (
                      <DateTimePicker
                        value={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                  {errors.check_in && (
                    <div className='text-destructive mt-1 text-xs'>
                      {errors.check_in.message as string}
                    </div>
                  )}
                </div>
                <div>
                  <Label className='mb-1 block'>
                    Sortie (date et heure){' '}
                    <span className='text-destructive'>*</span>
                  </Label>
                  <Controller
                    control={control}
                    name='check_out'
                    render={({ field }) => (
                      <DateTimePicker
                        value={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                  {errors.check_out && (
                    <div className='text-destructive mt-1 text-xs'>
                      {errors.check_out.message as string}
                    </div>
                  )}
                </div>
                <div>
                  <Label className='mb-1 block'>
                    Entrée planifiée (date et heure){' '}
                    <span className='text-destructive'>*</span>
                  </Label>
                  <Controller
                    control={control}
                    name='planned_check_in'
                    render={({ field }) => (
                      <DateTimePicker
                        value={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                </div>
                <div>
                  <Label className='mb-1 block'>
                    Sortie planifiée (date et heure){' '}
                    <span className='text-destructive'>*</span>
                  </Label>
                  <Controller
                    control={control}
                    name='planned_check_out'
                    render={({ field }) => (
                      <DateTimePicker
                        value={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                </div>
                <div>
                  <Label className='mb-1 block'>
                    Jour presté (date){' '}
                    <span className='text-destructive'>*</span>
                  </Label>
                  <Controller
                    control={control}
                    name='worked_day'
                    render={({ field }) => (
                      <DatePickerField
                        value={field.value || ''}
                        onChange={(d) => field.onChange(d || null)}
                        placeholder='Sélectionner la date'
                      />
                    )}
                  />
                </div>
                {estimatedMinutes !== undefined && (
                  <div className='text-muted-foreground flex items-center gap-2 text-sm md:col-span-2'>
                    <Clock className='h-4 w-4' /> Durée estimée :
                    <span className='text-foreground font-semibold'>
                      {estimatedMinutes}
                    </span>{' '}
                    minutes
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
