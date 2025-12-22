'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import CustomTable from '@/components/custom/data-table/custom-table';
import {
  CustomTableColumn,
  CustomTableFilterConfig,
  UseTableReturn
} from '@/components/custom/data-table/types';
import { apiRoutes } from '@/config/apiRoutes';
import apiClient from '@/lib/api';
import { format } from 'date-fns';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import {
  Eye,
  CheckCircle,
  UserCheck,
  Lock,
  Plus,
  Download
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { StatusBadge } from '@/components/custom/status-badge';
import { useRouter } from 'next/navigation';
import {
  GenerateTableauPresenceInput,
  generateTableauPresenceSchema
} from '@/validations/tableau-presence.schema';

/* ======================================================
   TYPES MÉTIER – TABLEAU DE PRÉSENCE
   ====================================================== */

export type TableauPresenceStatut =
  | 'BROUILLON'
  | 'EN_COURS'
  | 'VALIDE_MANAGER'
  | 'VALIDE_RH'
  | 'CLOTURE';

export interface TableauPresence {
  id: number;
  mois: number;
  annee: number;
  statut: TableauPresenceStatut;
  generatedAt: string;
  generatedBy: string;
  validatedAt?: string;
  validatedBy?: string;
  locked: boolean;
}

export interface TableauPresenceEmployeeRow {
  id: number;
  tableauPresenceId: number;
  employeeId: number;
  employee?: {
    id: number | string;
    first_name?: string;
    last_name?: string;
    matricule?: string;
  } | null;
  totalHours: number;
  overtimeHours: number;
  absenceDays: number;
  statusSummary: string;
}

/* ======================================================
   COMPONENT
   ====================================================== */

export default function TableauPresenceListing() {
  const router = useRouter();

  const [tableInstance, setTableInstance] = useState<
    Partial<UseTableReturn<TableauPresence>> | null
  >(null);

  const [mois, setMois] = useState<number | undefined>(undefined);
  const [annee, setAnnee] = useState<number | undefined>(undefined);
  const [generationMode, setGenerationMode] = useState<'automatique' | 'import'>('automatique');
  const [importFiles, setImportFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Partial<Record<keyof GenerateTableauPresenceInput, string>>>({});

  const [confirmCloseId, setConfirmCloseId] = useState<number | null>(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generateLoading, setGenerateLoading] = useState(false);

  useEffect(() => {
    const now = new Date();
    setMois(now.getMonth() + 1);
    setAnnee(now.getFullYear());
  }, []);

  const onGenerate = async () => {
    // Validation avec Zod
    const result = generateTableauPresenceSchema.safeParse({
      mois,
      annee,
      mode: generationMode
    });

    if (!result.success) {
      const fieldErrors: Partial<Record<keyof GenerateTableauPresenceInput, string>> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as keyof GenerateTableauPresenceInput] = err.message;
        }
      });
      setErrors(fieldErrors);
      toast.error('Veuillez corriger les erreurs');
      return;
    }

    // Validation supplémentaire pour le mode import
    if (generationMode === 'import' && importFiles.length === 0) {
      toast.error('Veuillez sélectionner un fichier Excel');
      return;
    }

    setGenerateLoading(true);
    setErrors({});

    try {
      if (generationMode === 'automatique') {
        await apiClient.post(apiRoutes.admin.tableauPresence.generate, {
          mois,
          annee
        });
        toast.success('Tableau généré automatiquement');
      } else {
        // Mode import
        const formData = new FormData();
        formData.append('file', importFiles[0]);
        formData.append('mois', String(mois));
        formData.append('annee', String(annee));

        await apiClient.post(apiRoutes.admin.tableauPresence.import, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Tableau importé avec succès');
      }

      tableInstance?.refresh?.();
      setShowGenerateModal(false);
      setImportFiles([]);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Erreur de génération');
    } finally {
      setGenerateLoading(false);
    }
  };

  const onExportExcel = async (row: TableauPresence) => {
    try {
      const response = await apiClient.get(
        apiRoutes.admin.tableauPresence.exportExcel(row.id),
        { responseType: 'blob' }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `tableau_presence_${String(row.mois).padStart(2, '0')}_${row.annee}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Export Excel réussi');
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Erreur lors de l'export");
    }
  };

  const onDownloadModel = () => {
    const url = apiRoutes.admin.tableauPresence.exportModel;
    if (typeof window !== 'undefined') window.open(url, '_blank');
  };

  const onValidateManager = async (row: TableauPresence) => {
    try {
      await apiClient.patch(
        apiRoutes.admin.tableauPresence.validateManager(row.id)
      );
      toast.success('Validé manager');
      tableInstance?.refresh?.();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Erreur');
    }
  };

  const onValidateRh = async (row: TableauPresence) => {
    try {
      await apiClient.patch(apiRoutes.admin.tableauPresence.validateRh(row.id));
      toast.success('Validé RH');
      tableInstance?.refresh?.();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Erreur');
    }
  };

  const onAskClose = (row: TableauPresence) => setConfirmCloseId(row.id);
  const onConfirmClose = async () => {
    if (!confirmCloseId) return;
    try {
      await apiClient.patch(
        apiRoutes.admin.tableauPresence.close(confirmCloseId)
      );
      toast.success('Tableau clôturé');
      setConfirmCloseId(null);
      tableInstance?.refresh?.();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Erreur');
    }
  };

  const columns = useMemo<CustomTableColumn<TableauPresence>[]>(() => [
    { data: 'id', label: 'ID', sortable: true, width: 80 },
    {
      data: 'mois',
      label: 'Mois',
      sortable: true,
      render: (_val, row) => String(row.mois).padStart(2, '0')
    },
    { data: 'annee', label: 'Année', sortable: true },
    {
      data: 'statut',
      label: 'Statut',
      sortable: true,
      render: (_val, row) => {
        const statusMap: Record<
          TableauPresenceStatut,
          { text: string; tone: 'neutral' | 'info' | 'warning' | 'success' | 'danger' }
        > = {
          BROUILLON: { text: 'Brouillon', tone: 'neutral' },
          EN_COURS: { text: 'En cours', tone: 'info' },
          VALIDE_MANAGER: { text: 'Validé Manager', tone: 'warning' },
          VALIDE_RH: { text: 'Validé RH', tone: 'success' },
          CLOTURE: { text: 'Clôturé', tone: 'danger' }
        };
        const s = statusMap[row.statut] || statusMap.BROUILLON;
        return <StatusBadge label={s.text} tone={s.tone} />;
      }
    },
    {
      data: 'generatedAt',
      label: 'Généré le',
      sortable: true,
      render: (_val, row) =>
        row.generatedAt ? format(new Date(row.generatedAt), 'dd/MM/yyyy HH:mm') : '—'
    },
    {
      data: 'validatedAt',
      label: 'Validé le',
      sortable: true,
      render: (_val, row) =>
        row.validatedAt ? format(new Date(row.validatedAt), 'dd/MM/yyyy HH:mm') : '—'
    },
    {
      data: 'actions',
      label: 'Actions',
      sortable: false,
      render: (_v, row) => (
        <div className='flex items-center space-x-2'>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='outline'
                className='h-8 w-8 p-1.5'
                onClick={() => router.push(`/admin/tableau-presence/${row.id}`)}
                title='Voir détails'
              >
                <Eye className='h-4 w-4' />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Voir détails</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='outline'
                className='h-8 w-8 p-1.5'
                onClick={() => onExportExcel(row)}
                title='Exporter Excel'
              >
                <Download className='h-4 w-4 text-green-600' />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Exporter Excel</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='outline'
                className='h-8 w-8 p-1.5'
                onClick={() => onValidateManager(row)}
                title='Valider manager'
                disabled={row.locked || row.statut !== 'EN_COURS'}
              >
                <CheckCircle className='h-4 w-4 text-blue-600' />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Valider manager</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='outline'
                className='h-8 w-8 p-1.5'
                onClick={() => onValidateRh(row)}
                title='Valider RH'
                disabled={
                  row.locked ||
                  (row.statut !== 'VALIDE_MANAGER' && row.statut !== 'EN_COURS')
                }
              >
                <UserCheck className='h-4 w-4 text-green-600' />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Valider RH</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='destructive'
                className='h-8 w-8 p-1.5'
                onClick={() => onAskClose(row)}
                title='Clôturer'
                disabled={row.locked || row.statut === 'CLOTURE'}
              >
                <Lock className='h-4 w-4' />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Clôturer</TooltipContent>
          </Tooltip>
        </div>
      )
    }
  ], [router]);

  const filters = useMemo<CustomTableFilterConfig[]>(() => [
    {
      field: 'mois',
      label: 'Mois',
      type: 'select',
      options: Array.from({ length: 12 }, (_, i) => ({
        label: String(i + 1).padStart(2, '0'),
        value: i + 1
      })),
      onChange: (val: number) => setMois(Number(val))
    },
    {
      field: 'annee',
      label: 'Année',
      type: 'select',
      options: Array.from({ length: 6 }, (_, i) => {
        const y = new Date().getFullYear() - 2 + i;
        return { label: String(y), value: y };
      }),
      onChange: (val: number) => setAnnee(Number(val))
    }
  ], []);

  return (
    <>
      <div className="mb-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className='text-2xl font-semibold tracking-tight'>Tableau de présence</h1>
          <p className='text-muted-foreground text-sm'>
            Gérer les tableaux de présence des employés.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setShowGenerateModal(true)}>
            <Plus className='mr-2 h-4 w-4' /> Générer
          </Button>
        </div>
      </div>

      <div className='flex flex-1 flex-col space-y-4'>
        <CustomTable<TableauPresence>
          url={apiRoutes.admin.tableauPresence.list}
          columns={columns}
          filters={filters}
          onInit={(t) => setTableInstance(t)}
        />


        <Dialog open={showGenerateModal} onOpenChange={setShowGenerateModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Générer un tableau</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Mois</label>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  value={mois ?? ''}
                  onChange={(e) => setMois(Number(e.target.value))}
                >
                  <option value="">—</option>
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {String(i + 1).padStart(2, '0')}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Année</label>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  value={annee ?? ''}
                  onChange={(e) => setAnnee(Number(e.target.value))}
                >
                  <option value="">—</option>
                  {Array.from({ length: 6 }, (_, i) => {
                    const y = new Date().getFullYear() - 2 + i;
                    return <option key={y} value={y}>{y}</option>;
                  })}
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowGenerateModal(false)}>
                Annuler
              </Button>
              <Button onClick={onGenerate} disabled={generateLoading}>
                {generateLoading ? 'Génération...' : 'Générer'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={!!confirmCloseId} onOpenChange={(o) => !o && setConfirmCloseId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Clôturer le tableau ?</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              Cette action rendra le tableau non modifiable.
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmCloseId(null)}>
                Annuler
              </Button>
              <Button onClick={onConfirmClose}>Confirmer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
