'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { apiRoutes } from '@/config/apiRoutes';
import { Contract } from '@/types/contract';
import {
  ArrowLeft,
  Download,
  CheckCircle,
  User,
  Calendar,
  Briefcase,
  DollarSign,
  Clock,
  FileText,
  FileEdit,
  Building2,
  Mail,
  Phone,
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { downloadContractPDF } from '@/lib/pdf/contract-generator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useLanguage } from '@/context/LanguageContext';
import PageContainer from '@/components/layout/page-container';
import { ContractDetailsLoadingSkeleton } from './loading-skeleton';
import { cn } from '@/lib/utils';

interface ContractDetailsPageProps {
  params: {
    id: string;
  };
}

// Info Row Component
const InfoRow: React.FC<{ label: string; value: string | number | undefined | null }> = ({ label, value }) => (
  <div className="space-y-1">
    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
    <p className="text-sm font-medium">{value || '—'}</p>
  </div>
);

export default function ContractDetailsPage({ params }: ContractDetailsPageProps) {
  const { t } = useLanguage();
  const router = useRouter();
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContract = async () => {
      try {
        const response = await fetch(apiRoutes.admin.contratsEtMovements.contrats.show(params.id));
        const result = await response.json();

        if (result.status === 'success') {
          setContract(result.data);
        } else {
          toast.error(result.message || t('common.errors.fetchFailed'));
        }
      } catch (error) {
        console.error('Error fetching contract:', error);
        toast.error(t('common.errors.fetchFailed'));
      } finally {
        setLoading(false);
      }
    };

    fetchContract();
  }, [params.id, t]);

  const handleValidate = async () => {
    if (!contract) return;

    try {
      const response = await fetch(apiRoutes.admin.contratsEtMovements.contrats.validate(contract.id), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      });

      const result = await response.json();
      if (result.status === 'success') {
        toast.success(t('contracts.messages.validateSuccess'));
        setContract((prev) => (prev ? { ...prev, statut: 'Actif' } : null));
      } else {
        toast.error(result.message || t('contracts.messages.error'));
      }
    } catch (error) {
      console.error('Error validating contract:', error);
      toast.error(t('contracts.messages.error'));
    }
  };

  const handleGeneratePDF = () => {
    if (!contract) return;
    downloadContractPDF(contract);
    toast.success(t('contracts.messages.pdfGenerated'));
  };

  const handleCreateAvenant = () => {
    toast.info('Fonctionnalité des avenants à venir');
  };

  const formatDate = (date: string | null | undefined): string => {
    if (!date) return 'N/A';
    try {
      return format(new Date(date), 'dd MMMM yyyy', { locale: fr });
    } catch {
      return date;
    }
  };

  const formatCurrency = (amount: number, currency: string = 'MAD'): string => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const getStatusBadgeVariant = (statut: string) => {
    switch (statut) {
      case 'Actif':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'Brouillon':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Terminé':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'Annulé':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <ContractDetailsLoadingSkeleton />
      </PageContainer>
    );
  }

  if (!contract) {
    return (
      <PageContainer>
        <div className="container mx-auto py-6">
          <Card className="border-2 border-dashed">
            <CardContent className="flex h-64 items-center justify-center">
              <div className="text-center space-y-2">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground/50" />
                <p className="text-muted-foreground">{t('contracts.messages.error')}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    );
  }

  const employeeName = contract.employee
    ? `${contract.employee.firstName} ${contract.employee.lastName}`
    : 'N/A';

  return (
    <PageContainer>
      <div className="w-full mx-auto px-4 py-6 space-y-4 ">
        {/* Compact Header Section */}
        <Card className="relative overflow-hidden py-0 mt-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-background opacity-50" />

          <div className="relative p-4 md:p-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Compact Contract Icon */}
              <div className="flex-shrink-0">
                <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-md ring-2 ring-primary/20">
                  <FileText className="h-8 w-8 text-primary-foreground" />
                </div>
              </div>

              {/* Contract Info */}
              <div className="flex-1 space-y-3">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h1 className="text-xl md:text-2xl font-bold tracking-tight">
                        Contrat #{contract.id}
                      </h1>
                      <Badge className={cn("px-2 py-0.5 text-xs font-medium", getStatusBadgeVariant(contract.statut))}>
                        {contract.statut}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <User className="h-3.5 w-3.5" />
                      {employeeName}
                    </p>
                  </div>
                </div>

                {/* Compact Info Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-background/80 border">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <FileEdit className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] text-muted-foreground">Type</p>
                      <p className="text-xs font-medium truncate">{contract.type_contrat}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-2 rounded-lg bg-background/80 border">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] text-muted-foreground">Début</p>
                      <p className="text-xs font-medium truncate">{formatDate(contract.date_debut)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-2 rounded-lg bg-background/80 border">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <DollarSign className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] text-muted-foreground">Salaire</p>
                      <p className="text-xs font-medium truncate">
                        {formatCurrency(contract.salaire_base, contract.salaire_devise)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-2 rounded-lg bg-background/80 border">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Briefcase className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] text-muted-foreground">Poste</p>
                      <p className="text-xs font-medium truncate">{contract.poste}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Compact Action Buttons */}
            <div className="flex items-center gap-2 mt-4 pt-4 border-t flex-wrap">
              <Button onClick={handleGeneratePDF} size="sm" className="gap-2">
                <Download className="h-3.5 w-3.5" />
                {t('contracts.actions.generatePdf')}
              </Button>

              {contract.statut === 'Brouillon' && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="default" size="sm" className="gap-2">
                      <CheckCircle className="h-3.5 w-3.5" />
                      {t('contracts.actions.validate')}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t('common.confirm')}</AlertDialogTitle>
                      <AlertDialogDescription>
                        Êtes-vous sûr de vouloir valider ce contrat ? Une fois validé, il ne pourra plus être modifié.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                      <AlertDialogAction onClick={handleValidate}>
                        {t('common.validate')}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}

              {contract.statut === 'Actif' && (
                <Button variant="outline" size="sm" onClick={handleCreateAvenant} className="gap-2">
                  <FileEdit className="h-3.5 w-3.5" />
                  {t('contracts.actions.createAvenant')}
                </Button>
              )}

              {contract.employee && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/admin/hr-employees/${contract.employee_id}`)}
                  className="gap-2"
                >
                  <User className="h-3.5 w-3.5" />
                  {t('contracts.actions.viewEmployee')}
                </Button>
              )}

              <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-2 ml-auto">
                <ArrowLeft className="h-3.5 w-3.5" />
                {t('common.back')}
              </Button>
            </div>
          </div>
        </Card>

        {/* Compact Details Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Employee Information */}
          <Card className="border-l-2 border-l-primary">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <div className="font-semibold">{t('contracts.sections.employee')}</div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <InfoRow label="Nom complet" value={employeeName} />
              {contract.employee?.matricule && (
                <InfoRow label="Matricule" value={contract.employee.matricule} />
              )}
              {contract.employee?.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{contract.employee.email}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contract Type & Dates */}
          <Card className="border-l-2 border-l-muted-foreground/30">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <div className="font-semibold">{t('contracts.sections.typeAndDates')}</div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                  {t('contracts.fields.type')}
                </p>
                <Badge variant="outline" className="text-xs px-2 py-0.5">
                  {contract.type_contrat}
                </Badge>
              </div>
              <InfoRow label={t('contracts.fields.startDate')} value={formatDate(contract.date_debut)} />
              <InfoRow
                label={t('contracts.fields.endDate')}
                value={formatDate(contract.date_fin) || 'Indéterminée'}
              />
            </CardContent>
          </Card>

          {/* Position & Department */}
          <Card className="border-l-2 border-l-muted-foreground/30">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <div className="font-semibold">{t('contracts.sections.position')}</div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <InfoRow label={t('contracts.fields.position')} value={contract.poste} />
              <InfoRow label={t('contracts.fields.department')} value={contract.departement} />
              <div className="flex items-center gap-2 text-muted-foreground">
                <Building2 className="h-3.5 w-3.5" />
                <span className="text-xs">{contract.departement}</span>
              </div>
            </CardContent>
          </Card>

          {/* Remuneration */}
          <Card className="border-l-2 border-l-primary">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <DollarSign className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <div className="font-semibold">{t('contracts.sections.remuneration')}</div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                  {t('contracts.fields.baseSalary')}
                </p>
                <p className="text-xl font-bold text-primary">
                  {formatCurrency(contract.salaire_base, contract.salaire_devise)}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                  Statut contrat
                </p>
                <Badge variant="outline" className="text-xs">
                  {contract.statut_contrat}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Work Hours */}
          <Card className="border-l-2 border-l-muted-foreground/30">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <div className="font-semibold">{t('contracts.sections.worktime')}</div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <p>{contract.horaires}</p>
            </CardContent>
          </Card>

          {/* Notes */}
          {contract.notes && (
            <Card className="border-l-2 border-l-muted-foreground/30">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="font-semibold">{t('contracts.sections.notes')}</div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {contract.notes}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* System Information */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4" />
              {t('contracts.sections.systemInfo.infoSystem')}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-3 text-sm">
            <InfoRow label="Créé le" value={formatDate(contract.created_at)} />
            <InfoRow label="Mis à jour le" value={formatDate(contract.updated_at)} />
            <InfoRow label="Identifiant" value={`#${contract.id}`} />
          </CardContent>
        </Card>

        {/* Avenants Section */}
        <Card className="border-2 border-dashed">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <FileEdit className="h-4 w-4 text-primary" />
              </div>
              <div>
                <div className="font-semibold">{t('contracts.sections.avenants')}</div>
                <CardDescription className="text-xs">Liste des avenants associés</CardDescription>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <FileEdit className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">{t('contracts.empty.noAvenants')}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}