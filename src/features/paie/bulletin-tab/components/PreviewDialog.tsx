import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Printer, FileText } from 'lucide-react';

export interface PreviewDialogProps {
  open: boolean;
  format: 'pdf' | 'excel';
  previewUrl?: string;
  onClose: () => void;
  onDownload: () => void;
  onPrint: () => void;
  employeeName?: string;
}

export function PreviewDialog({
  open,
  format,
  previewUrl,
  onClose,
  onDownload,
  onPrint,
  employeeName
}: PreviewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className='h-[90vh] max-w-4xl'>
        <DialogHeader>
          <DialogTitle>Aperçu du bulletin de paie</DialogTitle>
          <DialogDescription>
            Bulletin de {employeeName} - Format {format.toUpperCase()}
          </DialogDescription>
        </DialogHeader>
        <div className='flex-1 overflow-hidden'>
          {format === 'pdf' && previewUrl ? (
            <iframe
              src={previewUrl}
              className='h-[calc(90vh-200px)] w-full rounded-lg border'
              title='Aperçu du bulletin'
            />
          ) : (
            <div className='flex h-[calc(90vh-200px)] items-center justify-center rounded-lg border bg-slate-50 dark:bg-slate-900'>
              <div className='text-center'>
                <FileText className='text-muted-foreground mx-auto mb-4 h-16 w-16' />
                <p className='text-muted-foreground'>
                  {format === 'excel'
                    ? "L'aperçu n'est pas disponible pour les fichiers Excel. Téléchargez le fichier pour le consulter."
                    : "Chargement de l'aperçu..."}
                </p>
              </div>
            </div>
          )}
        </div>
        <DialogFooter className='gap-2'>
          <Button variant='outline' onClick={onClose}>
            Fermer
          </Button>
          <Button variant='outline' onClick={onDownload}>
            <Download className='mr-2 h-4 w-4' />
            Télécharger
          </Button>
          {format === 'pdf' && (
            <Button onClick={onPrint}>
              <Printer className='mr-2 h-4 w-4' />
              Imprimer
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default PreviewDialog;
