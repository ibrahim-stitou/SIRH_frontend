'use client';

import { CustomTableColumn } from '@/components/custom/data-table/types';
import { StatusBadge } from '@/components/custom/status-badge';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { CheckCircle2, XCircle, Download, Eye } from 'lucide-react';
import { format } from 'date-fns';
import type {
  AttestationRequest,
  AttestationRequestStatus
} from '@/types/attestation';

interface AttestationRequestRow extends AttestationRequest {
  employeeName?: string;
}

export const getRequestsColumns = (
  t: (key: string, params?: any) => string,
  employees: any[],
  onApprove: (request: AttestationRequest) => void,
  onReject: (request: AttestationRequest) => void,
  onGenerate: (request: AttestationRequest) => void,
  onViewDetails?: (request: AttestationRequest) => void
): CustomTableColumn<AttestationRequestRow>[] => {
  const getEmployeeName = (employeeId: number) => {
    const emp = employees.find((e) => e.id === employeeId);
    return emp ? `${emp.firstName} ${emp.lastName}` : '-';
  };

  const getStatusBadge = (status: AttestationRequestStatus) => {
    const tones: Record<
      AttestationRequestStatus,
      'warning' | 'success' | 'danger' | 'info'
    > = {
      en_attente: 'warning',
      approuve: 'success',
      rejete: 'danger',
      genere: 'info'
    };

    const icons = {
      en_attente: (
        <svg
          className='h-3 w-3'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
        >
          <circle cx='12' cy='12' r='10' />
          <path d='M12 6v6l4 2' />
        </svg>
      ),
      approuve: <CheckCircle2 className='h-3 w-3' />,
      rejete: <XCircle className='h-3 w-3' />,
      genere: (
        <svg
          className='h-3 w-3'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
        >
          <path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' />
          <polyline points='14 2 14 8 20 8' />
          <path d='M16 13H8' />
          <path d='M16 17H8' />
          <path d='M10 9H8' />
        </svg>
      )
    };

    return (
      <StatusBadge
        icon={icons[status]}
        tone={tones[status]}
        label={t(`attestations.status.${status}`)}
      />
    );
  };

  return [
    {
      data: 'id',
      label: t('attestations.columns.id'),
      sortable: true,
      render: (value) => `#${value}`
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
      render: (value) => (
        <StatusBadge label={t(`attestations.types.${value}`)} tone='neutral' />
      )
    },
    {
      data: 'dateRequest',
      label: t('attestations.columns.dateRequest'),
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
      data: 'dateSouhaitee',
      label: t('attestations.columns.dateSouhaitee'),
      sortable: true,
      render: (value) => {
        if (!value) return '-';
        try {
          return format(new Date(value as string), 'dd/MM/yyyy');
        } catch {
          return value as string;
        }
      }
    },
    {
      data: 'status',
      label: t('attestations.columns.status'),
      sortable: true,
      render: (value) => getStatusBadge(value as AttestationRequestStatus)
    },
    {
      data: 'actions',
      label: t('attestations.columns.actions'),
      sortable: false,
      render: (_value, row) => (
        <div className='flex items-center gap-2'>
          {row.status === 'en_attente' && (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size='sm'
                    variant='outline'
                    onClick={() => onApprove(row)}
                    className='h-8 gap-1'
                  >
                    <CheckCircle2 className='h-3 w-3' />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {t('attestations.actions.approve')}
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size='sm'
                    variant='outline'
                    onClick={() => onReject(row)}
                    className='h-8 gap-1'
                  >
                    <XCircle className='h-3 w-3' />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {t('attestations.actions.reject')}
                </TooltipContent>
              </Tooltip>
            </>
          )}
          {row.status === 'approuve' && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size='sm'
                  onClick={() => onGenerate(row)}
                  className='h-8 gap-1'
                >
                  <Download className='h-3 w-3' />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {t('attestations.actions.generate')}
              </TooltipContent>
            </Tooltip>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size='sm'
                variant='outline'
                className='h-8 gap-1'
                onClick={() => onViewDetails?.(row)}
              >
                <Eye className='h-3 w-3' />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {t('attestations.actions.viewDetails')}
            </TooltipContent>
          </Tooltip>
        </div>
      )
    }
  ];
};
