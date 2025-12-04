'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FileText, User, Briefcase } from 'lucide-react';
import { DatePickerField } from '@/components/custom/DatePickerField';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { SimplifiedContractInput } from '@/validations/contract-simplified.schema';
import type { Employee, Department } from '@/types/employee';

interface GeneralInfoTabProps {
  form: UseFormReturn<SimplifiedContractInput>;
  employees: Employee[];
  departments: Department[];
  loadingEmployees: boolean;
  loadingDepartments: boolean;
  contractTypeOptions: Array<{ id: string; label: string }>;
  categoryOptions: Array<{ id: string; label: string }>;
  workModeOptions: Array<{ id: string; label: string }>;
}

export function GeneralInfoTab({
  form,
  employees,
  departments,
  loadingEmployees,
  loadingDepartments,
  contractTypeOptions,
  categoryOptions,
  workModeOptions,
}: GeneralInfoTabProps) {
  return (
    <div className="space-y-6">
      {/* Informations Générales du Contrat */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Informations du Contrat
          </CardTitle>
          <CardDescription>
            Type de contrat, références et dates principales
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Ligne 1: Référence, Type, Titre */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="reference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Référence</FormLabel>
                  <FormControl>
                    <Input placeholder="CTR-2024-001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="employe_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employé *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value?.toString()}
                    disabled={loadingEmployees}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={loadingEmployees ? 'Chargement...' : 'Sélectionner un employé'} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {employees.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id.toString()}>
                          {emp.firstName} {emp.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type de Contrat *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner le type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {contractTypeOptions.map((option) => (
                        <SelectItem key={option.id} value={option.id}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Ligne 2: Dates */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="dates.start_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date de Début *</FormLabel>
                  <FormControl>
                    <DatePickerField
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Sélectionner"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dates.end_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date de Fin</FormLabel>
                  <FormControl>
                    <DatePickerField
                      value={field.value || null}
                      onChange={field.onChange}
                      placeholder="Optionnelle (pour CDD)"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dates.signature_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date de Signature *</FormLabel>
                  <FormControl>
                    <DatePickerField
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Sélectionner"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          {/* Ligne 1: Fonction, Catégorie, Mode de Travail */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="job.function"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fonction</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Développeur Full Stack" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="job.category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catégorie Professionnelle *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une catégorie" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categoryOptions.map((option) => (
                        <SelectItem key={option.id} value={option.id}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="job.work_mode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mode de Travail</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner le mode" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {workModeOptions.map((option) => (
                        <SelectItem key={option.id} value={option.id}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Ligne 2: Classification, Lieu de Travail, Niveau */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="job.classification"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Classification</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Niveau 5 - Échelon 2" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="job.work_location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lieu de Travail</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Casablanca, Maroc" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="job.level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Niveau</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Senior" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Ligne 3: Responsabilités */}
          <FormField
            control={form.control}
            name="job.responsibilities"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Responsabilités</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Décrire les responsabilités principales..."
                    className="min-h-[80px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Ligne 3: Description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Description optionnelle du contrat..."
                    className="min-h-[80px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

