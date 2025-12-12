'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Save,
  Info,
  User,
  Briefcase,
  Clock,
  DollarSign,
  FileSignature,
  Calendar,
  Building2,
  TrendingUp,
  CheckCircle2
} from 'lucide-react';
import { apiRoutes } from '@/config/apiRoutes';
import apiClient from '@/lib/api';
import PageContainer from '@/components/layout/page-container';
import { Contract } from '@/types/contract';
import { formatDateLong } from '@/lib/date-utils';
import { DatePickerField } from '@/components/custom/DatePickerField';
import { SelectField } from '@/components/custom/SelectField';

// Schema de validation pour avenant - Conforme aux champs réels
const avenantSchema = z.object({
  // Métadonnées de l'avenant
  date_effet: z.string().min(1, 'La date d\'effet est obligatoire'),
  objet: z.string().min(10, 'L\'objet doit contenir au moins 10 caractères'),
  motif: z.string().min(20, 'Le motif doit être explicite (min. 20 caractères)'),
  type_modification: z.enum(['salary', 'schedule', 'job']),

  // Poste (conforme à GeneralInfoTab)
  poste: z.string().optional(),
  department_id: z.string().optional(),
  metier: z.string().optional(),
  emploie: z.string().optional(),
  work_mode: z.string().optional(),
  classification: z.string().optional(),
  work_location: z.string().optional(),
  responsibilities: z.string().optional(),

  // Salaire (conforme à SalaryAndLegalTab)
  salary_brut: z.number().positive().optional(),
  salary_net: z.number().positive().optional(),
  currency: z.string().optional(),
  payment_method: z.string().optional(),
  payment_frequency: z.string().optional(),

  // Horaires (conforme à WorkScheduleTab - UNIQUEMENT les champs existants)
  schedule_type: z.string().optional(),
  shift_work: z.string().optional(),
  annual_leave_days: z.number().optional(),
  other_leaves: z.string().optional(),

  // Justification et workflow
  justification: z.string().min(20, 'La justification doit être détaillée'),
  validation_manager: z.boolean().default(false),
  validation_rh: z.boolean().default(false),
  notes: z.string().optional()
});

type AvenantFormData = z.infer<typeof avenantSchema>;

interface Department {
  id: number;
  name: string;
}

export default function CreateAvenantPage() {
  const params = useParams();
  const router = useRouter();
  const contractId = params.id as string;

  const [contract, setContract] = useState<Contract | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [nextNumero, setNextNumero] = useState(1);

  const form = useForm<AvenantFormData>({
    resolver: zodResolver(avenantSchema),
    defaultValues: {
      date_effet: new Date().toISOString().split('T')[0],
      objet: '',
      motif: '',
      type_modification: 'salary',
      validation_manager: false,
      validation_rh: false,
      currency: 'MAD',
      payment_method: 'Virement',
      payment_frequency: 'Mensuel',
      shift_work: 'Non'
    }
  });

  const typeModification = form.watch('type_modification');

  // Options (identiques à la création)
  const workModeOptions = [
    { id: 'Presentiel', label: 'Présentiel' },
    { id: 'Remote', label: 'Télétravail' },
    { id: 'Hybride', label: 'Hybride' }
  ];

  const paymentMethodOptions = [
    { id: 'Virement', label: 'Virement Bancaire' },
    { id: 'Cheque', label: 'Chèque' },
    { id: 'Especes', label: 'Espèces' }
  ];

  const scheduleTypeOptions = [
    { id: 'Administratif', label: 'Horaire Administratif' },
    { id: 'Continu', label: 'Horaire Continu' }
  ];

  const shiftWorkOptions = [
    { id: 'Non', label: 'Non' },
    { id: 'Oui', label: 'Oui' }
  ];

  // Chargement des données
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Charger le contrat
        const contractResponse = await apiClient.get(
          apiRoutes.admin.contratsEtMovements.contrats.show(contractId)
        );

        if (contractResponse.data) {
          const contractData = contractResponse.data.data || contractResponse.data;
          setContract(contractData);

          // Pré-remplir avec valeurs actuelles
          form.reset({
            date_effet: new Date().toISOString().split('T')[0],
            objet: '',
            motif: '',
            type_modification: 'salary',
            validation_manager: false,
            validation_rh: false,
            poste: contractData.job?.poste || '',
            department_id: contractData.job?.department || '',
            metier: contractData.job?.metier || '',
            emploie: contractData.job?.emploie || '',
            work_mode: contractData.job?.work_mode || '',
            classification: contractData.job?.classification || '',
            work_location: contractData.job?.work_location || '',
            responsibilities: contractData.job?.responsibilities || '',
            salary_brut: contractData.salary?.salary_brut || 0,
            salary_net: contractData.salary?.salary_net || 0,
            currency: contractData.salary?.currency || 'MAD',
            payment_method: contractData.salary?.payment_method || 'Virement',
            payment_frequency: contractData.salary?.payment_frequency || 'Mensuel',
            schedule_type: contractData.schedule?.schedule_type || '',
            shift_work: contractData.schedule?.shift_work || 'Non',
            annual_leave_days: contractData.schedule?.annual_leave_days || 22,
            other_leaves: contractData.schedule?.other_leaves || ''
          });
        }

        // Charger les départements
        const deptResponse = await apiClient.get('/departments');
        if (deptResponse.data) {
          setDepartments(Array.isArray(deptResponse.data) ? deptResponse.data : deptResponse.data.data || []);
        }

        // Charger avenants pour numérotation
        try {
          const avenantsResponse = await apiClient.get(
            apiRoutes.admin.contratsEtMovements.avenants.byContract(contractId)
          );
          const avenants = Array.isArray(avenantsResponse.data)
            ? avenantsResponse.data
            : avenantsResponse.data?.data || [];
          setNextNumero(avenants.length + 1);
        } catch (err) {
          setNextNumero(1);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Erreur lors du chargement des données');
        router.push(`/admin/contrats-mouvements/contrats`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [contractId, router, form]);

  const onSubmit = async (data: AvenantFormData) => {
    if (!contract) return;

    setSaving(true);
    try {
      const changes: Record<string, any> = {};

      if (typeModification === 'salary') {
        changes.salary = {
          avant: {
            salary_brut: contract.salary?.salary_brut,
            salary_net: contract.salary?.salary_net,
            currency: contract.salary?.currency,
            payment_method: contract.salary?.payment_method
          },
          apres: {
            salary_brut: data.salary_brut,
            salary_net: data.salary_net,
            currency: data.currency,
            payment_method: data.payment_method
          }
        };
      }

      if (typeModification === 'schedule') {
        changes.schedule = {
          avant: {
            schedule_type: contract.schedule?.schedule_type,
            shift_work: contract.schedule?.shift_work,
            annual_leave_days: contract.schedule?.annual_leave_days,
            other_leaves: contract.schedule?.other_leaves
          },
          apres: {
            schedule_type: data.schedule_type,
            shift_work: data.shift_work,
            annual_leave_days: data.annual_leave_days,
            other_leaves: data.other_leaves
          }
        };
      }

      if (typeModification === 'job') {
        changes.job = {
          avant: {
            poste: contract.job?.poste,
            department: contract.job?.department,
            classification: contract.job?.classification,
            work_mode: contract.job?.work_mode
          },
          apres: {
            poste: data.poste,
            department: departments.find(d => d.id.toString() === data.department_id)?.name || data.department_id,
            classification: data.classification,
            work_mode: data.work_mode
          }
        };
      }

      const avenantData = {
        id: `AVN-${Date.now()}`,
        contract_id: contractId,
        numero: nextNumero,
        date: data.date_effet,
        objet: data.objet,
        motif: data.motif,
        description: `${data.objet}\n\nMotif: ${data.motif}\n\nJustification: ${data.justification}`,
        status: 'Brouillon',
        type_modification: typeModification,
        changes,
        validations: {
          manager: data.validation_manager,
          rh: data.validation_rh
        },
        notes: data.notes,
        created_at: new Date().toISOString(),
        created_by: 'current-user'
      };

      const response = await apiClient.post(
        apiRoutes.admin.contratsEtMovements.avenants.create,
        avenantData
      );

      if (response.data) {
        toast.success(`Avenant N°${nextNumero} créé avec succès`);
        router.push(`/admin/contrats-mouvements/contrats/${contractId}/details?tab=documents`);
      }
    } catch (error) {
      console.error('Error creating avenant:', error);
      toast.error('Erreur lors de la création de l\'avenant');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PageContainer scrollable>
        <div className='flex h-[50vh] items-center justify-center'>
          <div className='text-center'>
            <div className='mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent' />
            <p className='text-muted-foreground mt-4'>Chargement du contrat...</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (!contract) {
    return null;
  }

  return (
    <PageContainer scrollable={true}>
      <div className=' w-full space-y-6  '>
        {/* Header avec gradient */}
        <div className='relative overflow-hidden rounded-lg border bg-gradient-to-r from-primary/10 via-primary/5 to-background p-6'>
          <div className='relative z-10'>
            <div className='flex items-center justify-between'>
              <div>
                <div className='flex items-center gap-3 mb-2'>
                  <h1 className='text-3xl font-bold'>Créer un Avenant</h1>
                  <Badge variant='outline' className='text-base px-3 py-1'>
                    <FileSignature className='mr-2 h-4 w-4' />
                    Avenant N°{nextNumero}
                  </Badge>
                </div>
                <p className='text-muted-foreground flex items-center gap-2'>
                  <span className='font-medium'>{contract.reference}</span>
                  <Separator orientation='vertical' className='h-4' />
                  <span>{contract.employee_name}</span>
                  <Separator orientation='vertical' className='h-4' />
                  <Badge variant='secondary'>{contract.type}</Badge>
                </p>
              </div>

              {/* Actions à droite */}
              <div className='flex items-center gap-3'>
                <Button
                  type='button'
                  variant='outline'
                  size='lg'
                  onClick={() => router.push(`/admin/contrats-mouvements/contrats/${contractId}/details?tab=documents`)}
                >
                  <ArrowLeft className='mr-2 h-4 w-4' />
                  Retour au contrat
                </Button>
                <Button
                  onClick={form.handleSubmit(onSubmit)}
                  size='lg'
                  disabled={saving}
                  className='min-w-[200px]'
                >
                  {saving ? (
                    <>
                      <div className='mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent' />
                      Création...
                    </>
                  ) : (
                    <>
                      <Save className='mr-2 h-4 w-4' />
                      Créer l&apos;Avenant
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
        <div className='grid grid-cols-1 gap-6 xl:grid-cols-4'>
          {/* Sidebar: Récapitulatif (25%) */}
          <div className='xl:col-span-1'>
            <div className='sticky top-4 space-y-4'>
              {/* Card Employé */}
              <Card >
                <CardHeader className='pb-3'>
                  <CardTitle className='flex items-center gap-2 text-sm'>
                    <User className='h-4 w-4 text-purple-500' />
                    Employé
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-3 text-sm'>
                  <div className='rounded-lg bg-muted/50 p-3'>
                    <span className='text-muted-foreground text-xs block mb-1'>Nom complet</span>
                    <p className='font-semibold'>{contract.employee_name}</p>
                  </div>
                  <div className='rounded-lg bg-muted/50 p-3'>
                    <span className='text-muted-foreground text-xs block mb-1'>Matricule</span>
                    <p className='font-mono text-xs font-medium'>{contract.employee_matricule}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Card Contrat */}
              <Card>
                <CardHeader className='pb-3'>
                  <CardTitle className='flex items-center gap-2 text-sm'>
                    <FileSignature className='h-4 w-4 text-purple-500' />
                    Contrat Original
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-3 text-sm'>
                  <div className='flex items-center justify-between'>
                    <span className='text-muted-foreground text-xs'>Type</span>
                    <Badge variant='secondary'>{contract.type}</Badge>
                  </div>
                  <Separator />
                  <div className='flex items-center justify-between'>
                    <span className='text-muted-foreground text-xs'>Statut</span>
                    <Badge>{contract.status}</Badge>
                  </div>
                  <Separator />
                  <div>
                    <span className='text-muted-foreground text-xs block mb-1'>Date de début</span>
                    <p className='text-xs font-medium'>{formatDateLong(contract.dates.start_date)}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Card Valeurs Actuelles */}
              <Card>
                <CardHeader className='pb-3'>
                  <CardTitle className='flex items-center gap-2 text-sm'>
                    <TrendingUp className='h-4 w-4 text-purple-500' />
                    Valeurs Actuelles
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-3 text-xs'>
                  <div>
                    <p className='text-muted-foreground mb-1'>Poste</p>
                    <p className='font-semibold'>{contract.job?.poste || 'N/A'}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className='text-muted-foreground mb-1'>Département</p>
                    <p className='font-medium'>{contract.job?.department || 'N/A'}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className='text-muted-foreground mb-1'>Salaire Brut</p>
                    <p className='font-mono font-bold text-purple-700'>{contract.salary?.salary_brut || 0} MAD</p>
                  </div>
                  <Separator />
                  <div>
                    <p className='text-muted-foreground mb-1'>Horaire</p>
                    <p className='font-medium'>{contract.schedule?.schedule_type || 'N/A'}</p>
                    <p className='text-muted-foreground mt-1'>{contract.schedule?.annual_leave_days || 0} jours de congés</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main: Formulaire (75%) */}
          <div className='xl:col-span-3'>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
                {/* Métadonnées */}
                <Card className='shadow-sm  pt-0'>
                  <CardHeader className='bg-purple-50 dark:bg-purple-950 pt-2'>
                    <CardTitle className='flex items-center gap-2 text-primary dark:text-purple-400'>
                      <Calendar className='h-5 w-5 text-primary' />
                      Informations de l&apos;Avenant
                    </CardTitle>
                    <CardDescription>
                      Renseignements obligatoires pour cet avenant contractuel
                    </CardDescription>
                  </CardHeader>
                  <CardContent className='space-y-6 pt-6'>
                    <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                      <FormField
                        control={form.control}
                        name='date_effet'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className='flex items-center gap-2'>
                              <Calendar className='h-4 w-4' />
                              Date d&apos;effet *
                            </FormLabel>
                            <FormControl>
                              <DatePickerField
                                value={field.value ? new Date(field.value) : undefined}
                                onChange={(date) => {
                                  if (date && typeof date === 'object' && 'toISOString' in date) {
                                    field.onChange((date as Date).toISOString().split('T')[0]);
                                  } else if (typeof date === 'string') {
                                    field.onChange(date);
                                  }
                                }}
                                placeholder="Date d'entrée en vigueur"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name='type_modification'
                        render={() => (
                          <FormItem>
                            <FormLabel className='flex items-center gap-2'>
                              <CheckCircle2 className='h-4 w-4' />
                              Type de modification *
                            </FormLabel>
                            <FormControl>
                              <SelectField
                                control={form.control}
                                name='type_modification'
                                label=''
                                displayField='label'
                                placeholder='Sélectionner'
                                options={[
                                  { id: 'salary', label: 'Modification de Salaire' },
                                  { id: 'schedule', label: 'Modification d\'Horaire' },
                                  { id: 'job', label: 'Modification de Poste' },
                                ]}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name='objet'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Objet de l&apos;avenant *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder='Ex: Promotion au poste de Senior Developer avec augmentation salariale'
                              className='text-base'
                              {...field}
                            />
                          </FormControl>
                          <FormDescription className='text-xs'>
                            Titre concis et explicite (minimum 10 caractères)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='motif'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Motif de la modification *</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder='Expliquer les raisons administratives justifiant cette modification contractuelle...'
                              className='min-h-[100px] text-sm'
                              {...field}
                            />
                          </FormControl>
                          <FormDescription className='text-xs'>
                            Justification administrative détaillée (minimum 20 caractères)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Tabs Modifications */}
                <Tabs value={typeModification} onValueChange={(value) => form.setValue('type_modification', value as any)} className='w-full'>
                  <TabsList className='grid w-full grid-cols-4 h-auto'>
                    <TabsTrigger value='salary' className='data-[state=active]:bg-purple-500 data-[state=active]:text-white'>
                      <DollarSign className='mr-2 h-4 w-4' />
                      Salaire
                    </TabsTrigger>
                    <TabsTrigger value='schedule' className='data-[state=active]:bg-purple-500 data-[state=active]:text-white'>
                      <Clock className='mr-2 h-4 w-4' />
                      Horaire
                    </TabsTrigger>
                    <TabsTrigger value='job' className='data-[state=active]:bg-purple-500 data-[state=active]:text-white'>
                      <Briefcase className='mr-2 h-4 w-4' />
                      Poste
                    </TabsTrigger>
                  </TabsList>

                  {/* TAB: Salaire */}
                  <TabsContent value='salary' className='mt-6'>
                    <Card className='shadow-sm border-l-4 border-l-purple-500 pt-0'>
                      <CardHeader className='bg-purple-50 dark:bg-purple-950 pt-2'>
                        <CardTitle className='flex items-center gap-2 text-purple-700 dark:text-purple-400'>
                          <DollarSign className='h-5 w-5' />
                          Rémunération
                        </CardTitle>
                        <CardDescription>
                          Modifier les éléments de rémunération (conformes à SalaryAndLegalTab)
                        </CardDescription>
                      </CardHeader>
                      <CardContent className='space-y-6 pt-6'>
                        <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                          <FormField
                            control={form.control}
                            name='salary_brut'
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className='text-base'>Salaire Brut (MAD) *</FormLabel>
                                <FormControl>
                                  <Input
                                    type='number'
                                    step='0.01'
                                    className='text-base font-semibold'
                                    {...field}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                  />
                                </FormControl>
                                <FormDescription className='flex items-center gap-2 text-xs'>
                                  <span className='text-muted-foreground'>Actuel:</span>
                                  <span className='font-mono font-bold text-purple-700'>{contract.salary?.salary_brut || 0} MAD</span>
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name='salary_net'
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className='text-base'>Salaire Net (MAD)</FormLabel>
                                <FormControl>
                                  <Input
                                    type='number'
                                    step='0.01'
                                    className='text-base font-semibold'
                                    {...field}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                  />
                                </FormControl>
                                <FormDescription className='flex items-center gap-2 text-xs'>
                                  <span className='text-muted-foreground'>Actuel:</span>
                                  <span className='font-mono font-bold text-purple-700'>{contract.salary?.salary_net || 0} MAD</span>
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name='payment_method'
                            render={() => (
                              <FormItem>
                                <FormLabel>Mode de Paiement</FormLabel>
                                <FormControl>
                                  <SelectField
                                    control={form.control}
                                    name='payment_method'
                                    label=''
                                    displayField='label'
                                    options={paymentMethodOptions}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name='currency'
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Devise</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder='MAD' />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* TAB: Horaire (CONFORMÉ à WorkScheduleTab) */}
                  <TabsContent value='schedule' className='mt-6'>
                    <Card className='shadow-sm border-l-4 border-l-purple-500 pt-0'>
                      <CardHeader className='bg-purple-50 dark:bg-purple-950 pt-2'>
                        <CardTitle className='flex items-center gap-2 text-purple-700 dark:text-purple-400'>
                          <Clock className='h-5 w-5' />
                          Temps de Travail
                        </CardTitle>
                        <CardDescription>
                          Modifier les horaires et congés (conformes à WorkScheduleTab)
                        </CardDescription>
                      </CardHeader>
                      <CardContent className='space-y-6 pt-6'>
                        {/* Champs EXACTEMENT comme dans WorkScheduleTab */}
                        <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                          <FormField
                            control={form.control}
                            name='schedule_type'
                            render={() => (
                              <FormItem>
                                <FormLabel className='text-base'>Type d&apos;Horaire *</FormLabel>
                                <FormControl>
                                  <SelectField
                                    control={form.control}
                                    name='schedule_type'
                                    label=''
                                    displayField='label'
                                    placeholder='Sélectionner le type'
                                    options={scheduleTypeOptions}
                                  />
                                </FormControl>
                                <FormDescription className='flex items-center gap-2 text-xs'>
                                  <span className='text-muted-foreground'>Actuel:</span>
                                  <span className='font-medium'>{contract.schedule?.schedule_type || 'N/A'}</span>
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name='shift_work'
                            render={() => (
                              <FormItem>
                                <FormLabel>Travail en Shift</FormLabel>
                                <FormControl>
                                  <SelectField
                                    control={form.control}
                                    name='shift_work'
                                    label=''
                                    displayField='label'
                                    placeholder='Sélectionner si applicable'
                                    options={shiftWorkOptions}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name='annual_leave_days'
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Congés Annuels (jours)</FormLabel>
                                <FormControl>
                                  <Input
                                    type='number'
                                    placeholder='22'
                                    {...field}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                  />
                                </FormControl>
                                <FormDescription className='flex items-center gap-2 text-xs'>
                                  <span className='text-muted-foreground'>Actuel:</span>
                                  <span className='font-medium'>{contract.schedule?.annual_leave_days || 0} jours</span>
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name='other_leaves'
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Autres Congés</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder='Ex: congés exceptionnels'
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* TAB: Poste (avec département en SELECT) */}
                  <TabsContent value='job' className='mt-6'>
                    <Card className='shadow-sm border-l-4 border-l-purple-500 pt-0'>
                      <CardHeader className='bg-purple-50 dark:bg-purple-950 pt-2'>
                        <CardTitle className='flex items-center gap-2 text-purple-700 dark:text-purple-400'>
                          <Briefcase className='h-5 w-5' />
                          Poste et Fonction
                        </CardTitle>
                        <CardDescription>
                          Modifier les informations du poste (conformes à GeneralInfoTab)
                        </CardDescription>
                      </CardHeader>
                      <CardContent className='space-y-6 pt-6'>
                        <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                          <FormField
                            control={form.control}
                            name='poste'
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className='text-base'>Intitulé du Poste *</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder='Ex: Senior Developer' className='text-base' />
                                </FormControl>
                                <FormDescription className='flex items-center gap-2 text-xs'>
                                  <span className='text-muted-foreground'>Actuel:</span>
                                  <span className='font-medium'>{contract.job?.poste || 'N/A'}</span>
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Département en SELECT */}
                          <FormField
                            control={form.control}
                            name='department_id'
                            render={() => (
                              <FormItem>
                                <FormLabel className='flex items-center gap-2'>
                                  <Building2 className='h-4 w-4' />
                                  Département
                                </FormLabel>
                                <FormControl>
                                  <SelectField
                                    control={form.control}
                                    name='department_id'
                                    label=''
                                    displayField='label'
                                    placeholder='Sélectionner un département'
                                    options={departments.map(dept => ({
                                      id: dept.id.toString(),
                                      label: dept.name
                                    }))}
                                  />
                                </FormControl>
                                <FormDescription className='flex items-center gap-2 text-xs'>
                                  <span className='text-muted-foreground'>Actuel:</span>
                                  <span className='font-medium'>{contract.job?.department || 'N/A'}</span>
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name='metier'
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Métier</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder='Ex: Informatique' />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name='emploie'
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Emploi</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder='Ex: Développeur' />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name='work_mode'
                            render={() => (
                              <FormItem>
                                <FormLabel>Mode de Travail</FormLabel>
                                <FormControl>
                                  <SelectField
                                    control={form.control}
                                    name='work_mode'
                                    label=''
                                    displayField='label'
                                    options={workModeOptions}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name='classification'
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Classification</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder='Ex: Niveau 5 - Échelon 2' />
                                </FormControl>
                                <FormDescription className='flex items-center gap-2 text-xs'>
                                  <span className='text-muted-foreground'>Actuel:</span>
                                  <span className='font-medium'>{contract.job?.classification || 'N/A'}</span>
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name='work_location'
                            render={({ field }) => (
                              <FormItem className='lg:col-span-2'>
                                <FormLabel>Lieu de Travail</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder='Ex: Casablanca, Maroc' />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name='responsibilities'
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Responsabilités</FormLabel>
                              <FormControl>
                                <Textarea
                                  {...field}
                                  placeholder='Décrire les nouvelles responsabilités du poste...'
                                  className='min-h-[120px]'
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>

                {/* Justification */}
                <Card className='shadow-sm border-t-4 border-t-yellow-500 pt-0'>
                  <CardHeader className='bg-yellow-50 dark:bg-yellow-950 pt-2'>
                    <CardTitle className='text-yellow-700 dark:text-yellow-400'>Justification Détaillée *</CardTitle>
                    <CardDescription>
                      Justification complète et explicite de la modification (obligatoire)
                    </CardDescription>
                  </CardHeader>
                  <CardContent className='pt-6'>
                    <FormField
                      control={form.control}
                      name='justification'
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder='Expliquer en détail les raisons RH, le contexte et les impacts de cette modification contractuelle...'
                              className='min-h-[150px] text-sm'
                            />
                          </FormControl>
                          <FormDescription className='text-xs'>
                            Minimum 20 caractères requis - Soyez précis et exhaustif
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Workflow */}
                <Card className='shadow-sm'>
                  <CardHeader>
                    <CardTitle>Workflow de Validation</CardTitle>
                    <CardDescription>
                      Définir le circuit d&apos;approbation requis pour cet avenant
                    </CardDescription>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    <FormField
                      control={form.control}
                      name='validation_manager'
                      render={({ field }) => (
                        <FormItem className='flex flex-row items-start space-x-3 space-y-0 rounded-lg border-2 border-dashed p-4 transition-colors hover:border-primary'>
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className='space-y-1 leading-none'>
                            <FormLabel className='text-base font-semibold'>
                              Validation du manager requise
                            </FormLabel>
                            <FormDescription>
                              L&apos;avenant nécessite l&apos;approbation du manager direct de l&apos;employé
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='validation_rh'
                      render={({ field }) => (
                        <FormItem className='flex flex-row items-start space-x-3 space-y-0 rounded-lg border-2 border-dashed p-4 transition-colors hover:border-primary'>
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className='space-y-1 leading-none'>
                            <FormLabel className='text-base font-semibold'>
                              Validation RH requise
                            </FormLabel>
                            <FormDescription>
                              L&apos;avenant nécessite l&apos;approbation du service des Ressources Humaines
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='notes'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes internes (optionnel)</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder='Notes et commentaires à usage interne RH...'
                              className='min-h-[80px] text-sm'
                            />
                          </FormControl>
                          <FormDescription className='text-xs'>
                            Ces notes sont visibles uniquement par le service RH
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}


