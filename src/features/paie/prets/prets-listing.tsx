'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Trash2, Plus, Pencil } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import CustomTable from '@/components/custom/data-table/custom-table';
import {
  CustomTableColumn,
  CustomTableFilterConfig,
  UseTableReturn
} from '@/components/custom/data-table/types';
import { apiRoutes } from '@/config/apiRoutes';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import apiClient from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Heading } from '@/components/ui/heading';
import type { PretInterface, PretStatut } from '@/types/pret';

type PretRow = PretInterface;

function StatutBadge({ statut }: { statut: PretStatut | string }) {
  const map: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }>
    = {
      'Brouillon': { label: 'Brouillon', variant: 'outline' },
      'En attente': { label: 'En attente', variant: 'default' },
      'Validé': { label: 'Validé', variant: 'secondary' },
      'Refusé': { label: 'Refusé', variant: 'destructive' },
      'En cours': { label: 'En cours', variant: 'default' },
      'Soldé': { label: 'Soldé', variant: 'secondary' }
    };
  const cfg = map[statut] || { label: String(statut), variant: 'outline' };
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}

export default function PretsListing() {
  const router = useRouter();
  const [tableInstance, setTableInstance] = useState<Partial<UseTableReturn<PretRow>> | null>(null);
  const [loadingDelete, setLoadingDelete] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [employees, setEmployees] = useState<
    { label: string; value: string | number }[]
  >([]);

  useEffect(() => {
    let mounted = true;
    apiClient
      .get(apiRoutes.admin.employees.simpleList)
      .then((res) => {
        const opts = (res.data?.data || res.data || []).map((e: any) => ({
          label: `${e.firstName ?? ''} ${e.lastName ?? ''}${e.matricule ? ' — ' + e.matricule : ''}`.trim(),
          value: e.id
        }));
        if (mounted) setEmployees(opts);
      })
      .catch(async () => {
        try {
          const res = await apiClient.get(apiRoutes.admin.employees.list);
          const opts = (res.data?.data || res.data || []).map((e: any) => ({
            label: `${e.firstName ?? ''} ${e.lastName ?? ''}${e.matricule ? ' — ' + e.matricule : ''}`.trim(),
            value: e.id
          }));
          if (mounted) setEmployees(opts);
        } catch {}
      });
    return () => {
      mounted = false;
    };
  }, []);

  const handleDelete = async (id: number) => {
    setLoadingDelete(id);
    try {
      await apiClient.delete(apiRoutes.admin.prets.delete(id));
      tableInstance?.refresh?.();
    } catch (e) {
      alert('Erreur lors de la suppression.');
    } finally {
      setLoadingDelete(null);
      setConfirmDeleteId(null);
    }
  };

  const currency = (v?: number) =>
    new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD',
      maximumFractionDigits: 0
    }).format(v ?? 0);

  const columns: CustomTableColumn<PretRow>[] = [
    { data: 'id', label: 'ID', sortable: true },
    {
      data: 'employe_id',
      label: 'Employé',
      sortable: true,
      render: (_val, row: any) => (
        <div className='flex flex-col'>
          <div className='font-medium'>{row.employee?.matricule}</div>
          <div className='text-sm text-muted-foreground'>{row.employee?.fullName}</div>
        </div>
      )
    },
    { data: 'date_demande', label: 'Date demande', sortable: true },
    {
      data: 'montant_pret',
      label: 'Montant prêt',
      sortable: true,
      render: (v) => <div className='font-medium'>{currency(v as any)}</div>
    },
    {
      data: 'duree_mois',
      label: 'Durée (mois)',
      sortable: true
    },
    {
      data: 'montant_mensualite',
      label: 'Mensualité',
      sortable: true,
      render: (v) => <div className='font-medium'>{currency(v as any)}</div>
    },
    {
      data: 'type_pret',
      label: 'Type',
      sortable: true
    },
    {
      data: 'statut',
      label: 'Statut',
      sortable: true,
      render: (v) => <StatutBadge statut={String(v)} />
    },
    {
      data: 'periode_paie_depart',
      label: 'Période départ',
      sortable: false,
      render: (v: any) => `${v?.mois ?? ''} ${v?.annee ?? ''}`
    },
    {
      data: 'id',
      label: 'Actions',
      sortable: false,
      render: (_value, row) => (
        <div className='flex gap-2'>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='outline'
                className='h-8 w-8 p-1.5'
                onClick={() => router.push(`/admin/paie/pret/${row.id}/details`)}
              >
                <Eye className='h-4 w-4' />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Consulter</TooltipContent>
          </Tooltip>
          {row.statut === 'Brouillon' && (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant='outline'
                    className='h-8 w-8 p-1.5'
                    onClick={() => router.push(`/admin/paie/pret/${row.id}/modifier`)}
                  >
                    <Pencil className='h-4 w-4' />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Modifier</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant='destructive'
                    className='h-8 w-8 p-1.5'
                    onClick={() => setConfirmDeleteId(row.id)}
                    disabled={loadingDelete === row.id}
                  >
                    <Trash2 className='h-4 w-4' />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Supprimer</TooltipContent>
              </Tooltip>
            </>
          )}
        </div>
      )
    }
  ];

  const filters: CustomTableFilterConfig[] = [
    {
      field: 'employe_id',
      label: 'Employé',
      type: 'datatable-select',
      options: employees
    },
    {
      field: 'statut',
      label: 'Statut',
      type: 'datatable-select',
      options: [
        { label: 'Tous', value: '' },
        { label: 'Brouillon', value: 'Brouillon' },
        { label: 'En attente', value: 'En attente' },
        { label: 'Validé', value: 'Validé' },
        { label: 'Refusé', value: 'Refusé' },
        { label: 'En cours', value: 'En cours' },
        { label: 'Soldé', value: 'Soldé' }
      ]
    },
    {
      field: 'type_pret',
      label: 'Type de prêt',
      type: 'datatable-select',
      options: [
        { label: 'Tous', value: '' },
        { label: 'Sans intérêt', value: 'Sans intérêt' },
        { label: 'Avec intérêt', value: 'Avec intérêt' },
        { label: 'Social', value: 'Social' },
        { label: 'Exceptionnel', value: 'Exceptionnel' }
      ]
    }
  ];

  return (
    <div className='flex flex-1 flex-col space-y-4'>
      <div className='flex justify-between mb-6'>
        <Heading
          title={'Gestion des prêts'}
          description={"Liste des demandes de prêt en cours."}
        />
        <Button onClick={() => router.push('/admin/paie/pret/ajouter')}>
          <Plus className='mr-2 h-4 w-4' />
          Nouvelle demande de prêt
        </Button>
      </div>
      <CustomTable<PretRow>
        columns={columns}
        url={apiRoutes.admin.prets.list}
        filters={filters}
        onInit={(instance) => setTableInstance(instance)}
      />
      <Dialog open={!!confirmDeleteId} onOpenChange={(o) => !o && setConfirmDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer le prêt (brouillon)&nbsp;?</DialogTitle>
          </DialogHeader>
          <p className='text-muted-foreground text-sm'>Cette action est irréversible.</p>
          <DialogFooter>
            <Button variant='outline' onClick={() => setConfirmDeleteId(null)}>
              Annuler
            </Button>
            <Button
              variant='destructive'
              onClick={() => confirmDeleteId && handleDelete(confirmDeleteId)}
              disabled={loadingDelete !== null}
            >
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
