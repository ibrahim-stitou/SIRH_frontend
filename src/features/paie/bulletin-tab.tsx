'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter
} from '@/components/ui/table';
import {
  Plus,
  Loader2,
  Trash2,
  User,
  Calendar,
  CreditCard,
  Briefcase,
  Clock,
  TrendingUp,
  DollarSign,
  Edit,
  Save,
  X,
  RotateCcw,
  FileText,
  Lock,
  Download,
  Printer
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import apiClient from '@/lib/api';
import { apiRoutes } from '@/config/apiRoutes';
import { useForm, useWatch } from 'react-hook-form';
import { SelectField } from '@/components/custom/SelectField';
import {
  BulletinPaie as BulletinPaieType,
  ElementVariable
} from '@/types/paie';
import { toast } from 'sonner';
import { useForm as useFormRHF } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import PageContainer from '@/components/layout/page-container';

interface RubriquePaie {
  id: string;
  code: string;
  libelle: string;
  type: string;
  categorie: string;
  base: string;
  taux: number | null;
}

interface BulletinTabProps {
  periodeId: string;
  selectedEmployeeId: string | null;
  onEmployeeChange: (employeeId: string) => void;
  periodeStatut?: string; // nouvelle prop pour le statut de la période
}

export default function BulletinTab({
  periodeId,
  selectedEmployeeId,
  onEmployeeChange,
  periodeStatut // nouvelle prop
}: BulletinTabProps) {
  const [bulletin, setBulletin] = useState<BulletinPaieType | null>(null);
  const [rubriques, setRubriques] = useState<RubriquePaie[]>([]);
  const [loading, setLoading] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [employeesOptions, setEmployeesOptions] = useState<
    Array<{ id: number | string; label: string }>
  >([]);
  const [editingTempsTravail, setEditingTempsTravail] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'excel'>('pdf');
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [bulletinError, setBulletinError] = useState<string | null>(null);

  // Form for employee selector
  const { control, setValue } = useForm<{ employeeId: string | number }>({
    defaultValues: { employeeId: (selectedEmployeeId as any) ?? undefined }
  });

  // État pour l'édition du temps de travail
  const [tempsTravailData, setTempsTravailData] = useState({
    joursTravailles: '',
    joursConges: '',
    joursAbsences: '',
    joursRecuperationPayes: '',
    heuresTravaillees: ''
  });

  // Charger les rubriques de paie
  useEffect(() => {
    const fetchRubriques = async () => {
      try {
        const response = await apiClient.get(
          apiRoutes.admin.paies.rubriques.list
        );
        setRubriques(response.data.data);
      } catch (error) {
        console.error('Erreur:', error);
      }
    };

    fetchRubriques();
  }, []);

  // Charger la liste simple des employés pour le sélecteur
  useEffect(() => {
    const fetchEmployeesSimple = async () => {
      try {
        const resp = await apiClient.get(apiRoutes.admin.employees.simpleList);
        const opts = (resp.data?.data || resp.data || [])
          .map((e: any) => ({
            id: e.id,
            label: `${e.firstName || ''} ${e.lastName || ''}`.trim()
          }))
          .filter((o: any) => o.id !== undefined && o.label);
        setEmployeesOptions(opts);
        // Keep form in sync with selectedEmployeeId
        if (selectedEmployeeId) {
          setValue('employeeId', selectedEmployeeId as any);
        }
      } catch (error) {
        console.error('Erreur chargement employés:', error);
      }
    };
    fetchEmployeesSimple();
  }, [selectedEmployeeId, setValue]);

  // Charger le bulletin de l'employé sélectionné
  useEffect(() => {
    const fetchBulletin = async () => {
      if (!selectedEmployeeId) {
        setBulletin(null);
        setBulletinError(null);
        return;
      }

      try {
        setLoading(true);
        setBulletinError(null);
        const response = await apiClient.get(
          apiRoutes.admin.paies.bulletins.show(periodeId, selectedEmployeeId)
        );
        setBulletin(response.data.data);

        // Sync temps travail data
        const bulletinData = response.data.data;
        setTempsTravailData({
          joursTravailles: String(bulletinData.joursTravailles || ''),
          joursConges: String(bulletinData.joursConges || ''),
          joursAbsences: String(bulletinData.joursAbsences || ''),
          joursRecuperationPayes: String(
            bulletinData.joursRecuperationPayes || ''
          ),
          heuresTravaillees: String(bulletinData.heuresTravaillees || '')
        });
      } catch (error: any) {
        console.error('Erreur:', error);
        setBulletin(null);
        // Vérifier si c'est une erreur 404 ou "Bulletin de paie non trouvé"
        if (
          error?.response?.status === 404 ||
          error?.response?.data?.message === 'Bulletin de paie non trouvé'
        ) {
          setBulletinError('Bulletin de paie non trouvé');
        } else {
          setBulletinError('Erreur lors du chargement du bulletin');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBulletin();
  }, [periodeId, selectedEmployeeId]);

  // Schéma zod pour l'élément variable
  const numericOptional = z
    .string()
    .optional()
    .refine(
      (v) => v === undefined || v === '' || !isNaN(Number(v)),
      'Valeur numérique invalide'
    );

  const elementVariableSchema = z.object({
    rubriquePaieId: z.string().min(1, 'Rubrique obligatoire'),
    montant: z
      .string()
      .min(1, 'Montant obligatoire')
      .refine((v) => !isNaN(Number(v)), 'Montant invalide'),
    base: numericOptional,
    taux: numericOptional,
    quantite: numericOptional,
    commentaire: z.string().optional()
  });

  const {
    register: registerElement,
    handleSubmit: handleSubmitElement,
    formState: { errors: errorsElement },
    reset: resetElement,
    setValue: setValueElement,
    watch: watchElement,
    setError: setErrorElement
  } = useFormRHF({
    resolver: zodResolver(elementVariableSchema),
    defaultValues: {
      rubriquePaieId: '',
      montant: '',
      base: '',
      taux: '',
      quantite: '',
      commentaire: ''
    }
  });

  // Remplacer la fonction handleAddElement pour qu'elle reçoive les données du formulaire validées par react-hook-form/zod
  const toNullableNumber = (v?: string) =>
    v === undefined || v === '' ? null : parseFloat(v);

  const handleAddElement = async (data: any) => {
    const rubrique = rubriques.find((r) => r.id === data.rubriquePaieId);
    if (!rubrique) {
      toast.error('Rubrique invalide');
      return;
    }
    try {
      const response = await apiClient.post(
        apiRoutes.admin.paies.bulletins.addElement(
          periodeId,
          selectedEmployeeId!
        ),
        {
          rubriquePaieId: rubrique.id,
          libelle: rubrique.libelle,
          type: rubrique.type,
          montant: parseFloat(data.montant),
          base: toNullableNumber(data.base),
          taux: toNullableNumber(data.taux),
          quantite: toNullableNumber(data.quantite),
          commentaire: data.commentaire
        }
      );
      const updatedBulletin =
        (response as any)?.data?.data ?? (response as any)?.data;
      setBulletin(updatedBulletin);
      resetElement({
        rubriquePaieId: '',
        montant: '',
        base: '',
        taux: '',
        quantite: '',
        commentaire: ''
      });
      setIsEditMode(false);
      setSheetOpen(false);
      toast.success('Élément ajouté avec succès');
    } catch (error: any) {
      console.error('Erreur:', error);
      const apiErrors = error?.response?.data?.errors;
      if (apiErrors && typeof apiErrors === 'object') {
        Object.entries(apiErrors).forEach(([field, messages]) => {
          if (
            [
              'rubriquePaieId',
              'montant',
              'base',
              'taux',
              'quantite',
              'commentaire'
            ].includes(field)
          ) {
            setErrorElement(field as any, {
              type: 'server',
              message: Array.isArray(messages)
                ? String(messages[0])
                : String(messages)
            });
          }
        });
      } else {
        toast.error("Erreur lors de l'ajout de l'élément");
      }
    }
  };

  // Ajout état pour la confirmation générique
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    message: string;
    onConfirm: (() => void) | null;
  }>({ open: false, message: '', onConfirm: null });

  const handleDeleteElement = async (rubriqueId: string) => {
    setConfirmDialog({
      open: true,
      message: 'Voulez-vous vraiment supprimer cet élément ?',
      onConfirm: async () => {
        try {
          const response = await apiClient.delete(
            apiRoutes.admin.paies.bulletins.deleteElement(
              periodeId,
              selectedEmployeeId!,
              rubriqueId
            )
          );
          setBulletin(response.data);
          toast.success('Élément supprimé avec succès');
        } catch (error) {
          console.error('Erreur:', error);
          toast.error("Erreur lors de la suppression de l'élément");
        } finally {
          setConfirmDialog((d) => ({ ...d, open: false }));
        }
      }
    });
  };

  const handleEditElement = (element: ElementVariable) => {
    // Synchroniser le formulaire avec les valeurs de l'élément
    resetElement({
      rubriquePaieId: element.rubriquePaieId,
      montant: String(element.montant ?? ''),
      base: element.base != null ? String(element.base) : '',
      taux: element.taux != null ? String(element.taux) : '',
      quantite: element.quantite != null ? String(element.quantite) : '',
      commentaire: element.commentaire ?? ''
    });
    setIsEditMode(true);
    setSheetOpen(true);
  };

  const handleSaveTempsTravail = async () => {
    const safeNumber = (value: string, fieldLabel: string) => {
      if (value === '' || isNaN(Number(value))) {
        throw new Error(`Valeur invalide pour ${fieldLabel}`);
      }
      return parseFloat(value);
    };

    try {
      const payload = {
        joursTravailles: safeNumber(
          tempsTravailData.joursTravailles,
          'jours travaillés'
        ),
        joursConges: safeNumber(
          tempsTravailData.joursConges,
          'jours de congés'
        ),
        joursAbsences: safeNumber(
          tempsTravailData.joursAbsences,
          "jours d'absences"
        ),
        joursRecuperationPayes: safeNumber(
          tempsTravailData.joursRecuperationPayes,
          'jours de récupération payés'
        ),
        heuresTravaillees: safeNumber(
          tempsTravailData.heuresTravaillees,
          'heures travaillées'
        )
      };

      const response = await apiClient.put(
        apiRoutes.admin.paies.bulletins.updateTempsTravail(
          periodeId,
          selectedEmployeeId!
        ),
        payload
      );

      const updatedBulletin =
        (response as any)?.data?.data ?? (response as any)?.data;
      setBulletin(updatedBulletin);
      setEditingTempsTravail(false);
      toast.success('Temps de travail mis à jour avec succès');
    } catch (error: any) {
      console.error('Erreur:', error);
      if (
        error?.message &&
        String(error.message).startsWith('Valeur invalide')
      ) {
        toast.error(error.message);
      } else {
        toast.error('Erreur lors de la mise à jour du temps de travail');
      }
    }
  };

  const handleCancelTempsTravail = () => {
    if (bulletin) {
      setTempsTravailData({
        joursTravailles: String(bulletin.joursTravailles || ''),
        joursConges: String(bulletin.joursConges || ''),
        joursAbsences: String(bulletin.joursAbsences || ''),
        joursRecuperationPayes: String(bulletin.joursRecuperationPayes || ''),
        heuresTravaillees: String(bulletin.heuresTravaillees || '')
      });
    }
    setEditingTempsTravail(false);
  };

  const handleResetBulletin = async () => {
    setConfirmDialog({
      open: true,
      message:
        "Voulez-vous vraiment réinitialiser ce bulletin selon le profil de l'employé ?",
      onConfirm: async () => {
        try {
          const response = await apiClient.post(
            apiRoutes.admin.paies.bulletins.reset(
              periodeId,
              selectedEmployeeId!
            )
          );

          setBulletin(response.data);
          toast.success('Bulletin réinitialisé avec succès');
        } catch (error) {
          console.error('Erreur:', error);
          toast.error('Erreur lors de la réinitialisation du bulletin');
        } finally {
          setConfirmDialog((d) => ({ ...d, open: false }));
        }
      }
    });
  };

  const handleGenerateBulletin = () => {
    setShowGenerateDialog(true);
  };

  const handleConfirmGenerate = async () => {
    try {
      setShowGenerateDialog(false);

      // Generate the bulletin document
      const response = await apiClient.post(
        apiRoutes.admin.paies.bulletins.generate(
          periodeId,
          selectedEmployeeId!
        ),
        { format: selectedFormat },
        { responseType: 'blob' }
      );

      // Create a URL for the preview
      const blob = new Blob([response.data], {
        type:
          selectedFormat === 'pdf'
            ? 'application/pdf'
            : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const url = URL.createObjectURL(blob);

      setPreviewUrl(url);
      setShowPreviewDialog(true);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la génération du bulletin');
    }
  };

  const handleDownloadBulletin = () => {
    if (!previewUrl) return;

    const link = document.createElement('a');
    link.href = previewUrl;
    link.download = `bulletin_${bulletin?.nomComplet}_${new Date().toISOString().split('T')[0]}.${selectedFormat}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintBulletin = () => {
    if (!previewUrl || selectedFormat !== 'pdf') return;

    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = previewUrl;
    document.body.appendChild(iframe);

    iframe.onload = () => {
      iframe.contentWindow?.print();
    };
  };

  const handleCloseBulletin = async () => {
    setConfirmDialog({
      open: true,
      message:
        'Voulez-vous vraiment clôturer ce bulletin ? Cette action est irréversible.',
      onConfirm: async () => {
        try {
          const response = await apiClient.post(
            apiRoutes.admin.paies.bulletins.close(
              periodeId,
              selectedEmployeeId!
            )
          );

          setBulletin(response.data);
          toast.success('Bulletin clôturé avec succès');
        } catch (error) {
          console.error('Erreur:', error);
          toast.error('Erreur lors de la clôture du bulletin');
        } finally {
          setConfirmDialog((d) => ({ ...d, open: false }));
        }
      }
    });
  };

  // Helper: render employee selector
  const EmployeeSelector = (
    <div className='w-full md:w-72'>
      <SelectField<{ employeeId: string | number }, 'employeeId'>
        name='employeeId'
        label='Employé'
        control={control}
        options={employeesOptions}
        required
        placeholder='Sélectionner un employé'
        onFocus={undefined}
        className='bg-white'
      />
    </div>
  );

  // Subscribe to form value changes to propagate selection
  const employeeId = useWatch({ control, name: 'employeeId' });
  useEffect(() => {
    if (
      employeeId !== undefined &&
      employeeId !== null &&
      String(employeeId) !== String(selectedEmployeeId)
    ) {
      onEmployeeChange(String(employeeId));
    }
  }, [employeeId, onEmployeeChange, selectedEmployeeId]);

  // Utilitaire pour formater les nombres de façon sécurisée
  function formatNumber(val: unknown, digits = 2, suffix = '') {
    return typeof val === 'number' && isFinite(val)
      ? val.toFixed(digits) + (suffix ? ` ${suffix}` : '')
      : '-';
  }

  // Helper pour bloquer les actions
  const isCloture =
    periodeStatut === 'cloture' || bulletin?.statut === 'cloture';

  if (loading) {
    return (
      <div className='space-y-4'>
        {/* Skeleton for Employee Selector */}
        <Card className='shadow-sm'>
          <CardContent className='p-4'>
            <div className='flex flex-wrap items-center justify-between gap-4'>
              <Skeleton className='h-10 w-80' />
              <div className='flex gap-2'>
                <Skeleton className='h-9 w-32' />
                <Skeleton className='h-9 w-28' />
                <Skeleton className='h-9 w-28' />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Skeleton for Info Cards */}
        <div className='grid gap-4 lg:grid-cols-2'>
          <Card>
            <CardContent className='p-4'>
              <Skeleton className='mb-3 h-6 w-48' />
              <Skeleton className='mb-4 h-4 w-64' />
              <div className='grid grid-cols-4 gap-3'>
                <Skeleton className='h-8 w-full' />
                <Skeleton className='h-8 w-full' />
                <Skeleton className='h-8 w-full' />
                <Skeleton className='h-8 w-full' />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='p-4'>
              <Skeleton className='mb-3 h-6 w-40' />
              <div className='grid grid-cols-5 gap-2'>
                <Skeleton className='h-20 w-full' />
                <Skeleton className='h-20 w-full' />
                <Skeleton className='h-20 w-full' />
                <Skeleton className='h-20 w-full' />
                <Skeleton className='h-20 w-full' />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Skeleton for Bulletin Card */}
        <Card>
          <CardHeader>
            <Skeleton className='h-6 w-48' />
          </CardHeader>
          <CardContent className='space-y-4'>
            <Skeleton className='h-64 w-full' />
            <Skeleton className='h-64 w-full' />
            <Skeleton className='h-32 w-full' />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <PageContainer scrollable={true} className='mb-2 p-0'>
      <div className='mb-2 w-full space-y-6 p-0'>
        {/* Employee Selector with Actions - Modern Design - Always Visible */}
        <div className='from-primary/5 dark:from-primary/10 relative overflow-hidden rounded-xl border bg-gradient-to-br via-white to-white shadow-sm dark:via-slate-900 dark:to-slate-900'>
          <div className='bg-primary/5 absolute top-0 right-0 -z-0 h-64 w-64 rounded-full blur-3xl'></div>
          <div className='relative z-10 p-4'>
            <div className='flex flex-wrap items-center justify-between gap-4'>
              <div className='max-w-md min-w-[300px] flex-1'>
                {EmployeeSelector}
              </div>
              {bulletin && (
                <div className='flex flex-wrap items-center gap-2'>
                  <Button
                    size='sm'
                    variant='outline'
                    onClick={handleResetBulletin}
                    disabled={isCloture}
                    className='hover:border-primary hover:bg-primary/5 h-9 border-slate-300'
                  >
                    <RotateCcw className='mr-2 h-4 w-4' />
                    Réinitialiser
                  </Button>
                  <Button
                    size='sm'
                    variant='outline'
                    onClick={handleGenerateBulletin}
                    className='hover:border-primary hover:bg-primary/5 h-9 border-slate-300'
                  >
                    <FileText className='mr-2 h-4 w-4' />
                    Générer
                  </Button>
                  <Button
                    size='sm'
                    onClick={handleCloseBulletin}
                    disabled={isCloture}
                    className='h-9'
                  >
                    <Lock className='mr-2 h-4 w-4' />
                    Clôturer
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Error State - Bulletin non trouvé */}
        {bulletinError && selectedEmployeeId && (
          <Card className='border-2 border-dashed'>
            <CardContent className='p-12'>
              <div className='flex flex-col items-center justify-center space-y-4 text-center'>
                <div className='rounded-full bg-orange-100 p-4 dark:bg-orange-900/20'>
                  <FileText className='h-12 w-12 text-orange-600 dark:text-orange-400' />
                </div>
                <div>
                  <h3 className='mb-2 text-lg font-semibold text-gray-900 dark:text-white'>
                    Bulletin de paie non trouvé
                  </h3>
                  <p className='text-muted-foreground max-w-md text-sm'>
                    Aucun bulletin de paie n&apos;a été trouvé pour cet employé
                    dans cette période. Veuillez vérifier que l&apos;employé est
                    bien associé à cette période de paie.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* No Employee Selected State */}
        {!selectedEmployeeId && !bulletinError && (
          <Card className='border-2 border-dashed'>
            <CardContent className='p-12'>
              <div className='flex flex-col items-center justify-center space-y-4 text-center'>
                <div className='bg-primary/10 rounded-full p-4'>
                  <User className='text-primary h-12 w-12' />
                </div>
                <div>
                  <h3 className='mb-2 text-lg font-semibold text-gray-900 dark:text-white'>
                    Aucun employé sélectionné
                  </h3>
                  <p className='text-muted-foreground max-w-md text-sm'>
                    Veuillez sélectionner un employé ci-dessus pour afficher son
                    bulletin de paie.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Bulletin Content - Only shown when bulletin exists */}
        {bulletin && !bulletinError && (
          <>
            {/* Information Cards Grid - Modern Design */}
            <div className='grid gap-4 lg:grid-cols-2'>
              {/* Informations employé - Redesigned */}
              <div className='group relative overflow-hidden rounded-xl border bg-white shadow-sm transition-all duration-300 hover:shadow-lg dark:bg-slate-900'>
                <div className='from-primary/5 absolute inset-0 bg-gradient-to-br to-transparent opacity-0 transition-opacity group-hover:opacity-100'></div>
                <div className='relative p-2'>
                  <div className='mb-4 flex items-center gap-3'>
                    <div className='bg-primary/10 rounded-lg p-2.5 transition-transform group-hover:scale-110'>
                      <User className='text-primary h-5 w-5' />
                    </div>
                    <div>
                      <h3 className='text-lg font-semibold text-slate-900 dark:text-white'>
                        {bulletin.nomComplet}
                      </h3>
                      <p className='text-muted-foreground flex items-center gap-1.5 text-sm'>
                        <Briefcase className='h-3.5 w-3.5' />
                        {bulletin.poste} • {bulletin.departement}
                      </p>
                    </div>
                  </div>

                  <div className='grid grid-cols-2 gap-3'>
                    <div className='rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/50'>
                      <div className='mb-1 flex items-center gap-2'>
                        <div className='bg-primary h-1.5 w-1.5 rounded-full'></div>
                        <span className='text-muted-foreground text-xs font-medium'>
                          N° Employé
                        </span>
                      </div>
                      <p className='text-sm font-semibold'>
                        {bulletin.numeroEmploye}
                      </p>
                    </div>

                    <div className='rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/50'>
                      <div className='mb-1 flex items-center gap-2'>
                        <div className='bg-primary h-1.5 w-1.5 rounded-full'></div>
                        <span className='text-muted-foreground text-xs font-medium'>
                          CNSS
                        </span>
                      </div>
                      <p className='text-sm font-semibold'>{bulletin.cnss}</p>
                    </div>

                    <div className='rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/50'>
                      <div className='mb-1 flex items-center gap-2'>
                        <CreditCard className='text-muted-foreground h-3.5 w-3.5' />
                        <span className='text-muted-foreground text-xs font-medium'>
                          RIB
                        </span>
                      </div>
                      <p className='truncate text-sm font-semibold'>
                        {bulletin.rib}
                      </p>
                    </div>

                    <div className='rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/50'>
                      <div className='mb-1 flex items-center gap-2'>
                        <Calendar className='text-muted-foreground h-3.5 w-3.5' />
                        <span className='text-muted-foreground text-xs font-medium'>
                          Embauche
                        </span>
                      </div>
                      <p className='text-sm font-semibold'>
                        {new Date(bulletin.dateEmbauche).toLocaleDateString(
                          'fr-FR'
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Informations de temps - Redesigned */}
              <div className='group relative overflow-hidden rounded-xl border bg-white shadow-sm transition-all duration-300 hover:shadow-lg dark:bg-slate-900'>
                <div className='from-primary/5 absolute inset-0 bg-gradient-to-br to-transparent opacity-0 transition-opacity group-hover:opacity-100'></div>
                <div className='relative p-6'>
                  <div className='mb-4 flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                      <div className='bg-primary/10 rounded-lg p-2.5 transition-transform group-hover:scale-110'>
                        <Clock className='text-primary h-5 w-5' />
                      </div>
                      <h3 className='text-lg font-semibold'>
                        Temps de travail
                      </h3>
                    </div>
                    <div className='flex gap-2'>
                      {editingTempsTravail ? (
                        <>
                          <Button
                            size='sm'
                            variant='ghost'
                            className='h-8'
                            onClick={handleCancelTempsTravail}
                          >
                            <X className='mr-1.5 h-3.5 w-3.5' />
                            <span className='text-xs'>Annuler</span>
                          </Button>
                          <Button
                            size='sm'
                            className='h-8'
                            onClick={handleSaveTempsTravail}
                            disabled={isCloture}
                          >
                            <Save className='mr-1.5 h-3.5 w-3.5' />
                            <span className='text-xs'>Sauvegarder</span>
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size='sm'
                            variant='ghost'
                            className='h-8'
                            onClick={() => setEditingTempsTravail(true)}
                            disabled={isCloture}
                          >
                            <Edit className='mr-1.5 h-3.5 w-3.5' />
                            <span className='text-xs'>Modifier</span>
                          </Button>
                          <Sheet
                            open={sheetOpen}
                            onOpenChange={(open) => {
                              setSheetOpen(open);
                              if (!open) {
                                setIsEditMode(false);
                                resetElement({
                                  rubriquePaieId: '',
                                  montant: '',
                                  base: '',
                                  taux: '',
                                  quantite: '',
                                  commentaire: ''
                                });
                              } else if (!isEditMode) {
                                // Ouverture en mode ajout
                                resetElement({
                                  rubriquePaieId: '',
                                  montant: '',
                                  base: '',
                                  taux: '',
                                  quantite: '',
                                  commentaire: ''
                                });
                              }
                            }}
                          >
                            <SheetTrigger asChild>
                              <Button
                                size='sm'
                                className='h-8'
                                disabled={isCloture}
                              >
                                <Plus className='mr-1.5 h-3.5 w-3.5' />
                                <span className='text-xs'>Rubrique</span>
                              </Button>
                            </SheetTrigger>
                            <SheetContent className='sm:max-w-xl'>
                              <SheetHeader>
                                <SheetTitle>
                                  {isEditMode ? 'Modifier' : 'Ajouter'} un
                                  élément variable
                                </SheetTitle>
                                <SheetDescription>
                                  {isEditMode ? 'Modifiez' : 'Ajoutez'} un
                                  élément variable au bulletin de paie
                                </SheetDescription>
                              </SheetHeader>
                              <ScrollArea className='h-[calc(100vh-200px)] p-6 pr-4'>
                                <form
                                  onSubmit={handleSubmitElement(
                                    handleAddElement
                                  )}
                                >
                                  <div className='space-y-4 py-4'>
                                    <div className='space-y-2'>
                                      <Label htmlFor='rubrique'>
                                        Rubrique *
                                      </Label>
                                      <Select
                                        value={watchElement('rubriquePaieId')}
                                        onValueChange={(value) =>
                                          setValueElement(
                                            'rubriquePaieId',
                                            value
                                          )
                                        }
                                        disabled={isEditMode}
                                      >
                                        <SelectTrigger>
                                          <SelectValue placeholder='Sélectionnez une rubrique' />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {rubriques
                                            .filter(
                                              (r) =>
                                                r.type === 'gain' ||
                                                r.type === 'autre'
                                            )
                                            .map((r) => (
                                              <SelectItem
                                                key={r.id}
                                                value={r.id}
                                              >
                                                {r.code} - {r.libelle} ({r.type}
                                                )
                                              </SelectItem>
                                            ))}
                                        </SelectContent>
                                      </Select>
                                      {errorsElement.rubriquePaieId && (
                                        <span className='text-xs text-red-600'>
                                          {errorsElement.rubriquePaieId.message}
                                        </span>
                                      )}
                                    </div>
                                    <div className='space-y-2'>
                                      <Label htmlFor='montant'>Montant *</Label>
                                      <Input
                                        id='montant'
                                        type='number'
                                        step='0.01'
                                        placeholder='0.00'
                                        {...registerElement('montant')}
                                      />
                                      {errorsElement.montant && (
                                        <span className='text-xs text-red-600'>
                                          {errorsElement.montant.message}
                                        </span>
                                      )}
                                    </div>
                                    <div className='grid grid-cols-2 gap-4'>
                                      <div className='space-y-2'>
                                        <Label htmlFor='base'>Base</Label>
                                        <Input
                                          id='base'
                                          type='number'
                                          step='0.01'
                                          placeholder='0.00'
                                          {...registerElement('base')}
                                        />
                                        {errorsElement.base && (
                                          <span className='text-xs text-red-600'>
                                            {errorsElement.base.message}
                                          </span>
                                        )}
                                      </div>
                                      <div className='space-y-2'>
                                        <Label htmlFor='taux'>Taux</Label>
                                        <Input
                                          id='taux'
                                          type='number'
                                          step='0.01'
                                          placeholder='0.00'
                                          {...registerElement('taux')}
                                        />
                                        {errorsElement.taux && (
                                          <span className='text-xs text-red-600'>
                                            {errorsElement.taux.message}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <div className='space-y-2'>
                                      <Label htmlFor='quantite'>Quantité</Label>
                                      <Input
                                        id='quantite'
                                        type='number'
                                        step='0.01'
                                        placeholder='0.00'
                                        {...registerElement('quantite')}
                                      />
                                      {errorsElement.quantite && (
                                        <span className='text-xs text-red-600'>
                                          {errorsElement.quantite.message}
                                        </span>
                                      )}
                                    </div>
                                    <div className='space-y-2'>
                                      <Label htmlFor='commentaire'>
                                        Commentaire
                                      </Label>
                                      <Input
                                        id='commentaire'
                                        placeholder='Commentaire optionnel'
                                        {...registerElement('commentaire')}
                                      />
                                      {errorsElement.commentaire && (
                                        <span className='text-xs text-red-600'>
                                          {errorsElement.commentaire.message}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <SheetFooter>
                                    <div className='flex w-full items-center justify-end gap-2'>
                                      <SheetClose asChild className='w-1/2'>
                                        <Button variant='outline' type='button'>
                                          Annuler
                                        </Button>
                                      </SheetClose>
                                      <Button type='submit' className='w-1/2'>
                                        {isEditMode ? 'Modifier' : 'Ajouter'}
                                      </Button>
                                    </div>
                                  </SheetFooter>
                                </form>
                              </ScrollArea>
                            </SheetContent>
                          </Sheet>
                        </>
                      )}
                    </div>
                  </div>

                  {editingTempsTravail ? (
                    <div className='grid grid-cols-5 gap-3'>
                      {[
                        {
                          label: 'Travaillés',
                          value: tempsTravailData.joursTravailles,
                          field: 'joursTravailles'
                        },
                        {
                          label: 'Congés',
                          value: tempsTravailData.joursConges,
                          field: 'joursConges'
                        },
                        {
                          label: 'Absences',
                          value: tempsTravailData.joursAbsences,
                          field: 'joursAbsences'
                        },
                        {
                          label: 'Récup.',
                          value: tempsTravailData.joursRecuperationPayes,
                          field: 'joursRecuperationPayes'
                        },
                        {
                          label: 'Heures',
                          value: tempsTravailData.heuresTravaillees,
                          field: 'heuresTravaillees'
                        }
                      ].map((item) => (
                        <div key={item.field} className='space-y-1.5'>
                          <Label className='text-muted-foreground text-xs'>
                            {item.label}
                          </Label>
                          <Input
                            type='number'
                            step='0.5'
                            className='h-10 text-center font-semibold'
                            value={item.value}
                            onChange={(e) =>
                              setTempsTravailData({
                                ...tempsTravailData,
                                [item.field]: e.target.value
                              })
                            }
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className='grid grid-cols-5 gap-3'>
                      {[
                        {
                          label: 'Travaillés',
                          value: bulletin.joursTravailles
                        },
                        { label: 'Congés', value: bulletin.joursConges },
                        { label: 'Absences', value: bulletin.joursAbsences },
                        {
                          label: 'Récup.',
                          value: bulletin.joursRecuperationPayes
                        },
                        {
                          label: 'Heures',
                          value: `${bulletin.heuresTravaillees}h`
                        }
                      ].map((item, index) => (
                        <div
                          key={index}
                          className='hover:border-primary/50 rounded-lg border border-slate-200 bg-slate-50 p-3 text-center transition-colors dark:border-slate-700 dark:bg-slate-800/50'
                        >
                          <div className='mb-1 text-2xl font-bold'>
                            {item.value}
                          </div>
                          <div className='text-muted-foreground text-xs font-medium'>
                            {item.label}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bulletin de paie détaillé - Professional Design */}
            <Card className='border-t-primary border-t-2 pt-0 shadow-md'>
              <CardContent className='space-y-4 pt-6'>
                {/* Section 1: Gains */}
                <div className='rounded-lg border bg-slate-50/50 p-4 dark:bg-slate-900/20'>
                  <div className='mb-3 flex items-center gap-2'>
                    <TrendingUp className='h-4 w-4 text-slate-600' />
                    <Badge variant='outline' className='font-medium'>
                      Gains
                    </Badge>
                  </div>
                  <div className='overflow-hidden rounded-lg border bg-white dark:bg-slate-950'>
                    <Table>
                      <TableHeader>
                        <TableRow className='bg-slate-100 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-900'>
                          <TableHead className='font-semibold'>
                            Libellé
                          </TableHead>
                          <TableHead className='text-right font-semibold'>
                            Base
                          </TableHead>
                          <TableHead className='text-right font-semibold'>
                            Taux
                          </TableHead>
                          <TableHead className='text-right font-semibold'>
                            Montant
                          </TableHead>
                          <TableHead className='text-right text-xs font-semibold'>
                            Taux patronal
                          </TableHead>
                          <TableHead className='text-right text-xs font-semibold'>
                            Montant patronal
                          </TableHead>
                          <TableHead className='w-[80px]'></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow className='hover:bg-slate-50 dark:hover:bg-slate-900/50'>
                          <TableCell className='font-medium'>
                            Salaire de base
                          </TableCell>
                          <TableCell className='text-sm'>
                            {bulletin.heuresTravaillees}h
                          </TableCell>
                          <TableCell className='text-sm'>
                            {formatNumber(bulletin.tauxHoraire, 2, 'MAD/h')}
                          </TableCell>
                          <TableCell className='font-semibold'>
                            {formatNumber(bulletin.salaireBase, 2, 'MAD')}
                          </TableCell>
                          <TableCell className='text-muted-foreground text-sm'>
                            -
                          </TableCell>
                          <TableCell className='text-muted-foreground text-sm'>
                            -
                          </TableCell>
                          <TableCell></TableCell>
                        </TableRow>
                        {bulletin.elementsVariables?.map((ev, index) => (
                          <TableRow
                            key={index}
                            className='hover:bg-slate-50 dark:hover:bg-slate-900/50'
                          >
                            <TableCell className='font-medium'>
                              {ev.libelle}
                            </TableCell>
                            <TableCell className='text-sm'>
                              {ev.base ? `${formatNumber(ev.base, 2)}` : '-'}
                            </TableCell>
                            <TableCell className='text-sm'>
                              {ev.taux ? `${formatNumber(ev.taux, 2)}` : '-'}
                            </TableCell>
                            <TableCell className='font-semibold'>
                              {formatNumber(ev.montant, 2)} MAD
                            </TableCell>
                            <TableCell className='text-sm'>
                              {ev.tauxPatronal !== undefined &&
                              ev.tauxPatronal !== null
                                ? `${formatNumber(ev.tauxPatronal, 2)}%`
                                : '-'}
                            </TableCell>
                            <TableCell className='text-sm'>
                              {ev.montantPatronal !== undefined &&
                              ev.montantPatronal !== null
                                ? `${formatNumber(ev.montantPatronal, 2)} MAD`
                                : '-'}
                            </TableCell>
                            <TableCell>
                              <div className='flex gap-1'>
                                <Button
                                  size='icon'
                                  variant='ghost'
                                  className='h-8 w-8 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950'
                                  onClick={() => handleEditElement(ev)}
                                  disabled={isCloture}
                                >
                                  <Edit className='h-3.5 w-3.5' />
                                </Button>
                                <Button
                                  size='icon'
                                  variant='ghost'
                                  className='h-8 w-8 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950'
                                  onClick={() =>
                                    handleDeleteElement(ev.rubriquePaieId)
                                  }
                                  disabled={isCloture}
                                >
                                  <Trash2 className='h-3.5 w-3.5' />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                      <TableFooter className='bg-slate-100 dark:bg-slate-900'>
                        <TableRow className='hover:bg-slate-100 dark:hover:bg-slate-900'>
                          <TableCell colSpan={3} className='font-bold'>
                            Salaire brut
                          </TableCell>
                          <TableCell className='text-base font-bold'>
                            {formatNumber(bulletin.salaireBrut, 2, 'MAD')}
                          </TableCell>
                          <TableCell colSpan={3}></TableCell>
                        </TableRow>
                        <TableRow className='hover:bg-slate-100 dark:hover:bg-slate-900'>
                          <TableCell colSpan={3} className='font-bold'>
                            Salaire brut imposable
                          </TableCell>
                          <TableCell className='text-base font-bold'>
                            {formatNumber(
                              bulletin.salaireBrutImposable,
                              2,
                              'MAD'
                            )}
                          </TableCell>
                          <TableCell colSpan={3}></TableCell>
                        </TableRow>
                      </TableFooter>
                    </Table>
                  </div>
                </div>

                {/* Section 2: Cotisations */}
                <div className='rounded-lg border bg-slate-50/50 p-4 dark:bg-slate-900/20'>
                  <div className='mb-3 flex items-center gap-2'>
                    <DollarSign className='h-4 w-4 text-slate-600' />
                    <Badge variant='outline' className='font-medium'>
                      Cotisations
                    </Badge>
                  </div>
                  <div className='overflow-hidden rounded-lg border bg-white dark:bg-slate-950'>
                    <Table>
                      <TableHeader>
                        <TableRow className='bg-slate-100 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-900'>
                          <TableHead className='font-semibold'>
                            Libellé
                          </TableHead>
                          <TableHead className='text-right font-semibold'>
                            Base
                          </TableHead>
                          <TableHead className='text-right font-semibold'>
                            Taux
                          </TableHead>
                          <TableHead className='text-right font-semibold'>
                            Montant
                          </TableHead>
                          <TableHead className='text-right text-xs font-semibold'>
                            Taux patronal
                          </TableHead>
                          <TableHead className='text-right text-xs font-semibold'>
                            Montant patronal
                          </TableHead>
                          <TableHead className='w-[80px]'></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {bulletin.cotisations?.map((cot, index) => (
                          <TableRow
                            key={index}
                            className='hover:bg-slate-50 dark:hover:bg-slate-900/50'
                          >
                            <TableCell className='font-medium'>
                              {cot.libelle}
                            </TableCell>
                            <TableCell className='text-sm'>
                              {cot.base ? `${formatNumber(cot.base, 2)}` : '-'}
                            </TableCell>
                            <TableCell className='text-sm'>
                              {cot.taux ? `${formatNumber(cot.taux, 2)}%` : '-'}
                            </TableCell>
                            <TableCell className='font-semibold text-red-600'>
                              {formatNumber(cot.montant, 2)} MAD
                            </TableCell>
                            <TableCell className='text-sm'>
                              {cot.tauxPatronal !== undefined &&
                              cot.tauxPatronal !== null
                                ? `${formatNumber(cot.tauxPatronal, 2)}%`
                                : '-'}
                            </TableCell>
                            <TableCell className='text-sm font-semibold text-red-600'>
                              {cot.montantPatronal !== undefined &&
                              cot.montantPatronal !== null
                                ? `${formatNumber(cot.montantPatronal, 2)} MAD`
                                : '-'}
                            </TableCell>
                            <TableCell>
                              <div className='flex gap-1'>
                                <Button
                                  size='icon'
                                  variant='ghost'
                                  className='h-8 w-8 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950'
                                  onClick={() => handleEditElement(cot)}
                                  disabled={isCloture}
                                >
                                  <Edit className='h-3.5 w-3.5' />
                                </Button>
                                <Button
                                  size='icon'
                                  variant='ghost'
                                  className='h-8 w-8 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950'
                                  onClick={() =>
                                    handleDeleteElement(cot.rubriquePaieId)
                                  }
                                  disabled={isCloture}
                                >
                                  <Trash2 className='h-3.5 w-3.5' />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                      <TableFooter className='bg-slate-100 dark:bg-slate-900'>
                        <TableRow className='hover:bg-slate-100 dark:hover:bg-slate-900'>
                          <TableCell colSpan={3} className='font-bold'>
                            Total cotisations
                          </TableCell>
                          <TableCell className='text-base font-bold text-red-600'>
                            {formatNumber(bulletin.totalCotisations, 2)} MAD
                          </TableCell>
                          <TableCell colSpan={3}></TableCell>
                        </TableRow>
                      </TableFooter>
                    </Table>
                  </div>
                </div>

                {/* Section 3: Autres éléments */}
                {bulletin.autresElements &&
                  bulletin.autresElements.length > 0 && (
                    <div className='rounded-lg border bg-slate-50/50 p-4 dark:bg-slate-900/20'>
                      <div className='mb-3 flex items-center gap-2'>
                        <DollarSign className='h-4 w-4 text-slate-600' />
                        <Badge variant='outline' className='font-medium'>
                          Autres éléments
                        </Badge>
                      </div>
                      <div className='overflow-hidden rounded-lg border bg-white dark:bg-slate-950'>
                        <Table>
                          <TableHeader>
                            <TableRow className='bg-slate-100 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-900'>
                              <TableHead className='font-semibold'>
                                Libellé
                              </TableHead>
                              <TableHead className='font-semibold'>
                                Base
                              </TableHead>
                              <TableHead className='font-semibold'>
                                Taux
                              </TableHead>
                              <TableHead className='text-right font-semibold'>
                                Montant
                              </TableHead>
                              <TableHead className='text-right text-xs font-semibold'>
                                Taux patronal
                              </TableHead>
                              <TableHead className='text-right text-xs font-semibold'>
                                Montant patronal
                              </TableHead>
                              <TableHead className='w-[80px]'></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {bulletin.autresElements.map((autre, index) => (
                              <TableRow
                                key={index}
                                className='hover:bg-slate-50 dark:hover:bg-slate-900/50'
                              >
                                <TableCell className='font-medium'>
                                  {autre.libelle}
                                </TableCell>
                                <TableCell className='text-sm'>
                                  {autre.base
                                    ? `${formatNumber(autre.base, 2)}`
                                    : '-'}
                                </TableCell>
                                <TableCell className='text-sm'>
                                  {autre.taux
                                    ? `${formatNumber(autre.taux, 2)}%`
                                    : '-'}
                                </TableCell>
                                <TableCell
                                  className={`font-semibold ${
                                    autre.montant < 0
                                      ? 'text-red-600'
                                      : 'text-green-600'
                                  }`}
                                >
                                  {formatNumber(autre.montant, 2)} MAD
                                </TableCell>
                                <TableCell className='text-sm'>
                                  {autre.tauxPatronal !== undefined &&
                                  autre.tauxPatronal !== null
                                    ? `${formatNumber(autre.tauxPatronal, 2)}%`
                                    : '-'}
                                </TableCell>
                                <TableCell className='text-sm'>
                                  {autre.montantPatronal !== undefined &&
                                  autre.montantPatronal !== null
                                    ? `${formatNumber(autre.montantPatronal, 2)} MAD`
                                    : '-'}
                                </TableCell>
                                <TableCell>
                                  <div className='flex gap-1'>
                                    <Button
                                      size='icon'
                                      variant='ghost'
                                      className='h-8 w-8 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950'
                                      onClick={() => handleEditElement(autre)}
                                      disabled={isCloture}
                                    >
                                      <Edit className='h-3.5 w-3.5' />
                                    </Button>
                                    <Button
                                      size='icon'
                                      variant='ghost'
                                      className='h-8 w-8 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950'
                                      onClick={() =>
                                        handleDeleteElement(
                                          autre.rubriquePaieId
                                        )
                                      }
                                      disabled={isCloture}
                                    >
                                      <Trash2 className='h-3.5 w-3.5' />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}
                {/* Totaux finaux - Professional card */}
                <div className='bg-primary/10 relative overflow-hidden rounded-lg p-2 shadow-lg'>
                  <div className='relative flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                      <div className='bg-primary/30 rounded-lg p-3 backdrop-blur-sm'>
                        <DollarSign className='text-primary-700 h-6 w-6' />
                      </div>
                      <div>
                        <p className='text-primary-700 text-xs font-medium tracking-wider uppercase'>
                          Salaire net à payer
                        </p>
                        <p className='text-primary-900 mt-1 text-3xl font-bold'>
                          {new Intl.NumberFormat('fr-MA', {
                            style: 'currency',
                            currency: 'MAD'
                          }).format(bulletin.salaireNet)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Cumuls annuels - Professional grid */}
                <div className='pt-2'>
                  <h3 className='text-muted-foreground mb-3 flex items-center gap-2 text-sm font-semibold tracking-wide uppercase'>
                    <TrendingUp className='h-4 w-4' />
                    Cumuls annuels
                  </h3>
                  <div className='grid gap-3 md:grid-cols-4'>
                    <div className='rounded-lg border bg-slate-50 p-3 transition-shadow hover:shadow-md dark:bg-slate-900/20'>
                      <Label className='text-muted-foreground text-xs font-medium'>
                        Salaire brut
                      </Label>
                      <div className='mt-1 text-lg font-bold'>
                        {formatNumber(
                          bulletin.cumulAnnuel?.salaireBrut,
                          2,
                          'MAD'
                        )}
                      </div>
                    </div>
                    <div className='rounded-lg border bg-slate-50 p-3 transition-shadow hover:shadow-md dark:bg-slate-900/20'>
                      <Label className='text-muted-foreground text-xs font-medium'>
                        Cotisations
                      </Label>
                      <div className='mt-1 text-lg font-bold text-red-600'>
                        {formatNumber(
                          bulletin.cumulAnnuel?.cotisations,
                          2,
                          'MAD'
                        )}
                      </div>
                    </div>
                    <div className='rounded-lg border bg-slate-50 p-3 transition-shadow hover:shadow-md dark:bg-slate-900/20'>
                      <Label className='text-muted-foreground text-xs font-medium'>
                        Salaire net
                      </Label>
                      <div className='mt-1 text-lg font-bold text-green-600'>
                        {formatNumber(
                          bulletin.cumulAnnuel?.salaireNet,
                          2,
                          'MAD'
                        )}
                      </div>
                    </div>
                    <div className='rounded-lg border bg-slate-50 p-3 transition-shadow hover:shadow-md dark:bg-slate-900/20'>
                      <Label className='text-muted-foreground text-xs font-medium'>
                        IR
                      </Label>
                      <div className='mt-1 text-lg font-bold'>
                        {formatNumber(bulletin.cumulAnnuel?.ir, 2, 'MAD')}
                      </div>
                    </div>
                  </div>
                </div>
                <div className='min-h-[200px]'></div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Dialog pour choisir le format de génération */}
        <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
          <DialogContent className='sm:max-w-md'>
            <DialogHeader>
              <DialogTitle>Générer le bulletin de paie</DialogTitle>
              <DialogDescription>
                Choisissez le format de génération pour le bulletin de{' '}
                {bulletin?.nomComplet}
              </DialogDescription>
            </DialogHeader>
            <div className='py-4'>
              <RadioGroup
                value={selectedFormat}
                onValueChange={(value: 'pdf' | 'excel') =>
                  setSelectedFormat(value)
                }
              >
                <div className='flex cursor-pointer items-center space-x-2 rounded-lg border p-4 hover:bg-slate-50 dark:hover:bg-slate-900'>
                  <RadioGroupItem value='pdf' id='pdf' />
                  <Label htmlFor='pdf' className='flex-1 cursor-pointer'>
                    <div className='flex items-center gap-3'>
                      <FileText className='h-5 w-5 text-red-600' />
                      <div>
                        <div className='font-medium'>Format PDF</div>
                        <div className='text-muted-foreground text-xs'>
                          Document imprimable et portable
                        </div>
                      </div>
                    </div>
                  </Label>
                </div>
                <div className='mt-3 flex cursor-pointer items-center space-x-2 rounded-lg border p-4 hover:bg-slate-50 dark:hover:bg-slate-900'>
                  <RadioGroupItem value='excel' id='excel' />
                  <Label htmlFor='excel' className='flex-1 cursor-pointer'>
                    <div className='flex items-center gap-3'>
                      <FileText className='h-5 w-5 text-green-600' />
                      <div>
                        <div className='font-medium'>Format Excel</div>
                        <div className='text-muted-foreground text-xs'>
                          Fichier Excel modifiable
                        </div>
                      </div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>
            <DialogFooter>
              <Button
                variant='outline'
                onClick={() => setShowGenerateDialog(false)}
              >
                Annuler
              </Button>
              <Button onClick={handleConfirmGenerate}>Générer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog pour prévisualiser et imprimer */}
        <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
          <DialogContent className='h-[90vh] max-w-4xl'>
            <DialogHeader>
              <DialogTitle>Aperçu du bulletin de paie</DialogTitle>
              <DialogDescription>
                Bulletin de {bulletin?.nomComplet} - Format{' '}
                {selectedFormat.toUpperCase()}
              </DialogDescription>
            </DialogHeader>
            <div className='flex-1 overflow-hidden'>
              {selectedFormat === 'pdf' && previewUrl ? (
                <iframe
                  src={previewUrl}
                  className='h-[calc(90vh-200px)] w-full rounded-lg border'
                  title='Aperçu du bulletin'
                />
              ) : (
                <div className='flex h-[calc(90vh-200px)] items-center justify-center rounded-lg border bg-slate-50 dark:bg-slate-900'>
                  <div className='text-center'>
                    <FileText className='text-muted-foreground mx-auto mb-4 h-16 w-16' />
                    <p className='text-muted-foreground'>
                      {selectedFormat === 'excel'
                        ? "L'aperçu n'est pas disponible pour les fichiers Excel. Téléchargez le fichier pour le consulter."
                        : "Chargement de l'aperçu..."}
                    </p>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter className='gap-2'>
              <Button
                variant='outline'
                onClick={() => setShowPreviewDialog(false)}
              >
                Fermer
              </Button>
              <Button variant='outline' onClick={handleDownloadBulletin}>
                <Download className='mr-2 h-4 w-4' />
                Télécharger
              </Button>
              {selectedFormat === 'pdf' && (
                <Button onClick={handlePrintBulletin}>
                  <Printer className='mr-2 h-4 w-4' />
                  Imprimer
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog de confirmation générique */}
        <Dialog
          open={confirmDialog.open}
          onOpenChange={(open) => setConfirmDialog((d) => ({ ...d, open }))}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmation</DialogTitle>
              <DialogDescription>{confirmDialog.message}</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant='outline'
                onClick={() => setConfirmDialog((d) => ({ ...d, open: false }))}
              >
                Annuler
              </Button>
              <Button
                onClick={async () => {
                  if (confirmDialog.onConfirm) await confirmDialog.onConfirm();
                }}
              >
                Confirmer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageContainer>
  );
}
