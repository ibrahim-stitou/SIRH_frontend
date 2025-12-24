'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import CustomTable from '@/components/custom/data-table/custom-table';
import {
  CustomTableColumn,
  CustomTableFilterConfig,
  UseTableReturn
} from '@/components/custom/data-table/types';
import { apiRoutes } from '@/config/apiRoutes';
import apiClient from '@/lib/api';
import { format } from 'date-fns';
import {
  Upload,
  Trash2,
  Plus,
  Pencil,
  Eye,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import CustomAlertDialog from '@/components/custom/customAlert';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip';
import {
  Dialog as AlertDialog,
  DialogContent as AlertDialogContent,
  DialogHeader as AlertDialogHeader,
  DialogTitle as AlertDialogTitle,
  DialogFooter as AlertDialogFooter
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { StatusBadge } from '@/components/custom/status-badge';
import { FileUploader } from '@/components/file-uploader';
import type { DropzoneProps } from 'react-dropzone';

interface EmployeeLite {
  id: number | string;
  firstName?: string;
  lastName?: string;
  first_name?: string;
  last_name?: string;
  matricule?: string;
}

export interface PointageRow {
  id: number | string;
  employeeId: number | string;
  employee?: EmployeeLite | null;
  check_in?: string | null;
  check_out?: string | null;
  planned_check_in?: string | null;
  planned_check_out?: string | null;
  worked_day?: string | null; // YYYY-MM-DD
  source?: 'manuel' | 'automatique' | string;
  status?: 'bruillon' | 'valide' | 'rejete' | string;
  motif_rejet?: string | null;
  created_at?: string;
  updated_at?: string;
  updated_by?: string;
}

export default function PointagesListing() {
  const router = useRouter();

  const [_tableInstance, setTableInstance] = useState<Partial<
    UseTableReturn<PointageRow>
  > | null>(null);

  const [employees, setEmployees] = useState<
    { label: string; value: string | number }[]
  >([]);
  const [confirmDeleteId, setConfirmDeleteId] = useState<
    number | string | null
  >(null);

  // Import modal state
  const [showImportModal, setShowImportModal] = useState(false);
  const [importType, setImportType] = useState<'csv' | 'excel'>('csv');
  const [importStatus, setImportStatus] = useState<'bruillon' | 'valide'>(
    'bruillon'
  );
  const [refuseOpen, setRefuseOpen] = useState(false);
  const [refuseLoading, setRefuseLoading] = useState(false);
  const [refuseReason, setRefuseReason] = useState('');
  const [rowToRefuse, setRowToRefuse] = useState<PointageRow | null>(null);
  const [importFiles, setImportFiles] = useState<File[]>([]);

  useEffect(() => {
    let mounted = true;
    // Load employees simple list for filters
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

  const onValidate = useCallback(
    async (row: PointageRow) => {
      try {
        await apiClient.patch(apiRoutes.admin.pointages.validate(row.id));
        toast.success('Pointage validé');
        _tableInstance?.refresh?.();
      } catch (e: any) {
        toast.error(e?.response?.data?.message || 'Erreur');
      }
    },
    [_tableInstance]
  );
  const onOpenRefuse = (row: PointageRow) => {
    setRowToRefuse(row);
    setRefuseReason('');
    setRefuseOpen(true);
  };
  const onRefuseConfirm = async () => {
    if (!rowToRefuse) return;
    if (!refuseReason.trim()) {
      toast.error('Veuillez saisir un motif');
      return;
    }
    setRefuseLoading(true);
    try {
      await apiClient.patch(apiRoutes.admin.pointages.refuse(rowToRefuse.id), {
        motif_rejet: refuseReason
      });
      toast.success('Pointage refusé');
      setRefuseOpen(false);
      setRowToRefuse(null);
      setRefuseReason('');
      _tableInstance?.refresh?.();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Erreur');
    } finally {
      setRefuseLoading(false);
    }
  };

  const onAskDelete = (row: PointageRow) => setConfirmDeleteId(row.id);
  const onConfirmDelete = async () => {
    if (!confirmDeleteId) return;
    try {
      await apiClient.delete(apiRoutes.admin.pointages.delete(confirmDeleteId));
      toast.success('Pointage supprimé');
      setConfirmDeleteId(null);
      _tableInstance?.refresh?.();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Erreur');
    }
  };

  // Import actions: open modal + download model
  const onOpenImport = () => setShowImportModal(true);
  const onDownloadModel = () => {
    const url =
      importType === 'csv'
        ? apiRoutes.admin.pointages.export.modelCsv
        : apiRoutes.admin.pointages.export.modelXlsx;
    if (typeof window !== 'undefined') window.open(url, '_blank');
  };

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
      setImportFiles([]);
      _tableInstance?.refresh?.();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Erreur lors de l'import");
      throw e; // let FileUploader show error toast too
    }
  };
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

  const columns: CustomTableColumn<PointageRow>[] = useMemo(
    () => [
      { data: 'id', label: 'ID', sortable: true, width: 80 },
      {
        data: 'employee',
        label: 'Employé',
        sortable: false,
        render: (_v, row) =>
          row.employee ? (
            <div className='flex flex-col'>
              <span className='font-medium'>
                {`${row.employee.firstName ?? row.employee.first_name ?? ''} ${row.employee.lastName ?? row.employee.last_name ?? ''}`.trim()}
              </span>
              {row.employee.matricule && (
                <span className='text-muted-foreground text-xs'>
                  {row.employee.matricule}
                </span>
              )}
            </div>
          ) : (
            '—'
          )
      },
      {
        data: 'planned_check_in',
        label: 'Entrée planifiée',
        sortable: true,
        render: (v) => (v ? format(new Date(v), 'yyyy-MM-dd HH:mm') : '—')
      },
      {
        data: 'planned_check_out',
        label: 'Sortie planifiée',
        sortable: true,
        render: (v) => (v ? format(new Date(v), 'yyyy-MM-dd HH:mm') : '—')
      },
      {
        data: 'check_in',
        label: 'Entrée',
        sortable: true,
        render: (v) => (v ? format(new Date(v), 'yyyy-MM-dd HH:mm') : '—')
      },
      {
        data: 'check_out',
        label: 'Sortie',
        sortable: true,
        render: (v) => (v ? format(new Date(v), 'yyyy-MM-dd HH:mm') : '—')
      },
      {
        data: 'duration',
        label: 'Durée (min)',
        sortable: false,
        render: (_v, row) => {
          if (!row.check_in || !row.check_out) return '—';
          const di = new Date(row.check_in);
          const doo = new Date(row.check_out);
          if (isNaN(di.getTime()) || isNaN(doo.getTime())) return '—';
          const diff = Math.round((doo.getTime() - di.getTime()) / 60000);
          return diff >= 0 ? `${diff}` : '—';
        }
      },
      {
        data: 'worked_day',
        label: 'Jour presté',
        sortable: true,
        render: (v) => (v ? v : '—')
      },
      {
        data: 'source',
        label: 'Source',
        sortable: true,
        render: (v: PointageRow['source']) => (
          <StatusBadge
            tone={v === 'automatique' ? 'info' : 'warning'}
            label={v || '—'}
          />
        )
      },
      {
        data: 'status',
        label: 'Statut',
        sortable: true,
        render: (v: PointageRow['status']) => {
          const map: Record<
            string,
            { text: string; tone: 'neutral' | 'success' | 'danger' }
          > = {
            bruillon: { text: 'Brouillon', tone: 'neutral' },
            valide: { text: 'Validé', tone: 'success' },
            rejete: { text: 'Rejeté', tone: 'danger' }
          };
          const m = (v && map[v]) || map['bruillon'];
          return <StatusBadge label={m.text} tone={m.tone} />;
        }
      },
      {
        data: 'actions',
        label: 'Actions',
        sortable: false,
        render: (_v, row) => (
          <div className='flex items-center space-x-2'>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant='outline'
                  className='h-8 w-8 p-1.5'
                  onClick={() => router.push(`/admin/pointages/${row.id}`)}
                  title='Voir'
                >
                  <Eye className='h-4 w-4' />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Voir</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant='outline'
                  className='h-8 w-8 p-1.5'
                  onClick={() =>
                    router.push(`/admin/pointages/${row.id}/modifier`)
                  }
                  title='Modifier'
                >
                  <Pencil className='h-4 w-4' />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Modifier</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant='outline'
                  className='h-8 w-8 p-1.5'
                  onClick={() => onValidate(row)}
                  title='Valider'
                  disabled={
                    !(row.status === 'bruillon' || row.status === 'valide')
                  }
                >
                  <CheckCircle2 className='h-4 w-4 text-emerald-600' />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Valider</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant='destructive'
                  className='h-8 w-8 p-1.5'
                  onClick={() => onOpenRefuse(row)}
                  title='Refuser'
                  disabled={
                    !(row.status === 'bruillon' || row.status === 'valide')
                  }
                >
                  <XCircle className='h-4 w-4' />
                </Button>
              </TooltipTrigger>
              <TooltipContent
                className='tooltip-content rounded-md bg-red-100 px-2 py-1 text-red-600 shadow-md'
                sideOffset={5}
              >
                Refuser
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant='destructive'
                  className='h-8 w-8 bg-red-100 p-1.5 text-red-600 hover:bg-red-200'
                  onClick={() => onAskDelete(row)}
                  title='Supprimer'
                  disabled={
                    !(row.status === 'bruillon' || row.status === 'rejete')
                  }
                >
                  <Trash2 className='h-4 w-4' />
                </Button>
              </TooltipTrigger>
              <TooltipContent
                className='tooltip-content rounded-md bg-red-100 px-2 py-1 text-red-600 shadow-md'
                sideOffset={5}
              >
                Supprimer
              </TooltipContent>
            </Tooltip>
          </div>
        )
      }
    ],
    [router, onValidate]
  );

  const filters: CustomTableFilterConfig[] = useMemo(
    () => [
      {
        field: 'employeeId',
        label: 'Employé',
        type: 'datatable-select',
        options: employees
      },
      {
        field: 'status',
        label: 'Statut',
        type: 'datatable-select',
        options: [
          { label: 'Tous', value: '' },
          { label: 'Brouillon', value: 'bruillon' },
          { label: 'Validé', value: 'valide' },
          { label: 'Rejeté', value: 'rejete' }
        ]
      },
      {
        field: 'source',
        label: 'Source',
        type: 'datatable-select',
        options: [
          { label: 'Toutes', value: '' },
          { label: 'Manuel', value: 'manuel' },
          { label: 'Automatique', value: 'automatique' }
        ]
      },
      { field: 'from', label: 'Du', type: 'date' },
      { field: 'to', label: 'Au', type: 'date' }
    ],
    [employees]
  );

  return (
    <>
      <div className='mb-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='text-2xl font-semibold tracking-tight'>Pointages</h1>
          <p className='text-muted-foreground text-sm'>
            Gérez vos pointages, importez un modèle et ajoutez des
            enregistrements manuellement
          </p>
        </div>
        <div className='flex flex-wrap items-center gap-2'>
          <Button onClick={onOpenImport} title='Importer (CSV ou Excel)'>
            <Upload className='mr-2 h-4 w-4' /> Importer
          </Button>
          <Button
            onClick={() => router.push('/admin/pointages/ajouter')}
            title='Ajouter un pointage'
          >
            <Plus className='mr-2 h-4 w-4' /> Ajouter un pointage
          </Button>
        </div>
      </div>
      <div className='flex flex-1 flex-col space-y-4'>
        <CustomTable<PointageRow>
          url={apiRoutes.admin.pointages.list}
          columns={columns}
          filters={filters}
          onInit={(inst) => setTableInstance(inst)}
        />
        <CustomAlertDialog
          title={'Supprimer ce pointage ?'}
          description={'Cette action est irréversible.'}
          cancelText={'Annuler'}
          confirmText={'Supprimer'}
          onConfirm={onConfirmDelete}
          open={!!confirmDeleteId}
          setOpen={(o) => (!o ? setConfirmDeleteId(null) : void 0)}
        />
        <Dialog open={showImportModal} onOpenChange={setShowImportModal}>
          <DialogContent className='sm:max-w-xl'>
            <DialogHeader>
              <DialogTitle>Importer des pointages</DialogTitle>
            </DialogHeader>
            <div className='space-y-4'>
              <div>
                <Label className='mb-2 block text-sm font-medium'>
                  Type de fichier
                </Label>
                <RadioGroup
                  value={importType}
                  onValueChange={(v) => setImportType(v as 'csv' | 'excel')}
                  className='grid grid-cols-2 gap-2'
                >
                  <div className='flex items-center space-x-2 rounded-md border p-2'>
                    <RadioGroupItem value='csv' id='type-csv' />
                    <Label htmlFor='type-csv'>CSV</Label>
                  </div>
                  <div className='flex items-center space-x-2 rounded-md border p-2'>
                    <RadioGroupItem value='excel' id='type-excel' />
                    <Label htmlFor='type-excel'>Excel</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label className='mb-2 block text-sm font-medium'>
                  Statut appliqué aux pointages importés
                </Label>
                <RadioGroup
                  value={importStatus}
                  onValueChange={(v) =>
                    setImportStatus(v as 'bruillon' | 'valide')
                  }
                  className='grid grid-cols-2 gap-2'
                >
                  <div className='flex items-center space-x-2 rounded-md border p-2'>
                    <RadioGroupItem value='bruillon' id='status-bruillon' />
                    <Label htmlFor='status-bruillon'>Brouillon</Label>
                  </div>
                  <div className='flex items-center space-x-2 rounded-md border p-2'>
                    <RadioGroupItem value='valide' id='status-valide' />
                    <Label htmlFor='status-valide'>Validé</Label>
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
                <Button
                  variant='outline'
                  onClick={onDownloadModel}
                  title='Télécharger le modèle'
                >
                  Télécharger le modèle {importType.toUpperCase()}
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
                    <span className='font-medium'>planned_check_in</span> — date
                    et heure (AAAA-MM-JJ HH:mm)
                  </li>
                  <li>
                    <span className='font-medium'>planned_check_out</span> —
                    date et heure (AAAA-MM-JJ HH:mm)
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
                    <span className='font-medium'>worked_day</span> — date
                    (AAAA-MM-JJ)
                  </li>
                  <li>
                    <span className='font-medium'>source</span> — valeurs:{' '}
                    <span className='font-mono'>manuel</span> ou{' '}
                    <span className='font-mono'>automatique</span>
                  </li>
                </ul>
              </div>

              <p className='text-muted-foreground text-xs'>
                Remplissez le fichier avec ces colonnes et importez-le via le
                module backend (mock endpoints prêts côté Front). Pour un import
                réel, un upload de fichier sera nécessaire côté API. Le statut
                sélectionné ci-dessus sera appliqué aux enregistrements
                importés.
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

        {/* Refuse motif dialog */}
        <AlertDialog open={refuseOpen} onOpenChange={setRefuseOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Refuser le pointage</AlertDialogTitle>
            </AlertDialogHeader>
            <div className='space-y-3'>
              <Label className='text-sm font-medium'>Motif du refus</Label>
              <Textarea
                value={refuseReason}
                onChange={(e) => setRefuseReason(e.target.value)}
                rows={4}
                placeholder='Saisir le motif du refus...'
              />
            </div>
            <AlertDialogFooter>
              <Button
                variant='outline'
                onClick={() => setRefuseOpen(false)}
                disabled={refuseLoading}
              >
                Annuler
              </Button>
              <Button
                variant='destructive'
                onClick={onRefuseConfirm}
                disabled={refuseLoading || !refuseReason.trim()}
              >
                {refuseLoading ? 'Refus en cours...' : 'Refuser'}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
}
