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
                                                                  showMonthYearPicker = true
                                                                }) => {
  const { t, language } = useLanguage();
  const [open, setOpen] = React.useState(false);

  // Get locale based on current language
  const locale = localeMap[language as keyof typeof localeMap] || fr;

  // Convert string to Date if needed
  const dateValue = React.useMemo(() => {
    if (!value) return null;
    if (value instanceof Date) return value;

    // Try parsing string in YYYY-MM-DD format
    try {
      const parsed = new Date(value);
      return isValid(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }, [value]);

  // Format for display
  const displayFormat = dateFormat || (language === 'en' ? 'MM/dd/yyyy' : 'dd/MM/yyyy');

  // Default placeholder
  const defaultPlaceholder = t?.('placeholders.selectDate') || placeholder || 'Sélectionner une date';

  const handleFocus = React.useCallback(() => {
    if (onFocus) onFocus();
  }, [onFocus]);

  const handleBlur = React.useCallback(() => {
    if (onBlur) onBlur();
  }, [onBlur]);

  const handleSelect = React.useCallback((day: Date | undefined) => {
    if (day) {
      // Return ISO string format (YYYY-MM-DD)
      const isoString = format(day, 'yyyy-MM-dd');
      onChange(isoString);
    } else {
      onChange(null);
    }
    setOpen(false);
  }, [onChange]);

  const handleClear = React.useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onChange(null);
  }, [onChange]);

  // Default disabled dates function
  const defaultDisabledDates = React.useCallback((date: Date) => {
    if (minDate && date < minDate) return true;
    return !!(maxDate && date > maxDate);
  }, [minDate, maxDate]);

  // Use provided disabledDates function or default
  const dateConstraints = disabledDates || defaultDisabledDates;

  const fieldId = id || `date-picker-${name}`;

  return (
    <div className={cn("w-full space-y-2", className)}>
      {label && (
        <Label
          htmlFor={fieldId}
          className={cn(
            "text-sm font-medium transition-colors",
            error && "text-destructive",
            disabled && "opacity-50"
          )}
        >
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={fieldId}
            name={name}
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-required={required}
            aria-invalid={!!error}
            aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
            className={cn(
              "w-full justify-between text-left font-normal transition-all duration-200",
              "hover:bg-accent hover:border-primary/50",
              !dateValue && "text-muted-foreground",
              disabled && "opacity-50 cursor-not-allowed hover:bg-transparent hover:border-border",
              error && "border-destructive focus-visible:ring-destructive",
              "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
              "h-10 px-3 py-2"
            )}
            disabled={disabled}
            onFocus={handleFocus}
            onBlur={handleBlur}
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <CalendarIcon className="h-4 w-4 shrink-0 opacity-60" />
              <span className="truncate text-sm">
                {dateValue ? (
                  format(dateValue, displayFormat, { locale })
                ) : (
                  defaultPlaceholder
                )}
              </span>
            </div>
            {showClearButton && dateValue && !disabled && (
              <X
                className="h-4 w-4 shrink-0 opacity-50 hover:opacity-100 transition-opacity ml-2"
                onClick={handleClear}
              />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0 shadow-lg animate-in fade-in-0 zoom-in-95"
          align="start"
          side="bottom"
          sideOffset={4}
        >
          <Calendar
            mode="single"
            selected={dateValue || undefined}
            onSelect={handleSelect}
            disabled={disabled ? true : dateConstraints}
            className="rounded-md border shadow-sm"
            captionLayout="dropdown"
          />
        </PopoverContent>
      </Popover>

      {hint && !error && (
        <p
          id={`${fieldId}-hint`}
          className="text-xs text-muted-foreground mt-1.5"
        >
          {hint}
        </p>
      )}

      {error && (
        <p
          id={`${fieldId}-error`}
          className="text-xs text-destructive flex items-center gap-1 animate-in slide-in-from-top-1 mt-1.5"
        >
          <span className="inline-block">⚠️</span>
          {error}
        </p>
      )}
    </div>
  );
};