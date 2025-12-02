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
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/context/LanguageContext';

interface RejectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  raisonRejet: string;
  setRaisonRejet: (value: string) => void;
  onReject: () => void;
  onCancel: () => void;
}

export function RejectModal({
  open,
  onOpenChange,
  raisonRejet,
  setRaisonRejet,
  onReject,
  onCancel,
}: RejectModalProps) {
  const { t } = useLanguage();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('attestations.dialog.reject.title')}</DialogTitle>
          <DialogDescription>{t('attestations.dialog.reject.description')}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reject-reason">{t('attestations.fields.raisonRejet')}</Label>
            <Textarea
              id="reject-reason"
              value={raisonRejet}
              onChange={(e) => setRaisonRejet(e.target.value)}
              placeholder={t('attestations.fields.raisonRejet')}
              required
              rows={4}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            {t('common.cancel')}
          </Button>
          <Button variant="destructive" onClick={onReject}>
            {t('attestations.actions.reject')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

