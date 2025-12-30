// Utility: blob/preview helpers for document generation
export function createPreviewUrl(blob: Blob): string {
  return URL.createObjectURL(blob);
}

export function downloadUrl(url: string, filename: string) {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function printPdfUrl(url: string) {
  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  iframe.src = url;
  document.body.appendChild(iframe);
  iframe.onload = () => {
    iframe.contentWindow?.print();
  };
}

export const BlobUtils = {
  createPreviewUrl,
  downloadUrl,
  printPdfUrl
};

export {};
