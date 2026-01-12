'use client';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import CustomTable from '@/components/custom/data-table/custom-table';
import { apiRoutes } from '@/config/apiRoutes';
import apiClient from '@/lib/api';
import { Plus, Trash2, Edit } from 'lucide-react';
import CustomAlertDialog from '@/components/custom/customAlert';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import type { CustomTableColumn, UseTableReturn } from '@/components/custom/data-table/types';
import PageContainer from '@/components/layout/page-container';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { useForm } from 'react-hook-form';
import { SelectField } from '@/components/custom/SelectField';

interface ManagerRow {
  id: number | string;
  employe_id: number;
  departement_id: number;
  employee_name?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  departement_name?: string | null;
}

interface OptionItem { id: number | string; label: string }

interface ManagerFormValues { employe_id: number | string; departement_id: number | string }

export default function ManagersParametresPage() {
  const [_tableInstance, setTableInstance] = useState<Partial<UseTableReturn<ManagerRow>> | null>(null);

  const [confirmDeleteId, setConfirmDeleteId] = useState<number | string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState<number | string | null>(null);
  const [employeId, setEmployeId] = useState<string>('');
  const [departementId, setDepartementId] = useState<string>('');

  const [employees, setEmployees] = useState<OptionItem[]>([]);
  const [departments, setDepartments] = useState<OptionItem[]>([]);

  const form = useForm<ManagerFormValues>({ defaultValues: { employe_id: undefined as any, departement_id: undefined as any } });

  useEffect(() => {
    const loadOpts = async () => {
      try {
        const [emps, depts] = await Promise.all([
          apiClient.get(apiRoutes.admin.employees.simpleList),
          apiClient.get(apiRoutes.admin.departments.simpleList)
        ]);
        const rawEmployees: any[] = (emps?.data?.data || emps?.data || []);
        const empOpts: OptionItem[] = rawEmployees.map((e: any) => {
          const last = e.lastName ;
          const first = e.firstName ;
          const matricule = e.matricule ;
          return { id: e.id, label: `${last} ${first} (${matricule})` };
        });
        const deptOpts: OptionItem[] = (depts?.data?.data || depts?.data || []).map((d: any) => ({ id: d.id, label: d.name || d.libelle || `#${d.id}` }));
        setEmployees(empOpts);
        setDepartments(deptOpts);
      } catch (e) {}
    };
    loadOpts();
  }, []);

  const onAskDelete = (row: ManagerRow) => setConfirmDeleteId(row.id);
  const onConfirmDelete = async () => {
    if (!confirmDeleteId) return;
    try {
      await apiClient.delete(apiRoutes.admin.parametres.managers.delete(confirmDeleteId));
      setConfirmDeleteId(null);
      _tableInstance?.refresh?.();
      toast.success('Manager supprimé avec succès');
    } catch (e) {}
  };

  const onAskEdit = (row: ManagerRow) => {
    setEditId(row.id);
    setEmployeId(String(row.employe_id));
    setDepartementId(String(row.departement_id));
    form.reset({ employe_id: row.employe_id as any, departement_id: row.departement_id as any });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditId(null);
    setEmployeId('');
    setDepartementId('');
    form.reset({ employe_id: undefined as any, departement_id: undefined as any });
  };

  const handleSave = async () => {
    const values = form.getValues();
    const payload = {
      employe_id: Number(values.employe_id),
      departement_id: Number(values.departement_id)
    };
    if (Number.isNaN(payload.employe_id) || Number.isNaN(payload.departement_id)) return;
    setLoading(true);
    try {
      if (editId) {
        await apiClient.put(apiRoutes.admin.parametres.managers.update(editId), payload);
        toast.success('Affectation modifiée avec succès');
      } else {
        await apiClient.post(apiRoutes.admin.parametres.managers.create, payload);
        toast.success('Affectation ajoutée avec succès');
      }
      setShowModal(false);
      resetForm();
      _tableInstance?.refresh?.();
    } catch (e) {} finally {
      setLoading(false);
    }
  };

  const columns: CustomTableColumn<ManagerRow>[] = useMemo(() => [
    { data: 'id', label: 'ID', sortable: true, width: 80 },
    { data: 'employee_last_name', label: 'Nom manager', sortable: true, render: (_v, row) => row.lastName || (row.employee_name ? String(row.employee_name).split(' ').slice(-1)[0] : `#${row.employe_id}`) },
    { data: 'employee_first_name', label: 'Prénom manager', sortable: true, render: (_v, row) => row.firstName || (row.employee_name ? String(row.employee_name).split(' ').slice(0, -1).join(' ') : '') },
    { data: 'departement_name', label: 'Département', sortable: false, render: (_v, row) => row.departement_name || `#${row.departement_id}` },
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
            <h1 className='text-2xl font-semibold tracking-tight'>Paramètres — Managers</h1>
            <p className='text-muted-foreground text-sm'>Gérez l&apos;affectation des managers aux départements</p>
          </div>
          <Button onClick={() => { resetForm(); setShowModal(true); }}>
            <Plus className='mr-2 h-4 w-4' /> Nouvelle affectation
          </Button>
        </div>

        <CustomTable<ManagerRow>
          url={apiRoutes.admin.parametres.managers.list}
          columns={columns}
          onInit={(inst) => setTableInstance(inst)}
        />

        <CustomAlertDialog
          title={'Supprimer cette affectation ?'}
          description={'Cette action est irréversible.'}
          cancelText={'Annuler'}
          confirmText={'Supprimer'}
          onConfirm={onConfirmDelete}
          open={!!confirmDeleteId}
          setOpen={(o) => (!o ? setConfirmDeleteId(null) : void 0)}
        />

        <Dialog open={showModal} onOpenChange={(o) => { setShowModal(o); if (!o) resetForm(); }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editId ? 'Modifier une affectation' : 'Ajouter une affectation'}</DialogTitle>
            </DialogHeader>
            <div className='grid gap-4 sm:grid-cols-2'>
              <div className='grid gap-2'>
                <SelectField<ManagerFormValues, 'employe_id'
                >
                  name='employe_id'
                  label='Employé'
                  control={form.control}
                  options={employees.map((e) => ({ id: e.id, label: e.label }))}
                  placeholder='Choisir un employé'
                  required
                />
              </div>
              <div className='grid gap-2'>
                <Label>Département</Label>
                <Select value={departementId || String(form.watch('departement_id') || '')} onValueChange={(v) => { setDepartementId(v); form.setValue('departement_id', v as any); }}>
                  <SelectTrigger>
                    <SelectValue placeholder='Choisir un département' />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((d) => (
                      <SelectItem key={d.id} value={String(d.id)}>{d.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant='outline' onClick={() => { setShowModal(false); resetForm(); }} disabled={loading}>Annuler</Button>
              <Button
                onClick={handleSave}
                disabled={
                  loading ||
                  !form.watch('employe_id') ||
                  !form.watch('departement_id')
                }
              >
                {loading ? (editId ? 'Mise à jour...' : 'Ajout...') : (editId ? 'Mettre à jour' : 'Ajouter')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageContainer>
  );
}
