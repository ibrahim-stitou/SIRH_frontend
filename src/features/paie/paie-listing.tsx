'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Eye, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import CustomTable from '@/components/custom/data-table/custom-table';
import {
  CustomTableColumn,
  CustomTableFilterConfig,
  UseTableReturn
} from '@/components/custom/data-table/types';
import { apiRoutes } from '@/config/apiRoutes';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import apiClient from '@/lib/api';
import { toast } from 'sonner';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select';

interface PeriodePaie {
  id: string;
  nom: string;
  mois: number;
  annee: number;
  dateDebut: string;
  dateFin: string;
  dateEcheance: string;
  statut: string;
  nombreEmployes: number;
  montantTotal: number;
}

export default function PaieListing() {
  const router = useRouter();
  const [tableInstance, setTableInstance] = useState<Partial<
    UseTableReturn<PeriodePaie>
  > | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [mois, setMois] = useState<number>(new Date().getMonth() + 1);
  const [annee, setAnnee] = useState<number>(new Date().getFullYear());

  const getStatutBadge = (statut: string) => {
    const variants: Record<
      string,
      {
        label: string;
        variant: 'default' | 'secondary' | 'destructive' | 'outline';
      }
    > = {
      en_cours: { label: 'En cours', variant: 'default' },
      valide: { label: 'Validé', variant: 'secondary' },
      paye: { label: 'Payé', variant: 'outline' },
      cloture: { label: 'Clôturé', variant: 'destructive' }
    };

    const config = variants[statut] || { label: statut, variant: 'outline' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const columns: CustomTableColumn<PeriodePaie>[] = [
    {
      data: 'nom',
      label: 'Période',
      sortable: true,
      render: (value) => <div className='font-medium'>{value}</div>
    },
    {
      data: 'dateDebut',
      label: 'Date début',
      sortable: true,
      render: (value) => format(new Date(value), 'dd MMM yyyy', { locale: fr })
    },
    {
      data: 'dateFin',
      label: 'Date fin',
      sortable: true,
      render: (value) => format(new Date(value), 'dd MMM yyyy', { locale: fr })
    },
    {
      data: 'dateEcheance',
      label: 'Échéance',
      sortable: true,
      render: (value) => format(new Date(value), 'dd MMM yyyy', { locale: fr })
    },
    {
      data: 'nombreEmployes',
      label: 'Employés',
      sortable: true,
      render: (value) => <div>{value}</div>
    },
    {
      data: 'montantTotal',
      label: 'Montant total',
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
      data: 'id',
      label: 'Actions',
      sortable: false,
      render: (_value, row) => (
        <div className='flex'>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='outline'
                className='h-8 w-8 p-1.5'
                onClick={() => router.push(`/admin/paie/${row.id}`)}
              >
                <Eye className='h-4 w-4' />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Consulter</TooltipContent>
          </Tooltip>
        </div>
      )
    }
  ];

  const filters: CustomTableFilterConfig[] = [
    {
      field: 'nom',
      label: 'Période',
      type: 'text'
    },
    {
      field: 'annee',
      label: 'Année',
      type: 'text'
    },
    {
      field: 'statut',
      label: 'Statut',
      type: 'datatable-select',
      options: [
        { label: 'Tous', value: '' },
        { label: 'En cours', value: 'en_cours' },
        { label: 'Validé', value: 'valide' },
        { label: 'Payé', value: 'paye' }
      ]
    }
  ];

  const handleCreatePeriode = async () => {
    setCreateLoading(true);
    try {
      await apiClient.post(apiRoutes.admin.paies.periodes.create, {
        mois,
        annee
      });
      toast.success('Période de paie créée avec succès.');
      setShowCreateModal(false);
      if (tableInstance && typeof tableInstance.refresh === 'function')
        tableInstance.refresh();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          'Erreur lors de la création de la période.'
      );
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <>
      {/* En-tête */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold'>Gestion de la paie</h1>
          <p className='text-muted-foreground'>
            Gérez les périodes de paie, bulletins et virements
          </p>
        </div>
        {/* Bouton pour ouvrir le modal */}
        <Button onClick={() => setShowCreateModal(true)} className='mb-4'>
          <Plus className='mr-2 h-4 w-4' /> Créer une période de paie
        </Button>
      </div>

      {/* Modal de création de période */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer une période de paie</DialogTitle>
          </DialogHeader>
          <div className='flex flex-col gap-4 py-2'>
            <div>
              <label className='mb-1 block font-medium'>Mois</label>
              <Select
                value={String(mois)}
                onValueChange={(v) => setMois(Number(v))}
                disabled={createLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Sélectionner le mois' />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => (
                    <SelectItem key={i + 1} value={String(i + 1)}>
                      {i + 1}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className='mb-1 block font-medium'>Année</label>
              <Select
                value={String(annee)}
                onValueChange={(v) => setAnnee(Number(v))}
                disabled={createLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner l'année" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 11 }, (_, i) => {
                    const year = new Date().getFullYear() - 5 + i;
                    return (
                      <SelectItem key={year} value={String(year)}>
                        {year}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setShowCreateModal(false)}
              disabled={createLoading}
            >
              Annuler
            </Button>
            <Button onClick={handleCreatePeriode} disabled={createLoading}>
              {createLoading ? (
                <span className='mr-2 animate-spin'>⏳</span>
              ) : null}
              Créer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DataTable */}
      <div className='flex flex-1 flex-col space-y-4'>
        <CustomTable<PeriodePaie>
          columns={columns}
          url={apiRoutes.admin.paies.periodes.list}
          filters={filters}
          onInit={(instance) => setTableInstance(instance)}
        />
      </div>
    </>
  );
}
