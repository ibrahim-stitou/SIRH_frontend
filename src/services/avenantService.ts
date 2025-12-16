import apiClient from '@/lib/api';
import { Avenant } from '@/types/avenant';

/**
 * Service Avenants: CRUD et filtres basés sur contract_id
 * Endpoints mockés disponibles dans mock-server.js
 */

export async function getAvenants(params?: {
  contract_id?: string | number;
}): Promise<Avenant[]> {
  if (params?.contract_id) {
    const { data } = await apiClient.get(
      `/contracts/${params.contract_id}/avenants`
    );
    return data as Avenant[];
  }
  const { data } = await apiClient.get('/avenants');
  return data as Avenant[];
}

export async function getAvenant(id: string | number): Promise<Avenant> {
  const { data } = await apiClient.get(`/avenants/${id}`);
  return data as Avenant;
}

export async function createAvenant(
  payload: Omit<Avenant, 'id' | 'created_at' | 'created_by' | 'numero'> & {
    id?: string | number;
    numero?: number;
  }
): Promise<Avenant> {
  const { data } = await apiClient.post('/avenants', payload);
  return data as Avenant;
}

export async function updateAvenant(
  id: string | number,
  payload: Partial<Avenant>
): Promise<Avenant> {
  const { data } = await apiClient.put(`/avenants/${id}`, payload);
  return data as Avenant;
}

export async function deleteAvenant(id: string | number): Promise<void> {
  await apiClient.delete(`/avenants/${id}`);
}
