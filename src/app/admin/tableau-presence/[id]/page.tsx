'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Download,
  Edit,
  Lock,
  RefreshCw,
  UserCheck,
  Filter,
  Save,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import apiClient from '@/lib/api';
import { apiRoutes } from '@/config/apiRoutes';
import { format, getDaysInMonth } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import type {
  TableauPresence,
  TableauPresenceStatut
} from '@/features/tableau-presence/tableau-presence-listing';
import PageContainer from '@/components/layout/page-container';
import { useRef } from 'react';
import { useSidebar } from '@/components/ui/sidebar';
import { Input } from '@/components/ui/input';

interface EmployeeRow {
  id: number;
  employeeId: number;
  employee?: {
    first_name?: string;
    last_name?: string;
    matricule?: string;
  };
  [key: string]: any;
  totalHours: number;
  overtimeHours: number;
  absenceDays: number;
}

interface EditModalData {
  employeeId: number;
  employeeName: string;
  days: { [day: number]: string };
  totalHours: number;
  overtimeHours: number;
}

const STATUS_CODES = [
  { value: 'P', label: 'Présent', color: 'text-green-600 bg-green-50' },
  { value: 'HS', label: 'Heures Sup', color: 'text-blue-600 bg-blue-50' },
  { value: 'CP', label: 'Congé Payé', color: 'text-orange-600 bg-orange-50' },
  { value: 'CM', label: 'Congé Maladie', color: 'text-red-600 bg-red-50' },
  { value: 'A', label: 'Absent', color: 'text-gray-600 bg-gray-50' },
  { value: 'R', label: 'Repos', color: 'text-purple-600 bg-purple-50' },
  { value: 'F', label: 'Férié', color: 'text-yellow-600 bg-yellow-50' },
  { value: '', label: '—', color: 'text-slate-400' }
];

export default function TableauPresenceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tableauId = params?.id as string;
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';
  const [loading, setLoading] = useState(true);
  const [tableau, setTableau] = useState<TableauPresence | null>(null);
  const [employeesData, setEmployeesData] = useState<EmployeeRow[]>([]);
  const [daysData, setDaysData] = useState<any[]>([]);

  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const SELECT_ALL = '__ALL__';
  const SELECT_NONE = '__NONE__';
  const [sortColumn, setSortColumn] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState<EditModalData | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    type: 'validate-manager' | 'validate-rh' | 'close' | 'regenerate';
    title: string;
    description: string;
  } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const numDays = useMemo(() => {
    if (!tableau) return 31;
    return getDaysInMonth(new Date(tableau.annee, tableau.mois - 1));
  }, [tableau]);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollShadows = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);

  const scrollByAmount = (amount: number) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: amount, behavior: 'smooth' });
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [tableauRes, employeesRes, daysRes] = await Promise.all([
        apiClient.get(apiRoutes.admin.tableauPresence.show(tableauId)),
        apiClient.get(apiRoutes.admin.tableauPresence.employees(tableauId)),
        apiClient.get(apiRoutes.admin.tableauPresence.days(tableauId))
      ]);

      const tableauData = tableauRes.data?.data || tableauRes.data;
      const employeesRaw = employeesRes.data?.data || employeesRes.data || [];
      const daysRaw = daysRes.data?.data || daysRes.data || [];

      setTableau(tableauData);
      setDaysData(daysRaw);

      const transformed = employeesRaw.map((emp: any) => {
        const empDays = daysRaw.filter(
          (d: any) => d.employeeId === emp.employeeId
        );
        const row: EmployeeRow = {
          id: emp.id,
          employeeId: emp.employeeId,
          employee: emp.employee,
          totalHours: emp.totalHours ?? 0,
          overtimeHours: emp.overtimeHours ?? 0,
          absenceDays: emp.absenceDays ?? 0
        };

        for (
          let day = 1;
          day <=
          getDaysInMonth(new Date(tableauData.annee, tableauData.mois - 1));
          day++
        ) {
          const dateStr = `${tableauData.annee}-${String(tableauData.mois).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const dayData = empDays.find((d: any) => d.date === dateStr);
          row[`day_${day}`] = dayData?.statusCode || '';
        }

        return row;
      });

      setEmployeesData(transformed);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Erreur lors du chargement');
      router.push('/admin/tableau-presence');
    } finally {
      setLoading(false);
    }
  }, [tableauId, router]);

  useEffect(() => {
    if (tableauId) {
      loadData();
    }
  }, [tableauId, loadData]);

  const handleEdit = useCallback(
    (row: EmployeeRow) => {
      if (tableau?.locked) {
        toast.error('Tableau verrouillé');
        return;
      }

      const days: { [day: number]: string } = {};
      for (let day = 1; day <= numDays; day++) {
        days[day] = (row[`day_${day}`] as string) || '';
      }

      setEditData({
        employeeId: row.employeeId,
        employeeName:
          `${row.employee?.first_name || ''} ${row.employee?.last_name || ''}`.trim(),
        days,
        totalHours: Number(row.totalHours || 0),
        overtimeHours: Number(row.overtimeHours || 0)
      });
      setShowEditModal(true);
    },
    [tableau?.locked, numDays]
  );

  const handleSaveEdit = async () => {
    if (!editData || !tableau) return;

    setEditLoading(true);
    try {
      // 1) Mettre à jour les statuts jour par jour (sans heures)
      for (let day = 1; day <= numDays; day++) {
        const statusCode = editData.days[day] || '';
        const dateStr = `${tableau.annee}-${String(tableau.mois).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const existingDay = daysData.find(
          (d) => d.employeeId === editData.employeeId && d.date === dateStr
        );
        if (existingDay) {
          await apiClient.patch(
            apiRoutes.admin.tableauPresence.updateDay(
              tableau.id,
              existingDay.id
            ),
            { statusCode }
          );
        } else if (statusCode) {
          await apiClient.post(
            apiRoutes.admin.tableauPresence.createDay(tableau.id),
            { employeeId: editData.employeeId, date: dateStr, statusCode }
          );
        }
      }

      // 2) Mettre à jour les totaux du mois
      await apiClient.patch(
        apiRoutes.admin.tableauPresence.updateEmployee(
          tableau.id,
          editData.employeeId
        ),
        {
          totalHours: Number(editData.totalHours) || 0,
          overtimeHours: Number(editData.overtimeHours) || 0
        }
      );

      toast.success('Totaux mis à jour');
      setShowEditModal(false);
      setEditData(null);
      await loadData();
    } catch (e: any) {
      toast.error(
        e?.response?.data?.message || 'Erreur lors de la mise à jour'
      );
    } finally {
      setEditLoading(false);
    }
  };

  const handleAction = async () => {
    if (!confirmAction || !tableau) return;

    setActionLoading(true);
    try {
      switch (confirmAction.type) {
        case 'validate-manager':
          await apiClient.patch(
            apiRoutes.admin.tableauPresence.validateManager(tableau.id)
          );
          toast.success('Validé par le manager');
          break;
        case 'validate-rh':
          await apiClient.patch(
            apiRoutes.admin.tableauPresence.validateRh(tableau.id)
          );
          toast.success('Validé par RH');
          break;
        case 'close':
          await apiClient.patch(
            apiRoutes.admin.tableauPresence.close(tableau.id)
          );
          toast.success('Tableau clôturé');
          break;
        case 'regenerate':
          await apiClient.post(
            apiRoutes.admin.tableauPresence.regenerate(tableau.id)
          );
          toast.success('Tableau régénéré');
          break;
      }

      setShowConfirmDialog(false);
      setConfirmAction(null);
      await loadData();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Erreur lors de l'action");
    } finally {
      setActionLoading(false);
    }
  };

  const handleExportExcel = async () => {
    if (!tableau) return;

    try {
      const response = await apiClient.get(
        apiRoutes.admin.tableauPresence.exportExcel(tableau.id),
        { responseType: 'blob' }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `tableau_presence_${String(tableau.mois).padStart(2, '0')}_${tableau.annee}.xlsx`
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

  const openConfirmDialog = (
    type: 'validate-manager' | 'validate-rh' | 'close' | 'regenerate',
    title: string,
    description: string
  ) => {
    setConfirmAction({ type, title, description });
    setShowConfirmDialog(true);
  };

  const getStatusBadge = (statut: TableauPresenceStatut) => {
    const statusMap: Record<
      TableauPresenceStatut,
      {
        label: string;
        variant: 'default' | 'secondary' | 'destructive' | 'outline';
      }
    > = {
      BROUILLON: { label: 'Brouillon', variant: 'secondary' },
      EN_COURS: { label: 'En cours', variant: 'default' },
      VALIDE_MANAGER: { label: 'Validé Manager', variant: 'outline' },
      VALIDE_RH: { label: 'Validé RH', variant: 'outline' },
      CLOTURE: { label: 'Clôturé', variant: 'destructive' }
    };

    const status = statusMap[statut] || statusMap.BROUILLON;
    return <Badge variant={status.variant}>{status.label}</Badge>;
  };

  const getStatusColor = useCallback((code: string) => {
    const status = STATUS_CODES.find((s) => s.value === code);
    return status?.color || '';
  }, []);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const filteredData = useMemo(() => {
    let filtered = [...employeesData];

    if (selectedEmployee) {
      filtered = filtered.filter(
        (e) => String(e.employeeId) === selectedEmployee
      );
    }

    if (selectedStatus) {
      filtered = filtered.filter((e) => {
        for (let day = 1; day <= numDays; day++) {
          if (e[`day_${day}`] === selectedStatus) return true;
        }
        return false;
      });
    }

    if (sortColumn) {
      filtered.sort((a, b) => {
        const aVal = a[sortColumn] || 0;
        const bVal = b[sortColumn] || 0;
        if (sortDirection === 'asc') {
          return aVal > bVal ? 1 : -1;
        } else {
          return aVal < bVal ? 1 : -1;
        }
      });
    }

    return filtered;
  }, [
    employeesData,
    selectedEmployee,
    selectedStatus,
    numDays,
    sortColumn,
    sortDirection
  ]);

  useEffect(() => {
    // Initial shadows + listener
    const el = scrollRef.current;
    updateScrollShadows();
    if (!el) return;
    const onScroll = () => updateScrollShadows();
    el.addEventListener('scroll', onScroll);
    const ro = new ResizeObserver(() => updateScrollShadows());
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', onScroll);
      ro.disconnect();
    };
  }, [updateScrollShadows]);

  if (loading) {
    return (
      <div className='flex h-[60vh] items-center justify-center'>
        <div className='text-center'>
          <RefreshCw className='text-primary mx-auto h-8 w-8 animate-spin' />
          <p className='text-muted-foreground mt-3 text-sm'>Chargement...</p>
        </div>
      </div>
    );
  }

  if (!tableau) {
    return (
      <div className='flex h-[60vh] items-center justify-center'>
        <div className='text-center'>
          <p className='text-lg font-semibold'>Tableau introuvable</p>
          <Button
            onClick={() => router.push('/admin/tableau-presence')}
            className='mt-4'
          >
            <ArrowLeft className='mr-2 h-4 w-4' />
            Retour
          </Button>
        </div>
      </div>
    );
  }

  return (
    <PageContainer scrollable={true} className='w-full'>
      <div
        className='w-full space-y-4 pb-8'
        style={{ minWidth: '100%', maxWidth: isCollapsed ? '90vw' : '67vw' }}
      >
        {/* Header compact */}
        <div className='relative overflow-hidden rounded-lg border bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 dark:from-blue-950 dark:via-slate-900 dark:to-purple-950'>
          <div className='relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
            <div className='flex items-center gap-3'>
              <Button
                variant='ghost'
                size='icon'
                onClick={() => router.push('/admin/tableau-presence')}
                className='h-9 w-9'
              >
                <ArrowLeft className='h-4 w-4' />
              </Button>
              <div className='flex-1'>
                <div className='flex items-center gap-2'>
                  <Calendar className='text-primary h-5 w-5' />
                  <h1 className='text-xl font-bold tracking-tight'>
                    {format(
                      new Date(tableau.annee, tableau.mois - 1),
                      'MMMM yyyy',
                      { locale: fr }
                    )}
                  </h1>
                </div>
                <div className='mt-1.5 flex flex-wrap items-center gap-2'>
                  {getStatusBadge(tableau.statut)}
                  {tableau.locked && (
                    <Badge variant='destructive' className='gap-1'>
                      <Lock className='h-3 w-3' />
                      Verrouillé
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className='flex flex-wrap items-center gap-2'>
              <Button variant='outline' size='sm' onClick={handleExportExcel}>
                <Download className='mr-2 h-3.5 w-3.5' />
                Exporter
              </Button>

              {!tableau.locked && tableau.statut !== 'CLOTURE' && (
                <>
                  {tableau.statut === 'EN_COURS' && (
                    <Button
                      size='sm'
                      onClick={() =>
                        openConfirmDialog(
                          'validate-manager',
                          'Valider Manager',
                          'Valider le tableau par le manager.'
                        )
                      }
                    >
                      <CheckCircle className='mr-2 h-3.5 w-3.5' />
                      Valider Manager
                    </Button>
                  )}

                  {(tableau.statut === 'VALIDE_MANAGER' ||
                    tableau.statut === 'EN_COURS') && (
                    <Button
                      size='sm'
                      onClick={() =>
                        openConfirmDialog(
                          'validate-rh',
                          'Valider RH',
                          'Valider le tableau par RH.'
                        )
                      }
                    >
                      <UserCheck className='mr-2 h-3.5 w-3.5' />
                      Valider RH
                    </Button>
                  )}

                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() =>
                      openConfirmDialog(
                        'regenerate',
                        'Régénérer',
                        'Recalculer toutes les données.'
                      )
                    }
                  >
                    <RefreshCw className='mr-2 h-3.5 w-3.5' />
                    Régénérer
                  </Button>

                  <Button
                    variant='destructive'
                    size='sm'
                    onClick={() =>
                      openConfirmDialog(
                        'close',
                        'Clôturer',
                        'Action irréversible.'
                      )
                    }
                  >
                    <Lock className='mr-2 h-3.5 w-3.5' />
                    Clôturer
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Légende compacte */}
        <Card className='border-l-primary border-l-4 py-0'>
          <CardContent className='py-1.5'>
            <div className='flex flex-wrap gap-1.5'>
              {STATUS_CODES.filter((s) => s.value).map((status) => (
                <span
                  key={status.value}
                  className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${status.color}`}
                >
                  <span className='font-bold'>{status.value}</span>
                  <span className='mx-1'>—</span>
                  <span>{status.label}</span>
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tableau avec filtres intégrés */}
        <Card className='py-0'>
          <CardContent className='p-0'>
            {/* Barre de filtres au-dessus du tableau */}
            <div className='bg-muted/30 border-b px-4 py-3'>
              <div className='flex flex-wrap items-center gap-3'>
                <div className='flex items-center gap-2'>
                  <Filter className='text-muted-foreground h-4 w-4' />
                  <span className='text-sm font-medium'>Filtres:</span>
                </div>

                <div className='flex items-center gap-2'>
                  <Label className='text-muted-foreground text-xs whitespace-nowrap'>
                    Employé:
                  </Label>
                  <Select
                    value={
                      selectedEmployee === '' ? SELECT_ALL : selectedEmployee
                    }
                    onValueChange={(val) =>
                      setSelectedEmployee(val === SELECT_ALL ? '' : val)
                    }
                  >
                    <SelectTrigger className='h-8 w-[180px] text-xs'>
                      <SelectValue placeholder='Tous' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={SELECT_ALL}>
                        Tous les employés
                      </SelectItem>
                      {employeesData.map((e) => (
                        <SelectItem
                          key={e.employeeId}
                          value={String(e.employeeId)}
                        >
                          {`${e.employee?.first_name || ''} ${e.employee?.last_name || ''}`.trim()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className='flex items-center gap-2'>
                  <Label className='text-muted-foreground text-xs whitespace-nowrap'>
                    Statut:
                  </Label>
                  <Select
                    value={selectedStatus === '' ? SELECT_ALL : selectedStatus}
                    onValueChange={(val) =>
                      setSelectedStatus(val === SELECT_ALL ? '' : val)
                    }
                  >
                    <SelectTrigger className='h-8 w-[140px] text-xs'>
                      <SelectValue placeholder='Tous' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={SELECT_ALL}>
                        Tous les statuts
                      </SelectItem>
                      {STATUS_CODES.filter((s) => s.value).map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {(selectedEmployee || selectedStatus) && (
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => {
                      setSelectedEmployee('');
                      setSelectedStatus('');
                    }}
                    className='h-8 text-xs'
                  >
                    <X className='mr-1 h-3 w-3' />
                    Réinitialiser
                  </Button>
                )}
              </div>
            </div>

            {/* Tableau scrollable avec largeur fixe */}
            <div className='relative'>
              {/* Boutons de scroll horizontaux */}
              {canScrollLeft && (
                <div className='from-background pointer-events-none absolute top-0 left-0 z-20 h-full w-8 bg-gradient-to-r to-transparent' />
              )}
              {canScrollRight && (
                <div className='from-background pointer-events-none absolute top-0 right-0 z-20 h-full w-8 bg-gradient-to-l to-transparent' />
              )}

              <button
                type='button'
                aria-label='Défiler à gauche'
                onClick={() => scrollByAmount(-320)}
                className={`bg-background/90 absolute top-1/2 left-2 z-30 -translate-y-1/2 rounded-full border p-2 shadow transition-opacity ${canScrollLeft ? 'opacity-100' : 'opacity-0'} hover:bg-background`}
              >
                ‹
              </button>
              <button
                type='button'
                aria-label='Défiler à droite'
                onClick={() => scrollByAmount(320)}
                className={`bg-background/90 absolute top-1/2 right-2 z-30 -translate-y-1/2 rounded-full border p-2 shadow transition-opacity ${canScrollRight ? 'opacity-100' : 'opacity-0'} hover:bg-background`}
              >
                ›
              </button>

              <div ref={scrollRef} className='overflow-x-auto'>
                <Table className='whitespace-nowrap'>
                  <TableHeader>
                    <TableRow>
                      <TableHead className='bg-background sticky left-0 z-10 min-w-[200px]'>
                        Employé
                      </TableHead>
                      {Array.from({ length: numDays }, (_, i) => i + 1).map(
                        (day) => (
                          <TableHead
                            key={day}
                            className='min-w-[50px] text-center'
                          >
                            {String(day).padStart(2, '0')}
                          </TableHead>
                        )
                      )}
                      <TableHead
                        className='hover:bg-muted/50 min-w-[80px] cursor-pointer text-center'
                        onClick={() => handleSort('totalHours')}
                      >
                        <div className='flex items-center justify-center gap-1'>
                          Total H
                          {sortColumn === 'totalHours' && (
                            <span className='text-xs'>
                              {sortDirection === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </TableHead>
                      <TableHead
                        className='hover:bg-muted/50 min-w-[70px] cursor-pointer text-center'
                        onClick={() => handleSort('overtimeHours')}
                      >
                        <div className='flex items-center justify-center gap-1'>
                          HS
                          {sortColumn === 'overtimeHours' && (
                            <span className='text-xs'>
                              {sortDirection === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </TableHead>
                      <TableHead
                        className='hover:bg-muted/50 min-w-[70px] cursor-pointer text-center'
                        onClick={() => handleSort('absenceDays')}
                      >
                        <div className='flex items-center justify-center gap-1'>
                          Abs
                          {sortColumn === 'absenceDays' && (
                            <span className='text-xs'>
                              {sortDirection === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </TableHead>
                      <TableHead className='bg-background sticky right-0 z-10 min-w-[120px] text-center'>
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={numDays + 5}
                          className='text-muted-foreground h-24 text-center'
                        >
                          Aucun employé trouvé
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredData.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell className='bg-background sticky left-0 z-10'>
                            <div className='flex flex-col'>
                              <span className='text-sm font-semibold'>
                                {row.employee?.first_name}{' '}
                                {row.employee?.last_name}
                              </span>
                              <span className='text-muted-foreground text-xs'>
                                {row.employee?.matricule}
                              </span>
                            </div>
                          </TableCell>
                          {Array.from({ length: numDays }, (_, i) => i + 1).map(
                            (day) => {
                              const code = row[`day_${day}`] as string;
                              return (
                                <TableCell
                                  key={day}
                                  className='p-2 text-center'
                                >
                                  {code ? (
                                    <span
                                      className={`inline-flex items-center justify-center rounded px-1.5 py-0.5 text-xs font-medium ${getStatusColor(code)}`}
                                    >
                                      {code}
                                    </span>
                                  ) : (
                                    <span className='text-slate-300'>—</span>
                                  )}
                                </TableCell>
                              );
                            }
                          )}
                          <TableCell className='text-center'>
                            <span className='font-semibold text-blue-600'>
                              {row.totalHours || 0}h
                            </span>
                          </TableCell>
                          <TableCell className='text-center'>
                            <span className='font-semibold text-orange-600'>
                              {row.overtimeHours || 0}h
                            </span>
                          </TableCell>
                          <TableCell className='text-center'>
                            <span className='font-semibold text-red-600'>
                              {row.absenceDays || 0}j
                            </span>
                          </TableCell>
                          <TableCell className='bg-background sticky right-0 z-10 text-center'>
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() => handleEdit(row)}
                              disabled={tableau?.locked}
                              className='h-8'
                            >
                              <Edit className='mr-1 h-3 w-3' />
                              Modifier
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Modal d'édition */}
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent className='max-h-[90vh] max-w-4xl overflow-y-auto'>
            <DialogHeader>
              <DialogTitle>
                Modifier les totaux - {editData?.employeeName}
              </DialogTitle>
              <DialogDescription>
                Saisissez le total d&apos;heures et les heures supplémentaires
                pour le mois.
              </DialogDescription>
            </DialogHeader>

            {editData && (
              <div className='space-y-6'>
                <div className='grid grid-cols-7 gap-2'>
                  {Array.from({ length: numDays }, (_, i) => i + 1).map(
                    (day) => (
                      <div key={day} className='space-y-1'>
                        <Label className='text-muted-foreground text-xs font-medium'>
                          {String(day).padStart(2, '0')}
                        </Label>
                        <Select
                          value={
                            (editData.days[day] || '') === ''
                              ? SELECT_NONE
                              : editData.days[day]
                          }
                          onValueChange={(val) => {
                            const mapped = val === SELECT_NONE ? '' : val;
                            setEditData({
                              ...editData,
                              days: { ...editData.days, [day]: mapped }
                            });
                          }}
                        >
                          <SelectTrigger className='h-9 text-xs'>
                            <SelectValue placeholder='—' />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={SELECT_NONE} className='text-xs'>
                              —
                            </SelectItem>
                            {STATUS_CODES.filter((s) => s.value).map((s) => (
                              <SelectItem
                                key={s.value}
                                value={s.value}
                                className='text-xs'
                              >
                                {s.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )
                  )}
                </div>

                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  <div className='space-y-1'>
                    <Label>Heures totales (mois)</Label>
                    <Input
                      type='number'
                      step='0.5'
                      min={0}
                      value={editData.totalHours}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          totalHours: Number(e.target.value) || 0
                        })
                      }
                    />
                  </div>
                  <div className='space-y-1'>
                    <Label>Heures supplémentaires (mois)</Label>
                    <Input
                      type='number'
                      step='0.5'
                      min={0}
                      value={editData.overtimeHours}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          overtimeHours: Number(e.target.value) || 0
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                variant='outline'
                onClick={() => {
                  setShowEditModal(false);
                  setEditData(null);
                }}
                disabled={editLoading}
              >
                <X className='mr-2 h-4 w-4' />
                Annuler
              </Button>
              <Button onClick={handleSaveEdit} disabled={editLoading}>
                {editLoading ? (
                  <>
                    <RefreshCw className='mr-2 h-4 w-4 animate-spin' />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className='mr-2 h-4 w-4' />
                    Enregistrer
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog de confirmation */}
        <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{confirmAction?.title}</DialogTitle>
              <DialogDescription>
                {confirmAction?.description}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant='outline'
                onClick={() => {
                  setShowConfirmDialog(false);
                  setConfirmAction(null);
                }}
                disabled={actionLoading}
              >
                Annuler
              </Button>
              <Button onClick={handleAction} disabled={actionLoading}>
                {actionLoading ? (
                  <>
                    <RefreshCw className='mr-2 h-4 w-4 animate-spin' />
                    En cours...
                  </>
                ) : (
                  'Confirmer'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageContainer>
  );
}
