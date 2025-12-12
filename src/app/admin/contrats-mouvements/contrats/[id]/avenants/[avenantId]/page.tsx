'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import {
  ArrowLeft,
  FileText,
  Download,
  Eye,
  Printer,
  CheckCircle2,
  Trash2,
  Edit,
  FileSignature,
  Upload,
  AlertCircle,
  Clock,
  Check
} from 'lucide-react';
import { apiRoutes } from '@/config/apiRoutes';
import apiClient from '@/lib/api';
import PageContainer from '@/components/layout/page-container';
import { Contract } from '@/types/contract';
import { formatDateLong } from '@/lib/date-utils';
import { FileUploader } from '@/components/file-uploader';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Avenant {
  id: string;
  contract_id: string;
  numero: number;
  date: string;
  objet: string;
  description?: string;
  motif?: string;
  status: 'Valide' | 'Brouillon';
  type_modification?: string;
  changes?: Record<string, any>;
  document_url?: string;
  signed_document?: {
    url: string;
    name: string;
    uploaded_at: string;
  };
  created_at: string;
  created_by: string;
}

export default function AvenantDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const avenantId = params.avenantId as string;
  const contractId = params.id as string;

  const [avenant, setAvenant] = useState<Avenant | null>(null);
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [validating, setValidating] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Charger l'avenant
        const avenantResponse = await apiClient.get(
          apiRoutes.admin.contratsEtMovements.avenants.show(avenantId)
        );

        if (avenantResponse.data) {
          const avenantData = avenantResponse.data.data || avenantResponse.data;
          setAvenant(avenantData);

          // Charger le contrat pour contexte
          const contractResponse = await apiClient.get(
            apiRoutes.admin.contratsEtMovements.contrats.show(contractId)
          );

          if (contractResponse.data) {
            const contractData = contractResponse.data.data || contractResponse.data;
            setContract(contractData);
          }
        }
      } catch (error) {
        console.error('Error loading avenant:', error);
        toast.error('Erreur lors du chargement de l\'avenant');
        router.push(`/admin/contrats-mouvements/contrats/${contractId}/details?tab=documents`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [avenantId, contractId, router]);

  const handleDelete = async () => {
    if (!avenant) return;

    setDeleting(true);
    try {
      await apiClient.delete(
        apiRoutes.admin.contratsEtMovements.avenants.delete(avenantId)
      );
      toast.success('Avenant supprimé avec succès');
      router.push(`/admin/contrats-mouvements/contrats/${contractId}/details?tab=documents`);
    } catch (error) {
      console.error('Error deleting avenant:', error);
      toast.error('Erreur lors de la suppression de l\'avenant');
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleValidate = async () => {
    if (!avenant) return;

    setValidating(true);
    try {
      const response = await apiClient.put(
        apiRoutes.admin.contratsEtMovements.avenants.update(avenantId),
        { ...avenant, status: 'Valide' }
      );

      if (response.data) {
        toast.success('Avenant validé avec succès');
        setAvenant({ ...avenant, status: 'Valide' });
      }
    } catch (error) {
      console.error('Error validating avenant:', error);
      toast.error('Erreur lors de la validation de l\'avenant');
    } finally {
      setValidating(false);
    }
  };

  const handleGeneratePDF = async () => {
    if (!avenant || !contract) return;

    setGenerating(true);
    try {
      // Appeler l'API de génération de PDF pour avenant
      const response = await apiClient.post(
        `/avenants/${avenantId}/generate-pdf`,
        { contract, avenant },
        { responseType: 'blob' }
      );

      // Créer un blob et télécharger
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Avenant_${avenant.numero}_${contract.reference}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('PDF de l\'avenant généré avec succès');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Erreur lors de la génération du PDF');
    } finally {
      setGenerating(false);
    }
  };

  const handleUploadSignedDocument = async (files: File[]) => {
    if (!avenant || files.length === 0) return;

    setUploading(true);
    try {
      const file = files[0];

      // Simuler l'upload (à remplacer par vraie API)
      const formData = new FormData();
      formData.append('file', file);

      // Mock upload
      const mockUrl = `/uploads/avenants/${avenantId}/signed.pdf`;

      const response = await apiClient.post(
        `/avenants/${avenantId}/upload-signed`,
        {
          fileUrl: mockUrl,
          fileName: file.name
        }
      );

      if (response.data) {
        setAvenant({
          ...avenant,
          signed_document: {
            url: mockUrl,
            name: file.name,
            uploaded_at: new Date().toISOString()
          }
        });
        toast.success('Document signé uploadé avec succès');
        setShowUploadDialog(false);
      }
    } catch (error) {
      console.error('Error uploading signed document:', error);
      toast.error('Erreur lors de l\'upload du document signé');
    } finally {
      setUploading(false);
    }
  };

  const handleViewDocument = (url: string) => {
    window.open(url, '_blank');
  };

  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Valide':
        return (
          <Badge className='gap-1 bg-green-500 hover:bg-green-600'>
            <CheckCircle2 className='h-3 w-3' />
            Validé
          </Badge>
        );
      case 'Brouillon':
        return (
          <Badge variant='secondary' className='gap-1'>
            <Clock className='h-3 w-3' />
            Brouillon
          </Badge>
        );
      default:
        return <Badge variant='secondary'>{status}</Badge>;
    }
  };

  const renderChanges = (changes: Record<string, any>) => {
    if (!changes) return null;

    return (
      <div className='space-y-4'>
        {changes.salary && (
          <div>
            <h4 className='mb-3 font-semibold text-green-700 dark:text-green-400'>
              Modifications de Salaire
            </h4>
            <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
              {/* Avant */}
              <Card className='border-l-4 border-l-red-500'>
                <CardHeader className='pb-3'>
                  <CardTitle className='text-sm text-red-600 dark:text-red-400'>Avant</CardTitle>
                </CardHeader>
                <CardContent className='space-y-2 text-sm'>
                  {changes.salary.avant?.salary_brut && (
                    <div>
                      <span className='text-muted-foreground text-xs'>Salaire Brut:</span>
                      <p className='font-mono font-semibold'>{changes.salary.avant.salary_brut} MAD</p>
                    </div>
                  )}
                  {changes.salary.avant?.salary_net && (
                    <div>
                      <span className='text-muted-foreground text-xs'>Salaire Net:</span>
                      <p className='font-mono font-semibold'>{changes.salary.avant.salary_net} MAD</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Après */}
              <Card className='border-l-4 border-l-green-500'>
                <CardHeader className='pb-3'>
                  <CardTitle className='text-sm text-green-600 dark:text-green-400'>Après</CardTitle>
                </CardHeader>
                <CardContent className='space-y-2 text-sm'>
                  {changes.salary.apres?.salary_brut && (
                    <div>
                      <span className='text-muted-foreground text-xs'>Salaire Brut:</span>
                      <p className='font-mono font-semibold'>{changes.salary.apres.salary_brut} MAD</p>
                    </div>
                  )}
                  {changes.salary.apres?.salary_net && (
                    <div>
                      <span className='text-muted-foreground text-xs'>Salaire Net:</span>
                      <p className='font-mono font-semibold'>{changes.salary.apres.salary_net} MAD</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {changes.schedule && (
          <div>
            <h4 className='mb-3 font-semibold text-blue-700 dark:text-blue-400'>
              Modifications d&apos;Horaire
            </h4>
            <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
              <Card className='border-l-4 border-l-red-500'>
                <CardHeader className='pb-3'>
                  <CardTitle className='text-sm text-red-600 dark:text-red-400'>Avant</CardTitle>
                </CardHeader>
                <CardContent className='space-y-2 text-sm'>
                  {changes.schedule.avant?.schedule_type && (
                    <div>
                      <span className='text-muted-foreground text-xs'>Type:</span>
                      <p className='font-medium'>{changes.schedule.avant.schedule_type}</p>
                    </div>
                  )}
                  {changes.schedule.avant?.hours_per_week && (
                    <div>
                      <span className='text-muted-foreground text-xs'>Heures/semaine:</span>
                      <p className='font-medium'>{changes.schedule.avant.hours_per_week}h</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className='border-l-4 border-l-green-500'>
                <CardHeader className='pb-3'>
                  <CardTitle className='text-sm text-green-600 dark:text-green-400'>Après</CardTitle>
                </CardHeader>
                <CardContent className='space-y-2 text-sm'>
                  {changes.schedule.apres?.schedule_type && (
                    <div>
                      <span className='text-muted-foreground text-xs'>Type:</span>
                      <p className='font-medium'>{changes.schedule.apres.schedule_type}</p>
                    </div>
                  )}
                  {changes.schedule.apres?.hours_per_week && (
                    <div>
                      <span className='text-muted-foreground text-xs'>Heures/semaine:</span>
                      <p className='font-medium'>{changes.schedule.apres.hours_per_week}h</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {changes.job && (
          <div>
            <h4 className='mb-3 font-semibold text-purple-700 dark:text-purple-400'>
              Modifications de Poste
            </h4>
            <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
              <Card className='border-l-4 border-l-red-500'>
                <CardHeader className='pb-3'>
                  <CardTitle className='text-sm text-red-600 dark:text-red-400'>Avant</CardTitle>
                </CardHeader>
                <CardContent className='space-y-2 text-sm'>
                  {changes.job.avant?.poste && (
                    <div>
                      <span className='text-muted-foreground text-xs'>Poste:</span>
                      <p className='font-medium'>{changes.job.avant.poste}</p>
                    </div>
                  )}
                  {changes.job.avant?.department && (
                    <div>
                      <span className='text-muted-foreground text-xs'>Département:</span>
                      <p className='font-medium'>{changes.job.avant.department}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className='border-l-4 border-l-green-500'>
                <CardHeader className='pb-3'>
                  <CardTitle className='text-sm text-green-600 dark:text-green-400'>Après</CardTitle>
                </CardHeader>
                <CardContent className='space-y-2 text-sm'>
                  {changes.job.apres?.poste && (
                    <div>
                      <span className='text-muted-foreground text-xs'>Poste:</span>
                      <p className='font-medium'>{changes.job.apres.poste}</p>
                    </div>
                  )}
                  {changes.job.apres?.department && (
                    <div>
                      <span className='text-muted-foreground text-xs'>Département:</span>
                      <p className='font-medium'>{changes.job.apres.department}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <PageContainer scrollable>
        <div className='w-full space-y-6 p-4 md:p-6'>
          {/* Header Skeleton */}
          <div className='relative overflow-hidden rounded-lg border bg-gradient-to-r from-primary/10 via-primary/5 to-background p-6'>
            <div className='space-y-4'>
              <div className='h-8 w-32 bg-muted animate-pulse rounded' />
              <div className='flex items-center justify-between'>
                <div className='space-y-3 flex-1'>
                  <div className='flex items-center gap-3'>
                    <div className='h-9 w-48 bg-muted animate-pulse rounded' />
                    <div className='h-7 w-24 bg-muted animate-pulse rounded' />
                  </div>
                  <div className='flex items-center gap-2'>
                    <div className='h-5 w-40 bg-muted animate-pulse rounded' />
                    <div className='h-5 w-px bg-muted' />
                    <div className='h-5 w-48 bg-muted animate-pulse rounded' />
                  </div>
                </div>
                <div className='flex gap-2'>
                  <div className='h-9 w-32 bg-muted animate-pulse rounded' />
                  <div className='h-9 w-32 bg-muted animate-pulse rounded' />
                  <div className='h-9 w-32 bg-muted animate-pulse rounded' />
                </div>
              </div>
            </div>
          </div>

          <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
            {/* Colonne principale */}
            <div className='lg:col-span-2 space-y-6'>
              {/* Card Informations Générales Skeleton */}
              <Card>
                <CardHeader>
                  <div className='h-6 w-48 bg-muted animate-pulse rounded' />
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className='space-y-2'>
                        <div className='h-4 w-24 bg-muted animate-pulse rounded' />
                        <div className='h-5 w-full bg-muted animate-pulse rounded' />
                      </div>
                    ))}
                  </div>
                  <div className='space-y-2'>
                    <div className='h-4 w-16 bg-muted animate-pulse rounded' />
                    <div className='h-20 w-full bg-muted animate-pulse rounded' />
                  </div>
                </CardContent>
              </Card>

              {/* Card Modifications Skeleton */}
              <Card>
                <CardHeader>
                  <div className='h-6 w-32 bg-muted animate-pulse rounded' />
                </CardHeader>
                <CardContent>
                  <div className='space-y-4'>
                    <div className='grid grid-cols-2 gap-4'>
                      <div className='space-y-3 p-4 border rounded-lg'>
                        <div className='h-5 w-20 bg-muted animate-pulse rounded' />
                        <div className='h-4 w-full bg-muted animate-pulse rounded' />
                        <div className='h-4 w-full bg-muted animate-pulse rounded' />
                      </div>
                      <div className='space-y-3 p-4 border rounded-lg'>
                        <div className='h-5 w-20 bg-muted animate-pulse rounded' />
                        <div className='h-4 w-full bg-muted animate-pulse rounded' />
                        <div className='h-4 w-full bg-muted animate-pulse rounded' />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Card Documents Skeleton */}
              <Card>
                <CardHeader>
                  <div className='h-6 w-32 bg-muted animate-pulse rounded' />
                </CardHeader>
                <CardContent className='space-y-3'>
                  {[1, 2].map((i) => (
                    <div key={i} className='flex items-center justify-between p-4 border rounded-lg'>
                      <div className='flex items-center gap-3'>
                        <div className='h-10 w-10 bg-muted animate-pulse rounded' />
                        <div className='space-y-2'>
                          <div className='h-4 w-48 bg-muted animate-pulse rounded' />
                          <div className='h-3 w-32 bg-muted animate-pulse rounded' />
                        </div>
                      </div>
                      <div className='flex gap-2'>
                        <div className='h-8 w-24 bg-muted animate-pulse rounded' />
                        <div className='h-8 w-24 bg-muted animate-pulse rounded' />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (!avenant || !contract) {
    return (
      <PageContainer scrollable>
        <div className='flex h-[50vh] items-center justify-center'>
          <div className='text-center'>
            <FileText className='text-muted-foreground mx-auto mb-4 h-12 w-12' />
            <p className='text-muted-foreground'>Avenant introuvable</p>
            <Button
              variant='outline'
              className='mt-4'
              onClick={() => router.push(`/admin/contrats-mouvements/contrats/${contractId}/details?tab=documents`)}
            >
              Retour au contrat
            </Button>
          </div>
        </div>
      </PageContainer>
    );
  }

  const isBrouillon = avenant.status === 'Brouillon';
  const isValide = avenant.status === 'Valide';

  return (
    <PageContainer scrollable>
      <div className='w-full space-y-6 p-4 md:p-6'>
        {/* Header */}
        <div className='relative overflow-hidden rounded-lg border bg-gradient-to-r from-primary/10 via-primary/5 to-background p-6'>
          <div className='flex items-center justify-between'>
            <div>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => router.push(`/admin/contrats-mouvements/contrats/${contractId}/details?tab=documents`)}
                className='mb-3 -ml-2'
              >
                <ArrowLeft className='mr-2 h-4 w-4' />
                Retour au contrat
              </Button>
              <div className='flex items-center gap-3 mb-2'>
                <h1 className='text-3xl font-bold'>Avenant N°{avenant.numero}</h1>
                {getStatusBadge(avenant.status)}
              </div>
              <p className='text-muted-foreground flex items-center gap-2'>
                <span className='font-medium'>{contract.reference}</span>
                <Separator orientation='vertical' className='h-4' />
                <span>{contract.employee_name}</span>
              </p>
            </div>

            {/* Actions Header */}
            <div className='flex items-center gap-2'>
              {isBrouillon && (
                <>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => router.push(`/admin/contrats-mouvements/contrats/${contractId}/avenants/${avenantId}/edit`)}
                  >
                    <Edit className='mr-2 h-4 w-4' />
                    Modifier
                  </Button>
                  <Button
                    variant='default'
                    size='sm'
                    onClick={handleValidate}
                    disabled={validating}
                  >
                    {validating ? (
                      <>
                        <div className='mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent' />
                        Validation...
                      </>
                    ) : (
                      <>
                        <Check className='mr-2 h-4 w-4' />
                        Valider l&apos;Avenant
                      </>
                    )}
                  </Button>
                  <Button
                    variant='destructive'
                    size='sm'
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    <Trash2 className='mr-2 h-4 w-4' />
                    Supprimer
                  </Button>
                </>
              )}

              {isValide && (
                <Button
                  variant='default'
                  size='sm'
                  onClick={handleGeneratePDF}
                  disabled={generating}
                >
                  {generating ? (
                    <>
                      <div className='mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent' />
                      Génération...
                    </>
                  ) : (
                    <>
                      <FileText className='mr-2 h-4 w-4' />
                      Générer PDF
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
          {/* Colonne principale (2/3) */}
          <div className='lg:col-span-2 space-y-6'>
            {/* Informations Générales */}
            <Card>
              <CardHeader>
                <CardTitle>Informations Générales</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  <div>
                    <p className='text-muted-foreground text-sm'>Date d&apos;effet</p>
                    <p className='font-medium'>{formatDateLong(avenant.date)}</p>
                  </div>

                  <div>
                    <p className='text-muted-foreground text-sm'>Objet</p>
                    <p className='font-medium'>{avenant.objet}</p>
                  </div>
                </div>

                {avenant.motif && (
                  <div>
                    <p className='text-muted-foreground text-sm mb-1'>Motif</p>
                    <p className='text-sm whitespace-pre-wrap rounded-lg bg-muted/50 p-3'>{avenant.motif}</p>
                  </div>
                )}

                {avenant.description && (
                  <div>
                    <p className='text-muted-foreground text-sm mb-1'>Description</p>
                    <p className='text-sm whitespace-pre-wrap rounded-lg bg-muted/50 p-3'>{avenant.description}</p>
                  </div>
                )}

                <Separator />

                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  <div>
                    <p className='text-muted-foreground text-sm'>Créé le</p>
                    <p className='font-medium text-sm'>{formatDateLong(avenant.created_at)}</p>
                  </div>

                  <div>
                    <p className='text-muted-foreground text-sm'>Créé par</p>
                    <p className='font-medium text-sm'>{avenant.created_by}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Modifications */}
            {avenant.changes && (
              <Card>
                <CardHeader>
                  <CardTitle>Modifications Apportées</CardTitle>
                  <CardDescription>
                    Comparaison avant/après des changements
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {renderChanges(avenant.changes)}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar (1/3) - Documents */}
          <div className='lg:col-span-1 space-y-6'>
            {/* Document Généré */}
            {isValide && (
              <Card className='border-l-4 border-l-blue-500'>
                <CardHeader className='pb-3'>
                  <CardTitle className='flex items-center gap-2 text-base'>
                    <FileText className='h-5 w-5 text-blue-500' />
                    Document Généré
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-3'>
                  {avenant.document_url ? (
                    <>
                      <div className='rounded-lg bg-blue-50 dark:bg-blue-950 p-3'>
                        <p className='text-sm font-medium'>PDF disponible</p>
                        <p className='text-xs text-muted-foreground'>
                          Avenant_{avenant.numero}_{contract.reference}.pdf
                        </p>
                      </div>
                      <div className='flex gap-2'>
                        <Button
                          variant='outline'
                          size='sm'
                          className='flex-1'
                          onClick={() => handleViewDocument(avenant.document_url!)}
                        >
                          <Eye className='mr-1 h-4 w-4' />
                          Voir
                        </Button>
                        <Button
                          variant='outline'
                          size='sm'
                          className='flex-1'
                          onClick={() => handleDownload(
                            avenant.document_url!,
                            `Avenant_${avenant.numero}_${contract.reference}.pdf`
                          )}
                        >
                          <Download className='mr-1 h-4 w-4' />
                          Télécharger
                        </Button>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => window.print()}
                        >
                          <Printer className='h-4 w-4' />
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className='text-sm text-muted-foreground'>
                        Aucun document généré
                      </p>
                      <Button
                        onClick={handleGeneratePDF}
                        disabled={generating}
                        size='sm'
                        className='w-full'
                      >
                        {generating ? (
                          <>
                            <div className='mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent' />
                            Génération...
                          </>
                        ) : (
                          <>
                            <FileText className='mr-2 h-4 w-4' />
                            Générer le PDF
                          </>
                        )}
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Document Signé */}
            {isValide && (
              <Card className='border-l-4 border-l-green-500'>
                <CardHeader className='pb-3'>
                  <CardTitle className='flex items-center gap-2 text-base'>
                    <FileSignature className='h-5 w-5 text-green-500' />
                    Document Signé
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-3'>
                  {avenant.signed_document ? (
                    <>
                      <div className='rounded-lg bg-green-50 dark:bg-green-950 p-3'>
                        <p className='text-sm font-medium flex items-center gap-2'>
                          <CheckCircle2 className='h-4 w-4 text-green-600' />
                          Document signé uploadé
                        </p>
                        <p className='text-xs text-muted-foreground mt-1'>
                          {avenant.signed_document.name}
                        </p>
                        <p className='text-xs text-muted-foreground'>
                          {formatDateLong(avenant.signed_document.uploaded_at)}
                        </p>
                      </div>
                      <div className='flex gap-2'>
                        <Button
                          variant='outline'
                          size='sm'
                          className='flex-1'
                          onClick={() => handleViewDocument(avenant.signed_document!.url)}
                        >
                          <Eye className='mr-1 h-4 w-4' />
                          Voir
                        </Button>
                        <Button
                          variant='outline'
                          size='sm'
                          className='flex-1'
                          onClick={() => handleDownload(
                            avenant.signed_document!.url,
                            avenant.signed_document!.name
                          )}
                        >
                          <Download className='mr-1 h-4 w-4' />
                          Télécharger
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className='text-sm text-muted-foreground'>
                        Aucun document signé
                      </p>
                      <Button
                        onClick={() => setShowUploadDialog(true)}
                        size='sm'
                        variant='outline'
                        className='w-full'
                      >
                        <Upload className='mr-2 h-4 w-4' />
                        Uploader le document signé
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Delete Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
              <AlertDialogDescription>
                Êtes-vous sûr de vouloir supprimer cet avenant ? Cette action est irréversible.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleting}>Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={deleting}
                className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
              >
                {deleting ? 'Suppression...' : 'Supprimer'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Upload Dialog */}
        <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Uploader le document signé</DialogTitle>
              <DialogDescription>
                Sélectionnez le fichier PDF de l&apos;avenant signé par les parties
              </DialogDescription>
            </DialogHeader>
            <div className='py-4'>
              <FileUploader
                maxFiles={1}
                maxSize={10 * 1024 * 1024}
                accept={{ 'application/pdf': ['.pdf'] }}
                onUpload={handleUploadSignedDocument}
                disabled={uploading}
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </PageContainer>
  );
}

