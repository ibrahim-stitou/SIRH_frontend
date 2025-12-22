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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { FileUploader } from '@/components/file-uploader';
import type { DropzoneProps } from 'react-dropzone';

interface EmployeeOption {
  label: string | undefined;
  value: string | undefined;
}

interface PointageLine {
  employeeId: number | string | null;
  check_in: string | null; // YYYY-MM-DDTHH:mm
  check_out: string | null; // YYYY-MM-DDTHH:mm
  source: 'manuel' | 'automatique';
  status?: 'bruillon' | 'valide';
}

export default function AjouterPointagePage() {
  const router = useRouter();
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);

  // Single line state
  const [single, setSingle] = useState<PointageLine>({
    employeeId: null,
    check_in: null,
    check_out: null,
    source: 'manuel',
    status: 'bruillon'
  });

  // Import modal
  const [showImportModal, setShowImportModal] = useState(false);
  const [importType, setImportType] = useState<'csv' | 'excel'>('csv');
  const [importStatus, setImportStatus] = useState<'bruillon' | 'valide'>(
    'bruillon'
  );
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

  const isSingleValid = useMemo(() => {
    return !!(single.employeeId && (single.check_in || single.check_out));
  }, [single]);

  // Helpers for auto-calcul
  function computeWorkedMinutes(
    checkIn?: string | null,
    checkOut?: string | null
  ): number | undefined {
    if (!checkIn || !checkOut) return undefined;
    const di = new Date(checkIn);
    const doo = new Date(checkOut);
    if (isNaN(di.getTime()) || isNaN(doo.getTime())) return undefined;
    const diff = (doo.getTime() - di.getTime()) / 60000;
    return diff >= 0 ? Math.round(diff) : undefined;
  }
  const estimatedMinutes = useMemo(() => {
    // inline compute to satisfy exhaustive-deps
    if (!single.check_in || !single.check_out) return undefined;
    const di = new Date(single.check_in);
    const doo = new Date(single.check_out);
    if (isNaN(di.getTime()) || isNaN(doo.getTime())) return undefined;
    const diff = (doo.getTime() - di.getTime()) / 60000;
    return diff >= 0 ? Math.round(diff) : undefined;
  }, [single.check_in, single.check_out]);

  const submitSingle = async () => {
    if (!isSingleValid) {
      toast.error('Veuillez remplir les champs obligatoires');
      return;
    }
    try {
      const workedMinutes = computeWorkedMinutes(
        single.check_in,
        single.check_out
      );
      await apiClient.post(apiRoutes.admin.pointages.create, {
        employeeId: single.employeeId,
        check_in: single.check_in,
        check_out: single.check_out,
        source: single.source,
        status: single.status,
        worked_minutes: workedMinutes ?? undefined
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
                <Label className='mb-1'>
                  Employé <span className='text-destructive'>*</span>
                </Label>
                <Select
                  value={
                    single.employeeId != null
                      ? String(single.employeeId)
                      : undefined
                  }
                  onValueChange={(v) =>
                    setSingle((s) => ({
                      ...s,
                      employeeId: isNaN(Number(v)) ? v : Number(v)
                    }))
                  }
                >
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder='Choisir un employé' />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((opt) => (
                      <SelectItem
                        key={String(opt.value)}
                        value={String(opt.value)}
                      >
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className='mb-1'>Entrée (date et heure)</Label>
                <DateTimePicker
                  value={single.check_in}
                  onChange={(val) =>
                    setSingle((s) => ({ ...s, check_in: val }))
                  }
                />
              </div>
              <div>
                <Label className='mb-1'>Sortie (date et heure)</Label>
                <DateTimePicker
                  value={single.check_out}
                  onChange={(val) =>
                    setSingle((s) => ({ ...s, check_out: val }))
                  }
                />
              </div>
              <div>
                <Label className='mb-1'>Statut</Label>
                <Select
                  value={single.status || 'bruillon'}
                  onValueChange={(v) =>
                    setSingle((s) => ({
                      ...s,
                      status: v as 'bruillon' | 'valide'
                    }))
                  }
                >
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder='Sélectionner un statut' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='bruillon'>Brouillon</SelectItem>
                    <SelectItem value='valide'>Validé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {estimatedMinutes !== undefined && (
                <div className='text-muted-foreground text-sm md:col-span-2'>
                  Durée estimée:{' '}
                  <span className='font-semibold'>{estimatedMinutes}</span>{' '}
                  minutes
                </div>
              )}
              <div className='mt-2 md:col-span-2'>
                <Button onClick={submitSingle} disabled={!isSingleValid}>
                  <UserPlus className='mr-2 h-4 w-4' /> Ajouter le pointage
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Dialog open={showImportModal} onOpenChange={setShowImportModal}>
          <DialogContent className='sm:max-w-xl'>
            <DialogHeader>
              <DialogTitle>Importer / Exporter</DialogTitle>
            </DialogHeader>
            <div className='space-y-4'>
              <div>
                <Label className='mb-2 block text-sm font-medium'>
                  Type de modèle
                </Label>
                <RadioGroup
                  value={importType}
                  onValueChange={(v: 'csv' | 'excel') => setImportType(v)}
                  className='grid grid-cols-2 gap-2'
                >
                  <div className='flex items-center space-x-2 rounded-md border p-2'>
                    <RadioGroupItem value='csv' id='mdl-csv' />
                    <Label htmlFor='mdl-csv'>CSV</Label>
                  </div>
                  <div className='flex items-center space-x-2 rounded-md border p-2'>
                    <RadioGroupItem value='excel' id='mdl-excel' />
                    <Label htmlFor='mdl-excel'>Excel</Label>
                  </div>
                </RadioGroup>
              </div>
              <div>
                <Label className='mb-2 block text-sm font-medium'>
                  Statut appliqué aux pointages importés
                </Label>
                <RadioGroup
                  value={importStatus}
                  onValueChange={(v: 'bruillon' | 'valide') =>
                    setImportStatus(v)
                  }
                  className='grid grid-cols-2 gap-2'
                >
                  <div className='flex items-center space-x-2 rounded-md border p-2'>
                    <RadioGroupItem
                      value='bruillon'
                      id='import-status-bruillon'
                    />
                    <Label htmlFor='import-status-bruillon'>Brouillon</Label>
                  </div>
                  <div className='flex items-center space-x-2 rounded-md border p-2'>
                    <RadioGroupItem value='valide' id='import-status-valide' />
                    <Label htmlFor='import-status-valide'>Validé</Label>
                  </div>
                </RadioGroup>
                <p className='text-muted-foreground mt-2 text-xs'>
                  Tous les enregistrements importés seront créés avec le statut
                  sélectionné:{' '}
                  <span className='font-semibold'>
                    {importStatus === 'valide' ? 'Validé' : 'Brouillon'}
                  </span>
                  .
                </p>
              </div>
              <div className='flex flex-wrap items-center gap-2'>
                <Button variant='outline' onClick={downloadModel}>
                  Télécharger le modèle
                </Button>
              </div>
              <div className='space-y-2'>
                <Label className='text-sm font-medium'>
                  Fichier à importer (CSV ou Excel)
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
                  <li>
                    <span className='font-medium'>worked_minutes</span> — entier
                    (minutes travaillées)
                  </li>
                  <li>
                    <span className='font-medium'>source</span> — valeurs:{' '}
                    <span className='font-mono'>manuel</span> ou{' '}
                    <span className='font-mono'>automatique</span>
                  </li>
                </ul>
              </div>
              <p className='text-muted-foreground text-xs'>
                Les endpoints d&apos;import sont mock côté backend. Pour un
                upload réel, il faudra une API de réception de fichier.
              </p>
            </div>
            <DialogFooter>
              <Button
                onClick={() => onImportUpload(importFiles)}
                disabled={importFiles.length === 0}
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
