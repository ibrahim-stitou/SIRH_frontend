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
  User,
  Briefcase,
  Clock,
  DollarSign,
  FileSignature,
  Calendar,
  Building2,
  TrendingUp,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { apiRoutes } from '@/config/apiRoutes';
import apiClient from '@/lib/api';
import PageContainer from '@/components/layout/page-container';
import { Contract } from '@/types/contract';
import { formatDateLong } from '@/lib/date-utils';
import { DatePickerField } from '@/components/custom/DatePickerField';
import { SelectField } from '@/components/custom/SelectField';
import { AvenantFormSkeleton } from '@/components/custom/AvenantSkeleton';

// Schema de validation pour avenant
const avenantSchema = z.object({
  date_effet: z.string().min(1, 'La date d\'effet est obligatoire'),
  objet: z.string().min(10, 'L\'objet doit contenir au moins 10 caractères'),
  motif: z.string().min(20, 'Le motif doit être explicite (min. 20 caractères)'),
  type_modification: z.enum(['salary', 'schedule', 'job']),
  poste: z.string().optional(),
  department_id: z.string().optional(),
  metier: z.string().optional(),
  emploie: z.string().optional(),
  work_mode: z.string().optional(),
  classification: z.string().optional(),
  work_location: z.string().optional(),
  responsibilities: z.string().optional(),
  salary_brut: z.number().positive().optional(),
  salary_net: z.number().positive().optional(),
  currency: z.string().optional(),
  payment_method: z.string().optional(),
  payment_frequency: z.string().optional(),
  schedule_type: z.string().optional(),
  shift_work: z.string().optional(),
  annual_leave_days: z.number().optional(),
  other_leaves: z.string().optional(),
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

interface Avenant {
  id: string;
  contract_id: string;
  numero: number;
  date: string;
  objet: string;
  motif: string;
  description: string;
  status: 'Brouillon' | 'En_attente' | 'Signe';
  type_modification: string;
  changes: any;
  validations?: {
    manager: boolean;
    rh: boolean;
  };
  notes?: string;
  created_at: string;
  created_by: string;
}

export default function EditAvenantPage() {
  const params = useParams();
  const router = useRouter();
  const contractId = params.id as string;
  const avenantId = params.avenantId as string;

  const [contract, setContract] = useState<Contract | null>(null);
  const [avenant, setAvenant] = useState<Avenant | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditable, setIsEditable] = useState(true);

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const contractResponse = await apiClient.get(
          apiRoutes.admin.contratsEtMovements.contrats.show(contractId)
        );

        if (contractResponse.data) {
          const contractData = contractResponse.data.data || contractResponse.data;
          setContract(contractData);
        }

        const avenantResponse = await apiClient.get(
          apiRoutes.admin.contratsEtMovements.avenants.show(avenantId)
        );

        if (avenantResponse.data) {
          const avenantData = avenantResponse.data.data || avenantResponse.data;
          setAvenant(avenantData);

          const editable = avenantData.status === 'Brouillon';
          setIsEditable(editable);

          const changes = avenantData.changes || {};
          let formValues: any = {
            date_effet: avenantData.date || new Date().toISOString().split('T')[0],
            objet: avenantData.objet || '',
            motif: avenantData.motif || '',
            type_modification: avenantData.type_modification || 'salary',
            validation_manager: avenantData.validations?.manager || false,
            validation_rh: avenantData.validations?.rh || false,
            notes: avenantData.notes || ''
          };

          const description = avenantData.description || '';
          const justificationMatch = description.match(/Justification:\s*(.+?)(?:\n|$)/);
          formValues.justification = justificationMatch?.[1]?.trim() || '';

          if (avenantData.type_modification === 'salary' && changes.salary?.apres) {
            formValues = {
              ...formValues,
              salary_brut: changes.salary.apres.salary_brut || 0,
              salary_net: changes.salary.apres.salary_net || 0,
              currency: changes.salary.apres.currency || 'MAD',
              payment_method: changes.salary.apres.payment_method || 'Virement',
              payment_frequency: changes.salary.apres.payment_frequency || 'Mensuel'
            };
          }

          if (avenantData.type_modification === 'schedule' && changes.schedule?.apres) {
            formValues = {
              ...formValues,
              schedule_type: changes.schedule.apres.schedule_type || '',
              shift_work: changes.schedule.apres.shift_work || 'Non',
              annual_leave_days: changes.schedule.apres.annual_leave_days || 22,
              other_leaves: changes.schedule.apres.other_leaves || ''
            };
          }

          if (avenantData.type_modification === 'job' && changes.job?.apres) {
            formValues = {
              ...formValues,
              poste: changes.job.apres.poste || '',
              department_id: changes.job.apres.department || '',
              metier: changes.job.apres.metier || '',
              emploie: changes.job.apres.emploie || '',
              work_mode: changes.job.apres.work_mode || '',
              classification: changes.job.apres.classification || '',
              work_location: changes.job.apres.work_location || '',
              responsibilities: changes.job.apres.responsibilities || ''
            };
          }

          form.reset(formValues);
        }

        const deptResponse = await apiClient.get('/departments');
        if (deptResponse.data) {
          setDepartments(Array.isArray(deptResponse.data) ? deptResponse.data : deptResponse.data.data || []);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Erreur lors du chargement des données');
        router.push(`/admin/contrats-mouvements/contrats/${contractId}/details?tab=documents`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [contractId, avenantId, router, form]);

  const onSubmit = async (data: AvenantFormData) => {
    if (!contract || !avenant) return;

    if (!isEditable) {
      toast.error('Cet avenant ne peut plus être modifié');
      return;
    }

    setSaving(true);
    try {
      const changes: Record<string, any> = {};

      if (typeModification === 'salary') {
        changes.salary = {
          avant: avenant.changes?.salary?.avant || {
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
          avant: avenant.changes?.schedule?.avant || {
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
          avant: avenant.changes?.job?.avant || {
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

      const updatedAvenantData = {
        ...avenant,
        date: data.date_effet,
        objet: data.objet,
        motif: data.motif,
        description: `${data.objet}\n\nMotif: ${data.motif}\n\nJustification: ${data.justification}`,
        type_modification: typeModification,
        changes,
        validations: {
          manager: data.validation_manager,
          rh: data.validation_rh
        },
        notes: data.notes,
        updated_at: new Date().toISOString(),
        updated_by: 'current-user'
      };

      const response = await apiClient.put(
        apiRoutes.admin.contratsEtMovements.avenants.update(avenantId),
        updatedAvenantData
      );

      if (response.data) {
        toast.success(`Avenant N°${avenant.numero} modifié avec succès`);
        router.push(`/admin/contrats-mouvements/contrats/${contractId}/avenants/${avenantId}`);
      }
    } catch (error) {
      console.error('Error updating avenant:', error);
      toast.error('Erreur lors de la modification de l\'avenant');
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    router.push(`/admin/contrats-mouvements/contrats/${contractId}/avenants/${avenantId}`);
  };

  if (loading) {
    return (
      <PageContainer scrollable={true}>
        <AvenantFormSkeleton />
      </PageContainer>
    );
  }

  if (!contract || !avenant) {
    return null;
  }

  return (
    <PageContainer scrollable={true}>
      <div className='w-full space-y-6'>
        {/* Header avec gradient */}
        <div className='relative overflow-hidden rounded-lg border bg-gradient-to-r from-primary/10 via-primary/5 to-background p-6'>
          <div className='relative z-10'>
            <div className='flex items-center justify-between'>
              <div>
                <div className='flex items-center gap-3 mb-2'>
                  <h1 className='text-3xl font-bold'>Modifier un Avenant</h1>
                  <Badge variant='outline' className='text-base px-3 py-1'>
                    <FileSignature className='mr-2 h-4 w-4' />
                    Avenant N°{avenant.numero}
                  </Badge>
                  <Badge
                    variant={
                      avenant.status === 'Signe'
                        ? 'default'
                        : avenant.status === 'En_attente'
                          ? 'secondary'
                          : 'outline'
                    }
                  >
                    {avenant.status === 'Brouillon' && 'Brouillon'}
                    {avenant.status === 'En_attente' && 'En Attente'}
                    {avenant.status === 'Signe' && 'Signé'}
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

              <div className='flex items-center gap-3'>
                <Button
                  type='button'
                  variant='outline'
                  size='lg'
                  onClick={handleBack}
                >
                  <ArrowLeft className='mr-2 h-4 w-4' />
                  Retour à l&apos;Avenant
                </Button>
                <Button
                  onClick={form.handleSubmit(onSubmit)}
                  size='lg'
                  disabled={saving || !isEditable}
                  className='min-w-[200px]'
                >
                  {saving ? (
                    <>
                      <div className='mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent' />
                      Modification...
                    </>
                  ) : (
                    <>
                      <Save className='mr-2 h-4 w-4' />
                      Enregistrer l&apos;Avenant
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {!isEditable && (
          <Alert variant='destructive'>
            <AlertCircle className='h-4 w-4' />
            <AlertTitle>Modification Impossible</AlertTitle>
            <AlertDescription>
              Cet avenant ne peut plus être modifié car son statut est &quot;{avenant.status}&quot;.
              Seuls les avenants en statut &quot;Brouillon&quot; peuvent être modifiés.
            </AlertDescription>
          </Alert>
        )}

        <div className='grid grid-cols-1 gap-6 xl:grid-cols-4'>
          {/* Sidebar: Récapitulatif (25%) */}
          <div className='xl:col-span-1'>
            <div className='sticky top-4 space-y-4'>
              {/* Card Employé */}
              <Card>
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
                <Card className='shadow-sm pt-0'>
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
                                disabled={!isEditable}
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
                                disabled={!isEditable}
                                options={[
                                  { id: 'salary', label: 'Modification de Salaire' },
                                  { id: 'schedule', label: "Modification d'Horaire" },
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
                              disabled={!isEditable}
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
                              disabled={!isEditable}
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
                  <TabsList className='grid w-full grid-cols-3 h-auto'>
                    <TabsTrigger value='salary' disabled={!isEditable} className='data-[state=active]:bg-purple-500 data-[state=active]:text-white'>
                      <DollarSign className='mr-2 h-4 w-4' />
                      Salaire
                    </TabsTrigger>
                    <TabsTrigger value='schedule' disabled={!isEditable} className='data-[state=active]:bg-purple-500 data-[state=active]:text-white'>
                      <Clock className='mr-2 h-4 w-4' />
                      Horaire
                    </TabsTrigger>
                    <TabsTrigger value='job' disabled={!isEditable} className='data-[state=active]:bg-purple-500 data-[state=active]:text-white'>
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
                          Modifier les éléments de rémunération
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
                                    disabled={!isEditable}
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
                                    disabled={!isEditable}
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
                                  <Input {...field} placeholder='MAD' disabled={!isEditable} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* TAB: Horaire */}
                  <TabsContent value='schedule' className='mt-6'>
                    <Card className='shadow-sm border-l-4 border-l-purple-500 pt-0'>
                      <CardHeader className='bg-purple-50 dark:bg-purple-950 pt-2'>
                        <CardTitle className='flex items-center gap-2 text-purple-700 dark:text-purple-400'>
                          <Clock className='h-5 w-5' />
                          Temps de Travail
                        </CardTitle>
                        <CardDescription>
                          Modifier les horaires et congés
                        </CardDescription>
                      </CardHeader>
                      <CardContent className='space-y-6 pt-6'>
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
                                    disabled={!isEditable}
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
                                    disabled={!isEditable}
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
                                    disabled={!isEditable}
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
                                    disabled={!isEditable}
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

                  {/* TAB: Poste */}
                  <TabsContent value='job' className='mt-6'>
                    <Card className='shadow-sm border-l-4 border-l-purple-500 pt-0'>
                      <CardHeader className='bg-purple-50 dark:bg-purple-950 pt-2'>
                        <CardTitle className='flex items-center gap-2 text-purple-700 dark:text-purple-400'>
                          <Briefcase className='h-5 w-5' />
                          Poste et Fonction
                        </CardTitle>
                        <CardDescription>
                          Modifier les informations du poste
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
                                  <Input {...field} placeholder='Ex: Senior Developer' className='text-base' disabled={!isEditable} />
                                </FormControl>
                                <FormDescription className='flex items-center gap-2 text-xs'>
                                  <span className='text-muted-foreground'>Actuel:</span>
                                  <span className='font-medium'>{contract.job?.poste || 'N/A'}</span>
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

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
                                    disabled={!isEditable}
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
                                  <Input {...field} placeholder='Ex: Informatique' disabled={!isEditable} />
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
                                  <Input {...field} placeholder='Ex: Développeur' disabled={!isEditable} />
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
                                    disabled={!isEditable}
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
                                  <Input {...field} placeholder='Ex: Niveau 5 - Échelon 2' disabled={!isEditable} />
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
                                  <Input {...field} placeholder='Ex: Casablanca, Maroc' disabled={!isEditable} />
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
                                  disabled={!isEditable}
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
                              disabled={!isEditable}
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
                              disabled={!isEditable}
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
                              disabled={!isEditable}
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
                              disabled={!isEditable}
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
