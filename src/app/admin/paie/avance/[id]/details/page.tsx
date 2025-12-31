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
import { ArrowLeft, Edit2, CheckCircle2, XCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

type AvanceDetails = {
  id: number;
  employe_id: number;
  employee?: { matricule?: string; fullName?: string } | null;
  date_demande: string;
  statut: string;
  montant_avance?: number;
  creer_par?: number | string;
  valide_par?: number | string | null;
  date_validation?: string | null;
  created_at?: string;
  updated_at?: string;
  periode_paie: { mois: string; annee: number };
  motif_refus?: string | null;
  description?: string | null;
  creer_par_user?: { id: number | string; fullName?: string } | null;
  valide_par_user?: { id: number | string; fullName?: string } | null;
};

function getStatutBadge(statut?: string) {
  // Statuts unifiés: "Brouillon" | "En_attente" | "Valide" | "Refuse"
  const s = statut || '';
  const variants: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; className: string }> = {
    Brouillon: { label: 'Brouillon', variant: 'outline', className: 'bg-yellow-100 text-yellow-800' },
    En_attente: { label: 'En attente', variant: 'default', className: 'bg-gray-100 text-gray-800' },
    Valide: { label: 'Valide', variant: 'secondary', className: 'bg-green-100 text-green-800' },
    Refuse: { label: 'Refusé', variant: 'destructive', className: 'bg-red-100 text-red-800' }
  };
  const cfg = variants[s] || { label: statut || 'Inconnu', variant: 'outline', className: 'bg-gray-100 text-gray-800' };
  return (
    <Badge variant={cfg.variant} className={cfg.className}>
      {cfg.label}
    </Badge>
  );
}

export default function AvanceDetailsPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = useMemo(() => params?.id, [params]);
  const [data, setData] = useState<AvanceDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<'validate' | 'refuse' | null>(null);
  const [openValidate, setOpenValidate] = useState(false);
  const [openRefuse, setOpenRefuse] = useState(false);
  const [motifRefus, setMotifRefus] = useState('');

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await apiClient.get(apiRoutes.admin.avances.show(id));
        const d: AvanceDetails = res.data?.data || res.data;
        if (!cancelled) setData(d);
      } catch (e) {
        // fallback
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleValidate = async () => {
    if (!id) return;
    setActionLoading('validate');
    try {
      await apiClient.post(apiRoutes.admin.avances.validate(id), { valide_par: 1 });
      // refresh
      const res = await apiClient.get(apiRoutes.admin.avances.show(id));
      setData(res.data?.data || res.data);
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
      await apiClient.post(apiRoutes.admin.avances.refuse(id), { motif_refus: motifRefus || '' });
      const res = await apiClient.get(apiRoutes.admin.avances.show(id));
      setData(res.data?.data || res.data);
    } catch (e) {
      alert('Erreur lors du refus.');
    } finally {
      setActionLoading(null);
      setOpenRefuse(false);
      setMotifRefus('');
    }
  };

  return (
    <PageContainer scrollable>
      <div className='mx-auto w-full'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0'>
            <CardTitle>
              Détails de l&apos;avance <span className="ml-2 text-xs font-medium text-gray-500">
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
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className='rounded-md border p-3'>
                      <Skeleton className='h-3 w-24 mb-2' />
                      <Skeleton className='h-5 w-40' />
                    </div>
                  ))}
                  <div className='md:col-span-2'>
                    <Skeleton className='h-3 w-28 mb-2' />
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
                      Période de paie
                    </div>
                    <div className='font-medium'>
                      {data.periode_paie?.mois} {data.periode_paie?.annee}
                    </div>
                  </div>
                  {typeof (data as any).montant_avance !== 'undefined' && (
                    <div className='rounded-md border p-3'>
                      <div className='text-muted-foreground text-sm'>
                        Montant avance
                      </div>
                      <div className='font-medium'>
                        {new Intl.NumberFormat('fr-MA', {
                          style: 'currency',
                          currency: 'MAD',
                          maximumFractionDigits: 0
                        }).format((data as any).montant_avance || 0)}
                      </div>
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
                  {data.valide_par_user || data.valide_par ? (
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
                  ) : null}
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
                  <Button
                    variant='outline'
                    onClick={() =>
                      router.push(`/admin/paie/avance/${id}/modifier`)
                    }
                  >
                    <Edit2 className='mr-2 h-4 w-4' /> Modifier
                  </Button>
                  {(() => {
                    const s = data.statut || '';
                    const isValide = s === 'Valide';
                    return !isValide;
                  })() && (
                    <Button
                      onClick={() => setOpenValidate(true)}
                      disabled={actionLoading === 'validate'}
                    >
                      <CheckCircle2 className='mr-2 h-4 w-4' /> Valider
                    </Button>
                  )}
                  {(() => {
                    const s = data.statut || '';
                    const isRefuse = s === 'Refuse';
                    return !isRefuse;
                  })() && (
                    <Button
                      variant='destructive'
                      onClick={() => setOpenRefuse(true)}
                      disabled={actionLoading === 'refuse'}
                    >
                      <XCircle className='mr-2 h-4 w-4' /> Refuser
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
            Voulez-vous vraiment valider cette demande d&apos;avance ?
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
            <DialogTitle>Refuser l&apos;avance</DialogTitle>
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
    </PageContainer>
  );
}