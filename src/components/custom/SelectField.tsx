// src/components/custom/SelectField.tsx
import React, { useState, useEffect } from 'react';
import { Controller, Control } from 'react-hook-form';
import { FormFieldCustom } from '@/components/custom/FormFieldCustom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface SelectFieldProps<T extends Record<string, any>, K extends keyof T> {
  name: string;
  label?: string;
  control: Control<T>;
  options: Array<{ id?: number | string; value?: string; label?: string; [key: string]: any }>;
  displayField?: string;
  secondaryField?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  error?: string;
  onFocus?: () => void;
  className?: string;
}

export function SelectField<T extends Record<string, any>, K extends keyof T>({
                                                                                name,
                                                                                label = '',
                                                                                control,
                                                                                options,
                                                                                displayField = 'label',
                                                                                secondaryField,
                                                                                required = false,
                                                                                disabled = false,
                                                                                placeholder = "Sélectionner",
                                                                                error,
                                                                                onFocus,
                                                                                className
                                                                              }: SelectFieldProps<T, K>) {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter options based on search term
  const filteredOptions = options.filter(option => {
    // Support both {value, label} and {id, displayField} formats
    const optionValue = option.label || option[displayField] || '';
    const primaryFieldValue = String(optionValue).toLowerCase();
    const secondaryFieldValue = secondaryField ? String(option[secondaryField] || '').toLowerCase() : '';
    const search = searchTerm.toLowerCase();

    return primaryFieldValue.includes(search) || secondaryFieldValue.includes(search);
  });

  return (
    <Controller
      name={name as any}
      control={control}
      render={({ field }) => {
        // Convert field.value to string for comparison
        const stringValue = field.value !== null && field.value !== undefined
          ? String(field.value)
          : undefined;

        return (
          <FormFieldCustom
            name={name}
            label={label}
            required={required}
            error={error}
            onFocus={onFocus}
          >
            <Select
              value={stringValue}
              onValueChange={(value) => {
                // Convert string to number if possible
                const numValue = Number(value);
                field.onChange(!isNaN(numValue) ? numValue : value);
              }}
              disabled={disabled}
            >
              <SelectTrigger className={className || "w-full"}>
                <SelectValue
                  placeholder={disabled ? "Chargement..." : placeholder}
                />
              </SelectTrigger>
              <SelectContent>
                {/* Always show search when there are 3+ options */}
                {options.length > 7 && (
                  <div className="flex items-center space-x-2 px-3 py-2 border-b">
                    <Search className="h-4 w-4 opacity-50" />
                    <Input
                      placeholder="Rechercher..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="h-8 px-2 border-none focus-visible:ring-0 focus-visible:ring-offset-0"
                      autoComplete="off"
                    />
                  </div>
                )}

                {filteredOptions.length > 0 ? (
                  filteredOptions.map((option) => {
                    // Support both {value, label} and {id, displayField} formats
                    const optionValue = option.value || option.id;
                    const optionLabel = option.label || option[displayField] || '';

                    return (
                      <SelectItem key={optionValue} value={String(optionValue)}>
                        {secondaryField && option[secondaryField]
                          ? `${optionLabel} (${option[secondaryField] || ''})`
                          : optionLabel
                        }
                      </SelectItem>
                    );
                  })
                ) : (
                  <div className="py-6 text-center text-sm text-muted-foreground">
                    Aucun résultat trouvé
                  </div>
                )}
              </SelectContent>
            </Select>
          </FormFieldCustom>
        );
      }}
    />
  );
}