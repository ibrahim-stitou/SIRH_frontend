'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { SelectField } from '@/components/custom/SelectField';
import { DatePickerField } from '@/components/custom/DatePickerField';
import { toast } from 'sonner';
import apiClient from '@/lib/api';
import { apiRoutes } from '@/config/apiRoutes';
import {
  ArrowLeft,
  Save,
  User,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Trash2,
  UserPlus,
  Clock
} from 'lucide-react';
import { parseISO, differenceInHours } from 'date-fns';
import PageContainer from '@/components/layout/page-container';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import RequiredRedStar from '@/components/custom/required-red-star';
import { Switch } from '@/components/ui/switch';

// Schema de validation
const accidentSchema = z.object({
  employeId: z.string().min(1, 'Employé requis'),
  dateHeureAccident: z.string().min(1, 'Date et heure requises'),
  typeAccident: z.enum(['Sur site', 'Trajet'], {
    required_error: "Type d'accident requis"
  }),
  lieu: z.string().min(1, 'Lieu requis'),
  circonstances: z.string().min(10, 'Description détaillée requise (min 10 caractères)'),
  lesions: z.string().min(1, 'Lésions requises'),
  gravite: z.enum(['Léger', 'Moyen', 'Grave'], {
    required_error: 'Gravité requise'
  }),
  temoins: z.array(
    z.object({
      nom: z.string().min(1, 'Nom requis'),
      contact: z.string().min(1, 'Contact requis')
    })
  ),
  arretTravailExiste: z.boolean().default(false),
  arretTravailDuree: z.string().optional(),
  arretTravailDebut: z.string().optional(),
  arretTravailFin: z.string().optional(),
  statut: z.enum(['Brouillon', 'Déclaré']).default('Brouillon')
});

type AccidentFormValues = z.infer<typeof accidentSchema>;

interface Employee {
  id: number | string;
  firstName: string;
  lastName: string;
  matricule?: string;
  numeroCNSS?: string;
  departement?: {
    name: string;
  };
}

export default function AjouterAccidentTravailPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [delaiAlert, setDelaiAlert] = useState<{
    heures: number;
    respect: boolean;
  } | null>(null);

  const form = useForm<AccidentFormValues>({
    resolver: zodResolver(accidentSchema),
    defaultValues: {
      employeId: '',
      dateHeureAccident: '',
      typeAccident: 'Sur site',
      lieu: '',
      circonstances: '',
      lesions: '',
      gravite: 'Moyen',
      temoins: [],
      arretTravailExiste: false,
      arretTravailDuree: '',
      arretTravailDebut: '',
      arretTravailFin: '',
      statut: 'Brouillon'
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'temoins'
  });

  const dateHeureAccident = form.watch('dateHeureAccident');
  const arretTravailExiste = form.watch('arretTravailExiste');

  // Calculer le délai de déclaration
  useEffect(() => {
    if (dateHeureAccident) {
      try {
        const dateAccident = parseISO(dateHeureAccident);
        const now = new Date();
        const heures = differenceInHours(now, dateAccident);
        const respect = heures <= 48;
        setDelaiAlert({ heures: Math.abs(heures), respect });
      } catch {
        setDelaiAlert(null);
      }
    } else {
      setDelaiAlert(null);
    }
  }, [dateHeureAccident]);

  // Charger les employés
  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const response = await apiClient.get(
          apiRoutes.admin.employees.simpleList
        );
        setEmployees(response.data?.data || []);
      } catch (error) {
        console.error('Erreur chargement employés:', error);
        toast.error('Erreur lors du chargement des employés');
      }
    };
    loadEmployees();
  }, []);

  const onSubmit = async (data: AccidentFormValues) => {
    setLoading(true);
    try {
      const employee = employees.find((e) => String(e.id) === String(data.employeId));

      const payload = {
        employeId: parseInt(String(data.employeId)),
        employe: employee ? {
          id: employee.id,
          nom: employee.lastName,
          prenom: employee.firstName,
          matricule: employee.matricule,
          numeroCNSS: employee.numeroCNSS,
          departement: employee.departement?.name
        } : null,
        dateHeureAccident: data.dateHeureAccident,
        typeAccident: data.typeAccident,
        lieu: data.lieu,
        circonstances: data.circonstances,
        lesions: data.lesions,
        gravite: data.gravite,
        temoins: data.temoins,
        arretTravail: {
          existe: data.arretTravailExiste,
          dureePrevisionnelle: data.arretTravailDuree
            ? parseInt(data.arretTravailDuree)
            : undefined,
          dateDebut: data.arretTravailDebut || undefined,
          dateFin: data.arretTravailFin || undefined
        },
        statut: data.statut
      };

      await apiClient.post(apiRoutes.admin.accidentsTravail.create, payload);
      toast.success('Accident du travail déclaré avec succès');
      router.push('/admin/gestion-social/accidents-travail');
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error(
        error?.response?.data?.message ||
          'Erreur lors de la déclaration de l\'accident'
      );
    } finally {
      setLoading(false);
    }
  };

  const employeeOptions = employees.map((e) => ({
    label: `${e.firstName} ${e.lastName}${e.matricule ? ' — ' + e.matricule : ''}${e.numeroCNSS ? ' (CNSS: ' + e.numeroCNSS + ')' : ''}`,
    value: String(e.id)
  }));

  return (
    <PageContainer scrollable>
      <div className='space-y-4 w-full'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-2'>
            <Button
              variant='ghost'
              size='icon'
              onClick={() => router.back()}
            >
              <ArrowLeft className='h-5 w-5' />
            </Button>
            <div>
              <h1 className='text-2xl font-semibold tracking-tight'>
                Déclarer un accident du travail
              </h1>
              <p className='text-muted-foreground text-sm'>
                Déclaration obligatoire sous 48h
              </p>
            </div>
          </div>
        </div>

        {/* Alerte délai 48h */}
        {delaiAlert && (
          <Alert variant={delaiAlert.respect ? 'default' : 'destructive'}>
            {delaiAlert.respect ? (
              <CheckCircle2 className='h-4 w-4' />
            ) : (
              <AlertTriangle className='h-4 w-4' />
            )}
            <AlertTitle>
              {delaiAlert.respect
                ? 'Délai légal respecté'
                : '⚠️ Attention : Délai légal dépassé'}
            </AlertTitle>
            <AlertDescription>
              {delaiAlert.heures < 1
                ? `Moins d'1 heure depuis l'accident`
                : `${Math.floor(delaiAlert.heures)} heures depuis l'accident`}
              {!delaiAlert.respect &&
                ' — La déclaration doit être effectuée dans les 48 heures'}
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            {/* Informations générales */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <User className='h-5 w-5' />
                  Informations générales
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid gap-4 md:grid-cols-2'>
                  <FormField
                    control={form.control}
                    name='employeId'
                    render={() => (
                      <FormItem>
                        <FormLabel>
                          Employé <RequiredRedStar />
                        </FormLabel>
                        <SelectField
                          control={form.control}
                          name='employeId'
                          options={employeeOptions}
                          placeholder='Sélectionner un employé'
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='dateHeureAccident'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Date et heure de l&apos;accident <RequiredRedStar />
                        </FormLabel>
                        <DatePickerField
                          value={field.value}
                          onChange={field.onChange}
                          placeholder='Sélectionner date et heure'
                          withTime={true}
                          maxDate={new Date()}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className='grid gap-4 md:grid-cols-2'>
                  <FormField
                    control={form.control}
                    name='typeAccident'
                    render={() => (
                      <FormItem>
                        <FormLabel>
                          Type d&apos;accident <RequiredRedStar />
                        </FormLabel>
                        <SelectField
                          control={form.control}
                          name='typeAccident'
                          options={[
                            { label: 'Sur site', value: 'Sur site' },
                            { label: 'Trajet', value: 'Trajet' }
                          ]}
                          placeholder='Sélectionner le type'
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='gravite'
                    render={() => (
                      <FormItem>
                        <FormLabel>
                          Gravité <RequiredRedStar />
                        </FormLabel>
                        <SelectField
                          control={form.control}
                          name='gravite'
                          options={[
                            { label: 'Léger', value: 'Léger' },
                            { label: 'Moyen', value: 'Moyen' },
                            { label: 'Grave', value: 'Grave' }
                          ]}
                          placeholder='Sélectionner la gravité'
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name='lieu'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Lieu de l&apos;accident <RequiredRedStar />
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder='Ex: Atelier mécanique, Avenue Hassan II...'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Circonstances et lésions */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <FileText className='h-5 w-5' />
                  Circonstances et lésions
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <FormField
                  control={form.control}
                  name='circonstances'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Description détaillée des circonstances{' '}
                        <RequiredRedStar />
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          rows={5}
                          placeholder='Décrire précisément comment l&apos;accident s&apos;est produit, les conditions, les équipements utilisés...'
                          className='resize-none'
                        />
                      </FormControl>
                      <FormDescription>
                        Minimum 10 caractères
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='lesions'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Nature des lésions <RequiredRedStar />
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          rows={3}
                          placeholder='Ex: Contusion genou droit, Fracture poignet gauche...'
                          className='resize-none'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Témoins */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <UserPlus className='h-5 w-5' />
                    Témoins
                  </div>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={() => append({ nom: '', contact: '' })}
                  >
                    <Plus className='mr-2 h-4 w-4' />
                    Ajouter un témoin
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                {fields.length === 0 ? (
                  <p className='text-center text-sm text-muted-foreground'>
                    Aucun témoin ajouté
                  </p>
                ) : (
                  fields.map((field, index) => (
                    <div
                      key={field.id}
                      className='flex items-start gap-4 rounded-lg border p-4'
                    >
                      <div className='grid flex-1 gap-4 md:grid-cols-2'>
                        <FormField
                          control={form.control}
                          name={`temoins.${index}.nom`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nom complet</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder='Nom du témoin' />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`temoins.${index}.contact`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Contact</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder='Téléphone ou email'
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        onClick={() => remove(index)}
                        className='text-destructive'
                      >
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Arrêt de travail */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Clock className='h-5 w-5' />
                  Arrêt de travail
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <FormField
                  control={form.control}
                  name='arretTravailExiste'
                  render={({ field }) => (
                    <FormItem className='flex items-center justify-between rounded-lg border p-4'>
                      <div className='space-y-0.5'>
                        <FormLabel className='text-base'>
                          Arrêt de travail prescrit
                        </FormLabel>
                        <FormDescription>
                          L&apos;accident a-t-il donné lieu à un arrêt de travail ?
                        </FormDescription>
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

                {arretTravailExiste && (
                  <div className='space-y-4 rounded-lg border p-4'>
                    <div className='grid gap-4 md:grid-cols-3'>
                      <FormField
                        control={form.control}
                        name='arretTravailDuree'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Durée prévisionnelle (jours)</FormLabel>
                            <FormControl>
                              <Input
                                type='number'
                                min='1'
                                {...field}
                                placeholder='Ex: 15'
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name='arretTravailDebut'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date de début</FormLabel>
                            <DatePickerField
                              value={field.value}
                              onChange={field.onChange}
                              placeholder='Sélectionner une date'
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name='arretTravailFin'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date de fin prévue</FormLabel>
                            <DatePickerField
                              value={field.value}
                              onChange={field.onChange}
                              placeholder='Sélectionner une date'
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Statut */}
            <Card>
              <CardHeader>
                <CardTitle>Statut de la déclaration</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name='statut'
                  render={() => (
                    <FormItem>
                      <FormLabel>Statut</FormLabel>
                      <SelectField
                        control={form.control}
                        name='statut'
                        options={[
                          { label: 'Brouillon', value: 'Brouillon' },
                          { label: 'Déclaré', value: 'Déclaré' }
                        ]}
                      />
                      <FormDescription>
                        Enregistrer en brouillon ou déclarer immédiatement
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Actions */}
            <div className='flex justify-end gap-2'>
              <Button
                type='button'
                variant='outline'
                onClick={() => router.back()}
                disabled={loading}
              >
                Annuler
              </Button>
              <Button type='submit' disabled={loading}>
                {loading ? (
                  <>Enregistrement...</>
                ) : (
                  <>
                    <Save className='mr-2 h-4 w-4' />
                    Enregistrer
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </PageContainer>
  );
}

