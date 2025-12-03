// src/components/custom/SelectField.tsx
import React, { useState, useEffect } from 'react';
import { Controller, Control } from 'react-hook-form';
import { FormFieldCustom } from '@/components/custom/FormFieldCustom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface SelectFieldProps<T extends Record<string, any>, K extends keyof T> {
  name: string;
  label: string;
  control: Control<T>;
  options: Array<{ id: number | string; [key: string]: any }>;
  displayField: string;
  secondaryField?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  error?: string;
  onFocus?: () => void;
}

export function SelectField<T extends Record<string, any>, K extends keyof T>({
                                                                                name,
                                                                                label,
                                                                                control,
                                                                                options,
                                                                                displayField,
                                                                                secondaryField,
                                                                                required = false,
                                                                                disabled = false,
                                                                                placeholder = "Sélectionner",
                                                                                error,
                                                                                onFocus
                                                                              }: SelectFieldProps<T, K>) {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter options based on search term
  const filteredOptions = options.filter(option => {
    const primaryFieldValue = String(option[displayField] || '').toLowerCase();
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
              <SelectTrigger className="w-full">
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
                  filteredOptions.map((option) => (
                    <SelectItem key={option.id} value={String(option.id)}>
                      {secondaryField && option[secondaryField]
                        ? `${option[displayField] || ''} (${option[secondaryField] || ''})`
                        : option[displayField] || ''
                      }
                    </SelectItem>
                  ))
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