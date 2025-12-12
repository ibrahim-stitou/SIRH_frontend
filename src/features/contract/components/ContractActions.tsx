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
  RefreshCw
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
  onSendSignature?: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
  onRenew?: () => void;
}

export default function ContractActions({
  contract,
  onGenerate,
  onDownload,
  onSendSignature,
  onArchive,
  onDelete,
  onRenew
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
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='outline' size='sm' className='h-9'>
            <MoreVertical className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-56' sideOffset={5}>
          {canGenerate && onGenerate && (
            <DropdownMenuItem onClick={onGenerate}>
              <FileText className='mr-2 h-4 w-4' />
              Générer le contrat
            </DropdownMenuItem>
          )}

          {onDownload && (
            <DropdownMenuItem onClick={onDownload}>
              <Download className='mr-2 h-4 w-4' />
              Télécharger
            </DropdownMenuItem>
          )}

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
    </>
  );
}
