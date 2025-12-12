/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Card } from '@/components/ui/card';
import { IdCard, MapPin, NotebookText, FileText } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { AnimatedTabContent } from '../components';
import EditableInfoRow from './EditableInfoRow';
import { toast } from 'sonner';
import { DocumentUploadSection, DocumentItem } from './DocumentUploadSection';
import { PROFESSIONAL_CATEGORY_OPTIONS } from '../../../create/schema';

interface PersonalTabProps {
  active: boolean;
  employee: any;
  onUpdate: (key: string, value: any) => Promise<void>;
  documents?: DocumentItem[];
  onAddDocument?: (
    documentType: 'cin' | 'certificate' | 'diploma' | 'experience' | 'other'
  ) => void;
  onEditDocument?: (index: number) => void;
  onDeleteDocument?: (index: number) => void;
  onPreviewDocument?: (doc: DocumentItem) => void;
}

export const PersonalTab: React.FC<PersonalTabProps> = ({
  active,
  employee,
  onUpdate,
  documents = [],
  onAddDocument,
  onEditDocument,
  onDeleteDocument,
  onPreviewDocument
}) => {
  const { t } = useLanguage();
  const fullName = employee ? `${employee.firstName} ${employee.lastName}` : '';

  /* eslint-disable @typescript-eslint/no-explicit-any */

  return (
    <AnimatedTabContent active={active}>
      <div className='space-y-4'>
        <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
          {/* Identity Card */}
          <Card className='border-l-primary space-y-4 border-l-4 p-6'>
            <div className='mb-4 flex items-center gap-3'>
              <div className='bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg'>
                <IdCard className='text-primary h-5 w-5' />
              </div>
              <div>
                <h3 className='text-lg font-semibold'>
                  {t('employeeDetails.sections.identity')}
                </h3>
                <p className='text-muted-foreground text-xs'>
                  Informations personnelles
                </p>
              </div>
            </div>
            <div className='space-y-3'>
              <EditableInfoRow
                label={t('employeeDetails.fields.fullName')}
                value={fullName}
                type='text'
                disabled
                onSave={async () => {
                  toast.info('Modifiez prénom/nom séparément');
                }}
              />
              <EditableInfoRow
                label='CIN'
                value={employee?.cin}
                type='text'
                onSave={(v) => onUpdate('cin', v)}
              />
              <EditableInfoRow
                label='Numéro CNSS'
                value={employee?.numero_cnss}
                type='text'
                onSave={(v) => onUpdate('numero_cnss', v)}
              />
              <EditableInfoRow
                label={t('employeeDetails.fields.birthDate')}
                value={employee?.birthDate}
                type='date'
                onSave={(v) => onUpdate('birthDate', v)}
              />
              <EditableInfoRow
                label={t('employeeDetails.fields.birthPlace')}
                value={employee?.birthPlace}
                type='text'
                onSave={(v) => onUpdate('birthPlace', v)}
              />
              <EditableInfoRow
                label={t('employeeDetails.fields.gender')}
                value={employee?.gender}
                type='select'
                options={[
                  { id: 'M', label: t('employeeCreate.enums.gender.M') },
                  { id: 'F', label: t('employeeCreate.enums.gender.F') }
                ]}
                onSave={(v) => onUpdate('gender', v)}
              />
              <EditableInfoRow
                label={t('employeeDetails.fields.nationality')}
                value={employee?.nationality}
                type='text'
                onSave={(v) => onUpdate('nationality', v)}
              />
              <EditableInfoRow
                label={t('employeeDetails.fields.maritalStatus')}
                value={employee?.maritalStatus}
                type='select'
                options={[
                  {
                    id: 'celibataire',
                    label: t('employeeCreate.enums.maritalStatus.celibataire')
                  },
                  {
                    id: 'marie',
                    label: t('employeeCreate.enums.maritalStatus.marie')
                  }
                ]}
                onSave={(v) => onUpdate('maritalStatus', v)}
              />
              <EditableInfoRow
                label={t('employeeDetails.fields.numberOfChildren')}
                value={employee?.numberOfChildren}
                type='number'
                onSave={(v) => onUpdate('numberOfChildren', v)}
              />
              <EditableInfoRow
                label={'Catégorie professionnelle'}
                value={employee?.professionalCategory}
                type='select'
                options={PROFESSIONAL_CATEGORY_OPTIONS.map((o) => ({
                  id: o.id,
                  label: o.label
                }))}
                onSave={(v) => onUpdate('professionalCategory', v)}
              />
            </div>
          </Card>

          {/* Contact Card */}
          <Card className='border-l-muted-foreground/30 space-y-4 border-l-4 p-6'>
            <div className='mb-4 flex items-center gap-3'>
              <div className='bg-muted flex h-10 w-10 items-center justify-center rounded-lg'>
                <MapPin className='text-muted-foreground h-5 w-5' />
              </div>
              <div>
                <h3 className='text-lg font-semibold'>
                  {t('employeeDetails.sections.contact')}
                </h3>
                <p className='text-muted-foreground text-xs'>Coordonnées</p>
              </div>
            </div>
            <div className='space-y-3'>
              <EditableInfoRow
                label={t('employeeDetails.fields.email')}
                value={employee?.email}
                type='text'
                onSave={(v) => onUpdate('email', v)}
              />
              <EditableInfoRow
                label={t('employeeDetails.fields.phone')}
                value={employee?.phone}
                type='text'
                onSave={(v) => onUpdate('phone', v)}
              />
              <EditableInfoRow
                label={t('employeeDetails.fields.address')}
                value={employee?.address}
                type='textarea'
                onSave={(v) => onUpdate('address', v)}
              />
              <EditableInfoRow
                label={t('employeeDetails.fields.city')}
                value={employee?.city}
                type='text'
                onSave={(v) => onUpdate('city', v)}
              />
              <EditableInfoRow
                label={t('employeeDetails.fields.postalCode')}
                value={employee?.postalCode}
                type='text'
                onSave={(v) => onUpdate('postalCode', v)}
              />
              <EditableInfoRow
                label={t('employeeDetails.fields.country')}
                value={employee?.country}
                type='text'
                onSave={(v) => onUpdate('country', v)}
              />
            </div>
          </Card>
        </div>

        {/* CIN Documents Section */}
        {onAddDocument &&
          onEditDocument &&
          onDeleteDocument &&
          onPreviewDocument && (
            <DocumentUploadSection
              title='Documents CIN'
              description="Carte d'identité nationale et documents associés"
              documents={documents}
              documentType='cin'
              onAdd={() => onAddDocument('cin')}
              onEdit={onEditDocument}
              onDelete={onDeleteDocument}
              onPreview={onPreviewDocument}
              icon={<FileText className='text-primary h-5 w-5' />}
              borderColor='border-l-blue-500'
            />
          )}

        {/* Notes */}
        {employee?.notes && (
          <Card className='border-l-muted-foreground/30 space-y-4 border-l-4 p-6'>
            <div className='mb-4 flex items-center gap-3'>
              <div className='bg-muted flex h-10 w-10 items-center justify-center rounded-lg'>
                <NotebookText className='text-muted-foreground h-5 w-5' />
              </div>
              <div>
                <h3 className='text-lg font-semibold'>
                  {t('employeeDetails.sections.notes')}
                </h3>
                <p className='text-muted-foreground text-xs'>
                  Notes internes RH
                </p>
              </div>
            </div>
            <EditableInfoRow
              label={t('employeeDetails.sections.notes')}
              value={employee.notes}
              type='textarea'
              onSave={(v) => onUpdate('notes', v)}
            />
          </Card>
        )}
      </div>
    </AnimatedTabContent>
  );
};
