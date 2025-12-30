'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Trash2, Plus } from 'lucide-react';
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

interface Avance {
  id: number;
  employe_id: number;
  date_demande: string;
  statut: string;
  montant_total: number;
  cree_par: string;
  valide_par?: string | null;
  date_validation?: string | null;
  created_at: string;
  updated_at: string;
  periode_paie: { mois: string; annee: number };
  motif_refus?: string;
}

export default function AvancesListing() {
  const router = useRouter();
  const [tableInstance, setTableInstance] = useState<Partial<UseTableReturn<Avance>> | null>(null);
  const [loadingDelete, setLoadingDelete] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const getStatutBadge = (statut: string) => {
    const variants: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; }> = {
      BROUILLON: { label: 'Brouillon', variant: 'outline' },
      EN_ATTENTE: { label: 'En attente', variant: 'default' },
      VALIDE: { label: 'Validé', variant: 'secondary' },
      REFUSE: { label: 'Refusé', variant: 'destructive' }
    };
    const config = variants[statut] || { label: statut, variant: 'outline' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  // Suppression d'une avance brouillon
  const handleDelete = async (id: number) => {
    setLoadingDelete(id);
    try {
      await apiClient.delete(apiRoutes.admin.avances.delete(id));
      // Rafraîchir la table
      tableInstance?.reload?.();
    } catch (e) {
      alert('Erreur lors de la suppression.');
    } finally {
      setLoadingDelete(null);
      setConfirmDeleteId(null);
    }
  };

  const columns: CustomTableColumn<Avance>[] = [
    {
      data: 'id',
      label: 'ID',
      sortable: true
    },
    {
      data: 'employe_id',
      label: 'Employé',
      sortable: true,
      render: (_value, row: any) => (
        <div className='flex flex-col'>
          <div className='font-medium'>{row.employee?.matricule}</div>
          <div className='text-sm text-muted-foreground'>{row.employee?.fullName}</div>
        </div>
      )
    },
    {
      data: 'date_demande',
      label: 'Date demande',
      sortable: true
    },
    {
      data: 'montant_total',
      label: 'Montant',
      sortable: true,
      render: (value) => (
        <div className='font-medium'>
          {new Intl.NumberFormat('fr-MA', {
            style: 'currency',
            currency: 'MAD',
            maximumFractionDigits: 0
          }).format(value)}
        </div>
      )
    },
    {
      data: 'statut',
      label: 'Statut',
      sortable: true,
      render: (value) => getStatutBadge(value)
    },
    {
      data: 'periode_paie',
      label: 'Période de paie',
      sortable: false,
      render: (value) => `${value.mois} ${value.annee}`
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
                onClick={() => router.push(`/admin/paie/avance/${row.id}`)}
              >
                <Eye className='h-4 w-4' />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Consulter</TooltipContent>
          </Tooltip>
          {row.statut === 'BROUILLON' && (
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
          )}
        </div>
      )
    }
  ];

  const filters: CustomTableFilterConfig[] = [
    { field: 'employe_id', label: 'Employé', type: 'text' },
    { field: 'statut', label: 'Statut', type: 'datatable-select', options: [
      { label: 'Tous', value: '' },
      { label: 'Brouillon', value: 'BROUILLON' },
      { label: 'En attente', value: 'EN_ATTENTE' },
      { label: 'Validé', value: 'VALIDE' },
      { label: 'Refusé', value: 'REFUSE' }
    ] }
  ];

  return (
    <div className='flex flex-1 flex-col space-y-4'>
      <div className='flex justify-end mb-2'>
        <Button onClick={() => router.push('/admin/paie/avance/new')}>
          <Plus className='mr-2 h-4 w-4' />
          Ajouter une nouvelle demande d&apos;avance
        </Button>
      </div>
      <CustomTable<Avance>
        columns={columns}
        url={apiRoutes.admin.avances.list}
        filters={filters}
        onInit={(instance) => setTableInstance(instance)}
      />
      <Dialog open={!!confirmDeleteId} onOpenChange={(o) => !o && setConfirmDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer l&apos;avance (brouillon)&nbsp;?</DialogTitle>
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