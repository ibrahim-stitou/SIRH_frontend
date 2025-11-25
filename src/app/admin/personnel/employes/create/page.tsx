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

export default function EmployeeCreatePage() {
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

  const stepNames = ['Infos personnelles', 'Infos professionnelles', 'Documents'];

  const goNext = async () => {
    const ok = await trigger(stepFields[wizard.currentStepIndex] as any);
    if (!ok) {
      toast.error('Veuillez corriger les erreurs avant de continuer');
      return;
    }
    wizard.next();
  };

  const goBack = () => wizard.back();

  const onSubmit = async (data: EmployeeCreateFormValues) => {
    try {
      const ok = await trigger(stepFields[wizard.currentStepIndex] as any);
      if (!ok) {
        toast.error('Erreurs dans le formulaire');
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

      toast.loading('Création en cours...');
      await apiClient.post(apiRoutes.admin.employees.list, payload);
      toast.dismiss();
      toast.success('Employé créé avec succès');
      methods.reset();
      router.push('/admin/personnel/employes');
    } catch (e: any) {
      toast.dismiss();
      toast.error('Erreur lors de la création');
      console.error(e);
    }
  };

  return (
    <PageContainer>
    <FormProvider {...methods}>
      <div className="w-full mx-auto px-4 py-8">
        <div className="mb-10">
          <h1 className="text-2xl font-bold tracking-tight mb-2">Créer un employé</h1>
          <p className="text-sm text-muted-foreground">3 étapes simples pour ajouter un nouvel employé (contrat & salaire exclus).</p>
        </div>
        <Stepper current={wizard.currentStepIndex} steps={stepNames} goTo={(i) => wizard.goTo(i)} />
        <Card className="p-6 space-y-8">
          {wizard.step}
          <Separator />
          <div className="flex items-center justify-between">
            <Button type="button" variant="ghost" disabled={wizard.isFirstStep} onClick={goBack}>Retour</Button>
            {!wizard.isLastStep && (
              <Button type="button" onClick={goNext}>Suivant</Button>
            )}
            {wizard.isLastStep && (
              <Button type="button" onClick={handleSubmit(onSubmit)} disabled={formState.isSubmitting}>Terminer</Button>
            )}
          </div>
        </Card>
      </div>
    </FormProvider>
    </PageContainer>
  );
}
