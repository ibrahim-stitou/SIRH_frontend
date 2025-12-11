import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { NotebookText, Plus, Edit, Trash2, Building2, Calendar, FileText } from 'lucide-react';
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
  const list: ExperienceItem[] = Array.isArray(experiences) ? experiences : experiences ? [experiences] as any : [];

  const fmt = (d?: string) => (d ? d : '—');

  return (
    <AnimatedTabContent active={active}>
      <Card className="p-6 space-y-4 border-l-4 border-l-primary">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <NotebookText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Expériences professionnelles</h3>
              <p className="text-xs text-muted-foreground">Historique des postes et missions</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="gap-2" onClick={onAdd}>
            <Plus className="h-4 w-4" />
            Ajouter
          </Button>
        </div>

        {list.length > 0 ? (
          <div className="space-y-3">
            {list.map((exp, idx) => (
              <div key={idx} className="p-4 rounded-lg border bg-muted/30 space-y-2 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">Expérience {idx + 1}</Badge>
                      <span className="font-medium text-sm">{exp.title || '—'}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 opacity-70" />
                        <span>{exp.company || '—'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 opacity-70" />
                        <span>{fmt(exp.startDate)} → {fmt(exp.endDate)}</span>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="text-muted-foreground">Description: </span>
                        <span>{exp.description || '—'}</span>
                      </div>

                      {/* Documents section */}
                      {exp.documents && exp.documents.length > 0 && (
                        <div className="sm:col-span-2 pt-2 border-t">
                          <div className="flex items-center gap-2 mb-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Documents ({exp.documents.length})</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {exp.documents.map((doc: any, docIdx: number) => (
                              <div key={docIdx} className="flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded">
                                <FileText className="h-3 w-3" />
                                <span className="max-w-[150px] truncate">{doc.fileName}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={() => onEdit(idx)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(idx)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <NotebookText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-sm text-muted-foreground mb-4">Aucune expérience enregistrée</p>
            <Button variant="outline" onClick={onAdd} className="gap-2">
              <Plus className="h-4 w-4" />
              Ajouter une expérience
            </Button>
          </div>
        )}
      </Card>
    </AnimatedTabContent>
  );
};

