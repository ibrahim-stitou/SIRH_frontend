'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Calendar as CalendarIcon,
  Clock,
  ChevronLeft,
  ChevronRight,
  Plus,
  LayoutGrid
} from 'lucide-react';
import { format, parseISO, getMonth, startOfYear, endOfYear } from 'date-fns';
import { fr } from 'date-fns/locale';
import { apiRoutes } from '@/config/apiRoutes';
import apiClient from '@/lib/api';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { useRouter } from 'next/navigation';
import { Progress } from '@/components/ui/progress';

interface Absence {
  id: number | string;
  employeeId: number | string;
  type_absence_id: number;
  type_absence?: {
    id: number;
    code: string;
    libelle: string;
    couleur_hexa?: string;
    est_remuneree?: boolean;
    deduit_compteur_conge?: boolean;
  } | null;
  date_debut: string;
  date_fin: string;
  duree: number;
  statut: 'brouillon' | 'validee' | 'annulee' | 'cloture';
  justifie: boolean;
  motif?: string;
  createdBy?: string;
}

// NEW: Conge compteur types
interface CongeCompteur {
  id: number | string;
  employee_id: number | string;
  type_absence_id: number;
  annee: number;
  solde_initial: number;
  solde_acquis: number;
  solde_utilise: number;
  solde_restant: number;
  solde_report: number;
  created_at?: string;
  updated_at?: string;
  // When enriched by API in list route
  type_absence?: {
    id: number;
    code: string;
    libelle: string;
    couleur_hexa?: string;
  } | null;
}

interface EmployeeAbsencesProps {
  employeeId: number | string;
}

const MONTHS = [
  'Jan',
  'Fév',
  'Mar',
  'Avr',
  'Mai',
  'Jun',
  'Jul',
  'Aoû',
  'Sep',
  'Oct',
  'Nov',
  'Déc'
];

export default function EmployeeAbsences({
  employeeId
}: EmployeeAbsencesProps) {
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const router = useRouter();

  // NEW: conge compteurs state
  const [compteurs, setCompteurs] = useState<CongeCompteur[]>([]);
  const [loadingCompteurs, setLoadingCompteurs] = useState<boolean>(false);

  const loadAbsences = useCallback(async () => {
    setLoading(true);
    try {
      const startDate = startOfYear(new Date(selectedYear, 0, 1));
      const endDate = endOfYear(new Date(selectedYear, 11, 31));

      const response = await apiClient.get(apiRoutes.admin.absences.list, {
        params: {
          employeeId: employeeId,
          from: format(startDate, 'yyyy-MM-dd'),
          to: format(endDate, 'yyyy-MM-dd'),
          start: 0,
          length: 500,
          sortBy: 'date_debut',
          sortDir: 'asc'
        }
      });

      setAbsences(response.data?.data || []);
    } catch (error) {
      console.error('Erreur chargement absences:', error);
    } finally {
      setLoading(false);
    }
  }, [employeeId, selectedYear]);

  // NEW: load conge compteurs by employee
  const loadCompteurs = useCallback(async () => {
    setLoadingCompteurs(true);
    try {
      const response = await apiClient.get(
        apiRoutes.admin.conges.congeCompteurs.compteursByEmployee(employeeId as number | string)
      );
      const list: CongeCompteur[] = response.data?.data || [];
      console.log('Compteurs raw:', list);
      // Filter by selected year on client side
      setCompteurs(list.filter((c) => Number(c.annee) === Number(selectedYear)));
    } catch (error) {
      console.error('Erreur chargement compteurs de congés:', error);
      setCompteurs([]);
    } finally {
      setLoadingCompteurs(false);
    }
  }, [employeeId, selectedYear]);

  useEffect(() => {
    loadAbsences();
  }, [loadAbsences]);

  // NEW: effect to load compteurs when year or employee changes
  useEffect(() => {
    loadCompteurs();
  }, [loadCompteurs]);

  const absencesByMonth = useMemo(() => {
    const grouped: { [key: number]: Absence[] } = {};
    for (let i = 0; i < 12; i++) {
      grouped[i] = [];
    }
    absences.forEach((absence) => {
      const month = getMonth(parseISO(absence.date_debut));
      grouped[month].push(absence);
    });
    return grouped;
  }, [absences]);

  const totals = useMemo(() => {
    const total = absences.length;
    const jours = absences.reduce((sum, a) => sum + (a.duree || 0), 0);
    const validees = absences.filter((a) => a.statut === 'validee').length;
    return { total, jours, validees };
  }, [absences]);

  // NEW: compute compteur summary
  const compteurSummary = useMemo(() => {
    const totalInitial = compteurs.reduce((s, c) => s + (c.solde_initial || 0), 0);
    const totalAcquis = compteurs.reduce((s, c) => s + (c.solde_acquis || 0), 0);
    const totalUtilise = compteurs.reduce((s, c) => s + (c.solde_utilise || 0), 0);
    const totalRestant = compteurs.reduce((s, c) => s + (c.solde_restant || 0), 0);
    const totalReport = compteurs.reduce((s, c) => s + (c.solde_report || 0), 0);
    return { totalInitial, totalAcquis, totalUtilise, totalRestant, totalReport };
  }, [compteurs]);

  // NEW: deduplicate counters per type/year (choose latest updated)
  const dedupedCompteurs = useMemo(() => {
    const map = new Map<string, CongeCompteur>();
    compteurs.forEach((c) => {
      const key = `${c.type_absence_id}-${c.annee}`;
      const existing = map.get(key);
      if (!existing) {
        map.set(key, c);
      } else {
        const existingUpdated = existing.updated_at ? Date.parse(existing.updated_at) : 0;
        const currentUpdated = c.updated_at ? Date.parse(c.updated_at) : 0;
        if (currentUpdated >= existingUpdated) {
          map.set(key, c);
        }
      }
    });
    return Array.from(map.values());
  }, [compteurs]);

  const renderMiniAbsenceCard = (absence: Absence) => {
    const bgColor = absence.type_absence?.couleur_hexa || '#94a3b8';
    const dateDebut = parseISO(absence.date_debut);
    const dateFin = parseISO(absence.date_fin);

    return (
      <TooltipProvider key={absence.id}>
        <Tooltip delayDuration={150}>
          <TooltipTrigger asChild>
            <button
              className='group relative w-full cursor-pointer overflow-hidden rounded-xl border p-2.5 text-center shadow-md transition-all duration-200 hover:scale-[1.02] hover:shadow-xl active:scale-95 md:p-3'
              style={{
                borderColor: `${bgColor}40`,
                backgroundColor: `${bgColor}10`,
                minHeight: '75px',
                WebkitTapHighlightColor: 'transparent'
              }}
              type='button'
              aria-label={`${absence.type_absence?.libelle} du ${format(dateDebut, 'dd MMM', { locale: fr })} - ${absence.duree} jour${absence.duree > 1 ? 's' : ''}`}
            >
              {/* Badge statut - Plus petit et discret */}
              <div className='absolute top-1.5 right-1.5'>
                <div
                  className={cn(
                    'h-2 w-2 rounded-full shadow-sm ring-1 ring-white/50',
                    absence.statut === 'validee' && 'bg-emerald-500',
                    absence.statut === 'brouillon' && 'bg-amber-500',
                    absence.statut === 'cloture' && 'bg-blue-500',
                    absence.statut === 'annulee' && 'bg-rose-500'
                  )}
                />
              </div>

              {/* Effet hover - Plus subtil */}
              <div className='absolute inset-0 bg-gradient-to-br from-white/5 to-black/5 opacity-0 transition-opacity group-hover:opacity-100' />
              {/* Contenu */}
              <div className='relative flex h-full flex-col items-center justify-center space-y-1.5'>
                <div className='flex items-center justify-center gap-1.5'>
                  <span
                    className='truncate text-[11px] leading-none font-extrabold tracking-wide'
                    style={{ color: bgColor }}
                  >
                    {absence.type_absence?.code}
                  </span>
                </div>
                <div className='text-foreground text-[11px] leading-tight font-semibold'>
                  {format(dateDebut, 'dd MMM', { locale: fr })}
                </div>
                <div className='bg-background/80 flex items-center justify-center gap-1 rounded-full px-2 py-0.5 shadow-sm ring-1 ring-black/5'>
                  <Clock className='text-muted-foreground h-2.5 w-2.5 flex-shrink-0' />
                  <span className='text-foreground text-[10px] font-black tabular-nums'>
                    {absence.duree}j
                  </span>
                </div>
              </div>
            </button>
          </TooltipTrigger>
          <TooltipContent
            side='top'
            align='center'
            sideOffset={8}
            className='bg-card max-w-[280px] overflow-hidden rounded-2xl border-2 p-0 shadow-2xl sm:max-w-sm'
            style={{ borderColor: `${bgColor}60` }}
          >
            <div className='space-y-0'>
              {/* Header */}
              <div
                className='relative flex items-center gap-3 p-4'
                style={{
                  background: `linear-gradient(135deg, ${bgColor}20 0%, ${bgColor}08 100%)`
                }}
              >
                {/* Barre latérale */}
                <div
                  className='absolute top-0 left-0 h-full w-1.5 rounded-l-2xl'
                  style={{ backgroundColor: bgColor }}
                />

                <div
                  className='flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl shadow-lg ring-2 ring-white/50'
                  style={{ backgroundColor: bgColor }}
                >
                  <CalendarIcon className='h-6 w-6 text-white drop-shadow-sm' />
                </div>
                <div className='min-w-0 flex-1'>
                  <div className='text-foreground truncate text-sm font-bold'>
                    {absence.type_absence?.libelle}
                  </div>
                  <div
                    className='truncate text-xs font-semibold'
                    style={{ color: bgColor }}
                  >
                    {absence.type_absence?.code}
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className='space-y-2 p-3'>
                {/* Dates */}
                <div className='bg-muted/30 space-y-1 rounded-lg p-2'>
                  <div className='flex items-center gap-1.5 text-xs'>
                    <span className='text-muted-foreground font-medium'>
                      Du
                    </span>
                    <span className='text-foreground flex-1 truncate font-semibold'>
                      {format(dateDebut, 'dd MMM yyyy', { locale: fr })}
                    </span>
                  </div>
                  <div className='flex items-center gap-1.5 text-xs'>
                    <span className='text-muted-foreground font-medium'>
                      Au
                    </span>
                    <span className='text-foreground flex-1 truncate font-semibold'>
                      {format(dateFin, 'dd MMM yyyy', { locale: fr })}
                    </span>
                  </div>
                  <div className='mt-1.5 flex items-center gap-1.5 border-t pt-1.5'>
                    <Clock className='text-muted-foreground h-3 w-3 flex-shrink-0' />
                    <span className='text-foreground text-xs font-bold tabular-nums'>
                      {absence.duree} jour{absence.duree > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                {/* Motif */}
                {absence.motif && (
                  <div
                    className='bg-muted/20 rounded-lg border-l-4 p-2'
                    style={{ borderColor: bgColor }}
                  >
                    <div className='text-muted-foreground mb-0.5 text-[10px] font-medium tracking-wide uppercase'>
                      Motif
                    </div>
                    <div className='text-foreground text-xs leading-tight font-medium'>
                      {absence.motif}
                    </div>
                  </div>
                )}

                {/* Statut */}
                <div className='flex justify-center pt-1'>
                  <Badge
                    variant='outline'
                    className={cn(
                      'text-xs font-semibold',
                      absence.statut === 'validee' &&
                        'border-emerald-500 bg-emerald-50 text-emerald-700',
                      absence.statut === 'brouillon' &&
                        'border-amber-500 bg-amber-50 text-amber-700',
                      absence.statut === 'cloture' &&
                        'border-blue-500 bg-blue-50 text-blue-700',
                      absence.statut === 'annulee' &&
                        'border-rose-500 bg-rose-50 text-rose-700'
                    )}
                  >
                    {absence.statut === 'validee' && '✓ Validée'}
                    {absence.statut === 'brouillon' && '○ Brouillon'}
                    {absence.statut === 'cloture' && '● Clôturée'}
                    {absence.statut === 'annulee' && '✕ Annulée'}
                  </Badge>
                </div>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  if (loading) {
    return (
      <Card className='overflow-hidden shadow-md'>
        <CardHeader className='from-muted/50 to-background border-b bg-gradient-to-br p-4 md:p-6'>
          <div className='flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between'>
            <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6'>
              <div>
                <div className='bg-muted mb-2 h-6 w-32 animate-pulse rounded md:w-40' />
                <div className='bg-muted h-3 w-36 animate-pulse rounded md:w-48' />
              </div>
              <div className='flex flex-wrap items-center gap-2'>
                <div className='bg-muted h-8 w-16 animate-pulse rounded-lg' />
                <div className='bg-muted h-8 w-16 animate-pulse rounded-lg' />
                <div className='bg-muted h-8 w-20 animate-pulse rounded-lg' />
              </div>
            </div>
            <div className='flex items-center gap-2'>
              <div className='bg-muted h-8 w-32 animate-pulse rounded-lg' />
              <div className='bg-muted h-8 w-16 animate-pulse rounded-lg' />
            </div>
          </div>
        </CardHeader>
        <CardContent className='p-4 md:p-6'>
          <div className='overflow-x-auto'>
            <div className='flex min-w-max gap-3'>
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className='w-28'>
                  <div className='bg-muted mb-3 h-16 animate-pulse rounded-lg' />
                  <div className='space-y-2'>
                    {Array.from({ length: 3 }).map((_, j) => (
                      <div
                        key={j}
                        className='bg-muted h-20 animate-pulse rounded-lg'
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='overflow-hidden py-0 shadow-md transition-shadow hover:shadow-lg'>
      <CardHeader className='from-muted/50 to-background border-b bg-gradient-to-br p-4 md:p-6'>
        {/* Titre et description */}
        <div className='mb-4'>
          <CardTitle className='flex items-center gap-2.5 text-lg font-bold md:text-xl'>
            <div className='bg-primary/10 flex h-8 w-8 items-center justify-center rounded-lg md:h-9 md:w-9'>
              <CalendarIcon className='text-primary h-4 w-4 md:h-5 md:w-5' />
            </div>
            <span>Absences {selectedYear}</span>
          </CardTitle>
          <p className='text-muted-foreground mt-1 ml-10 text-xs font-medium md:ml-11'>
            Aperçu chronologique de l&apos;année
          </p>
        </div>

        {/* Stats et contrôles sur une ligne */}
        <div className='flex flex-wrap items-center justify-between gap-3'>
          {/* Stats */}
          <div className='flex flex-wrap items-center gap-2'>
            <div className='bg-primary/5 ring-primary/10 flex items-center gap-1.5 rounded-lg px-3 py-1.5 ring-1'>
              <span className='text-muted-foreground text-xs font-medium'>
                Total
              </span>
              <span className='text-primary text-sm font-bold tabular-nums'>
                {totals.total}
              </span>
            </div>
            <div className='flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 ring-1 ring-emerald-200'>
              <span className='text-xs font-medium text-emerald-700'>
                Jours
              </span>
              <span className='text-sm font-bold text-emerald-600 tabular-nums'>
                {totals.jours}
              </span>
            </div>
            <div className='flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 ring-1 ring-blue-200'>
              <span className='text-xs font-medium text-blue-700'>Valid.</span>
              <span className='text-sm font-bold text-blue-600 tabular-nums'>
                {totals.validees}
              </span>
            </div>
          </div>

          {/* Contrôles année + bouton */}
          <div className='flex flex-wrap items-center gap-2'>
            <div className='bg-background ring-border flex items-center gap-1 rounded-lg p-1 shadow-sm ring-1'>
              <Button
                variant='ghost'
                size='icon'
                onClick={() => setSelectedYear((y) => y - 1)}
                className='hover:bg-primary/10 hover:text-primary h-7 w-7'
                aria-label='Année précédente'
              >
                <ChevronLeft className='h-4 w-4' />
              </Button>
              <div className='bg-primary/5 text-primary flex h-7 min-w-[60px] items-center justify-center rounded-md px-3 text-sm font-bold'>
                {selectedYear}
              </div>
              <Button
                variant='ghost'
                size='icon'
                onClick={() => setSelectedYear((y) => y + 1)}
                className='hover:bg-primary/10 hover:text-primary h-7 w-7'
                aria-label='Année suivante'
              >
                <ChevronRight className='h-4 w-4' />
              </Button>
            </div>
            <Button size='sm' className='h-8 gap-1.5 px-3 text-sm shadow-sm' onClick={()=>{router.push('/admin/absences/ajouter')}}>
              <Plus className='h-4 w-4' />
              <span className='hidden sm:inline'>Ajouter</span>
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className='from-background to-muted/10 bg-gradient-to-b p-4 md:p-6'>
        {/* NEW: Section compteurs de congés */}
        <div className='mb-6'>
          <div className='mb-3 flex items-center justify-between'>
            <div className='flex items-center gap-2.5'>
              <div className='bg-primary/10 flex h-8 w-8 items-center justify-center rounded-lg'>
                <LayoutGrid className='h-4 w-4 text-primary' />
              </div>
              <div>
                <div className='text-base font-bold'>Compteurs de congés {selectedYear}</div>
                <div className='text-muted-foreground text-xs'>Suivi des soldes par type d&apos;absence</div>
              </div>
            </div>
            {loadingCompteurs && (
              <div className='text-muted-foreground text-xs'>Chargement…</div>
            )}
          </div>

          {compteurs.length === 0 ? (
            <div className='rounded-xl border-2 border-dashed p-4 text-center text-sm text-muted-foreground'>
              Aucun compteur pour cette année
            </div>
          ) : (
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
              {dedupedCompteurs.map((c) => {
                const color = c.type_absence?.couleur_hexa || '#2563eb';
                const totalCapacity = (c.solde_initial || 0) + (c.solde_acquis || 0) + (c.solde_report || 0);
                const used = Math.min(c.solde_utilise || 0, totalCapacity);
                const remaining = Math.max(totalCapacity - used, 0);
                const progressValue = totalCapacity > 0 ? Math.round((used / totalCapacity) * 100) : 0;
                return (
                  <div
                    key={c.id}
                    className='group relative overflow-hidden rounded-2xl border p-4 shadow-sm transition-all hover:shadow-md'
                    style={{ borderColor: `${color}33`, backgroundColor: `${color}0a` }}
                  >
                    <div className='absolute inset-0 opacity-0 transition-opacity group-hover:opacity-5' style={{ background: `linear-gradient(135deg, ${color} 0%, transparent 100%)` }} />

                    <div className='mb-3 flex items-center gap-3'>
                      <div className='flex h-10 w-10 items-center justify-center rounded-xl text-white shadow ring-2 ring-white/40' style={{ backgroundColor: color }}>
                        <CalendarIcon className='h-5 w-5' />
                      </div>
                      <div className='min-w-0'>
                        <div className='truncate text-sm font-bold text-foreground'>{c.type_absence?.libelle || 'Type absence'}</div>
                        <div className='truncate text-xs font-semibold' style={{ color }}>{c.type_absence?.code || `#${c.type_absence_id}`}</div>
                      </div>
                      <Badge variant='outline' className='ml-auto text-[10px] font-semibold' style={{ borderColor: `${color}66`, color }}>
                        {selectedYear}
                      </Badge>
                    </div>

                    <div className='space-y-2'>
                      <Progress value={progressValue} className='h-2' />
                      <div className='flex items-center justify-between text-[11px] text-muted-foreground'>
                        <div className='flex items-center gap-1'>
                          <span>Utilisé</span>
                          <span className='text-foreground font-bold tabular-nums'>{used}</span>
                        </div>
                        <div className='flex items-center gap-1'>
                          <span>Capacité</span>
                          <span className='text-foreground font-bold tabular-nums'>{totalCapacity}</span>
                        </div>
                        <div className='flex items-center gap-1'>
                          <span>Restant</span>
                          <span className='text-foreground font-bold tabular-nums'>{remaining}</span>
                        </div>
                      </div>
                    </div>

                    <div className='mt-3 grid grid-cols-4 gap-2'>
                      <div className='rounded-lg bg-white/40 p-2 ring-1 ring-black/5 backdrop-blur'>
                        <div className='text-[10px] font-medium text-muted-foreground'>Initial</div>
                        <div className='text-sm font-bold text-foreground tabular-nums'>{c.solde_initial}</div>
                      </div>
                      <div className='rounded-lg bg-white/40 p-2 ring-1 ring-black/5 backdrop-blur'>
                        <div className='text-[10px] font-medium text-muted-foreground'>Acquis</div>
                        <div className='text-sm font-bold text-foreground tabular-nums'>{c.solde_acquis}</div>
                      </div>
                      <div className='rounded-lg bg-white/40 p-2 ring-1 ring-black/5 backdrop-blur'>
                        <div className='text-[10px] font-medium text-muted-foreground'>Report</div>
                        <div className='text-sm font-bold text-foreground tabular-nums'>{c.solde_report}</div>
                      </div>
                      <div className='rounded-lg bg-white/40 p-2 ring-1 ring-black/5 backdrop-blur'>
                        <div className='text-[10px] font-medium text-muted-foreground'>Utilisé</div>
                        <div className='text-sm font-bold text-foreground tabular-nums'>{c.solde_utilise}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Summary strip */}
          {compteurs.length > 0 && (
            <div className='mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5'>
              <div className='flex items-center gap-1.5 rounded-lg bg-primary/5 px-3 py-1.5 ring-1 ring-primary/10'>
                <span className='text-[11px] text-muted-foreground'>Initial</span>
                <span className='text-sm font-bold text-primary tabular-nums'>{compteurSummary.totalInitial}</span>
              </div>
              <div className='flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 ring-1 ring-emerald-200'>
                <span className='text-[11px] text-emerald-700'>Acquis</span>
                <span className='text-sm font-bold text-emerald-700 tabular-nums'>{compteurSummary.totalAcquis}</span>
              </div>
              <div className='flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-1.5 ring-1 ring-amber-200'>
                <span className='text-[11px] text-amber-700'>Utilisé</span>
                <span className='text-sm font-bold text-amber-700 tabular-nums'>{compteurSummary.totalUtilise}</span>
              </div>
              <div className='flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 ring-1 ring-blue-200'>
                <span className='text-[11px] text-blue-700'>Restant</span>
                <span className='text-sm font-bold text-blue-700 tabular-nums'>{compteurSummary.totalRestant}</span>
              </div>
              <div className='flex items-center gap-1.5 rounded-lg bg-violet-50 px-3 py-1.5 ring-1 ring-violet-200'>
                <span className='text-[11px] text-violet-700'>Report</span>
                <span className='text-sm font-bold text-violet-700 tabular-nums'>{compteurSummary.totalReport}</span>
              </div>
            </div>
          )}
        </div>

        {absences.length === 0 ? (
          <div className='flex flex-col items-center justify-center rounded-xl border-2 border-dashed py-12 md:py-16'>
            <div className='bg-muted/50 rounded-full p-4 md:p-6'>
              <CalendarIcon className='text-muted-foreground/40 h-12 w-12 md:h-16 md:w-16' />
            </div>
            <h3 className='mt-3 text-base font-semibold md:mt-4 md:text-lg'>
              Aucune absence en {selectedYear}
            </h3>
            <p className='text-muted-foreground mt-1 text-center text-xs md:mt-2 md:text-sm'>
              Aucune donnée à afficher pour cette année
            </p>
          </div>
        ) : (
          /* Vue Grille Responsive */
          <div className='relative'>
            <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-12'>
              {MONTHS.map((month, index) => {
                const monthAbsences = absencesByMonth[index] || [];

                return (
                  <div
                    key={index}
                    className={cn(
                      'flex flex-col transition-all duration-200',
                      monthAbsences.length === 0 &&
                        'opacity-50 hover:opacity-80'
                    )}
                  >
                    {/* Header mois - Style distinctif */}
                    <div className='mb-3'>
                      <div className='group border-primary/30 ring-primary/10 hover:border-primary/50 hover:ring-primary/20 relative overflow-hidden rounded-2xl border-2 p-3 shadow-lg ring-2 transition-all hover:shadow-xl xl:p-2.5'>
                        {/* Badge décoratif */}
                        <div className='flex flex-col items-center justify-center'>
                          <span className='text-primary text-base font-extrabold tracking-tight xl:text-sm'>
                            {month}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Liste absences - Style carte classique */}
                    <div className='flex flex-1 flex-col gap-2.5'>
                      {monthAbsences.length > 0 ? (
                        monthAbsences.slice(0, 3).map(renderMiniAbsenceCard)
                      ) : (
                        <div className='border-muted-foreground/20 from-muted/20 to-muted/5 hover:border-muted-foreground/30 hover:bg-muted/30 flex h-20 items-center justify-center rounded-xl border-2 border-dashed bg-gradient-to-br backdrop-blur-sm transition-all'>
                          <span className='text-muted-foreground/60 text-xs font-medium'>
                            —
                          </span>
                        </div>
                      )}
                      {monthAbsences.length > 3 && (
                        <div className='border-primary/30 from-primary/10 to-primary/5 text-primary hover:border-primary/40 flex items-center justify-center gap-1.5 rounded-lg border bg-gradient-to-r py-1.5 text-xs font-bold shadow-sm transition-all hover:shadow-md'>
                          <span className='bg-primary/20 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-black'>
                            +
                          </span>
                          {monthAbsences.length - 3} autres
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
