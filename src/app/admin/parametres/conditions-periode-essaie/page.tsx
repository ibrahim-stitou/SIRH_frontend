'use client';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import CustomTable from '@/components/custom/data-table/custom-table';
import { apiRoutes } from '@/config/apiRoutes';
import apiClient from '@/lib/api';
import { Plus, Trash2, Pencil, Edit } from 'lucide-react';
import CustomAlertDialog from '@/components/custom/customAlert';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { CustomTableColumn, UseTableReturn } from '@/components/custom/data-table/types';
import PageContainer from '@/components/layout/page-container';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface ConditionPeriodeEssaieRow {
  id: number | string;
  name: string;
  description: string;
  created_at?: string;
  updated_at?: string;
}

export default function ConditionsPeriodeEssaieParametresPage() {
  const [_tableInstance, setTableInstance] = useState<Partial<UseTableReturn<ConditionPeriodeEssaieRow>> | null>(null);

  const [confirmDeleteId, setConfirmDeleteId] = useState<number | string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState<number | string | null>(null);
  const [form, setForm] = useState<Partial<ConditionPeriodeEssaieRow>>({});

  const onAskDelete = (row: ConditionPeriodeEssaieRow) => setConfirmDeleteId(row.id);
  const onConfirmDelete = async () => {
    if (!confirmDeleteId) return;
    try {
      await apiClient.delete(apiRoutes.admin.parametres.conditionsPeriodeEssaie.delete(confirmDeleteId));
      setConfirmDeleteId(null);
      _tableInstance?.refresh?.();
      toast.success('Condition supprimée avec succès');
    } catch (e) {}
  };

  const onAskEdit = (row: ConditionPeriodeEssaieRow) => {
    setEditId(row.id);
    setForm({ name: row.name, description: row.description });
    setShowModal(true);
  };

  const handleSave = async () => {
    const payload = {
      name: String(form.name || '').trim(),
      description: String(form.description || '').trim()
    };
    if (!payload.name) return;
    setLoading(true);
    try {
      if (editId) {
        await apiClient.put(apiRoutes.admin.parametres.conditionsPeriodeEssaie.update(editId), payload);
        toast.success('Condition modifiée avec succès');
      } else {
        await apiClient.post(apiRoutes.admin.parametres.conditionsPeriodeEssaie.create, payload);
        toast.success('Condition ajoutée avec succès');
      }
      setShowModal(false);
      setEditId(null);
      setForm({});
      _tableInstance?.refresh?.();
    } catch (e) {} finally {
      setLoading(false);
    }
  };

  const columns: CustomTableColumn<ConditionPeriodeEssaieRow>[] = useMemo(() => [
    { data: 'id', label: 'ID', sortable: true, width: 80 },
    { data: 'name', label: 'Nom', sortable: true },
    { data: 'description', label: 'Description', sortable: true },
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
                className='h-8 w-8 p-1.5'
                onClick={() => onAskEdit(row)}
                aria-label='Modifier'
                title='Modifier'
              >
                <Edit className='h-4 w-4' />
              </Button>
            </TooltipTrigger>
            <TooltipContent side='top'>
              Modifier
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='ghost'
                className='h-8 w-8 p-0 flex items-center justify-center bg-red-100 text-red-600 hover:bg-red-200 hover:text-red-700'
                onClick={() => onAskDelete(row)}
                aria-label='Supprimer'
                title='Supprimer'
              >
                <Trash2 className='h-4 w-4' />
              </Button>
            </TooltipTrigger>
            <TooltipContent side='top' className='bg-red-50 text-red-600'>
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
            <h1 className='text-2xl font-semibold tracking-tight'>Paramètres — Conditions de période d&apos;essaie</h1>
            <p className='text-muted-foreground text-sm'>Gérez les conditions de période d&apos;essaie</p>
          </div>
          <Button onClick={() => { setEditId(null); setForm({}); setShowModal(true); }}>
            <Plus className='mr-2 h-4 w-4' /> Nouvelle condition
          </Button>
        </div>

        <CustomTable<ConditionPeriodeEssaieRow>
          url={apiRoutes.admin.parametres.conditionsPeriodeEssaie.list}
          columns={columns}
          onInit={(inst) => setTableInstance(inst)}
        />

        <CustomAlertDialog
          title={'Supprimer cette condition ?'}
          description={'Cette action est irréversible.'}
          cancelText={'Annuler'}
          confirmText={'Supprimer'}
          onConfirm={onConfirmDelete}
          open={!!confirmDeleteId}
          setOpen={(o) => (!o ? setConfirmDeleteId(null) : void 0)}
        />

        <Dialog open={showModal} onOpenChange={(o) => { setShowModal(o); if (!o) { setEditId(null); } }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editId ? 'Modifier une condition' : 'Ajouter une condition'}</DialogTitle>
            </DialogHeader>
            <div className='grid gap-4'>
              <div className='grid gap-2'>
                <Label htmlFor='name'>Nom</Label>
                <Input id='name' value={String(form.name || '')} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder='Ex: Standard' />
              </div>
              <div className='grid gap-2'>
                <Label htmlFor='description'>Description</Label>
                <Input id='description' value={String(form.description || '')} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder='Ex: 3 mois' />
              </div>
            </div>
            <DialogFooter>
              <Button variant='outline' onClick={() => { setShowModal(false); setEditId(null); }} disabled={loading}>Annuler</Button>
              <Button onClick={handleSave} disabled={loading || !String(form.name || '').trim()}>
                {loading ? (editId ? 'Mise à jour...' : 'Ajout...') : (editId ? 'Mettre à jour' : 'Ajouter')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageContainer>
  );
}
