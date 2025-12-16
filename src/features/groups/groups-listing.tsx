'use client';
import React, { useMemo, useState } from 'react';
import { Eye, Plus, Trash2, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip';
import CustomTable from '@/components/custom/data-table/custom-table';
import {
  CustomTableColumn,
  CustomTableFilterConfig,
  UseTableReturn
} from '@/components/custom/data-table/types';
import { apiRoutes } from '@/config/apiRoutes';
import apiClient from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import CustomAlertDialog from '@/components/custom/customAlert';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { SelectField } from '@/components/custom/SelectField';

interface GroupeRow {
  id: string;
  name: string;
  code: string;
  headquartersId?: string;
  managerId?: string;
  managerName?: string;
  createdAt?: string;
  updatedAt?: string;
  actions?: string;
}

const GroupSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  code: z.string().min(1, 'Le code est requis'),
  managerId: z.number().optional()
});

type GroupSchema = z.infer<typeof GroupSchema>;

export default function GroupsListing({ id }: { id?: string }) {
  const { t } = useLanguage();
  const router = useRouter();

  const [tableInstance, setTableInstance] = useState<Partial<
    UseTableReturn<GroupeRow>
  > | null>(null);
  //create (add) modal state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const form = useForm<GroupSchema>({
    resolver: zodResolver(GroupSchema),
    defaultValues: {
      name: '',
      code: '',
      managerId: undefined
    }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  //delete confirmation modal state
  const [selectedGroupeId, setSelectedGroupeId] = useState<string | null>(null);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [managerOptions, setManagerOptions] = useState<
    Array<{
      id: number | string;
      firstName: string;
      lastName: string;
      matricule?: string;
    }>
  >([]);

  const fetchManagers = async () => {
    try {
      const resp = await apiClient.get(
        apiRoutes.admin.employees.managersSimpleList
      );
      const list = resp?.data?.data || [];
      setManagerOptions(list);
    } catch (e) {
      setManagerOptions([]);
    }
  };

  const onOpenCreate = () => {
    setIsCreateOpen(true);
    fetchManagers();
  };
  const onCloseCreate = () => setIsCreateOpen(false);

  const columns: CustomTableColumn<GroupeRow>[] = useMemo(
    () => [
      { data: 'id', label: 'ID', sortable: true },
      { data: 'name', label: t('common.name'), sortable: true },
      { data: 'code', label: t('common.code'), sortable: true },
      {
        data: 'managerName',
        label: t('common.manager') || 'Manager',
        sortable: true
      },
      {
        data: 'actions',
        label: t('employees.columns.actions'),
        sortable: false,
        render: (_value, row) => (
          <div className='flex items-center space-x-2'>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant='outline'
                  className='h-8 w-8 p-1.5'
                  onClick={() => router.push(`/admin/sieges-groupes/${row.id}`)}
                >
                  <Eye className='h-4 w-4' />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t('common.view')}</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant='destructive'
                  className='h-8 w-8 p-1.5'
                  onClick={() => openDeleteConfirmation(row.id)}
                >
                  <Trash2 className='h-4 w-4' />
                </Button>
              </TooltipTrigger>
              <TooltipContent
                className='tooltip-content rounded-md bg-red-100 px-2 py-1 text-red-600 shadow-md'
                sideOffset={5}
              >
                {t('common.delete')}
              </TooltipContent>
            </Tooltip>
          </div>
        )
      }
    ],
    [router, t]
  );

  const filters: CustomTableFilterConfig[] = [
    { field: 'name', label: t('common.name'), type: 'text' },
    { field: 'code', label: t('common.code'), type: 'text' },
    {
      field: 'managerId',
      label: t('common.manager') || 'Manager',
      type: 'select',
      options: managerOptions.map((m) => ({
        value: String(m.id),
        label: `${m.firstName} ${m.lastName}`
      }))
    }
  ];

  const handleCreate = async () => {
    const values = form.getValues();
    const result = GroupSchema.safeParse(values);
    if (!result.success) {
      console.log(result.error);
      toast.error(t('common.validation.required'));
      return;
    }
    try {
      setIsSubmitting(true);
      const payload = {
        id: `grp-${Date.now()}`,
        headquartersId: id,
        name: values.name,
        code: values.code,
        managerId: values.managerId || undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      const resp = await apiClient.post(apiRoutes.admin.groups.create, payload);
      if (resp?.data) {
        toast.success(t('common.created'));
        setIsCreateOpen(false);
        form.reset();
        if (tableInstance?.refresh) tableInstance.refresh();
      } else {
        toast.error(t('common.error'));
      }
    } catch (e: any) {
      const msg = e?.response?.data?.message || t('common.error');
      toast.error(`${t('common.error')}: ${msg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedGroupeId) return;
    try {
      const resp = await apiClient.delete(
        apiRoutes.admin.groups.delete(selectedGroupeId)
      );
      if (resp?.data) {
        toast.success(t('common.deleted'));
        if (tableInstance?.refresh) tableInstance.refresh();
      } else {
        toast.error(t('common.error'));
      }
    } catch (e: any) {
      const msg = e?.response?.data?.message || t('common.error');
      toast.error(`${t('common.error')}: ${msg}`);
    } finally {
      setOpenDeleteModal(false);
      setSelectedGroupeId(null);
    }
  };

  const openDeleteConfirmation = (groupeId: string) => {
    setSelectedGroupeId(groupeId);
    setOpenDeleteModal(true);
  };

  const listingUrl = id
    ? apiRoutes.admin.sieges.groupsBySiege(id)
    : apiRoutes.admin.groups.list;

  return (
    <>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-semibold tracking-tight'>
            {t('common.groups')} {id ? `(Siège: ${id})` : ''}
          </h1>
          <p className='text-muted-foreground text-sm'>
            Gérez les groupes associés {id ? 'à ce siège' : "à l'entreprise"}.
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <Button
            variant='outline'
            onClick={() => router.push('/admin/sieges-groupes')}
            className='gap-1'
          >
            <ArrowLeft className='h-4 w-4' /> Retour à la liste des sièges
          </Button>
          <Button onClick={onOpenCreate} className='gap-1'>
            <Plus className='h-4 w-4' /> Créer un groupe
          </Button>
        </div>
      </div>

      <div className='flex flex-1 flex-col space-y-4'>
        <CustomTable<GroupeRow>
          columns={columns}
          url={listingUrl}
          filters={filters}
          onInit={(instance) => setTableInstance(instance)}
        />
        <CustomAlertDialog
          title={t('common.delete')}
          description={
            t('common.confirmDelete') || 'Confirmez la suppression du groupe'
          }
          cancelText={t('common.cancel')}
          confirmText={t('common.delete')}
          onConfirm={handleConfirmDelete}
          open={openDeleteModal}
          setOpen={setOpenDeleteModal}
        />
      </div>

      {/* Create Modal */}
      <Modal
        title={t('common.create') + ' ' + (t('common.groups') || 'Groupe')}
        description={t('common.addNew') || 'Ajouter un nouveau groupe'}
        isOpen={isCreateOpen}
        onClose={onCloseCreate}
      >
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
          <div className='space-y-2'>
            <Label htmlFor='name'>{t('common.name')}</Label>
            <Input id='name' {...form.register('name')} />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='code'>{t('common.code')}</Label>
            <Input id='code' {...form.register('code')} />
          </div>
          <div className='space-y-2 sm:col-span-2'>
            <SelectField<GroupSchema, 'managerId'>
              name={'managerId'}
              label={t('common.manager') || 'Manager'}
              control={form.control}
              options={managerOptions.map((m) => ({
                id: m.id,
                label: `${m.firstName} ${m.lastName}`,
                value: String(m.id),
                matricule: m.matricule
              }))}
              secondaryField={'matricule'}
              placeholder={
                managerOptions.length
                  ? t('common.select') || 'Sélectionner'
                  : 'Chargement...'
              }
              className='w-full'
            />
          </div>
        </div>
        <div className='mt-6 flex justify-end gap-2'>
          <Button
            variant='outline'
            onClick={onCloseCreate}
            disabled={isSubmitting}
          >
            {t('common.cancel')}
          </Button>
          <Button onClick={handleCreate} disabled={isSubmitting}>
            {t('common.save')}
          </Button>
        </div>
      </Modal>
    </>
  );
}
