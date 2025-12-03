import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Plus, Edit, Trash2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { AnimatedTabContent } from '../components';

interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

interface EmergencyContactsTabProps {
  active: boolean;
  contacts?: EmergencyContact[];
  onAdd: () => void;
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
}

export const EmergencyContactsTab: React.FC<EmergencyContactsTabProps> = ({
  active,
  contacts = [],
  onAdd,
  onEdit,
  onDelete
}) => {
  const { t } = useLanguage();

  return (
    <AnimatedTabContent active={active}>
      <Card className="p-6 space-y-4 border-l-4 border-l-primary">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Contacts d&apos;urgence</h3>
              <p className="text-xs text-muted-foreground">
                Personnes à contacter en cas d&apos;urgence
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

        {contacts.length > 0 ? (
          <div className="space-y-3">
            {contacts.map((contact, index) => (
              <div
                key={index}
                className="p-4 rounded-lg border bg-muted/30 space-y-2 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        Contact {index + 1}
                      </Badge>
                      <span className="font-medium text-sm">{contact.name}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Téléphone: </span>
                        <span>{contact.phone}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Relation: </span>
                        <span>{contact.relationship}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(index)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(index)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-sm text-muted-foreground mb-4">
              Aucun contact d&apos;urgence enregistré
            </p>
            <Button variant="outline" onClick={onAdd} className="gap-2">
              <Plus className="h-4 w-4" />
              Ajouter un contact
            </Button>
          </div>
        )}
      </Card>
    </AnimatedTabContent>
  );
};

