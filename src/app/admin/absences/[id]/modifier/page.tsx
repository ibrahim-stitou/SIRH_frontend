"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { SelectField } from "@/components/custom/SelectField";
import { DatePickerField } from "@/components/custom/DatePickerField";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import apiClient from "@/lib/api";
import { apiRoutes } from "@/config/apiRoutes";
import {
  ArrowLeft,
  Save,
  Calendar,
  User,
  FileText,
  Clock,
  Info,
  AlertCircle
} from "lucide-react";
import { format, parseISO, isAfter, differenceInMilliseconds, isValid } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import PageContainer from "@/components/layout/page-container";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { FileUploader } from "@/components/file-uploader";

const absenceSchema = z.object({
  employeeId: z.string().min(1, "Employé requis"),
  type_absence_id: z.string().min(1, "Type d'absence requis"),
  date_debut: z.string().min(1, "Date de début requise"),
  date_fin: z.string().min(1, "Date de fin requise"),
  motif: z.string().optional(),
  justifie: z.boolean().default(false),
  commentaire_rh: z.string().optional(),
  statut: z.enum(["brouillon", "validee"]).default("brouillon"),
  justificatif: z.any().optional()
}).refine((data) => {
  if (data.date_debut && data.date_fin) {
    const debut = parseISO(data.date_debut);
    const fin = parseISO(data.date_fin);
    return !isAfter(debut, fin);
  }
  return true;
}, {
  message: "La date de début doit être antérieure ou égale à la date de fin",
  path: ["date_fin"]
});

type AbsenceFormValues = z.infer<typeof absenceSchema>;

export default function ModifierAbsencePage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [absenceTypes, setAbsenceTypes] = useState<any[]>([]);
  const [selectedType, setSelectedType] = useState<any | null>(null);
  const [calculatedDuration, setCalculatedDuration] = useState<{ days: number, hours: number, minutes: number }>({ days: 0, hours: 0, minutes: 0 });
  const [justificatifFile, setJustificatifFile] = useState<File | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);

  const form = useForm<AbsenceFormValues>({
    resolver: zodResolver(absenceSchema),
    defaultValues: {
      employeeId: '',
      type_absence_id: '',
      date_debut: '',
      date_fin: '',
      motif: '',
      justifie: false,
      commentaire_rh: '',
      statut: 'brouillon',
      justificatif: null
    }
  });

  // Charger les données initiales
  useEffect(() => {
    async function fetchData() {
      try {
        const [empRes, typeRes, absenceRes] = await Promise.all([
          apiClient.get(apiRoutes.admin.employees.simpleList),
          apiClient.get(apiRoutes.admin.absences.types),
          apiClient.get(apiRoutes.admin.absences.show(id))
        ]);
        setEmployees(empRes.data?.data || []);
        setAbsenceTypes(typeRes.data?.data || []);
        const absence = absenceRes.data?.data;
        if (absence) {
          form.reset({
            employeeId: String(absence.employeeId),
            type_absence_id: String(absence.type_absence_id),
            date_debut: absence.date_debut,
            date_fin: absence.date_fin,
            motif: absence.motif || '',
            justifie: !!absence.justifie,
            commentaire_rh: absence.commentaire_rh || '',
            statut: absence.statut || 'brouillon',
            justificatif: null // On ne pré-remplit pas le fichier
          });
          // Sélectionner le type d'absence pour l'affichage
          setSelectedType(typeRes.data?.data.find((t: any) => t.id === Number(absence.type_absence_id)) || null);
        }
      } catch (e) {
        toast.error("Erreur lors du chargement de l'absence");
      } finally {
        setInitialLoading(false);
      }
    }
    fetchData();
    // eslint-disable-next-line
  }, [id]);

  // Calculer la durée automatiquement (jours, heures, minutes)
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if ((name === 'date_debut' || name === 'date_fin') && value.date_debut && value.date_fin) {
        try {
          const debut = parseISO(value.date_debut);
          const fin = parseISO(value.date_fin);
          if (isValid(debut) && isValid(fin) && !isAfter(debut, fin)) {
            const diffMs = differenceInMilliseconds(fin, debut);
            if (diffMs >= 0) {
              const totalMinutes = Math.floor(diffMs / (1000 * 60));
              const days = Math.floor(totalMinutes / (60 * 24));
              const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
              const minutes = totalMinutes % 60;
              setCalculatedDuration({ days, hours, minutes });
            } else {
              setCalculatedDuration({ days: 0, hours: 0, minutes: 0 });
            }
          } else {
            setCalculatedDuration({ days: 0, hours: 0, minutes: 0 });
          }
        } catch (error) {
          setCalculatedDuration({ days: 0, hours: 0, minutes: 0 });
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Mettre à jour le type sélectionné
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'type_absence_id' && value.type_absence_id) {
        const type = absenceTypes.find((t) => t.id === Number(value.type_absence_id));
        setSelectedType(type || null);
      }
    });
    return () => subscription.unsubscribe();
  }, [form, absenceTypes]);

  const onSubmit = async (data: AbsenceFormValues) => {
    setLoading(true);
    try {
      const payload = {
        employeeId: Number(data.employeeId),
        type_absence_id: Number(data.type_absence_id),
        date_debut: data.date_debut,
        date_fin: data.date_fin,
        duree: calculatedDuration,
        motif: data.motif || '',
        justifie: data.justifie,
        commentaire_rh: data.commentaire_rh || '',
        statut: data.statut,
        createdBy: 'admin'
      };
      await apiClient.put(apiRoutes.admin.absences.update(id), payload);
      toast.success('Absence modifiée avec succès !');
      router.push('/admin/absences');
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erreur lors de la modification de l'absence");
    } finally {
      setLoading(false);
    }
  };

  const employeeOptions = employees.map(emp => ({
    label: `${emp.firstName} ${emp.lastName}${emp.matricule ? ` (${emp.matricule})` : ''}`,
    value: String(emp.id)
  }));

  const typeOptions = absenceTypes.map(type => ({
    label: type.libelle,
    value: String(type.id)
  }));

  const selectedEmployee = employees.find(e => String(e.id) === form.watch('employeeId'));

  if (initialLoading) {
    return (
      <PageContainer scrollable>
        <div className="flex h-96 items-center justify-center">
          <div className="animate-spin h-8 w-8 rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer scrollable>
      <div className='space-y-6 w-full'>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div className='flex items-center gap-3'>
            <Button
              variant='outline'
              size='icon'
              onClick={() => router.back()}
              className='h-9 w-9'
            >
              <ArrowLeft className='h-4 w-4' />
            </Button>
            <div>
              <h1 className='text-2xl font-bold tracking-tight md:text-3xl'>
                Modifier une absence
              </h1>
              <p className='text-muted-foreground mt-1 text-sm'>
                Modifier les informations d&apos;une absence ou d&apos;un congé
              </p>
            </div>
          </div>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <div className='grid gap-6 lg:grid-cols-3'>
              <div className='lg:col-span-2'>
                <Card className="py-0 rounded-lg">
                  <CardHeader className='border-b bg-gradient-to-r from-primary/5 to-primary/10 pt-2 pb-2 rounded-t-lg'>
                    <div className='flex items-center gap-3'>
                      <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground'>
                        <FileText className='h-5 w-5' />
                      </div>
                      <div>
                        <CardTitle className='text-xl'>Formulaire d&apos;absence</CardTitle>
                        <p className='text-muted-foreground mt-0.5 text-sm'>
                          Modifiez les champs nécessaires
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className='space-y-6 p-6'>
                    {/* Section 1: Employé et Type (même ligne) */}
                    <div className='space-y-4'>
                      <div className='flex items-center gap-2 pb-2'>
                        <User className='h-4 w-4 text-primary' />
                        <h3 className='font-semibold text-sm'>Informations de base</h3>
                      </div>
                      <div className='grid gap-4 sm:grid-cols-2'>
                        <FormField
                          control={form.control}
                          name='employeeId'
                          render={() => (
                            <FormItem>
                              <FormLabel className='required'>Employé *</FormLabel>
                              <FormControl>
                                <SelectField
                                  name='employeeId'
                                  control={form.control}
                                  options={employeeOptions}
                                  placeholder='Sélectionner un employé'
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name='type_absence_id'
                          render={() => (
                            <FormItem>
                              <FormLabel className='required'>Type d&apos;absence *</FormLabel>
                              <FormControl>
                                <SelectField
                                  name='type_absence_id'
                                  control={form.control}
                                  options={typeOptions}
                                  placeholder='Sélectionner un type'
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      {selectedEmployee && (
                        <Alert className='col-span-2'>
                          <Info className='h-4 w-4' />
                          <AlertTitle>Employé sélectionné</AlertTitle>
                          <AlertDescription className='mt-2 flex flex-wrap gap-x-4 gap-y-1'>
                            <div className='flex items-center gap-2 text-sm'>
                              <span className='font-medium'>Nom:</span>
                              <span>{selectedEmployee.firstName} {selectedEmployee.lastName}</span>
                            </div>
                            {selectedEmployee.matricule && (
                              <div className='flex items-center gap-2 text-sm'>
                                <span className='font-medium'>Matricule:</span>
                                <span>{selectedEmployee.matricule}</span>
                              </div>
                            )}
                            {selectedEmployee.departement && (
                              <div className='flex items-center gap-2 text-sm'>
                                <span className='font-medium'>Département:</span>
                                <span>{selectedEmployee.departement.name}</span>
                              </div>
                            )}
                          </AlertDescription>
                        </Alert>
                      )}
                      {selectedType && (
                        <div className='col-span-2 rounded-lg border-2 p-3' style={{ borderColor: selectedType.couleur_hexa || '#94a3b8' }}>
                          <div className='flex items-center gap-2 mb-2'>
                            <div
                              className='h-3 w-3 rounded-full'
                              style={{ backgroundColor: selectedType.couleur_hexa || '#94a3b8' }}
                            />
                            <span className='font-semibold text-sm'>{selectedType.libelle}</span>
                          </div>
                          <div className='flex flex-wrap gap-2'>
                            {selectedType.est_conge && (
                              <Badge variant='outline' className='text-xs'>Congé</Badge>
                            )}
                            {selectedType.est_remuneree && (
                              <Badge variant='outline' className='border-green-500 text-green-700 text-xs'>
                                Rémunérée
                              </Badge>
                            )}
                            {selectedType.deduit_compteur_conge && (
                              <Badge variant='outline' className='border-orange-500 text-orange-700 text-xs'>
                                Déduit compteur
                              </Badge>
                            )}
                            {selectedType.necessite_justification && (
                              <Badge variant='outline' className='border-red-500 text-red-700 text-xs'>
                                Justification requise
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    <Separator />
                    {/* Section 2: Période d'absence */}
                    <div className='space-y-4'>
                      <div className='flex items-center gap-2 pb-2'>
                        <Calendar className='h-4 w-4 text-primary' />
                        <h3 className='font-semibold text-sm'>Période d&apos;absence</h3>
                      </div>
                      <div className='grid gap-4 sm:grid-cols-2'>
                        <FormField
                          control={form.control}
                          name='date_debut'
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className='required'>Date de début *</FormLabel>
                              <FormControl>
                                <DatePickerField
                                  value={field.value}
                                  onChange={field.onChange}
                                  placeholder='Sélectionner une date'
                                  withTime
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name='date_fin'
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className='required'>Date de fin *</FormLabel>
                              <FormControl>
                                <DatePickerField
                                  value={field.value}
                                  onChange={field.onChange}
                                  placeholder='Sélectionner une date'
                                  withTime
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      {(calculatedDuration.days > 0 || calculatedDuration.hours > 0 || calculatedDuration.minutes > 0) && (
                        <Alert>
                          <Clock className='h-4 w-4' />
                          <AlertTitle>Durée calculée</AlertTitle>
                          <AlertDescription>
                            <span className='text-lg font-bold'>
                              {calculatedDuration.days > 0 && `${calculatedDuration.days} jour${calculatedDuration.days > 1 ? 's' : ''}`}
                              {calculatedDuration.hours > 0 && ` ${calculatedDuration.hours}h`}
                              {calculatedDuration.minutes > 0 && ` ${calculatedDuration.minutes}min`}
                            </span>
                            {form.watch('date_debut') && form.watch('date_fin') && (
                              <span className='text-muted-foreground ml-2 text-sm'>
                                ({format(parseISO(form.watch('date_debut')), 'dd MMM yyyy HH:mm', { locale: fr })} → {format(parseISO(form.watch('date_fin')), 'dd MMM yyyy HH:mm', { locale: fr })})
                              </span>
                            )}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                    <Separator />
                    {/* Section 3: Détails */}
                    <div className='space-y-4'>
                      <div className='flex items-center gap-2 pb-2'>
                        <FileText className='h-4 w-4 text-primary' />
                        <h3 className='font-semibold text-sm'>Détails de l&apos;absence</h3>
                      </div>
                      <FormField
                        control={form.control}
                        name='motif'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Motif</FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                placeholder='Raison de l&apos;absence...'
                                rows={3}
                                className='resize-none'
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name='justifie'
                        render={({ field }) => (
                          <FormItem className='flex flex-row items-center justify-between rounded-lg border p-3'>
                            <div className='space-y-0.5'>
                              <FormLabel className='text-base'>Absence justifiée</FormLabel>
                              <div className='text-muted-foreground text-sm'>
                                L&apos;employé a fourni un justificatif
                              </div>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      {selectedType?.necessite_justification && (
                        <div className='rounded-lg border-2 border-amber-200 bg-amber-50/50 p-4'>
                          <div className='mb-3 flex items-center gap-2'>
                            <AlertCircle className='h-5 w-5 text-amber-600' />
                            <div>
                              <h4 className='font-semibold text-amber-900'>Justificatif requis</h4>
                              <p className='text-amber-700 text-sm'>
                                Ce type d&apos;absence nécessite un document justificatif
                              </p>
                            </div>
                          </div>
                          <FormField
                            control={form.control}
                            name='justificatif'
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Document justificatif</FormLabel>
                                <FormControl>
                                  <FileUploader
                                    value={justificatifFile ? [justificatifFile] : []}
                                    onValueChange={(files) => {
                                      const fileList = Array.isArray(files) ? files : [];
                                      const file = fileList.length > 0 ? fileList[0] : null;
                                      setJustificatifFile(file);
                                      field.onChange(file);
                                    }}
                                    maxFiles={1}
                                    maxSize={5 * 1024 * 1024}
                                    accept={{
                                      'application/pdf': ['.pdf'],
                                      'image/*': ['.png', '.jpg', '.jpeg'],
                                      'application/msword': ['.doc'],
                                      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
                                    }}
                                  />
                                </FormControl>
                                <p className='text-muted-foreground text-xs'>
                                  Formats acceptés: PDF, Images, Word (max 5 MB)
                                </p>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}
                      <FormField
                        control={form.control}
                        name='commentaire_rh'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Commentaire RH (interne)</FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                placeholder='Commentaire pour l&apos;équipe RH...'
                                rows={2}
                                className='resize-none'
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
              {/* Sidebar */}
              <div className='space-y-6'>
                {/* Statut */}
                <Card>
                  <CardHeader>
                    <CardTitle className='text-base'>Statut</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name='statut'
                      render={({ field }) => (
                        <FormItem className='space-y-3'>
                          <div className='space-y-2'>
                            <div
                              onClick={() => field.onChange('brouillon')}
                              className={cn(
                                'cursor-pointer rounded-lg border-2 p-3 transition-all',
                                field.value === 'brouillon'
                                  ? 'border-amber-500 bg-amber-50'
                                  : 'border-border hover:border-amber-300'
                              )}
                            >
                              <div className='flex items-center gap-2'>
                                <div className={cn(
                                  'h-4 w-4 rounded-full border-2',
                                  field.value === 'brouillon'
                                    ? 'border-amber-500 bg-amber-500'
                                    : 'border-border'
                                )} />
                                <div>
                                  <div className='font-semibold text-sm'>Brouillon</div>
                                  <div className='text-muted-foreground text-xs'>
                                    En attente de validation
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div
                              onClick={() => field.onChange('validee')}
                              className={cn(
                                'cursor-pointer rounded-lg border-2 p-3 transition-all',
                                field.value === 'validee'
                                  ? 'border-emerald-500 bg-emerald-50'
                                  : 'border-border hover:border-emerald-300'
                              )}
                            >
                              <div className='flex items-center gap-2'>
                                <div className={cn(
                                  'h-4 w-4 rounded-full border-2',
                                  field.value === 'validee'
                                    ? 'border-emerald-500 bg-emerald-500'
                                    : 'border-border'
                                )} />
                                <div>
                                  <div className='font-semibold text-sm'>Validée</div>
                                  <div className='text-muted-foreground text-xs'>
                                    Approuvée directement
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
                {/* Aide */}
                <Card className='border-blue-200 bg-blue-50/50'>
                  <CardHeader>
                    <CardTitle className='flex items-center gap-2 text-base text-blue-900'>
                      <Info className='h-4 w-4' />
                      Aide
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-3 text-sm text-blue-900'>
                    <div>
                      <div className='font-semibold'>Brouillon</div>
                      <p className='text-blue-700 text-xs'>
                        L&apos;absence sera créée mais nécessitera une validation ultérieure.
                      </p>
                    </div>
                    <Separator className='bg-blue-200' />
                    <div>
                      <div className='font-semibold'>Validée</div>
                      <p className='text-blue-700 text-xs'>
                        L&apos;absence sera directement approuvée et visible dans le planning.
                      </p>
                    </div>
                    <Separator className='bg-blue-200' />
                    <div>
                      <div className='font-semibold'>Durée</div>
                      <p className='text-blue-700 text-xs'>
                        La durée est calculée automatiquement en fonction des dates sélectionnées.
                      </p>
                    </div>
                  </CardContent>
                </Card>
                {/* Actions */}
                <div className='space-y-3'>
                  <Button
                    type='submit'
                    className='w-full gap-2'
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className='h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent' />
                        Enregistrement...
                      </>
                    ) : (
                      <>
                        <Save className='h-4 w-4' />
                        Enregistrer les modifications
                      </>
                    )}
                  </Button>
                  <Button
                    type='button'
                    variant='outline'
                    className='w-full'
                    onClick={() => router.back()}
                    disabled={loading}
                  >
                    Annuler
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </PageContainer>
  );
}

