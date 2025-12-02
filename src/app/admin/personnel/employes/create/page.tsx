"use client";

import React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import useMultistepForm from '@/hooks/use-multistep-form';
import apiClient from '@/lib/api';
import { apiRoutes } from '@/config/apiRoutes';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Stepper } from './components/Stepper';
import { fullSchema, EmployeeCreateFormValues, stepFields } from './schema';
import { StepPersonal } from './steps/StepPersonal';
import { StepProfessional } from './steps/StepProfessional';
import { StepDocuments } from './steps/StepDocuments';
import { transformDocuments } from './utils';
import PageContainer from '@/components/layout/page-container';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';

export default function EmployeeCreatePage() {
  const { t } = useLanguage();
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

  const { handleSubmit, trigger, formState } = methods;
  const router = useRouter();

  const wizard = useMultistepForm([
    <StepPersonal key="step1" />,
    <StepProfessional key="step2" />,
    <StepDocuments key="step3" />,
  ]);

  const stepNames = [
    t('employeeCreate.steps.personal'),
    t('employeeCreate.steps.professional'),
    t('employeeCreate.steps.documents')
  ];

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
    try {
      const ok = await trigger(stepFields[wizard.currentStepIndex] as any);
      if (!ok) {
        toast.error(t('common.error'));
        return;
      }

      const docs = transformDocuments(data);

      const payload = {
        id: Date.now(),
        firstName: data.firstName,
        lastName: data.lastName,
        cin: data.cin,
        birthDate: data.birthDate,
        birthPlace: data.birthPlace,
        gender: data.gender,
        nationality: data.nationality,
        maritalStatus: data.maritalStatus,
        numberOfChildren: data.numberOfChildren,
        address: data.address,
        city: data.city,
        postalCode: data.postalCode,
        country: data.country,
        phone: data.phone,
        email: data.email,
        emergencyContact: data.emergencyContactName ? {
          name: data.emergencyContactName,
          phone: data.emergencyContactPhone,
          relationship: data.emergencyContactRelationship || '',
        } : undefined,
        departmentId: data.departmentId,
        position: data.position,
        hireDate: data.hireDate,
        education: data.education,
        skills: data.skills,
        certifications: data.certifications,
        documents: docs,
        status: 'actif',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'system',
        notes: data.notes,
      };

      toast.loading(t('common.creating'));
      await apiClient.post(apiRoutes.admin.employees.list, payload);
      toast.dismiss();
      toast.success(t('common.success'));
      methods.reset();
      router.push('/admin/personnel/employes');
    } catch (e: any) {
      toast.dismiss();
      toast.error(t('common.error'));
      console.error(e);
    }
  };

  return (
    <PageContainer>
    <FormProvider {...methods}>
      <div className="w-full  mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            {t('employeeCreate.title')}
          </h1>
          <p className="text-muted-foreground">
            {t('employeeCreate.subtitle')}
          </p>
        </div>

        {/* Stepper */}
        <Stepper
          current={wizard.currentStepIndex}
          steps={stepNames}
          goTo={(i) => wizard.goTo(i)}
        />

        {/* Form Content */}
        <Card className="border-2 shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="p-6 md:p-8 space-y-8">
            {/* Step Content */}
            <div className="min-h-[400px]">
              {wizard.step}
            </div>

            <Separator className="my-6" />

            {/* Navigation Footer */}
            <div className="flex items-center justify-between gap-4">
              <Button
                type="button"
                variant="outline"
                disabled={wizard.isFirstStep}
                onClick={goBack}
                className="gap-2"
              >
                <span>←</span>
                {t('common.back')}
              </Button>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="font-medium">
                  Étape {wizard.currentStepIndex + 1} / {stepNames.length}
                </span>
              </div>

              {!wizard.isLastStep && (
                <Button
                  type="button"
                  onClick={goNext}
                  className="gap-2"
                >
                  {t('common.next') || 'Suivant'}
                  <span>→</span>
                </Button>
              )}

              {wizard.isLastStep && (
                <Button
                  type="button"
                  onClick={handleSubmit(onSubmit)}
                  disabled={formState.isSubmitting}
                  className="gap-2 min-w-[140px]"
                >
                  {formState.isSubmitting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      {t('common.creating')}
                    </>
                  ) : (
                    <>
                      <span>✓</span>
                      {t('employeeCreate.actions.finish') || 'Terminer'}
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Progress Indicator */}
        {formState.isSubmitting && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <Card className="p-8 space-y-4 shadow-2xl animate-in zoom-in-95">
              <div className="flex flex-col items-center gap-4">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <p className="text-lg font-medium">Création de l&apos;employé en cours...</p>
                <p className="text-sm text-muted-foreground">Veuillez patienter</p>
              </div>
            </Card>
          </div>
        )}
      </div>
    </FormProvider>
    </PageContainer>
  );
}
