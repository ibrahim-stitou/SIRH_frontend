'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import CustomTable from '@/components/custom/data-table/custom-table';
import { CustomTableColumn, CustomTableFilterConfig, UseTableReturn } from '@/components/custom/data-table/types';
import { apiRoutes } from '@/config/apiRoutes';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Heading } from '@/components/ui/heading';
import apiClient from '@/lib/api';

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
  const [tableInstance, setTableInstance] = useState<Partial<UseTableReturn<NoteDeFraisRow>> | null>(null);
  const [employees, setEmployees] = useState<{ label: string; value: string | number }[]>([]);

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
    const map: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      draft: { label: 'Brouillon', variant: 'outline' },
      submitted: { label: 'En attente', variant: 'default' },
      approved: { label: 'Approuvée', variant: 'secondary' },
      approved_partial: { label: 'Approuvée partielle', variant: 'secondary' },
      refused: { label: 'Refusée', variant: 'destructive' },
      needs_complement: { label: 'Complément requis', variant: 'outline' }
    };
    const cfg = map[status] || { label: status, variant: 'outline' };
    return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
  };

  const columns: CustomTableColumn<NoteDeFraisRow>[] = [
    { data: 'number', label: 'Numéro', sortable: true },
    {
      data: 'matricule',
      label: 'Employé',
      sortable: true,
      render: (_value, row: any) => (
        <div className='flex flex-col'>
          <div className='font-medium'>{row.employee?.matricule || row.matricule}</div>
          <div className='text-sm text-muted-foreground'>{row.employee?.fullName}</div>
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
    { data: 'status', label: 'Statut', sortable: true, render: (v) => getStatusBadge(v as any) },
    {
      data: 'total',
      label: 'Total',
      sortable: true,
      render: (value) => (
        <div className='font-medium'>
          {new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 }).format(value ?? 0)}
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
              <Button variant='outline' className='h-8 w-8 p-1.5' onClick={() => router.push(`/admin/paie/frais/${row.id}/details`)}>
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
    { field: 'employe_id', label: 'Employé', type: 'datatable-select', options: employees },
    {
      field: 'status',
      label: 'Statut',
      type: 'datatable-select',
      options: [
        { label: 'Tous', value: '' },
        { label: 'Brouillon', value: 'draft' },
        { label: 'En attente', value: 'submitted' },
        { label: 'Approuvée', value: 'approved' },
        { label: 'Approuvée partielle', value: 'approved_partial' },
        { label: 'Refusée', value: 'refused' },
        { label: 'Complément requis', value: 'needs_complement' }
      ]
    }
  ];

  return (
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex justify-between mb-6'>
          <Heading title={'Frais & Déplacements'} description={'Notes de frais et déplacements.'} />
          <Button onClick={() => router.push('/admin/paie/frais/ajouter')}>
            <Plus className='mr-2 h-4 w-4' />
            Ajouter une note de frais
          </Button>
        </div>
        <CustomTable<NoteDeFraisRow>
          columns={columns}
          url={apiRoutes.admin.frais.list}
          filters={filters}
          onInit={(instance) => setTableInstance(instance)}
        />
      </div>

  );
}
