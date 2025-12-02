"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import apiClient from '@/lib/api';
import { apiRoutes } from '@/config/apiRoutes';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Stepper } from '../../create/components/Stepper';
import { StepPersonal } from '../../create/steps/StepPersonal';
import { StepProfessional } from '../../create/steps/StepProfessional';
import { StepDocuments } from '../../create/steps/StepDocuments';
import useMultistepForm from '@/hooks/use-multistep-form';
import { EmployeeCreateFormValues, fullSchema, stepFields } from '../../create/schema';
import { transformDocuments } from '../../create/utils';
import { useLanguage } from '@/context/LanguageContext';
import { EmployeeEditLoadingSkeleton } from '@/app/admin/personnel/employes/[id]/edit/loading-skeleton';

export default function EmployeeEditPage() {
  const params = useParams<{ id: string }>();
  const id = useMemo(() => params?.id, [params]);
  const router = useRouter();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);

  const methods = useForm<EmployeeCreateFormValues>({
    resolver: zodResolver(fullSchema),
    defaultValues: {
      gender: undefined,
      maritalStatus: undefined,
      education: [],
      skills: [],
      certifications: [],
      documents: [],
      documentsFiles: [],
    },
    mode: 'onBlur'
  });

  const { reset, trigger, handleSubmit, formState } = methods;

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(apiRoutes.admin.employees.details(id));
        const payload = (response as any)?.data;
        const row = payload && typeof payload === 'object' && 'data' in payload ? (payload as any).data : payload;
        // Adapter les données de l'API au formulaire
        const defaults: EmployeeCreateFormValues = {
          firstName: row?.firstName ?? '',
          lastName: row?.lastName ?? '',
          cin: row?.cin ?? '',
          birthDate: row?.birthDate ?? '',
          birthPlace: row?.birthPlace ?? '',
          gender: row?.gender ?? undefined,
          nationality: row?.nationality ?? '',
          maritalStatus: row?.maritalStatus ?? undefined,
          numberOfChildren: row?.numberOfChildren ?? undefined,
          address: row?.address ?? '',
          city: row?.city ?? '',
          postalCode: row?.postalCode ?? '',
          country: row?.country ?? '',
          phone: row?.phone ?? '',
          email: row?.email ?? '',
          emergencyContactName: row?.emergencyContact?.name ?? undefined,
          emergencyContactPhone: row?.emergencyContact?.phone ?? undefined,
          emergencyContactRelationship: row?.emergencyContact?.relationship ?? undefined,
          departmentId: row?.departmentId ?? '',
          position: row?.position ?? '',
          hireDate: row?.hireDate ?? '',
          education: row?.education ?? [],
          skills: row?.skills ?? [],
          certifications: row?.certifications ?? [],
          documents: (row?.documents || []).map((d: any) => ({ title: d.title || d.category || d.fileName || 'Document' })),
          documentsFiles: [],
          notes: row?.notes ?? '',
        } as any;
        reset(defaults);
      } catch (e) {
        toast.error(t('employeeEdit.updateError') || t('common.error'));
        router.push('/admin/personnel/employes');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, reset, router, t]);

  const wizard = useMultistepForm([
    <StepPersonal key="step1" />,
    <StepProfessional key="step2" />,
    <StepDocuments key="step3" />,
  ]);

  const stepNames = ['Infos personnelles', 'Infos professionnelles', 'Documents'];

  const goNext = async () => {
    const ok = await trigger(stepFields[wizard.currentStepIndex] as any);
    if (!ok) {
      toast.error(t('common.error'));
      return;
    }
    wizard.next();
  };

  const goBack = () => wizard.back();

  const onSubmit = async (data: EmployeeCreateFormValues) => {
    if (!id) return;
    try {
      const ok = await trigger(stepFields[wizard.currentStepIndex] as any);
      if (!ok) {
        toast.error(t('common.error'));
        return;
      }
      const docs = transformDocuments(data);
      const payload = {
        ...data,
        documents: docs,
        updatedAt: new Date().toISOString(),
      } as any;

      toast.loading(t('common.processing'));
      await apiClient.put(apiRoutes.admin.employees.update(id), payload);
      toast.dismiss();
      toast.success(t('employeeEdit.updateSuccess') || t('common.success'));
      router.push('/admin/personnel/employes');
    } catch (e) {
      toast.dismiss();
      toast.error(t('employeeEdit.updateError') || t('common.error'));
      console.error(e);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <EmployeeEditLoadingSkeleton />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <FormProvider {...methods}>
        <div className="w-full mx-auto px-4 py-2">
          <div className="mb-10">
            <h1 className="text-2xl font-bold tracking-tight mb-2">{t('employeeEdit.title')}</h1>
            <p className="text-sm text-muted-foreground">{t('employeeEdit.subtitle')}</p>
          </div>
          <Stepper current={wizard.currentStepIndex} steps={stepNames} goTo={(i) => wizard.goTo(i)} />
          <Card className="p-6 space-y-8">
            {wizard.step}
            <Separator />
            <div className="flex items-center justify-between">
              <Button type="button" variant="ghost" disabled={wizard.isFirstStep} onClick={goBack}>{t('employeeCreate.actions.prev') || t('common.back')}</Button>
              {!wizard.isLastStep && (
                <Button type="button" onClick={goNext}>{t('employeeCreate.actions.next') || t('common.next')}</Button>
              )}
              {wizard.isLastStep && (
                <Button type="button" onClick={handleSubmit(onSubmit)} disabled={formState.isSubmitting}>{t('common.save')}</Button>
              )}
            </div>
          </Card>
        </div>
      </FormProvider>
    </PageContainer>
  );
}
