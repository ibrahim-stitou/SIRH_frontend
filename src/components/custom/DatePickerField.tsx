// components/DatePickerField.tsx
import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

type DatePickerFieldProps = {
  name: string;
  label?: string;
  value?: Date | null;
  onChange: (date: Date | null) => void;
  required?: boolean;
  disabled?: boolean;
  error?: string | null;
  onFocus?: () => void;
  className?: string;
  placeholder?: string;
  disabledDates?: (date: Date) => boolean;
};

export const DatePickerField: React.FC<DatePickerFieldProps> = ({
                                                                  name,
                                                                  value,
                                                                  onChange,
                                                                  disabled = false,
                                                                  error,
                                                                  onFocus,
                                                                  className,
                                                                  placeholder = "Sélectionner une date",
                                                                  disabledDates
                                                                }) => {
  const handleFocus = React.useCallback(() => {
    if (onFocus) onFocus();
  }, [onFocus]);

  // Default disabled dates function if not provided
  const defaultDisabledDates = (date: Date) => {
    return date > new Date() || date < new Date("1900-01-01");
  };

  // Use provided disabledDates function or default
  const dateConstraints = disabledDates || defaultDisabledDates;

  return (
    <div className={cn("w-full", className)} onFocus={handleFocus}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full pl-3 text-left font-normal",
              !value && "text-muted-foreground",
              disabled && "opacity-50 cursor-not-allowed",
              error && "border-destructive focus-visible:ring-destructive"
            )}
            disabled={disabled}
          >
            {value ? (
              format(value, "P", { locale: fr })
            ) : (
              <span>{placeholder}</span>
            )}
            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value || undefined}
            onSelect={onChange}
            disabled={disabled || dateConstraints}
            initialFocus
            locale={fr}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};