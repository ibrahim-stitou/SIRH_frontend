import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Plus, Edit, Trash2, Eye } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { AnimatedTabContent } from '../components';

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
  const otherDocuments = documents.filter(d =>
    !d.documentType || d.documentType === 'other'
  );

  return (
    <AnimatedTabContent active={active}>
      <Card className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">
                {t('employeeDetails.sections.documents')}
              </h3>
              <p className="text-xs text-muted-foreground">
                Autres documents (CIN, diplômes et certificats dans leurs sections respectives)
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={onAdd}
          >
            <Plus className="h-4 w-4" />
            {t('common.add')}
          </Button>
        </div>

        {otherDocuments.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {otherDocuments.map((d) => {
              // Find original index in full documents array
              const idx = documents.findIndex(doc => doc.id === d.id);
              return (
              <div key={d.id} className="group relative rounded-lg border bg-card hover:shadow-lg transition-all overflow-hidden">
                {/* Preview Area - Clickable */}
                <button
                  onClick={() => onPreview(d)}
                  className="relative w-full p-4 text-left"
                >
                  <div className="aspect-video w-full rounded-md overflow-hidden bg-muted mb-3 relative">
                    {d.fileName?.match(/\.(png|jpg|jpeg|gif)$/i) ? (
                      <img
                        src={`/images/user/${d.fileName}`}
                        alt={d.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-muted-foreground">
                        PDF
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
                        {d.title}
                      </h4>
                      <Badge variant="outline" className="text-[10px] shrink-0">
                        {(d.mimeType || '').split('/')[1] || 'file'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {d.fileName}
                    </p>
                  </div>
                </button>

                {/* Action buttons - Always visible on top right with solid background */}
                <div className="absolute top-2 right-2 flex gap-1 bg-background/95 backdrop-blur-sm rounded-md p-1 shadow-sm z-10">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-primary hover:text-primary-foreground"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(idx);
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
                      onDelete(idx);
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
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-sm text-muted-foreground">
              {t('employeeDetails.empty.noDocuments')}
            </p>
          </div>
        )}
      </Card>
    </AnimatedTabContent>
  );
};

