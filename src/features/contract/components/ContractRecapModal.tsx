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
import { CheckCircle2, AlertCircle, FileText, Briefcase, Clock, Banknote, Shield } from 'lucide-react';
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
              <RecapItem label="ID Employé" value={formData.employe_id} />
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
              <RecapItem
                label="Date de signature"
                value={formData.dates?.signature_date ? new Date(formData.dates.signature_date).toLocaleDateString('fr-FR') : '-'}
              />
              {formData.description && (
                <RecapItem label="Description" value={formData.description} />
              )}
            </RecapSection>

            <Separator />

            {/* Poste */}
            <RecapSection icon={Briefcase} title="Poste">
              <RecapItem label="Fonction" value={formData.job?.function} />
              <RecapItem label="Catégorie" value={formData.job?.category} />
              <RecapItem label="Mode de travail" value={formData.job?.work_mode} />
              <RecapItem label="Classification" value={formData.job?.classification} />
              <RecapItem label="Lieu de travail" value={formData.job?.work_location} />
              <RecapItem label="Niveau" value={formData.job?.level} />
              {formData.job?.responsibilities && (
                <div className="col-span-2">
                  <span className="text-muted-foreground text-xs">Responsabilités:</span>
                  <p className="text-xs mt-1">{formData.job.responsibilities}</p>
                </div>
              )}
            </RecapSection>

            <Separator />

            {/* Horaires */}
            <RecapSection icon={Clock} title="Horaires de Travail">
              <RecapItem label="Heures/jour" value={formData.schedule?.hours_per_day} />
              <RecapItem label="Jours/semaine" value={formData.schedule?.days_per_week} />
              <RecapItem label="Heures/semaine" value={formData.schedule?.hours_per_week} />
              <RecapItem label="Heure de début" value={formData.schedule?.start_time} />
              <RecapItem label="Heure de fin" value={formData.schedule?.end_time} />
              <RecapItem label="Pause (min)" value={formData.schedule?.break_duration} />
              <RecapItem label="Congés annuels" value={`${formData.schedule?.annual_leave_days || 0} jours`} />

              {formData.schedule?.shift_work?.enabled && (
                <>
                  <div className="col-span-2 mt-2">
                    <span className="text-green-600 font-medium text-xs flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Travail en shifts activé
                    </span>
                  </div>
                  <RecapItem label="Type de shift" value={formData.schedule.shift_work.type} />
                  {formData.schedule.shift_work.rotation_days && (
                    <RecapItem label="Rotation" value={`${formData.schedule.shift_work.rotation_days} jours`} />
                  )}
                  {formData.schedule.shift_work.night_shift_premium && (
                    <RecapItem label="Prime de nuit" value={`${formData.schedule.shift_work.night_shift_premium} MAD`} />
                  )}
                </>
              )}

              {formData.dates?.trial_period?.enabled && (
                <>
                  <div className="col-span-2 mt-2">
                    <span className="text-blue-600 font-medium text-xs flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Période d&apos;essai activée
                    </span>
                  </div>
                  <RecapItem
                    label="Durée"
                    value={`${formData.dates.trial_period.duration_months || 0} mois (${formData.dates.trial_period.duration_days || 0} jours)`}
                  />
                  <RecapItem
                    label="Renouvelable"
                    value={formData.dates.trial_period.renewable ? 'Oui' : 'Non'}
                  />
                </>
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
              <RecapItem label="Périodicité" value={formData.salary?.periodicity} />

              {/* Primes dynamiques */}
              {(formData.salary?.primes as any)?.items && (formData.salary.primes as any).items.length > 0 && (
                <div className="col-span-2 mt-2">
                  <span className="font-medium text-xs">Primes:</span>
                  <div className="space-y-1 mt-1">
                    {(formData.salary.primes as any).items.map((prime: any, idx: number) => (
                      <div key={idx} className="flex justify-between text-xs">
                        <span className="text-muted-foreground">{prime.label}</span>
                        <span className="font-medium">{prime.amount?.toFixed(2)} MAD</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Avantages */}
              {formData.salary?.avantages && (
                <div className="col-span-2 mt-2">
                  <span className="font-medium text-xs">Avantages en nature:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {formData.salary.avantages.voiture && (
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">Voiture</span>
                    )}
                    {formData.salary.avantages.logement && (
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">Logement</span>
                    )}
                    {formData.salary.avantages.telephone && (
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">Téléphone</span>
                    )}
                    {formData.salary.avantages.assurance_sante && (
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">Assurance Santé</span>
                    )}
                    {(formData.salary.avantages as any).autres && (
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">Autres</span>
                    )}
                  </div>
                </div>
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
              {(formData.legal as any)?.cmir_affiliation && (
                <RecapItem label="Affiliation CMIR" value="Oui" />
              )}
              {(formData.legal as any)?.rcar_affiliation && (
                <RecapItem label="Affiliation RCAR" value="Oui" />
              )}
              <RecapItem
                label="IR Applicable"
                value={formData.legal?.ir_applicable ? 'Oui' : 'Non'}
              />
              {formData.legal?.convention_collective && (
                <RecapItem label="Convention collective" value={formData.legal.convention_collective} />
              )}
              {(formData.legal as any)?.duree_preavis_jours && (
                <RecapItem label="Durée de préavis" value={`${(formData.legal as any).duree_preavis_jours} jours`} />
              )}

              {/* Clauses */}
              <div className="col-span-2 mt-2">
                <span className="font-medium text-xs">Clauses contractuelles:</span>
                <div className="flex flex-col gap-1 mt-1">
                  {formData.legal?.clause_confidentialite && (
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-3 w-3 text-green-600" />
                      <span className="text-xs">Clause de confidentialité</span>
                    </div>
                  )}
                  {formData.legal?.clause_non_concurrence && (
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-3 w-3 text-green-600" />
                      <span className="text-xs">Clause de non-concurrence</span>
                    </div>
                  )}
                  {(formData.legal as any)?.clause_mobilite && (
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-3 w-3 text-green-600" />
                      <span className="text-xs">Clause de mobilité</span>
                    </div>
                  )}
                </div>
              </div>
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

