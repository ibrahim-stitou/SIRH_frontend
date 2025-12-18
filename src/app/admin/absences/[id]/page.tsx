'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import apiClient from '@/lib/api';
import { apiRoutes } from '@/config/apiRoutes';
import {
  ArrowLeft,
  Edit,
  Trash,
  CheckCircle,
  XCircle,
  FileText,
  Download,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import PageContainer from '@/components/layout/page-container';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

export default function AbsenceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [loading, setLoading] = useState(true);
  const [absence, setAbsence] = useState<any>(null);
  const [type, setType] = useState<any>(null);
  const [employee, setEmployee] = useState<any>(null);
  const [actionsLoading, setActionsLoading] = useState<string | null>(null);
  const [showRefuseModal, setShowRefuseModal] = useState(false);
  const [refuseReason, setRefuseReason] = useState('');
  const [refuseLoading, setRefuseLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [absenceRes, typesRes, employeesRes] = await Promise.all([
          apiClient.get(apiRoutes.admin.absences.show(id)),
          apiClient.get(apiRoutes.admin.absences.types),
          apiClient.get(apiRoutes.admin.employees.simpleList)
        ]);
        const abs = absenceRes.data?.data;
        setAbsence(abs);
        setType(
          typesRes.data?.data.find((t: any) => t.id === abs.type_absence_id) ||
            null
        );
        setEmployee(
          employeesRes.data?.data.find((e: any) => e.id === abs.employeeId) ||
            null
        );
      } catch (e) {
        toast.error("Erreur lors du chargement de l'absence");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  // Actions
  const handleAction = async (
    action: 'valider' | 'cloturer' | 'annuler' | 'supprimer'
  ) => {
    setActionsLoading(action);
    try {
      let url = '';
      if (action === 'valider') url = apiRoutes.admin.absences.validate(id);
      if (action === 'cloturer') url = apiRoutes.admin.absences.close(id);
      if (action === 'annuler') url = apiRoutes.admin.absences.cancel(id);
      if (action === 'supprimer') url = apiRoutes.admin.absences.delete(id);
      if (action === 'supprimer') {
        await apiClient.delete(url);
        toast.success('Absence supprimée');
        router.push('/admin/absences');
        return;
      } else {
        await apiClient.post(url);
        toast.success('Action réalisée avec succès');
        router.refresh();
      }
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Erreur lors de l'action");
    } finally {
      setActionsLoading(null);
    }
  };

  const handleRefuse = async () => {
    setRefuseLoading(true);
    try {
      await apiClient.post(apiRoutes.admin.absences.refuse(id), {
        motif_refus: refuseReason
      });
      toast.success('Absence refusée');
      setShowRefuseModal(false);
      setRefuseReason('');
      router.refresh();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Erreur lors du refus');
    } finally {
      setRefuseLoading(false);
    }
  };

  if (loading) {
    return (
      <PageContainer scrollable>
        <div className='w-full space-y-6'>
          <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
            <div className='flex items-center gap-3'>
              <div className='bg-muted h-9 w-9 animate-pulse rounded-md' />
              <div className='space-y-2'>
                <div className='bg-muted h-8 w-48 animate-pulse rounded' />
                <div className='bg-muted h-4 w-64 animate-pulse rounded' />
              </div>
            </div>
            <div className='flex gap-2'>
              <div className='bg-muted h-9 w-24 animate-pulse rounded' />
              <div className='bg-muted h-9 w-24 animate-pulse rounded' />
            </div>
          </div>
          <Card>
            <CardHeader className='from-primary/5 to-primary/10 rounded-t-lg border-b bg-gradient-to-r pt-2 pb-2'>
              <div className='flex items-center gap-3'>
                <div className='bg-muted h-10 w-10 animate-pulse rounded-lg' />
                <div className='space-y-2'>
                  <div className='bg-muted h-6 w-48 animate-pulse rounded' />
                  <div className='bg-muted h-4 w-32 animate-pulse rounded' />
                </div>
              </div>
            </CardHeader>
            <CardContent className='space-y-6 p-6'>
              <div className='grid gap-4 sm:grid-cols-2'>
                <div className='space-y-2'>
                  <div className='bg-muted h-4 w-20 animate-pulse rounded' />
                  <div className='bg-muted h-6 w-40 animate-pulse rounded' />
                </div>
                <div className='space-y-2'>
                  <div className='bg-muted h-4 w-32 animate-pulse rounded' />
                  <div className='bg-muted h-6 w-36 animate-pulse rounded' />
                </div>
              </div>
              <Separator />
              <div className='grid gap-4 sm:grid-cols-2'>
                <div className='space-y-2'>
                  <div className='bg-muted h-4 w-16 animate-pulse rounded' />
                  <div className='bg-muted h-6 w-full animate-pulse rounded' />
                </div>
                <div className='space-y-2'>
                  <div className='bg-muted h-4 w-16 animate-pulse rounded' />
                  <div className='bg-muted h-6 w-24 animate-pulse rounded' />
                </div>
              </div>
              <Separator />
              <div className='grid gap-4 sm:grid-cols-2'>
                <div className='space-y-2'>
                  <div className='bg-muted h-4 w-12 animate-pulse rounded' />
                  <div className='bg-muted h-20 w-full animate-pulse rounded' />
                </div>
                <div className='space-y-2'>
                  <div className='bg-muted h-4 w-32 animate-pulse rounded' />
                  <div className='bg-muted h-20 w-full animate-pulse rounded' />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    );
  }
  if (!absence) {
    return (
      <PageContainer scrollable>
        <div className='text-destructive flex h-96 items-center justify-center'>
          <AlertCircle className='mr-2 h-8 w-8' /> Absence introuvable
        </div>
      </PageContainer>
    );
  }

  // Justificatif (mock: url ou nom de fichier)
  const justificatifUrl =
    absence.justificatifUrl || absence.justificatif_url || absence.justificatif;
  const canValidate = absence.statut === 'brouillon';
  const canCloture = absence.statut === 'validee';
  const canAnnule = ['brouillon', 'validee'].includes(absence.statut);
  const canRefuse = ['brouillon', 'validee'].includes(absence.statut);

  return (
    <PageContainer scrollable>
      <div className='w-full space-y-6'>
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
                Détail de l&apos;absence - congé
              </h1>
              <p className='text-muted-foreground mt-1 text-sm'>
                Toutes les informations sur cette absence
              </p>
            </div>
          </div>
          <div className='flex flex-wrap gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => router.push(`/admin/absences/${id}/modifier`)}
              disabled={actionsLoading !== null}
            >
              <Edit className='mr-1 h-4 w-4' /> Modifier
            </Button>
            <Button
              variant='destructive'
              size='sm'
              onClick={() => handleAction('supprimer')}
              disabled={actionsLoading !== null}
            >
              <Trash className='mr-1 h-4 w-4' /> Supprimer
            </Button>
            {canValidate && (
              <Button
                variant='ghost'
                size='sm'
                onClick={() => handleAction('valider')}
                disabled={actionsLoading !== null}
              >
                <CheckCircle className='mr-1 h-4 w-4' /> Valider
              </Button>
            )}
            {canCloture && (
              <Button
                variant='secondary'
                size='sm'
                onClick={() => handleAction('cloturer')}
                disabled={actionsLoading !== null}
              >
                <CheckCircle className='mr-1 h-4 w-4' /> Clôturer
              </Button>
            )}
            {canAnnule && (
              <Button
                variant='outline'
                size='sm'
                onClick={() => handleAction('annuler')}
                disabled={actionsLoading !== null}
              >
                <XCircle className='mr-1 h-4 w-4' /> Annuler
              </Button>
            )}
            {canRefuse && (
              <Button
                variant='destructive'
                size='sm'
                onClick={() => setShowRefuseModal(true)}
                disabled={actionsLoading !== null}
              >
                <XCircle className='mr-1 h-4 w-4' /> Refuser
              </Button>
            )}
          </div>
        </div>
        <Card className='py-0'>
          <CardHeader className='from-primary/5 to-primary/10 rounded-t-lg border-b bg-gradient-to-r pt-2 pb-2'>
            <div className='flex items-center gap-3'>
              <div className='bg-primary text-primary-foreground flex h-10 w-10 items-center justify-center rounded-lg'>
                <FileText className='h-5 w-5' />
              </div>
              <div>
                <CardTitle className='text-xl'>
                  Informations de l&apos;absence
                </CardTitle>
                <p className='text-muted-foreground mt-0.5 text-sm'>
                  Récapitulatif complet
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className='space-y-6 p-6'>
            <div className='grid gap-4 sm:grid-cols-2'>
              <div>
                <div className='mb-1 text-sm font-semibold'>Employé</div>
                <div className='text-base'>
                  {employee
                    ? `${employee.firstName} ${employee.lastName}`
                    : absence.employeeId}
                  {employee?.matricule && (
                    <span className='text-muted-foreground ml-2'>
                      ({employee.matricule})
                    </span>
                  )}
                </div>
                {employee?.departement && (
                  <div className='text-muted-foreground mt-1 text-xs'>
                    Département : {employee.departement.name}
                  </div>
                )}
              </div>
              <div>
                <div className='mb-1 text-sm font-semibold'>
                  Type d&apos;absence
                </div>
                <div className='flex items-center gap-2'>
                  <span className='text-base font-medium'>
                    {type?.libelle || absence.type_absence_id}
                  </span>
                  {type?.couleur_hexa && (
                    <span
                      className='inline-block h-3 w-3 rounded-full'
                      style={{ backgroundColor: type.couleur_hexa }}
                    />
                  )}
                </div>
                <div className='mt-1 flex flex-wrap gap-2'>
                  {type?.est_conge && (
                    <Badge variant='outline' className='text-xs'>
                      Congé
                    </Badge>
                  )}
                  {type?.est_remuneree && (
                    <Badge
                      variant='outline'
                      className='border-green-500 text-xs text-green-700'
                    >
                      Rémunérée
                    </Badge>
                  )}
                  {type?.deduit_compteur_conge && (
                    <Badge
                      variant='outline'
                      className='border-orange-500 text-xs text-orange-700'
                    >
                      Déduit compteur
                    </Badge>
                  )}
                  {type?.necessite_justification && (
                    <Badge
                      variant='outline'
                      className='border-red-500 text-xs text-red-700'
                    >
                      Justification requise
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <Separator />
            <div className='grid gap-4 sm:grid-cols-2'>
              <div>
                <div className='mb-1 text-sm font-semibold'>Période</div>
                <div className='text-base'>
                  {format(parseISO(absence.date_debut), 'dd MMM yyyy HH:mm', {
                    locale: fr
                  })}{' '}
                  →{' '}
                  {format(parseISO(absence.date_fin), 'dd MMM yyyy HH:mm', {
                    locale: fr
                  })}
                </div>
                <div className='text-muted-foreground mt-1 text-xs'>
                  Durée :{' '}
                  <span className='font-semibold'>
                    {absence.duree?.days ?? '-'}j {absence.duree?.hours ?? '-'}h{' '}
                    {absence.duree?.minutes ?? '-'}min
                  </span>
                </div>
              </div>
              <div>
                <div className='mb-1 text-sm font-semibold'>Statut</div>
                <Badge
                  className='text-base capitalize'
                  variant={
                    absence.statut === 'validee'
                      ? 'secondary'
                      : absence.statut === 'cloturee'
                        ? 'secondary'
                        : absence.statut === 'annulee'
                          ? 'destructive'
                          : absence.statut === 'refusee'
                            ? 'destructive'
                            : 'outline'
                  }
                >
                  {absence.statut}
                </Badge>
                {absence.statut === 'refusee' && (
                  <div className='text-destructive mt-2 text-sm'>
                    <span className='font-semibold'>Motif du refus :</span>
                    <br />
                    <span className='whitespace-pre-line'>
                      {absence.motif_refus || '—'}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <Separator />
            <div className='grid gap-4 sm:grid-cols-2'>
              <div>
                <div className='mb-1 text-sm font-semibold'>Motif</div>
                <div className='min-h-[32px] text-base whitespace-pre-line'>
                  {absence.motif || (
                    <span className='text-muted-foreground'>—</span>
                  )}
                </div>
              </div>
              <div>
                <div className='mb-1 text-sm font-semibold'>Commentaire RH</div>
                <div className='min-h-[32px] text-base whitespace-pre-line'>
                  {absence.commentaire_rh || (
                    <span className='text-muted-foreground'>—</span>
                  )}
                </div>
              </div>
            </div>
            <Separator />
            <div className='grid gap-4 sm:grid-cols-2'>
              <div>
                <div className='mb-1 text-sm font-semibold'>Justificatif</div>
                {type?.necessite_justification ? (
                  justificatifUrl ? (
                    <div className='mt-2 flex items-center gap-2'>
                      <FileText className='text-primary h-5 w-5' />
                      <a
                        href={justificatifUrl}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='text-primary flex items-center gap-1 font-medium underline'
                        download
                      >
                        Télécharger
                        <Download className='h-4 w-4' />
                      </a>
                    </div>
                  ) : (
                    <span className='text-muted-foreground'>
                      Aucun justificatif fourni
                    </span>
                  )
                ) : (
                  <span className='text-muted-foreground'>Non requis</span>
                )}
              </div>
              <div />
            </div>
          </CardContent>
        </Card>
        {/* Modal de refus */}
        <Dialog open={showRefuseModal} onOpenChange={setShowRefuseModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Refuser l&apos;absence</DialogTitle>
            </DialogHeader>
            <div className='space-y-3'>
              <label className='block text-sm font-medium'>
                Motif du refus <span className='text-destructive'>*</span>
              </label>
              <Textarea
                value={refuseReason}
                onChange={(e) => setRefuseReason(e.target.value)}
                rows={4}
                placeholder='Saisir le motif du refus...'
                className='resize-none'
                required
              />
            </div>
            <DialogFooter>
              <Button
                variant='outline'
                onClick={() => setShowRefuseModal(false)}
                disabled={refuseLoading}
              >
                Annuler
              </Button>
              <Button
                variant='destructive'
                onClick={handleRefuse}
                disabled={refuseLoading || !refuseReason.trim()}
              >
                {refuseLoading ? 'Refus en cours...' : 'Refuser'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageContainer>
  );
}
