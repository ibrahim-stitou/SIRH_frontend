'use client';

import React from 'react';
import CustomTable from '@/components/custom/data-table/custom-table';
import {
  CustomTableFilterConfig,
  UseTableReturn
} from '@/components/custom/data-table/types';
import { apiRoutes } from '@/config/apiRoutes';
import { useLanguage } from '@/context/LanguageContext';
import { getAttestationsColumns } from './attestations-columns';
import type { Attestation } from '@/types/attestation';

interface AttestationListingProps {
  employees: any[];
  onDownload: (attestation: Attestation) => void;
  onInit?: (instance: Partial<UseTableReturn<any>>) => void;
}

export function AttestationListing({
  employees,
  onDownload,
  onInit
}: AttestationListingProps) {
  const { t } = useLanguage();

  const columns = getAttestationsColumns(t, employees, onDownload);

  const filters: CustomTableFilterConfig[] = [
    {
      field: 'numeroAttestation',
      label: t('attestations.columns.numero'),
      type: 'text'
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

  return (
    <>
      <div className='flex flex-1 flex-col space-y-4'>
        <CustomTable
          columns={columns}
          url={apiRoutes.admin.attestations.generated.list}
          filters={filters}
          onInit={onInit}
        />
      </div>
    </>
  );
}

export default AttestationListing;
