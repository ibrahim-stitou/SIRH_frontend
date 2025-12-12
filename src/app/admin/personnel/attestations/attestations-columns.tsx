'use client';

import { CustomTableColumn } from '@/components/custom/data-table/types';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { Download } from 'lucide-react';
import { format } from 'date-fns';
import type { Attestation } from '@/types/attestation';

interface AttestationRow extends Attestation {
  employeeName?: string;
}

export const getAttestationsColumns = (
  t: (key: string, params?: any) => string,
  employees: any[],
  onDownload: (attestation: Attestation) => void
): CustomTableColumn<AttestationRow>[] => {
  const getEmployeeName = (employeeId: number) => {
    const emp = employees.find((e) => e.id === employeeId);
    return emp ? `${emp.firstName} ${emp.lastName}` : '-';
  };

  return [
    {
      data: 'numeroAttestation',
      label: t('attestations.columns.numero'),
      sortable: true,
      render: (value) => (
        <span className='font-mono font-semibold'>{value}</span>
      )
    },
    {
      data: 'employeeId',
      label: t('attestations.columns.employee'),
      sortable: true,
      render: (value) => getEmployeeName(value as number)
    },
    {
      data: 'typeAttestation',
      label: t('attestations.columns.type'),
      sortable: true,
      render: (value) => t(`attestations.types.${value}`)
    },
    {
      data: 'dateGeneration',
      label: t('attestations.columns.dateGeneration'),
      sortable: true,
      render: (value) => {
        try {
          return format(new Date(value as string), 'dd/MM/yyyy');
        } catch {
          return value as string;
        }
      }
    },
    {
      data: 'notes',
      label: t('attestations.fields.notes'),
      sortable: false,
      render: (value) => {
        if (!value) return '-';
        const text = value as string;
        return text.length > 50 ? `${text.substring(0, 50)}...` : text;
      }
    },
    {
      data: 'actions',
      label: t('attestations.columns.actions'),
      sortable: false,
      render: (_value, row) => (
        <div className='flex items-center gap-2'>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size='sm'
                variant='outline'
                onClick={() => onDownload(row)}
                className='h-8 gap-1'
              >
                <Download className='h-3 w-3' />
                {t('attestations.actions.download')}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {t('attestations.actions.download')}
            </TooltipContent>
          </Tooltip>
        </div>
      )
    }
  ];
};
