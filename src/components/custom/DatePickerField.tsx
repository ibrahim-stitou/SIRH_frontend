'use client';

import React from 'react';
import { format, isValid } from 'date-fns';
import { fr, enUS, arSA } from 'date-fns/locale';
import { CalendarIcon, X } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';

// Locale mapping
const localeMap = {
  fr: fr,
  en: enUS,
  ar: arSA
};

type DatePickerFieldProps = {
  name?: string;
  label?: string;
  value?: Date | string | null;
  onChange: (date: string | null) => void;
  required?: boolean;
  disabled?: boolean;
  error?: string | null;
  onFocus?: () => void;
  onBlur?: () => void;
  className?: string;
  placeholder?: string;
  disabledDates?: (date: Date) => boolean;
  minDate?: Date;
  maxDate?: Date;
  hint?: string;
  showClearButton?: boolean;
  dateFormat?: string;
  id?: string;
  showMonthYearPicker?: boolean;
  withTime?: boolean;
};

export const DatePickerField: React.FC<DatePickerFieldProps> = ({
  name = 'date',
  label,
  value,
  onChange,
  required = false,
  disabled = false,
  error,
  onFocus,
  onBlur,
  className,
  placeholder,
  disabledDates,
  minDate,
  maxDate,
  hint,
  showClearButton = true,
  dateFormat,
  id,
  withTime = false
}) => {
  const { t, language } = useLanguage();
  const [open, setOpen] = React.useState(false);
  const [hours, setHours] = React.useState('09');
  const [minutes, setMinutes] = React.useState('00');

  // Get locale based on current language
  const locale = localeMap[language as keyof typeof localeMap] || fr;

  // Convert string to Date if needed
  const dateValue = React.useMemo(() => {
    if (!value) return null;
    if (value instanceof Date) return value;

    // Try parsing string in YYYY-MM-DD format or ISO format
    try {
      const parsed = new Date(value);
      return isValid(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }, [value]);

  // Extract hours and minutes from dateValue when component mounts or value changes
  React.useEffect(() => {
    if (withTime && dateValue) {
      const h = dateValue.getHours();
      const m = dateValue.getMinutes();
      setHours(h.toString().padStart(2, '0'));
      setMinutes(m.toString().padStart(2, '0'));
    }
  }, [dateValue, withTime]);

  // Format for display
  const displayFormat = React.useMemo(() => {
    if (dateFormat) return dateFormat;
    const baseFormat = language === 'en' ? 'MM/dd/yyyy' : 'dd/MM/yyyy';
    return withTime ? `${baseFormat} HH:mm` : baseFormat;
  }, [dateFormat, language, withTime]);

  // Default placeholder
  const defaultPlaceholder =
    t?.('placeholders.selectDate') || placeholder || 'Sélectionner une date';

  const handleFocus = React.useCallback(() => {
    if (onFocus) onFocus();
  }, [onFocus]);

  const handleBlur = React.useCallback(() => {
    if (onBlur) onBlur();
  }, [onBlur]);

  const handleSelect = React.useCallback(
    (day: Date | undefined) => {
      if (day) {
        if (withTime) {
          // Include time in ISO string (YYYY-MM-DDTHH:mm:ss)
          const dateWithTime = new Date(day);
          dateWithTime.setHours(parseInt(hours, 10));
          dateWithTime.setMinutes(parseInt(minutes, 10));
          dateWithTime.setSeconds(0);
          const isoString = dateWithTime.toISOString();
          onChange(isoString);
        } else {
          // Return ISO string format (YYYY-MM-DD)
          const isoString = format(day, 'yyyy-MM-dd');
          onChange(isoString);
        }
      } else {
        onChange(null);
      }
      if (!withTime) {
        setOpen(false);
      }
    },
    [onChange, withTime, hours, minutes]
  );

  const handleTimeConfirm = React.useCallback(() => {
    if (dateValue) {
      const dateWithTime = new Date(dateValue);
      dateWithTime.setHours(parseInt(hours, 10));
      dateWithTime.setMinutes(parseInt(minutes, 10));
      dateWithTime.setSeconds(0);
      const isoString = dateWithTime.toISOString();
      onChange(isoString);
    }
    setOpen(false);
  }, [dateValue, hours, minutes, onChange]);

  const handleClear = React.useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      onChange(null);
    },
    [onChange]
  );

  // Default disabled dates function
  const defaultDisabledDates = React.useCallback(
    (date: Date) => {
      if (minDate && date < minDate) return true;
      return !!(maxDate && date > maxDate);
    },
    [minDate, maxDate]
  );

  // Use provided disabledDates function or default
  const dateConstraints = disabledDates || defaultDisabledDates;

  const fieldId = id || `date-picker-${name}`;

  return (
    <div className={cn('w-full space-y-2', className)}>
      {label && (
        <Label
          htmlFor={fieldId}
          className={cn(
            'text-sm font-medium transition-colors',
            error && 'text-destructive',
            disabled && 'opacity-50'
          )}
        >
          {label}
          {required && <span className='text-destructive ml-1'>*</span>}
        </Label>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={fieldId}
            name={name}
            type='button'
            variant='outline'
            role='combobox'
            aria-expanded={open}
            aria-required={required}
            aria-invalid={!!error}
            aria-describedby={
              error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined
            }
            className={cn(
              'w-full justify-between text-left font-normal transition-all duration-200',
              'hover:bg-accent hover:border-primary/50',
              !dateValue && 'text-muted-foreground',
              disabled &&
                'hover:border-border cursor-not-allowed opacity-50 hover:bg-transparent',
              error && 'border-destructive focus-visible:ring-destructive',
              'focus-visible:ring-primary focus-visible:ring-2 focus-visible:ring-offset-2',
              'h-10 px-3 py-2'
            )}
            disabled={disabled}
            onFocus={handleFocus}
            onBlur={handleBlur}
          >
            <div className='flex min-w-0 flex-1 items-center gap-2'>
              <CalendarIcon className='h-4 w-4 shrink-0 opacity-60' />
              <span className='truncate text-sm'>
                {dateValue
                  ? format(dateValue, displayFormat, { locale })
                  : defaultPlaceholder}
              </span>
            </div>
            {showClearButton && dateValue && !disabled && (
              <X
                className='ml-2 h-4 w-4 shrink-0 opacity-50 transition-opacity hover:opacity-100'
                onClick={handleClear}
              />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className='animate-in fade-in-0 zoom-in-95 w-auto p-0 shadow-lg'
          align='start'
          side='bottom'
          sideOffset={4}
        >
          <Calendar
            mode='single'
            selected={dateValue || undefined}
            onSelect={handleSelect}
            disabled={disabled ? true : dateConstraints}
            className='rounded-md border-0 shadow-sm'
            captionLayout='dropdown'
          />
          {withTime && (
            <div className='border-t p-3'>
              <div className='flex items-center gap-2'>
                <div className='flex flex-1 items-center gap-2'>
                  <label className='text-sm font-medium'>Heure:</label>
                  <input
                    type='number'
                    min='0'
                    max='23'
                    value={hours}
                    onChange={(e) => {
                      const val = Math.min(
                        23,
                        Math.max(0, parseInt(e.target.value) || 0)
                      );
                      setHours(val.toString().padStart(2, '0'));
                    }}
                    className='w-16 rounded-md border px-2 py-1 text-center text-sm'
                  />
                  <span>:</span>
                  <input
                    type='number'
                    min='0'
                    max='59'
                    value={minutes}
                    onChange={(e) => {
                      const val = Math.min(
                        59,
                        Math.max(0, parseInt(e.target.value) || 0)
                      );
                      setMinutes(val.toString().padStart(2, '0'));
                    }}
                    className='w-16 rounded-md border px-2 py-1 text-center text-sm'
                  />
                </div>
                <Button
                  size='sm'
                  onClick={handleTimeConfirm}
                  disabled={!dateValue}
                  className='ml-2'
                >
                  OK
                </Button>
              </div>
            </div>
          )}
        </PopoverContent>
      </Popover>

      {hint && !error && (
        <p
          id={`${fieldId}-hint`}
          className='text-muted-foreground mt-1.5 text-xs'
        >
          {hint}
        </p>
      )}

      {error && (
        <p
          id={`${fieldId}-error`}
          className='text-destructive animate-in slide-in-from-top-1 mt-1.5 flex items-center gap-1 text-xs'
        >
          <span className='inline-block'>⚠️</span>
          {error}
        </p>
      )}
    </div>
  );
};
