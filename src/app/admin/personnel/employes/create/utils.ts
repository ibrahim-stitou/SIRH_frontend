import { v4 as uuid } from 'uuid';
import { EmployeeCreateFormValues } from './schema';

export interface TransformedDocument {
  id: string;
  title: string;
  fileName?: string;
  mimeType?: string;
  size?: number;
  base64?: string; // placeholder
}

export function transformDocuments(data: EmployeeCreateFormValues): TransformedDocument[] {
  return (data.documents || []).map((d, idx) => {
    const files = data.documentsFiles?.[idx] || [];
    const file = files[0];
    return {
      id: uuid(),
      title: d.title,
      fileName: file?.name,
      mimeType: file?.type,
      size: file?.size,
      base64: undefined,
    };
  });
}

