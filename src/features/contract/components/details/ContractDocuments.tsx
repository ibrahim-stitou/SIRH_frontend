'use client';

import React from 'react';
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
  Clock
} from 'lucide-react';
import { Contract } from '@/types/contract';
import { formatDateLong } from '@/lib/date-utils';

interface ContractDocumentsProps {
  contract: Contract;
  onAddAvenant?: () => void;
  onViewDocument?: (url: string) => void;
  onDownloadDocument?: (url: string) => void;
}

export default function ContractDocuments({
  contract,
  onAddAvenant,
  onViewDocument,
  onDownloadDocument
}: ContractDocumentsProps) {
  return (
    <div className='space-y-6'>
      {/* Contrat Principal */}
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <CardTitle className='flex items-center gap-2 text-lg'>
              <FileText className='h-5 w-5' />
              Contrat Principal
            </CardTitle>
            {contract.documents?.contrat_signe && (
              <Badge variant='default' className='gap-1'>
                <CheckCircle2 className='h-3 w-3' />
                Signé
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {contract.documents?.contrat_signe ? (
            <div className='bg-muted/30 flex items-center justify-between rounded-lg border p-4'>
              <div className='flex items-center gap-3'>
                <div className='bg-primary/10 rounded-lg p-2'>
                  <File className='text-primary h-5 w-5' />
                </div>
                <div>
                  <p className='font-medium'>
                    Contrat_{contract.reference}.pdf
                  </p>
                  <p className='text-muted-foreground text-sm'>
                    Signé le {formatDateLong(contract.dates.signature_date)}
                  </p>
                </div>
              </div>
              <div className='flex items-center gap-2'>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() =>
                    onViewDocument?.(contract.documents!.contrat_signe!)
                  }
                >
                  <Eye className='h-4 w-4' />
                </Button>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() =>
                    onDownloadDocument?.(contract.documents!.contrat_signe!)
                  }
                >
                  <Download className='h-4 w-4' />
                </Button>
              </div>
            </div>
          ) : (
            <div className='text-muted-foreground py-6 text-center'>
              <FileText className='mx-auto mb-2 h-12 w-12 opacity-50' />
              <p>Aucun contrat signé</p>
              <p className='text-sm'>
                Le contrat sera disponible après signature
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
              {contract.documents?.avenants &&
                contract.documents.avenants.length > 0 && (
                  <Badge variant='secondary'>
                    {contract.documents.avenants.length}
                  </Badge>
                )}
            </CardTitle>
            {contract.status !== 'Brouillon' && onAddAvenant && (
              <Button onClick={onAddAvenant} size='sm' variant='outline'>
                <Plus className='mr-2 h-4 w-4' />
                Ajouter un avenant
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {contract.documents?.avenants &&
          contract.documents.avenants.length > 0 ? (
            <div className='space-y-3'>
              {contract.documents.avenants.map((avenant) => (
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
                        {avenant.signe ? (
                          <Badge variant='default' className='h-5 gap-1'>
                            <CheckCircle2 className='h-3 w-3' />
                            Signé
                          </Badge>
                        ) : (
                          <Badge variant='secondary' className='h-5 gap-1'>
                            <Clock className='h-3 w-3' />
                            En attente
                          </Badge>
                        )}
                      </div>
                      <p className='text-muted-foreground text-sm'>
                        {avenant.objet}
                      </p>
                      <p className='text-muted-foreground text-xs'>
                        {formatDateLong(avenant.date)}
                      </p>
                    </div>
                  </div>
                  {avenant.document_url && (
                    <div className='flex items-center gap-2'>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => onViewDocument?.(avenant.document_url!)}
                      >
                        <Eye className='h-4 w-4' />
                      </Button>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() =>
                          onDownloadDocument?.(avenant.document_url!)
                        }
                      >
                        <Download className='h-4 w-4' />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className='text-muted-foreground py-6 text-center'>
              <FileText className='mx-auto mb-2 h-12 w-12 opacity-50' />
              <p>Aucun avenant</p>
              <p className='text-sm'>Les avenants apparaîtront ici</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Annexes */}
      {contract.documents?.annexes && contract.documents.annexes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-lg'>
              <FileText className='h-5 w-5' />
              Annexes
              <Badge variant='secondary'>
                {contract.documents.annexes.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {contract.documents.annexes.map((annexe) => (
                <div
                  key={annexe.id}
                  className='hover:bg-muted/30 flex items-center justify-between rounded-lg border p-4 transition-colors'
                >
                  <div className='flex items-center gap-3'>
                    <div className='rounded-lg bg-purple-500/10 p-2'>
                      <File className='h-5 w-5 text-purple-600' />
                    </div>
                    <div>
                      <p className='font-medium'>{annexe.titre}</p>
                      <p className='text-muted-foreground text-sm'>
                        {annexe.type}
                      </p>
                      <p className='text-muted-foreground text-xs'>
                        Ajouté le {formatDateLong(annexe.date_ajout)}
                      </p>
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => onViewDocument?.(annexe.document_url)}
                    >
                      <Eye className='h-4 w-4' />
                    </Button>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => onDownloadDocument?.(annexe.document_url)}
                    >
                      <Download className='h-4 w-4' />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Attestations */}
      {contract.documents?.attestations &&
        contract.documents.attestations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 text-lg'>
                <FileText className='h-5 w-5' />
                Attestations
                <Badge variant='secondary'>
                  {contract.documents.attestations.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                {contract.documents.attestations.map((attestation, index) => (
                  <div
                    key={index}
                    className='hover:bg-muted/30 flex items-center justify-between rounded-lg border p-4 transition-colors'
                  >
                    <div className='flex items-center gap-3'>
                      <div className='rounded-lg bg-green-500/10 p-2'>
                        <File className='h-5 w-5 text-green-600' />
                      </div>
                      <div>
                        <p className='font-medium'>
                          Attestation de {attestation.type}
                        </p>
                        <p className='text-muted-foreground text-xs'>
                          Émise le {formatDateLong(attestation.date_emission)}
                        </p>
                      </div>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() =>
                          onViewDocument?.(attestation.document_url)
                        }
                      >
                        <Eye className='h-4 w-4' />
                      </Button>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() =>
                          onDownloadDocument?.(attestation.document_url)
                        }
                      >
                        <Download className='h-4 w-4' />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
    </div>
  );
}
