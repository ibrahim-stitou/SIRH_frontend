import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Plus, Edit, Trash2, Eye, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

export interface DocumentItem {
  id?: string;
  title: string;
  fileName?: string;
  mimeType?: string;
  size?: number;
  documentType?: 'cin' | 'certificate' | 'diploma' | 'experience' | 'other';
  uploadDate?: string;
}

interface DocumentUploadSectionProps {
  title: string;
  description?: string;
  documents: DocumentItem[];
  documentType: 'cin' | 'certificate' | 'diploma' | 'experience' | 'other';
  onAdd: () => void;
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
  onPreview: (doc: DocumentItem) => void;
  icon?: React.ReactNode;
  className?: string;
  borderColor?: string;
  maxDocuments?: number;
}

export const DocumentUploadSection: React.FC<DocumentUploadSectionProps> = ({
  title,
  description,
  documents,
  documentType,
  onAdd,
  onEdit,
  onDelete,
  onPreview,
  icon,
  className,
  borderColor = 'border-l-primary',
  maxDocuments
}) => {
  // Filter documents by type
  const filteredDocs = documents.filter((d) => d.documentType === documentType);
  const canAddMore = !maxDocuments || filteredDocs.length < maxDocuments;

  return (
    <Card className={cn('space-y-4 border-l-4 p-6', borderColor, className)}>
      <div className='mb-4 flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          {icon && (
            <div className='bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg'>
              {icon}
            </div>
          )}
          <div>
            <h3 className='text-lg font-semibold'>{title}</h3>
            {description && (
              <p className='text-muted-foreground text-xs'>{description}</p>
            )}
          </div>
        </div>
        {canAddMore && (
          <Button variant='outline' size='sm' className='gap-2' onClick={onAdd}>
            <Plus className='h-4 w-4' />
            Ajouter
          </Button>
        )}
      </div>

      {filteredDocs.length > 0 ? (
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
          {filteredDocs.map((doc, idx) => {
            // Find original index in full documents array
            const originalIndex = documents.findIndex(
              (d) =>
                d.id === doc.id ||
                (d.title === doc.title && d.fileName === doc.fileName)
            );

            return (
              <div
                key={doc.id || idx}
                className='group bg-card relative overflow-hidden rounded-lg border transition-all hover:shadow-lg'
              >
                {/* Preview Area - Clickable */}
                <button
                  onClick={() => onPreview(doc)}
                  className='relative w-full p-4 text-left'
                >
                  <div className='bg-muted relative mb-3 aspect-video w-full overflow-hidden rounded-md'>
                    {doc.fileName?.match(/\.(png|jpg|jpeg|gif)$/i) ? (
                      <Image
                        src={`/images/user/${doc.fileName}`}
                        alt={doc.title}
                        fill
                        className='object-cover transition-transform group-hover:scale-105'
                        sizes='(max-width: 768px) 100vw, 50vw'
                      />
                    ) : (
                      <div className='flex h-full w-full items-center justify-center'>
                        <FileText className='text-muted-foreground h-12 w-12' />
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
                        {doc.title}
                      </h4>
                      <Badge variant='outline' className='shrink-0 text-[10px]'>
                        {(doc.mimeType || 'file').split('/')[1] || 'file'}
                      </Badge>
                    </div>
                    {doc.fileName && (
                      <p className='text-muted-foreground line-clamp-1 text-xs'>
                        {doc.fileName}
                      </p>
                    )}
                  </div>
                </button>

                {/* Action buttons */}
                <div className='bg-background/95 absolute top-2 right-2 z-10 flex gap-1 rounded-md p-1 shadow-sm backdrop-blur-sm'>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='hover:bg-primary hover:text-primary-foreground h-8 w-8'
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(originalIndex);
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
                      onDelete(originalIndex);
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
        <div className='rounded-lg border-2 border-dashed py-8 text-center'>
          <Upload className='text-muted-foreground/50 mx-auto mb-3 h-10 w-10' />
          <p className='text-muted-foreground mb-3 text-sm'>
            Aucun document ajouté
          </p>
          <Button variant='outline' size='sm' onClick={onAdd} className='gap-2'>
            <Plus className='h-4 w-4' />
            Ajouter un document
          </Button>
        </div>
      )}
    </Card>
  );
};
