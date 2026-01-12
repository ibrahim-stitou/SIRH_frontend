'use client';
import { useMemo, useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import CustomTable from '@/components/custom/data-table/custom-table';
import { StatusBadge } from '@/components/custom/status-badge';
import { apiRoutes } from '@/config/apiRoutes';
import apiClient from '@/lib/api';
import { Plus, Trash2, Check, X } from 'lucide-react';
import CustomAlertDialog from '@/components/custom/customAlert';
import { toast } from 'sonner';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import type {
  CustomTableColumn,
  UseTableReturn
} from '@/components/custom/data-table/types';
import PageContainer from '@/components/layout/page-container';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

interface PosteSettingRow {
  id: number | string;
  code: string;
  libelle: string;
  departement_id: number | string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

interface DepartementSettingRow {
  id: number | string;
  code: string;
  libelle: string;
  is_active: boolean;
}

export default function PostesParametresPage() {
  const [_tableInstance, setTableInstance] = useState<Partial<
    UseTableReturn<PosteSettingRow>
  > | null>(null);

  const [confirmDeleteId, setConfirmDeleteId] = useState<
    number | string | null
  >(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newLibelle, setNewLibelle] = useState('');
  const [newActive, setNewActive] = useState(true);
  const [newDepartementId, setNewDepartementId] = useState<string>('');

  const [departements, setDepartements] = useState<DepartementSettingRow[]>([]);
  const departementLabelById = useMemo(() => {
    const map = new Map<string, string>();
    for (const d of departements) map.set(String(d.id), d.libelle);
    return map;
  }, [departements]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await apiClient.get(
          apiRoutes.admin.parametres.departements.list
        );
        const rows = Array.isArray(res.data?.data) ? res.data.data : [];
        if (mounted) setDepartements(rows);
      } catch (e) {
        // noop
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const onAskDelete = (row: PosteSettingRow) => setConfirmDeleteId(row.id);
  const onConfirmDelete = async () => {
    if (!confirmDeleteId) return;
    try {
      await apiClient.delete(
        apiRoutes.admin.parametres.postes.delete(confirmDeleteId)
      );
      setConfirmDeleteId(null);
      _tableInstance?.refresh?.();
      toast.success('Poste supprimé avec succès');
    } catch (e) {
      // noop or toast
    }
  };

  const onToggleActive = useCallback(
    async (row: PosteSettingRow) => {
      try {
        const route = row.is_active
          ? apiRoutes.admin.parametres.postes.deactivate(row.id)
          : apiRoutes.admin.parametres.postes.activate(row.id);
        await apiClient.patch(route);
        _tableInstance?.refresh?.();
      } catch (e) {
        // noop or toast
      }
    },
    [_tableInstance]
  );

  const handleAdd = async () => {
    if (!newCode.trim() || !newLibelle.trim() || !newDepartementId) return;
    setAddLoading(true);
    try {
      await apiClient.post(apiRoutes.admin.parametres.postes.create, {
        code: newCode.trim(),
        libelle: newLibelle.trim(),
        departement_id: isNaN(+newDepartementId)
          ? newDepartementId
          : +newDepartementId,
        is_active: newActive
      });
      setShowAddModal(false);
      setNewCode('');
      setNewLibelle('');
      setNewActive(true);
      setNewDepartementId('');
      _tableInstance?.refresh?.();
      toast.success('Poste ajouté avec succès');
    } catch (e) {
      // noop or toast
    } finally {
      setAddLoading(false);
    }
  };

  const columns: CustomTableColumn<PosteSettingRow>[] = useMemo(
    () => [
      { data: 'id', label: 'ID', sortable: true, width: 100 },
      { data: 'code', label: 'Code', sortable: true },
      { data: 'libelle', label: 'Libellé', sortable: true },
      {
        data: 'departement_id',
        label: 'Département',
        sortable: true,
        render: (v: number | string) =>
          departementLabelById.get(String(v)) || String(v)
      },
      {
        data: 'is_active',
        label: 'Statut',
        sortable: true,
        render: (v: boolean) => (
          <StatusBadge
            tone={v ? 'success' : 'danger'}
            label={v ? 'Actif' : 'Inactif'}
          />
        )
      },
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
                  className={`flex h-8 w-8 items-center justify-center p-0 ${row.is_active ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200 hover:text-yellow-700' : 'bg-green-100 text-green-600 hover:bg-green-200 hover:text-green-700'}`}
                  onClick={() => onToggleActive(row)}
                  aria-label={row.is_active ? 'Désactiver' : 'Activer'}
                  title={row.is_active ? 'Désactiver' : 'Activer'}
                >
                  {row.is_active ? (
                    <X className='h-4 w-4' />
                  ) : (
                    <Check className='h-4 w-4' />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent
                side='top'
                className={`${row.is_active ? 'bg-yellow-50 text-yellow-600' : 'bg-green-50 text-green-600'}`}
              >
                {row.is_active ? 'Désactiver' : 'Activer'}
              </TooltipContent>
            </Tooltip>

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
    ],
    [departementLabelById, onToggleActive]
  );

  return (
    <PageContainer scrollable={false}>
      <div className='flex w-full flex-col gap-4'>
        <div className='mb-2 flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-semibold tracking-tight'>
              Paramètres — Postes
            </h1>
            <p className='text-muted-foreground text-sm'>
              Gérez les codes, libellés, département et statut d&apos;activité
              des postes
            </p>
          </div>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className='mr-2 h-4 w-4' /> Nouveau poste
          </Button>
        </div>

        <CustomTable<PosteSettingRow>
          url={apiRoutes.admin.parametres.postes.list}
          columns={columns}
          onInit={(inst) => setTableInstance(inst)}
        />

        <CustomAlertDialog
          title={'Supprimer ce poste ?'}
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
              <DialogTitle>Ajouter un poste</DialogTitle>
            </DialogHeader>
            <div className='grid gap-4'>
              <div className='grid gap-2'>
                <Label htmlFor='code'>Code</Label>
                <Input
                  id='code'
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  placeholder='Ex: POST-DEV'
                />
              </div>
              <div className='grid gap-2'>
                <Label htmlFor='libelle'>Libellé</Label>
                <Input
                  id='libelle'
                  value={newLibelle}
                  onChange={(e) => setNewLibelle(e.target.value)}
                  placeholder='Ex: Développeur'
                />
              </div>
              <div className='grid gap-2'>
                <Label>Département</Label>
                <Select
                  value={newDepartementId}
                  onValueChange={setNewDepartementId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Choisir un département' />
                  </SelectTrigger>
                  <SelectContent>
                    {departements.map((d) => (
                      <SelectItem
                        key={d.id}
                        value={String(d.id)}
                        disabled={!d.is_active}
                      >
                        {d.libelle}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className='flex items-center justify-between'>
                <Label htmlFor='is_active'>Actif</Label>
                <Switch
                  id='is_active'
                  checked={newActive}
                  onCheckedChange={setNewActive}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant='outline'
                onClick={() => setShowAddModal(false)}
                disabled={addLoading}
              >
                Annuler
              </Button>
              <Button
                onClick={handleAdd}
                disabled={
                  addLoading ||
                  !newCode.trim() ||
                  !newLibelle.trim() ||
                  !newDepartementId
                }
              >
                {addLoading ? 'Ajout...' : 'Ajouter'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageContainer>
  );
}
