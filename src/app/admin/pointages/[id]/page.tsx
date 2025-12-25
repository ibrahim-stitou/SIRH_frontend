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
  planned_check_in?: string | null;
  planned_check_out?: string | null;
  worked_day?: string | null;
  source?: 'manuel' | 'automatique' | string;
  status?: 'bruillon' | 'valide' | 'rejete' | string;
  motif_rejet?: string | null;
  created_at?: string;
  updated_at?: string;
  updated_by?: string;
}

// Ajout pour groupe(s) dynamiques
interface EmployeeGroup { id: string | number; name: string }

export default function PointageDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<PointageDetails | null>(null);
  const [employeeGroups, setEmployeeGroups] = useState<EmployeeGroup[]>([]);

  useEffect(() => {
    let mounted = true;
    apiClient
      .get(apiRoutes.admin.pointages.show(id))
      .then((res) => {
        const d = res.data?.data || null;
        setData(d);
        // Charger les groupes de l'employé
        if (d?.employeeId) {
          apiClient.get(apiRoutes.admin.groups.groupByEmployee(d.employeeId)).then((gRes) => {
            if (mounted) setEmployeeGroups((gRes.data?.data || []).map((g: any) => ({ id: g.id, name: g.name ?? g.label ?? `Groupe ${g.id}` })));
          }).catch(() => { if (mounted) setEmployeeGroups([]); });
        } else {
          setEmployeeGroups([]);
        }
      })
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

  return (
    <PageContainer scrollable>
      <div className='flex flex-1 flex-col space-y-6'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div>
              <h1 className='text-2xl font-bold tracking-tight'>
                Détails du pointage
              </h1>
              {data?.id && (
                <p className='text-muted-foreground text-sm'>Réf. #{data.id}</p>
              )}
            </div>
          </div>
          <div className='flex items-center gap-2'>
            <Button
              variant='secondary'
              onClick={() => router.push('/admin/pointages')}
            >
              <ArrowLeft /> Retour aux pointages
            </Button>
            <Button
              variant='outline'
              onClick={() => router.push(`/admin/pointages/${id}/modifier`)}
            >
              Modifier
            </Button>
          </div>
        </div>

        <Card className='shadow-sm'>
          <CardHeader className=''>
            <CardTitle>Résumé</CardTitle>
          </CardHeader>
          <CardContent className=''>
            {loading ? (
              <div className='grid animate-pulse grid-cols-1 gap-4 md:grid-cols-2'>
                <div className='rounded-lg border p-3'>
                  <div className='bg-muted mb-2 h-4 w-28 rounded'></div>
                  <div className='bg-muted mb-1 h-5 w-48 rounded'></div>
                  <div className='bg-muted h-3 w-24 rounded'></div>
                </div>
                <div className='rounded-lg border p-3'>
                  <div className='bg-muted mb-2 h-4 w-20 rounded'></div>
                  <div className='bg-muted h-5 w-40 rounded'></div>
                </div>
                <div className='rounded-lg border p-3'>
                  <div className='bg-muted mb-2 h-4 w-20 rounded'></div>
                  <div className='bg-muted h-5 w-40 rounded'></div>
                </div>
                <div className='rounded-lg border p-3'>
                  <div className='bg-muted mb-2 h-4 w-20 rounded'></div>
                  <div className='bg-muted h-5 w-32 rounded'></div>
                </div>
                <div className='rounded-lg border p-3'>
                  <div className='bg-muted mb-2 h-4 w-16 rounded'></div>
                  <div className='bg-muted h-7 w-24 rounded'></div>
                </div>
                <div className='rounded-lg border p-3'>
                  <div className='bg-muted mb-2 h-4 w-16 rounded'></div>
                  <div className='bg-muted h-7 w-24 rounded'></div>
                  <div className='bg-muted mt-2 h-3 w-48 rounded'></div>
                </div>
                <div className='rounded-lg border p-3 md:col-span-2'>
                  <div className='bg-muted mb-2 h-4 w-40 rounded'></div>
                  <div className='bg-muted h-4 w-64 rounded'></div>
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
                  {/* Affichage du/des groupe(s) */}
                  <div className='text-muted-foreground mt-1 text-xs'>
                    Groupe{employeeGroups.length > 1 ? 's' : ''}: {employeeGroups.length > 0 ? employeeGroups.map((g, i) => <span key={g.id} className='font-medium'>{g.name}{i < employeeGroups.length - 1 ? ', ' : ''}</span>) : '—'}
                  </div>
                </div>
                <div className='rounded-lg border p-3'>
                  <div className='mb-1 flex items-center gap-2 text-sm font-medium'>
                    <CalendarDays className='h-4 w-4' /> Entrée
                  </div>
                  <div className='text-foreground'>
                    {data.check_in
                      ? format(new Date(data.check_in), 'yyyy-MM-dd HH:mm')
                      : '—'}
                  </div>
                </div>
                <div className='rounded-lg border p-3'>
                  <div className='mb-1 flex items-center gap-2 text-sm font-medium'>
                    <CalendarDays className='h-4 w-4' /> Sortie
                  </div>
                  <div className='text-foreground'>
                    {data.check_out
                      ? format(new Date(data.check_out), 'yyyy-MM-dd HH:mm')
                      : '—'}
                  </div>
                </div>
                <div className='rounded-lg border p-3'>
                  <div className='mb-1 flex items-center gap-2 text-sm font-medium'>
                    <CalendarDays className='h-4 w-4' /> Jour presté
                  </div>
                  <div className='text-foreground'>
                    {data.worked_day || '—'}
                  </div>
                </div>
                <div className='rounded-lg border p-3'>
                  <div className='mb-1 flex items-center gap-2 text-sm font-medium'>
                    <Clock className='h-4 w-4' /> Durée
                  </div>
                  <div className='text-foreground'>
                    {estimatedMinutes != null
                      ? `${estimatedMinutes} minutes`
                      : '—'}
                  </div>
                </div>
                {/* Suppression du bloc Statut */}
                {/* Source */}
                <div className='rounded-lg border p-3'>
                  <div className='mb-1 text-sm font-medium'>Source</div>
                  {data.source ? (
                    <span className={`inline-block rounded px-2 py-1 text-xs font-semibold ${data.source === 'automatique' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>{data.source === 'automatique' ? 'Automatique' : 'Manuel'}</span>
                  ) : (
                    <span className='text-muted-foreground'>—</span>
                  )}
                </div>
                <div className='rounded-lg border p-3'>
                  <div className='mb-1 text-sm font-medium'>Dernière mise à jour</div>
                  <div className='text-muted-foreground text-sm'>
                    {data.updated_at
                      ? format(new Date(data.updated_at), 'yyyy-MM-dd HH:mm')
                      : '—'}{' '}
                    par {data.updated_by || '—'}
                  </div>
                </div>
              </div>
            ) : (
              <div className='text-muted-foreground'>Introuvable</div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
