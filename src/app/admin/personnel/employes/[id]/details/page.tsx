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
import { SectionCard, InfoRow, AnimatedTabContent } from './components';
import { Calendar, FileText, GraduationCap, IdCard, Layers, NotebookText, UserRound } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface EmployeeRow {
  id: number;
  firstName: string; lastName: string; email: string; phone: string;
  birthDate?: string; birthPlace?: string; gender?: 'M'|'F'; nationality?: string; maritalStatus?: string; numberOfChildren?: number;
  address?: string; city?: string; postalCode?: string; country?: string;
  departmentId?: string; position?: string; hireDate?: string; notes?: string;
  education?: { level: string; diploma?: string; year?: string; institution?: string }[];
  skills?: { name: string; level: number }[];
  certifications?: { name: string; issuer?: string; issueDate?: string; expirationDate?: string }[];
  documents?: { id: string; title: string; fileName?: string; mimeType?: string; size?: number }[];
  status?: string; // added
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

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await apiClient.get(apiRoutes.admin.employees.details(id));
        const payload: any = res.data && typeof res.data === 'object' && 'data' in res.data ? res.data.data : res.data;
        setEmp(payload as EmployeeRow);

        const mediaRes = await apiClient.get(apiRoutes.admin.media.list);
        const mediaPayload: any[] = mediaRes.data && typeof mediaRes.data === 'object' && 'data' in mediaRes.data ? mediaRes.data.data : mediaRes.data;
        setMedia(mediaPayload);
      } catch (e) {
        toast.error("Impossible de charger l'employé");
        router.push('/admin/personnel/employes');
      }
    })();
  }, [id, router]);

  const fullName = emp ? `${emp.firstName} ${emp.lastName}` : '';

  const allUserImages = [
    'aws_certif.png','bac.png','cin.png','driver_licence.png','licence.png','modele-cdi-itm-FR.pdf','passport.png','profile.png'
  ];

  const combinedDocs = [...(emp?.documents||[]), ...media.filter(m => m.fileName).map(m => ({ id: `m-${m.id}`, title: m.title, fileName: m.fileName, mimeType: m.mimeType, size: m.size }))];
  const handleOpen = (item: any) => { setPreviewItem(item); setOpenPreview(true); };

  return (
    <PageContainer>
      <div className="w-full mx-auto px-4 py-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Avatar className="size-14 ring-2 ring-primary/40 shadow-sm">
              <AvatarImage src={`/images/user/profile.png`} alt={fullName} />
              <AvatarFallback>{emp?.firstName?.[0]}{emp?.lastName?.[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                {fullName}
                {emp?.status && <Badge variant="outline" className="text-xs px-2 py-0.5 bg-green-50 text-green-700 border-green-200">{emp.status}</Badge>}
              </h1>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <span>{emp?.position || '—'}</span>
                {emp?.departmentId && <span className="text-xs rounded bg-primary/5 px-2 py-0.5 text-primary">Dept {emp.departmentId}</span>}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => router.push(`/admin/personnel/employes/${id}/edit`)}>Modifier</Button>
            <Button variant="secondary" onClick={() => router.push('/admin/personnel/employes')}>Retour</Button>
          </div>
        </div>

        <Card className="p-4 border border-primary/10 shadow-sm bg-gradient-to-br from-background to-muted/40">
          <Tabs value={active} onValueChange={setActive}>
            <TabsList className="mb-4">
              <TabsTrigger value="personal"><UserRound className='text-primary' /> Personnel</TabsTrigger>
              <TabsTrigger value="skills"><GraduationCap className='text-indigo-600' /> Skills & Studies</TabsTrigger>
              <TabsTrigger value="social"><IdCard className='text-amber-600' /> CNSS & Mutuelle</TabsTrigger>
              <TabsTrigger value="contracts"><NotebookText className='text-pink-600' /> Contrats & Mouvements</TabsTrigger>
              <TabsTrigger value="documents"><FileText className='text-teal-600' /> Documents</TabsTrigger>
              <TabsTrigger value="leaves"><Calendar className='text-rose-600' /> Congés & Absences</TabsTrigger>
            </TabsList>

            <TabsContent value="personal">
              <AnimatedTabContent active={active==='personal'}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SectionCard title="Identité">
                    <InfoRow label="Nom complet" value={fullName} />
                    <InfoRow label="Email" value={emp?.email} />
                    <InfoRow label="Téléphone" value={emp?.phone} />
                    <InfoRow label="Date de naissance" value={emp?.birthDate} />
                    <InfoRow label="Lieu de naissance" value={emp?.birthPlace} />
                    <InfoRow label="Genre" value={emp?.gender==='M'?'Homme':emp?.gender==='F'?'Femme':'—'} />
                    <InfoRow label="Nationalité" value={emp?.nationality} />
                    <InfoRow label="État civil" value={emp?.maritalStatus} />
                    <InfoRow label="Enfants" value={emp?.numberOfChildren} />
                  </SectionCard>
                  <SectionCard title="Coordonnées">
                    <InfoRow label="Adresse" value={emp?.address} />
                    <InfoRow label="Ville" value={emp?.city} />
                    <InfoRow label="Code postal" value={emp?.postalCode} />
                    <InfoRow label="Pays" value={emp?.country} />
                    <InfoRow label="Poste" value={emp?.position} />
                    <InfoRow label="Date d'embauche" value={emp?.hireDate} />
                  </SectionCard>
                </div>
                {emp?.notes && (
                  <SectionCard title="Notes"><div className="text-sm">{emp.notes}</div></SectionCard>
                )}
              </AnimatedTabContent>
            </TabsContent>

            <TabsContent value="skills">
              <AnimatedTabContent active={active==='skills'}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SectionCard title="Formations" description="Liste des études et diplômes">
                    {emp?.education?.length ? (
                      <div className="space-y-2">
                        {emp.education.map((e, i) => (
                          <div key={i} className="flex items-center justify-between border p-2 rounded-md">
                            <div className="text-sm font-medium">{e.level} {e.diploma && `- ${e.diploma}`}</div>
                            <div className="text-xs text-muted-foreground">{e.institution} {e.year && `(${e.year})`}</div>
                          </div>
                        ))}
                      </div>
                    ) : <div className="text-sm text-muted-foreground">Aucune formation</div>}
                  </SectionCard>
                  <SectionCard title="Compétences" description="Compétences principales">
                    {emp?.skills?.length ? (
                      <div className="flex flex-wrap gap-2">
                        {emp.skills.map((s, i) => (
                          <span key={i} className="inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs bg-muted">
                            <Layers className="size-3" /> {s.name} <span className="opacity-70">(Lvl {s.level})</span>
                          </span>
                        ))}
                      </div>
                    ) : <div className="text-sm text-muted-foreground">Aucune compétence</div>}
                  </SectionCard>
                </div>
                <SectionCard title="Certifications">
                  {emp?.certifications?.length ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {emp.certifications.map((c, i) => (
                        <div key={i} className="border rounded-md p-2 text-sm">
                          <div className="font-medium">{c.name}</div>
                          <div className="text-xs text-muted-foreground">{c.issuer} {c.issueDate && `· ${c.issueDate}`}</div>
                        </div>
                      ))}
                    </div>
                  ) : <div className="text-sm text-muted-foreground">Aucune certification</div>}
                </SectionCard>
              </AnimatedTabContent>
            </TabsContent>

            <TabsContent value="social">
              <AnimatedTabContent active={active==='social'}>
                <SectionCard title="CNSS & Mutuelle" description="À venir">
                  <div className="text-sm text-muted-foreground">Section placeholder pour la CNSS et la Mutuelle.</div>
                </SectionCard>
              </AnimatedTabContent>
            </TabsContent>

            <TabsContent value="contracts">
              <AnimatedTabContent active={active==='contracts'}>
                <SectionCard title="Contrats & Mouvements" description="Historique RH">
                  <div className="text-sm text-muted-foreground">Données mock à brancher (contracts, movements).</div>
                </SectionCard>
              </AnimatedTabContent>
            </TabsContent>

            <TabsContent value="documents">
              <AnimatedTabContent active={active==='documents'}>
                <SectionCard title="Documents" description="Fichiers associés à l'employé + galerie complète">
                  {combinedDocs.length ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {combinedDocs.map((d) => (
                        <button type="button" onClick={() => handleOpen(d)} key={d.id} className="group border rounded-md p-3 bg-white/60 dark:bg-muted/40 hover:shadow-md transition shadow-sm text-left">
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-medium text-sm line-clamp-1">{d.title}</div>
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0.5">{(d.mimeType||'').split('/')[1] || (d.fileName?.endsWith('.pdf')?'pdf':'file')}</Badge>
                          </div>
                          <div className="text-[11px] text-muted-foreground mb-2 break-all">{d.fileName}</div>
                          {d.fileName?.endsWith('.png') && (
                            <img src={`/images/user/${d.fileName}`} alt={d.title} className="w-full aspect-video object-contain rounded-md bg-muted/30" />
                          )}
                          {d.fileName?.endsWith('.pdf') && (
                            <div className="w-full aspect-video flex items-center justify-center rounded-md bg-muted text-xs font-medium">PDF</div>
                          )}
                        </button>
                      ))}
                    </div>
                  ) : <div className="text-sm text-muted-foreground">Aucun document</div>}
                </SectionCard>
              </AnimatedTabContent>
            </TabsContent>

            <TabsContent value="leaves">
              <AnimatedTabContent active={active==='leaves'}>
                <SectionCard title="Congés & Absences">
                  <div className="text-sm text-muted-foreground">Gérer les congés et absences (mock à brancher si besoin).</div>
                </SectionCard>
              </AnimatedTabContent>
            </TabsContent>

          </Tabs>
        </Card>
      </div>

      <Dialog open={openPreview} onOpenChange={setOpenPreview}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{previewItem?.title}</DialogTitle>
          </DialogHeader>
          {previewItem?.fileName?.endsWith('.png') && (
            <img src={`/images/user/${previewItem.fileName}`} alt={previewItem.title} className="max-h-[70vh] w-full object-contain rounded-md" />
          )}
          {previewItem?.fileName?.endsWith('.pdf') && (
            <iframe title={previewItem.title} src={`/images/user/${previewItem.fileName}`} className="w-full h-[70vh] rounded-md" />
          )}
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
