'use client';
import { useEffect, useMemo, useState } from 'react';
import PageContainer from '@/components/layout/page-container';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { apiRoutes } from '@/config/apiRoutes';
import apiClient from '@/lib/api';
import { toast } from 'sonner';
import { ArrowLeft, Save, Clock } from 'lucide-react';
import { DatePickerField } from '@/components/custom/DatePickerField';

interface EmployeeOption { label: string | undefined; value: string | undefined; }

interface PointageForm {
  employeeId: number | string | null;
  check_in: string | null; // YYYY-MM-DDTHH:mm
  check_out: string | null; // YYYY-MM-DDTHH:mm
  source: 'manuel' | 'automatique';
  status?: 'bruillon' | 'valide' | 'rejete';
}

export default function ModifierPointagePage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [form, setForm] = useState<PointageForm>({
    employeeId: null,
    check_in: null,
    check_out: null,
    source: 'manuel',
    status: 'bruillon'
  });

  useEffect(() => {
    let mounted = true;
    Promise.all([
      apiClient.get(apiRoutes.admin.employees.simpleList),
      apiClient.get(apiRoutes.admin.pointages.show(id))
    ])
      .then(([empRes, ptgRes]) => {
        if (!mounted) return;
        const opts = (empRes.data?.data || []).map((e: any) => ({
          label: `${e.firstName} ${e.lastName}${e.matricule ? ' — ' + e.matricule : ''}`,
          value: e.id
        }));
        setEmployees(opts);
        const row = ptgRes.data?.data;
        setForm({
          employeeId: row?.employeeId ?? null,
          check_in: row?.check_in ?? null,
          check_out: row?.check_out ?? null,
          source: row?.source === 'automatique' ? 'automatique' : 'manuel',
          status: row?.status || 'bruillon'
        });
      })
      .catch((e) => {
        toast.error(e?.response?.data?.message || 'Erreur de chargement');
      })
      .finally(() => setLoading(false));
    return () => {
      mounted = false;
    };
  }, [id]);

  // DateTimePicker: reuse inline from add page
  function parseDatePart(value?: string | null): string | null {
    if (!value) return null;
    const [d] = String(value).split('T');
    return d || null;
  }
  function parseTimePart(value?: string | null): string | null {
    if (!value) return null;
    const parts = String(value).split('T');
    const time = parts[1] || '';
    return time.length >= 5 ? time.slice(0, 5) : null;
  }
  function combineDateTime(date: string | null, time: string | null): string | null {
    if (!date || !time) return null;
    return `${date}T${time}`;
  }
  function pad2(n: number) { return n.toString().padStart(2, '0'); }
  function parseTime(value?: string | null): { h: number; m: number } {
    if (!value) return { h: 9, m: 0 };
    const [hh, mm] = String(value).split(':');
    const h = Math.min(23, Math.max(0, parseInt(hh || '0', 10)));
    const m = Math.min(59, Math.max(0, parseInt(mm || '0', 10)));
    return { h: isNaN(h) ? 9 : h, m: isNaN(m) ? 0 : m };
  }
  const HOURS = Array.from({ length: 24 }, (_, i) => i);
  const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

  function TimePicker({ value, onChange }: { value?: string | null; onChange: (val: string) => void }) {
    const { h, m } = parseTime(value);
    return (
      <div className='flex items-center gap-2'>
        <Select value={pad2(h)} onValueChange={(v: string) => onChange(`${v}:${pad2(m)}`)}>
          <SelectTrigger className='w-24'>
            <SelectValue placeholder='HH' />
          </SelectTrigger>
          <SelectContent className='max-h-64'>
            {HOURS.map((hh) => (
              <SelectItem key={hh} value={pad2(hh)}>{pad2(hh)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className='text-muted-foreground'>:</span>
        <Select value={pad2(m)} onValueChange={(v: string) => onChange(`${pad2(h)}:${v}`)}>
          <SelectTrigger className='w-24'>
            <SelectValue placeholder='MM' />
          </SelectTrigger>
          <SelectContent className='max-h-64'>
            {MINUTES.map((mm) => (
              <SelectItem key={mm} value={pad2(mm)}>{pad2(mm)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  function DateTimePicker({ value, onChange }: { value?: string | null; onChange: (val: string | null) => void }) {
    const date = parseDatePart(value);
    const time = parseTimePart(value) || '09:00';
    return (
      <div className='grid grid-cols-1 gap-2 md:grid-cols-2'>
        <DatePickerField
          value={date || ''}
          onChange={(d) => onChange(combineDateTime(d, time))}
          placeholder='Sélectionner la date'
        />
        <TimePicker
          value={time}
          onChange={(t) => onChange(combineDateTime(date, t))}
        />
      </div>
    );
  }

  const estimatedMinutes = useMemo(() => {
    if (!form.check_in || !form.check_out) return undefined;
    const di = new Date(form.check_in);
    const doo = new Date(form.check_out);
    if (isNaN(di.getTime()) || isNaN(doo.getTime())) return undefined;
    const diff = (doo.getTime() - di.getTime()) / 60000;
    return diff >= 0 ? Math.round(diff) : undefined;
  }, [form.check_in, form.check_out]);

  const isValid = !!(form.employeeId && (form.check_in || form.check_out));

  const onSave = async () => {
    if (!isValid) {
      toast.error('Veuillez compléter les champs obligatoires');
      return;
    }
    setSaving(true);
    try {
      const worked_minutes = estimatedMinutes ?? undefined;
      await apiClient.put(apiRoutes.admin.pointages.update(id), {
        employeeId: form.employeeId,
        check_in: form.check_in,
        check_out: form.check_out,
        source: form.source,
        status: form.status,
        worked_minutes
      });
      toast.success('Pointage modifié');
      router.push('/admin/pointages');
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Erreur lors de la sauvegarde');
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
              <h1 className='text-2xl font-bold tracking-tight'>Modifier le pointage</h1>
              <p className='text-muted-foreground text-sm'>MAJ des informations d&apos;un pointage</p>
            </div>
          </div>
          <div className='flex items-center gap-2'>
            <Button variant='secondary' onClick={()=> router.push('/admin/pointages')}>
              <ArrowLeft /> Retour aux pointages
            </Button>
            <Button onClick={onSave} disabled={!isValid || saving}>
              <Save className='mr-2 h-4 w-4' /> {saving ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
          </div>
        </div>

        <Card className='shadow-sm'>
          <CardHeader className=''>
            <CardTitle>Détails</CardTitle>
          </CardHeader>
          <CardContent className=''>
            {loading ? (
              <div className='space-y-4'>
                <div className='grid grid-cols-1 gap-3 md:grid-cols-2 animate-pulse'>
                  <div>
                    <div className='h-4 w-40 bg-muted rounded mb-2'></div>
                    <div className='h-10 bg-muted rounded'></div>
                  </div>
                  <div>
                    <div className='h-4 w-32 bg-muted rounded mb-2'></div>
                    <div className='h-10 bg-muted rounded'></div>
                  </div>
                  <div>
                    <div className='h-4 w-56 bg-muted rounded mb-2'></div>
                    <div className='grid grid-cols-1 gap-2 md:grid-cols-2'>
                      <div className='h-10 bg-muted rounded'></div>
                      <div className='h-10 bg-muted rounded'></div>
                    </div>
                  </div>
                  <div>
                    <div className='h-4 w-56 bg-muted rounded mb-2'></div>
                    <div className='grid grid-cols-1 gap-2 md:grid-cols-2'>
                      <div className='h-10 bg-muted rounded'></div>
                      <div className='h-10 bg-muted rounded'></div>
                    </div>
                  </div>
                  <div>
                    <div className='h-4 w-24 bg-muted rounded mb-2'></div>
                    <div className='h-10 bg-muted rounded'></div>
                  </div>
                  <div className='md:col-span-2'>
                    <div className='h-4 w-64 bg-muted rounded'></div>
                  </div>
                </div>
              </div>
            ) : (
              <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
                <div>
                  <Label className='mb-1 block'>Employé <span className='text-destructive'>*</span></Label>
                  <Select
                    value={form.employeeId != null ? String(form.employeeId) : undefined}
                    onValueChange={(v) => setForm((s) => ({ ...s, employeeId: isNaN(Number(v)) ? v : Number(v) }))}
                  >
                    <SelectTrigger className='w-full'>
                      <SelectValue placeholder='Choisir un employé' />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((opt) => (
                        <SelectItem key={String(opt.value)} value={String(opt.value)}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                </div>
                <div>
                  <Label className='mb-1 block'>Entrée (date et heure)</Label>
                  <DateTimePicker
                    value={form.check_in}
                    onChange={(val) => setForm((s) => ({ ...s, check_in: val }))}
                  />
                </div>
                <div>
                  <Label className='mb-1 block'>Sortie (date et heure)</Label>
                  <DateTimePicker
                    value={form.check_out}
                    onChange={(val) => setForm((s) => ({ ...s, check_out: val }))}
                  />
                </div>
                <div>
                  <Label className={`mb-1 block`}>Statut</Label>
                  <Select
                    value={form.status || 'bruillon'}
                    disabled={form.status === 'rejete'}
                    onValueChange={(v)=> setForm((s)=> ({...s, status: v as 'bruillon' | 'valide'}))}
                  >
                    <SelectTrigger className='w-full'>
                      <SelectValue placeholder='Sélectionner un statut' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='bruillon'>Brouillon</SelectItem>
                      <SelectItem value='valide'>Validé</SelectItem>
                      <SelectItem value='rejete'>Rejeté</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {estimatedMinutes !== undefined && (
                  <div className='md:col-span-2 flex items-center gap-2 text-sm text-muted-foreground'>
                    <Clock className='h-4 w-4' /> Durée estimée :
                    <span className='font-semibold text-foreground'>{estimatedMinutes}</span> minutes
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
