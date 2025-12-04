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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { apiRoutes } from '@/config/apiRoutes';
import { ArrowLeft, FileText, Clock, Banknote, Save, Eye } from 'lucide-react';
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
  const [currentTab, setCurrentTab] = useState('general');
  const [showRecapModal, setShowRecapModal] = useState(false);
  const [formDataToSubmit, setFormDataToSubmit] = useState<SimplifiedContractInput | null>(null);

  const form = useForm<SimplifiedContractInput>({
    resolver: zodResolver(simplifiedContractSchema),
    defaultValues: simplifiedContractDefaultValues,
    mode: 'onBlur',
  });

  const selectedContractType = form.watch('type');
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
      form.setValue('salary.salary_net_imposable', Math.round(salaryNet * 100) / 100);
    }
  }, [baseSalary, cnssAffiliation, form]);

  // Auto-set trial period based on contract type and category
  useEffect(() => {
    const category = form.watch('job.category');
    const contractType = form.watch('type');

    if (contractType === 'CDI' && category) {
      let durationMonths = 3; // Default for cadres
      let durationDays = 90;

      if (category === 'Employe' || category === 'Technicien') {
        durationMonths = 1.5;
        durationDays = 45;
      } else if (category === 'Ouvrier' || category === 'Ouvrier_qualifie' || category === 'Manoeuvre') {
        durationMonths = 0.5;
        durationDays = 15;
      }

      if (form.watch('dates.trial_period.enabled')) {
        form.setValue('dates.trial_period.duration_months', durationMonths);
        form.setValue('dates.trial_period.duration_days', durationDays);
      }
    }
  }, [form.watch('job.category'), form.watch('type'), form.watch('dates.trial_period.enabled'), form]);

  const onSubmit = async (data: SimplifiedContractInput) => {
    console.log('📝 Prévisualisation du contrat:', data);
    setFormDataToSubmit(data);
    setShowRecapModal(true);
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
      <div className="mx-auto py-6 w-full max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Button variant="ghost" onClick={() => router.back()} className="mb-2">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Button>
            <h1 className="text-3xl font-bold">Nouveau Contrat de Travail</h1>
            <p className="text-muted-foreground mt-1">
              Créer un contrat conforme au Code du Travail marocain
            </p>
          </div>
          <Badge variant="outline" className="h-8 text-lg px-4">
            {selectedContractType || 'CDI'}
          </Badge>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 h-12">
                <TabsTrigger value="general" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>Informations Générales</span>
                </TabsTrigger>
                <TabsTrigger value="horaires" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Horaires & Congés</span>
                </TabsTrigger>
                <TabsTrigger value="salaire" className="flex items-center gap-2">
                  <Banknote className="h-4 w-4" />
                  <span>Salaire & Légal</span>
                </TabsTrigger>
              </TabsList>

              {/* Onglet 1: Informations Générales */}
              <TabsContent value="general" className="space-y-4 mt-6">
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
              </TabsContent>

              {/* Onglet 2: Horaires & Congés */}
              <TabsContent value="horaires" className="space-y-4 mt-6">
                <WorkScheduleTab form={form} />
              </TabsContent>

              {/* Onglet 3: Salaire & Légal */}
              <TabsContent value="salaire" className="space-y-4 mt-6">
                <SalaryAndLegalTab
                  form={form}
                  paymentMethodOptions={paymentMethodOptions}
                />
              </TabsContent>
            </Tabs>

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
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const values = form.getValues();
                    console.log('Brouillon sauvegardé:', values);
                    toast.info('Brouillon sauvegardé localement');
                  }}
                  disabled={loading}
                >
                  <Save className="mr-2 h-4 w-4" />
                  Sauvegarder Brouillon
                </Button>

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

