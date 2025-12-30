import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { FileText } from 'lucide-react';

export interface GenerateDialogProps {
  open: boolean;
  format: 'pdf' | 'excel';
  onChangeFormat: (fmt: 'pdf' | 'excel') => void;
  onCancel: () => void;
  onConfirm: () => void;
  employeeName?: string;
}

export function GenerateDialog({
  open,
  format,
  onChangeFormat,
  onCancel,
  onConfirm,
  employeeName
}: GenerateDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Générer le bulletin de paie</DialogTitle>
          <DialogDescription>
            Choisissez le format de génération pour le bulletin de{' '}
            {employeeName}
          </DialogDescription>
        </DialogHeader>
        <div className='py-4'>
          <RadioGroup
            value={format}
            onValueChange={(value) => onChangeFormat(value as 'pdf' | 'excel')}
          >
            <div className='flex cursor-pointer items-center space-x-2 rounded-lg border p-4 hover:bg-slate-50 dark:hover:bg-slate-900'>
              <RadioGroupItem value='pdf' id='pdf' />
              <Label htmlFor='pdf' className='flex-1 cursor-pointer'>
                <div className='flex items-center gap-3'>
                  <FileText className='h-5 w-5 text-red-600' />
                  <div>
                    <div className='font-medium'>Format PDF</div>
                    <div className='text-muted-foreground text-xs'>
                      Document imprimable et portable
                    </div>
                  </div>
                </div>
              </Label>
            </div>
            <div className='mt-3 flex cursor-pointer items-center space-x-2 rounded-lg border p-4 hover:bg-slate-50 dark:hover:bg-slate-900'>
              <RadioGroupItem value='excel' id='excel' />
              <Label htmlFor='excel' className='flex-1 cursor-pointer'>
                <div className='flex items-center gap-3'>
                  <FileText className='h-5 w-5 text-green-600' />
                  <div>
                    <div className='font-medium'>Format Excel</div>
                    <div className='text-muted-foreground text-xs'>
                      Fichier Excel modifiable
                    </div>
                  </div>
                </div>
              </Label>
            </div>
          </RadioGroup>
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={onCancel}>
            Annuler
          </Button>
          <Button onClick={onConfirm}>Générer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default GenerateDialog;
