'use client';

import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Filter,
  User,
  Clock,
  Info
} from 'lucide-react';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  addWeeks,
  format,
  isSameMonth,
  isToday,
  startOfDay,
  endOfDay,
  parseISO
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { apiRoutes } from '@/config/apiRoutes';
import apiClient from '@/lib/api';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';

interface AbsenceEvent {
  id: number | string;
  employeeId: number | string;
  employee?: {
    id: number | string;
    firstName: string;
    lastName: string;
    matricule?: string;
  } | null;
  type_absence_id: number;
  type_absence?: {
    id: number;
    code: string;
    libelle: string;
    couleur_hexa?: string;
  } | null;
  date_debut: string;
  date_fin: string;
  duree: number;
  statut: 'brouillon' | 'validee' | 'annulee' | 'cloture';
  justifie: boolean;
  motif?: string;
}

type ViewMode = 'month' | 'week';

export default function AbsencesCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [absences, setAbsences] = useState<AbsenceEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [showLegend, setShowLegend] = useState(true);

  // Filter states
  const [absenceTypes, setAbsenceTypes] = useState<any[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<number[]>([]);
  const [selectedStatuts, setSelectedStatuts] = useState<string[]>([]);

  // Load filters data
  useEffect(() => {
    let mounted = true;

    // Load full types with colors
    apiClient
      .get(apiRoutes.admin.absences.types)
      .then((res) => {
        if (mounted) setAbsenceTypes(res.data?.data || []);
      })
      .catch(() => void 0);
    return () => {
      mounted = false;
    };
  }, []);

  // Fetch absences for current period
  useEffect(() => {
    const fetchAbsences = async () => {
      setLoading(true);
      try {
        const start = startOfWeek(startOfMonth(currentDate), {
          weekStartsOn: 1
        });
        const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 });
        const params: any = {
          from: format(start, 'yyyy-MM-dd'),
          to: format(end, 'yyyy-MM-dd'),
          start: 0,
          length: 1000 // Get all for the period
        };

        const res = await apiClient.get(apiRoutes.admin.absences.list, {
          params
        });
        setAbsences(res.data?.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAbsences();
  }, [currentDate]);

  // Filter absences
  const filteredAbsences = useMemo(() => {
    return absences.filter((abs) => {
      if (
        selectedTypes.length > 0 &&
        !selectedTypes.includes(Number(abs.type_absence_id))
      )
        return false;
      if (selectedStatuts.length > 0 && !selectedStatuts.includes(abs.statut))
        return false;
      return true;
    });
  }, [absences, selectedTypes, selectedStatuts]);

  // Navigation
  const handlePrevious = () => {
    setCurrentDate(addMonths(currentDate, -1));
  };
  const handleNext = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };
  const handleToday = () => setCurrentDate(new Date());

  // Get days to display
  const daysToDisplay = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 });
    const days: Date[] = [];
    let day = start;
    while (day <= end) {
      days.push(day);
      day = addDays(day, 1);
    }
    return days;
  }, [currentDate]);

  // Get absences for a specific day
  const getAbsencesForDay = (day: Date) => {
    return filteredAbsences.filter((abs) => {
      const start = startOfDay(parseISO(abs.date_debut));
      const end = endOfDay(parseISO(abs.date_fin));
      return day >= start && day <= end;
    });
  };

  // Render filters
  const renderFilters = () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant='outline' size='sm' className='gap-2'>
          <Filter className='h-4 w-4' />
          Filtres
          {(selectedTypes.length > 0 || selectedStatuts.length > 0) && (
            <Badge
              variant='secondary'
              className='ml-1 rounded-full px-1.5 py-0.5'
            >
              {selectedTypes.length + selectedStatuts.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-80' align='end'>
        <ScrollArea className='h-[400px]'>
          <div className='space-y-4 p-1'>
            <div>
              <h4 className='mb-3 text-sm font-semibold'>
                Types d&apos;absence
              </h4>
              <div className='space-y-2'>
                {absenceTypes.map((type) => (
                  <div key={type.id} className='flex items-center space-x-2'>
                    <Checkbox
                      id={`type-${type.id}`}
                      checked={selectedTypes.includes(type.id)}
                      onCheckedChange={(checked) => {
                        setSelectedTypes((prev) =>
                          checked
                            ? [...prev, type.id]
                            : prev.filter((id) => id !== type.id)
                        );
                      }}
                    />
                    <Label
                      htmlFor={`type-${type.id}`}
                      className='flex-1 cursor-pointer text-sm'
                    >
                      {type.code} - {type.libelle}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className='mb-3 text-sm font-semibold'>Statuts</h4>
              <div className='space-y-2'>
                {[
                  { value: 'brouillon', label: 'Brouillon' },
                  { value: 'validee', label: 'Validée' },
                  { value: 'cloture', label: 'Clôturée' },
                  { value: 'annulee', label: 'Annulée' }
                ].map((statut) => (
                  <div
                    key={statut.value}
                    className='flex items-center space-x-2'
                  >
                    <Checkbox
                      id={`statut-${statut.value}`}
                      checked={selectedStatuts.includes(statut.value)}
                      onCheckedChange={(checked) => {
                        setSelectedStatuts((prev) =>
                          checked
                            ? [...prev, statut.value]
                            : prev.filter((s) => s !== statut.value)
                        );
                      }}
                    />
                    <Label
                      htmlFor={`statut-${statut.value}`}
                      className='flex-1 cursor-pointer text-sm'
                    >
                      {statut.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {(selectedTypes.length > 0 || selectedStatuts.length > 0) && (
              <Button
                variant='outline'
                size='sm'
                className='w-full'
                onClick={() => {
                  setSelectedTypes([]);
                  setSelectedStatuts([]);
                }}
              >
                Réinitialiser
              </Button>
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );

  // Render legend
  const renderLegend = () => (
    <Card className='shadow-sm'>
      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between'>
          <CardTitle className='text-base font-semibold'>Légende</CardTitle>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => setShowLegend(!showLegend)}
            className='h-8 w-8 p-0'
          >
            <Info className='h-4 w-4' />
          </Button>
        </div>
      </CardHeader>
      {showLegend && (
        <CardContent className='space-y-3 pb-4'>
          {absenceTypes
            .sort((a: any, b: any) => (a.ordre || 0) - (b.ordre || 0))
            .map((type: any) => (
              <div
                key={type.id}
                className='hover:bg-muted/50 flex items-center gap-3 rounded-md p-2 transition-colors'
              >
                <div
                  className='h-4 w-4 flex-shrink-0 rounded-full shadow-sm'
                  style={{ backgroundColor: type.couleur_hexa || '#94a3b8' }}
                />
                <div className='flex flex-col'>
                  <span className='text-sm font-medium'>{type.code}</span>
                  <span className='text-muted-foreground text-xs'>
                    {type.libelle}
                  </span>
                </div>
              </div>
            ))}
        </CardContent>
      )}
    </Card>
  );

  // Render month view with enhanced tooltips
  const renderMonthView = () => {
    const weeks: Date[][] = [];
    for (let i = 0; i < daysToDisplay.length; i += 7) {
      weeks.push(daysToDisplay.slice(i, i + 7));
    }

    return (
      <div className='space-y-2'>
        {/* Header with day names */}
        <div className='grid grid-cols-7 gap-2 border-b pb-2'>
          {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
            <div
              key={day}
              className='text-muted-foreground text-center text-xs font-medium'
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <TooltipProvider>
          {weeks.map((week, weekIdx) => (
            <div key={weekIdx} className='grid grid-cols-7 gap-2'>
              {week.map((day, dayIdx) => {
                const dayAbsences = getAbsencesForDay(day);
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isDayToday = isToday(day);

                return (
                  <Card
                    key={dayIdx}
                    className={cn(
                      'flex min-h-[110px] flex-col overflow-hidden transition-all hover:shadow-md',
                      !isCurrentMonth && 'opacity-40',
                      isDayToday && 'ring-primary ring-2'
                    )}
                  >
                    <CardHeader className='p-2 pb-1'>
                      <div className='flex items-center justify-between'>
                        <span
                          className={cn(
                            'text-sm font-semibold',
                            isDayToday && 'text-primary'
                          )}
                        >
                          {format(day, 'd')}
                        </span>
                        {dayAbsences.length > 0 && (
                          <Badge
                            variant='secondary'
                            className={cn(
                              'h-6 rounded-full px-2 text-[10px] font-bold',
                              dayAbsences.length > 5 &&
                                'bg-orange-100 text-orange-700',
                              dayAbsences.length > 8 &&
                                'bg-red-100 text-red-700'
                            )}
                          >
                            {dayAbsences.length}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className='p-2'>
                      <div className='flex flex-wrap gap-1.5'>
                        {dayAbsences.map((abs, index) => {
                          const bgColor =
                            abs.type_absence?.couleur_hexa || '#94a3b8';
                          return (
                            <Tooltip key={abs.id} delayDuration={200}>
                              <TooltipTrigger asChild>
                                <div
                                  className='group relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-full shadow-md transition-all hover:z-10 hover:scale-125 hover:shadow-xl'
                                  style={{
                                    backgroundColor: bgColor,
                                    border: '2px solid white'
                                  }}
                                >
                                  <User className='h-4 w-4 text-white' />
                                  <div
                                    className='absolute -right-0.5 -bottom-0.5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-white text-[9px] font-bold shadow-sm'
                                    style={{ color: bgColor }}
                                  >
                                    {index + 1}
                                  </div>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent
                                side='right'
                                className='bg-card max-w-sm border-2 p-0 shadow-xl'
                                style={{ borderColor: bgColor }}
                              >
                                <div className='space-y-3 p-4'>
                                  {/* Header */}
                                  <div className='flex items-start justify-between gap-3 border-b pb-3'>
                                    <div className='flex items-center gap-3'>
                                      <div
                                        className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white shadow-md'
                                        style={{ backgroundColor: bgColor }}
                                      >
                                        {abs.employee?.firstName?.charAt(0)}
                                        {abs.employee?.lastName?.charAt(0)}
                                      </div>
                                      <div>
                                        <div className='text-foreground font-semibold'>
                                          {abs.employee?.firstName}{' '}
                                          {abs.employee?.lastName}
                                        </div>
                                        {abs.employee?.matricule && (
                                          <div className='text-muted-foreground text-xs'>
                                            {abs.employee.matricule}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    <Badge
                                      variant='outline'
                                      className={cn(
                                        'flex-shrink-0 text-xs font-medium',
                                        abs.statut === 'validee' &&
                                          'border-emerald-500 bg-emerald-50 text-emerald-700',
                                        abs.statut === 'brouillon' &&
                                          'border-amber-500 bg-amber-50 text-amber-700',
                                        abs.statut === 'cloture' &&
                                          'border-blue-500 bg-blue-50 text-blue-700',
                                        abs.statut === 'annulee' &&
                                          'border-rose-500 bg-rose-50 text-rose-700'
                                      )}
                                    >
                                      {abs.statut === 'validee' && '✓ Validée'}
                                      {abs.statut === 'brouillon' &&
                                        '○ Brouillon'}
                                      {abs.statut === 'cloture' && '● Clôturée'}
                                      {abs.statut === 'annulee' && '✕ Annulée'}
                                    </Badge>
                                  </div>

                                  {/* Type */}
                                  <div
                                    className='flex items-center gap-3 rounded-lg p-3'
                                    style={{ backgroundColor: `${bgColor}15` }}
                                  >
                                    <div
                                      className='h-5 w-5 flex-shrink-0 rounded-full shadow-md'
                                      style={{ backgroundColor: bgColor }}
                                    />
                                    <div className='flex flex-col'>
                                      <span className='text-foreground text-sm font-semibold'>
                                        {abs.type_absence?.libelle}
                                      </span>
                                      <span
                                        className='text-xs font-medium'
                                        style={{ color: bgColor }}
                                      >
                                        {abs.type_absence?.code}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Dates */}
                                  <div className='bg-muted/50 space-y-2 rounded-lg p-3'>
                                    <div className='text-foreground flex items-center gap-2 text-sm'>
                                      <CalendarIcon className='text-muted-foreground h-4 w-4' />
                                      <span className='font-medium'>
                                        Du{' '}
                                        {format(
                                          parseISO(abs.date_debut),
                                          'dd/MM/yyyy'
                                        )}
                                      </span>
                                    </div>
                                    <div className='text-foreground flex items-center gap-2 text-sm'>
                                      <CalendarIcon className='text-muted-foreground h-4 w-4' />
                                      <span className='font-medium'>
                                        Au{' '}
                                        {format(
                                          parseISO(abs.date_fin),
                                          'dd/MM/yyyy'
                                        )}
                                      </span>
                                    </div>
                                    <div
                                      className='flex items-center gap-2 text-sm font-semibold'
                                      style={{ color: bgColor }}
                                    >
                                      <Clock className='h-4 w-4' />
                                      <span>{abs.duree} jour(s)</span>
                                    </div>
                                  </div>

                                  {/* Motif */}
                                  {abs.motif && (
                                    <div
                                      className='bg-muted/30 rounded-lg border-l-4 p-3'
                                      style={{ borderColor: bgColor }}
                                    >
                                      <div className='text-muted-foreground mb-1 text-xs font-medium'>
                                        Motif
                                      </div>
                                      <div className='text-foreground text-sm'>
                                        {abs.motif}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ))}
        </TooltipProvider>
      </div>
    );
  };

  // Render week view
  const renderWeekView = () => {
    return (
      <div className='space-y-4'>
        {/* Header */}
        <div className='grid grid-cols-7 gap-4'>
          {daysToDisplay.map((day, idx) => {
            const isDayToday = isToday(day);
            return (
              <div
                key={idx}
                className={cn(
                  'flex flex-col items-center rounded-lg border p-3',
                  isDayToday && 'border-primary bg-primary/5'
                )}
              >
                <span className='text-muted-foreground text-xs font-medium'>
                  {format(day, 'EEE', { locale: fr })}
                </span>
                <span
                  className={cn(
                    'text-2xl font-bold',
                    isDayToday && 'text-primary'
                  )}
                >
                  {format(day, 'd')}
                </span>
              </div>
            );
          })}
        </div>

        {/* Absences list */}
        <div className='grid grid-cols-7 gap-4'>
          {daysToDisplay.map((day, idx) => {
            const dayAbsences = getAbsencesForDay(day);
            return (
              <div key={idx} className='flex flex-col'>
                {dayAbsences.length > 0 && (
                  <div className='mb-2 flex items-center justify-center'>
                    <Badge
                      variant='secondary'
                      className={cn(
                        'rounded-full px-3 py-1 text-xs font-bold',
                        dayAbsences.length > 5 &&
                          'bg-orange-100 text-orange-700',
                        dayAbsences.length > 8 && 'bg-red-100 text-red-700'
                      )}
                    >
                      {dayAbsences.length} absence(s)
                    </Badge>
                  </div>
                )}
                <ScrollArea className='h-[500px]'>
                  <div className='space-y-2 pr-2'>
                    <div className='grid grid-cols-2 gap-2'>
                      {dayAbsences.map((abs, index) => {
                        const bgColor =
                          abs.type_absence?.couleur_hexa || '#94a3b8';
                        return (
                          <Tooltip key={abs.id} delayDuration={200}>
                            <TooltipTrigger asChild>
                              <Card
                                className='cursor-pointer border-2 transition-all hover:z-10 hover:scale-105 hover:shadow-lg'
                                style={{
                                  borderColor: bgColor,
                                  backgroundColor: `${bgColor}10`
                                }}
                              >
                                <CardContent className='p-2'>
                                  <div className='flex flex-col items-center gap-1.5'>
                                    {/* Avatar avec numéro */}
                                    <div className='relative'>
                                      <div
                                        className='flex h-10 w-10 items-center justify-center rounded-full shadow-md'
                                        style={{ backgroundColor: bgColor }}
                                      >
                                        <User className='h-5 w-5 text-white' />
                                      </div>
                                      <div
                                        className='absolute -right-1 -bottom-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-white text-[10px] font-bold shadow-sm'
                                        style={{ color: bgColor }}
                                      >
                                        {index + 1}
                                      </div>
                                    </div>
                                    {/* Nom */}
                                    <div className='text-center'>
                                      <div className='text-foreground text-[10px] leading-tight font-semibold'>
                                        {abs.employee?.firstName?.charAt(0)}.{' '}
                                        {abs.employee?.lastName}
                                      </div>
                                      <div
                                        className='mt-0.5 text-[9px] font-medium'
                                        style={{ color: bgColor }}
                                      >
                                        {abs.type_absence?.code}
                                      </div>
                                    </div>
                                    {/* Badge statut */}
                                    <Badge
                                      variant='outline'
                                      className={cn(
                                        'h-4 px-1.5 py-0 text-[8px] font-bold',
                                        abs.statut === 'validee' &&
                                          'border-emerald-500 bg-emerald-50 text-emerald-700',
                                        abs.statut === 'brouillon' &&
                                          'border-amber-500 bg-amber-50 text-amber-700',
                                        abs.statut === 'cloture' &&
                                          'border-blue-500 bg-blue-50 text-blue-700',
                                        abs.statut === 'annulee' &&
                                          'border-rose-500 bg-rose-50 text-rose-700'
                                      )}
                                    >
                                      {abs.statut === 'validee' && '✓'}
                                      {abs.statut === 'brouillon' && '○'}
                                      {abs.statut === 'cloture' && '●'}
                                      {abs.statut === 'annulee' && '✕'}
                                    </Badge>
                                  </div>
                                </CardContent>
                              </Card>
                            </TooltipTrigger>
                            <TooltipContent
                              side='right'
                              className='bg-card max-w-sm border-2 p-0 shadow-xl'
                              style={{ borderColor: bgColor }}
                            >
                              <div className='space-y-3 p-4'>
                                {/* Header */}
                                <div className='flex items-start justify-between gap-3 border-b pb-3'>
                                  <div className='flex items-center gap-3'>
                                    <div
                                      className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white shadow-md'
                                      style={{ backgroundColor: bgColor }}
                                    >
                                      {abs.employee?.firstName?.charAt(0)}
                                      {abs.employee?.lastName?.charAt(0)}
                                    </div>
                                    <div>
                                      <div className='text-foreground font-semibold'>
                                        {abs.employee?.firstName}{' '}
                                        {abs.employee?.lastName}
                                      </div>
                                      {abs.employee?.matricule && (
                                        <div className='text-muted-foreground text-xs'>
                                          {abs.employee.matricule}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <Badge
                                    variant='outline'
                                    className={cn(
                                      'flex-shrink-0 text-xs font-medium',
                                      abs.statut === 'validee' &&
                                        'border-emerald-500 bg-emerald-50 text-emerald-700',
                                      abs.statut === 'brouillon' &&
                                        'border-amber-500 bg-amber-50 text-amber-700',
                                      abs.statut === 'cloture' &&
                                        'border-blue-500 bg-blue-50 text-blue-700',
                                      abs.statut === 'annulee' &&
                                        'border-rose-500 bg-rose-50 text-rose-700'
                                    )}
                                  >
                                    {abs.statut === 'validee' && '✓ Validée'}
                                    {abs.statut === 'brouillon' &&
                                      '○ Brouillon'}
                                    {abs.statut === 'cloture' && '● Clôturée'}
                                    {abs.statut === 'annulee' && '✕ Annulée'}
                                  </Badge>
                                </div>

                                {/* Type */}
                                <div
                                  className='flex items-center gap-3 rounded-lg p-3'
                                  style={{ backgroundColor: `${bgColor}15` }}
                                >
                                  <div
                                    className='h-5 w-5 flex-shrink-0 rounded-full shadow-md'
                                    style={{ backgroundColor: bgColor }}
                                  />
                                  <div className='flex flex-col'>
                                    <span className='text-foreground text-sm font-semibold'>
                                      {abs.type_absence?.libelle}
                                    </span>
                                    <span
                                      className='text-xs font-medium'
                                      style={{ color: bgColor }}
                                    >
                                      {abs.type_absence?.code}
                                    </span>
                                  </div>
                                </div>

                                {/* Dates */}
                                <div className='bg-muted/50 space-y-2 rounded-lg p-3'>
                                  <div className='text-foreground flex items-center gap-2 text-sm'>
                                    <CalendarIcon className='text-muted-foreground h-4 w-4' />
                                    <span className='font-medium'>
                                      Du{' '}
                                      {format(
                                        parseISO(abs.date_debut),
                                        'dd/MM/yyyy'
                                      )}
                                    </span>
                                  </div>
                                  <div className='text-foreground flex items-center gap-2 text-sm'>
                                    <CalendarIcon className='text-muted-foreground h-4 w-4' />
                                    <span className='font-medium'>
                                      Au{' '}
                                      {format(
                                        parseISO(abs.date_fin),
                                        'dd/MM/yyyy'
                                      )}
                                    </span>
                                  </div>
                                  <div
                                    className='flex items-center gap-2 text-sm font-semibold'
                                    style={{ color: bgColor }}
                                  >
                                    <Clock className='h-4 w-4' />
                                    <span>{abs.duree} jour(s)</span>
                                  </div>
                                </div>

                                {/* Motif */}
                                {abs.motif && (
                                  <div
                                    className='bg-muted/30 rounded-lg border-l-4 p-3'
                                    style={{ borderColor: bgColor }}
                                  >
                                    <div className='text-muted-foreground mb-1 text-xs font-medium'>
                                      Motif
                                    </div>
                                    <div className='text-foreground text-sm'>
                                      {abs.motif}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        );
                      })}
                    </div>
                  </div>
                </ScrollArea>
                {dayAbsences.length === 0 && (
                  <div className='text-muted-foreground bg-muted/20 flex h-24 items-center justify-center rounded-lg border-2 border-dashed text-center text-xs font-medium'>
                    Aucune absence
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className='space-y-6 py-0'>
      {/* Header with navigation and filters */}
      <Card className='shadow-sm'>
        <CardContent className='py-0'>
          <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
            <div className='flex items-center gap-3'>
              <Button
                variant='outline'
                size='icon'
                onClick={handlePrevious}
                className='hover:bg-primary hover:text-primary-foreground h-10 w-10 rounded-lg transition-all'
              >
                <ChevronLeft className='h-5 w-5' />
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={handleToday}
                className='hover:bg-primary hover:text-primary-foreground min-w-[120px] rounded-lg font-medium transition-all'
              >
                Aujourd&apos;hui
              </Button>
              <Button
                variant='outline'
                size='icon'
                onClick={handleNext}
                className='hover:bg-primary hover:text-primary-foreground h-10 w-10 rounded-lg transition-all'
              >
                <ChevronRight className='h-5 w-5' />
              </Button>
              <div className='bg-muted/50 ml-4 flex items-center gap-3 rounded-lg px-4 py-2'>
                <CalendarIcon className='text-primary h-5 w-5' />
                <h2 className='text-foreground text-lg font-bold capitalize'>
                  {format(currentDate, 'MMMM yyyy', { locale: fr })}
                </h2>
              </div>
            </div>

            <div className='flex items-center gap-3'>{renderFilters()}</div>
          </div>
        </CardContent>
      </Card>

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-6'>
        {/* Legend */}
        <div className='lg:col-span-1'>{renderLegend()}</div>

        {/* Calendar */}
        <div className='lg:col-span-5'>
          {loading ? (
            <div className='flex h-[400px] items-center justify-center'>
              <div className='text-muted-foreground'>Chargement...</div>
            </div>
          ) : (
            <Card>
              <CardContent className='p-6'>{renderMonthView()}</CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
