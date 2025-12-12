'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { useLanguage } from '@/context/LanguageContext';
import type { AttestationRequest } from '@/types/attestation';

interface ConfirmGenerateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: AttestationRequest | null;
  employees: any[];
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmGenerateModal({
  open,
  onOpenChange,
  request,
  employees,
  onConfirm,
  onCancel
}: ConfirmGenerateModalProps) {
  const { t } = useLanguage();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>
            {t('attestations.dialog.confirmGenerate.title')}
          </DialogTitle>
          <DialogDescription>
            {t('attestations.dialog.confirmGenerate.description')}
          </DialogDescription>
        </DialogHeader>
        {request && (
          <div className='space-y-3 rounded-lg border p-4'>
            <div className='flex items-center justify-between'>
              <span className='text-sm font-medium'>
                {t('attestations.columns.employee')}:
              </span>
              <span className='text-sm'>
                {employees.find((e) => e.id === request.employeeId)?.firstName}{' '}
                {employees.find((e) => e.id === request.employeeId)?.lastName}
              </span>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-sm font-medium'>
                {t('attestations.columns.type')}:
              </span>
              <span className='text-sm'>
                {t(`attestations.types.${request.typeAttestation}`)}
              </span>
            </div>
            {request.dateSouhaitee && (
              <div className='flex items-center justify-between'>
                <span className='text-sm font-medium'>
                  {t('attestations.columns.dateSouhaitee')}:
                </span>
                <span className='text-sm'>
                  {format(new Date(request.dateSouhaitee), 'dd/MM/yyyy')}
                </span>
              </div>
            )}
          </div>
        )}
        <DialogFooter>
          <Button variant='outline' onClick={onCancel}>
            {t('common.cancel')}
          </Button>
          <Button onClick={onConfirm}>
            {t('attestations.actions.generate')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
