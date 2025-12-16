'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  MoreVertical,
  Download,
  FileText,
  Archive,
  Trash2,
  Send,
  RefreshCw,
  Printer,
  Plus
} from 'lucide-react';
import { Contract } from '@/types/contract';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';

interface ContractActionsProps {
  contract: Contract;
  onGenerate?: () => void;
  onDownload?: () => void;
  onPrint?: () => void;
  onSendSignature?: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
  onRenew?: () => void;
  onCreateAvenant?: () => void;
}

export default function ContractActions({
  contract,
  onGenerate,
  onDownload,
  onPrint,
  onSendSignature,
  onArchive,
  onDelete,
  onRenew,
  onCreateAvenant
}: ContractActionsProps) {
  const canGenerate = contract.status !== 'Brouillon';
  const canSendSignature =
    contract.status === 'Brouillon' ||
    contract.status === 'En_attente_signature';
  const canRenew =
    contract.type === 'CDD' &&
    (contract.status === 'Actif' || contract.status === 'Expire');
  const canArchive =
    contract.status === 'Resilie' || contract.status === 'Expire';

  const [confirmOpen, setConfirmOpen] = React.useState(false);

  return (
    <div className='flex items-center gap-2'>
      {/* Primary Actions - Always visible */}
      {canGenerate && onGenerate && (
        <Button
          onClick={onGenerate}
          variant='outline'
          size='sm'
          className='h-9 gap-1.5'
        >
          <FileText className='h-3.5 w-3.5' /> Générer
        </Button>
      )}

      {onDownload && (
        <Button
          onClick={onDownload}
          variant='outline'
          size='sm'
          className='h-9 gap-1.5'
        >
          <Download className='h-3.5 w-3.5' /> Télécharger
        </Button>
      )}

      {onPrint && (
        <Button
          onClick={onPrint}
          variant='outline'
          size='sm'
          className='h-9 gap-1.5'
        >
          <Printer className='h-3.5 w-3.5' /> Imprimer
        </Button>
      )}

      {contract.status !== 'Brouillon' && onCreateAvenant && (
        <Button onClick={onCreateAvenant} size='sm' className='h-9 gap-1.5'>
          <Plus className='h-3.5 w-3.5' /> Créer avenant
        </Button>
      )}

      {/* Secondary Actions - In dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='outline' size='sm' className='h-9'>
            <MoreVertical className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-56' sideOffset={5}>
          {canSendSignature && onSendSignature && (
            <DropdownMenuItem onClick={onSendSignature}>
              <Send className='mr-2 h-4 w-4' />
              Envoyer pour signature
            </DropdownMenuItem>
          )}

          {canRenew && onRenew && (
            <DropdownMenuItem onClick={onRenew}>
              <RefreshCw className='mr-2 h-4 w-4' />
              Renouveler
            </DropdownMenuItem>
          )}

          {canArchive && onArchive && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onArchive}>
                <Archive className='mr-2 h-4 w-4' />
                Archiver
              </DropdownMenuItem>
            </>
          )}

          {onDelete && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setConfirmOpen(true)}
                className='text-destructive focus:text-destructive'
              >
                <Trash2 className='mr-2 h-4 w-4' />
                Supprimer
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Confirmation dialog */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Êtes-vous sûr de vouloir supprimer
              ce contrat ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
              onClick={() => {
                setConfirmOpen(false);
                onDelete?.();
              }}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
