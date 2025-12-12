import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Plus, Edit, Trash2, Eye } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { AnimatedTabContent } from '../components';
import Image from 'next/image';

interface Document {
  id: string;
  title: string;
  fileName?: string;
  mimeType?: string;
  size?: number;
  documentType?: 'cin' | 'certificate' | 'diploma' | 'experience' | 'other';
}

interface DocumentsTabProps {
  active: boolean;
  documents: Document[];
  onAdd: () => void;
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
  onPreview: (doc: Document) => void;
}

export const DocumentsTab: React.FC<DocumentsTabProps> = ({
  active,
  documents,
  onAdd,
  onEdit,
  onDelete,
  onPreview
}) => {
  const { t } = useLanguage();

  // Filter to show only documents without a specific type or marked as 'other'
  const otherDocuments = documents.filter(
    (d) => !d.documentType || d.documentType === 'other'
  );

  return (
    <AnimatedTabContent active={active}>
      <Card className='space-y-6 p-6'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg'>
              <FileText className='text-primary h-5 w-5' />
            </div>
            <div>
              <h3 className='text-lg font-semibold'>
                {t('employeeDetails.sections.documents')}
              </h3>
              <p className='text-muted-foreground text-xs'>
                Autres documents (CIN, diplômes et certificats dans leurs
                sections respectives)
              </p>
            </div>
          </div>
          <Button variant='outline' size='sm' className='gap-2' onClick={onAdd}>
            <Plus className='h-4 w-4' />
            {t('common.add')}
          </Button>
        </div>

        {otherDocuments.length ? (
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            {otherDocuments.map((d) => {
              // Find original index in full documents array
              const idx = documents.findIndex((doc) => doc.id === d.id);
              return (
                <div
                  key={d.id}
                  className='group bg-card relative overflow-hidden rounded-lg border transition-all hover:shadow-lg'
                >
                  {/* Preview Area - Clickable */}
                  <button
                    onClick={() => onPreview(d)}
                    className='relative w-full p-4 text-left'
                  >
                    <div className='bg-muted relative mb-3 aspect-video w-full overflow-hidden rounded-md'>
                      {d.fileName?.match(/\.(png|jpg|jpeg|gif)$/i) ? (
                        <Image
                          src={`/images/user/${d.fileName}`}
                          alt={d.title}
                          fill
                          className='object-cover transition-transform group-hover:scale-105'
                          sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                        />
                      ) : (
                        <div className='text-muted-foreground flex h-full w-full items-center justify-center text-3xl font-bold'>
                          PDF
                        </div>
                      )}

                      {/* Hover overlay for preview */}
                      <div className='bg-primary/5 absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100'>
                        <Eye className='text-primary h-6 w-6' />
                      </div>
                    </div>

                    {/* Info */}
                    <div className='space-y-1'>
                      <div className='flex items-start justify-between gap-2'>
                        <h4 className='line-clamp-1 text-sm font-medium'>
                          {d.title}
                        </h4>
                        <Badge
                          variant='outline'
                          className='shrink-0 text-[10px]'
                        >
                          {(d.mimeType || '').split('/')[1] || 'file'}
                        </Badge>
                      </div>
                      <p className='text-muted-foreground line-clamp-1 text-xs'>
                        {d.fileName}
                      </p>
                    </div>
                  </button>

                  {/* Action buttons - Always visible on top right with solid background */}
                  <div className='bg-background/95 absolute top-2 right-2 z-10 flex gap-1 rounded-md p-1 shadow-sm backdrop-blur-sm'>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='hover:bg-primary hover:text-primary-foreground h-8 w-8'
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(idx);
                      }}
                    >
                      <Edit className='h-4 w-4' />
                    </Button>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='hover:bg-destructive hover:text-destructive-foreground h-8 w-8'
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(idx);
                      }}
                    >
                      <Trash2 className='h-4 w-4' />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className='rounded-lg border-2 border-dashed py-12 text-center'>
            <FileText className='text-muted-foreground/50 mx-auto mb-4 h-12 w-12' />
            <p className='text-muted-foreground text-sm'>
              {t('employeeDetails.empty.noDocuments')}
            </p>
          </div>
        )}
      </Card>
    </AnimatedTabContent>
  );
};
