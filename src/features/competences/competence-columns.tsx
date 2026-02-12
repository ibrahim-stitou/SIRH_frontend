import { CustomTableColumn } from '@/components/custom/data-table/types';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Trash } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { PosteCompetenceRow } from '@/types/competence-types';

const niveauDescriptions: Record<number, string> = {
  1: 'Notions',
  2: 'Pratique encadrée',
  3: 'Autonomie',
  4: 'Maîtrise',
  5: 'Expertise'
};

export const competenceColumns = (
  onDelete: (row: PosteCompetenceRow) => void,
  onChange: (row: PosteCompetenceRow, key: string, value: any) => void
): CustomTableColumn<PosteCompetenceRow>[] => [
  {
    data: 'competence',
    label: 'Compétence',
    render: (_, row) => (
      <div className="flex items-center gap-2">
        <span className="font-medium">{row.competence.libelle}</span>
        <Badge variant="secondary">{row.competence.categorie}</Badge>
      </div>
    ),
    sortable: false
  },
  {
    data: 'niveau_requis',
    label: 'Niveau requis',
    render: (_, row) => (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <Tooltip key={n}>
            <TooltipTrigger asChild>
              <span
                onClick={() => onChange(row, 'niveau_requis', n)}
                className={`cursor-pointer text-lg ${row.niveau_requis >= n
                    ? 'text-yellow-500'
                    : 'text-gray-300'}`}
              >
                ★
              </span>
            </TooltipTrigger>
            <TooltipContent>{niveauDescriptions[n]}</TooltipContent>
          </Tooltip>
        ))}
      </div>
    ),
    sortable: false
  },
  {
    data: 'importance',
    label: 'Importance',
    render: (_, row) => (
      <Switch
        checked={row.importance === 'INDISPENSABLE'}
        onCheckedChange={(v) => onChange(row, 'importance', v ? 'INDISPENSABLE' : 'SOUHAITABLE')} />
    ),
    sortable: false
  },
  {
    data: 'actions',
    label: 'Action',
    render: (_, row) => (
      <Trash
        onClick={() => onDelete(row)}
        className="h-4 w-4 cursor-pointer text-red-600" />
    ),
    sortable: false
  }
];
