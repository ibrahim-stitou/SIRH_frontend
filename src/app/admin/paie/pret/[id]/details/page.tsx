'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import apiClient from '@/lib/api';
import { apiRoutes } from '@/config/apiRoutes';
import {
  ArrowLeft,
  Edit2,
  CheckCircle2,
  XCircle,
  PlayCircle,
  CheckCircle
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { DatePickerField } from '@/components/custom/DatePickerField';

type PretDetails = {
  id: number;
  employe_id: number;
  employee?: { matricule?: string; fullName?: string } | null;
  date_demande: string;
  statut: string;
  creer_par?: number | string;
  valide_par?: number | string | null;
  date_validation?: string | null;
  created_at?: string;
  updated_at?: string;
  montant_pret: number;
  duree_mois: number;
  montant_mensualite: number;
  date_debut_remboursement?: string | null;
  date_fin_prevue?: string | null;
  taux_interet: number;
  type_pret: string;
  periode_paie_depart: { mois: string; annee: number };
  motif_refus?: string | null;
  description?: string | null;
  montant_rembourse?: number;
  montant_restant?: number;
  creer_par_user?: { id: number | string; fullName?: string } | null;
  valide_par_user?: { id: number | string; fullName?: string } | null;
};

function getStatutBadge(statut?: string) {
  const s = statut || '';
  const variants: Record<
    string,
    {
      label: string;
      variant: 'default' | 'secondary' | 'destructive' | 'outline';
      className: string;
    }
  > = {
    Brouillon: {
      label: 'Brouillon',
      variant: 'outline',
      className: 'bg-yellow-100 text-yellow-800'
    },
    'En attente': {
      label: 'En attente',
      variant: 'default',
      className: 'bg-gray-100 text-gray-800'
    },
    Validé: {
      label: 'Validé',
      variant: 'secondary',
      className: 'bg-green-100 text-green-800'
    },
    Refusé: {
      label: 'Refusé',
      variant: 'destructive',
      className: 'bg-red-100 text-red-800'
    },
    'En cours': {
      label: 'En cours',
      variant: 'default',
      className: 'bg-blue-100 text-blue-800'
    },
    Soldé: {
      label: 'Soldé',
      variant: 'secondary',
      className: 'bg-emerald-100 text-emerald-800'
    }
  };
  const cfg = variants[s] || {
    label: statut || 'Inconnu',
    variant: 'outline',
    className: 'bg-gray-100 text-gray-800'
  };
  return (
    <Badge variant={cfg.variant} className={cfg.className}>
      {cfg.label}
    </Badge>
  );
}

const currency = (v?: number) =>
  new Intl.NumberFormat('fr-MA', {
    style: 'currency',
    currency: 'MAD',
    maximumFractionDigits: 0
  }).format(v ?? 0);

export default function PretDetailsPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = useMemo(() => params?.id, [params]);
  const [data, setData] = useState<PretDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<
    'validate' | 'refuse' | 'start' | 'settle' | null
  >(null);
  const [openValidate, setOpenValidate] = useState(false);
  const [openRefuse, setOpenRefuse] = useState(false);
  const [openStart, setOpenStart] = useState(false);
  const [openSettle, setOpenSettle] = useState(false);
  const [motifRefus, setMotifRefus] = useState('');
  const [startDate, setStartDate] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await apiClient.get(apiRoutes.admin.prets.show(id));
        const d: PretDetails = res.data?.data || res.data;
        if (!cancelled) {
          setData(d);
          setStartDate(d?.date_debut_remboursement || null);
        }
      } catch (e) {
        // ignore
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const refresh = async () => {
    if (!id) return;
    const res = await apiClient.get(apiRoutes.admin.prets.show(id));
    setData(res.data?.data || res.data);
  };

  const handleValidate = async () => {
    if (!id) return;
    setActionLoading('validate');
    try {
      await apiClient.post(apiRoutes.admin.prets.validate(id), {
        valide_par: 1
      });
      await refresh();
    } catch (e) {
      alert('Erreur lors de la validation.');
    } finally {
      setActionLoading(null);
      setOpenValidate(false);
    }
  };

  const handleRefuse = async () => {
    if (!id) return;
    setActionLoading('refuse');
    try {
      await apiClient.post(apiRoutes.admin.prets.refuse(id), {
        motif_refus: motifRefus || ''
      });
      await refresh();
    } catch (e) {
      alert('Erreur lors du refus.');
    } finally {
      setActionLoading(null);
      setOpenRefuse(false);
      setMotifRefus('');
    }
  };

  const handleStart = async () => {
    if (!id) return;
    setActionLoading('start');
    try {
      await apiClient.post(apiRoutes.admin.prets.start(id), {
        date_debut_remboursement: startDate
      });
      await refresh();
    } catch (e) {
      alert('Erreur lors du démarrage du remboursement.');
    } finally {
      setActionLoading(null);
      setOpenStart(false);
    }
  };

  const handleSettle = async () => {
    if (!id) return;
    setActionLoading('settle');
    try {
      await apiClient.post(apiRoutes.admin.prets.settle(id), {});
      await refresh();
    } catch (e) {
      alert('Erreur lors du soldage du prêt.');
    } finally {
      setActionLoading(null);
      setOpenSettle(false);
    }
  };

  const canEdit = (data?.statut || '') === 'Brouillon';
  const canValidate =
    (data?.statut || '') !== 'Validé' &&
    (data?.statut || '') !== 'Refusé' &&
    (data?.statut || '') !== 'Soldé';
  const canRefuse =
    (data?.statut || '') !== 'Refusé' &&
    (data?.statut || '') !== 'Soldé' &&
    (data?.statut || '') !== 'En cours';
  const canStart = (data?.statut || '') === 'Validé';
  const canSettle = (data?.statut || '') === 'En cours';

  return (
    <PageContainer scrollable>
      <div className='mx-auto w-full'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0'>
            <CardTitle>
              Détails du prêt{' '}
              <span className='ml-2 text-xs font-medium text-gray-500'>
                {data?.statut && getStatutBadge(data.statut)}
              </span>
            </CardTitle>
            <Button variant='ghost' size='sm' onClick={() => router.back()}>
              <ArrowLeft className='mr-2 h-4 w-4' /> Retour
            </Button>
          </CardHeader>
          <Separator />
          <CardContent className='pt-6'>
            {loading ? (
              <div className='space-y-6'>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className='rounded-md border p-3'>
                      <Skeleton className='mb-2 h-3 w-24' />
                      <Skeleton className='h-5 w-40' />
                    </div>
                  ))}
                  <div className='md:col-span-2'>
                    <Skeleton className='mb-2 h-3 w-28' />
                    <Skeleton className='h-12 w-full' />
                  </div>
                </div>
                <div className='flex flex-wrap items-center justify-end gap-2'>
                  <Skeleton className='h-9 w-28' />
                  <Skeleton className='h-9 w-24' />
                  <Skeleton className='h-9 w-24' />
                </div>
              </div>
            ) : data ? (
              <div className='space-y-6'>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  <div className='rounded-md border p-3'>
                    <div className='text-muted-foreground text-sm'>Employé</div>
                    <div className='font-medium'>
                      {data.employee?.matricule} {data.employee?.fullName}
                    </div>
                  </div>
                  <div className='rounded-md border p-3'>
                    <div className='text-muted-foreground text-sm'>
                      Date demande
                    </div>
                    <div className='font-medium'>{data.date_demande}</div>
                  </div>
                  <div className='rounded-md border p-3'>
                    <div className='text-muted-foreground text-sm'>
                      Montant prêt
                    </div>
                    <div className='font-medium'>
                      {currency(data.montant_pret)}
                    </div>
                  </div>
                  <div className='rounded-md border p-3'>
                    <div className='text-muted-foreground text-sm'>
                      Durée (mois)
                    </div>
                    <div className='font-medium'>{data.duree_mois}</div>
                  </div>
                  <div className='rounded-md border p-3'>
                    <div className='text-muted-foreground text-sm'>
                      Mensualité
                    </div>
                    <div className='font-medium'>
                      {currency(data.montant_mensualite)}
                    </div>
                  </div>
                  <div className='rounded-md border p-3'>
                    <div className='text-muted-foreground text-sm'>
                      Type de prêt
                    </div>
                    <div className='font-medium'>{data.type_pret}</div>
                  </div>
                  <div className='rounded-md border p-3'>
                    <div className='text-muted-foreground text-sm'>Taux</div>
                    <div className='font-medium'>{data.taux_interet}%</div>
                  </div>
                  <div className='rounded-md border p-3'>
                    <div className='text-muted-foreground text-sm'>
                      Période départ
                    </div>
                    <div className='font-medium'>
                      {data.periode_paie_depart?.mois}{' '}
                      {data.periode_paie_depart?.annee}
                    </div>
                  </div>
                  {data.date_debut_remboursement && (
                    <div className='rounded-md border p-3'>
                      <div className='text-muted-foreground text-sm'>
                        Début remboursement
                      </div>
                      <div className='font-medium'>
                        {data.date_debut_remboursement}
                      </div>
                    </div>
                  )}
                  {data.date_fin_prevue && (
                    <div className='rounded-md border p-3'>
                      <div className='text-muted-foreground text-sm'>
                        Fin prévue
                      </div>
                      <div className='font-medium'>{data.date_fin_prevue}</div>
                    </div>
                  )}
                  <div className='rounded-md border p-3'>
                    <div className='text-muted-foreground text-sm'>
                      Créée par
                    </div>
                    <div className='font-medium'>
                      {data.creer_par_user?.fullName || data.creer_par || '—'}
                    </div>
                  </div>
                  {(data.valide_par_user || data.valide_par) && (
                    <div className='rounded-md border p-3'>
                      <div className='text-muted-foreground text-sm'>
                        Validée par
                      </div>
                      <div className='font-medium'>
                        {data.valide_par_user?.fullName ||
                          data.valide_par ||
                          '—'}
                      </div>
                    </div>
                  )}
                  <div className='rounded-md border p-3'>
                    <div className='text-muted-foreground text-sm'>
                      Remboursé
                    </div>
                    <div className='font-medium'>
                      {currency(data.montant_rembourse || 0)}
                    </div>
                  </div>
                  <div className='rounded-md border p-3'>
                    <div className='text-muted-foreground text-sm'>Restant</div>
                    <div className='font-medium'>
                      {currency(
                        data.montant_restant ||
                          Math.max(
                            0,
                            (data.montant_pret || 0) -
                              (data.montant_rembourse || 0)
                          )
                      )}
                    </div>
                  </div>
                  {data.motif_refus && (
                    <div className='md:col-span-2'>
                      <div className='text-muted-foreground text-sm'>
                        Motif de refus
                      </div>
                      <div className='font-medium'>{data.motif_refus}</div>
                    </div>
                  )}
                  {data.description && (
                    <div className='md:col-span-2'>
                      <div className='text-muted-foreground text-sm'>
                        Description
                      </div>
                      <div className='font-medium'>{data.description}</div>
                    </div>
                  )}
                </div>

                <div className='flex flex-wrap items-center justify-end gap-2'>
                  {canEdit && (
                    <Button
                      variant='outline'
                      onClick={() =>
                        router.push(`/admin/paie/pret/${id}/modifier`)
                      }
                    >
                      <Edit2 className='mr-2 h-4 w-4' /> Modifier
                    </Button>
                  )}
                  {canValidate && (
                    <Button
                      onClick={() => setOpenValidate(true)}
                      disabled={actionLoading === 'validate'}
                    >
                      <CheckCircle2 className='mr-2 h-4 w-4' /> Valider
                    </Button>
                  )}
                  {canRefuse && (
                    <Button
                      variant='destructive'
                      onClick={() => setOpenRefuse(true)}
                      disabled={actionLoading === 'refuse'}
                    >
                      <XCircle className='mr-2 h-4 w-4' /> Refuser
                    </Button>
                  )}
                  {canStart && (
                    <Button
                      variant='outline'
                      onClick={() => setOpenStart(true)}
                      disabled={actionLoading === 'start'}
                    >
                      <PlayCircle className='mr-2 h-4 w-4' /> Démarrer
                      remboursement
                    </Button>
                  )}
                  {canSettle && (
                    <Button
                      variant='secondary'
                      onClick={() => setOpenSettle(true)}
                      disabled={actionLoading === 'settle'}
                    >
                      <CheckCircle className='mr-2 h-4 w-4' /> Marquer soldé
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div>Aucune donnée</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog confirmation validation */}
      <Dialog
        open={openValidate}
        onOpenChange={(o) => !o && setOpenValidate(false)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la validation</DialogTitle>
          </DialogHeader>
          <p className='text-muted-foreground text-sm'>
            Voulez-vous vraiment valider cette demande de prêt ?
          </p>
          <DialogFooter>
            <Button variant='outline' onClick={() => setOpenValidate(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleValidate}
              disabled={actionLoading === 'validate'}
            >
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog motif de refus */}
      <Dialog
        open={openRefuse}
        onOpenChange={(o) => !o && setOpenRefuse(false)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Refuser le prêt</DialogTitle>
          </DialogHeader>
          <div className='space-y-2'>
            <label className='text-sm font-medium'>
              Motif du refus (optionnel)
            </label>
            <Textarea
              value={motifRefus}
              onChange={(e) => setMotifRefus(e.target.value)}
              rows={4}
              placeholder='Saisissez le motif du refus...'
            />
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setOpenRefuse(false)}>
              Annuler
            </Button>
            <Button
              variant='destructive'
              onClick={handleRefuse}
              disabled={actionLoading === 'refuse'}
            >
              Refuser
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog démarrer remboursement */}
      <Dialog open={openStart} onOpenChange={(o) => !o && setOpenStart(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Démarrer le remboursement</DialogTitle>
          </DialogHeader>
          <div className='space-y-2'>
            <label className='text-sm font-medium'>
              Date de début de remboursement
            </label>
            <DatePickerField
              name='date_debut_remboursement'
              value={startDate as any}
              onChange={(d) => setStartDate(d)}
            />
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setOpenStart(false)}>
              Annuler
            </Button>
            <Button onClick={handleStart} disabled={actionLoading === 'start'}>
              Démarrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog solder */}
      <Dialog
        open={openSettle}
        onOpenChange={(o) => !o && setOpenSettle(false)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Marquer comme soldé</DialogTitle>
          </DialogHeader>
          <p className='text-muted-foreground text-sm'>
            Confirmez-vous que ce prêt est intégralement remboursé ?
          </p>
          <DialogFooter>
            <Button variant='outline' onClick={() => setOpenSettle(false)}>
              Annuler
            </Button>
            <Button
              variant='secondary'
              onClick={handleSettle}
              disabled={actionLoading === 'settle'}
            >
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
