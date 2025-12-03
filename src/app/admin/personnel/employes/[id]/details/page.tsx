"use client";

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
  Check
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useLanguage } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { EmployeeDetailsLoadingSkeleton } from '@/app/admin/personnel/employes/[id]/details/loading-skeleton';
import { FileUploader } from '@/components/file-uploader';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DatePickerField } from '@/components/custom/DatePickerField';
// Import new components
import { PersonalTab } from './components/PersonalTab';
import { SkillsTab } from './components/SkillsTab';
import { DocumentsTab } from './components/DocumentsTab';
import { EmergencyContactsTab } from './components/EmergencyContactsTab';

interface EmployeeRow {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate?: string;
  birthPlace?: string;
  gender?: 'M'|'F';
  nationality?: string;
  departement?:{
    id:number;
    name:string;
    nameAr?:string;
  }
  maritalStatus?: string;
  numberOfChildren?: number;
  address?: string;
  matricule?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  departmentId?: string;
  position?: string;
  hireDate?: string;
  notes?: string;
  education?: { level: string; diploma?: string; year?: string; institution?: string }[];
  skills?: { name: string; level: number }[];
  certifications?: { name: string; issuer?: string; issueDate?: string; expirationDate?: string }[];
  documents?: { id: string; title: string; fileName?: string; mimeType?: string; size?: number }[];
  status?: string;
  cin?: string;
  emergencyContacts?: {
    name: string;
    phone: string;
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
  const [openEditItem, setOpenEditItem] = useState<{section: 'education'|'skills'|'certifications'|'documents'|'emergencyContacts'; index?: number}|null>(null);
  const [tempItem, setTempItem] = useState<any>(null);
  const [docFiles, setDocFiles] = useState<File[]>([]);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setLoading(true);
        const res = await apiClient.get(apiRoutes.admin.employees.details(id));
        const payload: any = res.data && typeof res.data === 'object' && 'data' in res.data ? res.data.data : res.data;
        setEmp(payload as EmployeeRow);

        const mediaRes = await apiClient.get(apiRoutes.admin.media.list);
        const mediaPayload: any[] = mediaRes.data && typeof mediaRes.data === 'object' && 'data' in mediaRes.data ? mediaRes.data.data : mediaRes.data;
        setMedia(mediaPayload);
      } catch (e) {
        toast.error("Impossible de charger l'employé");
        router.push('/admin/personnel/employes');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, router]);

  const fullName = emp ? `${emp.firstName} ${emp.lastName}` : '';
  const initials = emp ? `${emp.firstName?.[0]}${emp.lastName?.[0]}` : '';

  // Use uploaded avatar if available, fallback to default static image
  const currentAvatarSrc = avatarUrl || '/images/user/profile.png';

  const combinedDocs = [
    ...(emp?.documents || []),
    ...media.filter(m => m.fileName).map(m => ({
      id: `m-${m.id}`,
      title: m.title,
      fileName: m.fileName,
      mimeType: m.mimeType,
      size: m.size
    }))
  ];

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
      case 'actif': return 'bg-green-100 text-green-700 border-green-200';
      case 'inactif': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'suspendu': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-blue-100 text-blue-700 border-blue-200';
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
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const payload: any = res.data && typeof res.data === 'object' && 'data' in res.data ? res.data.data : res.data;
      const fileName = payload?.fileName || payload?.filename || payload?.name;
      const url = payload?.url || (fileName ? `/images/user/${fileName}` : undefined);
      const finalUrl = url || (file instanceof File ? URL.createObjectURL(file) : undefined);
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

  const patchEmployee = async (partial: Partial<EmployeeRow>, successMsg = t('common.saved')) => {
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

  const openItemDialog = (section: 'education'|'skills'|'certifications'|'documents'|'emergencyContacts', index?: number) => {
    setOpenEditItem({ section, index });
    let base: any = {};
    if (section === 'education') base = index!=null ? (emp?.education?.[index] ?? {}) : { level: '', diploma: '', year: '', institution: '' };
    if (section === 'skills') base = index!=null ? (emp?.skills?.[index] ?? {}) : { name: '', level: 3 };
    if (section === 'certifications') base = index!=null ? (emp?.certifications?.[index] ?? {}) : { name: '', issuer: '', issueDate: '', expirationDate: '' };
    if (section === 'documents') base = index!=null ? (emp?.documents?.[index] ?? {}) : { title: '' };
    if (section === 'emergencyContacts') base = index!=null ? (emp?.emergencyContacts?.[index] ?? {}) : { name: '', phone: '', relationship: '' };
    setTempItem(base);
    setDocFiles([]);
  };

  const saveItemDialog = async () => {
    if (!openEditItem) return;
    const { section, index } = openEditItem;
    const current = { ...emp } as EmployeeRow;
    const list = (current as any)[section] || [];
    let newList = Array.isArray(list) ? list.slice() : [];

    if (section === 'documents' && docFiles.length) {
      try {
        const formData = new FormData();
        formData.append('file', docFiles[0]);
        const up = await apiClient.post(apiRoutes.files.uploadTemp, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        const payload: any = up.data && typeof up.data === 'object' && 'data' in up.data ? up.data.data : up.data;
        tempItem.fileName = payload?.fileName || payload?.filename || docFiles[0].name;
        tempItem.mimeType = payload?.mimeType || docFiles[0].type;
        tempItem.size = payload?.size || docFiles[0].size;
      } catch (e) {
        console.error(e);
        toast.error('Échec du téléversement');
        return;
      }
    }

    if (index != null) {
      newList[index] = tempItem;
    } else {
      newList.push(tempItem);
    }

    await patchEmployee({ [section]: newList } as any);
    setOpenEditItem(null);
    setTempItem(null);
  };

  const removeItem = async (section: 'education'|'skills'|'certifications'|'documents'|'emergencyContacts', index: number) => {
    const list = ((emp as any)?.[section] || []).slice();
    list.splice(index, 1);
    await patchEmployee({ [section]: list } as any, t('common.deleted'));
  };

  if (loading) {
    return (
      <PageContainer>
        <EmployeeDetailsLoadingSkeleton/>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="w-full mx-auto px-4 py-6 space-y-2 mt-2">
        {/* Header Section - Modern Hero */}
        <Card className="relative overflow-hidden border-2 py-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/10 to-background opacity-50" />

          <div className="relative p-2 md:p-8">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-shrink-0 relative">
                <Avatar className="h-24 w-24 md:h-32 md:w-32 ring-4 ring-primary/20 shadow-lg">
                  <AvatarImage src={currentAvatarSrc} alt={fullName} />
                  <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-primary to-primary/60 text-primary-foreground">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="secondary"
                        size="icon"
                        onClick={() => setOpenChangePhoto(true)}
                        className="absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4 h-8 w-8 rounded-full shadow-md hover:shadow-lg border"
                        aria-label={t('employeeDetails.actions.editPhotoTooltip') || 'Modifier la photo de profil'}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {t('employeeDetails.actions.editPhotoTooltip') || 'Modifier la photo de profil'}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <div className="flex-1 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                        {fullName}
                      </h1>
                      <p className="text-lg text-muted-foreground mt-1">
                        {emp?.position || '—'}
                      </p>
                    </div>
                    {emp?.status && (
                      <Badge className={cn("px-3 py-1 font-medium", getStatusColor(emp.status))}>
                        {emp.status}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-background/80 border">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-muted-foreground">Matricule</p>
                      <p className="text-sm font-medium truncate">{emp?.matricule || '—'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-lg bg-background/80 border">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-muted-foreground">Téléphone</p>
                      <p className="text-sm font-medium truncate">{emp?.phone || '—'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-lg bg-background/80 border">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-muted-foreground">Département</p>
                      <p className="text-sm font-medium truncate">{emp?.departement?.name|| '—'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-lg bg-background/80 border">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-muted-foreground">Embauche</p>
                      <p className="text-sm font-medium truncate">{formatDate(emp?.hireDate)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Tabs Section */}
        <Tabs value={active} onValueChange={setActive} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-7 h-auto p-1 bg-muted/50">
            <TabsTrigger value="personal" className="gap-2 data-[state=active]:bg-background">
              <UserRound className="h-4 w-4" />
              <span className="hidden sm:inline">{t('employeeDetails.tabs.personal')}</span>
            </TabsTrigger>
            <TabsTrigger value="emergency" className="gap-2 data-[state=active]:bg-background">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Urgence</span>
            </TabsTrigger>
            <TabsTrigger value="skills" className="gap-2 data-[state=active]:bg-background">
              <GraduationCap className="h-4 w-4" />
              <span className="hidden sm:inline">{t('employeeDetails.tabs.skills')}</span>
            </TabsTrigger>
            <TabsTrigger value="documents" className="gap-2 data-[state=active]:bg-background">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">{t('employeeDetails.tabs.documents')}</span>
            </TabsTrigger>
            <TabsTrigger value="social" className="gap-2 data-[state=active]:bg-background">
              <Heart className="h-4 w-4" />
              <span className="hidden sm:inline">{t('employeeDetails.tabs.social')}</span>
            </TabsTrigger>
            <TabsTrigger value="contracts" className="gap-2 data-[state=active]:bg-background">
              <NotebookText className="h-4 w-4" />
              <span className="hidden sm:inline">{t('employeeDetails.tabs.contracts')}</span>
            </TabsTrigger>
            <TabsTrigger value="leaves" className="gap-2 data-[state=active]:bg-background">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">{t('employeeDetails.tabs.leaves')}</span>
            </TabsTrigger>
          </TabsList>

          {/* Personal Tab */}
          <TabsContent value="personal" className="space-y-4">
            <PersonalTab
              active={active === 'personal'}
              employee={emp}
              onUpdate={updateField}
            />
          </TabsContent>

          {/* Emergency Contacts Tab */}
          <TabsContent value="emergency" className="space-y-4">
            <EmergencyContactsTab
              active={active === 'emergency'}
              contacts={emp?.emergencyContacts || []}
              onAdd={() => openItemDialog('emergencyContacts')}
              onEdit={(index) => openItemDialog('emergencyContacts', index)}
              onDelete={(index) => removeItem('emergencyContacts', index)}
            />
          </TabsContent>

          {/* Skills Tab */}
          <TabsContent value="skills" className="space-y-4">
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
              onEditCertification={(index) => openItemDialog('certifications', index)}
              onDeleteCertification={(index) => removeItem('certifications', index)}
            />
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents">
            <DocumentsTab
              active={active === 'documents'}
              documents={combinedDocs}
              onAdd={() => openItemDialog('documents')}
              onEdit={(index) => openItemDialog('documents', index)}
              onDelete={(index) => removeItem('documents', index)}
              onPreview={handleOpen}
            />
          </TabsContent>

          {/* Social Tab */}
          <TabsContent value="social">
            <AnimatedTabContent active={active==='social'}>
              <Card className="p-8 text-center border-2 border-dashed">
                <Heart className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Section en développement</h3>
                <p className="text-sm text-muted-foreground">
                  Informations CNSS, Mutuelle et autres données sociales à venir
                </p>
              </Card>
            </AnimatedTabContent>
          </TabsContent>

          {/* Contracts Tab */}
          <TabsContent value="contracts">
            <AnimatedTabContent active={active==='contracts'}>
              <Card className="p-8 text-center border-2 border-dashed">
                <NotebookText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Historique des contrats</h3>
                <p className="text-sm text-muted-foreground">
                  Contrats, avenants et mouvements RH à brancher
                </p>
              </Card>
            </AnimatedTabContent>
          </TabsContent>

          {/* Leaves Tab */}
          <TabsContent value="leaves">
            <AnimatedTabContent active={active==='leaves'}>
              <Card className="p-8 text-center border-2 border-dashed">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Gestion des congés</h3>
                <p className="text-sm text-muted-foreground">
                  Congés, absences et planning à développer
                </p>
              </Card>
            </AnimatedTabContent>
          </TabsContent>
        </Tabs>
      </div>

      {/* Preview Dialog */}
      <Dialog open={openPreview} onOpenChange={setOpenPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{previewItem?.title}</span>
              {previewItem?.fileName && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    toast.success(t('common.download'));
                  }}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  {t('common.download')}
                </Button>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-auto max-h-[70vh]">
            {previewItem?.fileName?.match(/\.(png|jpg|jpeg|gif)$/i) && (
              <img
                src={`/images/user/${previewItem.fileName}`}
                alt={previewItem.title}
                className="w-full h-auto rounded-lg"
              />
            )}
            {previewItem?.fileName?.endsWith('.pdf') && (
              <iframe
                title={previewItem.title}
                src={`/images/user/${previewItem.fileName}`}
                className="w-full h-[70vh] rounded-lg border"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Change Photo Dialog */}
      <Dialog open={openChangePhoto} onOpenChange={setOpenChangePhoto}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('employeeDetails.actions.changePhoto') || 'Changer la photo de profil'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <FileUploader
              value={selectedPhotoFiles}
              onValueChange={setSelectedPhotoFiles}
              accept={{ 'image/*': [] }}
              maxFiles={1}
              description={t('employeeDetails.actions.photoRequirements') || 'Formats: JPG, PNG. Taille max: 2MB'}
              variant="default"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setOpenChangePhoto(false);
                setSelectedPhotoFiles([]);
              }}
            >
              {t('common.cancel')}
            </Button>
            <Button onClick={handleSaveAvatar} disabled={avatarUploading || selectedPhotoFiles.length === 0} className="gap-2">
              {avatarUploading && <span className="h-4 w-4 animate-spin border-2 border-t-transparent rounded-full" aria-hidden="true" />}
              {t('common.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Item Dialog */}
      <Dialog open={!!openEditItem} onOpenChange={(o)=>{ if (!o) { setOpenEditItem(null); setTempItem(null); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {openEditItem?.section === 'education' && (openEditItem.index!=null ? 'Modifier formation' : 'Ajouter formation')}
              {openEditItem?.section === 'skills' && (openEditItem.index!=null ? 'Modifier compétence' : 'Ajouter compétence')}
              {openEditItem?.section === 'certifications' && (openEditItem.index!=null ? 'Modifier certification' : 'Ajouter certification')}
              {openEditItem?.section === 'documents' && (openEditItem.index!=null ? 'Modifier document' : 'Ajouter document')}
              {openEditItem?.section === 'emergencyContacts' && (openEditItem.index!=null ? 'Modifier contact' : 'Ajouter contact d\'urgence')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {openEditItem?.section === 'education' && (
              <>
                <div>
                  <Label className="mb-1">Niveau</Label>
                  <Input value={tempItem?.level || ''} onChange={(e)=>setTempItem((p:any)=>({ ...p, level: e.target.value }))} />
                </div>
                <div>
                  <Label className="mb-1">Diplôme</Label>
                  <Input value={tempItem?.diploma || ''} onChange={(e)=>setTempItem((p:any)=>({ ...p, diploma: e.target.value }))} />
                </div>
                <div>
                  <Label className="mb-1">Année</Label>
                  <Input value={tempItem?.year || ''} onChange={(e)=>setTempItem((p:any)=>({ ...p, year: e.target.value }))} />
                </div>
                <div>
                  <Label className="mb-1">Établissement</Label>
                  <Input value={tempItem?.institution || ''} onChange={(e)=>setTempItem((p:any)=>({ ...p, institution: e.target.value }))} />
                </div>
              </>
            )}

            {openEditItem?.section === 'skills' && (
              <>
                <div>
                  <Label className="mb-1">Compétence</Label>
                  <Input value={tempItem?.name || ''} onChange={(e)=>setTempItem((p:any)=>({ ...p, name: e.target.value }))} />
                </div>
                <div>
                  <Label className="mb-1">Niveau (1-5)</Label>
                  <Input type="number" min={1} max={5} value={tempItem?.level ?? 3} onChange={(e)=>setTempItem((p:any)=>({ ...p, level: Number(e.target.value) }))} />
                </div>
              </>
            )}

            {openEditItem?.section === 'certifications' && (
              <>
                <div>
                  <Label className="mb-1">Nom</Label>
                  <Input value={tempItem?.name || ''} onChange={(e)=>setTempItem((p:any)=>({ ...p, name: e.target.value }))} />
                </div>
                <div>
                  <Label className="mb-1">Émetteur</Label>
                  <Input value={tempItem?.issuer || ''} onChange={(e)=>setTempItem((p:any)=>({ ...p, issuer: e.target.value }))} />
                </div>
                <div>
                  <Label className="mb-1">Date d&apos;émission</Label>
                  <DatePickerField value={tempItem?.issueDate || ''} onChange={(d)=>setTempItem((p:any)=>({ ...p, issueDate: d || '' }))} />
                </div>
                <div>
                  <Label className="mb-1">Date d&apos;expiration</Label>
                  <DatePickerField value={tempItem?.expirationDate || ''} onChange={(d)=>setTempItem((p:any)=>({ ...p, expirationDate: d || '' }))} />
                </div>
              </>
            )}

            {openEditItem?.section === 'documents' && (
              <>
                <div>
                  <Label className="mb-1">Titre</Label>
                  <Input value={tempItem?.title || ''} onChange={(e)=>setTempItem((p:any)=>({ ...p, title: e.target.value }))} />
                </div>
                <div>
                  <Label className="mb-1">Fichier</Label>
                  <FileUploader value={docFiles} onValueChange={setDocFiles} maxFiles={1} accept={{ 'image/*': [], 'application/pdf': [] }} description={t('employeeCreate.documents.help') || 'PDF ou image'} />
                </div>
              </>
            )}

            {openEditItem?.section === 'emergencyContacts' && (
              <>
                <div>
                  <Label className="mb-1">Nom complet</Label>
                  <Input value={tempItem?.name || ''} onChange={(e)=>setTempItem((p:any)=>({ ...p, name: e.target.value }))} placeholder="Ex: Ahmed El Fassi" />
                </div>
                <div>
                  <Label className="mb-1">Téléphone</Label>
                  <Input value={tempItem?.phone || ''} onChange={(e)=>setTempItem((p:any)=>({ ...p, phone: e.target.value }))} placeholder="+212 6XX XX XX XX" />
                </div>
                <div>
                  <Label className="mb-1">Relation</Label>
                  <Input value={tempItem?.relationship || ''} onChange={(e)=>setTempItem((p:any)=>({ ...p, relationship: e.target.value }))} placeholder="Ex: Époux(se), Parent, Frère..." />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={()=>{ setOpenEditItem(null); setTempItem(null); }}> {t('common.cancel')} </Button>
            <Button onClick={saveItemDialog} className="gap-2">
              <Check className="h-4 w-4" />
              {t('common.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}

