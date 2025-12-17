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
  Plus
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

interface EmployeeAbsencesProps {
  employeeId: number | string;
}

const MONTHS = [
  'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun',
  'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'
];

export default function EmployeeAbsences({ employeeId }: EmployeeAbsencesProps) {
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

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

  useEffect(() => {
    loadAbsences();
  }, [loadAbsences]);

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

  const renderMiniAbsenceCard = (absence: Absence) => {
    const bgColor = absence.type_absence?.couleur_hexa || '#94a3b8';
    const dateDebut = parseISO(absence.date_debut);
    const dateFin = parseISO(absence.date_fin);

    return (
      <TooltipProvider key={absence.id}>
        <Tooltip delayDuration={150}>
          <TooltipTrigger asChild>
            <button
              className='group relative w-full cursor-pointer overflow-hidden rounded-lg border-2 p-2 text-center shadow-sm transition-all duration-200 hover:shadow-md active:scale-95 md:p-3'
              style={{
                borderColor: bgColor,
                backgroundColor: `${bgColor}18`,
                minHeight: '70px',
                WebkitTapHighlightColor: 'transparent'
              }}
              type='button'
              aria-label={`${absence.type_absence?.libelle} du ${format(dateDebut, 'dd MMM', { locale: fr })} - ${absence.duree} jour${absence.duree > 1 ? 's' : ''}`}
            >
              {/* Badge statut */}
              <div className='absolute -right-1 -top-1'>
                <div
                  className={cn(
                    'h-3 w-3 rounded-full border-2 border-white shadow-md',
                    absence.statut === 'validee' && 'bg-emerald-500',
                    absence.statut === 'brouillon' && 'bg-amber-500',
                    absence.statut === 'cloture' && 'bg-blue-500',
                    absence.statut === 'annulee' && 'bg-rose-500'
                  )}
                />
              </div>

              {/* Effet hover */}
              <div className='absolute inset-0 bg-gradient-to-br from-white/0 to-white/20 opacity-0 transition-opacity group-hover:opacity-100' />

              {/* Contenu */}
              <div className='relative flex h-full flex-col items-center justify-center space-y-1'>
                <div className='flex items-center justify-center gap-1'>
                  <div
                    className='h-3 w-3 flex-shrink-0 rounded-full shadow-sm'
                    style={{ backgroundColor: bgColor }}
                  />
                  <span
                    className='truncate text-[10px] font-bold leading-none tracking-wide'
                    style={{ color: bgColor }}
                  >
                    {absence.type_absence?.code}
                  </span>
                </div>
                <div className='text-[10px] font-bold leading-tight text-foreground'>
                  {format(dateDebut, 'dd MMM', { locale: fr })}
                </div>
                <div className='flex items-center justify-center gap-1 rounded-full bg-background/60 px-1.5 py-0.5'>
                  <Clock className='h-2.5 w-2.5 flex-shrink-0 text-muted-foreground' />
                  <span className='text-[9px] font-bold tabular-nums text-foreground'>
                    {absence.duree}j
                  </span>
                </div>
              </div>
            </button>
          </TooltipTrigger>
          <TooltipContent
            side='top'
            align='center'
            sideOffset={5}
            className='max-w-[280px] overflow-hidden rounded-lg border-2 bg-card p-0 shadow-xl sm:max-w-sm'
            style={{ borderColor: bgColor }}
          >
            <div className='space-y-0'>
              {/* Header */}
              <div
                className='flex items-center gap-3 p-3'
                style={{
                  background: `linear-gradient(135deg, ${bgColor}15 0%, ${bgColor}05 100%)`
                }}
              >
                <div
                  className='flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg shadow-md'
                  style={{ backgroundColor: bgColor }}
                >
                  <CalendarIcon className='h-5 w-5 text-white' />
                </div>
                <div className='min-w-0 flex-1'>
                  <div className='truncate text-sm font-bold text-foreground'>
                    {absence.type_absence?.libelle}
                  </div>
                  <div className='truncate text-xs font-medium' style={{ color: bgColor }}>
                    {absence.type_absence?.code}
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className='space-y-2 p-3'>
                {/* Dates */}
                <div className='space-y-1 rounded-lg bg-muted/30 p-2'>
                  <div className='flex items-center gap-1.5 text-xs'>
                    <span className='font-medium text-muted-foreground'>Du</span>
                    <span className='flex-1 truncate font-semibold text-foreground'>
                      {format(dateDebut, 'dd MMM yyyy', { locale: fr })}
                    </span>
                  </div>
                  <div className='flex items-center gap-1.5 text-xs'>
                    <span className='font-medium text-muted-foreground'>Au</span>
                    <span className='flex-1 truncate font-semibold text-foreground'>
                      {format(dateFin, 'dd MMM yyyy', { locale: fr })}
                    </span>
                  </div>
                  <div className='mt-1.5 flex items-center gap-1.5 border-t pt-1.5'>
                    <Clock className='h-3 w-3 flex-shrink-0 text-muted-foreground' />
                    <span className='text-xs font-bold tabular-nums text-foreground'>
                      {absence.duree} jour{absence.duree > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                {/* Motif */}
                {absence.motif && (
                  <div
                    className='rounded-lg border-l-4 bg-muted/20 p-2'
                    style={{ borderColor: bgColor }}
                  >
                    <div className='mb-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground'>
                      Motif
                    </div>
                    <div className='text-xs font-medium leading-tight text-foreground'>
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
                      absence.statut === 'validee' && 'border-emerald-500 bg-emerald-50 text-emerald-700',
                      absence.statut === 'brouillon' && 'border-amber-500 bg-amber-50 text-amber-700',
                      absence.statut === 'cloture' && 'border-blue-500 bg-blue-50 text-blue-700',
                      absence.statut === 'annulee' && 'border-rose-500 bg-rose-50 text-rose-700'
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
        <CardHeader className='border-b bg-gradient-to-br from-muted/50 to-background p-4 md:p-6'>
          <div className='flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between'>
            <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6'>
              <div>
                <div className='mb-2 h-6 w-32 animate-pulse rounded bg-muted md:w-40' />
                <div className='h-3 w-36 animate-pulse rounded bg-muted md:w-48' />
              </div>
              <div className='flex flex-wrap items-center gap-2'>
                <div className='h-8 w-16 animate-pulse rounded-lg bg-muted' />
                <div className='h-8 w-16 animate-pulse rounded-lg bg-muted' />
                <div className='h-8 w-20 animate-pulse rounded-lg bg-muted' />
              </div>
            </div>
            <div className='flex items-center gap-2'>
              <div className='h-8 w-32 animate-pulse rounded-lg bg-muted' />
              <div className='h-8 w-16 animate-pulse rounded-lg bg-muted' />
            </div>
          </div>
        </CardHeader>
        <CardContent className='p-4 md:p-6'>
          <div className='overflow-x-auto'>
            <div className='flex min-w-max gap-3'>
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className='w-28'>
                  <div className='mb-3 h-16 animate-pulse rounded-lg bg-muted' />
                  <div className='space-y-2'>
                    {Array.from({ length: 3 }).map((_, j) => (
                      <div key={j} className='h-20 animate-pulse rounded-lg bg-muted' />
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
    <Card className='overflow-hidden shadow-md transition-shadow hover:shadow-lg'>
      <CardHeader className='border-b bg-gradient-to-br from-muted/50 to-background p-4 md:p-6'>
        {/* Titre et description */}
        <div className='mb-4'>
          <CardTitle className='flex items-center gap-2.5 text-lg font-bold md:text-xl'>
            <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 md:h-9 md:w-9'>
              <CalendarIcon className='h-4 w-4 text-primary md:h-5 md:w-5' />
            </div>
            <span>Absences {selectedYear}</span>
          </CardTitle>
          <p className='ml-10 mt-1 text-xs font-medium text-muted-foreground md:ml-11'>
            Aperçu chronologique de l&apos;année
          </p>
        </div>

        {/* Stats et contrôles sur une ligne */}
        <div className='flex flex-wrap items-center justify-between gap-3'>
          {/* Stats */}
          <div className='flex flex-wrap items-center gap-2'>
            <div className='flex items-center gap-1.5 rounded-lg bg-primary/5 px-3 py-1.5 ring-1 ring-primary/10'>
              <span className='text-xs font-medium text-muted-foreground'>Total</span>
              <span className='text-sm font-bold tabular-nums text-primary'>{totals.total}</span>
            </div>
            <div className='flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 ring-1 ring-emerald-200'>
              <span className='text-xs font-medium text-emerald-700'>Jours</span>
              <span className='text-sm font-bold tabular-nums text-emerald-600'>{totals.jours}</span>
            </div>
            <div className='flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 ring-1 ring-blue-200'>
              <span className='text-xs font-medium text-blue-700'>Valid.</span>
              <span className='text-sm font-bold tabular-nums text-blue-600'>{totals.validees}</span>
            </div>
          </div>

          {/* Contrôles année + bouton */}
          <div className='flex items-center gap-2'>
            <div className='flex items-center gap-1 rounded-lg bg-background p-1 shadow-sm ring-1 ring-border'>
              <Button
                variant='ghost'
                size='icon'
                onClick={() => setSelectedYear((y) => y - 1)}
                className='h-7 w-7 hover:bg-primary/10 hover:text-primary'
                aria-label='Année précédente'
              >
                <ChevronLeft className='h-4 w-4' />
              </Button>
              <div className='flex h-7 min-w-[60px] items-center justify-center rounded-md bg-primary/5 px-3 text-sm font-bold text-primary'>
                {selectedYear}
              </div>
              <Button
                variant='ghost'
                size='icon'
                onClick={() => setSelectedYear((y) => y + 1)}
                className='h-7 w-7 hover:bg-primary/10 hover:text-primary'
                aria-label='Année suivante'
              >
                <ChevronRight className='h-4 w-4' />
              </Button>
            </div>
            <Button size='sm' className='h-8 gap-1.5 px-3 text-sm shadow-sm'>
              <Plus className='h-4 w-4' />
              <span>+</span>
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className='bg-gradient-to-b from-background to-muted/10 p-4 md:p-6'>
        {absences.length === 0 ? (
          <div className='flex flex-col items-center justify-center rounded-xl border-2 border-dashed py-12 md:py-16'>
            <div className='rounded-full bg-muted/50 p-4 md:p-6'>
              <CalendarIcon className='h-12 w-12 text-muted-foreground/40 md:h-16 md:w-16' />
            </div>
            <h3 className='mt-3 text-base font-semibold md:mt-4 md:text-lg'>
              Aucune absence en {selectedYear}
            </h3>
            <p className='mt-1 text-center text-xs text-muted-foreground md:mt-2 md:text-sm'>
              Aucune donnée à afficher pour cette année
            </p>
          </div>
        ) : (
          <div className='relative'>
            {/* Timeline scrollable avec scroll snap */}
            <div className='relative overflow-x-auto overflow-y-visible rounded-lg bg-card/50 p-3 md:p-4'>
              {/* Gradients de scroll */}
              <div className='pointer-events-none absolute left-0 top-0 z-10 h-full w-6 bg-gradient-to-r from-card/80 via-card/50 to-transparent' />
              <div className='pointer-events-none absolute right-0 top-0 z-10 h-full w-6 bg-gradient-to-l from-card/80 via-card/50 to-transparent' />

              <div className='flex min-w-max gap-3 pb-2 md:gap-4' style={{ scrollSnapType: 'x proximity' }}>
                {MONTHS.map((month, index) => {
                  const monthAbsences = absencesByMonth[index] || [];

                  return (
                    <div
                      key={index}
                      className={cn(
                        'flex w-28 flex-shrink-0 flex-col transition-opacity',
                        monthAbsences.length === 0 && 'opacity-40 hover:opacity-70'
                      )}
                    >
                      {/* Header mois */}
                      <div className='sticky top-0 z-20 mb-3 bg-card/50 backdrop-blur-sm'>
                        <div className='group flex flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-primary/20 bg-gradient-to-br from-primary/10 to-background p-2.5 shadow-sm transition-all hover:shadow-md md:p-3'>
                          <span className='text-sm font-bold text-primary md:text-base'>
                            {month}
                          </span>
                          <div className='mt-1 h-0.5 w-8 rounded-full bg-primary/40 md:w-10' />
                          <div className='mt-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 md:h-6 md:w-6'>
                            <span className='text-xs font-bold text-primary'>
                              {monthAbsences.length}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Liste absences */}
                      <div className='flex flex-col gap-2'>
                        {monthAbsences.length > 0 ? (
                          monthAbsences.map(renderMiniAbsenceCard)
                        ) : (
                          <div className='flex h-20 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/20 bg-muted/10'>
                            <span className='text-xs font-medium text-muted-foreground/50'>—</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}