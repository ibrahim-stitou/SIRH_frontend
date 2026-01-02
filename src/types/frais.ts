export type FraisLine = {
  id: number;
  date: string; // ISO date
  category: 'Transport' | 'Restauration' | 'Hôtel' | 'Autre';
  transportMode?: string | null;
  route?: { from: string; to: string } | null;
  amount: number;
  vatRecoverable?: number;
  currency: string; // e.g., MAD
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
  status: 'draft' | 'submitted' | 'approved' | 'approved_partial' | 'refused' | 'needs_complement';
  subject: string;
  startDate: string; // ISO date
  endDate: string; // ISO date
  currency: string;
  total: number; // total in base currency (MAD)
  lines: FraisLine[];
  history: Array<{ at: string; action: string; by: string | number; comment?: string }>;
  createdAt: string;
  updatedAt: string;
  refuseReason?: string;
  managerComment?: string;
};
