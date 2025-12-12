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
  CIN?: string;
  birthDate?: string;
  cin?: string; // add lowercase support
}

interface EmergencyContactsTabProps {
  active: boolean;
  contacts?: EmergencyContact[] | EmergencyContact | null;
  onAdd: () => void;
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
}

export const PeploeInCharge: React.FC<EmergencyContactsTabProps> = ({
  active,
  contacts = [],
  onAdd,
  onEdit,
  onDelete
}) => {
  const { t } = useLanguage();

  // Normalize to array if server returns a single object
  const contactList: EmergencyContact[] = Array.isArray(contacts)
    ? contacts
    : contacts
      ? [contacts]
      : [];

  return (
    <AnimatedTabContent active={active}>
      <Card className='border-l-primary space-y-4 border-l-4 p-6'>
        <div className='mb-4 flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg'>
              <Users className='text-primary h-5 w-5' />
            </div>
            <div>
              <h3 className='text-lg font-semibold'>Personnes en charge</h3>
              <p className='text-muted-foreground text-xs'>
                Personnes responsables ou à contacter
              </p>
            </div>
          </div>
          <Button variant='outline' size='sm' className='gap-2' onClick={onAdd}>
            <Plus className='h-4 w-4' />
            {t('common.add')}
          </Button>
        </div>

        {contactList.length > 0 ? (
          <div className='space-y-3'>
            {contactList.map((contact, index) => (
              <div
                key={index}
                className='bg-muted/30 space-y-2 rounded-lg border p-4 transition-shadow hover:shadow-md'
              >
                <div className='flex items-start justify-between gap-2'>
                  <div className='flex-1 space-y-2'>
                    <div className='flex items-center gap-2'>
                      <Badge variant='secondary' className='text-xs'>
                        Personne {index + 1}
                      </Badge>
                      <span className='text-sm font-medium'>
                        {contact.name}
                      </span>
                    </div>
                    <div className='grid grid-cols-2 gap-4 text-sm'>
                      <div>
                        <span className='text-muted-foreground'>
                          Téléphone:{' '}
                        </span>
                        <span>{contact.phone || '—'}</span>
                      </div>
                      <div>
                        <span className='text-muted-foreground'>
                          Relation:{' '}
                        </span>
                        <span>{contact.relationship || '—'}</span>
                      </div>
                      <div>
                        <span className='text-muted-foreground'>CIN: </span>
                        <span>{contact.cin || contact.CIN || '—'}</span>
                      </div>
                      <div>
                        <span className='text-muted-foreground'>
                          Date de naissance:{' '}
                        </span>
                        <span>{contact.birthDate || '—'}</span>
                      </div>
                    </div>
                  </div>
                  <div className='flex items-center gap-1'>
                    <Button
                      variant='ghost'
                      size='icon'
                      onClick={() => onEdit(index)}
                    >
                      <Edit className='h-4 w-4' />
                    </Button>
                    <Button
                      variant='ghost'
                      size='icon'
                      onClick={() => onDelete(index)}
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
            <Users className='text-muted-foreground/50 mx-auto mb-4 h-12 w-12' />
            <p className='text-muted-foreground mb-4 text-sm'>
              Aucune personne en charge enregistrée
            </p>
            <Button variant='outline' onClick={onAdd} className='gap-2'>
              <Plus className='h-4 w-4' />
              Ajouter une personne
            </Button>
          </div>
        )}
      </Card>
    </AnimatedTabContent>
  );
};
