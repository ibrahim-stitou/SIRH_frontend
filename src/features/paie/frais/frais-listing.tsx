'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Plus, Edit as EditIcon, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import CustomTable from '@/components/custom/data-table/custom-table';
import {
  CustomTableColumn,
  CustomTableFilterConfig
} from '@/components/custom/data-table/types';
import { apiRoutes } from '@/config/apiRoutes';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { Heading } from '@/components/ui/heading';
import apiClient from '@/lib/api';
import { deleteFrais } from '@/services/frais';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';

interface NoteDeFraisRow {
  id: number;
  number: string;
  employe_id?: number;
  employee?: { fullName?: string; matricule?: string };
  matricule: string;
  subject: string;
  startDate: string;
  endDate: string;
  status: string;
  total: number;
}

export default function FraisListing() {
  const router = useRouter();
  const [employees, setEmployees] = useState<
    { label: string; value: string | number }[]
  >([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

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

  const getStatusBadge = (status: string) => {
    const map: Record<
      string,
      {
        label: string;
        variant: 'default' | 'secondary' | 'destructive' | 'outline';
        className: string;
      }
    > = {
      draft: {
        label: 'Brouillon',
        variant: 'secondary',
        className: 'bg-yellow-100 text-yellow'
      },
      submitted: {
        label: 'En attente',
        variant: 'secondary',
        className: 'bg-blue-100 text-blue-700'
      },
      approved: {
        label: 'Approuvée',
        variant: 'secondary',
        className: 'bg-purple-100 text-purple-700 border'
      },
      approved_partial: {
        label: 'Approuvée partiellement',
        variant: 'secondary',
        className: 'bg-green-50 text-green-700 border'
      },
      refused: {
        label: 'Refusée',
        variant: 'secondary',
        className: 'bg-red-100 text-red-500'
      },
      needs_complement: {
        label: 'Complément requis',
        variant: 'secondary',
        className: 'bg-orange-100 text-orange-700'
      }
    };
    const cfg = map[status] || {
      label: status,
      variant: 'outline',
      className: ''
    };
    return (
      <Badge variant={cfg.variant} className={cfg.className}>
        {cfg.label}
      </Badge>
    );
  };

  const handleDeleteClick = (id: number) => {
    setNoteToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!noteToDelete) return;

    setDeleting(true);
    try {
      await deleteFrais(noteToDelete);
      toast.success('Note de frais supprimée avec succès');
      setDeleteDialogOpen(false);
      setNoteToDelete(null);
      // Trigger table refresh
      setRefreshKey((prev) => prev + 1);
    } catch (e: any) {
      toast.error(e.message || 'Erreur lors de la suppression');
    } finally {
      setDeleting(false);
    }
  };

  const columns: CustomTableColumn<NoteDeFraisRow>[] = [
    { data: 'number', label: 'Numéro', sortable: true },
    {
      data: 'matricule',
      label: 'Employé',
      sortable: true,
      render: (_value, row: any) => (
        <div className='flex flex-col'>
          <div className='font-medium'>
            {row.employee?.matricule || row.matricule}
          </div>
          <div className='text-muted-foreground text-sm'>
            {row.employee?.fullName}
          </div>
        </div>
      )
    },
    { data: 'subject', label: 'Objet', sortable: true },
    {
      data: 'startDate',
      label: 'Période',
      sortable: false,
      render: (_value, row) => (
        <span>
          {row.startDate} → {row.endDate}
        </span>
      )
    },
    {
      data: 'status',
      label: 'Statut',
      sortable: true,
      render: (v) => getStatusBadge(v as any)
    },
    {
      data: 'total',
      label: 'Total',
      sortable: true,
      render: (value) => (
        <div className='font-medium'>
          {new Intl.NumberFormat('fr-MA', {
            style: 'currency',
            currency: 'MAD',
            maximumFractionDigits: 0
          }).format(value ?? 0)}
        </div>
      )
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
                onClick={() =>
                  router.push(`/admin/paie/frais/${row.id}/details`)
                }
              >
                <Eye className='h-4 w-4' />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Consulter</TooltipContent>
          </Tooltip>
          {row.status === 'draft' && (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant='secondary'
                    className='h-8 w-8 p-1.5'
                    onClick={() =>
                      router.push(`/admin/paie/frais/${row.id}/modifier`)
                    }
                  >
                    <EditIcon className='h-4 w-4' />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Modifier</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant='destructive'
                    className='h-8 w-8 p-1.5'
                    onClick={() => handleDeleteClick(row.id)}
                  >
                    <Trash2 className='h-4 w-4' />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className='bg-red-100 text-red-500'>
                  Supprimer
                </TooltipContent>
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
      field: 'status',
      label: 'Statut',
      type: 'datatable-select',
      options: [
        { label: 'Tous', value: '' },
        { label: 'Brouillon', value: 'draft' },
        { label: 'En attente', value: 'submitted' },
        { label: 'Approuvée', value: 'approved' },
        { label: 'Approuvée partiellement', value: 'approved_partial' },
        { label: 'Refusée', value: 'refused' },
        { label: 'Complément requis', value: 'needs_complement' }
      ]
    }
  ];

  return (
    <div className='flex flex-1 flex-col space-y-4'>
      <div className='mb-6 flex justify-between'>
        <Heading
          title={'Frais & Déplacements'}
          description={'Notes de frais et déplacements.'}
        />
        <Button onClick={() => router.push('/admin/paie/frais/ajouter')}>
          <Plus className='mr-2 h-4 w-4' />
          Ajouter une note de frais
        </Button>
      </div>
      <CustomTable<NoteDeFraisRow>
        key={refreshKey}
        columns={columns}
        url={apiRoutes.admin.frais.list}
        filters={filters}
        infoText={{
          title: 'Statuts des notes de frais',
          description: `Les notes de frais passent par plusieurs statuts :
- Brouillon : la note n'est pas encore soumise.
- En attente : en cours de validation par le responsable.
- Approuvée / Approuvée partiellement : validée totalement ou en partie.
- Refusée : la note a été rejetée.

Utilisez ces statuts pour suivre l'avancement et la gestion de vos demandes.`
        }}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className='flex items-center gap-2'>
              <Trash2 className='text-destructive h-5 w-5' />
              Supprimer la note de frais
            </AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer définitivement cette note de
              frais ? Cette action est irréversible et toutes les données
              associées seront perdues.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className='bg-destructive hover:bg-destructive/90'
            >
              {deleting ? 'Suppression...' : 'Supprimer définitivement'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
