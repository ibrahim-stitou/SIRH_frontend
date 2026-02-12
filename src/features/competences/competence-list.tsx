'use client';

import React, { useState } from 'react';
import { Trash2, Pencil } from 'lucide-react';
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
  CustomTableFilterConfig,
  UseTableReturn
} from '@/components/custom/data-table/types';

import { apiRoutes } from '@/config/apiRoutes';
import apiClient from '@/lib/api';

import AddCompetenceDialog from './add-competence-dialog';
import EditCompetenceDialog from './EditCompetenceDialog';
import { Heading } from '@/components/ui/heading';
import { CreateCompetenceFormValues } from '@/app/admin/gpec/postes/components/competence.schema';

/* =========================
   TYPE
========================= */
export interface CompetenceRow {
  id: number;
  code: string;
  libelle: string;
  categorie?: string;
  description?: string;
  createdAt: string;
}

const CompetenceListing = () => {
  const [tableInstance, setTableInstance] =
    useState<Partial<UseTableReturn<CompetenceRow>> | null>(null);

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedCompetence, setSelectedCompetence] =
    useState<CompetenceRow | null>(null);

  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);

  /* =========================
     ADD COMPETENCE
  ========================= */
  const handleAddCompetence = async (data: CreateCompetenceFormValues) => {
    try {
      await apiClient.post(
        apiRoutes.admin.parametres.competences.create,
        data
      );
      toast.success('Compétence créée avec succès');
      tableInstance?.refresh?.();
      setOpenAddModal(false);
    } catch {
      toast.error('Erreur lors de la création');
    }
  };

  /* =========================
     DELETE
  ========================= */
  const handleDelete = (id: number) => {
    setSelectedId(id);
    setOpenDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedId) return;

    try {
      await apiClient.delete(
        apiRoutes.admin.parametres.competences.delete(selectedId)
      );
      toast.success('Compétence supprimée');
      tableInstance?.refresh?.();
    } catch {
      toast.error('Erreur lors de la suppression');
    } finally {
      setOpenDeleteModal(false);
    }
  };

  /* =========================
     COLUMNS
  ========================= */
  const columns: CustomTableColumn<CompetenceRow>[] = [
    {
      data: 'id',
      label: 'Code',
      sortable: true
    },
    {
      data: 'libelle',
      label: 'Compétence',
      sortable: true
    },
    {
      data: 'categorie',
      label: 'Catégorie',
      sortable: true
    },
    {
      data: 'description',
      label: 'Description',
      sortable: false
    },
    {
      data: 'createdAt',
      label: 'Créée le',
      sortable: true,
      render: (value: string) =>
        new Date(value).toLocaleDateString()
    },
    {
      data: 'actions',
      label: 'Actions',
      sortable: false,
      render: (_v, row) => (
        <div className="flex gap-2">
          {/* EDIT */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  setSelectedCompetence(row);
                  setOpenEditModal(true);
                }}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Modifier</TooltipContent>
          </Tooltip>

          {/* DELETE */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="destructive"
                size="icon"
                onClick={() => handleDelete(row.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Supprimer</TooltipContent>
          </Tooltip>
        </div>
      )
    }
  ];

  /* =========================
     FILTERS
  ========================= */
  const filters: CustomTableFilterConfig[] = [
    { field: 'libelle', label: 'Compétence', type: 'text' }
  
  ];

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title="Gestion des compétences"
          description="Liste et administration des compétences"
        />

        <Button onClick={() => setOpenAddModal(true)}>
          Ajouter une compétence
        </Button>
      </div>

      <div className="flex h-[600px] flex-col">
        <CustomTable<CompetenceRow>
          url={apiRoutes.admin.parametres.competences.list}
          columns={columns}
          filters={filters}
          onInit={(instance) => setTableInstance(instance)}
        />
      </div>

      {/* MODAL AJOUT */}
      <AddCompetenceDialog
        open={openAddModal}
        onClose={() => setOpenAddModal(false)}
        onSubmit={handleAddCompetence}
        onSuccess={() => tableInstance?.refresh?.()}
      />

      {/* MODAL EDIT */}
      <EditCompetenceDialog
        open={openEditModal}
        onClose={() => setOpenEditModal(false)}
        competence={selectedCompetence}
        onSuccess={() => tableInstance?.refresh?.()}
      />

      {/* MODAL DELETE */}
      <CustomAlertDialog
        title="Supprimer la compétence"
        description="Cette action est irréversible."
        confirmText="Supprimer"
        cancelText="Annuler"
        open={openDeleteModal}
        setOpen={setOpenDeleteModal}
        onConfirm={confirmDelete}
      />
    </>
  );
};

export default CompetenceListing;