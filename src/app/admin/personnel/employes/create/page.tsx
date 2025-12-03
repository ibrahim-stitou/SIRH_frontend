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
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';
import PageContainer from '@/components/layout/page-container';
import { useLanguage } from '@/context/LanguageContext';
import { DatePickerField } from '@/components/custom/DatePickerField';
import { SelectField } from '@/components/custom/SelectField';
import apiClient from '@/lib/api';
import { apiRoutes } from '@/config/apiRoutes';

// Validation schema
const employeeSchema = z.object({
  firstName: z.string().min(1, 'Prénom requis'),
  matricule: z.string().min(1, 'Matricule requis'),
  lastName: z.string().min(1, 'Nom requis'),
  cin: z.string().min(1, 'CIN requis'),
  birthDate: z.string().min(1, 'Date de naissance requise'),
  birthPlace: z.string().optional(),
  nationality: z.enum(['maroc', 'autre'], { required_error: 'Nationalité requise' }),
  gender: z.enum(['Homme', 'Femme', 'Autre'], { required_error: 'Genre requis' }),
  maritalStatus: z.enum(['celibataire', 'marie'], { required_error: 'État civil requis' }),
  children: z
    .number({ invalid_type_error: 'Doit être un nombre' })
    .min(0, 'Doit être >= 0')
    .optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  phone: z.string().min(1, 'Téléphone requis').regex(/^[+\d]?(?:[\s.\-]?\d){7,15}$/, 'Numéro de téléphone invalide'),
  email: z.string().email('Email invalide').optional(),
  departmentId: z.number({ invalid_type_error: 'Département requis' }).min(1, 'Département requis'),
  position: z.string().min(1, 'Poste requis'),
});

type EmployeeFormValues = z.infer<typeof employeeSchema>;

interface DepartmentOption { id: string | number; name: string; }

export default function EmployeeCreatePage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      firstName: '',
      matricule: '',
      lastName: '',
      cin: '',
      birthDate: (() => { const d = new Date(); d.setFullYear(d.getFullYear() - 18); return d.toISOString().split('T')[0]; })(),
      birthPlace: '',
      nationality: 'maroc',
      gender: 'Homme',
      maritalStatus: 'celibataire',
      children: 0,
      address: '',
      city: '',
      postalCode: '',
      phone: '',
      email: '',
      departmentId: undefined,
      position: '',
    },
    mode: 'onBlur',
  });

  useEffect(() => {
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
    fetchDepartments();
  }, [t]);


  const onSubmit = async (data: EmployeeFormValues) => {
    console.log('Submitting employee data:', data);
    setLoading(true);
    try {
      const payload = {
        id: Date.now(),
        firstName: data.firstName,
        lastName: data.lastName,
        matricule: data.matricule,
        cin: data.cin,
        birthDate: data.birthDate,
        birthPlace: data.birthPlace,
        nationality: data.nationality,
        gender: data.gender,
        maritalStatus: data.maritalStatus,
        numberOfChildren: data.children ?? 0,
        address: data.address,
        city: data.city,
        postalCode: data.postalCode,
        phone: data.phone,
        email: data.email,
        departmentId: data.departmentId,
        position: data.position,
        status: 'actif',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'system',
      };

      toast.loading(t('common.creating'));
      await apiClient.post(apiRoutes.admin.employees.list, payload);
      toast.dismiss();
      toast.success(t('common.success'));
      form.reset();
      router.push('/admin/personnel/employes');
    } catch (error) {
      toast.dismiss();
      toast.error(t('common.error'));
      console.error('Error creating employee:', error);
    } finally {
      setLoading(false);
    }
  };

  const nationalityOptions = [
    { id: 'maroc', label: 'Maroc' },
    { id: 'autre', label: 'Autre' },
  ];
  const genderOptions = [
    { id: 'Homme', label: 'Homme' },
    { id: 'Femme', label: 'Femme' },
  ];
  const maritalOptions = [
    { id: 'celibataire', label: 'Célibataire' },
    { id: 'marie', label: 'Marié' },
  ];

  return (
    <PageContainer>
      <div className="mx-auto py-6 w-full">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('common.back')}
          </Button>
        </div>

        <Card className="w-full">
          <CardHeader>
            <CardTitle>{t('employeeCreate.title')}</CardTitle>
            <CardDescription>{t('employeeCreate.subtitle')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  {/* Identité */}
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prénom *</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom *</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="matricule"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Matricule *</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CIN *</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Naissance */}
                  <FormField
                    control={form.control}
                    name="birthDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date de naissance *</FormLabel>
                        <FormControl>
                          <DatePickerField
                            value={field.value}
                            onChange={field.onChange}
                            placeholder={t('placeholders.selectDate')}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="birthPlace"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lieu de naissance</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <SelectField
                    name="nationality"
                    label="Nationalité *"
                    control={form.control}
                    options={nationalityOptions}
                    displayField="label"
                    placeholder={t('placeholders.select')}
                    error={form.formState.errors.nationality?.message as string | undefined}
                  />

                  {/* État civil */}
                  <SelectField
                    name="gender"
                    label="Genre *"
                    control={form.control}
                    options={genderOptions}
                    displayField="label"
                    placeholder={t('placeholders.select')}
                    error={form.formState.errors.gender?.message as string | undefined}
                  />

                  <SelectField
                    name="maritalStatus"
                    label="État civil *"
                    control={form.control}
                    options={maritalOptions}
                    displayField="label"
                    placeholder={t('placeholders.select')}
                    error={form.formState.errors.maritalStatus?.message as string | undefined}
                  />

                  <FormField
                    control={form.control}
                    name="children"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Enfants</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>Nombre d&apos;enfants</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Contact */}
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Téléphone *</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Adresse */}
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Adresse</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={3} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ville</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="postalCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Code postal</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Détails de poste */}
                  <SelectField
                    name="departmentId"
                    label="Département *"
                    control={form.control}
                    options={
                      loadingDepartments
                        ? [{ id: 'loading', label: t('common.loading') }]
                        : departments.map((d) => ({ id: String(d.id), label: d.name }))
                    }
                    displayField="label"
                    placeholder={t('placeholders.select')}
                    error={form.formState.errors.departmentId?.message as string | undefined}
                  />

                  <FormField
                    control={form.control}
                    name="position"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Poste *</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Actions */}
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
