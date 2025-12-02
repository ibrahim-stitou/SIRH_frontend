'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/context/LanguageContext';
import type { AttestationType } from '@/types/attestation';
import { DatePickerField } from '@/components/custom/DatePickerField';

interface NewRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employees: any[];
  formData: {
    employeeId: string;
    typeAttestation: AttestationType | '';
    dateSouhaitee: string;
    notes: string;
  };
  setFormData: (data: any) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export function NewRequestModal({
  open,
  onOpenChange,
  employees,
  formData,
  setFormData,
  onSubmit,
  onCancel,
}: NewRequestModalProps) {
  const { t } = useLanguage();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('attestations.dialog.newRequest.title')}</DialogTitle>
          <DialogDescription>{t('attestations.dialog.newRequest.description')}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="employee">{t('attestations.fields.employeeId')}</Label>
            <Select
              value={formData.employeeId}
              onValueChange={(value) => setFormData({ ...formData, employeeId: value })}
            >
              <SelectTrigger id="employee" className="w-full">
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
          <div className="space-y-2">
            <Label htmlFor="type">{t('attestations.fields.typeAttestation')}</Label>
            <Select
              value={formData.typeAttestation}
              onValueChange={(value) => setFormData({ ...formData, typeAttestation: value as AttestationType })}
            >
              <SelectTrigger id="type" className="w-full">
                <SelectValue placeholder={t('placeholders.select')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="travail">{t('attestations.types.travail')}</SelectItem>
                <SelectItem value="salaire">{t('attestations.types.salaire')}</SelectItem>
                <SelectItem value="travail_salaire">{t('attestations.types.travail_salaire')}</SelectItem>
                <SelectItem value="stage">{t('attestations.types.stage')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="dateSouhaitee">{t('attestations.fields.dateSouhaitee')}</Label>
            <DatePickerField
              id="dateSouhaitee"
              value={formData.dateSouhaitee}
              onChange={(value) => setFormData({ ...formData, dateSouhaitee: value })}
              placeholder={t('attestations.fields.dateSouhaitee')}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">{t('attestations.fields.notes')}</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder={t('attestations.fields.notes')}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            {t('common.cancel')}
          </Button>
          <Button onClick={onSubmit}>{t('common.submit')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

