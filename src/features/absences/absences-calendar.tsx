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
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [absences, setAbsences] = useState<AbsenceEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [showLegend, setShowLegend] = useState(true);

  // Filter states
  const [absenceTypes, setAbsenceTypes] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<number[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
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

    apiClient
      .get(apiRoutes.admin.employees.simpleList)
      .then((res) => {
        if (mounted) setEmployees(res.data?.data || []);
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
        const start =
          viewMode === 'month'
            ? startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 })
            : startOfWeek(currentDate, { weekStartsOn: 1 });
        const end =
          viewMode === 'month'
            ? endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 })
            : endOfWeek(currentDate, { weekStartsOn: 1 });

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
  }, [currentDate, viewMode]);

  // Filter absences
  const filteredAbsences = useMemo(() => {
    return absences.filter((abs) => {
      if (
        selectedTypes.length > 0 &&
        !selectedTypes.includes(Number(abs.type_absence_id))
      )
        return false;
      if (
        selectedEmployees.length > 0 &&
        !selectedEmployees.includes(Number(abs.employeeId))
      )
        return false;
      if (selectedStatuts.length > 0 && !selectedStatuts.includes(abs.statut))
        return false;
      return true;
    });
  }, [absences, selectedTypes, selectedEmployees, selectedStatuts]);

  // Navigation
  const handlePrevious = () => {
    setCurrentDate(
      viewMode === 'month'
        ? addMonths(currentDate, -1)
        : addWeeks(currentDate, -1)
    );
  };
  const handleNext = () => {
    setCurrentDate(
      viewMode === 'month'
        ? addMonths(currentDate, 1)
        : addWeeks(currentDate, 1)
    );
  };
  const handleToday = () => setCurrentDate(new Date());

  // Get days to display
  const daysToDisplay = useMemo(() => {
    if (viewMode === 'month') {
      const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 });
      const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 });
      const days: Date[] = [];
      let day = start;
      while (day <= end) {
        days.push(day);
        day = addDays(day, 1);
      }
      return days;
    } else {
      // week
      const start = startOfWeek(currentDate, { weekStartsOn: 1 });
      const days: Date[] = [];
      for (let i = 0; i < 7; i++) {
        days.push(addDays(start, i));
      }
      return days;
    }
  }, [currentDate, viewMode]);

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
          {(selectedTypes.length > 0 ||
            selectedEmployees.length > 0 ||
            selectedStatuts.length > 0) && (
            <Badge variant='secondary' className='ml-1 rounded-full px-1.5 py-0.5'>
              {selectedTypes.length + selectedEmployees.length + selectedStatuts.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-80' align='end'>
        <ScrollArea className='h-[400px]'>
          <div className='space-y-4 p-1'>
            <div>
              <h4 className='mb-3 text-sm font-semibold'>Types d&apos;absence</h4>
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
                  <div key={statut.value} className='flex items-center space-x-2'>
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

            <div>
              <h4 className='mb-3 text-sm font-semibold'>Employés</h4>
              <div className='space-y-2'>
                {employees.slice(0, 10).map((emp) => (
                  <div key={emp.id} className='flex items-center space-x-2'>
                    <Checkbox
                      id={`emp-${emp.id}`}
                      checked={selectedEmployees.includes(emp.id)}
                      onCheckedChange={(checked) => {
                        setSelectedEmployees((prev) =>
                          checked
                            ? [...prev, emp.id]
                            : prev.filter((id) => id !== emp.id)
                        );
                      }}
                    />
                    <Label
                      htmlFor={`emp-${emp.id}`}
                      className='flex-1 cursor-pointer text-sm'
                    >
                      {emp.firstName} {emp.lastName}
                    </Label>
                  </div>
                ))}
                {employees.length > 10 && (
                  <p className='text-muted-foreground text-xs'>
                    ... et {employees.length - 10} autres
                  </p>
                )}
              </div>
            </div>

            {(selectedTypes.length > 0 ||
              selectedEmployees.length > 0 ||
              selectedStatuts.length > 0) && (
              <Button
                variant='outline'
                size='sm'
                className='w-full'
                onClick={() => {
                  setSelectedTypes([]);
                  setSelectedEmployees([]);
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
                className='flex items-center gap-3 rounded-md p-2 transition-colors hover:bg-muted/50'
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
                              dayAbsences.length > 5 && 'bg-orange-100 text-orange-700',
                              dayAbsences.length > 8 && 'bg-red-100 text-red-700'
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
                          const bgColor = abs.type_absence?.couleur_hexa || '#94a3b8';
                          return (
                            <Tooltip key={abs.id} delayDuration={200}>
                              <TooltipTrigger asChild>
                                <div
                                  className='group relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-full shadow-md transition-all hover:scale-125 hover:shadow-xl hover:z-10'
                                  style={{
                                    backgroundColor: bgColor,
                                    border: '2px solid white'
                                  }}
                                >
                                  <User className='h-4 w-4 text-white' />
                                  <div
                                    className='absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-white text-[9px] font-bold shadow-sm'
                                    style={{ color: bgColor }}
                                  >
                                    {index + 1}
                                  </div>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent
                                side='right'
                                className='max-w-sm border-2 bg-card p-0 shadow-xl'
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
                                        <div className='font-semibold text-foreground'>
                                          {abs.employee?.firstName} {abs.employee?.lastName}
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
                                        'text-xs font-medium flex-shrink-0',
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
                                      {abs.statut === 'brouillon' && '○ Brouillon'}
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
                                      <span className='text-sm font-semibold text-foreground'>
                                        {abs.type_absence?.libelle}
                                      </span>
                                      <span className='text-xs font-medium' style={{ color: bgColor }}>
                                        {abs.type_absence?.code}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Dates */}
                                  <div className='space-y-2 rounded-lg bg-muted/50 p-3'>
                                    <div className='flex items-center gap-2 text-sm text-foreground'>
                                      <CalendarIcon className='h-4 w-4 text-muted-foreground' />
                                      <span className='font-medium'>
                                        Du {format(parseISO(abs.date_debut), 'dd/MM/yyyy')}
                                      </span>
                                    </div>
                                    <div className='flex items-center gap-2 text-sm text-foreground'>
                                      <CalendarIcon className='h-4 w-4 text-muted-foreground' />
                                      <span className='font-medium'>
                                        Au {format(parseISO(abs.date_fin), 'dd/MM/yyyy')}
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
                                      className='rounded-lg border-l-4 bg-muted/30 p-3'
                                      style={{ borderColor: bgColor }}
                                    >
                                      <div className='text-muted-foreground mb-1 text-xs font-medium'>
                                        Motif
                                      </div>
                                      <div className='text-sm text-foreground'>{abs.motif}</div>
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
                        dayAbsences.length > 5 && 'bg-orange-100 text-orange-700',
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
                        const bgColor = abs.type_absence?.couleur_hexa || '#94a3b8';
                        return (
                          <Tooltip key={abs.id} delayDuration={200}>
                            <TooltipTrigger asChild>
                              <Card
                                className='cursor-pointer border-2 transition-all hover:scale-105 hover:shadow-lg hover:z-10'
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
                                        className='absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-white text-[10px] font-bold shadow-sm'
                                        style={{ color: bgColor }}
                                      >
                                        {index + 1}
                                      </div>
                                    </div>
                                    {/* Nom */}
                                    <div className='text-center'>
                                      <div className='text-[10px] font-semibold text-foreground leading-tight'>
                                        {abs.employee?.firstName?.charAt(0)}.{' '}
                                        {abs.employee?.lastName}
                                      </div>
                                      <div
                                        className='text-[9px] font-medium mt-0.5'
                                        style={{ color: bgColor }}
                                      >
                                        {abs.type_absence?.code}
                                      </div>
                                    </div>
                                    {/* Badge statut */}
                                    <Badge
                                      variant='outline'
                                      className={cn(
                                        'text-[8px] font-bold px-1.5 py-0 h-4',
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
                              className='max-w-sm border-2 bg-card p-0 shadow-xl'
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
                                      <div className='font-semibold text-foreground'>
                                        {abs.employee?.firstName} {abs.employee?.lastName}
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
                                      'text-xs font-medium flex-shrink-0',
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
                                    {abs.statut === 'brouillon' && '○ Brouillon'}
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
                                    <span className='text-sm font-semibold text-foreground'>
                                      {abs.type_absence?.libelle}
                                    </span>
                                    <span className='text-xs font-medium' style={{ color: bgColor }}>
                                      {abs.type_absence?.code}
                                    </span>
                                  </div>
                                </div>

                                {/* Dates */}
                                <div className='space-y-2 rounded-lg bg-muted/50 p-3'>
                                  <div className='flex items-center gap-2 text-sm text-foreground'>
                                    <CalendarIcon className='h-4 w-4 text-muted-foreground' />
                                    <span className='font-medium'>
                                      Du {format(parseISO(abs.date_debut), 'dd/MM/yyyy')}
                                    </span>
                                  </div>
                                  <div className='flex items-center gap-2 text-sm text-foreground'>
                                    <CalendarIcon className='h-4 w-4 text-muted-foreground' />
                                    <span className='font-medium'>
                                      Au {format(parseISO(abs.date_fin), 'dd/MM/yyyy')}
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
                                    className='rounded-lg border-l-4 bg-muted/30 p-3'
                                    style={{ borderColor: bgColor }}
                                  >
                                    <div className='text-muted-foreground mb-1 text-xs font-medium'>
                                      Motif
                                    </div>
                                    <div className='text-sm text-foreground'>{abs.motif}</div>
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
                  <div className='text-muted-foreground flex h-24 items-center justify-center rounded-lg border-2 border-dashed bg-muted/20 text-center text-xs font-medium'>
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
                className='h-10 w-10 rounded-lg transition-all hover:bg-primary hover:text-primary-foreground'
              >
                <ChevronLeft className='h-5 w-5' />
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={handleToday}
                className='min-w-[120px] rounded-lg font-medium transition-all hover:bg-primary hover:text-primary-foreground'
              >
                Aujourd&apos;hui
              </Button>
              <Button
                variant='outline'
                size='icon'
                onClick={handleNext}
                className='h-10 w-10 rounded-lg transition-all hover:bg-primary hover:text-primary-foreground'
              >
                <ChevronRight className='h-5 w-5' />
              </Button>
              <div className='ml-4 flex items-center gap-3 rounded-lg bg-muted/50 px-4 py-2'>
                <CalendarIcon className='text-primary h-5 w-5' />
                <h2 className='text-lg font-bold capitalize text-foreground'>
                  {format(currentDate, 'MMMM yyyy', { locale: fr })}
                </h2>
              </div>
            </div>

            <div className='flex items-center gap-3'>
              {renderFilters()}
              <div className='flex rounded-lg border-2 shadow-sm'>
                <Button
                  variant={viewMode === 'month' ? 'default' : 'ghost'}
                  size='sm'
                  onClick={() => setViewMode('month')}
                  className={cn(
                    'rounded-r-none font-medium transition-all',
                    viewMode === 'month' && 'shadow-sm'
                  )}
                >
                  📅 Mois
                </Button>
                <Button
                  variant={viewMode === 'week' ? 'default' : 'ghost'}
                  size='sm'
                  onClick={() => setViewMode('week')}
                  className={cn(
                    'rounded-l-none font-medium transition-all',
                    viewMode === 'week' && 'shadow-sm'
                  )}
                >
                  📆 Semaine
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/*/!* Stats *!/*/}
      {/*<div className='grid grid-cols-1 gap-4 md:grid-cols-4'>*/}
      {/*  <Card className='border-l-4 border-l-primary shadow-sm transition-shadow hover:shadow-md'>*/}
      {/*    <CardContent className='p-5'>*/}
      {/*      <div className='flex items-center justify-between'>*/}
      {/*        <div className='flex-1'>*/}
      {/*          <p className='text-muted-foreground mb-1 text-xs font-medium uppercase tracking-wide'>*/}
      {/*            Total absences*/}
      {/*          </p>*/}
      {/*          <p className='text-3xl font-bold text-foreground'>*/}
      {/*            {filteredAbsences.length}*/}
      {/*          </p>*/}
      {/*        </div>*/}
      {/*        <div className='bg-primary/10 rounded-xl p-3'>*/}
      {/*          <CalendarIcon className='text-primary h-6 w-6' />*/}
      {/*        </div>*/}
      {/*      </div>*/}
      {/*    </CardContent>*/}
      {/*  </Card>*/}
      {/*  <Card className='border-l-4 border-l-emerald-500 shadow-sm transition-shadow hover:shadow-md'>*/}
      {/*    <CardContent className='p-5'>*/}
      {/*      <div className='flex items-center justify-between'>*/}
      {/*        <div className='flex-1'>*/}
      {/*          <p className='text-muted-foreground mb-1 text-xs font-medium uppercase tracking-wide'>*/}
      {/*            Validées*/}
      {/*          </p>*/}
      {/*          <p className='text-3xl font-bold text-emerald-600'>*/}
      {/*            {filteredAbsences.filter((a) => a.statut === 'validee').length}*/}
      {/*          </p>*/}
      {/*        </div>*/}
      {/*        <div className='rounded-xl bg-emerald-100 p-3'>*/}
      {/*          <CalendarIcon className='h-6 w-6 text-emerald-600' />*/}
      {/*        </div>*/}
      {/*      </div>*/}
      {/*    </CardContent>*/}
      {/*  </Card>*/}
      {/*  <Card className='border-l-4 border-l-amber-500 shadow-sm transition-shadow hover:shadow-md'>*/}
      {/*    <CardContent className='p-5'>*/}
      {/*      <div className='flex items-center justify-between'>*/}
      {/*        <div className='flex-1'>*/}
      {/*          <p className='text-muted-foreground mb-1 text-xs font-medium uppercase tracking-wide'>*/}
      {/*            En attente*/}
      {/*          </p>*/}
      {/*          <p className='text-3xl font-bold text-amber-600'>*/}
      {/*            {*/}
      {/*              filteredAbsences.filter((a) => a.statut === 'brouillon')*/}
      {/*                .length*/}
      {/*            }*/}
      {/*          </p>*/}
      {/*        </div>*/}
      {/*        <div className='rounded-xl bg-amber-100 p-3'>*/}
      {/*          <Clock className='h-6 w-6 text-amber-600' />*/}
      {/*        </div>*/}
      {/*      </div>*/}
      {/*    </CardContent>*/}
      {/*  </Card>*/}
      {/*  <Card className='border-l-4 border-l-blue-500 shadow-sm transition-shadow hover:shadow-md'>*/}
      {/*    <CardContent className='p-5'>*/}
      {/*      <div className='flex items-center justify-between'>*/}
      {/*        <div className='flex-1'>*/}
      {/*          <p className='text-muted-foreground mb-1 text-xs font-medium uppercase tracking-wide'>*/}
      {/*            Clôturées*/}
      {/*          </p>*/}
      {/*          <p className='text-3xl font-bold text-blue-600'>*/}
      {/*            {filteredAbsences.filter((a) => a.statut === 'cloture').length}*/}
      {/*          </p>*/}
      {/*        </div>*/}
      {/*        <div className='rounded-xl bg-blue-100 p-3'>*/}
      {/*          <CalendarIcon className='h-6 w-6 text-blue-600' />*/}
      {/*        </div>*/}
      {/*      </div>*/}
      {/*    </CardContent>*/}
      {/*  </Card>*/}
      {/*</div>*/}

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
              <CardContent className='p-6'>
                {viewMode === 'month' ? renderMonthView() : renderWeekView()}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
