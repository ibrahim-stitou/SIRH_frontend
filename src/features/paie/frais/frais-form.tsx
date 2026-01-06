import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createFrais, updateFrais, getFrais } from '@/services/frais';
import type { NoteDeFrais, FraisLine } from '@/types/frais';
import { noteDeFraisSchema } from '@/schemas/frais';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import apiClient from '@/lib/api';
import { apiRoutes } from '@/config/apiRoutes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import PageContainer from '@/components/layout/page-container';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage
} from '@/components/ui/form';
import { DatePickerField } from '@/components/custom/DatePickerField';
import { SelectField } from '@/components/custom/SelectField';
import {
  ArrowLeft,
  Plus,
  Trash2,
  FileText,
  DollarSign,
  Calendar,
  Loader2,
  Save
} from 'lucide-react';
import { Heading } from '@/components/ui/heading';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import RequiredRedStar from '@/components/custom/required-red-star';

const CATEGORIES = [
  { label: 'Transport', value: 'Transport' },
  { label: 'Restauration', value: 'Restauration' },
  { label: 'Hôtel', value: 'Hôtel' },
  { label: 'Kilométrage', value: 'Kilométrage' },
  { label: 'Per Diem', value: 'Per Diem' },
  { label: 'Autre', value: 'Autre' }
];

type Category = (typeof CATEGORIES)[number]['value'];

interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  matricule?: string;
}

interface EmployeeOption {
  label: string;
  id: number;
}

class FormError extends Error {
  constructor(
    message: string,
    public code?: string,
    public field?: string
  ) {
    super(message);
    this.name = 'FormError';
  }
}

function handleApiError(error: unknown): FormError {
  if (error instanceof FormError) return error;

  if (error && typeof error === 'object' && 'message' in error) {
    return new FormError(
      (error as Error).message,
      'code' in error ? String((error as any).code) : undefined
    );
  }

  return new FormError('Une erreur inattendue est survenue');
}

function createDefaultLine(): FraisLine {
  return {
    id: Date.now() + Math.floor(Math.random() * 1000),
    date: new Date().toISOString().slice(0, 10),
    amount: 0,
    // @ts-ignore
    category: 'Transport' as Category,
    attachments: [],
    transportMode: null,
    route: null,
    comment: ''
  };
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('fr-MA', {
    style: 'currency',
    currency: 'MAD',
    maximumFractionDigits: 2
  }).format(amount);
};

function useEmployees() {
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchEmployees() {
      try {
        const response = await apiClient.get(
          apiRoutes.admin.employees.simpleList,
          { signal: controller.signal }
        );

        const options = (response.data?.data || []).map((e: Employee) => ({
          label: `${e.firstName} ${e.lastName}${e.matricule ? ' — ' + e.matricule : ''}`,
          id: e.id
        }));

        setEmployees(options);
        setError(null);
      } catch (err) {
        if (err instanceof Error) {
          const errorMessage = err.message?.toLowerCase() || '';
          if (err.name !== 'AbortError' && !errorMessage.includes('canceled') && !errorMessage.includes('abort')) {
            setError(handleApiError(err));
          }
        }
      } finally {
        setLoading(false);
      }
    }

    fetchEmployees();

    return () => controller.abort();
  }, []);

  return { employees, loading, error };
}

function useExpenseNote(id?: number) {
  const [data, setData] = useState<NoteDeFrais | null>(null);
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    async function fetchNote() {
      try {
        const note = await getFrais(id);
        setData(note);
        setError(null);
      } catch (err) {
        // Ignore abort/cancellation errors (normal in React strict mode or fast navigation)
        if (err instanceof Error) {
          const errorMessage = err.message?.toLowerCase() || '';
          if (err.name !== 'AbortError' && !errorMessage.includes('canceled') && !errorMessage.includes('abort')) {
            setError(handleApiError(err));
          }
        }
      } finally {
        setLoading(false);
      }
    }

    fetchNote();

    return () => controller.abort();
  }, [id]);

  return { data, loading, error };
}

function FormSkeleton() {
  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-6'>
        {/* Header Skeleton */}
        <div className='flex items-center justify-between'>
          <div className='space-y-2'>
            <div className='h-8 w-64 animate-pulse rounded bg-gray-200' />
            <div className='h-4 w-96 animate-pulse rounded bg-gray-200' />
          </div>
          <div className='flex items-center gap-3'>
            <div className='h-10 w-24 animate-pulse rounded bg-gray-200' />
            <div className='h-10 w-24 animate-pulse rounded bg-gray-200' />
            <div className='h-10 w-32 animate-pulse rounded bg-gray-200' />
          </div>
        </div>

        {/* Cards Skeleton */}
        <Card>
          <CardHeader>
            <div className='flex items-center gap-2'>
              <div className='h-5 w-5 animate-pulse rounded bg-gray-200' />
              <div className='h-6 w-48 animate-pulse rounded bg-gray-200' />
            </div>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className='space-y-2'>
                  <div className='h-4 w-24 animate-pulse rounded bg-gray-200' />
                  <div className='h-10 w-full animate-pulse rounded bg-gray-200' />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}

export default function FraisForm({ id }: { id?: number }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  // Use custom hooks
  const {
    employees,
    loading: employeesLoading,
    error: employeesError
  } = useEmployees();
  const {
    data: existingNote,
    loading: noteLoading,
    error: noteError
  } = useExpenseNote(id);

  const form = useForm<NoteDeFrais>({
    resolver: zodResolver(noteDeFraisSchema),
    defaultValues: {
      id: id,
      employeeId: undefined,
      matricule: '',
      status: 'draft',
      subject: '',
      startDate: '',
      endDate: '',
      total: 0,
      lines: [createDefaultLine()],
      history: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    mode: 'onChange'
  });

  const {
    control,
    handleSubmit,
    setValue,
    formState: { isDirty, isValid },
    reset
  } = form;
  const { fields, append, remove } = useFieldArray({ name: 'lines', control });

  const watchedLines = useWatch({ control, name: 'lines' });

  const calculatedTotal = useMemo(() => {
    if (!Array.isArray(watchedLines)) return 0;
    return watchedLines.reduce((sum, line) => {
      const amount = Number(line?.amount) || 0;
      return sum + amount;
    }, 0);
  }, [watchedLines]);

  useEffect(() => {
    setValue('total', calculatedTotal, { shouldValidate: false });
  }, [calculatedTotal, setValue]);

  useEffect(() => {
    if (existingNote) {
      reset({
        ...existingNote,
        lines:
          existingNote.lines && existingNote.lines.length > 0
            ? existingNote.lines
            : [createDefaultLine()]
      });
    }
  }, [existingNote, reset]);

  const handleCancel = useCallback(() => {
    if (isDirty) {
      setShowCancelDialog(true);
    } else {
      router.push('/admin/paie/frais');
    }
  }, [isDirty, router]);

  const confirmCancel = useCallback(() => {
    setShowCancelDialog(false);
    router.push('/admin/paie/frais');
  }, [router]);

  const handleRemoveLine = useCallback(
    (index: number) => {
      if (fields.length > 1) {
        remove(index);
        toast.success('Ligne supprimée');
      } else {
        toast.error('Vous devez avoir au moins une ligne de frais');
      }
    },
    [fields.length, remove]
  );

  const handleAddLine = useCallback(() => {
    append(createDefaultLine());
  }, [append]);

  const onSubmit = useCallback(
    async (values: NoteDeFrais) => {
      if (submitting) return;

      setSubmitting(true);
      try {
        let result;
        if (!id) {
          result = await createFrais(values);
          toast.success('Note de frais créée avec succès');
        } else {
          result = await updateFrais(id, values);
          toast.success('Note de frais mise à jour avec succès');
        }

        setTimeout(() => {
          router.push(`/admin/paie/frais/${result.id}/details`);
        }, 300);
      } catch (err) {
        const error = handleApiError(err);
        toast.error(error.message);
        console.error('Form submission error:', error);
      } finally {
        setSubmitting(false);
      }
    },
    [id, router, submitting]
  );

  useEffect(() => {
    if (employeesError) {
      // Don't show error for canceled/aborted requests (normal in React strict mode)
      const errorMessage = employeesError.message?.toLowerCase() || '';
      if (!errorMessage.includes('canceled') && !errorMessage.includes('abort')) {
        toast.error(
          `Erreur de chargement des employés: ${employeesError.message}`
        );
      }
    }
    if (noteError) {
      // Don't show error for canceled/aborted requests
      const errorMessage = noteError.message?.toLowerCase() || '';
      if (!errorMessage.includes('canceled') && !errorMessage.includes('abort')) {
        toast.error(`Erreur de chargement de la note: ${noteError.message}`);
      }
    }
  }, [employeesError, noteError]);

  if (employeesLoading || noteLoading) {
    return <FormSkeleton />;
  }

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <Heading
            title={id ? 'Modifier la note de frais' : 'Nouvelle note de frais'}
            description={
              id
                ? 'Modifiez les informations de votre note de frais.'
                : 'Créez une nouvelle note de frais avec vos dépenses professionnelles.'
            }
          />
          <div className='flex items-center gap-3'>
            <Button
              variant='outline'
              onClick={handleCancel}
              disabled={submitting}
            >
              <ArrowLeft className='mr-2 h-4 w-4' />
              Retour
            </Button>
            <Button
              variant='ghost'
              onClick={handleCancel}
              disabled={submitting}
            >
              Annuler
            </Button>
            <Button
              onClick={handleSubmit(onSubmit)}
              disabled={submitting || !isValid}
              size='default'
            >
              {submitting ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className='mr-2 h-4 w-4' />
                  {id ? 'Mettre à jour' : 'Créer'}
                </>
              )}
            </Button>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
            {/* Card - Informations générales */}
            <Card>
              <CardHeader>
                <div className='flex items-center gap-2'>
                  <FileText className='text-primary h-5 w-5' />
                  <CardTitle>Informations générales</CardTitle>
                </div>
                <CardDescription>
                  Renseignez les informations principales de la note de frais
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
                  <FormField
                    control={control}
                    name='employeeId'
                    render={() => (
                      <FormItem>
                        <FormLabel>Employé <RequiredRedStar/></FormLabel>
                        <FormControl>
                          <SelectField<NoteDeFrais, 'employeeId'>
                            name='employeeId'
                            control={control}
                            options={employees}
                            placeholder='Sélectionner un employé'
                            required
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name='subject'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Objet <RequiredRedStar/></FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder='Ex: Mission Casablanca'
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name='startDate'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date début <RequiredRedStar/></FormLabel>
                        <FormControl>
                          <DatePickerField
                            name='startDate'
                            value={field.value}
                            onChange={(val) => field.onChange(val)}
                            required
                            placeholder='Sélectionner la date'
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name='endDate'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date fin <RequiredRedStar/></FormLabel>
                        <FormControl>
                          <DatePickerField
                            name='endDate'
                            value={field.value}
                            onChange={(val) => field.onChange(val)}
                            required
                            placeholder='Sélectionner la date'
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Card - Lignes de frais */}
            <Card className='pb-0'>
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <div>
                    <div className='flex items-center gap-2'>
                      <DollarSign className='text-primary h-5 w-5' />
                      <CardTitle>Lignes de frais ({fields.length})</CardTitle>
                    </div>
                    <CardDescription className='mt-1'>
                      Ajoutez les différentes dépenses de votre note de frais
                    </CardDescription>
                  </div>
                  <Button
                    type='button'
                    variant='default'
                    size='sm'
                    onClick={handleAddLine}
                    disabled={submitting}
                  >
                    <Plus className='mr-2 h-4 w-4' />
                    Ajouter une ligne
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className='border-border bg-card relative rounded-lg border p-4 shadow-sm transition-all hover:shadow-md'
                    >
                      {fields.length > 1 && (
                        <Button
                          type='button'
                          variant='ghost'
                          size='icon'
                          className='text-destructive hover:bg-destructive/10 absolute top-2 right-2 h-8 w-8'
                          onClick={() => handleRemoveLine(index)}
                          disabled={submitting}
                        >
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      )}

                      <div className='grid grid-cols-1 gap-4 md:grid-cols-12'>
                        <FormField
                          control={control}
                          name={`lines.${index}.date`}
                          render={({ field }) => (
                            <FormItem className='md:col-span-3'>
                              <FormLabel>Date <RequiredRedStar/></FormLabel>
                              <FormControl>
                                <DatePickerField
                                  name={`lines.${index}.date`}
                                  value={field.value}
                                  onChange={(val) => field.onChange(val)}
                                  placeholder='Date'
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={control}
                          name={`lines.${index}.category`}
                          render={() => (
                            <FormItem className='md:col-span-3'>
                              <FormLabel>Catégorie <RequiredRedStar/></FormLabel>
                              <FormControl>
                                <SelectField<Record<string, any>, string>
                                  name={`lines.${index}.category`}
                                  control={control as any}
                                  options={CATEGORIES}
                                  placeholder='Catégorie'
                                  required
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={control}
                          name={`lines.${index}.amount`}
                          render={({ field }) => (
                            <FormItem className='md:col-span-2'>
                              <FormLabel>Montant (MAD) <RequiredRedStar/></FormLabel>
                              <FormControl>
                                <Input
                                  type='number'
                                  {...field}
                                  placeholder='0.00'
                                  step='0.01'
                                  min='0'
                                  onChange={(e) =>
                                    field.onChange(
                                      parseFloat(e.target.value) || 0
                                    )
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={control}
                          name={`lines.${index}.comment`}
                          render={({ field }) => (
                            <FormItem className='md:col-span-4'>
                              <FormLabel>Commentaire</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder='Description de la dépense'
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className='bg-muted/50 flex-col items-stretch border-t'>
                <div className='flex items-center justify-between py-2'>
                  <div className='text-muted-foreground flex items-center gap-2 text-sm'>
                    <Calendar className='h-4 w-4' />
                    <span>
                      {fields.length} ligne{fields.length > 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className='flex items-center gap-3'>
                    <span className='text-muted-foreground text-sm font-medium'>
                      Total:
                    </span>
                    <Badge
                      variant='secondary'
                      className='px-3 py-1 text-base font-bold'
                    >
                      {formatCurrency(calculatedTotal)}
                    </Badge>
                  </div>
                </div>
              </CardFooter>
            </Card>
          </form>
        </Form>

        {/* Cancel Confirmation Dialog */}
        <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Annuler les modifications ?</AlertDialogTitle>
              <AlertDialogDescription>
                Vous avez des modifications non enregistrées. Si vous quittez
                maintenant, ces modifications seront perdues.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Continuer l&apos;édition</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmCancel}
                className='bg-destructive hover:bg-destructive/90'
              >
                Quitter sans enregistrer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </PageContainer>
  );
}
