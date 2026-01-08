'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import CustomTable from '@/components/custom/data-table/custom-table';
import { Icons } from '@/components/icons';
import {
  CustomTableColumn,
  CustomTableFilterConfig,
  UseTableReturn
} from '@/components/custom/data-table/types';
import { apiRoutes } from '@/config/apiRoutes';
import apiClient from '@/lib/api';
import {
  Upload,
  Plus,
  Pencil,
  Eye
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
import { DatePickerField } from '@/components/custom/DatePickerField';
import { SelectField } from '@/components/custom/SelectField';
import { useForm } from 'react-hook-form';

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
  const importType = 'excel';
  const importStatus = 'bruillon';
  const [refuseOpen, setRefuseOpen] = useState(false);
  const [refuseLoading, setRefuseLoading] = useState(false);
  const [refuseReason, setRefuseReason] = useState('');
  const [rowToRefuse, setRowToRefuse] = useState<PointageRow | null>(null);
  const [importFiles, setImportFiles] = useState<File[]>([]);
  const [groups, setGroups] = useState<
    { label: string; value: string | number }[]
  >([]);
  const [selectedGroupId, setSelectedGroupId] = useState<
    string | number | null
  >(null);
  const [importWorkedDay, setImportWorkedDay] = useState<string | null>(null);

  const importModalForm = useForm<{ groupId: string }>({
    defaultValues: { groupId: '' }
  });
  const importGroupId = importModalForm.watch('groupId');
  useEffect(() => {
    setSelectedGroupId(importGroupId ? importGroupId : null);
  }, [importGroupId]);

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

    // Load groups for import
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
    const url = apiRoutes.admin.pointages.export.modelXlsx;
    if (typeof window !== 'undefined') window.open(url, '_blank');
  };

  const onImportUpload = async (files: File[]) => {
    try {
      const file = files[0];
      const form = new FormData();
      form.append('file', file);
      form.append('status', importStatus);
      if (selectedGroupId != null)
        form.append('groupId', String(selectedGroupId));
      if (importWorkedDay) form.append('worked_day', importWorkedDay);
      form.append('source', 'automatique');
      await apiClient.post(apiRoutes.admin.pointages.import, form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Import des pointages lancé');
      setShowImportModal(false);
      setImportFiles([]);
      setSelectedGroupId(null);
      setImportWorkedDay(null);
      _tableInstance?.refresh?.();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Erreur lors de l'import");
      throw e; // let FileUploader show error toast too
    }
  };
  const acceptMap = useMemo<DropzoneProps['accept']>(() => {
    return {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [
        '.xlsx'
      ],
      'application/vnd.ms-excel': ['.xls']
    } as DropzoneProps['accept'];
  }, []);

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
        data: 'check_in',
        label: 'Entrée',
        sortable: true,
        render: (v) => (v ? String(v) : '—')
      },
      {
        data: 'check_out',
        label: 'Sortie',
        sortable: true,
        render: (v) => (v ? String(v) : '—')
      },
      {
        data: 'duration',
        label: 'Durée (min)',
        sortable: false,
        render: (_v, row) => {
          if (!row.worked_day || !row.check_in || !row.check_out) return '—';
          const di = new Date(`${row.worked_day}T${row.check_in}`);
          const doo = new Date(`${row.worked_day}T${row.check_out}`);
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
            label={v === 'automatique' ? 'Automatique' : 'Manuel'}
          />
        )
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
          </div>
        )
      }
    ],
    [router]
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
        field: 'groupId',
        label: 'Groupe',
        type: 'datatable-select',
        options: groups
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
    [employees, groups]
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
          <Button onClick={onOpenImport} title='Importer (Excel)'>
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
                  onClick={onDownloadModel}
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
                    <span className='font-medium'>matricule</span> — matricule
                    d&apos;employee (ex: EMP-0001)
                  </li>
                  <li>
                    <span className='font-medium'>worked_day</span> — date (AAAA-MM-JJ)
                  </li>
                  <li>
                    <span className='font-medium'>check_in</span> — heure d&apos;entrée (HH:mm)
                  </li>
                  <li>
                    <span className='font-medium'>check_out</span> — heure de sortie (HH:mm)
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
