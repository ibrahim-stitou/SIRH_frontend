'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { apiRoutes } from '@/config/apiRoutes';
import { ContractType } from '@/types/contract';
import { ArrowLeft, Save } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { DatePickerField } from '@/components/custom/DatePickerField';
import { SelectField } from '@/components/custom/SelectField';
import apiClient from '@/lib/api';
import PageContainer from '@/components/layout/page-container';

// Extend schema with richer fields
const contractFormSchema = z.object({
  employee_id: z.string().min(1, 'Employé requis'),
  type_contrat: z.enum(['CDI', 'CDD', 'Stage', 'Intérim', 'Apprentissage', 'Autre']),
  date_debut: z.string().min(1, 'Date de début requise'),
  date_fin: z.string().optional(),
  signature_date: z.string().optional(),
  trial_period_days: z.number().optional(),
  trial_period_renewals: z.number().optional(),
  work_location: z.string().optional(),
  weekly_hours: z.number().optional(),
  weekly_days: z.number().optional(),
  salaire_base: z.string().min(1, 'Salaire requis'),
  salaire_devise: z.string().default('MAD'),
  payment_frequency: z.enum(['Mensuel','Hebdomadaire','Quinzaine']).optional(),
  statut_contrat: z.enum(['actif', 'termine', 'suspendu', 'renouvelé']),
  poste: z.string().min(1, 'Poste requis'),
  departement: z.string().min(1, 'Département requis'),
  horaires: z.string().min(1, 'Horaires requis'),
  notes: z.string().optional(),
  statut: z.enum(['Brouillon', 'Actif', 'Terminé', 'Annulé']).default('Brouillon'),
});

type ContractFormValues = z.infer<typeof contractFormSchema>;

interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  matricule: string;
  position?: string;
  departmentId?: string;
}

interface DepartmentOption { id: string; name: string; }

export default function CreateContractPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [loadingDepartments, setLoadingDepartments] = useState(true);

  const form = useForm<ContractFormValues>({
    resolver: zodResolver(contractFormSchema),
    defaultValues: {
      employee_id: '',
      type_contrat: 'CDI',
      date_debut: '',
      date_fin: '',
      salaire_base: '',
      salaire_devise: 'MAD',
      statut_contrat: 'actif',
      poste: '',
      departement: '',
      horaires: 'Temps plein - 40h/semaine',
      notes: '',
      statut: 'Brouillon',
    },
  });

  const selectedTypeContrat = form.watch('type_contrat');
  const selectedEmployeeId = form.watch('employee_id');

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await apiClient.get(apiRoutes.admin.employees.simpleList);
        const result = response.data;
        setEmployees(result.data || result || []);
      } catch (error) {
        console.error('Error fetching employees:', error);
        toast.error(t('common.errors.fetchFailed'));
      } finally {
        setLoadingEmployees(false);
      }
    };

    const fetchDepartments = async () => {
      try {
        const response = await apiClient.get(apiRoutes.admin.departments.simpleList);
        const result = response.data;
        setDepartments(result.data || result || []);
      } catch (error) {
        console.error('Error fetching departments:', error);
        toast.error(t('common.errors.fetchFailed'));
      } finally {
        setLoadingDepartments(false);
      }
    };

    fetchEmployees();
    fetchDepartments();
  }, [t]);

  // Auto-fill employee data when selected
  useEffect(() => {
    if (selectedEmployeeId) {
      const employee = employees.find((emp) => emp.id === parseInt(selectedEmployeeId));
      if (employee && employee.position) {
        form.setValue('poste', employee.position);
      }
    }
  }, [selectedEmployeeId, employees, form]);

  const onSubmit = async (data: ContractFormValues) => {
    setLoading(true);
    try {
      const payload = {
        ...data,
        employee_id: parseInt(data.employee_id),
        salaire_base: parseFloat(data.salaire_base),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const response = await fetch(apiRoutes.admin.contratsEtMovements.contrats.create, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.status === 'success' || response.ok) {
        toast.success(t('contracts.messages.createSuccess'));
        router.push('/admin/contrats-mouvements/contrats');
      } else {
        toast.error(result.message || t('contracts.messages.error'));
      }
    } catch (error) {
      console.error('Error creating contract:', error);
      toast.error(t('contracts.messages.error'));
    } finally {
      setLoading(false);
    }
  };

  const contractTypes: ContractType[] = ['CDI', 'CDD', 'Stage', 'Intérim', 'Apprentissage', 'Autre'];
  const paymentFrequencies = [
    { value: 'Mensuel', label: t('contracts.fields.paymentFrequency') + ' - Mensuel' },
    { value: 'Hebdomadaire', label: t('contracts.fields.paymentFrequency') + ' - Hebdomadaire' },
    { value: 'Quinzaine', label: t('contracts.fields.paymentFrequency') + ' - Quinzaine' },
  ];

  return (
    <PageContainer>
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('common.back')}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('contracts.newContract')}</CardTitle>
          <CardDescription>{t('contracts.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Employee Selection */}
              <SelectField
                name="employee_id"
                label={t('contracts.fields.employee') + ' *'}
                control={form.control}
                options={loadingEmployees ? [{ id: 'loading', label: t('common.loading') }] : employees.map(e => ({ id: String(e.id), label: `${e.firstName} ${e.lastName} (${e.matricule})` }))}
                displayField="label"
                placeholder={t('placeholders.select')}
              />
                {/* Contract Status (backend) */}
                <SelectField
                  name="statut_contrat"
                  label={t('contracts.fields.status') + ' *'}
                  control={form.control}
                  options={[
                    { id: 'actif', label: t('employees.status.actif') },
                    { id: 'termine', label: t('contracts.status.TERMINE') },
                    { id: 'suspendu', label: t('employees.status.suspendu') },
                    { id: 'renouvelé', label: t('contracts.status.ACTIF') },
                  ]}
                  displayField="label"
                />
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Contract Type */}
                <SelectField
                  name="type_contrat"
                  label={t('contracts.fields.type') + ' *'}
                  control={form.control}
                  options={contractTypes.map(type => ({ id: type, label: type }))}
                  displayField="label"
                  placeholder={t('placeholders.select')}
                />

                {/* Signature Date */}
                <FormField
                  control={form.control}
                  name="signature_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('contracts.fields.signatureDate')}</FormLabel>
                      <FormControl>
                        <DatePickerField value={field.value} onChange={field.onChange} placeholder={t('placeholders.selectDate')} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Start Date */}
                <FormField
                  control={form.control}
                  name="date_debut"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('contracts.fields.startDate')} *</FormLabel>
                      <FormControl>
                        <DatePickerField value={field.value} onChange={field.onChange} placeholder={t('placeholders.selectDate')} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* End Date (conditional) */}
                {selectedTypeContrat !== 'CDI' && (
                  <FormField
                    control={form.control}
                    name="date_fin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t('contracts.fields.endDate')} {selectedTypeContrat === 'CDD' && '*'}
                        </FormLabel>
                        <FormControl>
                          <DatePickerField value={field.value} onChange={field.onChange} placeholder={t('placeholders.selectDate')} />
                        </FormControl>
                        {selectedTypeContrat === 'CDD' && (
                          <FormDescription>{t('contracts.help.cddEndDateRequired')}</FormDescription>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Trial Period */}
                <FormField
                  control={form.control}
                  name="trial_period_days"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('contracts.fields.trialPeriodDays')}</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} {...field} onChange={e => field.onChange(Number(e.target.value))} />
                      </FormControl>
                      <FormDescription>{t('contracts.help.trialPeriodMax')}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="trial_period_renewals"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('contracts.fields.trialPeriodRenewals')}</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} {...field} onChange={e => field.onChange(Number(e.target.value))} />
                      </FormControl>
                      <FormDescription>{t('contracts.help.trialPeriodRenewals')}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Position */}
                <FormField
                  control={form.control}
                  name="poste"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('contracts.fields.position')} *</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Department */}
                <SelectField
                  name="departement"
                  label={t('contracts.fields.department') + ' *'}
                  control={form.control}
                  options={loadingDepartments ? [{ id: 'loading', label: t('common.loading') }] : departments.map(d => ({ id: d.id, label: d.name }))}
                  displayField="label"
                  placeholder={t('placeholders.select')}
                />

                {/* Work Location */}
                <FormField
                  control={form.control}
                  name="work_location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('contracts.fields.workLocation')}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Base Salary */}
                <FormField
                  control={form.control}
                  name="salaire_base"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('contracts.fields.baseSalary')} *</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormDescription>{t('contracts.help.smigInfo')}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Currency */}
                <SelectField
                  name="salaire_devise"
                  label={t('contracts.fields.currency') + ' *'}
                  control={form.control}
                  options={[{ id: 'MAD', label: 'MAD' }, { id: 'EUR', label: 'EUR' }, { id: 'USD', label: 'USD' }]}
                  displayField="label"
                />

                {/* Payment Frequency */}
                <SelectField
                  name="payment_frequency"
                  label={t('contracts.fields.paymentFrequency')}
                  control={form.control}
                  options={paymentFrequencies.map(p => ({ id: p.value, label: p.label }))}
                  displayField="label"
                />

                {/* Weekly Hours / Days */}
                <FormField
                  control={form.control}
                  name="weekly_hours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('contracts.fields.weeklyHours')}</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} {...field} onChange={e => field.onChange(Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="weekly_days"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('contracts.fields.weeklyDays')}</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} max={7} {...field} onChange={e => field.onChange(Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Work Hours description */}
                <FormField
                  control={form.control}
                  name="horaires"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('contracts.sections.worktime')}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>{t('contracts.help.standardWeeklyHours')}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Notes */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('contracts.fields.notes')}</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={4} />
                    </FormControl>
                    <FormDescription>{t('contracts.help.notesInternal')}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit Buttons */}
              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
                  {t('common.cancel')}
                </Button>
                <Button type="submit" disabled={loading}>
                  <Save className="mr-2 h-4 w-4" />
                  {loading ? t('common.creating') : t('common.save')}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
    </PageContainer>
  );
}
