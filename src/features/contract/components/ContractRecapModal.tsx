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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  CheckCircle2,
  AlertCircle,
  FileText,
  Briefcase,
  Clock,
  Banknote,
  Shield
} from 'lucide-react';
import type { SimplifiedContractInput } from '@/validations/contract-simplified.schema';

interface ContractRecapModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: SimplifiedContractInput | null;
  onConfirm: () => void;
  loading?: boolean;
}

export function ContractRecapModal({
  open,
  onOpenChange,
  formData,
  onConfirm,
  loading = false
}: ContractRecapModalProps) {
  if (!formData) return null;

  const RecapSection = ({ icon: Icon, title, children }: any) => (
    <div className='space-y-2'>
      <h3 className='flex items-center gap-2 text-sm font-semibold'>
        <Icon className='h-4 w-4' />
        {title}
      </h3>
      <div className='space-y-1 pl-6 text-sm'>{children}</div>
    </div>
  );

  const RecapItem = ({ label, value }: { label: string; value: any }) => {
    if (!value && value !== 0) return null;
    return (
      <div className='flex justify-between'>
        <span className='text-muted-foreground'>{label}:</span>
        <span className='font-medium'>{value}</span>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[90vh] max-w-3xl'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <CheckCircle2 className='h-5 w-5 text-green-600' />
            Récapitulatif du Contrat
          </DialogTitle>
          <DialogDescription>
            Veuillez vérifier les informations avant de créer le contrat
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className='max-h-[60vh] pr-4'>
          <div className='space-y-6'>
            {/* Informations Générales */}
            <RecapSection icon={FileText} title='Informations Générales'>
              <RecapItem label='Référence' value={formData.reference} />
              <RecapItem label='Type' value={formData.type} />
              <RecapItem label='ID Employé' value={formData.employe_id} />
              <RecapItem
                label='Date de début'
                value={
                  formData.dates?.start_date
                    ? new Date(formData.dates.start_date).toLocaleDateString(
                        'fr-FR'
                      )
                    : '-'
                }
              />
              {formData.dates?.end_date && (
                <RecapItem
                  label='Date de fin'
                  value={new Date(formData.dates.end_date).toLocaleDateString(
                    'fr-FR'
                  )}
                />
              )}
              <RecapItem
                label='Date de signature'
                value={
                  formData.dates?.signature_date
                    ? new Date(
                        formData.dates.signature_date
                      ).toLocaleDateString('fr-FR')
                    : '-'
                }
              />
              {formData.description && (
                <RecapItem label='Description' value={formData.description} />
              )}
            </RecapSection>

            <Separator />

            {/* Poste */}
            <RecapSection icon={Briefcase} title='Poste'>
              <RecapItem label='Métier' value={formData.job?.metier} />
              <RecapItem label='Emploi' value={formData.job?.emploie} />
              <RecapItem label='Poste' value={formData.job?.poste} />
              <RecapItem
                label='Mode de travail'
                value={formData.job?.work_mode}
              />
              <RecapItem
                label='Classification'
                value={formData.job?.classification}
              />
              <RecapItem
                label='Lieu de travail'
                value={formData.job?.work_location}
              />
            </RecapSection>

            <Separator />

            {/* Horaires */}
            <RecapSection icon={Clock} title='Horaires de Travail'>
              <RecapItem
                label="Type d'horaire"
                value={formData.schedule?.schedule_type}
              />
              <RecapItem
                label='Travail en shift'
                value={formData.schedule?.shift_work}
              />
              <RecapItem
                label='Congés annuels'
                value={
                  formData.schedule?.annual_leave_days
                    ? `${formData.schedule.annual_leave_days} jours`
                    : undefined
                }
              />

              {formData.dates?.trial_period?.enabled && (
                <>
                  <div className='col-span-2 mt-2'>
                    <span className='flex items-center gap-1 text-xs font-medium text-blue-600'>
                      <CheckCircle2 className='h-3 w-3' /> Période d&apos;essai
                      activée
                    </span>
                  </div>
                  <RecapItem
                    label='Durée'
                    value={`${formData.dates.trial_period.duration_months || 0} mois (${formData.dates.trial_period.duration_days || 0} jours)`}
                  />
                  {formData.dates.trial_period.end_date && (
                    <RecapItem
                      label="Date de fin d'essai"
                      value={new Date(
                        formData.dates.trial_period.end_date
                      ).toLocaleDateString('fr-FR')}
                    />
                  )}
                  <RecapItem
                    label='Renouvelable'
                    value={
                      formData.dates.trial_period.renewable ? 'Oui' : 'Non'
                    }
                  />
                  {formData.dates.trial_period.max_renewals && (
                    <RecapItem
                      label='Nombre max de renouvellements'
                      value={formData.dates.trial_period.max_renewals}
                    />
                  )}
                  {formData.dates.trial_period.conditions && (
                    <div className='col-span-2'>
                      <span className='text-muted-foreground text-xs'>
                        Conditions:
                      </span>
                      <p className='mt-1 text-xs'>
                        {formData.dates.trial_period.conditions}
                      </p>
                    </div>
                  )}
                </>
              )}
            </RecapSection>

            <Separator />

            {/* Salaire */}
            <RecapSection icon={Banknote} title='Rémunération'>
              <RecapItem
                label='Salaire brut'
                value={`${formData.salary?.salary_brut?.toFixed(2)} MAD`}
              />
              <RecapItem
                label='Salaire net'
                value={`${formData.salary?.salary_net?.toFixed(2)} MAD`}
              />
              <RecapItem
                label='Méthode de paiement'
                value={formData.salary?.payment_method}
              />
              <RecapItem
                label='Périodicité'
                value={formData.salary?.periodicity}
              />

              {/* Indemnités */}
              {formData.salary?.indemnites && (
                <div className='col-span-2 mt-2'>
                  <span className='text-muted-foreground text-xs'>
                    Indemnités:
                  </span>
                  <p className='mt-1 text-xs'>{formData.salary.indemnites}</p>
                </div>
              )}

              {/* Primes dynamiques */}
              {(formData.salary?.primes as any)?.items &&
                (formData.salary.primes as any).items.length > 0 && (
                  <div className='col-span-2 mt-2'>
                    <span className='text-xs font-medium'>Primes:</span>
                    <div className='mt-1 space-y-1'>
                      {(formData.salary.primes as any).items.map(
                        (prime: any, idx: number) => (
                          <div
                            key={idx}
                            className='flex justify-between text-xs'
                          >
                            <span className='text-muted-foreground'>
                              {prime.label}
                            </span>
                            <span className='font-medium'>
                              {prime.amount?.toFixed(2)} MAD
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

              {/* Avantages */}
              {formData.salary?.avantages && (
                <div className='col-span-2 mt-2'>
                  <span className='text-xs font-medium'>
                    Avantages en nature:
                  </span>
                  <div className='mt-1 flex flex-wrap gap-2'>
                    {formData.salary.avantages.voiture && (
                      <span className='rounded bg-green-100 px-2 py-1 text-xs text-green-700'>
                        Voiture
                      </span>
                    )}
                    {formData.salary.avantages.logement && (
                      <span className='rounded bg-green-100 px-2 py-1 text-xs text-green-700'>
                        Logement
                      </span>
                    )}
                    {formData.salary.avantages.telephone && (
                      <span className='rounded bg-green-100 px-2 py-1 text-xs text-green-700'>
                        Téléphone
                      </span>
                    )}
                    {formData.salary.avantages.assurance_sante && (
                      <span className='rounded bg-green-100 px-2 py-1 text-xs text-green-700'>
                        Assurance Santé
                      </span>
                    )}
                    {formData.salary.avantages.tickets_restaurant && (
                      <span className='rounded bg-green-100 px-2 py-1 text-xs text-green-700'>
                        Tickets Restaurant
                      </span>
                    )}
                  </div>
                </div>
              )}
            </RecapSection>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Modifier
          </Button>
          <Button onClick={onConfirm} disabled={loading}>
            {loading ? 'Création en cours...' : 'Confirmer et Créer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
