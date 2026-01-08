import { apiRoutes } from '@/config/apiRoutes';
import { NoteDeFrais } from '@/types/frais';

async function handleJson<T>(
  res: Response,
  fallbackMessage: string
): Promise<T> {
  if (res.ok) return res.json();
  try {
    const data = await res.json();
    const msg =
      (data && (data.message || data.error || data.msg)) || fallbackMessage;
    throw new Error(msg);
  } catch (_) {
    throw new Error(fallbackMessage);
  }
}

export async function listFrais(): Promise<NoteDeFrais[]> {
  const res = await fetch(apiRoutes.admin.frais.list);
  return handleJson<NoteDeFrais[]>(res, 'Failed to fetch frais');
}

export async function getFrais(
  id: number | string | undefined
): Promise<NoteDeFrais> {
  const res = await fetch(apiRoutes.admin.frais.get(id));
  return handleJson<NoteDeFrais>(res, 'Failed to get frais');
}

export async function createFrais(
  payload: Partial<NoteDeFrais>
): Promise<NoteDeFrais> {
  const res = await fetch(apiRoutes.admin.frais.create, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return handleJson<NoteDeFrais>(res, 'Failed to create frais');
}

export async function updateFrais(
  id: number | string,
  payload: Partial<NoteDeFrais>
): Promise<NoteDeFrais> {
  const res = await fetch(apiRoutes.admin.frais.update(id), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return handleJson<NoteDeFrais>(res, 'Failed to update frais');
}

export async function deleteFrais(id: number | string): Promise<NoteDeFrais> {
  const res = await fetch(apiRoutes.admin.frais.delete(id), {
    method: 'DELETE'
  });
  return handleJson<NoteDeFrais>(res, 'Failed to delete frais');
}

export async function validateFrais(
  id: number | string,
  payload: {
    action:
      | 'approve_total'
      | 'approve_partial'
      | 'refuse'
      | 'request_complement';
    adjustments?: Array<{
      id: number;
      approvedAmount: number;
      managerComment?: string;
    }>;
    reason?: string;
    comment?: string;
  }
): Promise<NoteDeFrais> {
  const res = await fetch(apiRoutes.admin.frais.validate(id), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return handleJson<NoteDeFrais>(res, 'Failed to validate frais');
}

export async function submitFrais(id: number | string): Promise<NoteDeFrais> {
  const res = await fetch(apiRoutes.admin.frais.submit(id), { method: 'POST' });
  return handleJson<NoteDeFrais>(res, 'Failed to submit frais');
}
