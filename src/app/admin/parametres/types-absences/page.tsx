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
import { Switch } from '@/components/ui/switch';
import type { CustomTableColumn, UseTableReturn } from '@/components/custom/data-table/types';
import PageContainer from '@/components/layout/page-container';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip';

interface TypeAbsenceRow {
  id: number | string;
  code: string;
  libelle: string;
  remunere: boolean;
  deduit_compteur: boolean;
  delai_prevenance_jours: number;
  duree_max: number;
  acquisition_mensuelle: number;
  plafond_annuel: number;
  report_possible: boolean;
  description: string;
  created_at?: string;
  updated_at?: string;
}

export default function TypesAbsencesParametresPage() {
  const [_tableInstance, setTableInstance] = useState<Partial<UseTableReturn<TypeAbsenceRow>> | null>(null);

  const [confirmDeleteId, setConfirmDeleteId] = useState<number | string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [form, setForm] = useState<Partial<TypeAbsenceRow>>({
    remunere: false,
    deduit_compteur: false,
    delai_prevenance_jours: 0,
    duree_max: 0,
    acquisition_mensuelle: 0,
    plafond_annuel: 0,
    report_possible: false
  });
  const [editId, setEditId] = useState<number | string | null>(null);

  const onAskDelete = (row: TypeAbsenceRow) => setConfirmDeleteId(row.id);
  const onConfirmDelete = async () => {
    if (!confirmDeleteId) return;
    try {
      await apiClient.delete(apiRoutes.admin.parametres.typesAbsences.delete(confirmDeleteId));
      setConfirmDeleteId(null);
      _tableInstance?.refresh?.();
      toast.success('Type d\'absence supprimé avec succès');
    } catch (e) {
      // noop
    }
  };

  const handleAdd = async () => {
    const payload = {
      code: String(form.code || '').trim(),
      libelle: String(form.libelle || '').trim(),
      remunere: !!form.remunere,
      deduit_compteur: !!form.deduit_compteur,
      delai_prevenance_jours: Number(form.delai_prevenance_jours || 0),
      duree_max: Number(form.duree_max || 0),
      acquisition_mensuelle: Number(form.acquisition_mensuelle || 0),
      plafond_annuel: Number(form.plafond_annuel || 0),
      report_possible: !!form.report_possible,
      description: String(form.description || '').trim()
    };
    if (!payload.code || !payload.libelle) return;
    setAddLoading(true);
    try {
      await apiClient.post(apiRoutes.admin.parametres.typesAbsences.create, payload);
      setShowAddModal(false);
      setForm({ remunere: false, deduit_compteur: false, delai_prevenance_jours: 0, duree_max: 0, acquisition_mensuelle: 0, plafond_annuel: 0, report_possible: false });
      _tableInstance?.refresh?.();
      toast.success('Type d\'absence ajouté avec succès');
    } catch (e) {
      // noop
    } finally {
      setAddLoading(false);
    }
  };

  const onAskEdit = (row: TypeAbsenceRow) => {
    setEditId(row.id);
    setForm({
      code: row.code,
      libelle: row.libelle,
      remunere: row.remunere,
      deduit_compteur: row.deduit_compteur,
      delai_prevenance_jours: row.delai_prevenance_jours,
      duree_max: row.duree_max,
      acquisition_mensuelle: row.acquisition_mensuelle,
      plafond_annuel: row.plafond_annuel,
      report_possible: row.report_possible,
      description: row.description
    });
    setShowAddModal(true);
  };

  const handleUpdate = async () => {
    if (!editId) return;
    const payload = {
      code: String(form.code || '').trim(),
      libelle: String(form.libelle || '').trim(),
      remunere: !!form.remunere,
      deduit_compteur: !!form.deduit_compteur,
      delai_prevenance_jours: Number(form.delai_prevenance_jours || 0),
      duree_max: Number(form.duree_max || 0),
      acquisition_mensuelle: Number(form.acquisition_mensuelle || 0),
      plafond_annuel: Number(form.plafond_annuel || 0),
      report_possible: !!form.report_possible,
      description: String(form.description || '').trim()
    };
    if (!payload.code || !payload.libelle) return;
    setAddLoading(true);
    try {
      await apiClient.put(apiRoutes.admin.parametres.typesAbsences.update(editId), payload);
      setShowAddModal(false);
      setEditId(null);
      setForm({ remunere: false, deduit_compteur: false, delai_prevenance_jours: 0, duree_max: 0, acquisition_mensuelle: 0, plafond_annuel: 0, report_possible: false });
      _tableInstance?.refresh?.();
      toast.success("Type d'absence modifié avec succès");
    } catch (e) {
      // noop
    } finally {
      setAddLoading(false);
    }
  };

  const columns: CustomTableColumn<TypeAbsenceRow>[] = useMemo(() => [
    { data: 'id', label: 'ID', sortable: true, width: 80 },
    { data: 'code', label: 'Code', sortable: true },
    { data: 'libelle', label: 'Libellé', sortable: true },
    { data: 'remunere', label: 'Rémunéré', sortable: true, render: (v: boolean) => (v ? 'Oui' : 'Non') },
    { data: 'deduit_compteur', label: 'Déduit compteur', sortable: true, render: (v: boolean) => (v ? 'Oui' : 'Non') },
    { data: 'delai_prevenance_jours', label: 'Délai prévenance (jours)', sortable: true },
    { data: 'duree_max', label: 'Durée max', sortable: true },
    { data: 'acquisition_mensuelle', label: 'Acquisition mensuelle', sortable: true },
    { data: 'plafond_annuel', label: 'Plafond annuel', sortable: true },
    { data: 'report_possible', label: 'Report possible', sortable: true, render: (v: boolean) => (v ? 'Oui' : 'Non') },
    { data: 'description', label: 'Description', sortable: false },
    {
      data: 'actions',
      label: 'Actions',
      sortable: false,
      render: (_v, row) => (
        <div className='flex items-center gap-2'>
          <Tooltip>
            <TooltipTrigger asChild>
          <Button
            variant='outline'
            onClick={() => onAskEdit(row)}
            aria-label='Modifier'
            className='h-8 w-8 p-1.5'
            title='Modifier'
          >
            <Edit className='h-4 w-4' />
          </Button>
            </TooltipTrigger>
            <TooltipContent side='top' >
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
            <h1 className='text-2xl font-semibold tracking-tight'>Paramètres — Types d&lsquo;absences</h1>
            <p className='text-muted-foreground text-sm'>Gérez les types d&lsquo;absences et leurs règles</p>
          </div>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className='mr-2 h-4 w-4' /> Nouveau type d&lsquo;absence
          </Button>
        </div>

        <CustomTable<TypeAbsenceRow>
          url={apiRoutes.admin.parametres.typesAbsences.list}
          columns={columns}
          onInit={(inst) => setTableInstance(inst)}
        />

        <CustomAlertDialog
          title={'Supprimer ce type d\'absence ?'}
          description={'Cette action est irréversible.'}
          cancelText={'Annuler'}
          confirmText={'Supprimer'}
          onConfirm={onConfirmDelete}
          open={!!confirmDeleteId}
          setOpen={(o) => (!o ? setConfirmDeleteId(null) : void 0)}
        />

        <Dialog open={showAddModal} onOpenChange={(o) => { setShowAddModal(o); if (!o) { setEditId(null); } }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editId ? "Modifier un type d'absence" : "Ajouter un type d'absence"}</DialogTitle>
            </DialogHeader>
            <div className='grid gap-4 sm:grid-cols-2'>
              <div className='grid gap-2'>
                <Label htmlFor='code'>Code</Label>
                <Input id='code' value={String(form.code || '')} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} placeholder='Ex: ABS-CP' />
              </div>
              <div className='grid gap-2'>
                <Label htmlFor='libelle'>Libellé</Label>
                <Input id='libelle' value={String(form.libelle || '')} onChange={(e) => setForm((f) => ({ ...f, libelle: e.target.value }))} placeholder='Ex: Congé payé' />
              </div>
              <div className='flex items-center justify-between'>
                <Label htmlFor='remunere'>Rémunéré</Label>
                <Switch id='remunere' checked={!!form.remunere} onCheckedChange={(v) => setForm((f) => ({ ...f, remunere: v }))} />
              </div>
              <div className='flex items-center justify-between'>
                <Label htmlFor='deduit_compteur'>Déduit compteur</Label>
                <Switch id='deduit_compteur' checked={!!form.deduit_compteur} onCheckedChange={(v) => setForm((f) => ({ ...f, deduit_compteur: v }))} />
              </div>
              <div className='grid gap-2'>
                <Label htmlFor='delai_prevenance_jours'>Délai prévenance (jours)</Label>
                <Input id='delai_prevenance_jours' type='number' value={Number(form.delai_prevenance_jours || 0)} onChange={(e) => setForm((f) => ({ ...f, delai_prevenance_jours: Number(e.target.value) }))} />
              </div>
              <div className='grid gap-2'>
                <Label htmlFor='duree_max'>Durée max</Label>
                <Input id='duree_max' type='number' value={Number(form.duree_max || 0)} onChange={(e) => setForm((f) => ({ ...f, duree_max: Number(e.target.value) }))} />
              </div>
              <div className='grid gap-2'>
                <Label htmlFor='acquisition_mensuelle'>Acquisition mensuelle</Label>
                <Input id='acquisition_mensuelle' type='number' value={Number(form.acquisition_mensuelle || 0)} onChange={(e) => setForm((f) => ({ ...f, acquisition_mensuelle: Number(e.target.value) }))} />
              </div>
              <div className='grid gap-2'>
                <Label htmlFor='plafond_annuel'>Plafond annuel</Label>
                <Input id='plafond_annuel' type='number' value={Number(form.plafond_annuel || 0)} onChange={(e) => setForm((f) => ({ ...f, plafond_annuel: Number(e.target.value) }))} />
              </div>
              <div className='flex items-center justify-between'>
                <Label htmlFor='report_possible'>Report possible</Label>
                <Switch id='report_possible' checked={!!form.report_possible} onCheckedChange={(v) => setForm((f) => ({ ...f, report_possible: v }))} />
              </div>
              <div className='sm:col-span-2 grid gap-2'>
                <Label htmlFor='description'>Description</Label>
                <Input id='description' value={String(form.description || '')} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder='Description...' />
              </div>
            </div>
            <DialogFooter>
              <Button variant='outline' onClick={() => { setShowAddModal(false); setEditId(null); }} disabled={addLoading}>Annuler</Button>
              {editId ? (
                <Button onClick={handleUpdate} disabled={addLoading || !String(form.code || '').trim() || !String(form.libelle || '').trim()}>
                  {addLoading ? 'Mise à jour...' : 'Mettre à jour'}
                </Button>
              ) : (
                <Button onClick={handleAdd} disabled={addLoading || !String(form.code || '').trim() || !String(form.libelle || '').trim()}>
                  {addLoading ? 'Ajout...' : 'Ajouter'}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageContainer>
  );
}
