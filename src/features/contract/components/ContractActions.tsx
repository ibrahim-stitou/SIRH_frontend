'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  MoreVertical,
  Download,
  FileText,
  Copy,
  Archive,
  Trash2,
  Send,
  RefreshCw
} from 'lucide-react';
import { Contract } from '@/types/contract';

interface ContractActionsProps {
  contract: Contract;
  onGenerate?: () => void;
  onDownload?: () => void;
  onDuplicate?: () => void;
  onSendSignature?: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
  onRenew?: () => void;
}

export default function ContractActions({
  contract,
  onGenerate,
  onDownload,
  onDuplicate,
  onSendSignature,
  onArchive,
  onDelete,
  onRenew,
}: ContractActionsProps) {
  const canGenerate = contract.status !== 'Brouillon';
  const canSendSignature = contract.status === 'Brouillon' || contract.status === 'En_attente_signature';
  const canRenew = contract.type === 'CDD' && (contract.status === 'Actif' || contract.status === 'Expire');
  const canArchive = contract.status === 'Resilie' || contract.status === 'Expire';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-9">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56" sideOffset={5}>
        {canGenerate && onGenerate && (
          <DropdownMenuItem onClick={onGenerate}>
            <FileText className="mr-2 h-4 w-4" />
            Générer le contrat
          </DropdownMenuItem>
        )}

        {onDownload && (
          <DropdownMenuItem onClick={onDownload}>
            <Download className="mr-2 h-4 w-4" />
            Télécharger
          </DropdownMenuItem>
        )}

        {canSendSignature && onSendSignature && (
          <DropdownMenuItem onClick={onSendSignature}>
            <Send className="mr-2 h-4 w-4" />
            Envoyer pour signature
          </DropdownMenuItem>
        )}

        {onDuplicate && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onDuplicate}>
              <Copy className="mr-2 h-4 w-4" />
              Dupliquer
            </DropdownMenuItem>
          </>
        )}

        {canRenew && onRenew && (
          <DropdownMenuItem onClick={onRenew}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Renouveler
          </DropdownMenuItem>
        )}

        {canArchive && onArchive && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onArchive}>
              <Archive className="mr-2 h-4 w-4" />
              Archiver
            </DropdownMenuItem>
          </>
        )}

        {onDelete && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onDelete}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

