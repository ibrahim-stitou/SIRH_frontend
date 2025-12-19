'use client';

import React, { useState, useEffect } from 'react';
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip';
import CustomAlertDialog from '@/components/custom/customAlert';
import CustomTable from '@/components/custom/data-table/custom-table';
import {
  CustomTableColumn,
  UseTableReturn,
  CustomTableFilterConfig
} from '@/components/custom/data-table/types';
import { apiRoutes } from '@/config/apiRoutes';
import apiClient from '@/lib/api';
import { StatusBadge } from '@/components/custom/status-badge';

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
  contract_reference?: string;
  employee_name?: string;
  validations?: {
    manager: boolean;
    rh: boolean;
  };
  notes?: string;
}

export function AvenantsListing() {
  const router = useRouter();
  const [statusOptions, setStatusOptions] = useState<
    Array<{ label: string; value: string }>
  >([
    { label: 'Valide', value: 'Valide' },
    { label: 'Brouillon', value: 'Brouillon' }
  ]);
  const [typeOptions, setTypeOptions] = useState<
    Array<{ label: string; value: string }>
  >([
    { label: 'Salaire', value: 'salary' },
    { label: 'Horaire', value: 'schedule' },
    { label: 'Poste', value: 'job' },
    { label: 'Complet', value: 'complete' }
  ]);
  const [contractOptions, setContractOptions] = useState<
    Array<{ label: string; value: string }>
  >([]);
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
        const typeLabels: Record<string, { label: string; tone: 'success' | 'info' | 'purple' | 'orange' | 'neutral' }> = {
          salary: { label: 'Salaire', tone: 'success' },
          schedule: { label: 'Horaire', tone: 'info' },
          job: { label: 'Poste', tone: 'purple' },
          complete: { label: 'Complet', tone: 'orange' }
        };

        const type = typeLabels[v || ''] || { label: v || 'N/A', tone: 'neutral' } as const;

        return (
          <StatusBadge label={type.label} tone={type.tone} />
        );
      }
    },
    {
      data: 'date',
      label: "Date d'effet",
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
            <StatusBadge label='Validé' tone='success' icon={<CheckCircle2 className='h-3 w-3' />} />
          );
        }
        if (v === 'Brouillon') {
          return (
            <StatusBadge label='Brouillon' tone='neutral' icon={<Clock className='h-3 w-3' />} />
          );
        }
        return <StatusBadge label={v} tone='neutral' />;
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
        <div className='text-muted-foreground text-xs'>
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
        <div className='flex items-center space-x-2'>
          {/* Voir détails */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='outline'
                className='h-8 w-8 p-1.5'
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
                variant='outline'
                className='h-8 w-8 p-1.5'
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
                  variant='outline'
                  className='h-8 w-8 p-1.5'
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
                  variant='outline'
                  className='h-8 w-8 p-1.5 text-green-600 hover:bg-green-50 hover:text-green-700'
                  onClick={() => handleValidate(row)}
                >
                  <CheckCircle2 className='h-4 w-4' />
                </Button>
              </TooltipTrigger>
              <TooltipContent
                className='tooltip-content rounded-md bg-green-100 px-2 py-1 text-green-600 shadow-md'
                sideOffset={5}
              >Valider l&apos;avenant</TooltipContent>
            </Tooltip>
          )}

          {/* Modifier (si brouillon) */}
          {row.status === 'Brouillon' && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant='outline'
                  className='h-8 w-8 p-1.5'
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
                  variant='destructive'
                  className='h-8 w-8 bg-red-100 p-1.5 text-red-600 hover:bg-red-200'
                  onClick={() => handleDelete(row)}
                >
                  <Trash2 className='h-4 w-4' />
                </Button>
              </TooltipTrigger>
              <TooltipContent
                className='tooltip-content rounded-md bg-red-100 px-2 py-1 text-red-600 shadow-md'
                sideOffset={5}
              >Supprimer</TooltipContent>
            </Tooltip>
          )}
        </div>
      )
    }
  ];

  // Build dynamic options from current avenants dataset
  useEffect(() => {
    (async () => {
      try {
        const resp = await apiClient.get(
          apiRoutes.admin.contratsEtMovements.avenants.list
        );
        const data = Array.isArray(resp?.data?.data)
          ? resp.data.data
          : (resp.data?.data ?? resp.data ?? []);
        const contracts = new Map<string, string>();
        const types = new Set<string>();
        const statuses = new Set<string>();
        (data || []).forEach((row: any) => {
          const ref = row.contract_reference || row.contract_id;
          if (ref) contracts.set(String(ref), String(ref));
          if (row.type_modification) types.add(String(row.type_modification));
          if (row.status) statuses.add(String(row.status));
        });
        if (contracts.size > 0) {
          setContractOptions(
            Array.from(contracts.keys()).map((k) => ({ label: k, value: k }))
          );
        }
        if (types.size > 0) {
          // merge with defaults, preserve labels if known
          const knownMap: Record<string, string> = {
            salary: 'Salaire',
            schedule: 'Horaire',
            job: 'Poste',
            complete: 'Complet'
          };
          setTypeOptions(
            Array.from(types.values()).map((v) => ({
              label: knownMap[v] || v,
              value: v
            }))
          );
        }
        if (statuses.size > 0) {
          setStatusOptions(
            Array.from(statuses.values()).map((s) => ({ label: s, value: s }))
          );
        }
      } catch {
        // keep defaults
      }
    })();
  }, []);

  const filterConfig: CustomTableFilterConfig[] = [
    {
      field: 'status',
      label: 'Statut',
      type: 'datatable-select',
      options: statusOptions
    },
    {
      field: 'type_modification',
      label: 'Type',
      type: 'datatable-select',
      options: typeOptions
    },
    {
      field: 'contract_reference',
      label: 'Contrat',
      type: 'datatable-select',
      options: contractOptions
    },
    { field: 'objet', label: 'Objet', type: 'text' }
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
