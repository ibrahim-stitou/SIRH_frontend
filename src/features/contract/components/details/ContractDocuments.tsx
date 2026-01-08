'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  Download,
  Eye,
  Plus,
  File,
  CheckCircle2,
  Clock,
  Upload,
  Printer,
  FileSignature,
  FileCheck
} from 'lucide-react';
import { Contract } from '@/types/contract';
import { formatDateLong } from '@/lib/date-utils';
import { toast } from 'sonner';
import { apiRoutes } from '@/config/apiRoutes';
import apiClient from '@/lib/api';
import { FileUploader } from '@/components/file-uploader';

interface Avenant {
  id: string;
  contract_id: string;
  numero: number;
  date: string;
  objet: string;
  description?: string;
  status: 'Valide' | 'Signe' | 'Brouillon' | 'En_attente';
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

interface ContractDocumentsProps {
  contract: Contract;
  onRefresh?: () => void;
}

export default function ContractDocuments({
  contract,
  onRefresh
}: ContractDocumentsProps) {
  const [avenants, setAvenants] = useState<Avenant[]>([]);
  const [isLoadingAvenants, setIsLoadingAvenants] = useState(false);
  const [isUploadingSignedDoc, setIsUploadingSignedDoc] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [maxAvenants, setMaxAvenants] = useState<number | null>(null);
  const router = useRouter();

  // Load parameters (max limits)
  useEffect(() => {
    let cancelled = false;
    async function loadParams() {
      try {
        const res = await apiClient.get(
          apiRoutes.admin.parametres.parametreMaxGeneral.list
        );
        const rows = res.data?.data || res.data || [];
        const first = Array.isArray(rows) && rows.length ? rows[0] : null;
        if (!cancelled)
          setMaxAvenants(
            typeof first?.max_avenants_par_contrat === 'number'
              ? first.max_avenants_par_contrat
              : null
          );
      } catch (_) {
        // ignore
      }
    }
    loadParams();
    return () => {
      cancelled = true;
    };
  }, []);

  // Load avenants for this contract
  useEffect(() => {
    const fetchAvenants = async () => {
      if (!contract.id) return;

      setIsLoadingAvenants(true);
      try {
        const response = await apiClient.get(
          apiRoutes.admin.contratsEtMovements.avenants.byContract(contract.id)
        );

        if (response.data) {
          const data = Array.isArray(response.data)
            ? response.data
            : response.data.data || [];
          setAvenants(data);
        }
      } catch (error) {
        console.error('Error fetching avenants:', error);
        toast.error('Erreur lors du chargement des avenants');
      } finally {
        setIsLoadingAvenants(false);
      }
    };

    fetchAvenants();
  }, [contract.id]);

  const remainingAvenants =
    typeof maxAvenants === 'number'
      ? Math.max(0, maxAvenants - (avenants?.length || 0))
      : null;
  const reachedMax =
    typeof remainingAvenants === 'number' && remainingAvenants <= 0;

  const handleUploadSignedDocument = async (files: File[]) => {
    if (files.length === 0) return;

    setIsUploadingSignedDoc(true);
    try {
      const formData = new FormData();
      formData.append('file', files[0]);

      // Mock upload - in production, upload to server first
      const mockFileUrl = `/uploads/contracts/${contract.id}/signed-${Date.now()}.pdf`;

      const response = await apiClient.post(
        apiRoutes.admin.contratsEtMovements.contrats.uploadSigned(contract.id),
        {
          fileUrl: mockFileUrl,
          fileName: files[0].name
        }
      );

      if (response.data) {
        toast.success('Contrat signé téléversé avec succès');
        setShowUploadDialog(false);
        onRefresh?.();
      }
    } catch (error) {
      console.error('Error uploading signed document:', error);
      toast.error('Erreur lors du téléversement du contrat signé');
    } finally {
      setIsUploadingSignedDoc(false);
    }
  };

  const handleViewDocument = (url: string) => {
    window.open(url, '_blank');
  };

  const handleDownloadDocument = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddAvenant = () => {
    // Navigate to avenant creation page using Next.js client navigation
    router.push(
      `/admin/contrats-mouvements/contrats/${contract.id}/avenants/ajouter`
    );
  };

  return (
    <div className='space-y-6'>
      {/* Contrat Généré par le Système */}
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <CardTitle className='flex items-center gap-2 text-lg'>
              <FileText className='h-5 w-5' />
              Contrat Généré par le Système
            </CardTitle>
            {contract.status !== 'Brouillon' && (
              <Badge variant='secondary' className='gap-1'>
                <FileCheck className='h-3 w-3' />
                Disponible
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {contract.status !== 'Brouillon' ? (
            <div className='bg-muted/30 flex items-center justify-between rounded-lg border p-4'>
              <div className='flex items-center gap-3'>
                <div className='bg-primary/10 rounded-lg p-2'>
                  <File className='text-primary h-5 w-5' />
                </div>
                <div>
                  <p className='font-medium'>
                    Contrat_{contract.reference}_Généré.pdf
                  </p>
                  <p className='text-muted-foreground text-sm'>
                    Généré le{' '}
                    {formatDateLong(
                      contract.dates.start_date || new Date().toISOString()
                    )}
                  </p>
                  <p className='text-muted-foreground text-xs'>
                    Document généré automatiquement par le système
                  </p>
                </div>
              </div>
              <div className='flex items-center gap-2'>
                <Button
                  variant='ghost'
                  size='sm'
                  title='Aperçu'
                  onClick={() =>
                    handleViewDocument(`/generated/contract-${contract.id}.pdf`)
                  }
                >
                  <Eye className='h-4 w-4' />
                </Button>
                <Button
                  variant='ghost'
                  size='sm'
                  title='Télécharger'
                  onClick={() =>
                    handleDownloadDocument(
                      `/generated/contract-${contract.id}.pdf`,
                      `Contrat_${contract.reference}_Généré.pdf`
                    )
                  }
                >
                  <Download className='h-4 w-4' />
                </Button>
                <Button
                  variant='ghost'
                  size='sm'
                  title='Imprimer'
                  onClick={() => window.print()}
                >
                  <Printer className='h-4 w-4' />
                </Button>
              </div>
            </div>
          ) : (
            <div className='text-muted-foreground py-6 text-center'>
              <FileText className='mx-auto mb-2 h-12 w-12 opacity-50' />
              <p>Contrat en brouillon</p>
              <p className='text-sm'>Le contrat sera généré après validation</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contrat Signé Scanné */}
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <CardTitle className='flex items-center gap-2 text-lg'>
              <FileSignature className='h-5 w-5' />
              Contrat Signé et Scanné
            </CardTitle>
            <div className='flex items-center gap-2'>
              {contract.signed_document ? (
                <Badge variant='default' className='gap-1'>
                  <CheckCircle2 className='h-3 w-3' />
                  Signé
                </Badge>
              ) : (
                <>
                  {contract.status !== 'Brouillon' && (
                    <Button
                      onClick={() => setShowUploadDialog(!showUploadDialog)}
                      size='sm'
                      variant='outline'
                    >
                      <Upload className='mr-2 h-4 w-4' />
                      Téléverser le contrat signé
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {showUploadDialog && (
            <div className='border-primary/50 bg-primary/5 mb-4 rounded-lg border border-dashed p-4'>
              <FileUploader
                maxFiles={1}
                maxSize={10 * 1024 * 1024}
                accept={{
                  'application/pdf': ['.pdf']
                }}
                onUpload={handleUploadSignedDocument}
                disabled={isUploadingSignedDoc}
              />
              <p className='text-muted-foreground mt-2 text-xs'>
                Téléversez le contrat signé scanné au format PDF (max 10 MB)
              </p>
            </div>
          )}

          {contract.signed_document ? (
            <div className='bg-muted/30 flex items-center justify-between rounded-lg border p-4'>
              <div className='flex items-center gap-3'>
                <div className='rounded-lg bg-green-500/10 p-2'>
                  <FileSignature className='h-5 w-5 text-green-600' />
                </div>
                <div>
                  <p className='font-medium'>
                    {contract.signed_document.name ||
                      `Contrat_${contract.reference}_Signé.pdf`}
                  </p>
                  <p className='text-muted-foreground text-sm'>
                    Téléversé le{' '}
                    {formatDateLong(
                      contract.signed_document.uploaded_at ||
                        contract.dates.signature_date
                    )}
                  </p>
                  <p className='text-muted-foreground text-xs'>
                    Document signé par les parties
                  </p>
                </div>
              </div>
              <div className='flex items-center gap-2'>
                <Button
                  variant='ghost'
                  size='sm'
                  title='Aperçu'
                  onClick={() =>
                    handleViewDocument(contract.signed_document!.url)
                  }
                >
                  <Eye className='h-4 w-4' />
                </Button>
                <Button
                  variant='ghost'
                  size='sm'
                  title='Télécharger'
                  onClick={() =>
                    handleDownloadDocument(
                      contract.signed_document!.url,
                      contract.signed_document!.name ||
                        `Contrat_${contract.reference}_Signé.pdf`
                    )
                  }
                >
                  <Download className='h-4 w-4' />
                </Button>
                <Button
                  variant='ghost'
                  size='sm'
                  title='Imprimer'
                  onClick={() => window.print()}
                >
                  <Printer className='h-4 w-4' />
                </Button>
              </div>
            </div>
          ) : (
            <div className='text-muted-foreground py-6 text-center'>
              <FileSignature className='mx-auto mb-2 h-12 w-12 opacity-50' />
              <p>Aucun contrat signé téléversé</p>
              <p className='text-sm'>
                Téléversez le contrat signé et scanné après signature
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Avenants */}
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <CardTitle className='flex items-center gap-2 text-lg'>
              <FileText className='h-5 w-5' />
              Avenants
              {avenants.length > 0 && (
                <Badge variant='secondary'>{avenants.length}</Badge>
              )}
            </CardTitle>
            <div className='flex items-center gap-3'>
              {typeof maxAvenants === 'number' && (
                <div
                  className={`rounded-md border px-2 py-1 text-xs ${reachedMax ? 'border-red-300 bg-red-50 text-red-600' : 'text-muted-foreground bg-muted/30'}`}
                >
                  Max: <strong>{maxAvenants}</strong>
                  {remainingAvenants !== null && (
                    <span className='ml-2'>
                      Restant:{' '}
                      <strong className={`${reachedMax ? 'text-red-700' : ''}`}>
                        {remainingAvenants}
                      </strong>
                    </span>
                  )}
                </div>
              )}
              {contract.status !== 'Brouillon' && (
                <Button
                  onClick={handleAddAvenant}
                  size='sm'
                  variant='outline'
                  disabled={reachedMax}
                >
                  <Plus className='mr-2 h-4 w-4' />
                  Créer un avenant
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {reachedMax && (
            <div className='mb-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700'>
              Nombre maximum d’avenants atteint pour ce contrat.
            </div>
          )}
          {isLoadingAvenants ? (
            <div className='py-6 text-center'>
              <div className='border-primary mx-auto h-8 w-8 animate-spin rounded-full border-4 border-t-transparent' />
              <p className='text-muted-foreground mt-2 text-sm'>
                Chargement des avenants...
              </p>
            </div>
          ) : avenants.length > 0 ? (
            <div className='space-y-3'>
              {avenants.map((avenant) => (
                <div
                  key={avenant.id}
                  className='hover:bg-muted/30 flex items-center justify-between rounded-lg border p-4 transition-colors'
                >
                  <div className='flex items-center gap-3'>
                    <div className='rounded-lg bg-blue-500/10 p-2'>
                      <File className='h-5 w-5 text-blue-600' />
                    </div>
                    <div>
                      <div className='flex items-center gap-2'>
                        <p className='font-medium'>
                          Avenant N°{avenant.numero}
                        </p>
                        {avenant.status === 'Valide' ||
                        avenant.status === 'Signe' ? (
                          <Badge className='h-5 gap-1 bg-green-500 hover:bg-green-600'>
                            <CheckCircle2 className='h-3 w-3' />
                            Validé
                          </Badge>
                        ) : avenant.status === 'Brouillon' ? (
                          <Badge variant='secondary' className='h-5 gap-1'>
                            <Clock className='h-3 w-3' />
                            Brouillon
                          </Badge>
                        ) : (
                          <Badge variant='outline' className='h-5 gap-1'>
                            <Clock className='h-3 w-3' />
                            En attente
                          </Badge>
                        )}
                      </div>
                      <p className='text-muted-foreground text-sm'>
                        {avenant.objet}
                      </p>
                      {avenant.description && (
                        <p className='text-muted-foreground text-xs'>
                          {avenant.description}
                        </p>
                      )}
                      <p className='text-muted-foreground text-xs'>
                        {formatDateLong(avenant.date)}
                      </p>
                    </div>
                  </div>
                  <div
                    className='flex items-center gap-2'
                    onClick={(e) => e.stopPropagation()}
                  >
                    {avenant.document_url && (
                      <>
                        <Button
                          variant='ghost'
                          size='sm'
                          title='Aperçu'
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDocument(avenant.document_url!);
                          }}
                        >
                          <Eye className='h-4 w-4' />
                        </Button>
                        <Button
                          variant='ghost'
                          size='sm'
                          title='Télécharger'
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadDocument(
                              avenant.document_url!,
                              `Avenant_${avenant.numero}_${contract.reference}.pdf`
                            );
                          }}
                        >
                          <Download className='h-4 w-4' />
                        </Button>
                        <Button
                          variant='ghost'
                          size='sm'
                          title='Imprimer'
                          onClick={(e) => {
                            e.stopPropagation();
                            window.print();
                          }}
                        >
                          <Printer className='h-4 w-4' />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className='text-muted-foreground py-6 text-center'>
              <FileText className='mx-auto mb-2 h-12 w-12 opacity-50' />
              <p>Aucun avenant</p>
              <p className='text-sm'>
                Les avenants apparaîtront ici une fois créés
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
