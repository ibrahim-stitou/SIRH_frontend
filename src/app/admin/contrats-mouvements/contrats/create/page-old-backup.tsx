'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  contractSchema,
  contractDefaultValues,
  type ContractCreateInput,
} from '@/validations/contract.schema';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { apiRoutes } from '@/config/apiRoutes';
import {
  ArrowLeft,
  FileText,
  Briefcase,
  Clock,
  Banknote,
  Shield,
  User,
  Calendar,
  MapPin,
  Award,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { DatePickerField } from '@/components/custom/DatePickerField';
import { SelectField } from '@/components/custom/SelectField';
import apiClient from '@/lib/api';
import PageContainer from '@/components/layout/page-container';
import type { Employee, Department } from '@/types/employee';

export default function CreateContractPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [currentTab, setCurrentTab] = useState('general');
  const [showRecapModal, setShowRecapModal] = useState(false);
  const [formDataToSubmit, setFormDataToSubmit] = useState<ContractCreateInput | null>(null);

  const form = useForm<ContractCreateInput>({
    resolver: zodResolver(contractSchema),
    defaultValues: contractDefaultValues,
    mode: 'onBlur',
  });

  const selectedContractType = form.watch('type');
  const selectedEmployeeId = form.watch('employe_id');
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

    if (contractType === 'CDI') {
      let durationMonths = 3; // Default for cadres
      if (category === 'Employe' || category === 'Technicien') {
        durationMonths = 1.5;
      } else if (category === 'Ouvrier' || category === 'Ouvrier_qualifie' || category === 'Manoeuvre') {
        durationMonths = 0.5;
        form.setValue('dates.trial_period.duration_days', 15);
      }
      form.setValue('dates.trial_period.duration_months', durationMonths);
    }
  }, [form.watch('job.category'), form.watch('type'), form]);

  const onSubmit = async (data: ContractCreateInput) => {
    console.log('📝 Prévisualisation du contrat:', data);
    // Afficher le modal de récapitulatif
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

      // Redirect to contracts list
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
          <Badge variant="outline" className="h-8">
            {selectedContractType || 'CDI'}
          </Badge>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="general" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">Général</span>
                </TabsTrigger>
                <TabsTrigger value="employe" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">Employé</span>
                </TabsTrigger>
                <TabsTrigger value="poste" className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  <span className="hidden sm:inline">Poste</span>
                </TabsTrigger>
                <TabsTrigger value="temps" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span className="hidden sm:inline">Temps</span>
                </TabsTrigger>
                <TabsTrigger value="salaire" className="flex items-center gap-2">
                  <Banknote className="h-4 w-4" />
                  <span className="hidden sm:inline">Salaire</span>
                </TabsTrigger>
                <TabsTrigger value="legal" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span className="hidden sm:inline">Légal</span>
                </TabsTrigger>
              </TabsList>

              {/* TAB 1: GÉNÉRAL */}
              <TabsContent value="general" className="space-y-4 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Informations Générales
                    </CardTitle>
                    <CardDescription>
                      Type de contrat, références et dates principales
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="reference"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Référence du Contrat *</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="CTR-2025-001" />
                            </FormControl>
                            <FormDescription>Référence unique du contrat</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <SelectField
                        name="type"
                        label="Type de Contrat *"
                        control={form.control}
                        options={contractTypeOptions}
                        displayField="label"
                        placeholder="Sélectionner le type"
                      />
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Dates du Contrat
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="dates.signature_date"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Date de Signature</FormLabel>
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

                        {(selectedContractType?.startsWith('CDD') || selectedContractType === 'Stage_PFE') && (
                          <FormField
                            control={form.control}
                            name="dates.end_date"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Date de Fin *</FormLabel>
                                <FormControl>
                                  <DatePickerField
                                    value={field.value || ''}
                                    onChange={field.onChange}
                                    placeholder="Sélectionner"
                                  />
                                </FormControl>
                                <FormDescription>Obligatoire pour CDD</FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                      </div>
                    </div>

                    {selectedContractType === 'CDI' && (
                      <>
                        <Separator />
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5" />
                            Période d&apos;Essai
                          </h3>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField
                              control={form.control}
                              name="dates.trial_period.duration_months"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Durée (mois)</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      {...field}
                                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                    />
                                  </FormControl>
                                  <FormDescription>3 mois cadres, 1.5 employés, 15j ouvriers</FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="dates.trial_period.renewable"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                  <div className="space-y-1 leading-none">
                                    <FormLabel>Renouvelable</FormLabel>
                                    <FormDescription>
                                      Période d&apos;essai renouvelable une fois
                                    </FormDescription>
                                  </div>
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* TAB 2: EMPLOYÉ */}
              <TabsContent value="employe" className="space-y-4 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Sélection de l&apos;Employé
                    </CardTitle>
                    <CardDescription>
                      Choisir l&apos;employé concerné par ce contrat
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <SelectField
                      name="employe_id"
                      label="Employé *"
                      control={form.control}
                      options={
                        loadingEmployees
                          ? [{ id: 'loading', name: 'Chargement...' }]
                          : employees.map((e) => ({
                              id: String(e.id),
                              name: `${e.firstName} ${e.lastName} (${e.matricule})`,
                            }))
                      }
                      displayField="name"
                      placeholder="Sélectionner un employé"
                    />

                    {selectedEmployeeId && (
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm font-medium">Informations de l&apos;employé</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {employees.find((e) => String(e.id) === String(selectedEmployeeId))?.email}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* TAB 3: POSTE */}
              <TabsContent value="poste" className="space-y-4 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5" />
                      Informations du Poste
                    </CardTitle>
                    <CardDescription>
                      Classification professionnelle et missions
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="job.title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Intitulé du Poste *</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Ex: Développeur Full Stack" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <SelectField
                        name="job.category"
                        label="Catégorie Professionnelle *"
                        control={form.control}
                        options={categoryOptions}
                        displayField="label"
                        placeholder="Sélectionner"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <SelectField
                        name="job.department"
                        label="Département *"
                        control={form.control}
                        options={
                          loadingDepartments
                            ? [{ id: 'loading', name: 'Chargement...' }]
                            : departments.map((d) => ({
                                id: String(d.id),
                                name: d.name,
                              }))
                        }
                        displayField="name"
                        placeholder="Sélectionner"
                      />

                      <FormField
                        control={form.control}
                        name="job.coefficient"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Coefficient</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                placeholder="Ex: 200"
                              />
                            </FormControl>
                            <FormDescription>Selon la Convention Collective</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        Localisation
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="job.work_location"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Lieu de Travail *</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Ex: Casablanca, Maroc" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <SelectField
                          name="job.work_mode"
                          label="Mode de Travail *"
                          control={form.control}
                          options={workModeOptions}
                          displayField="label"
                          placeholder="Sélectionner"
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="job.mobility_clause"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Clause de Mobilité</FormLabel>
                              <FormDescription>
                                L&apos;employé accepte la possibilité de mutation géographique
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>

                    <Separator />

                    <FormField
                      control={form.control}
                      name="job.missions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Missions et Responsabilités *</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              rows={6}
                              placeholder="Décrire les missions principales du poste..."
                            />
                          </FormControl>
                          <FormDescription>
                            Description détaillée des missions (minimum 10 caractères)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* TAB 4: TEMPS DE TRAVAIL */}
              <TabsContent value="temps" className="space-y-4 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Temps de Travail
                    </CardTitle>
                    <CardDescription>
                      Horaires, congés et organisation du travail
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="work_time.weekly_hours"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Heures Hebdomadaires *</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                              />
                            </FormControl>
                            <FormDescription>Max 44h (loi marocaine)</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="work_time.daily_hours"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Heures Journalières *</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                              />
                            </FormControl>
                            <FormDescription>Max 10h par jour</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="work_time.annual_leave_days"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Congés Annuels *</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                              />
                            </FormControl>
                            <FormDescription>Min 18 jours/an</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="work_time.work_schedule"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Horaire de Travail *</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Ex: 09:00 - 18:00" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="work_time.rest_day"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Jour de Repos *</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Ex: Dimanche" />
                            </FormControl>
                            <FormDescription>Repos hebdomadaire</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Options Supplémentaires</h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="work_time.overtime_authorized"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>Heures Supplémentaires</FormLabel>
                                <FormDescription>
                                  Autorise les heures supplémentaires
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="work_time.night_work"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>Travail de Nuit</FormLabel>
                                <FormDescription>
                                  Travail entre 21h et 6h
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* TAB 5: SALAIRE */}
              <TabsContent value="salaire" className="space-y-4 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Banknote className="h-5 w-5" />
                      Rémunération
                    </CardTitle>
                    <CardDescription>
                      Salaire de base, primes et avantages
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200">
                      <p className="text-sm font-medium flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        SMIG 2025: 3 112,85 MAD/mois (secteur général)
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="salary.base_salary"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Salaire de Base Brut *</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                placeholder="3500"
                              />
                            </FormControl>
                            <FormDescription>En MAD</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <SelectField
                        name="salary.payment_method"
                        label="Mode de Paiement *"
                        control={form.control}
                        options={paymentMethodOptions}
                        displayField="label"
                        placeholder="Sélectionner"
                      />
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Award className="h-5 w-5" />
                        Primes et Indemnités
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="salary.primes.prime_transport"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Prime de Transport</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                  placeholder="0"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="salary.primes.prime_panier"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Prime de Panier</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                  placeholder="0"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="salary.primes.prime_anciennete"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Prime d&apos;Ancienneté</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                  placeholder="0"
                                />
                              </FormControl>
                              <FormDescription>5% après 2 ans</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Avantages en Nature</h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="salary.avantages_nature.laptop"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>Ordinateur Portable</FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="salary.avantages_nature.telephone"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>Téléphone</FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="salary.avantages_nature.voiture_fonction"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>Voiture de Fonction</FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <Separator />

                    <div className="p-4 bg-muted rounded-lg space-y-2">
                      <h4 className="font-semibold">Récapitulatif Salaire</h4>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Brut Total</p>
                          <p className="font-semibold">{form.watch('salary.salary_brut')?.toFixed(2) || '0.00'} MAD</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Net avant IR</p>
                          <p className="font-semibold">{form.watch('salary.salary_net')?.toFixed(2) || '0.00'} MAD</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Net Imposable</p>
                          <p className="font-semibold">{form.watch('salary.salary_net_imposable')?.toFixed(2) || '0.00'} MAD</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* TAB 6: LÉGAL */}
              <TabsContent value="legal" className="space-y-4 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Aspects Légaux et Sociaux
                    </CardTitle>
                    <CardDescription>
                      CNSS, AMO, clauses contractuelles
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Protection Sociale</h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="legal.cnss_affiliation"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>Affiliation CNSS *</FormLabel>
                                <FormDescription>
                                  Cotisation CNSS obligatoire
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="legal.amo"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>AMO *</FormLabel>
                                <FormDescription>
                                  Assurance Maladie Obligatoire
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>

                      {cnssAffiliation && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="legal.cnss_number"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Numéro CNSS</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="1234567890" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="legal.amo_number"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Numéro AMO</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="AMO123456" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Clauses Contractuelles</h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="legal.clauses.confidentialite"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>Clause de Confidentialité</FormLabel>
                                <FormDescription>
                                  Protection des informations sensibles
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="legal.clauses.non_concurrence"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>Clause de Non-Concurrence</FormLabel>
                                <FormDescription>
                                  Interdiction de concurrence post-contrat
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="legal.clauses.intellectual_property"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>Propriété Intellectuelle</FormLabel>
                                <FormDescription>
                                  Cession des droits d&apos;auteur
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="legal.clauses.discipline_interne"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>Règlement Intérieur</FormLabel>
                                <FormDescription>
                                  Acceptation du règlement intérieur
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Médecine du Travail</h3>

                      <FormField
                        control={form.control}
                        name="legal.visite_medicale_embauche"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Visite Médicale d&apos;Embauche</FormLabel>
                              <FormDescription>
                                Visite médicale obligatoire avant embauche
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Action Buttons */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={loading}
                  >
                    Annuler
                  </Button>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        form.setValue('status', 'Brouillon');
                        form.handleSubmit(onSubmit)();
                      }}
                      disabled={loading}
                    >
                      Brouillon
                    </Button>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="min-w-[150px]"
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      {loading ? 'Création...' : 'Valider & Créer'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </form>
        </Form>

        {/* Modal de Récapitulatif */}
        <Dialog open={showRecapModal} onOpenChange={setShowRecapModal}>
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                Récapitulatif du Contrat
              </DialogTitle>
              <DialogDescription>
                Vérifiez les informations avant la création finale du contrat
              </DialogDescription>
            </DialogHeader>

            <ScrollArea className="max-h-[60vh] pr-4">
              {formDataToSubmit && (
                <div className="space-y-4">
                  {/* Employé & Type */}
                  <div className="bg-muted p-4 rounded-lg">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Employé & Type
                    </h3>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Employé</p>
                        <p className="font-medium">
                          {employees.find((e) => String(e.id) === String(formDataToSubmit.employe_id))?.firstName}{' '}
                          {employees.find((e) => String(e.id) === String(formDataToSubmit.employe_id))?.lastName}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Référence</p>
                        <p className="font-medium">{formDataToSubmit.reference}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Type Contrat</p>
                        <Badge>{formDataToSubmit.type}</Badge>
                      </div>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="bg-muted p-4 rounded-lg">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Dates
                    </h3>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Date Début</p>
                        <p className="font-medium">{formDataToSubmit.dates.start_date}</p>
                      </div>
                      {formDataToSubmit.dates.end_date && (
                        <div>
                          <p className="text-muted-foreground">Date Fin</p>
                          <p className="font-medium">{formDataToSubmit.dates.end_date}</p>
                        </div>
                      )}
                      {formDataToSubmit.dates.trial_period && (
                        <div>
                          <p className="text-muted-foreground">Période Essai</p>
                          <p className="font-medium">{formDataToSubmit.dates.trial_period.duration_months} mois</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Poste */}
                  <div className="bg-muted p-4 rounded-lg">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      Poste
                    </h3>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Intitulé</p>
                        <p className="font-medium">{formDataToSubmit.job.title}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Catégorie</p>
                        <p className="font-medium">{formDataToSubmit.job.category}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Lieu</p>
                        <p className="font-medium">{formDataToSubmit.job.work_location}</p>
                      </div>
                    </div>
                  </div>

                  {/* Temps de Travail */}
                  <div className="bg-muted p-4 rounded-lg">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Temps de Travail
                    </h3>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Heures/Semaine</p>
                        <p className="font-medium">{formDataToSubmit.work_time.weekly_hours}h</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Horaire</p>
                        <p className="font-medium">{formDataToSubmit.work_time.work_schedule}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Congés/An</p>
                        <p className="font-medium">{formDataToSubmit.work_time.annual_leave_days} jours</p>
                      </div>
                    </div>
                    {formDataToSubmit.work_time.shift && (
                      <div className="mt-2 pt-2 border-t">
                        <p className="text-sm"><span className="text-muted-foreground">Shift:</span> <Badge variant="outline">{formDataToSubmit.work_time.shift}</Badge></p>
                      </div>
                    )}
                  </div>

                  {/* Salaire */}
                  <div className="bg-muted p-4 rounded-lg">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Banknote className="h-4 w-4" />
                      Rémunération
                    </h3>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Salaire Base</p>
                        <p className="font-medium text-lg">{formDataToSubmit.salary.base_salary.toFixed(2)} MAD</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Salaire Brut</p>
                        <p className="font-medium text-lg">{formDataToSubmit.salary.salary_brut.toFixed(2)} MAD</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Salaire Net</p>
                        <p className="font-medium text-lg text-green-600">{formDataToSubmit.salary.salary_net.toFixed(2)} MAD</p>
                      </div>
                    </div>
                    {(formDataToSubmit.salary.primes?.prime_transport ||
                      formDataToSubmit.salary.primes?.prime_panier ||
                      formDataToSubmit.salary.primes?.prime_anciennete) && (
                      <div className="mt-2 pt-2 border-t">
                        <p className="text-sm font-medium mb-1">Primes:</p>
                        <div className="flex flex-wrap gap-2">
                          {formDataToSubmit.salary.primes.prime_transport > 0 && (
                            <Badge variant="secondary">Transport: {formDataToSubmit.salary.primes.prime_transport} MAD</Badge>
                          )}
                          {formDataToSubmit.salary.primes.prime_panier > 0 && (
                            <Badge variant="secondary">Panier: {formDataToSubmit.salary.primes.prime_panier} MAD</Badge>
                          )}
                          {formDataToSubmit.salary.primes.prime_anciennete > 0 && (
                            <Badge variant="secondary">Ancienneté: {formDataToSubmit.salary.primes.prime_anciennete} MAD</Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Protection Sociale */}
                  <div className="bg-muted p-4 rounded-lg">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Protection Sociale & Clauses
                    </h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        {formDataToSubmit.legal.cnss_affiliation ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-gray-400" />
                        )}
                        <span>CNSS</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {formDataToSubmit.legal.amo ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-gray-400" />
                        )}
                        <span>AMO</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {formDataToSubmit.legal.clauses?.confidentialite ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-gray-400" />
                        )}
                        <span>Confidentialité</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {formDataToSubmit.legal.clauses?.non_concurrence ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-gray-400" />
                        )}
                        <span>Non-Concurrence</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </ScrollArea>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowRecapModal(false)}
                disabled={loading}
              >
                Modifier
              </Button>
              <Button
                type="button"
                onClick={confirmSubmit}
                disabled={loading}
                className="min-w-[150px]"
              >
                {loading ? (
                  'Création...'
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Confirmer & Créer
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageContainer>
  );
}

