'use client';

import { useState, useEffect } from 'react';
import { Control, Controller, useWatch } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { FormFieldCustom } from '@/components/custom/FormFieldCustom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PriceFieldProps {
  name: string;
  label: string;
  control: Control<any>;
  required?: boolean;
  error?: string;
  onFocus?: () => void;
  placeholder?: string;
  disabled?: boolean;
  defaultCurrency?: 'MAD' | 'EUR';
}

export const PriceField = ({
                             name,
                             label,
                             control,
                             required = false,
                             error,
                             onFocus,
                             placeholder = "0.00",
                             disabled = false,
                             defaultCurrency = 'MAD'
                           }: PriceFieldProps) => {
  const currencyFieldName = `${name}_currency`;

  // Watch the value to ensure the currency field is properly registered
  const currency = useWatch({
    control,
    name: currencyFieldName,
    defaultValue: defaultCurrency
  });

  // Set default currency on mount
  useEffect(() => {
    // This sets the default value for the currency field if it's not already set
    if (!currency) {
      control._defaultValues[currencyFieldName] = defaultCurrency;
    }
  }, [control, currencyFieldName, currency, defaultCurrency]);

  return (
    <div className="space-y-4">
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <FormFieldCustom
            name={name}
            label={label}
            required={required}
            error={error}
            onFocus={onFocus}
          >
            <div className="flex">
              <Input
                type="number"
                inputMode="decimal"
                placeholder={placeholder}
                className="rounded-r-none"
                {...field}
                value={field.value || ''}
                disabled={disabled}
              />
              <Controller
                name={currencyFieldName}
                control={control}
                defaultValue={defaultCurrency}
                render={({ field: currencyField }) => (
                  <Select
                    value={currencyField.value}
                    onValueChange={currencyField.onChange}
                    disabled={disabled}
                  >
                    <SelectTrigger className="w-24 rounded-l-none border-l-0">
                      <SelectValue placeholder="MAD" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MAD">MAD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </FormFieldCustom>
        )}
      />
    </div>
  );
};