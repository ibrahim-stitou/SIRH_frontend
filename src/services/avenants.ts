import apiClient from '@/lib/api';

export interface CreateAvenantPayload {
  contract_id: string | number;
  numero?: number;
  date: string; // ISO date
  objet: string;
  description?: string;
  status?: 'Brouillon' | 'En_attente_signature' | 'Signe' | 'Archive';
  changes: any;
}

export async function createAvenant(payload: CreateAvenantPayload) {
  // If mock server, post to /avenants; otherwise use configured route
  const baseUrl = process.env.NEXT_PUBLIC_USE_MOCK === 'true' ? '/avenants' : '/avenants';
  const { data } = await apiClient.post(baseUrl, payload);
  return data;
}

