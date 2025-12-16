'use client';

import React, { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SelectField } from '@/components/custom/SelectField';
import { DatePickerField } from '@/components/custom/DatePickerField';
import { useForm } from 'react-hook-form';
import { Plus, Pencil, Trash2, ShieldCheck, HeartHandshake } from 'lucide-react';

export interface SocialContributionItem {
  type: string; // CNSS, AMO, CIMR, RCAR, Mutuelle
  code?: string;
  affiliationNumber?: string;
  employeeRatePct?: number;
  employerRatePct?: number;
  startDate?: string;
  endDate?: string;
  providerName?: string; // for Mutuelle
}

interface Props {
  items: SocialContributionItem[];
  onAdd: (item: SocialContributionItem) => Promise<void> | void;
  onUpdate: (index: number, item: SocialContributionItem) => Promise<void> | void;
  onDelete: (index: number) => Promise<void> | void;
  mutuellesList?: Array<{ code: string; name: string; defaultRates?: { employeePct: number; employerPct: number } }>;
}

export default function SocialContributionsManager({ items = [], onAdd, onUpdate, onDelete, mutuellesList = [] }: Props) {
  const [open, setOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const form = useForm<SocialContributionItem>({
    defaultValues: {
      type: 'CNSS',
      code: 'CNSS',
      affiliationNumber: '',
      employeeRatePct: undefined,
      employerRatePct: undefined,
      startDate: '',
      endDate: '',
      providerName: ''
    }
  });

  const typeOptions = useMemo(() => {
    const base = [
      { label: 'CNSS', value: 'CNSS' },
      { label: 'AMO', value: 'AMO' },
      { label: 'CIMR', value: 'CIMR' },
      { label: 'RCAR', value: 'RCAR' },
      { label: 'Mutuelle', value: 'Mutuelle' }
    ];
    return base;
  }, []);

  const handleOpenCreate = () => {
    setEditingIndex(null);
    form.reset({ type: 'CNSS', code: 'CNSS' });
    setOpen(true);
  };

  const handleOpenEdit = (idx: number) => {
    setEditingIndex(idx);
    form.reset(items[idx]);
    setOpen(true);
  };

  const handleSubmit = async () => {
    const vals = form.getValues();
    const toNum = (v: any) => (v === '' || v == null ? undefined : Number(v));
    const payload: SocialContributionItem = {
      ...vals,
      code: vals.code || vals.type,
      employeeRatePct: toNum(vals.employeeRatePct),
      employerRatePct: toNum(vals.employerRatePct)
    };
    if (editingIndex == null) await onAdd(payload);
    else await onUpdate(editingIndex, payload);
    setOpen(false);
    setEditingIndex(null);
  };

  const legend = (
    <div className='flex items-center gap-2 text-xs text-muted-foreground'>
      <ShieldCheck className='h-4 w-4' />
      <span>Assurance & Mutuelle</span>
    </div>
  );

  return (
    <Card className='p-4'>
      <div className='mb-3 flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <HeartHandshake className='text-primary h-5 w-5' />
          <h3 className='text-base font-semibold'>Assurance & Mutuelle</h3>
          {legend}
        </div>
        <Button size='sm' className='gap-1' onClick={handleOpenCreate}>
          <Plus className='h-4 w-4' /> Ajouter
        </Button>
      </div>

      <div className='overflow-auto rounded border'>
        <table className='w-full text-sm'>
          <thead>
            <tr className='bg-muted/40'>
              <th className='px-2 py-2 text-left'>Type</th>
              <th className='px-2 py-2 text-left'>Code</th>
              <th className='px-2 py-2 text-left'>N° Affiliation</th>
              <th className='px-2 py-2 text-left'>Taux Emp.</th>
              <th className='px-2 py-2 text-left'>Taux Empl.</th>
              <th className='px-2 py-2 text-left'>Début</th>
              <th className='px-2 py-2 text-left'>Fin</th>
              <th className='px-2 py-2 text-left'>Fournisseur</th>
              <th className='px-2 py-2 text-left'>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td className='text-muted-foreground px-2 py-3 text-center' colSpan={9}>Aucune ligne</td>
              </tr>
            ) : (
              items.map((it, idx) => (
                <tr key={idx} className='border-b'>
                  <td className='px-2 py-1'>
                    <Badge variant='secondary'>{it.type}</Badge>
                  </td>
                  <td className='px-2 py-1'>{it.code || '—'}</td>
                  <td className='px-2 py-1'>{it.affiliationNumber || '—'}</td>
                  <td className='px-2 py-1'>{it.employeeRatePct ?? '—'}%</td>
                  <td className='px-2 py-1'>{it.employerRatePct ?? '—'}%</td>
                  <td className='px-2 py-1'>{it.startDate || '—'}</td>
                  <td className='px-2 py-1'>{it.endDate || '—'}</td>
                  <td className='px-2 py-1'>{it.providerName || (it.type === 'Mutuelle' ? '—' : '')}</td>
                  <td className='px-2 py-1'>
                    <div className='flex items-center gap-1'>
                      <Button variant='ghost' size='sm' onClick={() => handleOpenEdit(idx)}>
                        <Pencil className='h-4 w-4' />
                      </Button>
                      <Button variant='destructive' size='sm' onClick={() => onDelete(idx)}>
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className='max-w-lg'>
          <DialogHeader>
            <DialogTitle>{editingIndex == null ? 'Ajouter une cotisation' : 'Modifier une cotisation'}</DialogTitle>
          </DialogHeader>

          <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
            <div>
              <Label className='mb-1'>Type <span className='text-destructive'>*</span></Label>
              <SelectField name={'type' as any} control={form.control as any} options={typeOptions} placeholder='Sélectionner' />
            </div>
            <div>
              <Label className='mb-1'>Code</Label>
              <Input value={form.watch('code') || ''} onChange={(e) => form.setValue('code', e.target.value)} />
            </div>
            <div className='sm:col-span-2'>
              <Label className='mb-1'>N° Affiliation</Label>
              <Input value={form.watch('affiliationNumber') || ''} onChange={(e) => form.setValue('affiliationNumber', e.target.value)} />
            </div>
            <div>
              <Label className='mb-1'>Taux Employé (%)</Label>
              <Input type='number' step='0.01' value={form.watch('employeeRatePct') ?? ''} onChange={(e) => form.setValue('employeeRatePct', e.target.value as any)} />
            </div>
            <div>
              <Label className='mb-1'>Taux Employeur (%)</Label>
              <Input type='number' step='0.01' value={form.watch('employerRatePct') ?? ''} onChange={(e) => form.setValue('employerRatePct', e.target.value as any)} />
            </div>
            <div>
              <Label className='mb-1'>Début</Label>
              <DatePickerField value={form.watch('startDate') || ''} onChange={(d) => form.setValue('startDate', d || '')} />
            </div>
            <div>
              <Label className='mb-1'>Fin</Label>
              <DatePickerField value={form.watch('endDate') || ''} onChange={(d) => form.setValue('endDate', d || '')} />
            </div>
            {(form.watch('type') === 'Mutuelle') && (
              <div className='sm:col-span-2'>
                <Label className='mb-1'>Fournisseur (Mutuelle)</Label>
                <Input value={form.watch('providerName') || ''} onChange={(e) => form.setValue('providerName', e.target.value)} placeholder='Ex: Mutuelle Générale' />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant='outline' onClick={() => setOpen(false)}>Annuler</Button>
            <Button onClick={handleSubmit}>{editingIndex == null ? 'Ajouter' : 'Enregistrer'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

