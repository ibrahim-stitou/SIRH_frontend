'use client';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import CustomTable from '@/components/custom/data-table/custom-table';
import { apiRoutes } from '@/config/apiRoutes';
import apiClient from '@/lib/api';
import { Plus, Trash2 } from 'lucide-react';
import CustomAlertDialog from '@/components/custom/customAlert';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { CustomTableColumn, UseTableReturn } from '@/components/custom/data-table/types';
import PageContainer from '@/components/layout/page-container';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip';

interface LieuTravailRow {
  id: number | string;
  code: string;
  libelle: string;
  adresse: string;
  created_at?: string;
  updated_at?: string;
}

export default function LieuxTravailParametresPage() {
  const [_tableInstance, setTableInstance] = useState<Partial<UseTableReturn<LieuTravailRow>> | null>(null);

  const [confirmDeleteId, setConfirmDeleteId] = useState<number | string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newLibelle, setNewLibelle] = useState('');
  const [newAdresse, setNewAdresse] = useState('');

  const onAskDelete = (row: LieuTravailRow) => setConfirmDeleteId(row.id);
  const onConfirmDelete = async () => {
    if (!confirmDeleteId) return;
    try {
      await apiClient.delete(apiRoutes.admin.parametres.lieuxTravail.delete(confirmDeleteId));
      setConfirmDeleteId(null);
      _tableInstance?.refresh?.();
      toast.success('Lieu de travail supprimé avec succès');
    } catch (e) {
      // noop
    }
  };

  const handleAdd = async () => {
    if (!newCode.trim() || !newLibelle.trim() || !newAdresse.trim()) return;
    setAddLoading(true);
    try {
      await apiClient.post(apiRoutes.admin.parametres.lieuxTravail.create, {
        code: newCode.trim(),
        libelle: newLibelle.trim(),
        adresse: newAdresse.trim()
      });
      setShowAddModal(false);
      setNewCode('');
      setNewLibelle('');
      setNewAdresse('');
      _tableInstance?.refresh?.();
      toast.success('Lieu de travail ajouté avec succès');
    } catch (e) {
      // noop
    } finally {
      setAddLoading(false);
    }
  };

  const columns: CustomTableColumn<LieuTravailRow>[] = useMemo(() => [
    { data: 'id', label: 'ID', sortable: true, width: 100 },
    { data: 'code', label: 'Code', sortable: true },
    { data: 'libelle', label: 'Libellé', sortable: true },
    { data: 'adresse', label: 'Adresse', sortable: false },
    {
      data: 'actions',
      label: 'Actions',
      sortable: false,
      render: (_v, row) => (
        <div className='flex items-center gap-2'>
          <Tooltip>
            <TooltipTrigger asChild>
          <Button
            variant='ghost'
                className='flex h-8 w-8 items-center justify-center bg-red-100 p-0 text-red-600 hover:bg-red-200 hover:text-red-700'
            onClick={() => onAskDelete(row)}
            aria-label='Supprimer'
            title='Supprimer'
          >
            <Trash2 className='h-4 w-4' />
          </Button>
            </TooltipTrigger>
            <TooltipContent side='top' className={'bg-red-50 text-red-600'}>
              Supprimer
            </TooltipContent>
          </Tooltip>
        </div>
      )
    }
  ], []);

  return (
    <PageContainer scrollable={false}>
      <div className='flex flex-col gap-4 w-full'>
        <div className='mb-2 flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-semibold tracking-tight'>Paramètres — Lieux de travail</h1>
            <p className='text-muted-foreground text-sm'>Gérez les codes, libellés et adresses des lieux de travail</p>
          </div>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className='mr-2 h-4 w-4' /> Nouveau lieu de travail
          </Button>
        </div>

        <CustomTable<LieuTravailRow>
          url={apiRoutes.admin.parametres.lieuxTravail.list}
          columns={columns}
          onInit={(inst) => setTableInstance(inst)}
        />

        <CustomAlertDialog
          title={'Supprimer ce lieu de travail ?'}
          description={'Cette action est irréversible.'}
          cancelText={'Annuler'}
          confirmText={'Supprimer'}
          onConfirm={onConfirmDelete}
          open={!!confirmDeleteId}
          setOpen={(o) => (!o ? setConfirmDeleteId(null) : void 0)}
        />

        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter un lieu de travail</DialogTitle>
            </DialogHeader>
            <div className='grid gap-4'>
              <div className='grid gap-2'>
                <Label htmlFor='code'>Code</Label>
                <Input id='code' value={newCode} onChange={(e) => setNewCode(e.target.value)} placeholder='Ex: LT-HEAD' />
              </div>
              <div className='grid gap-2'>
                <Label htmlFor='libelle'>Libellé</Label>
                <Input id='libelle' value={newLibelle} onChange={(e) => setNewLibelle(e.target.value)} placeholder='Ex: Siège Central' />
              </div>
              <div className='grid gap-2'>
                <Label htmlFor='adresse'>Adresse</Label>
                <Input id='adresse' value={newAdresse} onChange={(e) => setNewAdresse(e.target.value)} placeholder='Ex: 123 Avenue Principale, Casablanca' />
              </div>
            </div>
            <DialogFooter>
              <Button variant='outline' onClick={() => setShowAddModal(false)} disabled={addLoading}>Annuler</Button>
              <Button onClick={handleAdd} disabled={addLoading || !newCode.trim() || !newLibelle.trim() || !newAdresse.trim()}>
                {addLoading ? 'Ajout...' : 'Ajouter'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageContainer>
  );
}

