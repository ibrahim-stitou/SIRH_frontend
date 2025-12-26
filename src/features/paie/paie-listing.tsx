'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Eye, Plus, Calendar, Users, DollarSign } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import CustomTable from '@/components/custom/data-table/custom-table';
import {
  CustomTableColumn,
  CustomTableFilterConfig,
  UseTableReturn
} from '@/components/custom/data-table/types';
import { apiRoutes } from '@/config/apiRoutes';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

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

  const getStatutBadge = (statut: string) => {
    const variants: Record<
      string,
      { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
    > = {
      en_cours: { label: 'En cours', variant: 'default' },
      valide: { label: 'Validé', variant: 'secondary' },
      paye: { label: 'Payé', variant: 'outline' },
    };

    const config = variants[statut] || { label: statut, variant: 'outline' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const columns: CustomTableColumn<PeriodePaie>[] = [
    {
      data: 'nom',
      label: 'Période',
      sortable: true,
      render: (value) => <div className="font-medium">{value}</div>,
    },
    {
      data: 'dateDebut',
      label: 'Date début',
      sortable: true,
      render: (value) => format(new Date(value), 'dd MMM yyyy', { locale: fr }),
    },
    {
      data: 'dateFin',
      label: 'Date fin',
      sortable: true,
      render: (value) => format(new Date(value), 'dd MMM yyyy', { locale: fr }),
    },
    {
      data: 'dateEcheance',
      label: 'Échéance',
      sortable: true,
      render: (value) => format(new Date(value), 'dd MMM yyyy', { locale: fr }),
    },
    {
      data: 'nombreEmployes',
      label: 'Employés',
      sortable: true,
      render: (value) => <div>{value}</div>,
    },
    {
      data: 'montantTotal',
      label: 'Montant total',
      sortable: true,
      render: (value) => (
        <div className="font-medium">
          {new Intl.NumberFormat('fr-MA', {
            style: 'currency',
            currency: 'MAD',
            maximumFractionDigits: 0,
          }).format(value)}
        </div>
      ),
    },
    {
      data: 'statut',
      label: 'Statut',
      sortable: true,
      render: (value) => getStatutBadge(value),
    },
    {
      data: 'id',
      label: 'Actions',
      sortable: false,
      render: (_value, row) => (
        <div className="flex ">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                className="h-8 w-8 p-1.5"
                onClick={() => router.push(`/admin/paie/${row.id}`)}
              >
                <Eye className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Consulter</TooltipContent>
          </Tooltip>
        </div>
      ),
    },
  ];

  const filters: CustomTableFilterConfig[] = [
    {
      field: 'nom',
      label: 'Période',
      type: 'text',
    },
    {
      field: 'annee',
      label: 'Année',
      type: 'text',
    },
    {
      field: 'statut',
      label: 'Statut',
      type: 'datatable-select',
      options: [
        { label: 'Tous', value: '' },
        { label: 'En cours', value: 'en_cours' },
        { label: 'Validé', value: 'valide' },
        { label: 'Payé', value: 'paye' },
      ],
    },
  ];

  // Calculer les statistiques depuis les données de la table
  const stats = {
    totalPeriodes: (tableInstance?.data?.length as number) || 0,
    periodesEnCours: 0, // À calculer depuis les données filtrées si nécessaire
    totalEmployes: 0,
    montantTotal: 0,
  };

  return (
    <>
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion de la paie</h1>
          <p className="text-muted-foreground">
            Gérez les périodes de paie, bulletins et virements
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle période
        </Button>
      </div>


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

