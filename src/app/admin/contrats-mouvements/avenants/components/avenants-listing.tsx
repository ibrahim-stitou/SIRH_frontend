'use client';

import React, { useState } from 'react';
import {
  Eye,
  Download,
  CheckCircle2,
  Trash2,
  FileEdit,
  FileText,
  FileSignature,
  Clock
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip';
import CustomAlertDialog from '@/components/custom/customAlert';
import CustomTable from '@/components/custom/data-table/custom-table';
import {
  CustomTableColumn,
  UseTableReturn
} from '@/components/custom/data-table/types';
import { apiRoutes } from '@/config/apiRoutes';
import apiClient from '@/lib/api';

// Interface pour les lignes de la table
interface AvenantRow {
  id: string;
  contract_id: string;
  numero: number;
  date: string;
  objet: string;
  motif?: string;
  description?: string;
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
  // Informations du contrat (pour affichage)
  contract_reference?: string;
  employee_name?: string;
}

export function AvenantsListing() {
  const router = useRouter();
  const [tableInstance, setTableInstance] = useState<Partial<
    UseTableReturn<AvenantRow>
  > | null>(null);
  const [selectedAvenant, setSelectedAvenant] = useState<AvenantRow | null>(
    null
  );
  const [openDeleteModal, setOpenDeleteModal] = useState(false);

  const handleDelete = (row: AvenantRow) => {
    if (row.status !== 'Brouillon') {
      toast.error('Seuls les avenants en brouillon peuvent être supprimés');
      return;
    }
    setSelectedAvenant(row);
    setOpenDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedAvenant) return;
    try {
      const response = await apiClient.delete(
        apiRoutes.admin.contratsEtMovements.avenants.delete(selectedAvenant.id)
      );
      if (response.status === 200) {
        toast.success('Avenant supprimé avec succès');
        if (tableInstance?.refresh) tableInstance.refresh();
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Erreur lors de la suppression';
      toast.error(`Erreur: ${errorMessage}`);
    }
    setOpenDeleteModal(false);
    setSelectedAvenant(null);
  };

  const handleValidate = async (row: AvenantRow) => {
    if (row.status !== 'Brouillon') {
      toast.error('Seuls les avenants en brouillon peuvent être validés');
      return;
    }
    try {
      const response = await apiClient.put(
        apiRoutes.admin.contratsEtMovements.avenants.update(row.id),
        { ...row, status: 'Valide' }
      );
      if (response.status === 200) {
        toast.success('Avenant validé avec succès');
        if (tableInstance?.refresh) tableInstance.refresh();
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Erreur lors de la validation';
      toast.error(`Erreur: ${errorMessage}`);
    }
  };

  const handleGeneratePDF = async (row: AvenantRow) => {
    try {
      const response = await apiClient.post(
        `/avenants/${row.id}/generate-pdf`,
        {},
        { responseType: 'blob' }
      );

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Avenant_${row.numero}_${row.contract_reference || row.contract_id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('PDF généré avec succès');
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Erreur lors de la génération du PDF';
      toast.error(`Erreur: ${errorMessage}`);
    }
  };

  const handleViewDetails = (row: AvenantRow) => {
    router.push(
      `/admin/contrats-mouvements/contrats/${row.contract_id}/avenants/${row.id}`
    );
  };

  const handleViewContract = (row: AvenantRow) => {
    router.push(
      `/admin/contrats-mouvements/contrats/${row.contract_id}/details`
    );
  };

  const columns: CustomTableColumn<AvenantRow>[] = [
    {
      data: 'id',
      label: 'Référence',
      sortable: true,
      render: (v, row) => (
        <div className='font-mono text-xs'>
          <div className='font-medium'>Avenant N°{row.numero}</div>
          <div className='text-muted-foreground'>{v}</div>
        </div>
      )
    },
    {
      data: 'contract_reference',
      label: 'Contrat',
      sortable: true,
      render: (_value, row) => (
        <div>
          <div className='font-medium'>
            {row.contract_reference || row.contract_id}
          </div>
          {row.employee_name && (
            <div className='text-muted-foreground text-xs'>
              {row.employee_name}
            </div>
          )}
        </div>
      )
    },
    {
      data: 'objet',
      label: 'Objet',
      sortable: true,
      render: (v) => (
        <div className='max-w-[300px] truncate' title={v}>
          {v}
        </div>
      )
    },
    {
      data: 'type_modification',
      label: 'Type',
      sortable: true,
      render: (v) => {
        const typeLabels: Record<string, { label: string; color: string }> = {
          salary: { label: 'Salaire', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' },
          schedule: { label: 'Horaire', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' },
          job: { label: 'Poste', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' },
          complete: { label: 'Complet', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300' }
        };

        const type = typeLabels[v || 'salary'] || { label: v || 'N/A', color: 'bg-gray-100 text-gray-800' };

        return (
          <span className={`rounded-md px-2 py-1 text-xs font-medium ${type.color}`}>
            {type.label}
          </span>
        );
      }
    },
    {
      data: 'date',
      label: 'Date d\'effet',
      sortable: true,
      render: (v) => (
        <div className='text-sm'>
          {new Date(v).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          })}
        </div>
      )
    },
    {
      data: 'status',
      label: 'Statut',
      sortable: true,
      render: (v) => {
        if (v === 'Valide') {
          return (
            <Badge className='gap-1 bg-green-500 hover:bg-green-600'>
              <CheckCircle2 className='h-3 w-3' />
              Validé
            </Badge>
          );
        }
        if (v === 'Brouillon') {
          return (
            <Badge variant='secondary' className='gap-1'>
              <Clock className='h-3 w-3' />
              Brouillon
            </Badge>
          );
        }
        return <Badge variant='outline'>{v}</Badge>;
      }
    },
    {
      data: 'document_url',
      label: 'Documents',
      sortable: false,
      render: (_value, row) => (
        <div className='flex items-center gap-1'>
          {row.document_url && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className='flex h-6 w-6 items-center justify-center rounded bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300'>
                  <FileText className='h-3.5 w-3.5' />
                </div>
              </TooltipTrigger>
              <TooltipContent>PDF généré</TooltipContent>
            </Tooltip>
          )}
          {row.signed_document && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className='flex h-6 w-6 items-center justify-center rounded bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300'>
                  <FileSignature className='h-3.5 w-3.5' />
                </div>
              </TooltipTrigger>
              <TooltipContent>Document signé</TooltipContent>
            </Tooltip>
          )}
          {!row.document_url && !row.signed_document && (
            <span className='text-muted-foreground text-xs'>Aucun</span>
          )}
        </div>
      )
    },
    {
      data: 'created_at',
      label: 'Créé le',
      sortable: true,
      render: (v) => (
        <div className='text-xs text-muted-foreground'>
          {new Date(v).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          })}
        </div>
      )
    },
    {
      data: 'actions',
      label: 'Actions',
      sortable: false,
      render: (_value, row) => (
        <div className='flex items-center gap-1'>
          {/* Voir détails */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='ghost'
                size='icon'
                className='h-8 w-8'
                onClick={() => handleViewDetails(row)}
              >
                <Eye className='h-4 w-4' />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Voir détails</TooltipContent>
          </Tooltip>

          {/* Voir contrat */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='ghost'
                size='icon'
                className='h-8 w-8'
                onClick={() => handleViewContract(row)}
              >
                <FileText className='h-4 w-4' />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Voir contrat</TooltipContent>
          </Tooltip>

          {/* Générer PDF (si validé) */}
          {row.status === 'Valide' && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant='ghost'
                  size='icon'
                  className='h-8 w-8'
                  onClick={() => handleGeneratePDF(row)}
                >
                  <Download className='h-4 w-4' />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Générer PDF</TooltipContent>
            </Tooltip>
          )}

          {/* Valider (si brouillon) */}
          {row.status === 'Brouillon' && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant='ghost'
                  size='icon'
                  className='h-8 w-8 text-green-600 hover:bg-green-50 hover:text-green-700'
                  onClick={() => handleValidate(row)}
                >
                  <CheckCircle2 className='h-4 w-4' />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Valider l&apos;avenant</TooltipContent>
            </Tooltip>
          )}

          {/* Modifier (si brouillon) */}
          {row.status === 'Brouillon' && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant='ghost'
                  size='icon'
                  className='h-8 w-8'
                  onClick={() =>
                    router.push(
                      `/admin/contrats-mouvements/contrats/${row.contract_id}/avenants/${row.id}/edit`
                    )
                  }
                >
                  <FileEdit className='h-4 w-4' />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Modifier</TooltipContent>
            </Tooltip>
          )}

          {/* Supprimer (si brouillon) */}
          {row.status === 'Brouillon' && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant='ghost'
                  size='icon'
                  className='h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700'
                  onClick={() => handleDelete(row)}
                >
                  <Trash2 className='h-4 w-4' />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Supprimer</TooltipContent>
            </Tooltip>
          )}
        </div>
      )
    }
  ];

  const filterConfig = [
    { field: 'status', label: 'Statut', type: 'text' as const },
    { field: 'type_modification', label: 'Type', type: 'text' as const },
    { field: 'contract_reference', label: 'Contrat', type: 'text' as const },
    { field: 'objet', label: 'Objet', type: 'text' as const }
  ];

  return (
    <>

        <div className='flex flex-1 flex-col space-y-4'>
      <CustomTable<AvenantRow>
        url={apiRoutes.admin.contratsEtMovements.avenants.list}
        columns={columns}
        filters={filterConfig}
        onInit={(instance: any) => setTableInstance(instance)}
      />

      {/* Delete Confirmation Dialog */}
      <CustomAlertDialog
        title='Confirmer la suppression'
        description={
          selectedAvenant
            ? `Êtes-vous sûr de vouloir supprimer l'avenant N°${selectedAvenant.numero} ? Cette action est irréversible.`
            : ''
        }
        confirmText='Supprimer'
        cancelText='Annuler'
        onConfirm={handleConfirmDelete}
        open={openDeleteModal}
        setOpen={setOpenDeleteModal}
      />

      </div>
    </>
  );
}

