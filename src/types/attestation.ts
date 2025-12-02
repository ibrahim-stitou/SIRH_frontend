export type AttestationType = 'travail' | 'salaire' | 'stage' | 'travail_salaire' | 'autre';
export type AttestationRequestStatus = 'en_attente' | 'approuve' | 'rejete' | 'genere';

export interface AttestationRequest {
  id: number;
  employeeId: number;
  typeAttestation: AttestationType;
  dateRequest: string;
  dateSouhaitee?: string;
  status: AttestationRequestStatus;
  raisonRejet?: string;
  motifRejet?: string;
  raison?: string;
  notes?: string;
  dateValidation?: string;
  dateGeneration?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Attestation {
  id: number;
  requestId?: number | null;
  employeeId: number;
  typeAttestation: AttestationType;
  dateGeneration: string;
  documentPath: string;
  numeroAttestation: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AttestationRequestWithEmployee extends AttestationRequest {
  employee?: {
    firstName: string;
    lastName: string;
    position: string;
    email: string;
  };
}

export interface AttestationWithEmployee extends Attestation {
  employee?: {
    firstName: string;
    lastName: string;
    position: string;
    email: string;
    departmentId?: string;
    hireDate?: string;
    salaryBase?: number;
    cin?: string;
    birthDate?: string;
    nationality?: string;
  };
}

