export type FraisLine = {
  id: number;
  date: string; // ISO date
  category:
    | 'Transport'
    | 'Restauration'
    | 'Hôtel'
    | 'Autre'
    | 'Per Diem'
    | 'Kilométrage';
  transportMode?: string | null;
  route?: { from: string; to: string } | null;
  amount: number;
  vatRecoverable?: number;
  attachments: string[]; // urls/paths
  comment?: string;
  kilometers?: number;
  vehicleType?: 'car' | 'motorcycle' | null;
  approvedAmount?: number;
  managerComment?: string;
};

export type NoteDeFrais = {
  id: number;
  number: string; // NDF-[YEAR]-[MATRICULE]-[SEQ]
  employeeId: number;
  matricule: string;
  status:
    | 'draft'
    | 'submitted'
    | 'approved'
    | 'approved_partial'
    | 'refused'
    | 'needs_complement';
  subject: string;
  startDate: string; // ISO date
  endDate: string; // ISO date
  total: number; // total in MAD
  lines: FraisLine[];
  history: Array<{
    at: string;
    action: string;
    by: string | number;
    comment?: string;
  }>;
  createdAt: string;
  updatedAt: string;
  refuseReason?: string;
  managerComment?: string;
};
