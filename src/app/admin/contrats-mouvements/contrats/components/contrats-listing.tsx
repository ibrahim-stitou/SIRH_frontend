'use client';

import React, { useState, useEffect } from 'react';
import { Eye, Trash2, Plus } from 'lucide-react';
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

// Row type mapped for CustomTable consumption
interface ContractRow {
  id: number | string;
  reference?: string;
  employee?: {
    id: number;
    firstName: string;
    lastName: string;
    matricule: string;
    email?: string;
  } | null;
  employee_name?: string;
  employee_matricule?: string;
  type?: string; // New format
  type_contrat?: string; // Old format: 'CDI' | 'CDD' | 'Stage' | 'Intérim' | 'Apprentissage' | 'Autre'
  job?: {
    metier?: string;
    emploie?: string;
    poste?: string;
    work_mode?: string;
    // Old format
    title?: string;
    department?: string;
  };
  poste?: string; // Old format
  departement?: string; // Old format
  schedule?: {
    schedule_type?: string;
    shift_work?: string;
  };
  dates?: {
    start_date: string;
    end_date: string | null;
  };
  date_debut?: string; // Old format
  date_fin?: string | null; // Old format
  salary?: {
    salary_brut?: number;
    salary_net?: number;
    base_salary?: number; // Old format
    currency: string;
  };
  salaire_base?: number; // Old format
  salaire_devise?: string; // Old format
  status?: string; // New format
  statut?: string; // Old format: 'Brouillon' | 'Actif' | 'Terminé' | 'Annulé'
  actions?: number;
}

type SelectOption = { label: string; value: string };

export function ContratsListing() {
  const router = useRouter();
  const { t } = useLanguage();
  const [employeeOptions, setEmployeeOptions] = useState<SelectOption[]>([]);
  const [departmentOptions, setDepartmentOptions] = useState<SelectOption[]>(
    []
  );
  const [typeOptions] = useState<SelectOption[]>([
    { label: 'CDI', value: 'CDI' },
    { label: 'CDD', value: 'CDD' },
    { label: 'Stage', value: 'Stage' },
    { label: 'Intérim', value: 'Intérim' },
    { label: 'Apprentissage', value: 'Apprentissage' },
    { label: 'Autre', value: 'Autre' }
  ]);
  const [statusOptions] = useState<SelectOption[]>([
    { label: t('contracts.status.BROUILLON'), value: 'Brouillon' },
    { label: t('contracts.status.ACTIF'), value: 'Actif' },
    { label: "Période d'essai", value: 'Periode_essai' },
    { label: 'En attente signature', value: 'En_attente_signature' },
    { label: t('contracts.status.TERMINE'), value: 'Termine' },
    { label: 'Résilié', value: 'Resilie' },
    { label: t('contracts.status.ANNULE'), value: 'Annule' }
  ]);

  useEffect(() => {
    (async () => {
      try {
        const empResp = await apiClient.get(
          apiRoutes.admin.employees.simpleList
        );
        const empData = Array.isArray(empResp?.data?.data)
          ? empResp.data.data
          : empResp.data;
        const opts: SelectOption[] = (empData || []).map((e: any) => ({
          label: `${e.firstName} ${e.lastName}${e.matricule ? ` (${e.matricule})` : ''}`,
          value: e.matricule || e.id // filter by matricule or id fallback
        }));
        setEmployeeOptions(opts);
      } catch {}
      try {
        const depResp = await apiClient.get(
          apiRoutes.admin.departments.simpleList
        );
        const depData = Array.isArray(depResp?.data?.data)
          ? depResp.data.data
          : depResp.data;
        const dOpts: SelectOption[] = (depData || []).map((d: any) => ({
          label: d.name,
          value: d.name
        }));
        setDepartmentOptions(dOpts);
      } catch {}
    })();
  }, [t]);
  const [tableInstance, setTableInstance] = useState<Partial<
    UseTableReturn<ContractRow>
  > | null>(null);
  const [selectedContract, setSelectedContract] = useState<ContractRow | null>(
    null
  );
  const [openDeleteModal, setOpenDeleteModal] = useState(false);

  const handleDelete = (row: ContractRow) => {
    const currentStatus = row.status || row.statut;
    if (currentStatus !== 'Brouillon') {
      toast.error(t('contracts.messages.onlyDraftCanBeDeleted'));
      return;
    }
    setSelectedContract(row);
    setOpenDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedContract) return;
    try {
      const response = await apiClient.delete(
        apiRoutes.admin.contratsEtMovements.contrats.delete(selectedContract.id)
      );
      const data = response.data;
      if (data?.status === 'success' || response.status === 200) {
        toast.success(t('contracts.messages.deleteSuccess'));
        if (tableInstance?.refresh) tableInstance.refresh();
      } else {
        toast.error(data?.message || t('contracts.messages.error'));
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || t('contracts.messages.error');
      toast.error(`${t('common.error')}: ${errorMessage}`);
    }
    setOpenDeleteModal(false);
    setSelectedContract(null);
  };

  const columns: CustomTableColumn<ContractRow>[] = [
    {
      data: 'id',
      label: 'ID',
      sortable: true,
      render: (v, row) => (row.reference ? row.reference : `#${v}`)
    },
    {
      data: 'employee',
      label: t('contracts.fields.employee'),
      sortable: false,
      render: (_value, row) => {
        // Support both formats
        if (row.employee_name) {
          return (
            <div>
              <div className='font-medium'>{row.employee_name}</div>
              {row.employee_matricule && (
                <div className='text-muted-foreground text-xs'>
                  {row.employee_matricule}
                </div>
              )}
            </div>
          );
        }
        const emp = row.employee;
        if (!emp) return <span className='text-muted-foreground'>N/A</span>;
        return (
          <div>
            <div className='font-medium'>
              {emp.firstName} {emp.lastName}
            </div>
            <div className='text-muted-foreground text-xs'>{emp.matricule}</div>
          </div>
        );
      }
    },
    {
      data: 'type_contrat',
      label: t('contracts.fields.type'),
      sortable: true,
      render: (_value, row) => {
        const type = row.type || row.type_contrat || 'N/A';
        return <StatusBadge label={type} tone='neutral' />;
      }
    },
    {
      data: 'job',
      label: 'Métier',
      sortable: true,
      render: (_value, row) => row.job?.metier || 'N/A'
    },
    {
      data: 'job',
      label: 'Emploi',
      sortable: true,
      render: (_value, row) => row.job?.emploie || 'N/A'
    },
    {
      data: 'poste',
      label: 'Poste',
      sortable: true,
      render: (_value, row) =>
        row.job?.poste || row.job?.title || row.poste || 'N/A'
    },
    {
      data: 'schedule',
      label: 'Horaire',
      sortable: true,
      render: (_value, row) => {
        const scheduleType = row.schedule?.schedule_type;
        const shiftWork = row.schedule?.shift_work;
        if (scheduleType) {
          return (
            <div className='text-xs'>
              <div>{scheduleType}</div>
              {shiftWork === 'Oui' && (
                <span className='text-orange-600'>Shift</span>
              )}
            </div>
          );
        }
        return 'N/A';
      }
    },
    {
      data: 'date_debut',
      label: t('contracts.fields.startDate'),
      sortable: true,
      render: (_value, row) => {
        const date = row.dates?.start_date || row.date_debut;
        return date ? new Date(date).toLocaleDateString('fr-FR') : 'N/A';
      }
    },
    {
      data: 'date_fin',
      label: t('contracts.fields.endDate'),
      sortable: true,
      render: (_value, row) => {
        const date = row.dates?.end_date || row.date_fin;
        return date ? (
          new Date(date).toLocaleDateString('fr-FR')
        ) : (
          <span className='text-muted-foreground'>—</span>
        );
      }
    },
    {
      data: 'salary',
      label: 'Salaire',
      sortable: true,
      render: (_value, row) => {
        const salaryBrut =
          row.salary?.salary_brut ||
          row.salary?.base_salary ||
          row.salaire_base ||
          0;
        const salaryNet = row.salary?.salary_net;
        const currency = row.salary?.currency || row.salaire_devise || 'MAD';
        const formatter = new Intl.NumberFormat('fr-MA', {
          style: 'currency',
          currency
        });

        return (
          <div className='text-xs'>
            <div className='font-medium'>
              {formatter.format(salaryBrut)} Brut
            </div>
            {salaryNet && (
              <div className='text-muted-foreground'>
                {formatter.format(salaryNet)} Net
              </div>
            )}
          </div>
        );
      }
    },
    {
      data: 'statut',
      label: t('contracts.fields.status'),
      sortable: true,
      render: (_value, row) => {
        const status = row.status || row.statut || 'N/A';
        const map: Record<
          string,
          {
            label: string;
            tone: 'neutral' | 'success' | 'danger' | 'warning' | 'info';
          }
        > = {
          Brouillon: {
            label: t('contracts.status.BROUILLON'),
            tone: 'neutral'
          },
          Actif: { label: t('contracts.status.ACTIF'), tone: 'success' },
          Periode_essai: { label: "Période d'essai", tone: 'warning' },
          En_attente_signature: { label: 'En attente signature', tone: 'info' },
          Termine: { label: t('contracts.status.TERMINE'), tone: 'neutral' },
          Resilie: { label: 'Résilié', tone: 'danger' },
          Annule: { label: t('contracts.status.ANNULE'), tone: 'danger' }
        };
        const m = map[status] || { label: status, tone: 'neutral' };
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
                  router.push(
                    `/admin/contrats-mouvements/contrats/${row.id}/details`
                  )
                }
              >
                <Eye className='h-4 w-4' />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t('common.view')}</TooltipContent>
          </Tooltip>
          {(row.status === 'Brouillon' || row.statut === 'Brouillon') && (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant='destructive'
                    className='h-8 w-8 bg-red-100 p-1.5 text-red-600 hover:bg-red-200'
                    onClick={() => handleDelete(row)}
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
            </>
          )}
        </div>
      )
    }
  ];

  const filters: CustomTableFilterConfig[] = [
    {
      field: 'employee_matricule',
      label: t('contracts.fields.employee'),
      type: 'datatable-select',
      options: employeeOptions
    },
    {
      field: 'type_contrat',
      label: t('contracts.fields.type'),
      type: 'datatable-select',
      options: typeOptions
    },
    {
      field: 'statut',
      label: t('contracts.fields.status'),
      type: 'datatable-select',
      options: statusOptions
    },
    {
      field: 'departement',
      label: t('contracts.fields.department'),
      type: 'datatable-select',
      options: departmentOptions
    }
  ];

  return (
    <>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-semibold tracking-tight'>
            {t('contracts.title')}
          </h1>
          <p className='text-muted-foreground text-sm'>
            {t('contracts.subtitle')}
          </p>
        </div>
        <Button
          onClick={() =>
            router.push('/admin/contrats-mouvements/contrats/ajouter')
          }
        >
          <Plus className='mr-2 h-4 w-4' />
          {t('contracts.create')}
        </Button>
      </div>
      <div className='flex flex-1 flex-col space-y-4'>
        <CustomTable<ContractRow>
          columns={columns}
          url={apiRoutes.admin.contratsEtMovements.contrats.list}
          filters={filters}
          onInit={(instance) => setTableInstance(instance)}
        />
        <CustomAlertDialog
          title={t('common.confirm')}
          description={t('contracts.messages.confirmDelete')}
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

export default ContratsListing;
