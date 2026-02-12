import { CustomTableFilterConfig } from '@/components/custom/data-table/types';

export const competenceFilters: CustomTableFilterConfig[] = [
  {
    field: 'libelle',
    label: 'Compétence',
    type: 'text'
  },
  {
    field: 'code',
    label: 'Code',
    type: 'text'
  }
];
