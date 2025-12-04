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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, AlertCircle, FileText, User, Briefcase, Clock, Banknote, Shield } from 'lucide-react';
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
  loading = false,
}: ContractRecapModalProps) {
  if (!formData) return null;

  const RecapSection = ({ icon: Icon, title, children }: any) => (
    <div className="space-y-2">
      <h3 className="font-semibold flex items-center gap-2 text-sm">
        <Icon className="h-4 w-4" />
        {title}
      </h3>
      <div className="pl-6 space-y-1 text-sm">{children}</div>
    </div>
  );

  const RecapItem = ({ label, value }: { label: string; value: any }) => {
    if (!value && value !== 0) return null;
    return (
      <div className="flex justify-between">
        <span className="text-muted-foreground">{label}:</span>
        <span className="font-medium">{value}</span>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            Récapitulatif du Contrat
          </DialogTitle>
          <DialogDescription>
            Veuillez vérifier les informations avant de créer le contrat
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            {/* Informations Générales */}
            <RecapSection icon={FileText} title="Informations Générales">
              <RecapItem label="Référence" value={formData.reference} />
              <RecapItem label="Type" value={formData.type} />
              <RecapItem label="Titre" value={formData.title} />
              <RecapItem
                label="Date de début"
                value={formData.dates?.start_date ? new Date(formData.dates.start_date).toLocaleDateString('fr-FR') : '-'}
              />
              {formData.dates?.end_date && (
                <RecapItem
                  label="Date de fin"
                  value={new Date(formData.dates.end_date).toLocaleDateString('fr-FR')}
                />
              )}
            </RecapSection>

            <Separator />

            {/* Informations Employé */}
            <RecapSection icon={User} title="Employé">
              <RecapItem label="ID Employé" value={formData.employe_id} />
              <RecapItem label="CIN" value={formData.employee_details?.cin} />
              <RecapItem label="CNSS" value={formData.employee_details?.cnss_number} />
              <RecapItem label="Lieu de naissance" value={formData.employee_details?.birth_place} />
            </RecapSection>

            <Separator />

            {/* Poste */}
            <RecapSection icon={Briefcase} title="Poste">
              <RecapItem label="Fonction" value={formData.job?.function} />
              <RecapItem label="Catégorie" value={formData.job?.category} />
              <RecapItem label="Mode de travail" value={formData.job?.work_mode} />
              <RecapItem label="Lieu de travail" value={formData.job?.work_location} />
            </RecapSection>

            <Separator />

            {/* Horaires */}
            <RecapSection icon={Clock} title="Horaires">
              <RecapItem label="Heures/jour" value={formData.schedule?.hours_per_day} />
              <RecapItem label="Jours/semaine" value={formData.schedule?.days_per_week} />
              <RecapItem label="Heures/semaine" value={formData.schedule?.hours_per_week} />
              {formData.schedule?.shift_work?.enabled && (
                <>
                  <RecapItem label="Travail en shift" value="Oui" />
                  <RecapItem label="Type de shift" value={formData.schedule.shift_work.type} />
                </>
              )}
              {formData.dates?.trial_period?.enabled && (
                <RecapItem
                  label="Période d'essai"
                  value={`${formData.dates.trial_period.duration_months || 0} mois`}
                />
              )}
            </RecapSection>

            <Separator />

            {/* Salaire */}
            <RecapSection icon={Banknote} title="Rémunération">
              <RecapItem
                label="Salaire de base"
                value={`${formData.salary?.base_salary?.toFixed(2)} MAD`}
              />
              <RecapItem
                label="Salaire brut"
                value={`${formData.salary?.salary_brut?.toFixed(2)} MAD`}
              />
              <RecapItem
                label="Salaire net"
                value={`${formData.salary?.salary_net?.toFixed(2)} MAD`}
              />
              <RecapItem label="Méthode de paiement" value={formData.salary?.payment_method} />
              {formData.salary?.primes?.prime_anciennete && (
                <RecapItem
                  label="Prime d'ancienneté"
                  value={`${formData.salary.primes.prime_anciennete} MAD`}
                />
              )}
              {formData.salary?.primes?.prime_transport && (
                <RecapItem
                  label="Prime de transport"
                  value={`${formData.salary.primes.prime_transport} MAD`}
                />
              )}
            </RecapSection>

            <Separator />

            {/* Légal */}
            <RecapSection icon={Shield} title="Informations Légales">
              <RecapItem
                label="Affiliation CNSS"
                value={formData.legal?.cnss_affiliation ? 'Oui' : 'Non'}
              />
              <RecapItem
                label="Affiliation AMO"
                value={formData.legal?.amo_affiliation ? 'Oui' : 'Non'}
              />
              <RecapItem
                label="IR Applicable"
                value={formData.legal?.ir_applicable ? 'Oui' : 'Non'}
              />
              {formData.legal?.convention_collective && (
                <RecapItem label="Convention collective" value={formData.legal.convention_collective} />
              )}
              {formData.legal?.clause_confidentialite && (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                  <span className="text-sm">Clause de confidentialité</span>
                </div>
              )}
              {formData.legal?.clause_non_concurrence && (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                  <span className="text-sm">Clause de non-concurrence</span>
                </div>
              )}
            </RecapSection>

            {/* Alerte */}
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-900 text-sm">Important</h4>
                  <p className="text-xs text-blue-800 mt-1">
                    Une fois créé, ce contrat sera enregistré dans le système et pourra être édité
                    uniquement par les administrateurs.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button
            variant="outline"
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

