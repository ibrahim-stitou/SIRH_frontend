'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Edit,
  Check,
  FileText,
  Clock,
  AlertCircle
} from 'lucide-react';
import { Contract, ContractStatus } from '@/types/contract';
import { apiRoutes } from '@/config/apiRoutes';
import GeneralInfoDisplay from '@/features/contract/components/details/GeneralInfoDisplay';
import WorkScheduleDisplay from '@/features/contract/components/details/WorkScheduleDisplay';
import SalaryAndLegalDisplay from '@/features/contract/components/details/SalaryAndLegalDisplay';
import ContractDocuments from '@/features/contract/components/details/ContractDocuments';
import ContractActions from '@/features/contract/components/ContractActions';
import PageContainer from '@/components/layout/page-container';
import apiClient from '@/lib/api';
import ContractDetailsLoadingSkeleton from '@/app/admin/contrats-mouvements/contrats/[id]/details/loading-skeleton';

// Fonction pour normaliser le statut du contrat
const normalizeContractStatus = (data: any): Contract => {
  // Mapper les anciens champs vers les nouveaux
  const statusMap: Record<string, ContractStatus> = {
    actif: 'Actif',
    draft: 'Brouillon',
    pending: 'En_attente_signature',
    expired: 'Expire',
    termine: 'Resilie',
    terminated: 'Resilie',
    active: 'Actif',
    Actif: 'Actif',
    Brouillon: 'Brouillon'
  };

  // Déterminer le statut à partir de différents champs possibles
  let status: ContractStatus = 'Brouillon';
  if (data.status) {
    status = statusMap[data.status] || data.status;
  } else if (data.statut_contrat) {
    status = statusMap[data.statut_contrat] || 'Actif';
  } else if (data.statut) {
    status = statusMap[data.statut] || data.statut;
  }

  // Construire l'objet Contract normalisé
  return {
    id: data.id,
    reference: data.reference || `CTR-${data.id}`,
    internal_reference: data.internal_reference,
    type: data.type || data.type_contrat || 'CDI',
    status: status,
    version: data.version || 1,
    employe_id: data.employe_id || data.employee_id,
    employee_name: data.employee_name,
    employee_matricule: data.employee_matricule,
    company_id: data.company_id,
    company_name: data.company_name,
    dates: data.dates || {
      start_date: data.date_debut,
      end_date: data.date_fin,
      signature_date: data.signature_date
    },
    job: data.job || {
      title: data.poste || 'Non spécifié',
      department: data.departement || 'Non spécifié',
      category: 'Employe',
      work_location: 'Non spécifié',
      work_mode: 'Presentiel',
      mobility_clause: false,
      missions: data.notes || ''
    },
    work_time: data.work_time || {
      weekly_hours: 40,
      daily_hours: 8,
      work_schedule: data.horaires || '9h-18h',
      work_schedule_type: 'Normal',
      rest_day: 'Dimanche',
      annual_leave_days: 22
    },
    salary: data.salary || {
      base_salary: data.salaire_base || 0,
      currency: data.salaire_devise || 'MAD',
      payment_frequency: 'Mensuel',
      salary_brut: data.salaire_base || 0,
      salary_net: data.salaire_base || 0,
      salary_net_imposable: data.salaire_base || 0,
      payment_method: 'Virement'
    },
    legal: data.legal || {
      cnss_affiliation: true,
      cnss_regime: 'General',
      amo: true,
      amo_regime: 'CNSS',
      clauses: {
        confidentialite: false,
        non_concurrence: false,
        mobilite: false,
        exclusivite: false,
        formation: false,
        intellectual_property: false,
        discipline_interne: true,
        deontologie: true
      }
    },
    documents: data.documents,
    historique: data.historique || {
      created_at: data.created_at || new Date().toISOString(),
      created_by: 'system',
      updated_at: data.updated_at || new Date().toISOString(),
      updated_by: 'system'
    },
    notes: data.notes,
    internal_notes: data.internal_notes,
    tags: data.tags,
    secteur: data.secteur,
    archived: data.archived || false
  } as Contract;
};

export default function ContractDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const contractId = params.id as string;

  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fetchContractDetails = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(
        apiRoutes.admin.contratsEtMovements.contrats.show(contractId)
      );
      const normalizedContract = normalizeContractStatus(response.data.data);
      setContract(normalizedContract);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Impossible de charger les détails du contrat');
    } finally {
      setLoading(false);
    }
  };

  // Charger les données du contrat
  useEffect(() => {
    fetchContractDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contractId]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    fetchContractDetails(); // Recharger les données originales
  };

  const handleSave = async (updatedData: Partial<Contract>) => {
    try {
      setIsSaving(true);
      const response = await apiClient.put(
        apiRoutes.admin.contratsEtMovements.contrats.update(contractId),
        updatedData
      );

      const normalizedContract = normalizeContractStatus(response.data.data);
      setContract(normalizedContract);
      setIsEditing(false);
      toast.success('Contrat mis à jour avec succès');
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la sauvegarde du contrat');
    } finally {
      setIsSaving(false);
    }
  };

  const handleValidate = async () => {
    try {
      const response = await apiClient.post(
        apiRoutes.admin.contratsEtMovements.contrats.validate(contractId)
      );

      const normalizedContract = normalizeContractStatus(response.data.data);
      setContract(normalizedContract);
      setIsEditing(false);
      toast.success('Contrat validé avec succès');
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la validation du contrat');
    }
  };

  // Nouvelle fonction: suppression du contrat
  const handleDelete = async () => {
    try {
      await apiClient.delete(
        apiRoutes.admin.contratsEtMovements.contrats.delete(contractId)
      );
      toast.success('Contrat supprimé avec succès');
      router.push('/admin/contrats-mouvements/contrats');
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la suppression du contrat');
    }
  };

  const getStatusBadge = (status: ContractStatus | string) => {
    const statusConfig: Record<
      string,
      { label: string; variant: any; icon: any }
    > = {
      Brouillon: {
        label: 'Brouillon',
        variant: 'secondary',
        icon: FileText
      },
      En_attente_signature: {
        label: 'En attente de signature',
        variant: 'warning',
        icon: Clock
      },
      Actif: {
        label: 'Actif',
        variant: 'default',
        icon: Check
      },
      Periode_essai: {
        label: "Période d'essai",
        variant: 'default',
        icon: Clock
      },
      Suspendu: {
        label: 'Suspendu',
        variant: 'destructive',
        icon: AlertCircle
      },
      En_preavis: {
        label: 'En préavis',
        variant: 'warning',
        icon: Clock
      },
      Resilie: {
        label: 'Résilié',
        variant: 'destructive',
        icon: AlertCircle
      },
      Expire: {
        label: 'Expiré',
        variant: 'secondary',
        icon: AlertCircle
      },
      Renouvele: {
        label: 'Renouvelé',
        variant: 'default',
        icon: Check
      },
      Archive: {
        label: 'Archivé',
        variant: 'secondary',
        icon: FileText
      },
      // Mapping pour les anciens statuts
      actif: {
        label: 'Actif',
        variant: 'default',
        icon: Check
      },
      draft: {
        label: 'Brouillon',
        variant: 'secondary',
        icon: FileText
      },
      pending: {
        label: 'En attente',
        variant: 'warning',
        icon: Clock
      },
      expired: {
        label: 'Expiré',
        variant: 'secondary',
        icon: AlertCircle
      },
      terminated: {
        label: 'Résilié',
        variant: 'destructive',
        icon: AlertCircle
      }
    };

    const config = statusConfig[status] || {
      label: status,
      variant: 'secondary',
      icon: FileText
    };

    const Icon = config.icon;

    return (
      <Badge variant={config.variant as any} className='gap-1'>
        <Icon className='h-3 w-3' />
        {config.label}
      </Badge>
    );
  };

  const canEdit = contract?.status === 'Brouillon';
  const canValidate = contract?.status === 'Brouillon' && !isEditing;

  if (loading) {
    return <ContractDetailsLoadingSkeleton />;
  }

  if (!contract) {
    return (
      <div className='flex min-h-screen flex-col items-center justify-center'>
        <AlertCircle className='text-destructive mb-4 h-12 w-12' />
        <h2 className='mb-2 text-2xl font-bold'>Contrat introuvable</h2>
        <p className='text-muted-foreground mb-6'>
          Le contrat demandé n&apos;existe pas.
        </p>
        <Button
          onClick={() => router.push('/admin/contrats-mouvements/contrats')}
        >
          <ArrowLeft className='mr-2 h-4 w-4' />
          Retour à la liste
        </Button>
      </div>
    );
  }

  return (
    <PageContainer scrollable={true}>
      <div className='mx-auto w-full space-y-3 py-4'>
        {/* En-tête compact */}
        <div className='flex items-center justify-between border-b pb-2'>
          <div className='flex items-center gap-3'>
            <Button
              variant='ghost'
              size='icon'
              onClick={() => router.push('/admin/contrats-mouvements/contrats')}
              className='h-8 w-8'
            >
              <ArrowLeft className='h-4 w-4' />
            </Button>
            <div>
              <h1 className='text-2xl font-bold tracking-tight'>
                {contract.employee_name || 'Détails du contrat'}
              </h1>
              <div className='text-muted-foreground flex items-center gap-2 text-sm'>
                <span>{contract.reference}</span>
                <span>•</span>
                <span>{contract.job?.title || 'Poste non spécifié'}</span>
                <span>•</span>
                <span>{contract.type}</span>
              </div>
            </div>
            {getStatusBadge(contract.status)}
          </div>
        </div>

        {/* Onglets avec actions intégrées */}
        <Tabs defaultValue='general' className='space-y-3'>
          <div className='flex items-center justify-between gap-4'>
            <TabsList className='h-9'>
              <TabsTrigger value='general' className='text-sm'>
                Informations générales
              </TabsTrigger>
              <TabsTrigger value='schedule' className='text-sm'>
                Temps de travail
              </TabsTrigger>
              <TabsTrigger value='salary' className='text-sm'>
                Rémunération & Légal
              </TabsTrigger>
              <TabsTrigger value='documents' className='text-sm'>
                Documents
              </TabsTrigger>
            </TabsList>

            <div className='flex items-center gap-2'>
              {canValidate && (
                <Button
                  onClick={handleValidate}
                  size='sm'
                  className='h-9 gap-1.5'
                >
                  <Check className='h-3.5 w-3.5' />
                  Valider
                </Button>
              )}
              {canEdit && !isEditing && (
                <Button
                  onClick={handleEdit}
                  variant='outline'
                  size='sm'
                  className='h-9 gap-1.5'
                >
                  <Edit className='h-3.5 w-3.5' />
                  Modifier
                </Button>
              )}
              {isEditing && (
                <>
                  <Button
                    onClick={handleCancel}
                    variant='outline'
                    size='sm'
                    className='h-9'
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={() => handleSave(contract)}
                    size='sm'
                    disabled={isSaving}
                    className='h-9'
                  >
                    {isSaving ? 'Enregistrement...' : 'Enregistrer'}
                  </Button>
                </>
              )}
              <ContractActions
                contract={contract}
                onGenerate={() =>
                  toast.info('Génération du contrat en cours...')
                }
                onDownload={() => toast.info('Téléchargement du contrat...')}
                onSendSignature={() => toast.info('Envoi pour signature...')}
                onArchive={() => toast.info('Archivage du contrat...')}
                onDelete={handleDelete}
                onRenew={() => toast.info('Renouvellement du contrat...')}
              />
            </div>
          </div>

          <TabsContent value='general' className='mt-0'>
            <GeneralInfoDisplay
              contract={contract}
              isEditing={isEditing && canEdit}
              onUpdate={handleSave}
            />
          </TabsContent>

          <TabsContent value='schedule' className='mt-0'>
            <WorkScheduleDisplay
              contract={contract}
              isEditing={isEditing && canEdit}
              onUpdate={handleSave}
            />
          </TabsContent>

          <TabsContent value='salary' className='mt-0'>
            <SalaryAndLegalDisplay
              contract={contract}
              isEditing={isEditing && canEdit}
              onUpdate={handleSave}
            />
          </TabsContent>

          <TabsContent value='documents' className='mt-0'>
            <ContractDocuments contract={contract} />
          </TabsContent>
        </Tabs>

        {/* Historique */}
        {contract.historique && (
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Historique</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              <div className='grid grid-cols-2 gap-4 text-sm'>
                <div>
                  <span className='text-muted-foreground'>Créé par:</span>
                  <p className='font-medium'>
                    {contract.historique.created_by_name || 'N/A'}
                  </p>
                  <p className='text-muted-foreground text-xs'>
                    {new Date(contract.historique.created_at).toLocaleString(
                      'fr-FR'
                    )}
                  </p>
                </div>
                <div>
                  <span className='text-muted-foreground'>Modifié par:</span>
                  <p className='font-medium'>
                    {contract.historique.updated_by_name || 'N/A'}
                  </p>
                  <p className='text-muted-foreground text-xs'>
                    {new Date(contract.historique.updated_at).toLocaleString(
                      'fr-FR'
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PageContainer>
  );
}
