import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Plus, Edit, Trash2, Eye, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const filteredDocs = documents.filter(d => d.documentType === documentType);
  const canAddMore = !maxDocuments || filteredDocs.length < maxDocuments;

  return (
    <Card className={cn('p-6 space-y-4 border-l-4', borderColor, className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              {icon}
            </div>
          )}
          <div>
            <h3 className="font-semibold text-lg">{title}</h3>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
        </div>
        {canAddMore && (
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={onAdd}
          >
            <Plus className="h-4 w-4" />
            Ajouter
          </Button>
        )}
      </div>

      {filteredDocs.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredDocs.map((doc, idx) => {
            // Find original index in full documents array
            const originalIndex = documents.findIndex(d => d.id === doc.id ||
              (d.title === doc.title && d.fileName === doc.fileName));

            return (
              <div
                key={doc.id || idx}
                className="group relative rounded-lg border bg-card hover:shadow-lg transition-all overflow-hidden"
              >
                {/* Preview Area - Clickable */}
                <button
                  onClick={() => onPreview(doc)}
                  className="relative w-full p-4 text-left"
                >
                  <div className="aspect-video w-full rounded-md overflow-hidden bg-muted mb-3 relative">
                    {doc.fileName?.match(/\.(png|jpg|jpeg|gif)$/i) ? (
                      <img
                        src={`/images/user/${doc.fileName}`}
                        alt={doc.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FileText className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}

                    {/* Hover overlay for preview */}
                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Eye className="h-6 w-6 text-primary" />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-medium text-sm line-clamp-1">
                        {doc.title}
                      </h4>
                      <Badge variant="outline" className="text-[10px] shrink-0">
                        {(doc.mimeType || 'file').split('/')[1] || 'file'}
                      </Badge>
                    </div>
                    {doc.fileName && (
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {doc.fileName}
                      </p>
                    )}
                  </div>
                </button>

                {/* Action buttons */}
                <div className="absolute top-2 right-2 flex gap-1 bg-background/95 backdrop-blur-sm rounded-md p-1 shadow-sm z-10">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-primary hover:text-primary-foreground"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(originalIndex);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-destructive hover:text-destructive-foreground"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(originalIndex);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 border-2 border-dashed rounded-lg">
          <Upload className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-sm text-muted-foreground mb-3">
            Aucun document ajouté
          </p>
          <Button variant="outline" size="sm" onClick={onAdd} className="gap-2">
            <Plus className="h-4 w-4" />
            Ajouter un document
          </Button>
        </div>
      )}
    </Card>
  );
};

