import React from 'react';
import { createFrais, updateFrais, getFrais } from '@/services/frais';
import type { NoteDeFrais, FraisLine } from '@/types/frais';
import { noteDeFraisSchema } from '@/schemas/frais';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SelectField } from '@/components/custom/SelectField';
import apiClient from '@/lib/api';
import { apiRoutes } from '@/config/apiRoutes';

function emptyLine(): FraisLine {
  return { id: Date.now(), date: new Date().toISOString().slice(0,10), category: 'Transport', amount: 0, currency: 'MAD', attachments: [], transportMode: null, route: null };
}

export default function FraisForm({ id }: { id?: number }) {
  const [note, setNote] = React.useState<Partial<NoteDeFrais>>({
    subject: '', startDate: '', endDate: '', currency: 'MAD', lines: [], employeeId: undefined, matricule: '', status: 'draft'
  });
  const [error, setError] = React.useState<string | null>(null);
  const [employees, setEmployees] = React.useState<{ label: string; value: number }[]>([]);

  React.useEffect(() => {
    let mounted = true;
    apiClient.get(apiRoutes.admin.employees.simpleList).then((res) => {
      const opts = (res.data?.data || []).map((e: any) => ({ label: `${e.firstName} ${e.lastName}${e.matricule ? ' — ' + e.matricule : ''}`, value: e.id }));
      if (mounted) setEmployees(opts);
    }).catch(() => void 0);
    if (id) {
      getFrais(id).then((data) => setNote(data)).catch((e) => setError(String(e?.message || e)));
    }
    return () => { mounted = false; };
  }, [id]);

  function addLine() {
    setNote((n: Partial<NoteDeFrais>) => ({ ...n, lines: [ ...(n.lines || []), emptyLine() ] }));
  }
  function updateLine(lineId: number, patch: Partial<FraisLine>) {
    setNote((n: Partial<NoteDeFrais>) => ({ ...n, lines: (n.lines || []).map((l: FraisLine) => l.id === lineId ? { ...l, ...patch } : l) }));
  }
  async function save() {
    setError(null);
    const parsed = noteDeFraisSchema.safeParse({ ...note, lines: note.lines || [] });
    if (!parsed.success) { setError('Validation error'); return; }
    try {
      const payload = parsed.data as NoteDeFrais;
      if (!id) await createFrais(payload);
      else await updateFrais(id, payload);
    } catch (e: any) {
      setError(e.message);
    }
  }

  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div className='space-y-2'>
          <label className='text-sm font-medium'>Employé</label>
          <SelectField
            options={employees}
            value={note.employeeId ?? null}
            onChange={(v) => setNote({ ...note, employeeId: Number(v) })}
            placeholder='Sélectionner un employé'
          />
        </div>
        <div className='space-y-2'>
          <label className='text-sm font-medium'>Objet</label>
          <Input value={note.subject || ''} onChange={e => setNote({ ...note, subject: e.target.value })} />
        </div>
        <div className='space-y-2'>
          <label className='text-sm font-medium'>Date début</label>
          <Input type='date' value={note.startDate || ''} onChange={e => setNote({ ...note, startDate: e.target.value })} />
        </div>
        <div className='space-y-2'>
          <label className='text-sm font-medium'>Date fin</label>
          <Input type='date' value={note.endDate || ''} onChange={e => setNote({ ...note, endDate: e.target.value })} />
        </div>
        <div className='space-y-2'>
          <label className='text-sm font-medium'>Devise</label>
          <Input value={note.currency || 'MAD'} onChange={e => setNote({ ...note, currency: e.target.value })} />
        </div>
      </div>

      <div className='flex items-center justify-between'>
        <h4 className='text-base font-semibold'>Lignes de frais</h4>
        <Button variant='outline' onClick={addLine}>Ajouter une ligne</Button>
      </div>

      <div className='space-y-3'>
        {(note.lines || []).map((l: FraisLine) => (
          <div key={l.id} className='rounded-md border p-3 grid grid-cols-1 md:grid-cols-6 gap-3'>
            <div className='space-y-2'>
              <label className='text-sm'>Date</label>
              <Input type='date' value={l.date} onChange={e => updateLine(l.id, { date: e.target.value })} />
            </div>
            <div className='space-y-2 md:col-span-2'>
              <label className='text-sm'>Catégorie</label>
              <SelectField
                options={[
                  { label: 'Transport', value: 'Transport' },
                  { label: 'Restauration', value: 'Restauration' },
                  { label: 'Hôtel', value: 'Hôtel' },
                  { label: 'Autre', value: 'Autre' }
                ]}
                value={l.category}
                onChange={(v) => updateLine(l.id, { category: v as any })}
                placeholder='Sélectionner une catégorie'
              />
            </div>
            <div className='space-y-2'>
              <label className='text-sm'>Montant</label>
              <Input type='number' value={l.amount} onChange={e => updateLine(l.id, { amount: Number(e.target.value) })} />
            </div>
            <div className='space-y-2'>
              <label className='text-sm'>Devise</label>
              <Input value={l.currency} onChange={e => updateLine(l.id, { currency: e.target.value })} />
            </div>
            <div className='space-y-2 md:col-span-2'>
              <label className='text-sm'>Commentaire</label>
              <Input value={l.comment || ''} onChange={e => updateLine(l.id, { comment: e.target.value })} />
            </div>
          </div>
        ))}
      </div>

      <div className='flex justify-end'>
        <Button onClick={save}>Enregistrer</Button>
      </div>

      {error && <div className='text-red-600 text-sm'>{error}</div>}
    </div>
  );
}
