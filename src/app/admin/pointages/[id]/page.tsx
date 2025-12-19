'use client';
import { useEffect, useMemo, useState } from 'react';
import PageContainer from '@/components/layout/page-container';
import { useRouter, useParams } from 'next/navigation';
import apiClient from '@/lib/api';
import { apiRoutes } from '@/config/apiRoutes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ArrowLeft, CheckCircle2, XCircle, Clock, CalendarDays, User } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { StatusBadge } from '@/components/custom/status-badge';

interface PointageDetails {
  id: number | string;
  employeeId: number | string;
  employee?: {
    id: number | string;
    firstName?: string;
    lastName?: string;
    first_name?: string;
    last_name?: string;
    matricule?: string;
  } | null;
  check_in?: string | null;
  check_out?: string | null;
  worked_minutes?: number;
  source?: 'manuel' | 'automatique' | string;
  status?: 'bruillon' | 'valide' | 'rejete' | string;
  motif_rejet?: string | null;
  created_at?: string;
  updated_at?: string;
  updated_by?: string;
}

export default function PointageDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<PointageDetails | null>(null);

  useEffect(() => {
    let mounted = true;
    apiClient
      .get(apiRoutes.admin.pointages.show(id))
      .then((res) => setData(res.data?.data || null))
      .catch((e) => toast.error(e?.response?.data?.message || 'Erreur'))
      .finally(() => setLoading(false));
    return () => {
      mounted = false;
    };
  }, [id]);

  const estimatedMinutes = useMemo(() => {
    if (!data?.check_in || !data?.check_out) return undefined;
    const di = new Date(data.check_in);
    const doo = new Date(data.check_out);
    if (isNaN(di.getTime()) || isNaN(doo.getTime())) return undefined;
    const diff = (doo.getTime() - di.getTime()) / 60000;
    return diff >= 0 ? Math.round(diff) : undefined;
  }, [data?.check_in, data?.check_out]);

  const [refuseOpen, setRefuseOpen] = useState(false);
  const [refuseReason, setRefuseReason] = useState('');

  const canValidate = data?.status === 'bruillon' || data?.status === 'rejete';
  const canRefuse = data?.status === 'bruillon' || data?.status === 'valide';

  const onValidate = async () => {
    if (!data) return;
    setSaving(true);
    try {
      const res = await apiClient.patch(apiRoutes.admin.pointages.validate(data.id));
      setData(res.data?.data);
      toast.success('Pointage validé');
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Erreur');
    } finally {
      setSaving(false);
    }
  };

  const onOpenRefuse = () => {
    setRefuseReason('');
    setRefuseOpen(true);
  };
  const onRefuse = async () => {
    if (!data) return;
    if (!refuseReason.trim()) {
      toast.error('Veuillez saisir un motif');
      return;
    }
    setSaving(true);
    try {
      const res = await apiClient.patch(apiRoutes.admin.pointages.refuse(data.id), { motif_rejet: refuseReason });
      setData(res.data?.data);
      setRefuseOpen(false);
      toast.success('Pointage refusé');
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Erreur');
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageContainer scrollable>
      <div className='flex flex-1 flex-col space-y-6'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div>
              <h1 className='text-2xl font-bold tracking-tight'>Détails du pointage</h1>
              {data?.id && (
                <p className='text-muted-foreground text-sm'>Réf. #{data.id}</p>
              )}
            </div>
          </div>
          <div className='flex items-center gap-2'>
            <Button variant='secondary' onClick={()=> router.push('/admin/pointages')}>
              <ArrowLeft /> Retour aux pointages
            </Button>
            <Button
              variant='outline'
              onClick={() => router.push(`/admin/pointages/${id}/modifier`)}
            >
              Modifier
            </Button>
            <Button
              variant='outline'
              onClick={onValidate}
              disabled={!canValidate || saving}
            >
              <CheckCircle2 className='mr-2 h-4 w-4 text-emerald-600' /> Valider
            </Button>
            <Button
              variant='destructive'
              onClick={onOpenRefuse}
              disabled={!canRefuse || saving}
            >
              <XCircle className='mr-2 h-4 w-4' /> Refuser
            </Button>
          </div>
        </div>

        <Card className='shadow-sm'>
          <CardHeader className=''>
            <CardTitle>Résumé</CardTitle>
          </CardHeader>
          <CardContent className=''>
            {loading ? (
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2 animate-pulse'>
                <div className='rounded-lg border p-3'>
                  <div className='h-4 w-28 bg-muted rounded mb-2'></div>
                  <div className='h-5 w-48 bg-muted rounded mb-1'></div>
                  <div className='h-3 w-24 bg-muted rounded'></div>
                </div>
                <div className='rounded-lg border p-3'>
                  <div className='h-4 w-20 bg-muted rounded mb-2'></div>
                  <div className='h-5 w-40 bg-muted rounded'></div>
                </div>
                <div className='rounded-lg border p-3'>
                  <div className='h-4 w-20 bg-muted rounded mb-2'></div>
                  <div className='h-5 w-40 bg-muted rounded'></div>
                </div>
                <div className='rounded-lg border p-3'>
                  <div className='h-4 w-20 bg-muted rounded mb-2'></div>
                  <div className='h-5 w-32 bg-muted rounded'></div>
                </div>
                <div className='rounded-lg border p-3'>
                  <div className='h-4 w-16 bg-muted rounded mb-2'></div>
                  <div className='h-7 w-24 bg-muted rounded'></div>
                </div>
                <div className='rounded-lg border p-3'>
                  <div className='h-4 w-16 bg-muted rounded mb-2'></div>
                  <div className='h-7 w-24 bg-muted rounded'></div>
                  <div className='h-3 w-48 bg-muted rounded mt-2'></div>
                </div>
                <div className='rounded-lg border p-3 md:col-span-2'>
                  <div className='h-4 w-40 bg-muted rounded mb-2'></div>
                  <div className='h-4 w-64 bg-muted rounded'></div>
                </div>
              </div>
            ) : data ? (
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <div className='rounded-lg border p-3'>
                  <div className='mb-1 flex items-center gap-2 text-sm font-medium'>
                    <User className='h-4 w-4' /> Employé
                  </div>
                  <div className='text-foreground'>
                    {data.employee
                      ? `${data.employee.firstName ?? data.employee.first_name ?? ''} ${data.employee.lastName ?? data.employee.last_name ?? ''}`.trim()
                      : '—'}
                  </div>
                  {data.employee?.matricule && (
                    <div className='text-muted-foreground text-xs'>
                      {data.employee.matricule}
                    </div>
                  )}
                </div>
                <div className='rounded-lg border p-3'>
                  <div className='mb-1 flex items-center gap-2 text-sm font-medium'>
                    <CalendarDays className='h-4 w-4' /> Entrée
                  </div>
                  <div className='text-foreground'>
                    {data.check_in ? format(new Date(data.check_in), 'yyyy-MM-dd HH:mm') : '—'}
                  </div>
                </div>
                <div className='rounded-lg border p-3'>
                  <div className='mb-1 flex items-center gap-2 text-sm font-medium'>
                    <CalendarDays className='h-4 w-4' /> Sortie
                  </div>
                  <div className='text-foreground'>
                    {data.check_out ? format(new Date(data.check_out), 'yyyy-MM-dd HH:mm') : '—'}
                  </div>
                </div>
                <div className='rounded-lg border p-3'>
                  <div className='mb-1 flex items-center gap-2 text-sm font-medium'>
                    <Clock className='h-4 w-4' /> Durée
                  </div>
                  <div className='text-foreground'>
                    {estimatedMinutes != null ? `${estimatedMinutes} minutes` : '—'}
                  </div>
                </div>
                <div className='rounded-lg border p-3'>
                  <div className='mb-1 text-sm font-medium'>Source</div>
                  <StatusBadge
                    tone={data.source === 'automatique' ? 'info' : 'warning'}
                    label={data.source || '—'}
                  />
                </div>
                <div className='rounded-lg border p-3'>
                  <div className='mb-1 text-sm font-medium'>Statut</div>
                  {(() => {
                    const map: Record<string, { text: string; tone: 'neutral' | 'success' | 'danger' }> = {
                      bruillon: { text: 'Brouillon', tone: 'neutral' },
                      valide: { text: 'Validé', tone: 'success' },
                      rejete: { text: 'Rejeté', tone: 'danger' }
                    };
                    const m = data.status ? map[data.status] || map['bruillon'] : map['bruillon'];
                    return (
                      <StatusBadge label={m.text} tone={m.tone} />
                    );
                  })()}
                  {data.status === 'rejete' && data.motif_rejet && (
                    <div className='text-destructive mt-2 text-sm'>
                      <span className='font-semibold'>Motif :</span> {data.motif_rejet}
                    </div>
                  )}
                </div>
                <div className='rounded-lg border p-3'>
                  <div className='mb-1 text-sm font-medium'>Dernière mise à jour</div>
                  <div className='text-muted-foreground text-sm'>
                    {data.updated_at ? format(new Date(data.updated_at), 'yyyy-MM-dd HH:mm') : '—'} par {data.updated_by || '—'}
                  </div>
                </div>
              </div>
            ) : (
              <div className='text-muted-foreground'>Introuvable</div>
            )}
          </CardContent>
        </Card>

        <Dialog open={refuseOpen} onOpenChange={setRefuseOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Refuser le pointage</DialogTitle>
            </DialogHeader>
            <div className='space-y-3'>
              <Label className='text-sm font-medium'>Motif</Label>
              <Textarea
                value={refuseReason}
                onChange={(e) => setRefuseReason(e.target.value)}
                rows={4}
                placeholder='Saisir le motif du refus...'
              />
            </div>
            <DialogFooter>
              <Button variant='outline' onClick={() => setRefuseOpen(false)} disabled={saving}>
                Annuler
              </Button>
              <Button variant='destructive' onClick={onRefuse} disabled={saving || !refuseReason.trim()}>
                {saving ? 'Refus en cours...' : 'Refuser'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageContainer>
  );
}
