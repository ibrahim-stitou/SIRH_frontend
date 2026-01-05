'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getFrais, validateFrais, submitFrais } from '@/services/frais';
import { NoteDeFrais } from '@/types/frais';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  FileText,
  Calendar,
  User,
  DollarSign,
  Edit,
  MessageSquare,
  ArrowLeft,
  CheckCheck,
  Ban,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';

interface FraisDetailsProps {
  id: number;
}

const statusConfig = {
  draft: {
    label: 'Brouillon',
    icon: FileText,
    color: 'bg-gray-100 text-gray-800 border-gray-200',
  },
  submitted: {
    label: 'En attente',
    icon: Clock,
    color: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  approved: {
    label: 'Approuvée',
    icon: CheckCircle2,
    color: 'bg-green-100 text-green-800 border-green-200',
  },
  approved_partial: {
    label: 'Approuvée partiellement',
    icon: AlertCircle,
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  },
  refused: {
    label: 'Refusée',
    icon: XCircle,
    color: 'bg-red-100 text-red-800 border-red-200',
  },
  needs_complement: {
    label: 'Complément requis',
    icon: AlertTriangle,
    color: 'bg-orange-100 text-orange-800 border-orange-200',
  },
};

export default function FraisDetails({ id }: FraisDetailsProps) {
  const router = useRouter();
  const [note, setNote] = useState<NoteDeFrais | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Dialog states
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRefuseDialog, setShowRefuseDialog] = useState(false);
  const [showPartialDialog, setShowPartialDialog] = useState(false);
  const [showComplementDialog, setShowComplementDialog] = useState(false);

  // Form states
  const [refuseReason, setRefuseReason] = useState('');
  const [complementReason, setComplementReason] = useState('');
  const [lineAdjustments, setLineAdjustments] = useState<Record<number, { approvedAmount: number; comment: string }>>({});

  const loadNote = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getFrais(id);
      setNote(data);

      // Initialize line adjustments
      const initialAdjustments: Record<number, { approvedAmount: number; comment: string }> = {};
      data.lines.forEach((line) => {
        initialAdjustments[line.id] = {
          approvedAmount: line.approvedAmount ?? line.amount,
          comment: line.managerComment || '',
        };
      });
      setLineAdjustments(initialAdjustments);
    } catch (e: any) {
      setError(e.message || 'Erreur lors du chargement');
      toast.error('Erreur lors du chargement de la note de frais');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadNote();
  }, [loadNote]);

  const handleApproveTotal = async () => {
    if (!note) return;

    setActionLoading(true);
    try {
      const updated = await validateFrais(id, { action: 'approve_total' });
      setNote(updated);
      toast.success('Note de frais approuvée avec succès');
      setShowApproveDialog(false);
    } catch (e: any) {
      toast.error(e.message || 'Erreur lors de l\'approbation');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprovePartial = async () => {
    if (!note) return;

    const adjustments = note.lines.map((line) => ({
      id: line.id,
      approvedAmount: lineAdjustments[line.id]?.approvedAmount ?? line.amount,
      managerComment: lineAdjustments[line.id]?.comment || undefined,
    }));

    setActionLoading(true);
    try {
      const updated = await validateFrais(id, {
        action: 'approve_partial',
        adjustments,
      });
      setNote(updated);
      toast.success('Note de frais approuvée partiellement');
      setShowPartialDialog(false);
    } catch (e: any) {
      toast.error(e.message || 'Erreur lors de l\'approbation partielle');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRefuse = async () => {
    if (!note || !refuseReason.trim()) {
      toast.error('Veuillez indiquer la raison du refus');
      return;
    }

    setActionLoading(true);
    try {
      const updated = await validateFrais(id, {
        action: 'refuse',
        reason: refuseReason,
      });
      setNote(updated);
      toast.success('Note de frais refusée');
      setShowRefuseDialog(false);
      setRefuseReason('');
    } catch (e: any) {
      toast.error(e.message || 'Erreur lors du refus');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestComplement = async () => {
    if (!note || !complementReason.trim()) {
      toast.error('Veuillez indiquer les informations manquantes');
      return;
    }

    setActionLoading(true);
    try {
      const updated = await validateFrais(id, {
        action: 'request_complement',
        comment: complementReason,
      });
      setNote(updated);
      toast.success('Complément d\'information demandé');
      setShowComplementDialog(false);
      setComplementReason('');
    } catch (e: any) {
      toast.error(e.message || 'Erreur lors de la demande de complément');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmitNote = async () => {
    setActionLoading(true);
    try {
      const updated = await submitFrais(id);
      setNote(updated);
      toast.success('Note de frais soumise');
    } catch (e: any) {
      toast.error(e.message || 'Erreur lors de la soumission');
    } finally {
      setActionLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD',
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'dd MMMM yyyy', { locale: fr });
    } catch {
      return dateStr;
    }
  };

  const config = statusConfig[note.status as keyof typeof statusConfig] || statusConfig.draft;
  const StatusIcon = config.icon;
  const totalApproved = note.lines.reduce((sum, line) => sum + (lineAdjustments[line.id]?.approvedAmount ?? line.approvedAmount ?? line.amount), 0);
  const canValidate = note.status === 'submitted';
  const canSubmit = note.status === 'draft' || note.status === 'needs_complement' || note.status === 'refused';

  if (loading) {
    return (
      <div className='flex items-center justify-center py-12'>
        <div className='animate-pulse space-y-4 w-full'>
          <div className='h-8 bg-gray-200 rounded w-1/4'></div>
          <div className='h-32 bg-gray-200 rounded'></div>
          <div className='h-64 bg-gray-200 rounded'></div>
        </div>
      </div>
    );
  }

  if (error || !note) {
    return (
      <Card className='border-destructive'>
        <CardHeader>
          <CardTitle className='text-destructive flex items-center gap-2'>
            <XCircle className='h-5 w-5' />
            Erreur
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className='text-sm text-muted-foreground'>{error || 'Note de frais introuvable'}</p>
          <Button variant='outline' className='mt-4' onClick={() => router.push('/admin/paie/frais')}>
            <ArrowLeft className='mr-2 h-4 w-4' />
            Retour à la liste
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <PageContainer>
      <div className="flex flex-1 flex-col space-y-6">
      <div className='flex items-center justify-between mb-6'>
        <Heading
          title='Détail de la note de frais'
          description='Visualisation et validation de la note de frais'
        />
        <Button variant='outline' onClick={() => router.push('/admin/paie/frais')}>
          <ArrowLeft className='mr-2 h-4 w-4' />
          Retour à la liste
        </Button>
      </div>
      <Card>
        <CardHeader>
          <div className='flex items-start justify-between'>
            <div className='space-y-1'>
              <CardTitle className='text-2xl font-bold flex items-center gap-3'>
                <FileText className='h-6 w-6 text-primary' />
                {note.number}
              </CardTitle>
              <CardDescription className='text-base'>{note.subject}</CardDescription>
            </div>
            <Badge className={`${config.color} border px-3 py-1 text-sm font-medium flex items-center gap-2`}>
              <StatusIcon className='h-4 w-4' />
              {config.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
            <div className='flex items-start gap-3 p-3 rounded-lg bg-muted/50'>
              <User className='h-5 w-5 text-muted-foreground mt-0.5' />
              <div>
                <p className='text-xs text-muted-foreground font-medium'>Employé</p>
                <p className='text-sm font-semibold mt-1'>{note.matricule}</p>
              </div>
            </div>
            <div className='flex items-start gap-3 p-3 rounded-lg bg-muted/50'>
              <Calendar className='h-5 w-5 text-muted-foreground mt-0.5' />
              <div>
                <p className='text-xs text-muted-foreground font-medium'>Période</p>
                <p className='text-sm font-semibold mt-1'>
                  {formatDate(note.startDate)} - {formatDate(note.endDate)}
                </p>
              </div>
            </div>
            <div className='flex items-start gap-3 p-3 rounded-lg bg-muted/50'>
              <DollarSign className='h-5 w-5 text-muted-foreground mt-0.5' />
              <div>
                <p className='text-xs text-muted-foreground font-medium'>Montant demandé</p>
                <p className='text-sm font-semibold mt-1'>{formatCurrency(note.total ?? 0)}</p>
              </div>
            </div>
            <div className='flex items-start gap-3 p-3 rounded-lg bg-primary/10'>
              <CheckCircle2 className='h-5 w-5 text-primary mt-0.5' />
              <div>
                <p className='text-xs text-muted-foreground font-medium'>Montant approuvé</p>
                <p className='text-sm font-bold text-primary mt-1'>{formatCurrency(totalApproved)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lines Table */}
      <Card>
        <CardHeader>
          <CardTitle className='text-lg flex items-center gap-2'>
            <Edit className='h-5 w-5' />
            Lignes de frais ({note.lines.length})
          </CardTitle>
          <CardDescription>Détail et validation des dépenses</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead className='text-right'>Montant demandé</TableHead>
                <TableHead className='text-right'>Montant approuvé</TableHead>
                <TableHead>Commentaire employé</TableHead>
                <TableHead>Commentaire manager</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {note.lines.map((line) => (
                <TableRow key={line.id}>
                  <TableCell className='font-medium'>{formatDate(line.date)}</TableCell>
                  <TableCell>
                    <Badge variant='outline'>{line.category}</Badge>
                  </TableCell>
                  <TableCell className='text-right font-medium'>{formatCurrency(line.amount)}</TableCell>
                  <TableCell className='text-right'>
                    {canValidate ? (
                      <Input
                        type='number'
                        value={lineAdjustments[line.id]?.approvedAmount ?? line.amount}
                        onChange={(e) =>
                          setLineAdjustments({
                            ...lineAdjustments,
                            [line.id]: {
                              ...lineAdjustments[line.id],
                              approvedAmount: Number(e.target.value),
                            },
                          })
                        }
                        className='w-28 text-right'
                        step='0.01'
                      />
                    ) : (
                      <span className='font-semibold text-primary'>
                        {formatCurrency(line.approvedAmount ?? line.amount)}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className='max-w-xs'>
                    <p className='text-sm text-muted-foreground truncate'>{line.comment || '-'}</p>
                  </TableCell>
                  <TableCell className='max-w-xs'>
                    {canValidate ? (
                      <Input
                        value={lineAdjustments[line.id]?.comment ?? ''}
                        onChange={(e) =>
                          setLineAdjustments({
                            ...lineAdjustments,
                            [line.id]: {
                              ...lineAdjustments[line.id],
                              comment: e.target.value,
                            },
                          })
                        }
                        placeholder='Commentaire manager'
                        className='w-full'
                      />
                    ) : (
                      <p className='text-sm'>{line.managerComment || '-'}</p>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Separator className='my-4' />

          <div className='flex justify-between items-center'>
            <p className='text-sm text-muted-foreground'>
              {note.lines.length} ligne{note.lines.length > 1 ? 's' : ''}
            </p>
            <div className='text-right'>
              <p className='text-sm text-muted-foreground'>Total à approuver</p>
              <p className='text-2xl font-bold text-primary'>{formatCurrency(totalApproved)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      {canValidate && (
        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>Actions de validation</CardTitle>
            <CardDescription>Choisissez une action pour traiter cette note de frais</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3'>
              <Button
                onClick={() => setShowApproveDialog(true)}
                className='w-full'
                variant='default'
              >
                <CheckCheck className='mr-2 h-4 w-4' />
                Approuver tout
              </Button>
              <Button
                onClick={() => setShowPartialDialog(true)}
                className='w-full'
                variant='secondary'
              >
                <AlertCircle className='mr-2 h-4 w-4' />
                Approuver partiellement
              </Button>
              <Button
                onClick={() => setShowComplementDialog(true)}
                className='w-full'
                variant='outline'
              >
                <MessageSquare className='mr-2 h-4 w-4' />
                Demander complément
              </Button>
              <Button
                onClick={() => setShowRefuseDialog(true)}
                className='w-full'
                variant='destructive'
              >
                <Ban className='mr-2 h-4 w-4' />
                Refuser
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {canSubmit && (
        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>Soumettre la note</CardTitle>
            <CardDescription>Envoyez la note pour validation</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleSubmitNote} disabled={actionLoading} className='w-full'>
              {note.status === 'refused' || note.status === 'needs_complement' ? 'Renvoyer' : 'Soumettre'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* History */}
      {note.history && note.history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className='text-lg flex items-center gap-2'>
              <Clock className='h-5 w-5' />
              Historique
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              {note.history.map((h, idx) => (
                <div key={idx} className='flex items-start gap-3 text-sm p-2 rounded-lg hover:bg-muted/50'>
                  <div className='flex-1'>
                    <p className='font-medium'>{h.action}</p>
                    {h.comment && <p className='text-muted-foreground text-xs mt-1'>{h.comment}</p>}
                  </div>
                  <p className='text-xs text-muted-foreground'>{formatDate(h.at)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Approve Total Dialog */}
      <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className='flex items-center gap-2'>
              <CheckCircle2 className='h-5 w-5 text-green-600' />
              Approuver la note de frais
            </AlertDialogTitle>
            <AlertDialogDescription>
              Vous allez approuver l&apos;intégralité de cette note de frais pour un montant de{' '}
              <strong>{formatCurrency(note.total ?? 0)}</strong>. Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleApproveTotal} disabled={actionLoading}>
              {actionLoading ? 'Traitement...' : 'Confirmer l\'approbation'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Approve Partial Dialog */}
      <AlertDialog open={showPartialDialog} onOpenChange={setShowPartialDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className='flex items-center gap-2'>
              <AlertCircle className='h-5 w-5 text-yellow-600' />
              Approuver partiellement
            </AlertDialogTitle>
            <AlertDialogDescription>
              Vous allez approuver cette note de frais avec des ajustements pour un montant total de{' '}
              <strong>{formatCurrency(totalApproved)}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleApprovePartial} disabled={actionLoading}>
              {actionLoading ? 'Traitement...' : 'Confirmer l\'approbation partielle'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Refuse Dialog */}
      <AlertDialog open={showRefuseDialog} onOpenChange={setShowRefuseDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className='flex items-center gap-2'>
              <XCircle className='h-5 w-5 text-red-600' />
              Refuser la note de frais
            </AlertDialogTitle>
            <AlertDialogDescription>
              Veuillez indiquer la raison du refus. L&apos;employé sera notifié.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className='py-4'>
            <Label htmlFor='refuseReason'>Raison du refus *</Label>
            <Textarea
              id='refuseReason'
              value={refuseReason}
              onChange={(e) => setRefuseReason(e.target.value)}
              placeholder='Ex: Justificatifs manquants, montants non conformes...'
              className='mt-2'
              rows={4}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRefuse}
              disabled={actionLoading || !refuseReason.trim()}
              className='bg-destructive hover:bg-destructive/90'
            >
              {actionLoading ? 'Traitement...' : 'Confirmer le refus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Request Complement Dialog */}
      <AlertDialog open={showComplementDialog} onOpenChange={setShowComplementDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className='flex items-center gap-2'>
              <MessageSquare className='h-5 w-5 text-orange-600' />
              Demander un complément d&apos;information
            </AlertDialogTitle>
            <AlertDialogDescription>
              Indiquez les informations ou justificatifs manquants. L&apos;employé devra compléter sa demande.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className='py-4'>
            <Label htmlFor='complementReason'>Informations manquantes *</Label>
            <Textarea
              id='complementReason'
              value={complementReason}
              onChange={(e) => setComplementReason(e.target.value)}
              placeholder="Ex: Merci d'ajouter les justificatifs pour les repas du 15/01..."
              className='mt-2'
              rows={4}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRequestComplement}
              disabled={actionLoading || !complementReason.trim()}
            >
              {actionLoading ? 'Traitement...' : 'Envoyer la demande'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </div>
    </PageContainer>
  );
}
