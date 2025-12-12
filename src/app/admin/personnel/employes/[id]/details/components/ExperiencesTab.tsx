import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  NotebookText,
  Plus,
  Edit,
  Trash2,
  Building2,
  Calendar,
  FileText
} from 'lucide-react';
import { AnimatedTabContent } from '../components';

export interface ExperienceItem {
  title: string;
  company?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  documents?: { fileName: string; mimeType?: string; size?: number }[];
}

interface ExperiencesTabProps {
  active: boolean;
  experiences?: ExperienceItem[] | null;
  onAdd: () => void;
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
}

export const ExperiencesTab: React.FC<ExperiencesTabProps> = ({
  active,
  experiences = [],
  onAdd,
  onEdit,
  onDelete
}) => {
  const list: ExperienceItem[] = Array.isArray(experiences)
    ? experiences
    : experiences
      ? ([experiences] as any)
      : [];

  const fmt = (d?: string) => (d ? d : '—');

  return (
    <AnimatedTabContent active={active}>
      <Card className='border-l-primary space-y-4 border-l-4 p-6'>
        <div className='mb-4 flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg'>
              <NotebookText className='text-primary h-5 w-5' />
            </div>
            <div>
              <h3 className='text-lg font-semibold'>
                Expériences professionnelles
              </h3>
              <p className='text-muted-foreground text-xs'>
                Historique des postes et missions
              </p>
            </div>
          </div>
          <Button variant='outline' size='sm' className='gap-2' onClick={onAdd}>
            <Plus className='h-4 w-4' />
            Ajouter
          </Button>
        </div>

        {list.length > 0 ? (
          <div className='space-y-3'>
            {list.map((exp, idx) => (
              <div
                key={idx}
                className='bg-muted/30 space-y-2 rounded-lg border p-4 transition-shadow hover:shadow-md'
              >
                <div className='flex items-start justify-between gap-2'>
                  <div className='flex-1 space-y-2'>
                    <div className='flex items-center gap-2'>
                      <Badge variant='secondary' className='text-xs'>
                        Expérience {idx + 1}
                      </Badge>
                      <span className='text-sm font-medium'>
                        {exp.title || '—'}
                      </span>
                    </div>
                    <div className='grid grid-cols-1 gap-4 text-sm sm:grid-cols-2'>
                      <div className='flex items-center gap-2'>
                        <Building2 className='h-4 w-4 opacity-70' />
                        <span>{exp.company || '—'}</span>
                      </div>
                      <div className='flex items-center gap-2'>
                        <Calendar className='h-4 w-4 opacity-70' />
                        <span>
                          {fmt(exp.startDate)} → {fmt(exp.endDate)}
                        </span>
                      </div>
                      <div className='sm:col-span-2'>
                        <span className='text-muted-foreground'>
                          Description:{' '}
                        </span>
                        <span>{exp.description || '—'}</span>
                      </div>

                      {/* Documents section */}
                      {exp.documents && exp.documents.length > 0 && (
                        <div className='border-t pt-2 sm:col-span-2'>
                          <div className='mb-2 flex items-center gap-2'>
                            <FileText className='text-muted-foreground h-4 w-4' />
                            <span className='text-sm font-medium'>
                              Documents ({exp.documents.length})
                            </span>
                          </div>
                          <div className='flex flex-wrap gap-2'>
                            {exp.documents.map((doc: any, docIdx: number) => (
                              <div
                                key={docIdx}
                                className='bg-muted flex items-center gap-1 rounded px-2 py-1 text-xs'
                              >
                                <FileText className='h-3 w-3' />
                                <span className='max-w-[150px] truncate'>
                                  {doc.fileName}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className='flex items-center gap-1'>
                    <Button
                      variant='ghost'
                      size='icon'
                      onClick={() => onEdit(idx)}
                    >
                      <Edit className='h-4 w-4' />
                    </Button>
                    <Button
                      variant='ghost'
                      size='icon'
                      onClick={() => onDelete(idx)}
                    >
                      <Trash2 className='text-destructive h-4 w-4' />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className='rounded-lg border-2 border-dashed py-12 text-center'>
            <NotebookText className='text-muted-foreground/50 mx-auto mb-4 h-12 w-12' />
            <p className='text-muted-foreground mb-4 text-sm'>
              Aucune expérience enregistrée
            </p>
            <Button variant='outline' onClick={onAdd} className='gap-2'>
              <Plus className='h-4 w-4' />
              Ajouter une expérience
            </Button>
          </div>
        )}
      </Card>
    </AnimatedTabContent>
  );
};
