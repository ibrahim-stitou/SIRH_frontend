import { apiRoutes } from '@/src/config/apiRoutes';
import type { NoteDeFrais } from '@/src/types/frais';

export async function listFrais(): Promise<NoteDeFrais[]> {
  const res = await fetch(apiRoutes.admin.frais.list);
  if (!res.ok) throw new Error('Failed to fetch frais');
  return res.json();
}

export async function getFrais(id: number | string): Promise<NoteDeFrais> {
  const res = await fetch(apiRoutes.admin.frais.get(id));
  if (!res.ok) throw new Error('Failed to get frais');
  return res.json();
}

export async function createFrais(payload: Partial<NoteDeFrais>): Promise<NoteDeFrais> {
  const res = await fetch(apiRoutes.admin.frais.create, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to create frais');
  return res.json();
}

export async function updateFrais(id: number | string, payload: Partial<NoteDeFrais>): Promise<NoteDeFrais> {
  const res = await fetch(apiRoutes.admin.frais.update(id), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to update frais');
  return res.json();
}

export async function deleteFrais(id: number | string): Promise<NoteDeFrais> {
  const res = await fetch(apiRoutes.admin.frais.delete(id), { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete frais');
  return res.json();
}

export async function validateFrais(id: number | string, payload: { action: 'approve_total' | 'approve_partial' | 'refuse' | 'request_complement'; adjustments?: Array<{ id: number; approvedAmount: number; managerComment?: string }>; reason?: string; comment?: string; }): Promise<NoteDeFrais> {
  const res = await fetch(apiRoutes.admin.frais.validate(id), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to validate frais');
  return res.json();
}
