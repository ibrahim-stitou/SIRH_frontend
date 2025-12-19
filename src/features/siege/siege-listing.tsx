'use client';

import React, { useMemo, useState } from 'react';
import { Users, Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Minimal subset of Headquarters (Siège) fields for listing
interface SiegeRow {
  id: string;
  name: string;
  code: string;
  address?: string;
  city?: string;
  country?: string;
  phone?: string;
  email?: string;
  groupsCount?: number;
  createdAt?: string;
  updatedAt?: string;
  actions?: string;
}

export default function SiegeListing() {
  const router = useRouter();
  const { t } = useLanguage();
  const [tableInstance, setTableInstance] = useState<Partial<
    UseTableReturn<SiegeRow>
  > | null>(null);

  // Create (Add) modal state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    code: '',
    address: '',
    city: '',
    country: '',
    phone: '',
    email: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ name?: string; code?: string }>({});

  // Delete confirmation modal state
  const [selectedSiegeId, setSelectedSiegeId] = useState<string | null>(null);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);

  const onOpenCreate = () => setIsCreateOpen(true);
  const onCloseCreate = () => setIsCreateOpen(false);

  const handleCreate = async () => {
    setServerError(null);
    // Basic validation with inline errors
    const localErrors: { name?: string; code?: string } = {};
    if (!form.name) localErrors.name = t('common.validation.required');
    if (!form.code) localErrors.code = t('common.validation.required');
    if (localErrors.name || localErrors.code) {
      setErrors(localErrors);
      return;
    }
    try {
      setIsSubmitting(true);
      const payload = {
        ...form,
        id: `hq-${Date.now()}`,
        groupsCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      const resp = await apiClient.post(
        apiRoutes.admin.headquarters.create,
        payload
      );
      if (resp?.data) {
        toast.success(t('common.created'));
        setIsCreateOpen(false);
        setForm({
          name: '',
          code: '',
          address: '',
          city: '',
          country: '',
          phone: '',
          email: ''
        });
        setErrors({});
        setServerError(null);
        if (tableInstance?.refresh) tableInstance.refresh();
      } else {
        setServerError(t('common.error'));
      }
    } catch (e: any) {
      const msg = e?.response?.data?.message || t('common.error');
      setServerError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDeleteConfirm = (id: string) => {
    setSelectedSiegeId(id);
    setOpenDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedSiegeId) return;
    try {
      const resp = await apiClient.delete(
        apiRoutes.admin.headquarters.delete(selectedSiegeId)
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
      setSelectedSiegeId(null);
    }
  };

  const columns: CustomTableColumn<SiegeRow>[] = useMemo(
    () => [
      { data: 'id', label: 'ID', sortable: true },
      { data: 'name', label: t('common.name'), sortable: true },
      { data: 'code', label: t('common.code'), sortable: true },
      { data: 'city', label: t('common.city'), sortable: true },
      { data: 'country', label: t('common.country'), sortable: true },
      { data: 'email', label: t('common.email'), sortable: true },
      { data: 'phone', label: t('common.phone'), sortable: true },
      {
        data: 'groupsCount',
        label: t('headquarters.groupsCount') || t('common.groups'),
        sortable: true,
        render: (value) => (typeof value === 'number' ? value : '—')
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
                  onClick={() =>
                    router.push(`/admin/sieges-groupes/${row.id}/groupes`)
                  }
                >
                  <Users className='h-4 w-4' />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Voir les groupes</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant='destructive'
                  className='h-8 w-8 bg-red-100 p-1.5 text-red-600 hover:bg-red-200'
                  onClick={() => openDeleteConfirm(row.id)}
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
    { field: 'city', label: t('common.city'), type: 'text' },
    { field: 'country', label: t('common.country'), type: 'text' }
  ];

  return (
    <>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-semibold tracking-tight'>
            {t('headquarters.title') || 'Sièges'}
          </h1>
          <p className='text-muted-foreground text-sm'>
            {t('headquarters.subtitle') || 'Gestion des sièges'}
          </p>
        </div>
        <Button onClick={onOpenCreate} className='gap-1'>
          <Plus className='h-4 w-4' />{' '}
          {t('headquarters.add') || t('common.create')}
        </Button>
      </div>

      <div className='flex flex-1 flex-col space-y-4'>
        <CustomTable<SiegeRow>
          columns={columns}
          url={apiRoutes.admin.sieges.list}
          filters={filters}
          onInit={(instance) => setTableInstance(instance)}
        />
        <CustomAlertDialog
          title={t('headquarters.dialog.delete.title') || 'Supprimer le siège'}
          description={
            t('headquarters.dialog.delete.description') ||
            'Cette action est irréversible. Êtes-vous sûr de vouloir supprimer ce siège ?'
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
        title={t('headquarters.create.title') || 'Ajouter un siège'}
        description={
          t('headquarters.create.subtitle') ||
          'Renseignez les informations du siège'
        }
        isOpen={isCreateOpen}
        onClose={onCloseCreate}
      >
        {serverError && (
          <Alert variant='destructive' className='mb-3'>
            <AlertTitle>{t('common.error')}</AlertTitle>
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        )}
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
          <div className='space-y-2'>
            <Label htmlFor='name'>
              {t('headquarters.create.fields.name') || t('common.name')}{' '}
              <span className='text-destructive'>*</span>
            </Label>
            <Input
              id='name'
              aria-invalid={!!errors.name}
              value={form.name}
              onChange={(e) => {
                setForm((f) => ({ ...f, name: e.target.value }));
                if (errors.name)
                  setErrors((prev) => ({ ...prev, name: undefined }));
              }}
            />
            {errors.name && (
              <div className='text-destructive text-xs'>{errors.name}</div>
            )}
          </div>
          <div className='space-y-2'>
            <Label htmlFor='code'>
              {t('headquarters.create.fields.code') || t('common.code')}{' '}
              <span className='text-destructive'>*</span>
            </Label>
            <Input
              id='code'
              aria-invalid={!!errors.code}
              value={form.code}
              onChange={(e) => {
                setForm((f) => ({ ...f, code: e.target.value }));
                if (errors.code)
                  setErrors((prev) => ({ ...prev, code: undefined }));
              }}
            />
            {errors.code && (
              <div className='text-destructive text-xs'>{errors.code}</div>
            )}
          </div>
          <div className='space-y-2 sm:col-span-2'>
            <Label htmlFor='address'>
              {t('headquarters.create.fields.address') ||
                t('common.address') ||
                'Adresse'}
            </Label>
            <Input
              id='address'
              value={form.address}
              onChange={(e) =>
                setForm((f) => ({ ...f, address: e.target.value }))
              }
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='city'>
              {t('headquarters.create.fields.city') || t('common.city')}
            </Label>
            <Input
              id='city'
              value={form.city}
              onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='country'>
              {t('headquarters.create.fields.country') || t('common.country')}
            </Label>
            <Input
              id='country'
              value={form.country}
              onChange={(e) =>
                setForm((f) => ({ ...f, country: e.target.value }))
              }
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='phone'>
              {t('headquarters.create.fields.phone') || t('common.phone')}
            </Label>
            <Input
              id='phone'
              value={form.phone}
              onChange={(e) =>
                setForm((f) => ({ ...f, phone: e.target.value }))
              }
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='email'>
              {t('headquarters.create.fields.email') || t('common.email')}
            </Label>
            <Input
              id='email'
              value={form.email}
              onChange={(e) =>
                setForm((f) => ({ ...f, email: e.target.value }))
              }
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
