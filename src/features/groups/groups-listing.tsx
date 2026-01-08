'use client';
import React, { useMemo, useState } from 'react';
import {
  Plus,
  Trash2,
  ArrowLeft,
  Users,
  Save,
  CheckSquare,
  Square,
  UserPlus
} from 'lucide-react';
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetDescription
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';

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
  managerId: z.string().optional()
});

type GroupSchema = z.infer<typeof GroupSchema>;

type GroupMember = {
  id: string;
  employeeId: number | string;
  isManager: boolean;
  employee?: {
    id: number | string;
    firstName: string;
    lastName: string;
    email?: string;
    matricule?: string;
    position?: string;
  } | null;
};

// Create a tiny form type for the add-employee select in the sheet
type AddMemberForm = { employeeId: string | number };

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
      managerId: ''
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

  // Sheet state for group members
  const [openSheet, setOpenSheet] = useState(false);
  const [activeGroup, setActiveGroup] = useState<GroupeRow | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState<
    (number | string)[]
  >([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const addMemberForm = useForm<AddMemberForm>({
    defaultValues: { employeeId: '' }
  });
  const [employeesOptions, setEmployeesOptions] = useState<
    Array<{
      id: number | string;
      firstName: string;
      lastName: string;
      matricule?: string;
    }>
  >([]);
  const [savingMembers, setSavingMembers] = useState(false);

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

  const fetchEmployeesSimple = async () => {
    try {
      const resp = await apiClient.get(apiRoutes.admin.employees.simpleList);
      setEmployeesOptions(resp?.data?.data || []);
    } catch {
      setEmployeesOptions([]);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const openGroupSheet = async (row: GroupeRow) => {
    setActiveGroup(row);
    setOpenSheet(true);
    try {
      setLoadingMembers(true);
      const resp = await apiClient.get(apiRoutes.admin.groups.members(row.id));
      const data = resp?.data?.data;
      const groupMembers: GroupMember[] = data?.members || [];
      setMembers(groupMembers);
      setSelectedMemberIds(
        groupMembers.filter((m) => !!m.employee)?.map((m) => m.employee!.id) ||
          []
      );
      if (!employeesOptions.length) await fetchEmployeesSimple();
    } catch (e) {
      toast.error(t('common.error'));
    } finally {
      setLoadingMembers(false);
    }
  };

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = members
        .filter((m) => !!m.employee)
        .map((m) => m.employee!.id);
      setSelectedMemberIds(allIds);
    } else {
      setSelectedMemberIds([]);
    }
  };

  const toggleMember = (empId: number | string, checked: boolean) => {
    setSelectedMemberIds((prev) => {
      const set = new Set(prev);
      if (checked) set.add(empId);
      else set.delete(empId);
      return Array.from(set);
    });
  };

  const addEmployeeToListById = (idVal: number | string) => {
    const exists = members.some(
      (m) => String(m.employee?.id ?? m.employeeId) === String(idVal)
    );
    const emp = employeesOptions.find((e) => String(e.id) === String(idVal));
    if (!exists && emp) {
      setMembers((prev) => [
        ...prev,
        {
          id: `temp-${Date.now()}`,
          employeeId: emp.id,
          isManager: false,
          employee: {
            id: emp.id,
            firstName: emp.firstName,
            lastName: emp.lastName,
            matricule: emp.matricule
          }
        }
      ]);
      setSelectedMemberIds((prev) => Array.from(new Set([...prev, emp.id])));
    }
  };
  const handleAddFromForm = () => {
    const val = addMemberForm.getValues('employeeId');
    if (!val) return;
    const num =
      typeof val === 'string' && /^\d+$/.test(val) ? Number(val) : val;
    addEmployeeToListById(num);
    addMemberForm.reset({ employeeId: '' });
  };

  const saveMembers = async () => {
    if (!activeGroup) return;
    try {
      setSavingMembers(true);
      const payload = {
        members: members
          .filter((m) =>
            selectedMemberIds.includes(m.employee?.id ?? m.employeeId)
          )
          .map((m) => ({
            employeeId: m.employee?.id ?? m.employeeId,
            isManager: m.isManager
          }))
      };
      await apiClient.put(
        apiRoutes.admin.groups.updateMembers(activeGroup.id),
        payload
      );
      toast.success(t('common.saved'));
      // refresh table maybe if count displayed later
      setOpenSheet(false);
    } catch (e: any) {
      toast.error(t('common.error'));
    } finally {
      setSavingMembers(false);
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
                  onClick={() => openGroupSheet(row)}
                >
                  <Users className='h-4 w-4' />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Voir les membres</TooltipContent>
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
    [openGroupSheet, t]
  );

  const filters: CustomTableFilterConfig[] = [
    { field: 'name', label: t('common.name'), type: 'text' },
    { field: 'code', label: t('common.code'), type: 'text' }
  ];

  const handleCreate = async () => {
    const values = form.getValues();
    const result = GroupSchema.safeParse(values);
    if (!result.success) {
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
      <div className='flex justify-between'>
        <div>
          <h1 className='text-2xl font-bold'>
            {id
              ? t('groups.siegeGroupsTitle') || 'Groupes du siège'
              : t('groups.allGroupsTitle') || 'Tous les groupes'}
          </h1>
          <p className='text-muted-foreground'>
            {id
              ? t('groups.siegeGroupsDescription') ||
                'Gérez les groupes associés à ce siège.'
              : t('groups.allGroupsDescription') ||
                "Gérez tous les groupes de l'entreprise."}
          </p>
        </div>
        <div>
          {id ? (
            <div className='flex items-center justify-end gap-2'>
              <Button
                variant='outline'
                onClick={() => router.push('/admin/sieges-groupes')}
                className='gap-1'
                size='sm'
              >
                <ArrowLeft className='h-4 w-4' /> Retour aux sièges
              </Button>
              <Button onClick={onOpenCreate} className='gap-1' size='sm'>
                <Plus className='h-4 w-4' /> Créer un groupe
              </Button>
            </div>
          ) : (
            <Card className='border-border/70 from-primary/5 to-accent/10 bg-gradient-to-br'>
              <CardHeader className='py-3'>
                <div className='flex items-start justify-between gap-2'>
                  <div>
                    <CardTitle className='text-lg'>
                      {t('common.groups')}
                    </CardTitle>
                    <CardDescription>
                      Gérez les groupes associés {"à l'entreprise"}.
                    </CardDescription>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Button onClick={onOpenCreate} className='gap-1' size='sm'>
                      <Plus className='h-4 w-4' /> Créer un groupe
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          )}
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

      {/* Members Sheet */}
      <Sheet open={openSheet} onOpenChange={setOpenSheet}>
        <SheetContent side='right' className='sm:max-w-xl'>
          <SheetHeader>
            <SheetTitle className='flex items-center gap-2'>
              <Users className='h-4 w-4' /> Membres du groupe{' '}
              {activeGroup?.name}
            </SheetTitle>
            <SheetDescription>
              Cocher pour garder un membre, décocher pour l&apos;enlever. Vous
              pouvez aussi ajouter un employé.
            </SheetDescription>
          </SheetHeader>
          <div className='p-4'>
            <div className='mb-3 flex items-center justify-between'>
              {loadingMembers ? (
                <Skeleton className='h-4 w-44' />
              ) : (
                <div className='text-muted-foreground text-sm'>
                  {selectedMemberIds.length}/{members.length} sélectionné(s)
                </div>
              )}
              <div className='flex items-center gap-2'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => toggleSelectAll(true)}
                  className='gap-1'
                  disabled={loadingMembers}
                >
                  <CheckSquare className='h-4 w-4' /> Tout sélectionner
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => toggleSelectAll(false)}
                  className='gap-1'
                  disabled={loadingMembers}
                >
                  <Square className='h-4 w-4' /> Tout désélectionner
                </Button>
              </div>
            </div>

            <div className='rounded-lg border'>
              <div className='max-h-[50vh] divide-y overflow-auto'>
                {loadingMembers ? (
                  Array.from({ length: 6 }).map((_, idx) => (
                    <div
                      key={idx}
                      className='flex items-center justify-between gap-3 p-3'
                    >
                      <div className='w-full space-y-2'>
                        <Skeleton className='h-3 w-1/3' />
                        <Skeleton className='h-2 w-1/5' />
                      </div>
                      <Skeleton className='h-4 w-4 rounded' />
                    </div>
                  ))
                ) : (
                  <>
                    {members.map((m) => (
                      <div
                        key={String(m.employee?.id ?? m.id)}
                        className='flex items-center justify-between gap-3 p-3'
                      >
                        <div className='min-w-0'>
                          <div className='truncate font-medium'>
                            {m.employee
                              ? `${m.employee.firstName} ${m.employee.lastName}`
                              : `Employé #${m.employeeId}`}
                          </div>
                          {m.employee?.matricule && (
                            <div className='text-muted-foreground text-xs'>
                              Matricule: {m.employee.matricule}
                            </div>
                          )}
                        </div>
                        <div>
                          <input
                            type='checkbox'
                            className='accent-primary h-4 w-4'
                            checked={selectedMemberIds.includes(
                              m.employee?.id ?? m.employeeId
                            )}
                            onChange={(e) =>
                              toggleMember(
                                m.employee?.id ?? m.employeeId,
                                e.target.checked
                              )
                            }
                          />
                        </div>
                      </div>
                    ))}
                    {members.length === 0 && (
                      <div className='text-muted-foreground p-6 text-center text-sm'>
                        Aucun membre pour ce groupe
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            <Separator className='my-4' />

            <div className='grid grid-cols-1 gap-3'>
              <div className='text-sm font-medium'>Ajouter un employé</div>
              <SelectField<AddMemberForm, 'employeeId'>
                name={'employeeId'}
                label={''}
                control={addMemberForm.control}
                options={employeesOptions.map((e) => ({
                  id: e.id,
                  value: String(e.id),
                  label: `${e.firstName} ${e.lastName}`,
                  matricule: e.matricule
                }))}
                secondaryField='matricule'
                placeholder={'Rechercher un employé'}
                className='w-full'
              />
              <div className='flex items-center gap-2'>
                <Button size='sm' onClick={handleAddFromForm} className='gap-1'>
                  <UserPlus className='h-4 w-4' /> Ajouter
                </Button>
              </div>
            </div>
          </div>
          <SheetFooter>
            <Button
              onClick={saveMembers}
              disabled={savingMembers}
              className='gap-1'
            >
              <Save className='h-4 w-4' />{' '}
              {savingMembers ? 'Enregistrement...' : 'Enregistrer les membres'}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
