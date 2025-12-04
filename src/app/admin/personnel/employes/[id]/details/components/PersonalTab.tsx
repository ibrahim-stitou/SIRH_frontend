/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Card } from '@/components/ui/card';
import { IdCard, MapPin, NotebookText } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { AnimatedTabContent } from '../components';
import EditableInfoRow from './EditableInfoRow';
import { toast } from 'sonner';

interface PersonalTabProps {
  active: boolean;
  employee: any;
  onUpdate: (key: string, value: any) => Promise<void>;
}

export const PersonalTab: React.FC<PersonalTabProps> = ({
  active,
  employee,
  onUpdate
}) => {
  const { t } = useLanguage();
  const fullName = employee ? `${employee.firstName} ${employee.lastName}` : '';

  /* eslint-disable @typescript-eslint/no-explicit-any */

  return (
    <AnimatedTabContent active={active}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Identity Card */}
        <Card className="p-6 space-y-4 border-l-4 border-l-primary">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <IdCard className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">
                {t('employeeDetails.sections.identity')}
              </h3>
              <p className="text-xs text-muted-foreground">
                Informations personnelles
              </p>
            </div>
          </div>
          <div className="space-y-3">
            <EditableInfoRow
              label={t('employeeDetails.fields.fullName')}
              value={fullName}
              type="text"
              disabled
              onSave={async () => {
                toast.info('Modifiez prénom/nom séparément');
              }}
            />
            <EditableInfoRow
              label="CIN"
              value={employee?.cin}
              type="text"
              onSave={(v) => onUpdate('cin', v)}
            />
            <EditableInfoRow
              label="Numéro CNSS"
              value={employee?.numero_cnss}
              type="text"
              onSave={(v) => onUpdate('numero_cnss', v)}
            />
            <EditableInfoRow
              label={t('employeeDetails.fields.birthDate')}
              value={employee?.birthDate}
              type="date"
              onSave={(v) => onUpdate('birthDate', v)}
            />
            <EditableInfoRow
              label={t('employeeDetails.fields.birthPlace')}
              value={employee?.birthPlace}
              type="text"
              onSave={(v) => onUpdate('birthPlace', v)}
            />
            <EditableInfoRow
              label={t('employeeDetails.fields.gender')}
              value={employee?.gender}
              type="select"
              options={[
                { id: 'M', label: t('employeeCreate.enums.gender.M') },
                { id: 'F', label: t('employeeCreate.enums.gender.F') }
              ]}
              onSave={(v) => onUpdate('gender', v)}
            />
            <EditableInfoRow
              label={t('employeeDetails.fields.nationality')}
              value={employee?.nationality}
              type="text"
              onSave={(v) => onUpdate('nationality', v)}
            />
            <EditableInfoRow
              label={t('employeeDetails.fields.maritalStatus')}
              value={employee?.maritalStatus}
              type="select"
              options={[
                { id: 'celibataire', label: t('employeeCreate.enums.maritalStatus.celibataire') },
                { id: 'marie', label: t('employeeCreate.enums.maritalStatus.marie') }
              ]}
              onSave={(v) => onUpdate('maritalStatus', v)}
            />
            <EditableInfoRow
              label={t('employeeDetails.fields.numberOfChildren')}
              value={employee?.numberOfChildren}
              type="number"
              onSave={(v) => onUpdate('numberOfChildren', v)}
            />
          </div>
        </Card>

        {/* Contact Card */}
        <Card className="p-6 space-y-4 border-l-4 border-l-muted-foreground/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <MapPin className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">
                {t('employeeDetails.sections.contact')}
              </h3>
              <p className="text-xs text-muted-foreground">Coordonnées</p>
            </div>
          </div>
          <div className="space-y-3">
            <EditableInfoRow
              label={t('employeeDetails.fields.email')}
              value={employee?.email}
              type="text"
              onSave={(v) => onUpdate('email', v)}
            />
            <EditableInfoRow
              label={t('employeeDetails.fields.phone')}
              value={employee?.phone}
              type="text"
              onSave={(v) => onUpdate('phone', v)}
            />
            <EditableInfoRow
              label={t('employeeDetails.fields.address')}
              value={employee?.address}
              type="textarea"
              onSave={(v) => onUpdate('address', v)}
            />
            <EditableInfoRow
              label={t('employeeDetails.fields.city')}
              value={employee?.city}
              type="text"
              onSave={(v) => onUpdate('city', v)}
            />
            <EditableInfoRow
              label={t('employeeDetails.fields.postalCode')}
              value={employee?.postalCode}
              type="text"
              onSave={(v) => onUpdate('postalCode', v)}
            />
            <EditableInfoRow
              label={t('employeeDetails.fields.country')}
              value={employee?.country}
              type="text"
              onSave={(v) => onUpdate('country', v)}
            />
          </div>
        </Card>
      </div>

      {/* Notes */}
      {employee?.notes && (
        <Card className="p-6 space-y-4 border-l-4 border-l-muted-foreground/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <NotebookText className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">
                {t('employeeDetails.sections.notes')}
              </h3>
              <p className="text-xs text-muted-foreground">Notes internes RH</p>
            </div>
          </div>
          <EditableInfoRow
            label={t('employeeDetails.sections.notes')}
            value={employee.notes}
            type="textarea"
            onSave={(v) => onUpdate('notes', v)}
          />
        </Card>
      )}
    </AnimatedTabContent>
  );
};

