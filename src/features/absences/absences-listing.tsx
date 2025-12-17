'use client'
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import CustomTable from '@/components/custom/data-table/custom-table';
import { useEffect, useMemo, useState } from 'react';
import {
  CustomTableColumn,
  CustomTableFilterConfig,
  UseTableReturn
} from '@/components/custom/data-table/types';
import { apiRoutes } from '@/config/apiRoutes';
import apiClient from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Plus, Eye, CheckCircle2, XCircle, CircleX, Trash2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import CustomAlertDialog from '@/components/custom/customAlert';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

interface AbsenceRow {
  id: number | string;
  employeeId: number | string;
  employee?: {
    id: number | string;
    firstName: string;
    lastName: string;
    matricule?: string;
  } | null;
  type_absence_id: number;
  type_absence?: {
    id: number;
    code: string;
    libelle: string;
    est_remuneree?: boolean;
    deduit_compteur_conge?: boolean;
    necessite_justification?: boolean;
    validation_obligatoire?: boolean;
    impact_paie?: boolean;
    actif?: boolean;
    couleur_hexa?: string;
  } | null;
  date_debut: string;
  date_fin: string;
  duree: number;
  statut: 'brouillon' | 'validee' | 'annulee' | 'cloture' | 'refusee';
  justifie: boolean;
  motif_refus?: string;
}

export default function AbsencesListing() {
  const { t } = useLanguage();
  const router = useRouter();

  const [_tableInstance, setTableInstance] = useState<
    Partial<UseTableReturn<AbsenceRow>> | null
  >(null);

  const [absenceTypes, setAbsenceTypes] = useState<
    { label: string; value: string | number }[]
  >([]);
  const [employees, setEmployees] = useState<
    { label: string; value: string | number }[]
  >([]);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | string | null>(null);
  const [showRefuseModal, setShowRefuseModal] = useState(false);
  const [refuseReason, setRefuseReason] = useState('');
  const [refuseLoading, setRefuseLoading] = useState(false);
  const [rowToRefuse, setRowToRefuse] = useState<AbsenceRow | null>(null);

  useEffect(() => {
    let mounted = true;
    // Load absence types for filters
    apiClient
      .get(apiRoutes.admin.absences.typesSimple)
      .then((res) => {
        const list = (res.data?.data || []).map((it: any) => ({
          label: `${it.code} — ${it.libelle}`,
          value: it.id
        }));
        if (mounted) setAbsenceTypes(list);
      })
      .catch(() => void 0);

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

  const onView = (row: AbsenceRow) => router.push(`/admin/absences/${row.id}`);
  const onValidate = async (row: AbsenceRow) => {
    try {
      await apiClient.patch(apiRoutes.admin.absences.validate(row.id));
      toast.success('Absence validée');
      _tableInstance?.refresh?.();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Erreur');
    }
  };
  const onClose = async (row: AbsenceRow) => {
    try {
      await apiClient.patch(apiRoutes.admin.absences.close(row.id));
      toast.success('Absence clôturée');
      _tableInstance?.refresh?.();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Erreur');
    }
  };
  const onCancel = async (row: AbsenceRow) => {
    try {
      await apiClient.patch(apiRoutes.admin.absences.cancel(row.id));
      toast.success('Absence annulée');
      _tableInstance?.refresh?.();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Erreur');
    }
  };
  const onAskDelete = (row: AbsenceRow) => setConfirmDeleteId(row.id);
  const onConfirmDelete = async () => {
    if (!confirmDeleteId) return;
    try {
      await apiClient.delete(apiRoutes.admin.absences.delete(confirmDeleteId));
      toast.success('Absence supprimée');
      setConfirmDeleteId(null);
      _tableInstance?.refresh?.();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Erreur');
    }
  };
  const onRefuse = (row: AbsenceRow) => {
    setRowToRefuse(row);
    setShowRefuseModal(true);
    setRefuseReason('');
  };
  const handleRefuse = async () => {
    if (!rowToRefuse) return;
    setRefuseLoading(true);
    try {
      await apiClient.post(apiRoutes.admin.absences.refuse(rowToRefuse.id), { motif_refus: refuseReason });
      toast.success('Absence refusée');
      setShowRefuseModal(false);
      setRefuseReason('');
      setRowToRefuse(null);
      _tableInstance?.refresh?.();
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Erreur lors du refus");
    } finally {
      setRefuseLoading(false);
    }
  };

  const columns: CustomTableColumn<AbsenceRow>[] = useMemo(
    () => [
      { data: 'id', label: 'ID', sortable: true, width: 80 },
      {
        data: 'employee',
        label: 'Employé',
        sortable: false,
        render: (_v, row) =>
          row.employee ? (
            <div className='flex flex-col'>
              <span className='font-medium'>{`${row.employee.firstName} ${row.employee.lastName}`}</span>
              {row.employee.matricule && (
                <span className='text-muted-foreground text-xs'>{row.employee.matricule}</span>
              )}
            </div>
          ) : (
            '—'
          )
      },
      {
        data: 'type_absence',
        label: "Type d'absence",
        sortable: false,
        render: (_v, row) =>
          row.type_absence ? (
            <div className='flex items-center gap-2'>
              {row.type_absence.couleur_hexa && (
                <span
                  className='inline-block h-3 w-3 rounded-full'
                  style={{ backgroundColor: row.type_absence.couleur_hexa }}
                />
              )}
              <span className='font-medium'>{row.type_absence.code}</span>
              <span className='text-muted-foreground text-xs'>
                {row.type_absence.libelle}
              </span>
            </div>
          ) : (
            '—'
          )
      },
      {
        data: 'date_debut',
        label: 'Du',
        sortable: true,
        render: (v) => (v ? format(new Date(v), 'yyyy-MM-dd') : '—')
      },
      {
        data: 'date_fin',
        label: 'Au',
        sortable: true,
        render: (v) => (v ? format(new Date(v), 'yyyy-MM-dd') : '—')
      },
      { data: 'duree', label: 'Durée', sortable: true, width: 90 },
      {
        data: 'justifie',
        label: 'Justifiée',
        sortable: true,
        render: (_v, row) => (
          <Badge
            className={row.justifie ? 'border-emerald-500 text-emerald-600' : 'border-amber-500 text-amber-600'}
            variant='outline'
          >
            {row.justifie ? 'Oui' : 'Non'}
          </Badge>
        )
      },
      {
        data: 'statut',
        label: 'Statut',
        sortable: true,
        render: (v: AbsenceRow['statut'], row) => {
          const map: Record<AbsenceRow['statut'], { text: string; cls: string }>
            = {
              brouillon: { text: 'Brouillon', cls: 'border-gray-400 text-gray-600' },
              validee: { text: 'Validée', cls: 'border-emerald-500 text-emerald-600' },
              annulee: { text: 'Annulée', cls: 'border-rose-500 text-rose-600' },
              cloture: { text: 'Clôturée', cls: 'border-blue-500 text-blue-600' },
              refusee: { text: 'Refusée', cls: 'border-destructive text-destructive' }
            };
          const m = map[v] || map.brouillon;
          return (
            <div>
              <Badge variant='outline' className={m.cls}>
                {m.text}
              </Badge>
              {v === 'refusee' && row.motif_refus && (
                <div className='text-xs text-destructive mt-1'>
                  <span className='font-semibold'>Motif :</span> {row.motif_refus}
                </div>
              )}
            </div>
          );
        }
      },
      {
        data: 'actions',
        label: t('employees.columns.actions'),
        sortable: false,
        render: (_v, row) => {
          const canValidate = row.statut === 'brouillon';
          const canClose = row.statut === 'validee';
          const canCancel = row.statut === 'brouillon' || row.statut === 'validee';
          const canRefuse = row.statut === 'brouillon' || row.statut === 'validee';
          return (
            <div className='flex items-center space-x-2'>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant='outline' className='h-8 w-8 p-1.5' onClick={() => onView(row)}>
                    <Eye className='h-4 w-4' />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Voir</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant='outline' className='h-8 w-8 p-1.5' disabled={!canValidate} onClick={() => onValidate(row)}>
                    <CheckCircle2 className='h-4 w-4 text-emerald-600' />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Valider</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant='outline' className='h-8 w-8 p-1.5' disabled={!canClose} onClick={() => onClose(row)}>
                    <XCircle className='h-4 w-4 text-blue-600' />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Clôturer</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant='outline' className='h-8 w-8 p-1.5' disabled={!canCancel} onClick={() => onCancel(row)}>
                    <CircleX className='h-4 w-4 text-amber-600' />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Annuler</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant='destructive' className='h-8 w-8 p-1.5' disabled={!canRefuse} onClick={() => onRefuse(row)}>
                    <XCircle className='h-4 w-4 text-destructive' />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Refuser</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant='destructive' className='h-8 w-8 p-1.5' onClick={() => onAskDelete(row)}>
                    <Trash2 className='h-4 w-4' />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Supprimer</TooltipContent>
              </Tooltip>
            </div>
          );
        }
      }
    ],
    [t]
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
        field: 'type',
        label: "Type d'absence",
        type: 'datatable-select',
        options: absenceTypes
      },
      {
        field: 'status',
        label: 'Statut',
        type: 'datatable-select',
        options: [
          { label: 'Tous', value: '' },
          { label: 'Brouillon', value: 'brouillon' },
          { label: 'Validée', value: 'validee' },
          { label: 'Annulée', value: 'annulee' },
          { label: 'Clôturée', value: 'cloture' },
          { label: 'Refusée', value: 'refusee' }
        ]
      },
      {
        field: 'from',
        label: 'Du',
        type: 'date'
      },
      {
        field: 'to',
        label: 'Au',
        type: 'date'
      }
    ],
    [absenceTypes, employees]
  );

  return (
    <>
      <div className='mb-2 flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-semibold tracking-tight'>
            {t('absences.title') || 'Absences'}
          </h1>
          <p className='text-muted-foreground text-sm'>
            {t('absences.subtitle') || 'Pilotez les absences'}
          </p>
        </div>
        <Button onClick={() => router.push('/admin/absences/ajouter')}>
          <Plus/>{t('absences.actions.create') || 'Nouvelle absence'}
        </Button>
      </div>
      <div className='flex flex-1 flex-col space-y-4'>
        <CustomTable<AbsenceRow>
          url={apiRoutes.admin.absences.list}
          columns={columns}
          filters={filters}
          onInit={(inst) => setTableInstance(inst)}
        />
        <CustomAlertDialog
          title={'Supprimer cette absence ?'}
          description={'Cette action est irréversible.'}
          cancelText={'Annuler'}
          confirmText={'Supprimer'}
          onConfirm={onConfirmDelete}
          open={!!confirmDeleteId}
          setOpen={(o) => !o ? setConfirmDeleteId(null) : void 0}
        />
        <Dialog open={showRefuseModal} onOpenChange={setShowRefuseModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Refuser l&apos;absence</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <label className="block text-sm font-medium">Motif du refus <span className="text-destructive">*</span></label>
              <Textarea
                value={refuseReason}
                onChange={e => setRefuseReason(e.target.value)}
                rows={4}
                placeholder="Saisir le motif du refus..."
                className="resize-none"
                required
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRefuseModal(false)} disabled={refuseLoading}>
                Annuler
              </Button>
              <Button
                variant="destructive"
                onClick={handleRefuse}
                disabled={refuseLoading || !refuseReason.trim()}
              >
                {refuseLoading ? 'Refus en cours...' : 'Refuser'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
