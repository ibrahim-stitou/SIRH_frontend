'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';
import PageContainer from '@/components/layout/page-container';
import { useLanguage } from '@/context/LanguageContext';
import { DatePickerField } from '@/components/custom/DatePickerField';
import { SelectField } from '@/components/custom/SelectField';
import { PROFESSIONAL_CATEGORY_OPTIONS } from './schema';
import apiClient from '@/lib/api';
import { apiRoutes } from '@/config/apiRoutes';
import {
  employeeSchema,
  employeeDefaultValues,
  type EmployeeFormValues
} from './schema';

interface DepartmentOption {
  id: string | number;
  name: string;
}

export default function EmployeeCreatePage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      ...employeeDefaultValues,
      professionalCategory: PROFESSIONAL_CATEGORY_OPTIONS[0].id
    },
    mode: 'onBlur'
  });

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await apiClient.get(
          apiRoutes.admin.departments.simpleList
        );
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
        firstNameAr: data.firstNameAr,
        lastNameAr: data.lastNameAr,
        matricule: data.matricule,
        cin: data.cin,
        numero_cnss: data.numero_cnss,
        birthDate: data.birthDate,
        birthPlace: data.birthPlace,
        nationality: data.nationality,
        gender: data.gender,
        maritalStatus: data.maritalStatus,
        numberOfChildren: data.children ?? 0,
        address: data.address,
        city: data.city,
        postalCode: data.postalCode,
        country: data.country,
        phone: data.phone,
        email: data.email,
        emergencyContact: data.emergencyContactName
          ? {
              name: data.emergencyContactName,
              phone: data.emergencyContactPhone,
              relationship: data.emergencyContactRelationship
            }
          : undefined,
        departmentId: data.departmentId,
        hireDate: data.hireDate,
        professionalCategory: data.professionalCategory,
        status: 'actif',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'system'
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
    { id: 'autre', label: 'Autre' }
  ];
  const genderOptions = [
    { id: 'Homme', label: 'Homme' },
    { id: 'Femme', label: 'Femme' }
  ];
  const maritalOptions = [
    { id: 'celibataire', label: 'Célibataire' },
    { id: 'marie', label: 'Marié' }
  ];

  return (
    <PageContainer>
      <div className='mx-auto w-full py-6'>
        <Card className='w-full'>
          <CardHeader>
            <div className='flex w-full flex-col gap-3 md:flex-row md:items-center md:justify-between'>
              <div>
                <CardTitle className='text-lg leading-tight font-semibold md:text-xl'>
                  {t('employeeCreate.title')}
                </CardTitle>
                <CardDescription className='text-muted-foreground mt-1'>
                  {t('employeeCreate.subtitle')}
                </CardDescription>
              </div>

              <div className='flex items-center gap-2'>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => router.back()}
                  aria-label={t('common.back')}
                  className='flex items-center'
                >
                  <ArrowLeft className='mr-2 h-4 w-4' />
                  <span className='hidden sm:inline'>{t('common.back')}</span>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className='space-y-6'
              >
                <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
                  {/* Identité */}
                  <FormField
                    control={form.control}
                    name='firstName'
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
                    name='lastName'
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
                    name='matricule'
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
                    name='cin'
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

                  <FormField
                    control={form.control}
                    name='numero_cnss'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Numéro CNSS</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder='Ex: 123456789' />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Naissance */}
                  <FormField
                    control={form.control}
                    name='birthDate'
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
                    name='birthPlace'
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
                    name='nationality'
                    label='Nationalité *'
                    control={form.control}
                    options={nationalityOptions}
                    displayField='label'
                    placeholder={t('placeholders.select')}
                    error={
                      form.formState.errors.nationality?.message as
                        | string
                        | undefined
                    }
                  />

                  {/* État civil */}
                  <SelectField
                    name='gender'
                    label='Genre *'
                    control={form.control}
                    options={genderOptions}
                    displayField='label'
                    placeholder={t('placeholders.select')}
                    error={
                      form.formState.errors.gender?.message as
                        | string
                        | undefined
                    }
                  />

                  <SelectField
                    name='maritalStatus'
                    label='État civil *'
                    control={form.control}
                    options={maritalOptions}
                    displayField='label'
                    placeholder={t('placeholders.select')}
                    error={
                      form.formState.errors.maritalStatus?.message as
                        | string
                        | undefined
                    }
                  />

                  <FormField
                    control={form.control}
                    name='children'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Enfants</FormLabel>
                        <FormControl>
                          <Input
                            type='number'
                            min={0}
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
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
                    name='phone'
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
                    name='email'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type='email' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Adresse */}
                  <FormField
                    control={form.control}
                    name='address'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Adresse</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={1} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='city'
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
                    name='postalCode'
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
                  <SelectField
                    name='departmentId'
                    label='Département *'
                    control={form.control}
                    options={
                      loadingDepartments
                        ? [{ id: 'loading', label: t('common.loading') }]
                        : departments.map((d) => ({
                            id: String(d.id),
                            label: d.name
                          }))
                    }
                    displayField='label'
                    placeholder={t('placeholders.select')}
                    error={
                      form.formState.errors.departmentId?.message as
                        | string
                        | undefined
                    }
                  />
                  {/* ...existing professional fields... */}
                  <SelectField
                    name='professionalCategory'
                    label='Catégorie professionnelle *'
                    control={form.control}
                    options={[...PROFESSIONAL_CATEGORY_OPTIONS]}
                    displayField='label'
                    placeholder={t('placeholders.select')}
                    error={
                      form.formState.errors.professionalCategory
                        ?.message as string
                    }
                  />
                </div>

                {/* Actions */}
                <div className='flex justify-end gap-4'>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={() => router.back()}
                    disabled={loading}
                  >
                    {t('common.cancel')}
                  </Button>
                  <Button type='submit' disabled={loading}>
                    <Save className='mr-2 h-4 w-4' />
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
