'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  simplifiedContractSchema,
  simplifiedContractDefaultValues,
  type SimplifiedContractInput,
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
  const [formDataToSubmit, setFormDataToSubmit] = useState<SimplifiedContractInput | null>(null);

  const form = useForm<SimplifiedContractInput>({
    resolver: zodResolver(simplifiedContractSchema),
    defaultValues: simplifiedContractDefaultValues,
    mode: 'onBlur',
  });

  const baseSalary = form.watch('salary.base_salary');
  const cnssAffiliation = form.watch('legal.cnss_affiliation');

  // Fetch employees
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await apiClient.get(apiRoutes.admin.employees.simpleList);
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
        const response = await apiClient.get(apiRoutes.admin.departments.simpleList);
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

  // Auto-calculate salary components
  useEffect(() => {
    if (baseSalary && baseSalary > 0) {
      const primes = form.getValues('salary.primes');
      const totalPrimes = Object.values(primes || {}).reduce((sum: number, val) => {
        return sum + (typeof val === 'number' ? val : 0);
      }, 0);

      const salaryBrut = baseSalary + totalPrimes;
      const cnssDeduction = cnssAffiliation ? salaryBrut * 0.0448 : 0;
      const salaryNet = salaryBrut - cnssDeduction;

      form.setValue('salary.salary_brut', Math.round(salaryBrut * 100) / 100);
      form.setValue('salary.salary_net', Math.round(salaryNet * 100) / 100);
    }
  }, [baseSalary, cnssAffiliation, form]);

  // Auto-set trial period based on contract type and category
  useEffect(() => {
    const subscription = form.watch((value) => {
      const category = value.job?.category;
      const contractType = value.type;
      const trialPeriodEnabled = value.dates?.trial_period?.enabled;

      if (contractType === 'CDI' && category && trialPeriodEnabled) {
        let durationMonths = 3; // Default for cadres
        let durationDays = 90;

        if (category === 'Employe' || category === 'Technicien') {
          durationMonths = 1.5;
          durationDays = 45;
        } else if (category === 'Ouvrier' || category === 'Ouvrier_qualifie' || category === 'Manoeuvre') {
          durationMonths = 0.5;
          durationDays = 15;
        }

        form.setValue('dates.trial_period.duration_months', durationMonths);
        form.setValue('dates.trial_period.duration_days', durationDays);
      }
    });

    return () => subscription.unsubscribe();
  }, [form]);

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
        reference: formDataToSubmit.reference || `CTR-${Date.now()}`,
      };

      toast.loading('Création du contrat en cours...');
      await apiClient.post(apiRoutes.admin.contratsEtMovements.contrats.create, payload);
      toast.dismiss();
      toast.success('✅ Contrat créé avec succès !');

      setTimeout(() => {
        router.push('/admin/contrats-mouvements/contrats');
      }, 1000);
    } catch (error: any) {
      toast.dismiss();
      console.error('❌ Erreur création contrat:', error);
      toast.error(error?.response?.data?.message || 'Erreur lors de la création du contrat');
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
    { id: 'SIVP', label: 'SIVP - Stage d\'Insertion' },
    { id: 'TAHIL', label: 'TAHIL' },
    { id: 'Apprentissage', label: 'Contrat d\'Apprentissage' },
    { id: 'Stage_PFE', label: 'Stage PFE' },
    { id: 'Stage_Initiation', label: 'Stage d\'Initiation' },
    { id: 'Interim', label: 'Intérim' },
    { id: 'Teletravail', label: 'Télétravail' },
    { id: 'Freelance', label: 'Freelance' },
    { id: 'Consultance', label: 'Consultance' },
  ];

  const categoryOptions = [
    { id: 'Cadre_superieur', label: 'Cadre Supérieur' },
    { id: 'Cadre', label: 'Cadre' },
    { id: 'Agent_maitrise', label: 'Agent de Maîtrise' },
    { id: 'Technicien', label: 'Technicien' },
    { id: 'Employe', label: 'Employé' },
    { id: 'Ouvrier_qualifie', label: 'Ouvrier Qualifié' },
    { id: 'Ouvrier', label: 'Ouvrier' },
    { id: 'Manoeuvre', label: 'Manœuvre' },
  ];

  const workModeOptions = [
    { id: 'Presentiel', label: 'Présentiel' },
    { id: 'Hybride', label: 'Hybride' },
    { id: 'Teletravail', label: 'Télétravail' },
    { id: 'Itinerant', label: 'Itinérant' },
    { id: 'Horaire_variable', label: 'Horaire Variable' },
  ];

  const paymentMethodOptions = [
    { id: 'Virement', label: 'Virement Bancaire' },
    { id: 'Cheque', label: 'Chèque' },
    { id: 'Especes', label: 'Espèces' },
  ];

  return (
    <PageContainer>
      <div className="mx-auto py-4 w-full ">
        {/* Header */}
        <div className="mb-2 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary">Nouveau Contrat de Travail</h1>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit, (errors) => {
            console.error('❌ Erreurs de validation:', errors);
            const firstError = Object.values(errors)[0];
            toast.error(firstError?.message || 'Veuillez corriger les erreurs du formulaire');
          })} className="space-y-4">
            {/* Card 1: Informations Générales */}
            <GeneralInfoTab
              form={form}
              employees={employees}
              departments={departments}
              loadingEmployees={loadingEmployees}
              loadingDepartments={loadingDepartments}
              contractTypeOptions={contractTypeOptions}
              categoryOptions={categoryOptions}
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
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <h4 className="font-semibold text-red-900 text-sm mb-2">
                  Erreurs de validation ({Object.keys(form.formState.errors).length})
                </h4>
                <ul className="text-xs text-red-800 space-y-1 list-disc list-inside">
                  {Object.entries(form.formState.errors).map(([key, error]) => (
                    <li key={key}>
                      <strong>{key}</strong>: {error?.message?.toString() || 'Erreur inconnue'}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
              >
                Annuler
              </Button>

              <div className="flex gap-3">
                <Button type="submit" disabled={loading}>
                  <Eye className="mr-2 h-4 w-4" />
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

