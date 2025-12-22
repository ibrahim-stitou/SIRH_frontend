'use client';

import React, { useState } from 'react';
import { Eye, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip';
import CustomAlertDialog from '@/components/custom/customAlert';
import CustomTable from '@/components/custom/data-table/custom-table';
import {
  CustomTableColumn,
  CustomTableFilterConfig,
  UseTableReturn
} from '@/components/custom/data-table/types';
import { apiRoutes } from '@/config/apiRoutes';
import apiClient from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext';
import { StatusBadge } from '@/components/custom/status-badge';

// Minimal subset of Employee fields for listing
interface EmployeeRow {
  id: number;
  matricule: string;
  firstName: string;
  lastName: string;
  firstNameAr?: string;
  lastNameAr?: string;
  email: string;
  departmentId: string;
  professionalCategory: string;
  hireDate: string;
  contractType: string;
  status: string; // 'actif' | 'suspendu' | 'parti'
  isActive?: boolean;
  baseSalary?: number;
  currency?: string;
  actions?: number; // optional synthetic
}

export function EmployeeListing() {
  const router = useRouter();
  const { t } = useLanguage();
  const [tableInstance, setTableInstance] = useState<Partial<
    UseTableReturn<EmployeeRow>
  > | null>(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(
    null
  );
  const [openDeleteModal, setOpenDeleteModal] = useState(false);

  const handleDelete = (id: number) => {
    setSelectedEmployeeId(id);
    setOpenDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedEmployeeId !== null) {
      try {
        const response = await apiClient.delete(
          apiRoutes.admin.employees.delete(selectedEmployeeId)
        );
        if (response.data) {
          toast.success(t('employees.messages.deleted'));
          if (tableInstance && tableInstance.refresh) {
            tableInstance.refresh();
          }
        } else {
          toast.error(t('employees.messages.deleteError'));
        }
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message || t('employees.messages.deleteError');
        toast.error(`${t('common.error')}: ${errorMessage}`);
      }
      setOpenDeleteModal(false);
    }
  };

  const columns: CustomTableColumn<EmployeeRow>[] = [
    { data: 'id', label: t('employees.columns.id'), sortable: true },
    {
      data: 'matricule',
      label: t('employees.columns.matricule'),
      sortable: true
    },
    {
      data: 'firstName',
      label: t('employees.columns.name'),
      sortable: true,
      render: (_value, row) => `${row.firstName} ${row.lastName}`
    },
    {
      data: 'professionalCategory',
      label: 'Catégorie professionnelle',
      sortable: true,
      render: (_value, row) => {
        const map: Record<string, string> = {
          cadres_assimiles: 'Cadres et assimilés',
          employes_assimiles: 'Employés et assimilés',
          ouvriers_assimiles: 'Ouvriers et assimilés'
        };
        return map[row.professionalCategory] || '—';
      }
    },
    { data: 'email', label: t('employees.columns.email'), sortable: true },
    {
      data: 'hireDate',
      label: t('employees.columns.hireDate'),
      sortable: true
    },
    {
      data: 'contractType',
      label: t('employees.columns.contractType'),
      sortable: true
    },
    {
      data: 'status',
      label: t('employees.columns.status'),
      sortable: true,
      render: (value) => {
        const map: Record<
          string,
          { label: string; tone: 'success' | 'warning' | 'danger' | 'neutral' }
        > = {
          actif: { label: t('employees.status.actif'), tone: 'success' },
          suspendu: { label: t('employees.status.suspendu'), tone: 'warning' },
          parti: { label: t('employees.status.parti'), tone: 'danger' }
        };
        const m = map[value] || { label: value, tone: 'neutral' };
        return <StatusBadge label={m.label} tone={m.tone} />;
      }
    },
    {
      data: 'actions',
      label: t('employees.columns.actions'),
      sortable: false,
      render: (_value, row) => (
        <div className='flex items-center space-x-2'>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='outline'
                className='h-8 w-8 p-1.5'
                onClick={() =>
                  router.push(`/admin/personnel/employes/${row.id}/details`)
                }
              >
                <Eye className='h-4 w-4' />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t('common.view')}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='destructive'
                className='h-8 w-8 bg-red-100 p-1.5 text-red-600 hover:bg-red-200'
                onClick={() => handleDelete(row.id)}
              >
                <Trash2 className='h-4 w-4' />
              </Button>
            </TooltipTrigger>
            <TooltipContent
              className='tooltip-content rounded-md bg-red-100 px-2 py-1 text-red-600 shadow-md'
              sideOffset={5}
            >
              {t('common.delete')}
            </TooltipContent>
          </Tooltip>
        </div>
      )
    }
  ];

  const filters: CustomTableFilterConfig[] = [
    {
      field: 'nom',
      label: t('employees.filters.name'),
      type: 'text'
    },
    {
      field: 'matricule',
      label: t('employees.filters.matricule'),
      type: 'text'
    },
    {
      field: 'contractType',
      label: t('employees.filters.contractType'),
      type: 'datatable-select',
      options: [
        { label: 'Tous', value: '' },
        { label: 'CDI', value: 'CDI' },
        { label: 'CDD', value: 'CDD' },
        { label: 'Stage', value: 'Stage' },
        { label: 'Intérim', value: 'Interim' }
      ]
    },
    {
      field: 'status',
      label: t('employees.filters.status'),
      type: 'datatable-select',
      options: [
        { label: 'Tous', value: '' },
        { label: t('employees.status.actif'), value: 'actif' },
        { label: t('employees.status.suspendu'), value: 'suspendu' },
        { label: t('employees.status.parti'), value: 'parti' }
      ]
    }
  ];

  return (
    <>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-semibold tracking-tight'>
            {t('employees.title')}
          </h1>
          <p className='text-muted-foreground text-sm'>
            {t('employees.subtitle')}
          </p>
        </div>
        <Button
          onClick={() => router.push('/admin/personnel/employes/ajouter')}
        >
          {t('employees.actions.create')}
        </Button>
      </div>
      <div className='flex flex-1 flex-col space-y-4'>
        <CustomTable<EmployeeRow>
          columns={columns}
          url={apiRoutes.admin.employees.list}
          filters={filters}
          onInit={(instance) => setTableInstance(instance)}
        />
        <CustomAlertDialog
          title={t('employees.dialog.delete.title')}
          description={t('employees.dialog.delete.description')}
          cancelText={t('common.cancel')}
          confirmText={t('common.delete')}
          onConfirm={handleConfirmDelete}
          open={openDeleteModal}
          setOpen={setOpenDeleteModal}
        />
      </div>
    </>
  );
}

export default EmployeeListing;
