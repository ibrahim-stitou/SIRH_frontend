'use client';
import { useEffect, useMemo, useState } from 'react';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { DatePickerField } from '@/components/custom/DatePickerField';
import { apiRoutes } from '@/config/apiRoutes';
import apiClient from '@/lib/api';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Upload, UserPlus, ArrowLeft } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select';
import { FileUploader } from '@/components/file-uploader';
import type { DropzoneProps } from 'react-dropzone';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { SelectField } from '@/components/custom/SelectField';
import { useForm as useHookForm } from 'react-hook-form';
import { Icons } from '@/components/icons';

// Zod schema for form validation
const pointageSchema = z.object({
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
  worked_day: z
    .string({ required_error: 'Le jour presté est requis' })
    .min(1, 'Le jour presté est requis') // 'YYYY-MM-DD'
});

type PointageForm = z.infer<typeof pointageSchema>;

interface EmployeeOption {
  label: string | undefined;
  value: string | undefined;
}

export default function AjouterPointagePage() {
  const router = useRouter();
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);

  // Import modal
  const [showImportModal, setShowImportModal] = useState(false);
  const [importType] = useState<'csv' | 'excel'>('csv');
  const [groups, setGroups] = useState<
    { label: string; value: string | number }[]
  >([]);
  const [importStatus] = useState<'bruillon' | 'valide'>('bruillon');
  const [importFiles, setImportFiles] = useState<File[]>([]);
  const acceptMap = useMemo<DropzoneProps['accept']>(() => {
    return (
      importType === 'csv'
        ? { 'text/csv': ['.csv'] }
        : {
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
              ['.xlsx'],
            'application/vnd.ms-excel': ['.xls']
          }
    ) as DropzoneProps['accept'];
  }, [importType]);

  useEffect(() => {
    let mounted = true;
    apiClient
      .get(apiRoutes.admin.employees.simpleList)
      .then((res) => {
        const opts = (res.data?.data || []).map((e: any) => ({
          label: `${e.firstName} ${e.lastName}${e.matricule ? ' — ' + e.matricule : ''}`,
          value: e.id
        }));
        if (mounted) setEmployees(opts);
      })
      .catch(() => void 0);

    apiClient
      .get(apiRoutes.admin.groups.list)
      .then((res) => {
        const gopts = (res.data?.data || res.data || []).map((g: any) => ({
          label: g.name ?? g.label ?? `Groupe ${g.id}`,
          value: g.id
        }));
        if (mounted) setGroups(gopts);
      })
      .catch(() => void 0);

    return () => {
      mounted = false;
    };
  }, []);

  const downloadModel = () => {
    const url =
      importType === 'csv'
        ? apiRoutes.admin.pointages.export.modelCsv
        : apiRoutes.admin.pointages.export.modelXlsx;
    if (typeof window !== 'undefined') window.open(url, '_blank');
  };

  const [selectedGroupId, setSelectedGroupId] = useState<
    string | number | null
  >(null);
  const [importWorkedDay, setImportWorkedDay] = useState<string | null>(null);
  // form for import modal SelectField
  const importModalForm = useHookForm<{ groupId: string }>({
    defaultValues: { groupId: '' }
  });
  const importGroupId = importModalForm.watch('groupId');
  useEffect(() => {
    setSelectedGroupId(importGroupId ? importGroupId : null);
  }, [importGroupId]);

  // Sync Sele
  const form = useForm<PointageForm>({
    resolver: zodResolver(pointageSchema),
    defaultValues: {
      employeeId: '' as unknown as string,
      check_in: '',
      check_out: '',
      worked_day: ''
    }
  });
  const { control, handleSubmit, formState, watch } = form;
  const { errors, isSubmitting } = formState;

  const isSingleValid = useMemo(() => {
    return !errors.employeeId && !errors.check_in && !errors.check_out;
  }, [errors.employeeId, errors.check_in, errors.check_out]);

  // Helpers for auto-calcul from watched values
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

  const onSubmit = async (data: PointageForm) => {
    try {
      await apiClient.post(apiRoutes.admin.pointages.create, {
        employeeId: data.employeeId,
        check_in: data.check_in,
        check_out: data.check_out,
        worked_day: data.worked_day ?? undefined,
        source: 'manuel'
      });
      toast.success('Pointage ajouté');
      router.push('/admin/pointages');
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Erreur lors de l'ajout");
    }
  };

  // DateTimePicker: combines DatePickerField and TimePicker to a 'YYYY-MM-DDTHH:mm' string
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

  // Local TimePicker component
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

  const onImportUpload = async (files: File[]) => {
    try {
      const file = files[0];
      const form = new FormData();
      form.append('file', file);
      form.append('status', importStatus);
      await apiClient.post(apiRoutes.admin.pointages.import, form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Import des pointages lancé');
      setShowImportModal(false);
      router.push('/admin/pointages');
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Erreur lors de l'import");
      throw e;
    }
  };

  // New: state for selected employee's group(s)
  const [employeeGroups, setEmployeeGroups] = useState<
    { id: string | number; name: string }[]
  >([]);
  const selectedEmployeeId = watch('employeeId');
  useEffect(() => {
    if (!selectedEmployeeId) {
      setEmployeeGroups([]);
      return;
    }
    let cancelled = false;
    apiClient
      .get(apiRoutes.admin.groups.groupByEmployee(selectedEmployeeId))
      .then((res) => {
        const groups = (res.data?.data || res.data || []) as any[];
        if (!cancelled) {
          setEmployeeGroups(
            groups.map((g) => ({
              id: g.id,
              name: g.name ?? g.label ?? `Groupe ${g.id}`
            }))
          );
        }
      })
      .catch(() => {
        if (!cancelled) setEmployeeGroups([]);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedEmployeeId]);

  return (
    <PageContainer scrollable>
      <div className='flex flex-1 flex-col space-y-6'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='bg-primary/10 flex h-10 w-10 items-center justify-center rounded-xl'>
              <UserPlus className='text-primary h-5 w-5' />
            </div>
            <div>
              <h1 className='text-2xl font-bold tracking-tight'>
                Ajouter un pointage
              </h1>
              <p className='text-muted-foreground text-sm'>Création manuelle</p>
            </div>
          </div>
          <div className='flex flex-wrap items-center gap-2'>
            <Button
              variant='secondary'
              onClick={() => router.push('/admin/pointages')}
            >
              <ArrowLeft /> Retour aux pointages
            </Button>
            <Button variant='outline' onClick={() => setShowImportModal(true)}>
              <Upload className='mr-2 h-4 w-4' /> Importer / Exporter
            </Button>
          </div>
        </div>

        <Card className='shadow-sm'>
          <CardHeader className=''>
            <CardTitle>Pointage simple</CardTitle>
          </CardHeader>
          <CardContent className=''>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
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
                {/* Show employee group(s) fetched from API */}
                <div className='text-muted-foreground mt-1 text-xs'>
                  Groupe{employeeGroups.length > 1 ? 's' : ''}:{' '}
                  {employeeGroups.length > 0
                    ? employeeGroups.map((g, i) => (
                        <span key={g.id} className='font-medium'>
                          {g.name}
                          {i < employeeGroups.length - 1 ? ', ' : ''}
                        </span>
                      ))
                    : '—'}
                </div>
              </div>
              <div>
                <Label className='mb-1'>
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
                <Label className='mb-1'>
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
                <Label className='mb-1'>
                  Jour presté (date) <span className='text-destructive'>*</span>
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
                <div className='text-muted-foreground text-sm md:col-span-2'>
                  Durée estimée:{' '}
                  <span className='font-semibold'>{estimatedMinutes}</span>{' '}
                  minutes
                </div>
              )}
              <div className='mt-2 md:col-span-2'>
                <Button
                  onClick={handleSubmit(onSubmit)}
                  disabled={isSubmitting || !isSingleValid}
                >
                  <UserPlus className='mr-2 h-4 w-4' /> Ajouter le pointage
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Dialog open={showImportModal} onOpenChange={setShowImportModal}>
          <DialogContent className='sm:max-w-xl'>
            <DialogHeader>
              <DialogTitle>Importer des pointages</DialogTitle>
            </DialogHeader>
            <div className='space-y-4'>
              <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                <div>
                  <Label className='mb-2 block text-sm font-medium'>
                    Groupe cible pour l&apos;import
                  </Label>
                  <SelectField
                    name='groupId'
                    label={''}
                    control={importModalForm.control}
                    options={groups.map((g) => ({
                      id: g.value,
                      label: g.label
                    }))}
                    placeholder='Sélectionner un groupe'
                    required
                  />
                  <p className='text-muted-foreground mt-2 text-xs'>
                    L&apos;import sera appliqué pour tous les membres du groupe
                    sélectionné.
                  </p>
                </div>

                {/* New: select single worked day for import */}
                <div>
                  <Label className='mb-2 block text-sm font-medium'>
                    Jour presté des pointages importés
                  </Label>
                  <DatePickerField
                    value={importWorkedDay || ''}
                    onChange={(d) => setImportWorkedDay(d || null)}
                    placeholder='Sélectionner la date de la journée'
                  />
                </div>
              </div>
              {/* New: select group for import */}

              <div className='flex flex-wrap items-center gap-2'>
                <Button
                  variant='outline'
                  onClick={downloadModel}
                  title='Télécharger le modèle'
                  className='px-1 py-1 text-xs'
                >
                  Télécharger le modèle {importType.toUpperCase()}{' '}
                  <Icons.import className='ml-1 h-4 w-4' />
                </Button>
              </div>

              <div className='space-y-2'>
                <Label className='text-sm font-medium'>
                  Fichier à importer (Excel)
                </Label>
                <FileUploader
                  accept={acceptMap}
                  maxFiles={1}
                  multiple={false}
                  description={`Déposez votre fichier ${importType.toUpperCase()} contenant les pointages.`}
                  value={importFiles}
                  onValueChange={setImportFiles}
                  showPreview={false}
                  variant='default'
                />
              </div>

              <div className='bg-muted/30 rounded-lg border p-3'>
                <div className='mb-2 text-sm font-semibold'>
                  Format des colonnes
                </div>
                <ul className='text-muted-foreground list-inside list-disc text-sm'>
                  <li>
                    <span className='font-medium'>employee_matricule</span> —
                    chaîne (ex: EMP-0001)
                  </li>
                  <li>
                    <span className='font-medium'>check_in</span> — date et
                    heure (AAAA-MM-JJ HH:mm)
                  </li>
                  <li>
                    <span className='font-medium'>check_out</span> — date et
                    heure (AAAA-MM-JJ HH:mm)
                  </li>
                </ul>
                <p className='text-muted-foreground mt-2 text-xs'>
                  La source est automatiquement définie sur « automatique » lors
                  de l&apos;import.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={() => onImportUpload(importFiles)}
                disabled={
                  importFiles.length === 0 ||
                  selectedGroupId == null ||
                  !importWorkedDay
                }
              >
                Importer
              </Button>
              <Button
                variant='outline'
                onClick={() => setShowImportModal(false)}
              >
                Fermer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageContainer>
  );
}
