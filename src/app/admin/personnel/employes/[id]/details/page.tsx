'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import apiClient from '@/lib/api';
import { apiRoutes } from '@/config/apiRoutes';
import PageContainer from '@/components/layout/page-container';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { AnimatedTabContent } from './components';
import {
  Calendar,
  FileText,
  GraduationCap,
  Heart,
  Users,
  Mail,
  Phone,
  Building2,
  UserRound,
  NotebookText,
  Pencil,
  Download,
  Check,
  Trash2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { useLanguage } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { EmployeeDetailsLoadingSkeleton } from '@/app/admin/personnel/employes/[id]/details/loading-skeleton';
import { FileUploader } from '@/components/file-uploader';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DatePickerField } from '@/components/custom/DatePickerField';
import { SelectField } from '@/components/custom/SelectField';
import { useForm } from 'react-hook-form';
import { PeploeInCharge } from '@/app/admin/personnel/employes/[id]/details/components/PeploeInCharge';
import { SkillsTab } from '@/app/admin/personnel/employes/[id]/details/components/SkillsTab';
import { DocumentsTab } from '@/app/admin/personnel/employes/[id]/details/components/DocumentsTab';
import { PersonalTab } from '@/app/admin/personnel/employes/[id]/details/components/PersonalTab';
import { ExperiencesTab } from './components/ExperiencesTab';
import { SocialContributionsTab } from '@/app/admin/personnel/employes/[id]/details/components/SocialContributionsTab';
import Image from 'next/image';

interface EmployeeRow {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate?: string;
  birthPlace?: string;
  gender?: 'M' | 'F';
  nationality?: string;
  departement?: {
    id: number;
    name: string;
    nameAr?: string;
  };
  maritalStatus?: string;
  numberOfChildren?: number;
  address?: string;
  matricule?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  departmentId?: string;
  hireDate?: string;
  notes?: string;
  education?: {
    level: string;
    diploma?: string;
    year?: string;
    institution?: string;
  }[];
  skills?: { name: string; level: number }[];
  certifications?: {
    name: string;
    issuer?: string;
    issueDate?: string;
    expirationDate?: string;
  }[];
  documents?: {
    id: string;
    title: string;
    fileName?: string;
    mimeType?: string;
    size?: number;
    documentType?: 'cin' | 'certificate' | 'diploma' | 'experience' | 'other';
  }[];
  experiences?: {
    title: string;
    company?: string;
    startDate?: string;
    endDate?: string;
    description?: string;
    documents?: { fileName: string; mimeType?: string; size?: number }[];
  }[];
  status?: string;
  cin?: string;
  peopleInCharge?: {
    name: string;
    phone: string;
    cin?: string; // standardized to lowercase
    birthDate?: string;
    relationship: string;
  }[];
}

export default function EmployeeDetailsPage() {
  const params = useParams<{ id: string }>();
  const id = useMemo(() => params?.id, [params]);
  const router = useRouter();
  const [emp, setEmp] = useState<EmployeeRow | null>(null);
  const [active, setActive] = useState('personal');
  const [media, setMedia] = useState<any[]>([]);
  const [openPreview, setOpenPreview] = useState(false);
  const [previewItem, setPreviewItem] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();
  const [openChangePhoto, setOpenChangePhoto] = useState(false);
  const [selectedPhotoFiles, setSelectedPhotoFiles] = useState<File[]>([]);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [openEditItem, setOpenEditItem] = useState<{
    section:
      | 'education'
      | 'skills'
      | 'certifications'
      | 'documents'
      | 'peopleInCharge'
      | 'experiences'
      | 'socialContributions';
    index?: number;
  } | null>(null);
  const [tempItem, setTempItem] = useState<any>(null);
  const [docFiles, setDocFiles] = useState<File[]>([]);

  // relationship form control for SelectField
  const relForm = useForm<{ relationship: string }>({
    defaultValues: { relationship: '' }
  });
  const [currentContributionType, setCurrentContributionType] = useState<string>('CNSS');
  const [mutuellesList, setMutuellesList] = useState<any[]>([]);
  const typeForm = useForm<{ type: string }>({ defaultValues: { type: 'CNSS' } });
  const selectedType = typeForm.watch('type');

  useEffect(() => {
    if (openEditItem?.section !== 'socialContributions') return;
    if (!selectedType) return;
    // update tempItem type/code
    setTempItem((p: any) => ({ ...p, type: selectedType, code: selectedType }));
    // autofill defaults
    const found = (mutuellesList || []).find((m: any) => m.code === selectedType);
    const def = found?.defaultRates;
    if (def) {
      setTempItem((p: any) => ({
        ...p,
        employeeRatePct: def.employeePct,
        employerRatePct: def.employerPct
      }));
    }
  }, [selectedType, openEditItem?.section, mutuellesList]);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setLoading(true);
        const res = await apiClient.get(apiRoutes.admin.employees.details(id));
        const payload: any =
          res.data && typeof res.data === 'object' && 'data' in res.data
            ? res.data.data
            : res.data;
        // Normalize peopleInCharge: object -> array, map CIN->cin
        if (payload && payload.peopleInCharge) {
          const pic = payload.peopleInCharge;
          const arr = Array.isArray(pic) ? pic : pic ? [pic] : [];
          payload.peopleInCharge = arr.map((c: any) => {
            const mapped = { ...c };
            if (mapped.CIN && !mapped.cin) {
              mapped.cin = mapped.CIN;
            }
            return mapped;
          });
        }
        setEmp(payload as EmployeeRow);

        const mediaRes = await apiClient.get(apiRoutes.admin.media.list);
        const mediaPayload: any[] =
          mediaRes.data &&
          typeof mediaRes.data === 'object' &&
          'data' in mediaRes.data
            ? mediaRes.data.data
            : mediaRes.data;
        setMedia(mediaPayload);
      } catch (e) {
        toast.error("Impossible de charger l'employé");
        router.push('/admin/personnel/employes');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, router]);

  useEffect(() => {
    // Load mutuelles/social schemes for selection and defaults
    (async () => {
      try {
        const res = await apiClient.get(`${process.env.NEXT_PUBLIC_USE_MOCK === 'true' ? (process.env.JSON_SERVER_URL || 'http://localhost:3001') : (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8003/api/v1')}/mutuelles`);
        const payload: any = res.data && typeof res.data === 'object' && 'data' in res.data ? res.data.data : res.data;
        setMutuellesList(Array.isArray(payload) ? payload : []);
      } catch (e) {
        // silent fail, will fallback to static defaults
        setMutuellesList([
          { code: 'CNSS', name: 'CNSS', defaultRates: { employeePct: 4.48, employerPct: 8.98 } },
          { code: 'AMO', name: 'AMO', defaultRates: { employeePct: 2.26, employerPct: 2.26 } },
          { code: 'CIMR', name: 'CIMR', defaultRates: { employeePct: 6.0, employerPct: 6.0 } },
          { code: 'RCAR', name: 'RCAR', defaultRates: { employeePct: 20.0, employerPct: 0.0 } },
          { code: 'Mutuelle', name: 'Mutuelle', defaultRates: { employeePct: 2.0, employerPct: 3.0 } }
        ]);
      }
    })();
  }, []);

  const fullName = emp ? `${emp.firstName} ${emp.lastName}` : '';
  const initials = emp ? `${emp.firstName?.[0]}${emp.lastName?.[0]}` : '';

  // Use uploaded avatar if available, fallback to default static image
  const currentAvatarSrc = avatarUrl || '/images/user/profile.png';

  const handleOpen = (item: any) => {
    setPreviewItem(item);
    setOpenPreview(true);
  };

  const formatDate = (date?: string) => {
    if (!date) return '—';
    try {
      return format(new Date(date), 'dd MMM yyyy', { locale: fr });
    } catch {
      return date;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'actif':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'inactif':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'suspendu':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      default:
        return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  const handleSaveAvatar = async () => {
    if (!selectedPhotoFiles || selectedPhotoFiles.length === 0) {
      toast.error('Veuillez sélectionner une image');
      return;
    }
    const file = selectedPhotoFiles[0];
    try {
      setAvatarUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      const res = await apiClient.post(apiRoutes.files.uploadTemp, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const payload: any =
        res.data && typeof res.data === 'object' && 'data' in res.data
          ? res.data.data
          : res.data;
      const fileName = payload?.fileName || payload?.filename || payload?.name;
      const url =
        payload?.url || (fileName ? `/images/user/${fileName}` : undefined);
      const finalUrl =
        url || (file instanceof File ? URL.createObjectURL(file) : undefined);
      if (!finalUrl) {
        toast.error('Échec du téléchargement de la photo');
        return;
      }
      setAvatarUrl(finalUrl);
      toast.success('Photo de profil mise à jour');
      setOpenChangePhoto(false);
      setSelectedPhotoFiles([]);
    } catch (e) {
      console.error(e);
      toast.error('Impossible de mettre à jour la photo');
    } finally {
      setAvatarUploading(false);
    }
  };

  const patchEmployee = async (
    partial: Partial<EmployeeRow>,
    successMsg = t('common.saved')
  ) => {
    try {
      await apiClient.patch(apiRoutes.admin.employees.details(id!), partial);
      setEmp((prev) => ({ ...(prev as EmployeeRow), ...(partial as any) }));
      toast.success(successMsg || 'Enregistré');
    } catch (e) {
      console.error(e);
      toast.error(t('common.error'));
    }
  };

  const updateField = async (key: string, value: any) => {
    await patchEmployee({ [key]: value } as Partial<EmployeeRow>);
  };

  const [currentDocumentType, setCurrentDocumentType] = useState<
    'cin' | 'certificate' | 'diploma' | 'experience' | 'other'
  >('other');

  const openItemDialog = (
    section:
      | 'education'
      | 'skills'
      | 'certifications'
      | 'documents'
      | 'peopleInCharge'
      | 'experiences'
      | 'socialContributions',
    index?: number,
    docType?: 'cin' | 'certificate' | 'diploma' | 'experience' | 'other'
  ) => {
    setOpenEditItem({ section, index });
    let base: any = {};
    if (section === 'education')
      base =
        index != null
          ? (emp?.education?.[index] ?? {})
          : { level: '', diploma: '', year: '', institution: '' };
    if (section === 'skills')
      base =
        index != null ? (emp?.skills?.[index] ?? {}) : { name: '', level: 3 };
    if (section === 'certifications')
      base =
        index != null
          ? (emp?.certifications?.[index] ?? {})
          : { name: '', issuer: '', issueDate: '', expirationDate: '' };
    if (section === 'documents') {
      // Auto-set title based on document type
      let autoTitle = '';
      if (docType === 'cin') autoTitle = 'CIN';
      else if (docType === 'certificate') autoTitle = 'Certificat';
      else if (docType === 'diploma') autoTitle = 'Diplôme';
      else if (docType === 'experience') autoTitle = 'Document expérience';

      base =
        index != null
          ? (emp?.documents?.[index] ?? {})
          : { title: autoTitle, documentType: docType || 'other' };
      if (docType) setCurrentDocumentType(docType);
    }
    if (section === 'experiences')
      base =
        index != null
          ? (emp?.experiences?.[index] ?? {})
          : {
              title: '',
              company: '',
              startDate: '',
              endDate: '',
              description: '',
              documents: []
            };
    if (section === 'peopleInCharge') {
      base =
        index != null
          ? (emp?.peopleInCharge?.[index] ?? {})
          : { name: '', phone: '', relationship: '', cin: '', birthDate: '' };
      if (base.CIN && !base.cin) base.cin = base.CIN;
    }
    if (section === 'socialContributions') {
      const initialType = index != null ? (emp as any)?.socialContributions?.[index]?.type : currentContributionType;
      typeForm.reset({ type: initialType || 'CNSS' });
      base =
        index != null
          ? (emp as any)?.socialContributions?.[index] ?? {}
          : {
              type: initialType || 'CNSS',
              code: initialType || 'CNSS',
              affiliationNumber: '',
              employeeRatePct: undefined,
              employerRatePct: undefined,
              startDate: '',
              endDate: '',
              providerName: ''
            };
    }
    setTempItem(base);
    setDocFiles([]);
  };

  const saveItemDialog = async () => {
    if (!openEditItem) return;
    const { section, index } = openEditItem;
    const current = { ...emp } as EmployeeRow;
    const list = (current as any)[section] || [];
    let newList = Array.isArray(list) ? list.slice() : [];

    // Handle document uploads for documents section
    if (section === 'documents' && docFiles.length) {
      try {
        const formData = new FormData();
        formData.append('file', docFiles[0]);
        const up = await apiClient.post(apiRoutes.files.uploadTemp, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        const payload: any =
          up.data && typeof up.data === 'object' && 'data' in up.data
            ? up.data.data
            : up.data;
        tempItem.fileName =
          payload?.fileName || payload?.filename || docFiles[0].name;
        tempItem.mimeType = payload?.mimeType || docFiles[0].type;
        tempItem.size = payload?.size || docFiles[0].size;
      } catch (e) {
        console.error(e);
        toast.error('Échec du téléversement');
        return;
      }
    }

    // Ensure documentType is preserved for documents
    if (section === 'documents' && !tempItem.documentType) {
      tempItem.documentType = currentDocumentType;
    }

    // Handle document uploads for experiences, education, and certifications sections
    if (
      (section === 'experiences' ||
        section === 'education' ||
        section === 'certifications') &&
      docFiles.length > 0
    ) {
      try {
        const uploadedDocs = [];
        for (const file of docFiles) {
          const formData = new FormData();
          formData.append('file', file);
          const up = await apiClient.post(
            apiRoutes.files.uploadTemp,
            formData,
            { headers: { 'Content-Type': 'multipart/form-data' } }
          );
          const payload: any =
            up.data && typeof up.data === 'object' && 'data' in up.data
              ? up.data.data
              : up.data;
          uploadedDocs.push({
            fileName: payload?.fileName || payload?.filename || file.name,
            mimeType: payload?.mimeType || file.type,
            size: payload?.size || file.size
          });
        }
        // Add uploaded documents to existing ones
        tempItem.documents = [...(tempItem.documents || []), ...uploadedDocs];
      } catch (e) {
        console.error(e);
        toast.error('Échec du téléversement des documents');
        return;
      }
    }

    // Validate peopleInCharge inputs
    let itemForSave = tempItem;
    if (section === 'peopleInCharge') {
      const item = { ...tempItem };
      // Ensure relationship from SelectField is captured
      item.relationship =
        relForm.getValues('relationship') || item.relationship || '';
      // Ensure lowercase cin property
      if (item.CIN && !item.cin) item.cin = item.CIN;
      // Basic validation: name, phone, relationship required, cin format if provided
      const cinRegex = /^[A-Z]{1,2}\d{3,6}$/;
      if (!item.name?.trim()) {
        toast.error('Le nom est requis');
        return;
      }
      if (!item.phone?.trim()) {
        toast.error('Le téléphone est requis');
        return;
      }
      if (!item.relationship?.trim()) {
        toast.error('La relation est requise');
        return;
      }
      if (item.cin && !cinRegex.test(String(item.cin).toUpperCase())) {
        toast.error('Format CIN invalide (ex: AB123456)');
        return;
      }
      itemForSave = item;
    }

    // Validate socialContributions
    if (section === 'socialContributions') {
      const item = { ...tempItem };
      if (!item.type) {
        toast.error('Type requis (CNSS, AMO, CIMR, Mutuelle, RCAR)');
        return;
      }
      // Default code equals type if missing
      item.code = item.code || item.type;
      // Normalize number fields
      const toNum = (v: any) => (v === '' || v == null ? undefined : Number(v));
      item.employeeRatePct = toNum(item.employeeRatePct);
      item.employerRatePct = toNum(item.employerRatePct);
      itemForSave = item;
    }

    if (index != null) {
      newList[index] = itemForSave;
    } else {
      newList.push(itemForSave);
    }

    await patchEmployee({ [section]: newList } as any);
    setOpenEditItem(null);
    setTempItem(null);
  };

  const removeItem = async (
    section:
      | 'education'
      | 'skills'
      | 'certifications'
      | 'documents'
      | 'peopleInCharge'
      | 'experiences'
      | 'socialContributions',
    index: number
  ) => {
    const list = ((emp as any)?.[section] || []).slice();
    list.splice(index, 1);
    await patchEmployee({ [section]: list } as any, t('common.deleted'));
  };

  const [confirmDelete, setConfirmDelete] = useState<{ section: 'socialContributions'; index: number } | null>(null);

  if (loading) {
    return (
      <PageContainer>
        <EmployeeDetailsLoadingSkeleton />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className='mx-auto mt-2 w-full space-y-2 px-4 py-6'>
        {/* Header Section - Modern Hero */}
        <Card className='relative overflow-hidden border-2 py-0'>
          <div className='from-primary/5 via-primary/10 to-background absolute inset-0 bg-gradient-to-br opacity-50' />

          <div className='relative p-2 md:p-8'>
            <div className='flex flex-col gap-6 md:flex-row'>
              <div className='relative flex-shrink-0'>
                <Avatar className='ring-primary/20 h-24 w-24 shadow-lg ring-4 md:h-32 md:w-32'>
                  <AvatarImage src={currentAvatarSrc} alt={fullName} />
                  <AvatarFallback className='from-primary to-primary/60 text-primary-foreground bg-gradient-to-br text-2xl font-bold'>
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type='button'
                        variant='secondary'
                        size='icon'
                        onClick={() => setOpenChangePhoto(true)}
                        className='absolute right-0 bottom-0 h-8 w-8 translate-x-1/4 translate-y-1/4 rounded-full border shadow-md hover:shadow-lg'
                        aria-label={
                          t('employeeDetails.actions.editPhotoTooltip') ||
                          'Modifier la photo de profil'
                        }
                      >
                        <Pencil className='h-4 w-4' />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {t('employeeDetails.actions.editPhotoTooltip') ||
                        'Modifier la photo de profil'}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <div className='flex-1 space-y-4'>
                <div className='space-y-2'>
                  <div className='flex items-start justify-between gap-4'>
                    <div>
                      <h1 className='from-foreground to-foreground/70 bg-gradient-to-r bg-clip-text text-3xl font-bold tracking-tight'>
                        {fullName}
                      </h1>
                    </div>
                    {emp?.status && (
                      <Badge
                        className={cn(
                          'px-3 py-1 font-medium',
                          getStatusColor(emp.status)
                        )}
                      >
                        {emp.status}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4'>
                  <div className='bg-background/80 flex items-center gap-3 rounded-lg border p-3'>
                    <div className='bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-lg'>
                      <Mail className='h-5 w-5' />
                    </div>
                    <div className='min-w-0 flex-1'>
                      <p className='text-muted-foreground text-xs'>Matricule</p>
                      <p className='truncate text-sm font-medium'>
                        {emp?.matricule || '—'}
                      </p>
                    </div>
                  </div>

                  <div className='bg-background/80 flex items-center gap-3 rounded-lg border p-3'>
                    <div className='bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-lg'>
                      <Phone className='h-5 w-5' />
                    </div>
                    <div className='min-w-0 flex-1'>
                      <p className='text-muted-foreground text-xs'>Téléphone</p>
                      <p className='truncate text-sm font-medium'>
                        {emp?.phone || '—'}
                      </p>
                    </div>
                  </div>

                  <div className='bg-background/80 flex items-center gap-3 rounded-lg border p-3'>
                    <div className='bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-lg'>
                      <Building2 className='h-5 w-5' />
                    </div>
                    <div className='min-w-0 flex-1'>
                      <p className='text-muted-foreground text-xs'>
                        Département
                      </p>
                      <p className='truncate text-sm font-medium'>
                        {emp?.departement?.name || '—'}
                      </p>
                    </div>
                  </div>

                  <div className='bg-background/80 flex items-center gap-3 rounded-lg border p-3'>
                    <div className='bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-lg'>
                      <Calendar className='h-5 w-5' />
                    </div>
                    <div className='min-w-0 flex-1'>
                      <p className='text-muted-foreground text-xs'>Embauche</p>
                      <p className='truncate text-sm font-medium'>
                        {formatDate(emp?.hireDate)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Tabs Section */}
        <Tabs value={active} onValueChange={setActive} className='space-y-4'>
          <TabsList className='bg-muted/50 flex h-auto w-full flex-wrap items-center gap-2 p-2'>
            <TabsTrigger
              value='personal'
              className='data-[state=active]:bg-background gap-2 px-3 py-2'
            >
              <UserRound className='h-4 w-4' />
              <span className='text-sm'>{t('employeeDetails.tabs.personal')}</span>
            </TabsTrigger>
            <TabsTrigger
              value='peopleInCharge'
              className='data-[state=active]:bg-background gap-2 px-3 py-2'
            >
              <Users className='h-4 w-4' />
              <span className='text-sm'>{t('employeeDetails.tabs.peopleInCharge')}</span>
            </TabsTrigger>
            <TabsTrigger
              value='skills'
              className='data-[state=active]:bg-background gap-2 px-3 py-2'
            >
              <GraduationCap className='h-4 w-4' />
              <span className='text-sm'>{t('employeeDetails.tabs.skills')}</span>
            </TabsTrigger>
            <TabsTrigger
              value='documents'
              className='data-[state=active]:bg-background gap-2 px-3 py-2'
            >
              <FileText className='h-4 w-4' />
              <span className='text-sm'>{t('employeeDetails.tabs.documents')}</span>
            </TabsTrigger>
            <TabsTrigger
              value='social'
              className='data-[state=active]:bg-background gap-2 px-3 py-2'
            >
              <Heart className='h-4 w-4' />
              <span className='text-sm'>{t('employeeDetails.tabs.social')}</span>
            </TabsTrigger>
            <TabsTrigger
              value='contracts'
              className='data-[state=active]:bg-background gap-2 px-3 py-2'
            >
              <NotebookText className='h-4 w-4' />
              <span className='text-sm'>{t('employeeDetails.tabs.contracts')}</span>
            </TabsTrigger>
            <TabsTrigger
              value='leaves'
              className='data-[state=active]:bg-background gap-2 px-3 py-2'
            >
              <Calendar className='h-4 w-4' />
              <span className='text-sm'>{t('employeeDetails.tabs.leaves')}</span>
            </TabsTrigger>
            <TabsTrigger
              value='experiences'
              className='data-[state=active]:bg-background gap-2 px-3 py-2'
            >
              <NotebookText className='h-4 w-4' />
              <span className='text-sm'>{t('employeeDetails.tabs.experiences')}</span>
            </TabsTrigger>
          </TabsList>

          {/* Personal Tab */}
          <TabsContent value='personal' className='space-y-4'>
            <PersonalTab
              active={active === 'personal'}
              employee={emp}
              onUpdate={updateField}
              documents={emp?.documents || []}
              onAddDocument={(docType) =>
                openItemDialog('documents', undefined, docType)
              }
              onEditDocument={(index) => openItemDialog('documents', index)}
              onDeleteDocument={(index) => removeItem('documents', index)}
              onPreviewDocument={handleOpen}
            />
          </TabsContent>

          {/* peopleInCharge Tab */}
          <TabsContent value='peopleInCharge' className='space-y-4'>
            <PeploeInCharge
              active={active === 'peopleInCharge'}
              contacts={emp?.peopleInCharge || []}
              onAdd={() => openItemDialog('peopleInCharge')}
              onEdit={(index) => openItemDialog('peopleInCharge', index)}
              onDelete={(index) => removeItem('peopleInCharge', index)}
            />
          </TabsContent>

          {/* Skills Tab */}
          <TabsContent value='skills' className='space-y-4'>
            <SkillsTab
              active={active === 'skills'}
              education={emp?.education}
              skills={emp?.skills}
              certifications={emp?.certifications}
              onAddEducation={() => openItemDialog('education')}
              onEditEducation={(index) => openItemDialog('education', index)}
              onDeleteEducation={(index) => removeItem('education', index)}
              onAddSkill={() => openItemDialog('skills')}
              onEditSkill={(index) => openItemDialog('skills', index)}
              onDeleteSkill={(index) => removeItem('skills', index)}
              onAddCertification={() => openItemDialog('certifications')}
              onEditCertification={(index) =>
                openItemDialog('certifications', index)
              }
              onDeleteCertification={(index) =>
                removeItem('certifications', index)
              }
              documents={emp?.documents || []}
              onAddDocument={(docType) =>
                openItemDialog('documents', undefined, docType)
              }
              onEditDocument={(index) => openItemDialog('documents', index)}
              onDeleteDocument={(index) => removeItem('documents', index)}
              onPreviewDocument={handleOpen}
            />
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value='documents'>
            <DocumentsTab
              active={active === 'documents'}
              documents={emp?.documents || []}
              onAdd={() => openItemDialog('documents', undefined, 'other')}
              onEdit={(index) => openItemDialog('documents', index)}
              onDelete={(index) => removeItem('documents', index)}
              onPreview={handleOpen}
            />
          </TabsContent>

          {/* Social Tab */}
          <TabsContent value='social'>
            <AnimatedTabContent active={active === 'social'}>
              <SocialContributionsTab
                active={active === 'social'}
                items={(emp as any)?.socialContributions || []}
                onAdd={() => openItemDialog('socialContributions')}
                onEdit={(index) => openItemDialog('socialContributions', index)}
                onDelete={(index) => setConfirmDelete({ section: 'socialContributions', index })}
              />
            </AnimatedTabContent>
          </TabsContent>

          {/* Contracts Tab */}
          <TabsContent value='contracts'>
            <AnimatedTabContent active={active === 'contracts'}>
              <Card className='border-2 border-dashed p-8 text-center'>
                <NotebookText className='text-muted-foreground/50 mx-auto mb-4 h-12 w-12' />
                <h3 className='mb-2 text-lg font-semibold'>
                  Historique des contrats
                </h3>
                <p className='text-muted-foreground text-sm'>
                  Contrats, avenants et mouvements RH à brancher
                </p>
              </Card>
            </AnimatedTabContent>
          </TabsContent>

          {/* Leaves Tab */}
          <TabsContent value='leaves'>
            <AnimatedTabContent active={active === 'leaves'}>
              <Card className='border-2 border-dashed p-8 text-center'>
                <Calendar className='text-muted-foreground/50 mx-auto mb-4 h-12 w-12' />
                <h3 className='mb-2 text-lg font-semibold'>
                  Gestion des congés
                </h3>
                <p className='text-muted-foreground text-sm'>
                  Congés, absences et planning à développer
                </p>
              </Card>
            </AnimatedTabContent>
          </TabsContent>

          {/* Experiences Tab */}
          <TabsContent value='experiences' className='space-y-4'>
            <ExperiencesTab
              active={active === 'experiences'}
              experiences={emp?.experiences}
              onAdd={() => openItemDialog('experiences')}
              onEdit={(index: number) => openItemDialog('experiences', index)}
              onDelete={(index: number) => removeItem('experiences', index)}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Preview Dialog */}
      <Dialog open={openPreview} onOpenChange={setOpenPreview}>
        <DialogContent className='max-h-[90vh] max-w-4xl'>
          <DialogHeader>
            <DialogTitle className='flex items-center justify-between'>
              <span>{previewItem?.title}</span>
              {previewItem?.fileName && (
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => {
                    toast.success(t('common.download'));
                  }}
                  className='gap-2'
                >
                  <Download className='h-4 w-4' />
                  {t('common.download')}
                </Button>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className='max-h-[70vh] overflow-auto'>
            {previewItem?.fileName?.match(/\.(png|jpg|jpeg|gif)$/i) && (
              <div className='relative h-auto min-h-[200px] w-full'>
                <Image
                  src={`/images/user/${previewItem.fileName}`}
                  alt={previewItem.title}
                  width={1200}
                  height={800}
                  className='h-auto w-full rounded-lg object-contain'
                />
              </div>
            )}
            {previewItem?.fileName?.endsWith('.pdf') && (
              <iframe
                title={previewItem.title}
                src={`/images/user/${previewItem.fileName}`}
                className='h-[70vh] w-full rounded-lg border'
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Change Photo Dialog */}
      <Dialog open={openChangePhoto} onOpenChange={setOpenChangePhoto}>
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle>
              {t('employeeDetails.actions.changePhoto') ||
                'Changer la photo de profil'}
            </DialogTitle>
          </DialogHeader>
          <div className='space-y-4'>
            <FileUploader
              value={selectedPhotoFiles}
              onValueChange={setSelectedPhotoFiles}
              accept={{ 'image/*': [] }}
              maxFiles={1}
              description={
                t('employeeDetails.actions.photoRequirements') ||
                'Formats: JPG, PNG. Taille max: 2MB'
              }
              variant='default'
            />
          </div>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => {
                setOpenChangePhoto(false);
                setSelectedPhotoFiles([]);
              }}
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleSaveAvatar}
              disabled={avatarUploading || selectedPhotoFiles.length === 0}
              className='gap-2'
            >
              {avatarUploading && (
                <span
                  className='h-4 w-4 animate-spin rounded-full border-2 border-t-transparent'
                  aria-hidden='true'
                />
              )}
              {t('common.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Item Dialog */}
      <Dialog
        open={!!openEditItem}
        onOpenChange={(o) => {
          if (!o) {
            setOpenEditItem(null);
            setTempItem(null);
          }
        }}
      >
        <DialogContent className='max-w-lg'>
          <DialogHeader>
            <DialogTitle>
              {openEditItem?.section === 'education' &&
                (openEditItem.index != null
                  ? 'Modifier formation'
                  : 'Ajouter formation')}
              {openEditItem?.section === 'skills' &&
                (openEditItem.index != null
                  ? 'Modifier compétence'
                  : 'Ajouter compétence')}
              {openEditItem?.section === 'certifications' &&
                (openEditItem.index != null
                  ? 'Modifier certification'
                  : 'Ajouter certification')}
              {openEditItem?.section === 'documents' &&
                (openEditItem.index != null
                  ? 'Modifier document'
                  : 'Ajouter document')}
              {openEditItem?.section === 'peopleInCharge' &&
                (openEditItem.index != null
                  ? 'Modifier les personnes en charge'
                  : 'Ajouter personnes en charge')}
              {openEditItem?.section === 'experiences' &&
                (openEditItem.index != null
                  ? 'Modifier expérience'
                  : 'Ajouter expérience')}
              {openEditItem?.section === 'socialContributions' &&
                (openEditItem.index != null
                  ? 'Modifier cotisation sociale'
                  : 'Ajouter cotisation sociale')}
            </DialogTitle>
          </DialogHeader>
          <div className='space-y-4'>
            {/* Social Contributions form */}
            {openEditItem?.section === 'socialContributions' && (
              <>
                <div>
                  <Label className='mb-1'>Type</Label>
                  <SelectField
                    name='type'
                    control={typeForm.control}
                    placeholder='Sélectionner'
                    options={(mutuellesList || []).map((m: any) => ({ label: m.name || m.code, value: m.code }))}
                  />
                </div>
                <div>
                  <Label className='mb-1'>Code</Label>
                  <Input
                    value={tempItem?.code || ''}
                    onChange={(e) => setTempItem((p: any) => ({ ...p, code: e.target.value }))}
                  />
                </div>
                <div>
                  <Label className='mb-1'>Numéro d&apos;affiliation</Label>
                  <Input
                    value={tempItem?.affiliationNumber || ''}
                    onChange={(e) =>
                      setTempItem((p: any) => ({ ...p, affiliationNumber: e.target.value }))
                    }
                  />
                </div>
                <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                  <div>
                    <Label className='mb-1'>Taux Employé (%)</Label>
                    <Input
                      type='number'
                      step='0.01'
                      value={tempItem?.employeeRatePct ?? ''}
                      onChange={(e) =>
                        setTempItem((p: any) => ({ ...p, employeeRatePct: e.target.value }))
                      }
                      placeholder='ex: 4.48'
                    />
                  </div>
                  <div>
                    <Label className='mb-1'>Taux Employeur (%)</Label>
                    <Input
                      type='number'
                      step='0.01'
                      value={tempItem?.employerRatePct ?? ''}
                      onChange={(e) =>
                        setTempItem((p: any) => ({ ...p, employerRatePct: e.target.value }))
                      }
                      placeholder='ex: 8.98'
                    />
                  </div>
                </div>
                <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                  <div>
                    <Label className='mb-1'>Début</Label>
                    <DatePickerField
                      value={tempItem?.startDate || ''}
                      onChange={(d) => setTempItem((p: any) => ({ ...p, startDate: d || '' }))}
                    />
                  </div>
                  <div>
                    <Label className='mb-1'>Fin</Label>
                    <DatePickerField
                      value={tempItem?.endDate || ''}
                      onChange={(d) => setTempItem((p: any) => ({ ...p, endDate: d || '' }))}
                    />
                  </div>
                </div>
                { (tempItem?.type === 'Mutuelle' || tempItem?.code === 'Mutuelle' || (mutuellesList || []).some((m:any) => m.code === tempItem?.code && (m.code || '').startsWith('MUT'))) && (
                  <div>
                    <Label className='mb-1'>Fournisseur (Mutuelle)</Label>
                    <Input
                      value={tempItem?.providerName || ''}
                      onChange={(e) => setTempItem((p: any) => ({ ...p, providerName: e.target.value }))}
                      placeholder='Ex: Mutuelle Générale'
                    />
                  </div>
                )}
                {/* Notes field removed per request */}
              </>
            )}

            {openEditItem?.section === 'education' && (
              <>
                <div>
                  <Label className='mb-1'>Niveau</Label>
                  <Input
                    value={tempItem?.level || ''}
                    onChange={(e) =>
                      setTempItem((p: any) => ({ ...p, level: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <Label className='mb-1'>Diplôme</Label>
                  <Input
                    value={tempItem?.diploma || ''}
                    onChange={(e) =>
                      setTempItem((p: any) => ({
                        ...p,
                        diploma: e.target.value
                      }))
                    }
                  />
                </div>
                <div>
                  <Label className='mb-1'>Année</Label>
                  <Input
                    value={tempItem?.year || ''}
                    onChange={(e) =>
                      setTempItem((p: any) => ({ ...p, year: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <Label className='mb-1'>Établissement</Label>
                  <Input
                    value={tempItem?.institution || ''}
                    onChange={(e) =>
                      setTempItem((p: any) => ({
                        ...p,
                        institution: e.target.value
                      }))
                    }
                  />
                </div>

                {/* Documents section for education/diplomas */}
                <div className='mt-4 border-t pt-4'>
                  <Label className='mb-2'>
                    Diplômes et attestations (optionnel)
                  </Label>
                  <p className='text-muted-foreground mb-3 text-xs'>
                    Ajoutez les documents de votre diplôme
                  </p>
                  <FileUploader
                    value={docFiles}
                    onValueChange={setDocFiles}
                    maxFiles={5}
                    accept={{ 'image/*': [], 'application/pdf': [] }}
                    description='Plusieurs documents possibles'
                  />

                  {tempItem?.documents && tempItem.documents.length > 0 && (
                    <div className='mt-3 space-y-2'>
                      <p className='text-sm font-medium'>
                        Documents existants:
                      </p>
                      {tempItem.documents.map((doc: any, idx: number) => (
                        <div
                          key={idx}
                          className='bg-muted flex items-center justify-between rounded p-2 text-sm'
                        >
                          <span className='flex items-center gap-2'>
                            <FileText className='h-4 w-4' />
                            {doc.fileName}
                          </span>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => {
                              const newDocs = [...(tempItem.documents || [])];
                              newDocs.splice(idx, 1);
                              setTempItem((p: any) => ({
                                ...p,
                                documents: newDocs
                              }));
                            }}
                          >
                            <Trash2 className='text-destructive h-4 w-4' />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {openEditItem?.section === 'skills' && (
              <>
                <div>
                  <Label className='mb-1'>Compétence</Label>
                  <Input
                    value={tempItem?.name || ''}
                    onChange={(e) =>
                      setTempItem((p: any) => ({ ...p, name: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <Label className='mb-1'>Niveau (1-5)</Label>
                  <Input
                    type='number'
                    min={1}
                    max={5}
                    value={tempItem?.level ?? 3}
                    onChange={(e) =>
                      setTempItem((p: any) => ({
                        ...p,
                        level: Number(e.target.value)
                      }))
                    }
                  />
                </div>
              </>
            )}

            {openEditItem?.section === 'certifications' && (
              <>
                <div>
                  <Label className='mb-1'>Nom</Label>
                  <Input
                    value={tempItem?.name || ''}
                    onChange={(e) =>
                      setTempItem((p: any) => ({ ...p, name: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <Label className='mb-1'>Émetteur</Label>
                  <Input
                    value={tempItem?.issuer || ''}
                    onChange={(e) =>
                      setTempItem((p: any) => ({
                        ...p,
                        issuer: e.target.value
                      }))
                    }
                  />
                </div>
                <div>
                  <Label className='mb-1'>Date d&apos;émission</Label>
                  <DatePickerField
                    value={tempItem?.issueDate || ''}
                    onChange={(d) =>
                      setTempItem((p: any) => ({ ...p, issueDate: d || '' }))
                    }
                  />
                </div>
                <div>
                  <Label className='mb-1'>Date d&apos;expiration</Label>
                  <DatePickerField
                    value={tempItem?.expirationDate || ''}
                    onChange={(d) =>
                      setTempItem((p: any) => ({
                        ...p,
                        expirationDate: d || ''
                      }))
                    }
                  />
                </div>

                {/* Documents section for certifications */}
                <div className='mt-4 border-t pt-4'>
                  <Label className='mb-2'>
                    Certificats et attestations (optionnel)
                  </Label>
                  <p className='text-muted-foreground mb-3 text-xs'>
                    Ajoutez les documents de certification
                  </p>
                  <FileUploader
                    value={docFiles}
                    onValueChange={setDocFiles}
                    maxFiles={5}
                    accept={{ 'image/*': [], 'application/pdf': [] }}
                    description='Plusieurs documents possibles'
                  />

                  {tempItem?.documents && tempItem.documents.length > 0 && (
                    <div className='mt-3 space-y-2'>
                      <p className='text-sm font-medium'>
                        Documents existants:
                      </p>
                      {tempItem.documents.map((doc: any, idx: number) => (
                        <div
                          key={idx}
                          className='bg-muted flex items-center justify-between rounded p-2 text-sm'
                        >
                          <span className='flex items-center gap-2'>
                            <FileText className='h-4 w-4' />
                            {doc.fileName}
                          </span>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => {
                              const newDocs = [...(tempItem.documents || [])];
                              newDocs.splice(idx, 1);
                              setTempItem((p: any) => ({
                                ...p,
                                documents: newDocs
                              }));
                            }}
                          >
                            <Trash2 className='text-destructive h-4 w-4' />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {openEditItem?.section === 'documents' && (
              <>
                {/* Only show type and title for 'other' documents */}
                {currentDocumentType === 'other' && (
                  <>
                    <div>
                      <Label className='mb-1'>Type de document</Label>
                      <select
                        className='border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none'
                        value={tempItem?.documentType || 'other'}
                        onChange={(e) => {
                          const value = e.target.value;
                          setTempItem((p: any) => ({
                            ...p,
                            documentType: value
                          }));
                          setCurrentDocumentType(value as any);
                        }}
                      >
                        <option value='cin'>CIN</option>
                        <option value='certificate'>Certificat</option>
                        <option value='diploma'>Diplôme</option>
                        <option value='experience'>Expérience</option>
                        <option value='other'>Autre</option>
                      </select>
                    </div>
                    <div>
                      <Label className='mb-1'>Titre</Label>
                      <Input
                        value={tempItem?.title || ''}
                        onChange={(e) =>
                          setTempItem((p: any) => ({
                            ...p,
                            title: e.target.value
                          }))
                        }
                      />
                    </div>
                  </>
                )}

                {/* Show document type badge for non-other types */}
                {currentDocumentType !== 'other' && (
                  <div className='bg-muted flex items-center gap-2 rounded-lg p-3'>
                    <FileText className='text-primary h-5 w-5' />
                    <div>
                      <p className='text-sm font-medium'>{tempItem?.title}</p>
                      <p className='text-muted-foreground text-xs'>
                        Type:{' '}
                        {currentDocumentType === 'cin'
                          ? 'CIN'
                          : currentDocumentType === 'certificate'
                            ? 'Certificat'
                            : currentDocumentType === 'diploma'
                              ? 'Diplôme'
                              : 'Document'}
                      </p>
                    </div>
                  </div>
                )}

                <div>
                  <Label className='mb-1'>Fichier</Label>
                  <FileUploader
                    value={docFiles}
                    onValueChange={setDocFiles}
                    maxFiles={1}
                    accept={{ 'image/*': [], 'application/pdf': [] }}
                    description={
                      t('employeeCreate.documents.help') || 'PDF ou image'
                    }
                  />
                </div>
              </>
            )}

            {openEditItem?.section === 'peopleInCharge' && (
              <>
                <div>
                  <Label className='mb-1'>Nom complet</Label>
                  <Input
                    value={tempItem?.name || ''}
                    onChange={(e) =>
                      setTempItem((p: any) => ({ ...p, name: e.target.value }))
                    }
                    placeholder='Ex: Ahmed El Fassi'
                  />
                </div>
                <div>
                  <Label className='mb-1'>Téléphone</Label>
                  <Input
                    value={tempItem?.phone || ''}
                    onChange={(e) =>
                      setTempItem((p: any) => ({ ...p, phone: e.target.value }))
                    }
                    placeholder='+212 6XX XX XX XX'
                  />
                </div>
                <div>
                  <Label className='mb-1'>Relation</Label>
                  <SelectField
                    name='relationship'
                    control={relForm.control}
                    placeholder='Sélectionner'
                    options={[
                      { label: 'Époux(se)', value: 'Époux(se)' },
                      { label: 'Parent', value: 'Parent' },
                      { label: 'Fils', value: 'Fils' },
                      { label: 'Fille', value: 'Fille' },
                      { label: 'Frère', value: 'Frère' },
                      { label: 'Soeur', value: 'Soeur' },
                      { label: 'Tuteur', value: 'Tuteur' },
                      { label: 'Autre', value: 'Autre' }
                    ]}
                  />
                </div>
                <div>
                  <Label className='mb-1'>CIN</Label>
                  <Input
                    value={tempItem?.cin || ''}
                    onChange={(e) =>
                      setTempItem((p: any) => ({ ...p, cin: e.target.value }))
                    }
                    placeholder='Ex: AB123456'
                  />
                </div>
                <div>
                  <Label className='mb-1'>Date de naissance</Label>
                  <DatePickerField
                    value={tempItem?.birthDate || ''}
                    onChange={(d) =>
                      setTempItem((p: any) => ({ ...p, birthDate: d || '' }))
                    }
                  />
                </div>
              </>
            )}

            {openEditItem?.section === 'experiences' && (
              <>
                <div>
                  <Label className='mb-1'>Intitulé</Label>
                  <Input
                    value={tempItem?.title || ''}
                    onChange={(e) =>
                      setTempItem((p: any) => ({ ...p, title: e.target.value }))
                    }
                    placeholder='Ex: Développeur Frontend'
                  />
                </div>
                <div>
                  <Label className='mb-1'>Entreprise</Label>
                  <Input
                    value={tempItem?.company || ''}
                    onChange={(e) =>
                      setTempItem((p: any) => ({
                        ...p,
                        company: e.target.value
                      }))
                    }
                    placeholder='Ex: ACME Corp'
                  />
                </div>
                <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                  <div>
                    <Label className='mb-1'>Début</Label>
                    <DatePickerField
                      value={tempItem?.startDate || ''}
                      onChange={(d) =>
                        setTempItem((p: any) => ({ ...p, startDate: d || '' }))
                      }
                    />
                  </div>
                  <div>
                    <Label className='mb-1'>Fin</Label>
                    <DatePickerField
                      value={tempItem?.endDate || ''}
                      onChange={(d) =>
                        setTempItem((p: any) => ({ ...p, endDate: d || '' }))
                      }
                    />
                  </div>
                </div>
                <div>
                  <Label className='mb-1'>Description</Label>
                  <Input
                    value={tempItem?.description || ''}
                    onChange={(e) =>
                      setTempItem((p: any) => ({
                        ...p,
                        description: e.target.value
                      }))
                    }
                    placeholder='Résumé des missions'
                  />
                </div>

                {/* Documents section for experience */}
                <div className='mt-4 border-t pt-4'>
                  <Label className='mb-2'>
                    Documents justificatifs (optionnel)
                  </Label>
                  <p className='text-muted-foreground mb-3 text-xs'>
                    Attestations de travail, certificats, références...
                  </p>
                  <FileUploader
                    value={docFiles}
                    onValueChange={setDocFiles}
                    maxFiles={5}
                    accept={{ 'image/*': [], 'application/pdf': [] }}
                    description='Vous pouvez ajouter plusieurs documents'
                  />

                  {/* Show existing documents */}
                  {tempItem?.documents && tempItem.documents.length > 0 && (
                    <div className='mt-3 space-y-2'>
                      <p className='text-sm font-medium'>
                        Documents existants:
                      </p>
                      {tempItem.documents.map((doc: any, idx: number) => (
                        <div
                          key={idx}
                          className='bg-muted flex items-center justify-between rounded p-2 text-sm'
                        >
                          <span className='flex items-center gap-2'>
                            <FileText className='h-4 w-4' />
                            {doc.fileName}
                          </span>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => {
                              const newDocs = [...(tempItem.documents || [])];
                              newDocs.splice(idx, 1);
                              setTempItem((p: any) => ({
                                ...p,
                                documents: newDocs
                              }));
                            }}
                          >
                            <Trash2 className='text-destructive h-4 w-4' />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => {
                setOpenEditItem(null);
                setTempItem(null);
              }}
            >
              {' '}
              {t('common.cancel')}{' '}
            </Button>
            <Button onClick={saveItemDialog} className='gap-2'>
              <Check className='h-4 w-4' />
              {t('common.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <Dialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <DialogContent className='max-w-sm'>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
          </DialogHeader>
          <div className='text-sm'>
            Êtes-vous sûr de vouloir supprimer cette ligne d&apos;assurance/mutuelle ? Cette action est irréversible.
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setConfirmDelete(null)}>Annuler</Button>
            <Button
              variant='destructive'
              onClick={async () => {
                if (!confirmDelete) return;
                const list = ((emp as any)?.[confirmDelete.section] || []).slice();
                list.splice(confirmDelete.index, 1);
                await patchEmployee({ [confirmDelete.section]: list } as any, t('common.deleted'));
                setConfirmDelete(null);
              }}
            >
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
