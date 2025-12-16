'use client';

import React, { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2 } from 'lucide-react';

export type SocialContributionItem = {
  type: string; // CNSS/AMO/CIMR/Mutuelle/RCAR...
  code?: string;
  affiliationNumber?: string;
  employeeRatePct?: number;
  employerRatePct?: number;
  startDate?: string;
  endDate?: string;
  providerName?: string; // for Mutuelle
  notes?: string;
};

interface Props {
  active?: boolean;
  items: SocialContributionItem[] | undefined;
  onAdd: () => void;
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
}

export function SocialContributionsTab({
  active,
  items,
  onAdd,
  onEdit,
  onDelete
}: Props) {
  const list = useMemo(() => items || [], [items]);

  return (
    <div className={active ? 'block' : 'hidden'}>
      <Card className='p-4'>
        <div className='mb-3 flex items-center justify-between'>
          <h3 className='text-base font-semibold'>Assurances & Mutuelles</h3>
          <Button onClick={onAdd} className='gap-2'>
            <Plus className='h-4 w-4' /> Ajouter
          </Button>
        </div>

        {list.length === 0 ? (
          <div className='text-muted-foreground text-sm'>
            Aucune cotisation sociale. Ajoutez CNSS, AMO, CIMR, Mutuelle...
          </div>
        ) : (
          <>
            {/* Card list for small screens */}
            <div className='space-y-3 md:hidden'>
              {list.map((it, idx) => (
                <div key={idx} className='rounded-md border p-3'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-sm font-semibold'>{it.type}</p>
                      <p className='text-muted-foreground text-xs'>
                        Code: {it.code || '—'}
                      </p>
                    </div>
                    <div className='flex gap-1'>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => onEdit(idx)}
                      >
                        <Edit className='h-4 w-4' />
                      </Button>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => onDelete(idx)}
                      >
                        <Trash2 className='text-destructive h-4 w-4' />
                      </Button>
                    </div>
                  </div>
                  <div className='mt-2 grid grid-cols-2 gap-2'>
                    <div>
                      <p className='text-muted-foreground text-xs'>
                        Affiliation
                      </p>
                      <p className='text-sm'>{it.affiliationNumber || '—'}</p>
                    </div>
                    <div>
                      <p className='text-muted-foreground text-xs'>
                        Fournisseur
                      </p>
                      <p className='text-sm'>
                        {it.providerName || (it.type === 'Mutuelle' ? '—' : '')}
                      </p>
                    </div>
                    <div>
                      <p className='text-muted-foreground text-xs'>Employé %</p>
                      <p className='text-sm'>{it.employeeRatePct ?? '—'}</p>
                    </div>
                    <div>
                      <p className='text-muted-foreground text-xs'>
                        Employeur %
                      </p>
                      <p className='text-sm'>{it.employerRatePct ?? '—'}</p>
                    </div>
                    <div>
                      <p className='text-muted-foreground text-xs'>Début</p>
                      <p className='text-sm'>{it.startDate || '—'}</p>
                    </div>
                    <div>
                      <p className='text-muted-foreground text-xs'>Fin</p>
                      <p className='text-sm'>{it.endDate || '—'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Table for md+ screens */}
            <div className='hidden md:block'>
              <div className='overflow-x-auto'>
                <table className='w-full border-collapse text-sm'>
                  <thead>
                    <tr className='border-b'>
                      <th className='p-2 text-left'>Type</th>
                      <th className='p-2 text-left'>Code</th>
                      <th className='p-2 text-left'>Affiliation</th>
                      <th className='p-2 text-left'>Employé %</th>
                      <th className='p-2 text-left'>Employeur %</th>
                      <th className='p-2 text-left'>Début</th>
                      <th className='p-2 text-left'>Fin</th>
                      <th className='p-2 text-left'>Fournisseur</th>
                      <th className='p-2 text-left'>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.map((it, idx) => (
                      <tr key={idx} className='border-b'>
                        <td className='p-2'>{it.type}</td>
                        <td className='p-2'>{it.code || '—'}</td>
                        <td className='p-2'>{it.affiliationNumber || '—'}</td>
                        <td className='p-2'>{it.employeeRatePct ?? '—'}</td>
                        <td className='p-2'>{it.employerRatePct ?? '—'}</td>
                        <td className='p-2'>{it.startDate || '—'}</td>
                        <td className='p-2'>{it.endDate || '—'}</td>
                        <td className='p-2'>
                          {it.providerName ||
                            (it.type === 'Mutuelle' ? '—' : '')}
                        </td>
                        <td className='p-2'>
                          <div className='flex gap-1'>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => onEdit(idx)}
                            >
                              <Edit className='h-4 w-4' />
                            </Button>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => onDelete(idx)}
                            >
                              <Trash2 className='text-destructive h-4 w-4' />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
