'use client';

import React, { useState } from 'react';
import { Eye, Download, CheckCircle, Trash2, FileEdit, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import CustomAlertDialog from '@/components/custom/customAlert';
import CustomTable from '@/components/custom/data-table/custom-table';
import { CustomTableColumn, CustomTableFilterConfig, UseTableReturn } from '@/components/custom/data-table/types';
import { apiRoutes } from '@/config/apiRoutes';
import apiClient from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext';
import { downloadContractPDF } from '@/lib/pdf/contract-generator';
import type { Contract } from '@/types/contract';

// Row type mapped for CustomTable consumption
interface ContractRow {
  id: number;
  employee?: {
    id: number;
    firstName: string;
    lastName: string;
    matricule: string;
    email?: string;
  } | null;
  type_contrat: string; // 'CDI' | 'CDD' | 'Stage' | 'Intérim' | 'Apprentissage' | 'Autre'
  poste: string;
  departement: string;
  date_debut: string;
  date_fin: string | null;
  salaire_base: number;
  salaire_devise: string;
  statut: string; // 'Brouillon' | 'Actif' | 'Terminé' | 'Annulé'
  actions?: number;
}

export function ContratsListing() {
  const router = useRouter();
  const { t } = useLanguage();
  const [tableInstance, setTableInstance] = useState<Partial<UseTableReturn<ContractRow>> | null>(null);
  const [selectedContract, setSelectedContract] = useState<ContractRow | null>(null);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);

  const handleDelete = (row: ContractRow) => {
    if (row.statut !== 'Brouillon') {
      toast.error(t('contracts.messages.onlyDraftCanBeDeleted'));
      return;
    }
    setSelectedContract(row);
    setOpenDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedContract) return;
    try {
      const response = await apiClient.delete(apiRoutes.admin.contratsEtMovements.contrats.delete(selectedContract.id));
      const data = response.data;
      if (data?.status === 'success' || response.status === 200) {
        toast.success(t('contracts.messages.deleteSuccess'));
        if (tableInstance?.refresh) tableInstance.refresh();
      } else {
        toast.error(data?.message || t('contracts.messages.error'));
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || t('contracts.messages.error');
      toast.error(`${t('common.error')}: ${errorMessage}`);
    }
    setOpenDeleteModal(false);
    setSelectedContract(null);
  };

  const handleValidate = async (row: ContractRow) => {
    if (row.statut !== 'Brouillon') {
      toast.error(t('contracts.messages.onlyDraftCanBeModified'));
      return;
    }
    try {
      const response = await apiClient.patch(apiRoutes.admin.contratsEtMovements.contrats.validate(row.id));
      const data = response.data;
      if (data?.status === 'success' || response.status === 200) {
        toast.success(t('contracts.messages.validateSuccess'));
        if (tableInstance?.refresh) tableInstance.refresh();
      } else {
        toast.error(data?.message || t('contracts.messages.error'));
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || t('contracts.messages.error');
      toast.error(`${t('common.error')}: ${errorMessage}`);
    }
  };

  const handleGeneratePDF = async (row: ContractRow) => {
    try {
      const response = await apiClient.get(apiRoutes.admin.contratsEtMovements.contrats.show(row.id));
      const data = response.data;
      const contract: Contract = data?.data || data; // fallback for json-server
      if (contract) {
        downloadContractPDF(contract);
        toast.success(t('contracts.messages.pdfGenerated'));
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || t('contracts.messages.error');
      toast.error(`${t('common.error')}: ${errorMessage}`);
    }
  };

  const columns: CustomTableColumn<ContractRow>[] = [
    { data: 'id', label: 'ID', sortable: true, render: (v) => `#${v}` },
    {
      data: 'employee',
      label: t('contracts.fields.employee'),
      sortable: false,
      render: (_value, row) => {
        const emp = row.employee;
        if (!emp) return <span className="text-muted-foreground">N/A</span>;
        return (
          <div>
            <div className="font-medium">{emp.firstName} {emp.lastName}</div>
            <div className="text-xs text-muted-foreground">{emp.matricule}</div>
          </div>
        );
      }
    },
    {
      data: 'type_contrat',
      label: t('contracts.fields.type'),
      sortable: true,
      render: (value) => <span className="rounded-md border px-2 py-0.5 text-xs">{value}</span>
    },
    { data: 'poste', label: t('contracts.fields.position'), sortable: true },
    { data: 'departement', label: t('contracts.fields.department'), sortable: true },
    { data: 'date_debut', label: t('contracts.fields.startDate'), sortable: true },
    {
      data: 'date_fin',
      label: t('contracts.fields.endDate'),
      sortable: true,
      render: (value) => value ? value : <span className="text-muted-foreground">—</span>
    },
    {
      data: 'salaire_base',
      label: t('contracts.fields.baseSalary'),
      sortable: true,
      render: (_value, row) => new Intl.NumberFormat('fr-MA', { style: 'currency', currency: row.salaire_devise }).format(row.salaire_base)
    },
    {
      data: 'statut',
      label: t('contracts.fields.status'),
      sortable: true,
      render: (value) => {
        const map: Record<string, string> = {
          Brouillon: t('contracts.status.BROUILLON'),
          Actif: t('contracts.status.ACTIF'),
          Terminé: t('contracts.status.TERMINE'),
          Annulé: t('contracts.status.ANNULE'),
        };
        return map[value] || value;
      }
    },
    {
      data: 'actions',
      label: t('employees.columns.actions'),
      sortable: false,
      render: (_value, row) => (
        <div className="flex items-center space-x-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                className="h-8 w-8 p-1.5"
                onClick={() => router.push(`/admin/contrats-mouvements/contrats/${row.id}/details`)}
              >
                <Eye className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t('common.view')}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                className="h-8 w-8 p-1.5"
                onClick={() => handleGeneratePDF(row)}
              >
                <Download className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t('contracts.actions.generatePdf')}</TooltipContent>
          </Tooltip>
          {row.statut === 'Brouillon' && (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-8 w-8 p-1.5"
                    onClick={() => handleValidate(row)}
                  >
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{t('contracts.actions.validate')}</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="destructive"
                    className="h-8 w-8 bg-red-100 p-1.5 text-red-600 hover:bg-red-200"
                    onClick={() => handleDelete(row)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent
                  className="tooltip-content rounded-md bg-red-100 px-2 py-1 text-red-600 shadow-md"
                  sideOffset={5}
                >
                  {t('common.delete')}
                </TooltipContent>
              </Tooltip>
            </>
          )}
          {row.statut === 'Actif' && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  className="h-8 w-8 p-1.5"
                  onClick={() => router.push(`/admin/contrats-mouvements/contrats/${row.id}/avenants/create`)}
                >
                  <FileEdit className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t('contracts.actions.createAvenant')}</TooltipContent>
            </Tooltip>
          )}
        </div>
      )
    }
  ];

  const filters: CustomTableFilterConfig[] = [
    { field: 'employee', label: t('contracts.fields.employee'), type: 'text' },
    { field: 'type_contrat', label: t('contracts.fields.type'), type: 'text' },
    { field: 'statut', label: t('contracts.fields.status'), type: 'text' },
    { field: 'departement', label: t('contracts.fields.department'), type: 'text' },
  ];

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t('contracts.title')}</h1>
          <p className="text-muted-foreground text-sm">{t('contracts.subtitle')}</p>
        </div>
        <Button onClick={() => router.push('/admin/contrats-mouvements/contrats/create')}>
          <Plus className="mr-2 h-4 w-4" />
          {t('contracts.create')}
        </Button>
      </div>
      <div className="flex flex-1 flex-col space-y-4">
        <CustomTable<ContractRow>
          columns={columns}
          url={apiRoutes.admin.contratsEtMovements.contrats.list}
          filters={filters}
          onInit={instance => setTableInstance(instance)}
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
