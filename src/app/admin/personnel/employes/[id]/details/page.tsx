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
  IdCard,
  Layers,
  NotebookText,
  UserRound,
  Mail,
  Phone,
  MapPin,
  Building2,
  Award,
  Heart,
  Users,
  Edit,
  Download,
  Eye,
  Pencil
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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { DatePickerField } from '@/components/custom/DatePickerField';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Check, X } from 'lucide-react';

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
  maritalStatus?: string;
  numberOfChildren?: number;
  address?: string;
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
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

// Skill level indicator component
const SkillLevelBar: React.FC<{ level: number }> = ({ level }) => (
  <div className="flex items-center gap-1">
    {Array.from({ length: 5 }, (_, i) => (
      <div
        key={i}
        className={cn(
          "h-1.5 w-6 rounded-full transition-all",
          i < level ? "bg-primary" : "bg-muted"
        )}
      />
    ))}
  </div>
);

// Reusable editable row for simple string/number/date fields
const EditableInfoRow: React.FC<{
  label: string;
  value?: any;
  type?: 'text'|'number'|'date'|'select'|'textarea';
  options?: { id: string; label: string }[];
  onSave: (newValue: any) => Promise<void> | void;
}> = ({ label, value, type = 'text', options, onSave }) => {
  const [editing, setEditing] = useState(false);
  const [temp, setTemp] = useState<any>(value ?? '');
  useEffect(() => { setTemp(value ?? (type==='number'?0:'')); }, [value, type]);

  const save = async () => {
    await onSave(temp);
    setEditing(false);
  };

  return (
    <div className="grid grid-cols-3 gap-4 items-start py-2">
      <div className="text-sm text-muted-foreground col-span-1">{label}</div>
      <div className="col-span-2">
        {!editing ? (
          <div className="flex items-center justify-between">
            <div className="text-sm">{value ?? '—'}</div>
            <Button variant="ghost" size="sm" onClick={() => setEditing(true)} className="h-8 px-2">
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            {type === 'text' && (
              <Input value={temp ?? ''} onChange={(e)=>setTemp(e.target.value)} className="max-w-md" />
            )}
            {type === 'number' && (
              <Input type="number" value={temp ?? 0} onChange={(e)=>setTemp(Number(e.target.value))} className="max-w-md" />
            )}
            {type === 'date' && (
              <DatePickerField value={temp ? temp : ''} onChange={(d)=> setTemp(d || '')} />
            )}
            {type === 'textarea' && (
              <Textarea value={temp ?? ''} onChange={(e)=>setTemp(e.target.value)} className="min-h-[80px]" />
            )}
            {type === 'select' && (
              <Select value={temp} onValueChange={setTemp}>
                <SelectTrigger className="w-56">
                  <SelectValue placeholder={value ?? '—'} />
                </SelectTrigger>
                <SelectContent>
                  {(options||[]).map(opt => (
                    <SelectItem key={opt.id} value={opt.id}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Button size="sm" onClick={save} className="gap-1"><Check className="h-4 w-4" />{''}</Button>
            <Button size="sm" variant="outline" onClick={()=>{ setEditing(false); setTemp(value); }} className="gap-1"><X className="h-4 w-4" />{''}</Button>
          </div>
        )}
      </div>
    </div>
  );
};

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
  const [openEditItem, setOpenEditItem] = useState<{section: 'education'|'skills'|'certifications'|'documents'; index?: number}|null>(null);
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
      // Upload to temporary endpoint; backend should return { fileName } or { url }
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

  const updateField = async (key: keyof EmployeeRow, value: any) => {
    await patchEmployee({ [key]: value } as Partial<EmployeeRow>);
  };

  const openItemDialog = (section: 'education'|'skills'|'certifications'|'documents', index?: number) => {
    setOpenEditItem({ section, index });
    let base: any = {};
    if (section === 'education') base = index!=null ? (emp?.education?.[index] ?? {}) : { level: '', diploma: '', year: '', institution: '' };
    if (section === 'skills') base = index!=null ? (emp?.skills?.[index] ?? {}) : { name: '', level: 3 };
    if (section === 'certifications') base = index!=null ? (emp?.certifications?.[index] ?? {}) : { name: '', issuer: '', issueDate: '', expirationDate: '' };
    if (section === 'documents') base = index!=null ? (emp?.documents?.[index] ?? {}) : { title: '' };
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

  const removeItem = async (section: 'education'|'skills'|'certifications'|'documents', index: number) => {
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
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/10 to-background opacity-50" />

          <div className="relative p-2 md:p-8">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar Section */}
              <div className="flex-shrink-0 relative">
                <Avatar className="h-24 w-24 md:h-32 md:w-32 ring-4 ring-primary/20 shadow-lg">
                  <AvatarImage src={currentAvatarSrc} alt={fullName} />
                  <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-primary to-primary/60 text-primary-foreground">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                {/* Edit photo button overlay with tooltip */}
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

              {/* Info Section */}
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

                {/* Quick Info Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-background/80 border">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="text-sm font-medium truncate">{emp?.email || '—'}</p>
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
                      <p className="text-sm font-medium truncate">{emp?.departmentId || '—'}</p>
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
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 h-auto p-1 bg-muted/50">
            <TabsTrigger value="personal" className="gap-2 data-[state=active]:bg-background">
              <UserRound className="h-4 w-4" />
              <span className="hidden sm:inline">{t('employeeDetails.tabs.personal')}</span>
            </TabsTrigger>
            <TabsTrigger value="skills" className="gap-2 data-[state=active]:bg-background">
              <GraduationCap className="h-4 w-4" />
              <span className="hidden sm:inline">{t('employeeDetails.tabs.skills')}</span>
            </TabsTrigger>
            <TabsTrigger value="social" className="gap-2 data-[state=active]:bg-background">
              <Heart className="h-4 w-4" />
              <span className="hidden sm:inline">{t('employeeDetails.tabs.social')}</span>
            </TabsTrigger>
            <TabsTrigger value="contracts" className="gap-2 data-[state=active]:bg-background">
              <NotebookText className="h-4 w-4" />
              <span className="hidden sm:inline">{t('employeeDetails.tabs.contracts')}</span>
            </TabsTrigger>
            <TabsTrigger value="documents" className="gap-2 data-[state=active]:bg-background">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">{t('employeeDetails.tabs.documents')}</span>
            </TabsTrigger>
            <TabsTrigger value="leaves" className="gap-2 data-[state=active]:bg-background">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">{t('employeeDetails.tabs.leaves')}</span>
            </TabsTrigger>
          </TabsList>

          {/* Personal Tab */}
          <TabsContent value="personal" className="space-y-4">
            <AnimatedTabContent active={active==='personal'}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Identity Card */}
                <Card className="p-6 space-y-4 border-l-4 border-l-primary">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <IdCard className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{t('employeeDetails.sections.identity')}</h3>
                      <p className="text-xs text-muted-foreground">Informations personnelles</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <EditableInfoRow label={t('employeeDetails.fields.fullName')} value={fullName} type="text" onSave={async ()=>{ /* full name split not supported inline */ toast.info('Modifiez prénom/nom séparément'); }} />
                    <EditableInfoRow label="CIN" value={emp?.cin} type="text" onSave={(v)=>updateField('cin', v)} />
                    <EditableInfoRow label={t('employeeDetails.fields.birthDate')} value={emp?.birthDate} type="date" onSave={(v)=>updateField('birthDate', v)} />
                    <EditableInfoRow label={t('employeeDetails.fields.birthPlace')} value={emp?.birthPlace} type="text" onSave={(v)=>updateField('birthPlace', v)} />
                    <EditableInfoRow label={t('employeeDetails.fields.gender')} value={emp?.gender} type="select" options={[{id:'M',label:t('employeeCreate.enums.gender.M')},{id:'F',label:t('employeeCreate.enums.gender.F')}]} onSave={(v)=>updateField('gender', v)} />
                    <EditableInfoRow label={t('employeeDetails.fields.nationality')} value={emp?.nationality} type="text" onSave={(v)=>updateField('nationality', v)} />
                    <EditableInfoRow label={t('employeeDetails.fields.maritalStatus')} value={emp?.maritalStatus} type="select" options={[{id:'celibataire',label:t('employeeCreate.enums.maritalStatus.celibataire')},{id:'marie',label:t('employeeCreate.enums.maritalStatus.marie')}] } onSave={(v)=>updateField('maritalStatus', v)} />
                    <EditableInfoRow label={t('employeeDetails.fields.numberOfChildren')} value={emp?.numberOfChildren} type="number" onSave={(v)=>updateField('numberOfChildren', v)} />
                  </div>
                </Card>

                {/* Contact Card */}
                <Card className="p-6 space-y-4 border-l-4 border-l-muted-foreground/30">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{t('employeeDetails.sections.contact')}</h3>
                      <p className="text-xs text-muted-foreground">Coordonnées</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <EditableInfoRow label={t('employeeDetails.fields.email')} value={emp?.email} type="text" onSave={(v)=>updateField('email', v)} />
                    <EditableInfoRow label={t('employeeDetails.fields.phone')} value={emp?.phone} type="text" onSave={(v)=>updateField('phone', v)} />
                    <EditableInfoRow label={t('employeeDetails.fields.address')} value={emp?.address} type="textarea" onSave={(v)=>updateField('address', v)} />
                    <EditableInfoRow label={t('employeeDetails.fields.city')} value={emp?.city} type="text" onSave={(v)=>updateField('city', v)} />
                    <EditableInfoRow label={t('employeeDetails.fields.postalCode')} value={emp?.postalCode} type="text" onSave={(v)=>updateField('postalCode', v)} />
                    <EditableInfoRow label={t('employeeDetails.fields.country')} value={emp?.country} type="text" onSave={(v)=>updateField('country', v)} />
                  </div>
                </Card>
              </div>

              {/* Emergency Contact */}
              {emp?.emergencyContact && (
                <Card className="p-6 space-y-4 border-l-4 border-l-primary">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                    <h3 className="font-semibold text-lg">Contact d&apos;urgence</h3>
                    <p className="text-xs text-muted-foreground">Personne à contacter en cas d&apos;urgence</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <EditableInfoRow label="Nom" value={emp.emergencyContact.name} type="text" onSave={(v)=>patchEmployee({ emergencyContact: { ...(emp!.emergencyContact!), name: v } })} />
                    <EditableInfoRow label="Téléphone" value={emp.emergencyContact.phone} type="text" onSave={(v)=>patchEmployee({ emergencyContact: { ...(emp!.emergencyContact!), phone: v } })} />
                    <EditableInfoRow label="Relation" value={emp.emergencyContact.relationship} type="text" onSave={(v)=>patchEmployee({ emergencyContact: { ...(emp!.emergencyContact!), relationship: v } })} />
                  </div>
                </Card>
              )}

              {/* Notes */}
              {emp?.notes && (
                <Card className="p-6 space-y-4 border-l-4 border-l-muted-foreground/30">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                      <NotebookText className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{t('employeeDetails.sections.notes')}</h3>
                      <p className="text-xs text-muted-foreground">Notes internes RH</p>
                    </div>
                  </div>
                  <EditableInfoRow label={t('employeeDetails.sections.notes')} value={emp.notes} type="textarea" onSave={(v)=>updateField('notes', v)} />
                </Card>
              )}
            </AnimatedTabContent>
          </TabsContent>

          {/* Skills Tab */}
          <TabsContent value="skills" className="space-y-4">
            <AnimatedTabContent active={active==='skills'}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Education */}
                <Card className="p-6 space-y-4 border-l-4 border-l-indigo-500">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100">
                        <GraduationCap className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{t('employeeDetails.sections.education')}</h3>
                        <p className="text-xs text-muted-foreground">Parcours académique</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="gap-2" onClick={()=>openItemDialog('education')}><Plus className="h-4 w-4" />{t('common.add')}</Button>
                  </div>
                  {emp?.education?.length ? (
                    <div className="space-y-3">
                      {emp.education.map((e, i) => (
                        <div key={i} className="p-4 rounded-lg border bg-muted/30 space-y-2 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between gap-2">
                            <div className="font-medium text-sm">{e.level}</div>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="icon" onClick={()=>openItemDialog('education', i)}><Edit className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="icon" onClick={()=>removeItem('education', i)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                              {e.year && (
                                <Badge variant="secondary" className="text-xs">
                                  {e.year}
                                </Badge>
                              )}
                            </div>
                          </div>
                          {e.diploma && (
                            <p className="text-sm text-muted-foreground">{e.diploma}</p>
                          )}
                          {e.institution && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Building2 className="h-3 w-3" />
                              {e.institution}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-sm text-muted-foreground">
                      {t('employeeDetails.empty.noEducation')}
                    </div>
                  )}
                </Card>

                {/* Skills */}
                <Card className="p-6 space-y-4 border-l-4 border-l-cyan-500">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-100">
                        <Layers className="h-5 w-5 text-cyan-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{t('employeeDetails.sections.skills')}</h3>
                        <p className="text-xs text-muted-foreground">Compétences techniques</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="gap-2" onClick={()=>openItemDialog('skills')}><Plus className="h-4 w-4" />{t('common.add')}</Button>
                  </div>
                  {emp?.skills?.length ? (
                    <div className="space-y-3">
                      {emp.skills.map((s, i) => (
                        <div key={i} className="p-3 rounded-lg border bg-muted/30 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-sm">{s.name}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">Niveau {s.level}/5</span>
                              <Button variant="ghost" size="icon" onClick={()=>openItemDialog('skills', i)}><Edit className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="icon" onClick={()=>removeItem('skills', i)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                            </div>
                          </div>
                          <SkillLevelBar level={s.level} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-sm text-muted-foreground">
                      {t('employeeDetails.empty.noSkills')}
                    </div>
                  )}
                </Card>
              </div>

              {/* Certifications */}
              <Card className="p-6 space-y-4 border-l-4 border-l-primary">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Award className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{t('employeeDetails.sections.certifications')}</h3>
                      <p className="text-xs text-muted-foreground">Certifications professionnelles</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2" onClick={()=>openItemDialog('certifications')}><Plus className="h-4 w-4" />{t('common.add')}</Button>
                </div>
                {emp?.certifications?.length ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {emp.certifications.map((c, i) => (
                      <div key={i} className="p-4 rounded-lg border bg-muted/30 space-y-2 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between gap-2">
                          <div className="font-medium text-sm">{c.name}</div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" onClick={()=>openItemDialog('certifications', i)}><Edit className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={()=>removeItem('certifications', i)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                          </div>
                        </div>
                        {c.issuer && (
                          <p className="text-xs text-muted-foreground">Émis par {c.issuer}</p>
                        )}
                        {c.issueDate && (
                          <p className="text-xs text-muted-foreground">
                            {formatDate(c.issueDate)}
                            {c.expirationDate && ` · Expire le ${formatDate(c.expirationDate)}`}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-sm text-muted-foreground">
                    {t('employeeDetails.empty.noCertifications')}
                  </div>
                )}
              </Card>
            </AnimatedTabContent>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents">
            <AnimatedTabContent active={active==='documents'}>
              <Card className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{t('employeeDetails.sections.documents')}</h3>
                      <p className="text-xs text-muted-foreground">Documents officiels et pièces jointes</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2" onClick={()=>openItemDialog('documents')}><Plus className="h-4 w-4" />{t('common.add')}</Button>
                </div>

                {combinedDocs.length ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {combinedDocs.map((d, idx) => (
                      <div key={d.id} className="group relative">
                        <button
                          onClick={() => handleOpen(d)}
                          className="relative w-full p-4 rounded-lg border bg-card hover:shadow-lg transition-all text-left overflow-hidden"
                        >
                          {/* Preview */}
                          <div className="aspect-video w-full rounded-md overflow-hidden bg-muted mb-3">
                            {d.fileName?.match(/\.(png|jpg|jpeg|gif)$/i) ? (
                              <img
                                src={`/images/user/${d.fileName}`}
                                alt={d.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-muted-foreground">
                                PDF
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="space-y-1">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-medium text-sm line-clamp-1">{d.title}</h4>
                              <Badge variant="outline" className="text-[10px] shrink-0">
                                {(d.mimeType||'').split('/')[1] || 'file'}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {d.fileName}
                            </p>
                          </div>

                          {/* Hover overlay */}
                          <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Eye className="h-6 w-6 text-primary" />
                          </div>
                        </button>
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" onClick={()=>openItemDialog('documents', idx)}><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={()=>removeItem('documents', idx)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 border-2 border-dashed rounded-lg">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-sm text-muted-foreground">
                      {t('employeeDetails.empty.noDocuments')}
                    </p>
                  </div>
                )}
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
                    // Download logic here
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
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {openEditItem?.section === 'education' && (
              <>
                <Label>Niveau</Label>
                <Input value={tempItem?.level || ''} onChange={(e)=>setTempItem((p:any)=>({ ...p, level: e.target.value }))} />
                <Label>Diplôme</Label>
                <Input value={tempItem?.diploma || ''} onChange={(e)=>setTempItem((p:any)=>({ ...p, diploma: e.target.value }))} />
                <Label>Année</Label>
                <Input value={tempItem?.year || ''} onChange={(e)=>setTempItem((p:any)=>({ ...p, year: e.target.value }))} />
                <Label>Établissement</Label>
                <Input value={tempItem?.institution || ''} onChange={(e)=>setTempItem((p:any)=>({ ...p, institution: e.target.value }))} />
              </>
            )}

            {openEditItem?.section === 'skills' && (
              <>
                <Label>Compétence</Label>
                <Input value={tempItem?.name || ''} onChange={(e)=>setTempItem((p:any)=>({ ...p, name: e.target.value }))} />
                <Label>Niveau (1-5)</Label>
                <Input type="number" min={1} max={5} value={tempItem?.level ?? 3} onChange={(e)=>setTempItem((p:any)=>({ ...p, level: Number(e.target.value) }))} />
              </>
            )}

            {openEditItem?.section === 'certifications' && (
              <>
                <Label>Nom</Label>
                <Input value={tempItem?.name || ''} onChange={(e)=>setTempItem((p:any)=>({ ...p, name: e.target.value }))} />
                <Label>Émetteur</Label>
                <Input value={tempItem?.issuer || ''} onChange={(e)=>setTempItem((p:any)=>({ ...p, issuer: e.target.value }))} />
                <Label>Date d'émission</Label>
                <DatePickerField value={tempItem?.issueDate || ''} onChange={(d)=>setTempItem((p:any)=>({ ...p, issueDate: d || '' }))} />
                <Label>Date d'expiration</Label>
                <DatePickerField value={tempItem?.expirationDate || ''} onChange={(d)=>setTempItem((p:any)=>({ ...p, expirationDate: d || '' }))} />
              </>
            )}

            {openEditItem?.section === 'documents' && (
              <>
                <Label>Titre</Label>
                <Input value={tempItem?.title || ''} onChange={(e)=>setTempItem((p:any)=>({ ...p, title: e.target.value }))} />
                <Label>Fichier</Label>
                <FileUploader value={docFiles} onValueChange={setDocFiles} maxFiles={1} accept={{ 'image/*': [], 'application/pdf': [] }} description={t('employeeCreate.documents.help') || 'PDF ou image'} />
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
