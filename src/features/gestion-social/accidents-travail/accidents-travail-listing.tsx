'use client';

import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import CustomTable from '@/components/custom/data-table/custom-table';
import { useEffect, useMemo, useState, useCallback } from 'react';
import {
  CustomTableColumn,
  CustomTableFilterConfig,
  UseTableReturn
} from '@/components/custom/data-table/types';
import { apiRoutes } from '@/config/apiRoutes';
import apiClient from '@/lib/api';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Plus,
  Eye,
  Edit,
  Trash2,
  FileText,
  Send,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip';
import CustomAlertDialog from '@/components/custom/customAlert';
import { toast } from 'sonner';
import { StatusBadge } from '@/components/custom/status-badge';

import { Badge } from '@/components/ui/badge';
import { AccidentTravail } from '../../../../types/accidentsTravail';

export default function AccidentsTravailListing() {
  const { t } = useLanguage();
  const router = useRouter();

  const [_tableInstance, setTableInstance] = useState<Partial<
    UseTableReturn<AccidentTravail>
  > | null>(null);

  const [employees, setEmployees] = useState<
    { label: string; value: string | number }[]
  >([]);

  const [confirmDeleteId, setConfirmDeleteId] = useState<
    number | string | null
  >(null);

  // Load employees for filters
  useEffect(() => {
    let mounted = true;
    apiClient
      .get(apiRoutes.admin.employees.simpleList)
      .then((res) => {
        if (!mounted) return;
        const list = (res.data?.data || []).map((emp: any) => ({
          label: `${emp.firstName} ${emp.lastName}${emp.matricule ? ' (' + emp.matricule + ')' : ''}`,
          value: emp.id
        }));
        setEmployees([{ label: 'Tous les employés', value: '' }, ...list]);
      })
      .catch((err) => {
        console.error('Error loading employees:', err);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const onView = useCallback(
    (row: AccidentTravail) => {
      router.push(`/admin/gestion-social/accidents-travail/${row.id}`);
    },
    [router]
  );

  const onEdit = useCallback(
    (row: AccidentTravail) => {
      router.push(`/admin/gestion-social/accidents-travail/${row.id}/modifier`);
    },
    [router]
  );

  const onDeclarerCNSS = useCallback(
    async (row: AccidentTravail) => {
      try {
        await apiClient.patch(apiRoutes.admin.accidentsTravail.declarerCNSS(row.id));
        toast.success('Dossier transmis à la CNSS avec succès');
        _tableInstance?.refresh?.();
      } catch (e: any) {
        toast.error(e?.response?.data?.message || 'Erreur lors de la déclaration CNSS');
      }
    },
    [_tableInstance]
  );

  const onCloturer = useCallback(
    async (row: AccidentTravail) => {
      try {
        await apiClient.patch(apiRoutes.admin.accidentsTravail.cloturer(row.id));
        toast.success('Accident clôturé avec succès');
        _tableInstance?.refresh?.();
      } catch (e: any) {
        toast.error(e?.response?.data?.message || 'Erreur lors de la clôture');
      }
    },
    [_tableInstance]
  );

  const onAskDelete = (row: AccidentTravail) => setConfirmDeleteId(row.id);

  const onConfirmDelete = async () => {
    if (!confirmDeleteId) return;
    try {
      await apiClient.delete(
        apiRoutes.admin.accidentsTravail.delete(confirmDeleteId)
      );
      toast.success('Accident supprimé avec succès');
      setConfirmDeleteId(null);
      _tableInstance?.refresh?.();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const columns: CustomTableColumn<AccidentTravail>[] = useMemo(
    () => [
  
      {
        data: 'employe',
        label: 'Employé',
        sortable: false,
        render: (_v, row) =>
          row.employe ? (
            <div className='flex flex-col'>
              <span className='font-medium'>{`${row.employe.prenom} ${row.employe.nom}`}</span>
              <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                {row.employe.matricule && <span>{row.employe.matricule}</span>}
                {row.employe.numeroCNSS && (
                  <>
                    <span>•</span>
                    <span>CNSS: {row.employe.numeroCNSS}</span>
                  </>
                )}
              </div>
            </div>
          ) : (
            '—'
          )
      },
      {
        data: 'dateHeureAccident',
        label: 'Date & Heure',
        sortable: true,
        render: (v) =>
          v ? (
            <div className='flex flex-col'>
              <span>{format(new Date(v), 'dd/MM/yyyy', { locale: fr })}</span>
              <span className='text-xs text-muted-foreground'>
                {format(new Date(v), 'HH:mm', { locale: fr })}
              </span>
            </div>
          ) : (
            '—'
          )
      },
      {
        data: 'typeAccident',
        label: 'Type',
        sortable: true,
        render: (v: AccidentTravail['typeAccident']) => (
          <Badge variant={v === 'Sur site' ? 'default' : 'secondary'}>
            {v}
          </Badge>
        )
      },
      {
        data: 'gravite',
        label: 'Gravité',
        sortable: true,
        render: (v: AccidentTravail['gravite']) => {
          const colors = {
            Léger: 'bg-green-100 text-green-700 border-green-300',
            Moyen: 'bg-orange-100 text-orange-700 border-orange-300',
            Grave: 'bg-red-100 text-red-700 border-red-300'
          };
          return (
            <Badge className={colors[v]} variant="outline">
              {v}
            </Badge>
          );
        }
      },
      {
        data: 'arretTravail',
        label: 'Arrêt',
        sortable: false,
        render: (_v, row) =>
          row.arretTravail.existe ? (
            <div className='flex flex-col'>
              <StatusBadge tone='warning' label='Oui' />
              {row.arretTravail.dureePrevisionnelle && (
                <span className='text-xs text-muted-foreground'>
                  {row.arretTravail.dureePrevisionnelle} jours
                </span>
              )}
            </div>
          ) : (
            <StatusBadge tone='success' label='Non' />
          )
      },
      {
        data: 'delaiDeclarationRespect',
        label: 'Délai 48h',
        sortable: true,
        render: (v: boolean) =>
          v ? (
            <div className='flex items-center gap-1 text-green-600'>
              <CheckCircle2 className='h-4 w-4' />
              <span className='text-xs'>Respecté</span>
            </div>
          ) : (
            <div className='flex items-center gap-1 text-red-600'>
              <AlertTriangle className='h-4 w-4' />
              <span className='text-xs'>Hors délai</span>
            </div>
          )
      },
      {
        data: 'statut',
        label: 'Statut',
        sortable: true,
        render: (v: AccidentTravail['statut']) => {
          const map: Record<
            string,
            { text: string; tone: 'neutral' | 'success' | 'danger' | 'warning' | 'info' }
          > = {
            'Brouillon': { text: 'Brouillon', tone: 'neutral' },
            'Déclaré': { text: 'Déclaré', tone: 'info' },
            'Transmis CNSS': { text: 'Transmis CNSS', tone: 'warning' },
            'En instruction': { text: 'En instruction', tone: 'warning' },
            'Accepté': { text: 'Accepté', tone: 'success' },
            'Refusé': { text: 'Refusé', tone: 'danger' },
            'Clos': { text: 'Clos', tone: 'neutral' }
          };
          const m = map[v] || map['Brouillon'];
          return <StatusBadge label={m.text} tone={m.tone} />;
        }
      },
      {
        data: 'suiviCNSS',
        label: 'CNSS',
        sortable: false,
        render: (_v, row) =>
          row.suiviCNSS.numeroRecepisse ? (
            <div className='flex flex-col text-xs'>
              <span className='font-mono text-muted-foreground'>
                {row.suiviCNSS.numeroRecepisse}
              </span>
              {row.suiviCNSS.tauxIPP !== null && (
                <span className='text-blue-600'>IPP: {row.suiviCNSS.tauxIPP}%</span>
              )}
            </div>
          ) : (
            <span className='text-xs text-muted-foreground'>Non transmis</span>
          )
      },
      {
        data: 'actions',
        label: 'Actions',
        sortable: false,
        render: (_v, row) => {
          const canEdit = row.statut === 'Brouillon' || row.statut === 'Déclaré';
          const canDeclareCNSS = row.statut === 'Déclaré' && !row.suiviCNSS.dateEnvoi;
          const canCloturer = row.statut === 'Accepté';
          const canDelete = row.statut === 'Brouillon';

          return (
            <div className='flex items-center space-x-2'>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant='outline'
                    className='h-8 w-8 p-1.5'
                    onClick={() => onView(row)}
                  >
                    <Eye className='h-4 w-4' />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Voir détails</TooltipContent>
              </Tooltip>

              {canEdit && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant='outline'
                      className='h-8 w-8 p-1.5'
                      onClick={() => onEdit(row)}
                    >
                      <Edit className='h-4 w-4' />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Modifier</TooltipContent>
                </Tooltip>
              )}

              {canDeclareCNSS && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant='outline'
                      className='h-8 w-8 p-1.5 text-blue-600'
                      onClick={() => onDeclarerCNSS(row)}
                    >
                      <Send className='h-4 w-4' />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Déclarer à la CNSS</TooltipContent>
                </Tooltip>
              )}

              {canCloturer && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant='outline'
                      className='h-8 w-8 p-1.5 text-green-600'
                      onClick={() => onCloturer(row)}
                    >
                      <CheckCircle2 className='h-4 w-4' />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Clôturer</TooltipContent>
                </Tooltip>
              )}

              {canDelete && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      className='h-8 w-8 bg-red-100 p-1.5 text-red-600 hover:bg-red-200'
                      onClick={() => onAskDelete(row)}
                    >
                      <Trash2 className='h-4 w-4' />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Supprimer</TooltipContent>
                </Tooltip>
              )}
            </div>
          );
        }
      }
    ],
    [onView, onEdit, onDeclarerCNSS, onCloturer]
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
        field: 'typeAccident',
        label: "Type d'accident",
        type: 'datatable-select',
        options: [
          { label: 'Tous', value: '' },
          { label: 'Sur site', value: 'Sur site' },
          { label: 'Trajet', value: 'Trajet' }
        ]
      },
      {
        field: 'gravite',
        label: 'Gravité',
        type: 'datatable-select',
        options: [
          { label: 'Toutes', value: '' },
          { label: 'Léger', value: 'Léger' },
          { label: 'Moyen', value: 'Moyen' },
          { label: 'Grave', value: 'Grave' }
        ]
      },
      {
        field: 'statut',
        label: 'Statut',
        type: 'datatable-select',
        options: [
          { label: 'Tous', value: '' },
          { label: 'Brouillon', value: 'Brouillon' },
          { label: 'Déclaré', value: 'Déclaré' },
          { label: 'Transmis CNSS', value: 'Transmis CNSS' },
          { label: 'En instruction', value: 'En instruction' },
          { label: 'Accepté', value: 'Accepté' },
          { label: 'Refusé', value: 'Refusé' },
          { label: 'Clos', value: 'Clos' }
        ]
      },
      {
        field: 'arretTravail',
        label: 'Arrêt de travail',
        type: 'datatable-select',
        options: [
          { label: 'Tous', value: '' },
          { label: 'Avec arrêt', value: 'true' },
          { label: 'Sans arrêt', value: 'false' }
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
    [employees]
  );

  return (
    <>
      <div className='mb-2 flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-semibold tracking-tight'>
            Accidents du travail
          </h1>
          <p className='text-muted-foreground text-sm'>
            Gestion complète des accidents du travail et déclarations CNSS
          </p>
        </div>
        <div className='flex gap-2'>
          <Button
            variant='outline'
            onClick={() => router.push('/admin/gestion-social/accidents-travail/statistiques')}
          >
            <FileText className='mr-2 h-4 w-4' />
            Statistiques
          </Button>
          <Button onClick={() => router.push('/admin/gestion-social/accidents-travail/ajouter')}>
            <Plus className='mr-2 h-4 w-4' />
            Déclarer un accident
          </Button>
        </div>
      </div>

      <div className='flex flex-1 flex-col space-y-4'>
        <CustomTable<AccidentTravail>
          url={apiRoutes.admin.accidentsTravail.list}
          columns={columns}
          filters={filters}
          onInit={(inst) => setTableInstance(inst)}
        />

        <CustomAlertDialog
          title='Supprimer cet accident ?'
          description='Cette action est irréversible. Toutes les données associées seront supprimées.'
          cancelText='Annuler'
          confirmText='Supprimer'
          onConfirm={onConfirmDelete}
          open={!!confirmDeleteId}
          setOpen={(o) => (!o ? setConfirmDeleteId(null) : void 0)}
        />
      </div>
    </>
  );
}

