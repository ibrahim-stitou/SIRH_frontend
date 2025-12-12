'use client';

import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
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
  CustomTableFilterConfig,
  UseTableReturn
} from '@/components/custom/data-table/types';
import { apiRoutes } from '@/config/apiRoutes';
import apiClient from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext';
import { getRequestsColumns } from './requests-columns';
import type { AttestationRequest } from '@/types/attestation';

interface DemandeAttestationListingProps {
  employees: any[];
  onApprove: (request: AttestationRequest) => void;
  onReject: (request: AttestationRequest) => void;
  onGenerate: (request: AttestationRequest) => void;
  onViewDetails: (request: AttestationRequest) => void;
  onInit?: (instance: Partial<UseTableReturn<any>>) => void;
}

export function DemandeAttestationListing({
  employees,
  onApprove,
  onReject,
  onGenerate,
  onViewDetails,
  onInit
}: DemandeAttestationListingProps) {
  const { t } = useLanguage();
  const [tableInstance, setTableInstance] = useState<Partial<
    UseTableReturn<any>
  > | null>(null);
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(
    null
  );
  const [openDeleteModal, setOpenDeleteModal] = useState(false);

  const handleDelete = (id: number) => {
    setSelectedRequestId(id);
    setOpenDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedRequestId !== null) {
      try {
        const response = await apiClient.delete(
          apiRoutes.admin.attestations.requests.delete(selectedRequestId)
        );
        if (response.data) {
          toast.success(t('attestations.messages.deleteSuccess'));
          if (tableInstance && tableInstance.refresh) {
            tableInstance.refresh();
          }
        } else {
          toast.error(t('attestations.messages.error'));
        }
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message || t('attestations.messages.error');
        toast.error(`${t('common.error')}: ${errorMessage}`);
      }
      setOpenDeleteModal(false);
      setSelectedRequestId(null);
    }
  };

  // Wrapper pour les actions avec suppression
  const getColumnsWithDelete = () => {
    const baseColumns = getRequestsColumns(
      t,
      employees,
      onApprove,
      onReject,
      onGenerate,
      onViewDetails
    );

    // Modifier la colonne actions pour ajouter le bouton supprimer
    const actionsColumnIndex = baseColumns.findIndex(
      (col) => col.data === 'actions'
    );
    if (actionsColumnIndex !== -1) {
      const originalRender = baseColumns[actionsColumnIndex].render;
      baseColumns[actionsColumnIndex].render = (value, row, index) => {
        const originalActions = originalRender
          ? originalRender(value, row, index)
          : null;

        // Ajouter le bouton supprimer seulement pour les demandes non validées (en_attente ou rejete)
        const canDelete =
          row.status === 'en_attente' || row.status === 'rejete';

        return (
          <div className='flex items-center gap-2'>
            {originalActions}
            {canDelete && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant='destructive'
                    size='sm'
                    className='h-8 w-8 p-1.5'
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
            )}
          </div>
        );
      };
    }

    return baseColumns;
  };

  const filters: CustomTableFilterConfig[] = [
    {
      field: 'status',
      label: t('attestations.columns.status'),
      type: 'select',
      options: [
        { label: t('attestations.status.en_attente'), value: 'en_attente' },
        { label: t('attestations.status.approuve'), value: 'approuve' },
        { label: t('attestations.status.rejete'), value: 'rejete' },
        { label: t('attestations.status.genere'), value: 'genere' }
      ]
    },
    {
      field: 'typeAttestation',
      label: t('attestations.columns.type'),
      type: 'select',
      options: [
        { label: t('attestations.types.travail'), value: 'travail' },
        { label: t('attestations.types.salaire'), value: 'salaire' },
        {
          label: t('attestations.types.travail_salaire'),
          value: 'travail_salaire'
        },
        { label: t('attestations.types.stage'), value: 'stage' }
      ]
    },
    {
      field: 'employeeId',
      label: t('attestations.columns.employee'),
      type: 'select',
      options: employees.map((emp) => ({
        label: `${emp.firstName} ${emp.lastName}`,
        value: String(emp.id)
      }))
    }
  ];

  const handleInit = (instance: Partial<UseTableReturn<any>>) => {
    setTableInstance(instance);
    if (onInit) {
      onInit(instance);
    }
  };

  return (
    <>
      <div className='flex flex-1 flex-col space-y-4'>
        <CustomTable
          columns={getColumnsWithDelete()}
          url={apiRoutes.admin.attestations.requests.list}
          filters={filters}
          onInit={handleInit}
        />
      </div>
      <CustomAlertDialog
        title={t('attestations.dialog.delete.title')}
        description={t('attestations.dialog.delete.description')}
        cancelText={t('common.cancel')}
        confirmText={t('common.delete')}
        onConfirm={handleConfirmDelete}
        open={openDeleteModal}
        setOpen={setOpenDeleteModal}
      />
    </>
  );
}

export default DemandeAttestationListing;
