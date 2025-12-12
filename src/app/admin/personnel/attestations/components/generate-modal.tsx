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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/context/LanguageContext';
import type { AttestationType } from '@/types/attestation';
import { DatePickerField } from '@/components/custom/DatePickerField';

interface GenerateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employees: any[];
  formData: {
    employeeId: string;
    typeAttestation: AttestationType | '';
    stageStartDate: string;
    stageEndDate: string;
    notes: string;
  };
  setFormData: (data: any) => void;
  onGenerate: () => void;
  onCancel: () => void;
}

export function GenerateModal({
  open,
  onOpenChange,
  employees,
  formData,
  setFormData,
  onGenerate,
  onCancel
}: GenerateModalProps) {
  const { t } = useLanguage();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-md' overlayClassName='bg-black/20'>
        <DialogHeader>
          <DialogTitle>
            {t('attestations.dialog.generateAttestation.title')}
          </DialogTitle>
          <DialogDescription>
            {t('attestations.dialog.generateAttestation.description')}
          </DialogDescription>
        </DialogHeader>
        <div className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='gen-employee'>
              {t('attestations.fields.employeeId')}
            </Label>
            <Select
              value={formData.employeeId}
              onValueChange={(value) =>
                setFormData({ ...formData, employeeId: value })
              }
            >
              <SelectTrigger id='gen-employee' className='w-full'>
                <SelectValue placeholder={t('placeholders.select')} />
              </SelectTrigger>
              <SelectContent>
                {employees.map((emp) => (
                  <SelectItem key={emp.id} value={String(emp.id)}>
                    {emp.firstName} {emp.lastName} - {emp.position}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className='space-y-2'>
            <Label htmlFor='gen-type'>
              {t('attestations.fields.typeAttestation')}
            </Label>
            <Select
              value={formData.typeAttestation}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  typeAttestation: value as AttestationType
                })
              }
            >
              <SelectTrigger id='gen-type' className='w-full'>
                <SelectValue placeholder={t('placeholders.select')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='travail'>
                  {t('attestations.types.travail')}
                </SelectItem>
                <SelectItem value='salaire'>
                  {t('attestations.types.salaire')}
                </SelectItem>
                <SelectItem value='travail_salaire'>
                  {t('attestations.types.travail_salaire')}
                </SelectItem>
                <SelectItem value='stage'>
                  {t('attestations.types.stage')}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          {formData.typeAttestation === 'stage' && (
            <>
              <div className='space-y-2'>
                <Label htmlFor='stage-start'>
                  {t('attestations.fields.stageStartDate')}
                </Label>
                <DatePickerField
                  id='stage-start'
                  value={formData.stageStartDate}
                  onChange={(value) =>
                    setFormData({ ...formData, stageStartDate: value })
                  }
                  placeholder={t('attestations.fields.stageStartDate')}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='stage-end'>
                  {t('attestations.fields.stageEndDate')}
                </Label>
                <DatePickerField
                  id='stage-end'
                  value={formData.stageEndDate}
                  onChange={(value) =>
                    setFormData({ ...formData, stageEndDate: value })
                  }
                  placeholder={t('attestations.fields.stageEndDate')}
                />
              </div>
            </>
          )}
          <div className='space-y-2'>
            <Label htmlFor='gen-notes'>{t('attestations.fields.notes')}</Label>
            <Textarea
              id='gen-notes'
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder={t('attestations.fields.notes')}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={onCancel}>
            {t('common.cancel')}
          </Button>
          <Button onClick={onGenerate}>
            {t('attestations.actions.generate')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
