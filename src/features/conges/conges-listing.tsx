'use client';

import { useLanguage } from '@/context/LanguageContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import CustomTable from '@/components/custom/data-table/custom-table';
import { apiRoutes } from '@/config/apiRoutes';
import { useEffect, useMemo, useState } from 'react';
import {
  CustomTableColumn,
  CustomTableFilterConfig,
  UseTableReturn
} from '@/components/custom/data-table/types';
import apiClient from '@/lib/api';

interface CongeRow {
  id: number;
  employee_id: number;
  type_absence_id: number;
  type_absence?: {
    id: number;
    code: string;
    libelle: string;
    est_remuneree?: boolean;
    deduit_compteur_conge?: boolean;
    necessite_justification?: boolean;
    validation_obligatoire?: boolean;
    impact_paie?: boolean;
    actif?: boolean;
    couleur_hexa?: string;
  } | null;
  annee: number | string;
  solde_initial: number;
  solde_acquis: number;
  solde_utilise: number;
  solde_restant: number;
  solde_report: 2;
  created_at: string;
  updated_at: string;
  employee: {
    id: number;
    first_name: number;
    last_name: number;
    matricule: number;
  };
}
export default function CongeListing() {
  const { t } = useLanguage();
  const router = useRouter();
  const [_tableInstance, setTableInstance] = useState<Partial<
    UseTableReturn<CongeRow>
  > | null>(null);
  const [employees, setEmployees] = useState<
    { label: string; value: string | number }[]
  >([]);
  const [absenceTypes, setAbsenceTypes] = useState<
    { label: string; value: string | number }[]
  >([]);

  const yearsoptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 7; i <= currentYear + 2; i++) {
      years.push({ label: i.toString(), value: i });
    }
    return years;
  }, []);
  useEffect(() => {
    let mounted = true;

    apiClient
      .get(apiRoutes.admin.absences.typesSimple)
      .then((res) => {
        const list = (res.data?.data || []).map((it: any) => ({
          label: `${it.code} — ${it.libelle}`,
          value: it.id
        }));
        if (mounted) setAbsenceTypes(list);
      })
      .catch(() => void 0);

    apiClient
      .get(apiRoutes.admin.employees.simpleList)
      .then((res) => {
        const opts = (res.data?.data || []).map((e: any) => ({
          label: `${e.firstName} ${e.lastName}${e.matricule ? ' — ' + e.matricule : ''}`,
          value: e.id
        }));
        if (mounted) setEmployees(opts);
      })
      .catch(() => void 0);

    return () => {
      mounted = false;
    };
  }, []);

  const columns: CustomTableColumn<CongeRow>[] = useMemo(
    () => [
      { data: 'id', label: t('conges.fields.id'), sortable: true },
      {
        data: 'employee',
        label: t('conges.fields.employee'),
        sortable: false,
        render: (_v, row) =>
          row.employee ? (
            <div className='flex flex-col'>
              <span className='font-medium'>{`${row.employee.first_name} ${row.employee.last_name}`}</span>
              {row.employee.matricule && (
                <span className='text-muted-foreground text-xs'>
                  {row.employee.matricule}
                </span>
              )}
            </div>
          ) : (
            '—'
          )
      },
      {
        data: 'type_absence',
        label: t('conges.fields.typeAbsenceId'),
        sortable: true,
        render: (_v, row) =>
          row.type_absence
            ? `${row.type_absence.code} — ${row.type_absence.libelle}`
            : '—'
      },
      { data: 'annee', label: t('conges.fields.annee'), sortable: true },
      {
        data: 'solde_initial',
        label: t('conges.fields.soldeInitial'),
        sortable: true
      },
      {
        data: 'solde_acquis',
        label: t('conges.fields.soldeAcquis'),
        sortable: true
      },
      {
        data: 'solde_utilise',
        label: t('conges.fields.soldeUtilise'),
        sortable: true
      },
      {
        data: 'solde_restant',
        label: t('conges.fields.soldeRestant'),
        sortable: true
      },
      {
        data: 'solde_report',
        label: t('conges.fields.soldeReport'),
        sortable: true
      }
    ],
    [t]
  );
  const filters: CustomTableFilterConfig[] = useMemo(
    () => [
      {
        field: 'employeeId',
        label: 'Employé',
        type: 'datatable-select',
        options: employees
      },
      {
        field: 'type',
        label: "Type d'absence",
        type: 'datatable-select',
        options: absenceTypes
      },
      {
        field: 'annee',
        label: 'Année',
        type: 'datatable-select',
        options: yearsoptions
      }
    ],
    [absenceTypes, employees, yearsoptions]
  );
  return (
    <>
      <div className='mb-2 flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-semibold tracking-tight'>
            {t('conges.title')}
          </h1>
          <p className='text-muted-foreground text-sm'>
            {t('conges.description')}
          </p>
        </div>
        <Button onClick={() => router.push('/admin/absences/ajouter')}>
          <Plus /> {t('conges.addConge')}
        </Button>
      </div>
      <div className='flex-col> flex flex-1 space-y-4'>
        <CustomTable
          url={apiRoutes.admin.conges.congeCompteurs.list}
          columns={columns}
          filters={filters}
          onInit={(inst) => setTableInstance(inst)}
        />
      </div>
    </>
  );
}
