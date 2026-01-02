import React from 'react';
import { getFrais, validateFrais } from '@/services/frais';
import { NoteDeFrais } from '@/types/frais';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';


export default function FraisDetails({ id }: { id: number }) {
  const [note, setNote] = React.useState<NoteDeFrais | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    getFrais(id).then(setNote).catch(e => setError(e.message));
  }, [id]);

  async function approveTotal() {
    if (!note) return;
    const updated = await validateFrais(id, { action: 'approve_total' });
    setNote(updated);
  }

  if (error) {
    return <div className='text-red-600 text-sm'>{error}</div>;
  }

  if (!note) {
    return <div>Chargement...</div>;
  }

  const statusLabelMap: Record<string, string> = {
    draft: 'Brouillon',
    submitted: 'En attente',
    approved: 'Approuvée',
    approved_partial: 'Approuvée partielle',
    refused: 'Refusée',
    needs_complement: 'Complément requis'
  };

  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <div className='rounded-md border p-4'>
          <div className='text-sm text-muted-foreground'>Numéro</div>
          <div className='text-lg font-semibold'>{note.number}</div>
        </div>
        <div className='rounded-md border p-4'>
          <div className='text-sm text-muted-foreground'>Employé</div>
          <div className='text-lg font-semibold'>{note.matricule}</div>
        </div>
        <div className='rounded-md border p-4'>
          <div className='text-sm text-muted-foreground'>Statut</div>
          <Badge>{statusLabelMap[note.status] || note.status}</Badge>
        </div>
        <div className='rounded-md border p-4 md:col-span-2'>
          <div className='text-sm text-muted-foreground'>Objet</div>
          <div className='text-lg font-semibold'>{note.subject}</div>
        </div>
        <div className='rounded-md border p-4'>
          <div className='text-sm text-muted-foreground'>Période</div>
          <div className='text-lg font-semibold'>{note.startDate} → {note.endDate}</div>
        </div>
        <div className='rounded-md border p-4'>
          <div className='text-sm text-muted-foreground'>Total</div>
          <div className='text-lg font-semibold'>
            {new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 }).format(note.total ?? 0)}
          </div>
        </div>
      </div>

      <div>
        <h4 className='text-base font-semibold mb-3'>Lignes</h4>
        <div className='space-y-3'>
          {note.lines.map(l => (
            <div key={l.id} className='rounded-md border p-3 grid grid-cols-1 md:grid-cols-6 gap-3'>
              <div className='space-y-1'>
                <div className='text-xs text-muted-foreground'>Date</div>
                <div className='font-medium'>{l.date}</div>
              </div>
              <div className='space-y-1'>
                <div className='text-xs text-muted-foreground'>Catégorie</div>
                <div className='font-medium'>{l.category}</div>
              </div>
              <div className='space-y-1'>
                <div className='text-xs text-muted-foreground'>Montant</div>
                <div className='font-medium'>{l.amount} {l.currency}</div>
              </div>
              <div className='space-y-1'>
                <div className='text-xs text-muted-foreground'>Approuvé</div>
                <div className='font-medium'>{l.approvedAmount ?? l.amount}</div>
              </div>
              <div className='md:col-span-2 space-y-1'>
                <div className='text-xs text-muted-foreground'>Commentaire</div>
                <div className='font-medium'>{l.comment || '-'}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className='flex justify-end'>
        <Button onClick={approveTotal}>Approuver total</Button>
      </div>
    </div>
  );
}
