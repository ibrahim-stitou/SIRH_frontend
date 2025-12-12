'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  simplifiedContractSchema,
  simplifiedContractDefaultValues,
  type SimplifiedContractInput
} from '@/validations/contract-simplified.schema';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { apiRoutes } from '@/config/apiRoutes';
import { Eye } from 'lucide-react';
import apiClient from '@/lib/api';
import PageContainer from '@/components/layout/page-container';
import type { Employee, Department } from '@/types/employee';

// Import des composants onglets
import { GeneralInfoTab } from '@/features/contract/components/GeneralInfoTab';
import { WorkScheduleTab } from '@/features/contract/components/WorkScheduleTab';
import { SalaryAndLegalTab } from '@/features/contract/components/SalaryAndLegalTab';
import { ContractRecapModal } from '@/features/contract/components/ContractRecapModal';

export default function CreateContractPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [showRecapModal, setShowRecapModal] = useState(false);
  const [formDataToSubmit, setFormDataToSubmit] =
    useState<SimplifiedContractInput | null>(null);

  const form = useForm<SimplifiedContractInput>({
    resolver: zodResolver(simplifiedContractSchema),
    defaultValues: simplifiedContractDefaultValues,
    mode: 'onBlur'
  });

  // Fetch employees
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await apiClient.get(
          apiRoutes.admin.employees.simpleList
        );
        const result = response.data;
        setEmployees(result.data || result || []);
      } catch (error) {
        console.error('Error fetching employees:', error);
        toast.error('Erreur lors du chargement des employés');
      } finally {
        setLoadingEmployees(false);
      }
    };
    fetchEmployees();
  }, []);

  // Fetch departments
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
        toast.error('Erreur lors du chargement des départements');
      } finally {
        setLoadingDepartments(false);
      }
    };
    fetchDepartments();
  }, []);

  const onSubmit = async (data: SimplifiedContractInput) => {
    try {
      console.log('📝 Prévisualisation du contrat:', data);
      console.log('✅ Validation réussie');
      setFormDataToSubmit(data);
      setShowRecapModal(true);
    } catch (error) {
      console.error('❌ Erreur lors de la prévisualisation:', error);
      toast.error('Erreur lors de la validation du formulaire');
    }
  };

  const confirmSubmit = async () => {
    if (!formDataToSubmit) return;

    setLoading(true);
    setShowRecapModal(false);

    try {
      const payload = {
        ...formDataToSubmit,
        id: formDataToSubmit.id || crypto.randomUUID(),
        reference: formDataToSubmit.reference || `CTR-${Date.now()}`
      };

      toast.loading('Création du contrat en cours...');
      await apiClient.post(
        apiRoutes.admin.contratsEtMovements.contrats.create,
        payload
      );
      toast.dismiss();
      toast.success(' Contrat créé avec succès !');

      setTimeout(() => {
        router.push('/admin/contrats-mouvements/contrats');
      }, 1000);
    } catch (error: any) {
      toast.dismiss();
      console.error('❌ Erreur création contrat:', error);
      toast.error(
        error?.response?.data?.message ||
          'Erreur lors de la création du contrat'
      );
    } finally {
      setLoading(false);
      setFormDataToSubmit(null);
    }
  };

  // Options for selects
  const contractTypeOptions = [
    { id: 'CDI', label: 'CDI - Contrat à Durée Indéterminée' },
    { id: 'CDD', label: 'CDD - Contrat à Durée Déterminée' },
    { id: 'CDD_Saisonnier', label: 'CDD Saisonnier' },
    { id: 'CDD_Temporaire', label: 'CDD Temporaire' },
    { id: 'ANAPEC', label: 'ANAPEC (Idmaj)' },
    { id: 'SIVP', label: "SIVP - Stage d'Insertion" },
    { id: 'TAHIL', label: 'TAHIL' },
    { id: 'Apprentissage', label: "Contrat d'Apprentissage" },
    { id: 'Stage_PFE', label: 'Stage PFE' },
    { id: 'Stage_Initiation', label: "Stage d'Initiation" },
    { id: 'Interim', label: 'Intérim' },
    { id: 'Teletravail', label: 'Télétravail' },
    { id: 'Freelance', label: 'Freelance' },
    { id: 'Consultance', label: 'Consultance' }
  ];

  const workModeOptions = [
    { id: 'Presentiel', label: 'Présentiel' },
    { id: 'Hybride', label: 'Hybride' },
    { id: 'Teletravail', label: 'Télétravail' },
    { id: 'Itinerant', label: 'Itinérant' },
    { id: 'Horaire_variable', label: 'Horaire Variable' }
  ];

  const paymentMethodOptions = [
    { id: 'Virement', label: 'Virement Bancaire' },
    { id: 'Cheque', label: 'Chèque' },
    { id: 'Especes', label: 'Espèces' }
  ];

  return (
    <PageContainer>
      <div className='mx-auto w-full py-4'>
        {/* Header */}
        <div className='mb-2 flex items-center justify-between'>
          <div>
            <h1 className='text-primary text-3xl font-bold'>
              Nouveau Contrat de Travail
            </h1>
          </div>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, (errors) => {
              console.error('❌ Erreurs de validation:', errors);
              const firstError = Object.values(errors)[0];
              toast.error(
                firstError?.message ||
                  'Veuillez corriger les erreurs du formulaire'
              );
            })}
            className='space-y-4'
          >
            {/* Card 1: Informations Générales */}
            <GeneralInfoTab
              form={form}
              employees={employees}
              departments={departments}
              loadingEmployees={loadingEmployees}
              loadingDepartments={loadingDepartments}
              contractTypeOptions={contractTypeOptions}
              workModeOptions={workModeOptions}
            />

            {/* Card 2: Horaires & Congés */}
            <WorkScheduleTab form={form} />

            {/* Card 3: Salaire & Légal */}
            <SalaryAndLegalTab
              form={form}
              paymentMethodOptions={paymentMethodOptions}
            />

            {/* Affichage des erreurs de validation (debug) */}
            {Object.keys(form.formState.errors).length > 0 && (
              <div className='rounded-lg border border-red-200 bg-red-50 p-4'>
                <h4 className='mb-2 text-sm font-semibold text-red-900'>
                  Erreurs de validation (
                  {Object.keys(form.formState.errors).length})
                </h4>
                <ul className='list-inside list-disc space-y-1 text-xs text-red-800'>
                  {Object.entries(form.formState.errors).map(([key, error]) => (
                    <li key={key}>
                      <strong>{key}</strong>:{' '}
                      {error?.message?.toString() || 'Erreur inconnue'}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action Buttons */}
            <div className='flex items-center justify-between border-t pt-6'>
              <Button
                type='button'
                variant='outline'
                onClick={() => router.back()}
                disabled={loading}
              >
                Annuler
              </Button>

              <div className='flex gap-3'>
                <Button type='submit' disabled={loading}>
                  <Eye className='mr-2 h-4 w-4' />
                  {loading ? 'Traitement...' : 'Prévisualiser et Créer'}
                </Button>
              </div>
            </div>
          </form>
        </Form>

        {/* Modal de récapitulatif */}
        <ContractRecapModal
          open={showRecapModal}
          onOpenChange={setShowRecapModal}
          formData={formDataToSubmit}
          onConfirm={confirmSubmit}
          loading={loading}
        />
      </div>
    </PageContainer>
  );
}
