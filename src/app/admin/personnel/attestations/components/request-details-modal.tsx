'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { useLanguage } from '@/context/LanguageContext';
import type { AttestationRequest, AttestationRequestStatus } from '@/types/attestation';
import { Calendar, User, FileText, Clock, CheckCircle2, XCircle } from 'lucide-react';

interface RequestDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: AttestationRequest | null;
  employeeName?: string;
}

export function RequestDetailsModal({
  open,
  onOpenChange,
  request,
  employeeName,
}: RequestDetailsModalProps) {
  const { t } = useLanguage();

  if (!request) return null;

  const getStatusBadge = (status: AttestationRequestStatus) => {
    const variants: Record<AttestationRequestStatus, 'secondary' | 'default' | 'destructive'> = {
      en_attente: 'secondary',
      approuve: 'default',
      rejete: 'destructive',
      genere: 'default',
    };

    const icons = {
      en_attente: <Clock className="h-4 w-4" />,
      approuve: <CheckCircle2 className="h-4 w-4" />,
      rejete: <XCircle className="h-4 w-4" />,
      genere: <FileText className="h-4 w-4" />,
    };

    return (
      <Badge variant={variants[status]} className="gap-1.5 text-sm">
        {icons[status]}
        {t(`attestations.status.${status}`)}
      </Badge>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {t('attestations.dialog.details.title')}
          </DialogTitle>
          <DialogDescription>
            {t('attestations.dialog.details.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Request ID and Status */}
          <div className="flex items-center justify-between rounded-lg bg-muted p-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">
                {t('attestations.columns.id')}:
              </span>
              <span className="text-lg font-semibold">#{request.id}</span>
            </div>
            {getStatusBadge(request.status)}
          </div>

          {/* Employee Info */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              {t('attestations.dialog.details.employeeInfo')}
            </h4>
            <div className="flex items-center gap-3 rounded-lg border p-3">
              <User className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{employeeName || '-'}</p>
                <p className="text-xs text-muted-foreground">
                  {t('attestations.columns.employee')}
                </p>
              </div>
            </div>
          </div>

          {/* Attestation Info */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              {t('attestations.dialog.details.attestationInfo')}
            </h4>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3 rounded-lg border p-3">
                <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">
                    {t(`attestations.types.${request.typeAttestation}`)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t('attestations.columns.type')}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-lg border p-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">
                    {format(new Date(request.dateRequest), 'dd/MM/yyyy')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t('attestations.columns.dateRequest')}
                  </p>
                </div>
              </div>

              {request.dateSouhaitee && (
                <div className="flex items-start gap-3 rounded-lg border p-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">
                      {format(new Date(request.dateSouhaitee), 'dd/MM/yyyy')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t('attestations.columns.dateSouhaitee')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Reason */}
          {request.raison && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                {t('attestations.columns.raison')}
              </h4>
              <div className="rounded-lg border bg-muted/50 p-4">
                <p className="text-sm leading-relaxed">{request.raison}</p>
              </div>
            </div>
          )}

          {/* Rejection Reason */}
          {request.status === 'rejete' && request.motifRejet && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-destructive uppercase tracking-wide">
                {t('attestations.columns.motifRejet')}
              </h4>
              <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4">
                <p className="text-sm leading-relaxed text-destructive">{request.motifRejet}</p>
              </div>
            </div>
          )}

          {/* Dates */}
          <div className="grid gap-3 sm:grid-cols-2 text-xs text-muted-foreground">
            {request.dateValidation && (
              <div>
                <span className="font-medium">{t('attestations.columns.dateValidation')}:</span>
                {' '}
                {format(new Date(request.dateValidation), 'dd/MM/yyyy HH:mm')}
              </div>
            )}
            {request.dateGeneration && (
              <div>
                <span className="font-medium">{t('attestations.columns.dateGeneration')}:</span>
                {' '}
                {format(new Date(request.dateGeneration), 'dd/MM/yyyy HH:mm')}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

