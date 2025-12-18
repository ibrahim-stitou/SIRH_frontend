'use client';

import React, { useEffect, useMemo, useState } from 'react';
import apiClient from '@/lib/api';
import { apiRoutes } from '@/config/apiRoutes';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SelectField } from '@/components/custom/SelectField';
import { useForm } from 'react-hook-form';
import {
  ChevronDown,
  ChevronRight,
  FileText,
  Calendar,
  UserSquare2,
  ClipboardList,
  Briefcase,
  Building2,
  Users,
  WandSparkles,
  List
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

// Types
type HistoryItem = {
  id: string;
  employeeId: number;
  type:
    | 'creation'
    | 'contrat'
    | 'avenant'
    | 'poste'
    | 'groupe'
    | 'siege'
    | 'cadre'
    | string;
  title: string;
  description?: string | null;
  oldValue?: string | null;
  newValue?: string | null;
  ref?: string | null;
  createdAt: string;
  updatedAt: string;
};

// Helpers
const typeMeta: Record<
  string,
  { icon: React.ReactNode; label: string; color: string }
> = {
  creation: {
    icon: <WandSparkles className='h-4 w-4' />,
    label: 'Création',
    color: 'bg-emerald-600'
  },
  contrat: {
    icon: <FileText className='h-4 w-4' />,
    label: 'Contrat',
    color: 'bg-indigo-600'
  },
  avenant: {
    icon: <ClipboardList className='h-4 w-4' />,
    label: 'Avenant',
    color: 'bg-sky-600'
  },
  poste: {
    icon: <Briefcase className='h-4 w-4' />,
    label: 'Poste',
    color: 'bg-amber-600'
  },
  groupe: {
    icon: <Users className='h-4 w-4' />,
    label: 'Groupe',
    color: 'bg-purple-600'
  },
  siege: {
    icon: <Building2 className='h-4 w-4' />,
    label: 'Siège',
    color: 'bg-pink-600'
  },
  cadre: {
    icon: <UserSquare2 className='h-4 w-4' />,
    label: 'Cadre',
    color: 'bg-rose-600'
  }
};

function formatMonth(dateStr: string) {
  try {
    const d = new Date(dateStr);
    return d.toLocaleString('fr-FR', { month: 'long', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

function formatDate(dateStr: string) {
  try {
    const d = new Date(dateStr);
    return d.toLocaleString('fr-FR');
  } catch {
    return dateStr;
  }
}

export default function EmployeHistory({ employeeId }: { employeeId: number }) {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [movementTypes, setMovementTypes] = useState<
    Array<{ code: string; label: string }>
  >([]);
  const [openCreate, setOpenCreate] = useState(false);
  const filterForm = useForm<{ type: string; q: string }>({
    defaultValues: { type: 'all', q: '' }
  });
  const createForm = useForm<{
    type: string;
    title: string;
    description?: string;
    ref?: string;
    oldValue?: string;
    newValue?: string;
  }>({
    defaultValues: {
      type: '',
      title: '',
      description: '',
      ref: '',
      oldValue: '',
      newValue: ''
    }
  });
  const typeFilter = filterForm.watch('type');
  const qFilter = filterForm.watch('q');

  useEffect(() => {
    async function fetchHistory() {
      try {
        setLoading(true);
        const resp = await apiClient.get(
          apiRoutes.admin.employees.history(employeeId)
        );
        const data = Array.isArray(resp?.data?.data) ? resp.data.data : [];
        setItems(data);
      } catch (e) {
        setItems([]);
      } finally {
        setLoading(false);
      }
    }
    if (employeeId) fetchHistory();
  }, [employeeId]);

  useEffect(() => {
    (async () => {
      try {
        const resp = await apiClient.get(
          apiRoutes.admin.employees.movementTypes
        );
        const data = Array.isArray(resp?.data?.data) ? resp.data.data : [];
        setMovementTypes(data);
      } catch {
        setMovementTypes([
          { code: 'creation', label: 'Création' },
          { code: 'contrat', label: 'Contrat' },
          { code: 'avenant', label: 'Avenant' },
          { code: 'poste', label: 'Poste' },
          { code: 'groupe', label: 'Groupe' },
          { code: 'siege', label: 'Siège' },
          { code: 'cadre', label: 'Cadre' }
        ]);
      }
    })();
  }, []);

  const refresh = async () => {
    try {
      setLoading(true);
      const resp = await apiClient.get(
        apiRoutes.admin.employees.history(employeeId)
      );
      const data = Array.isArray(resp?.data?.data) ? resp.data.data : [];
      setItems(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const submitCreate = async () => {
    const vals = createForm.getValues();
    if (!vals.type || !vals.title.trim()) {
      toast.error('Type et titre sont requis');
      return;
    }
    try {
      const resp = await apiClient.post(
        apiRoutes.admin.employees.createHistory(employeeId),
        {
          type: vals.type,
          title: vals.title,
          description: vals.description || null,
          ref: vals.ref || null,
          oldValue: vals.oldValue || null,
          newValue: vals.newValue || null
        }
      );
      if (resp?.data?.data) {
        toast.success('Mouvement créé');
        setOpenCreate(false);
        createForm.reset();
        refresh();
      } else {
        toast.error('Erreur lors de la création');
      }
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'Erreur serveur';
      toast.error(msg);
    }
  };

  const filtered = useMemo(() => {
    return (items || [])
      .filter((it) => typeFilter === 'all' || String(it.type) === typeFilter)
      .filter((it) => {
        const q = (qFilter || '').toLowerCase();
        if (!q) return true;
        return [it.title, it.description, it.oldValue, it.newValue, it.ref]
          .filter(Boolean)
          .map((s) => String(s).toLowerCase())
          .some((s) => s.includes(q));
      })
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
  }, [items, typeFilter, qFilter]);

  const groupedByMonth = useMemo(() => {
    const groups: Record<string, HistoryItem[]> = {};
    for (const it of filtered) {
      const key = formatMonth(it.createdAt);
      if (!groups[key]) groups[key] = [];
      groups[key].push(it);
    }
    return groups;
  }, [filtered]);

  const allTypes = useMemo(() => {
    const set = new Set<string>(['all']);
    items.forEach((it) => set.add(String(it.type)));
    return Array.from(set);
  }, [items]);

  const toggle = (id: string) => setExpanded((p) => ({ ...p, [id]: !p[id] }));

  return (
    <Card className='border-border/70'>
      <CardHeader className='py-3'>
        <div className='flex items-center justify-between gap-3'>
          <div className='flex items-center gap-3'>
            <div className='bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg'>
              <List className='text-primary h-5 w-5' />
            </div>
            <div>
              <h3 className='text-lg font-semibold'>Mouvements & Historique</h3>
              <p className='text-muted-foreground text-xs'>
                Timeline des événements et tableau des modifications
              </p>
            </div>
          </div>
          <div className='flex items-center gap-2'>
            {/* Filters */}
            <SelectField<{ type: string; q: string }, 'type'>
              name='type'
              label=''
              control={filterForm.control}
              options={allTypes.map((t) => ({
                label: t === 'all' ? 'Tous' : typeMeta[t]?.label || t,
                value: t
              }))}
              placeholder='Type'
              className='w-40'
            />
            <div className='w-40'>
              <Input placeholder='Rechercher…' {...filterForm.register('q')} />
            </div>
            <Button
              size='sm'
              className='gap-1'
              onClick={() => setOpenCreate(true)}
            >
              + Nouveau mouvement
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className='grid grid-cols-1 gap-4 md:grid-cols-[1.4fr_1fr]'>
        {/* Timeline */}
        <div className='space-y-6'>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className='grid grid-cols-[20px_1fr] items-start gap-3'
              >
                <Skeleton className='h-4 w-4 rounded-full' />
                <div className='space-y-2'>
                  <Skeleton className='h-3 w-56' />
                  <Skeleton className='h-2 w-44' />
                </div>
              </div>
            ))
          ) : filtered.length === 0 ? (
            <div className='text-muted-foreground text-sm'>
              Aucun historique disponible
            </div>
          ) : (
            Object.entries(groupedByMonth).map(([month, monthItems]) => (
              <div key={month}>
                <div className='bg-background/80 sticky top-0 z-10 mb-3 flex items-center gap-2 px-2 py-1 backdrop-blur-sm'>
                  <Calendar className='text-primary h-4 w-4' />
                  <span className='text-xs font-medium'>{month}</span>
                  <Badge variant='outline' className='ml-2 text-xs'>
                    {monthItems.length} événement(s)
                  </Badge>
                </div>
                <div className='relative pl-6'>
                  <div className='bg-border/70 absolute top-0 left-1 h-full w-0.5' />
                  <div className='space-y-4'>
                    {monthItems.map((it) => {
                      const meta = typeMeta[it.type] || {
                        icon: <FileText className='h-4 w-4' />,
                        label: String(it.type),
                        color: 'bg-muted-foreground'
                      };
                      const isOpen = !!expanded[it.id];
                      return (
                        <div key={it.id} className='group relative'>
                          <div className='absolute top-1 -left-[11px]'>
                            <div
                              className={`ring-background ring-2 ${meta.color} text-background flex h-5 w-5 items-center justify-center rounded-full`}
                            >
                              {meta.icon}
                            </div>
                          </div>
                          <div className='rounded-lg border p-3 shadow-sm transition group-hover:shadow'>
                            <div className='flex items-start justify-between gap-2'>
                              <div className='min-w-0'>
                                <div className='flex items-center gap-2'>
                                  <Badge
                                    className='text-xs'
                                    variant='secondary'
                                  >
                                    {meta.label}
                                  </Badge>
                                  {it.ref && (
                                    <Badge
                                      variant='outline'
                                      className='text-xs'
                                    >
                                      Ref: {it.ref}
                                    </Badge>
                                  )}
                                </div>
                                <div className='truncate font-medium'>
                                  {it.title}
                                </div>
                                {it.description && (
                                  <div className='text-muted-foreground text-xs'>
                                    {it.description}
                                  </div>
                                )}
                                <div className='text-muted-foreground mt-1 text-xs'>
                                  Le {formatDate(it.createdAt)}
                                </div>
                              </div>
                              <Button
                                variant='ghost'
                                size='sm'
                                className='gap-1'
                                onClick={() => toggle(it.id)}
                              >
                                {isOpen ? (
                                  <ChevronDown className='h-4 w-4' />
                                ) : (
                                  <ChevronRight className='h-4 w-4' />
                                )}
                                Détails
                              </Button>
                            </div>
                            {isOpen && (
                              <div className='mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2'>
                                <div className='bg-muted/40 rounded-md p-2'>
                                  <div className='text-muted-foreground text-xs'>
                                    Ancienne valeur
                                  </div>
                                  <div className='text-sm font-medium'>
                                    {it.oldValue || '—'}
                                  </div>
                                </div>
                                <div className='bg-muted/40 rounded-md p-2'>
                                  <div className='text-muted-foreground text-xs'>
                                    Nouvelle valeur
                                  </div>
                                  <div className='text-sm font-medium'>
                                    {it.newValue || '—'}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Changes Table */}
        <div className='overflow-auto rounded border'>
          <table className='w-full text-sm'>
            <thead>
              <tr className='bg-muted/40'>
                <th className='px-2 py-2 text-left'>Type</th>
                <th className='px-2 py-2 text-left'>Ancien</th>
                <th className='px-2 py-2 text-left'>Nouveau</th>
                <th className='px-2 py-2 text-left'>Réf</th>
                <th className='px-2 py-2 text-left'>Créé le</th>
                <th className='px-2 py-2 text-left'>Mis à jour</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className='border-b'>
                    <td className='px-2 py-1'>
                      <Skeleton className='h-3 w-20' />
                    </td>
                    <td className='px-2 py-1'>
                      <Skeleton className='h-3 w-28' />
                    </td>
                    <td className='px-2 py-1'>
                      <Skeleton className='h-3 w-28' />
                    </td>
                    <td className='px-2 py-1'>
                      <Skeleton className='h-3 w-24' />
                    </td>
                    <td className='px-2 py-1'>
                      <Skeleton className='h-3 w-32' />
                    </td>
                    <td className='px-2 py-1'>
                      <Skeleton className='h-3 w-32' />
                    </td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    className='text-muted-foreground px-2 py-3 text-center'
                    colSpan={6}
                  >
                    Aucune donnée
                  </td>
                </tr>
              ) : (
                filtered.map((h) => (
                  <tr key={`row-${h.id}`} className='border-b'>
                    <td className='px-2 py-1'>
                      <div className='flex items-center gap-1'>
                        <span
                          className={`inline-block h-2 w-2 rounded-full ${typeMeta[h.type]?.color || 'bg-muted-foreground'}`}
                        />
                        {typeMeta[h.type]?.label || h.type}
                      </div>
                    </td>
                    <td className='px-2 py-1'>{h.oldValue || '—'}</td>
                    <td className='px-2 py-1'>{h.newValue || '—'}</td>
                    <td className='px-2 py-1'>{h.ref || '—'}</td>
                    <td className='px-2 py-1'>{formatDate(h.createdAt)}</td>
                    <td className='px-2 py-1'>{formatDate(h.updatedAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>

      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent className='max-w-lg'>
          <DialogHeader>
            <DialogTitle>Créer un mouvement</DialogTitle>
          </DialogHeader>
          <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
            <div className='sm:col-span-2'>
              <Label className='mb-1'>
                Type <span className='text-destructive'>*</span>
              </Label>
              <SelectField<{ type: string; q: string }, 'type'>
                name={'type' as any}
                control={createForm.control as any}
                options={movementTypes.map((m) => ({
                  label: m.label,
                  value: m.code
                }))}
                placeholder={'Sélectionner un type'}
                className='w-full'
              />
            </div>
            <div className='sm:col-span-2'>
              <Label className='mb-1'>
                Titre <span className='text-destructive'>*</span>
              </Label>
              <Input
                {...createForm.register('title')}
                placeholder='Ex: Contrat CDI'
              />
            </div>
            <div className='sm:col-span-2'>
              <Label className='mb-1'>Description</Label>
              <Input
                {...createForm.register('description')}
                placeholder='Détails du mouvement'
              />
            </div>
            <div>
              <Label className='mb-1'>Référence</Label>
              <Input
                {...createForm.register('ref')}
                placeholder='Ex: CTR-1000-01'
              />
            </div>
            <div>
              <Label className='mb-1'>Ancienne valeur</Label>
              <Input
                {...createForm.register('oldValue')}
                placeholder='Ex: Groupe A'
              />
            </div>
            <div>
              <Label className='mb-1'>Nouvelle valeur</Label>
              <Input
                {...createForm.register('newValue')}
                placeholder='Ex: Groupe B'
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setOpenCreate(false)}>
              Annuler
            </Button>
            <Button onClick={submitCreate}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
