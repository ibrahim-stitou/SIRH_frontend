'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import apiClient from '@/lib/api';
import { apiRoutes } from '@/config/apiRoutes';
import {
  ArrowLeft,
  Edit,
  Send,
  CheckCircle2,
  FileText,
  AlertTriangle,
  Calendar,
  Users,
  Activity,
  DollarSign,
  FileCheck
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import PageContainer from '@/components/layout/page-container';
import {
  AccidentTravail,
  Temoin,
  HistoriqueAT
} from '../../../../../../types/accidentsTravail';
import { StatusBadge } from '@/components/custom/status-badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function AccidentTravailDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [accident, setAccident] = useState<AccidentTravail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDecisionModal, setShowDecisionModal] = useState(false);
  const [decisionData, setDecisionData] = useState({
    decision: 'Accepté',
    tauxIPP: '',
    montantIndemnite: ''
  });

  const loadAccident = async () => {
    try {
      const response = await apiClient.get(
        apiRoutes.admin.accidentsTravail.show(id)
      );
      setAccident(response.data.data);
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error("Erreur lors du chargement de l'accident");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccident();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleDeclarerCNSS = async () => {
    try {
      await apiClient.patch(apiRoutes.admin.accidentsTravail.declarerCNSS(id));
      toast.success('Dossier transmis à la CNSS avec succès');
      loadAccident();
    } catch (e: any) {
      toast.error(
        e?.response?.data?.message || 'Erreur lors de la déclaration CNSS'
      );
    }
  };

  const handleCloturer = async () => {
    try {
      await apiClient.patch(apiRoutes.admin.accidentsTravail.cloturer(id));
      toast.success('Accident clôturé avec succès');
      loadAccident();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Erreur lors de la clôture');
    }
  };

  const handleDecisionCNSS = async () => {
    try {
      await apiClient.patch(apiRoutes.admin.accidentsTravail.decisionCNSS(id), {
        decision: decisionData.decision,
        tauxIPP: decisionData.tauxIPP ? parseFloat(decisionData.tauxIPP) : null,
        montantIndemnite: decisionData.montantIndemnite
          ? parseFloat(decisionData.montantIndemnite)
          : null
      });
      toast.success('Décision CNSS enregistrée avec succès');
      setShowDecisionModal(false);
      loadAccident();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Erreur');
    }
  };

  if (loading) {
    return (
      <PageContainer scrollable>
        <div className='space-y-6'>
          {/* Header Skeleton */}
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-2'>
              <Skeleton className='h-10 w-10 rounded-md' />
              <div className='space-y-2'>
                <Skeleton className='h-7 w-48' />
                <Skeleton className='h-4 w-64' />
              </div>
            </div>
            <div className='flex gap-2'>
              <Skeleton className='h-10 w-32' />
              <Skeleton className='h-10 w-40' />
            </div>
          </div>

          <div className='grid gap-6 md:grid-cols-3'>
            {/* Colonne principale */}
            <div className='space-y-6 md:col-span-2'>
              {/* Card Informations générales */}
              <Card>
                <CardHeader>
                  <div className='flex items-center gap-2'>
                    <Skeleton className='h-5 w-5 rounded' />
                    <Skeleton className='h-6 w-48' />
                  </div>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='grid gap-4 md:grid-cols-2'>
                    <div className='space-y-2'>
                      <Skeleton className='h-3 w-20' />
                      <Skeleton className='h-5 w-full' />
                      <Skeleton className='h-4 w-32' />
                    </div>
                    <div className='space-y-2'>
                      <Skeleton className='h-3 w-24' />
                      <Skeleton className='h-5 w-40' />
                    </div>
                  </div>
                  <Skeleton className='h-px w-full' />
                  <div className='grid gap-4 md:grid-cols-3'>
                    <div className='space-y-2'>
                      <Skeleton className='h-3 w-16' />
                      <Skeleton className='h-6 w-24' />
                    </div>
                    <div className='space-y-2'>
                      <Skeleton className='h-3 w-20' />
                      <Skeleton className='h-6 w-20' />
                    </div>
                    <div className='space-y-2'>
                      <Skeleton className='h-3 w-16' />
                      <Skeleton className='h-6 w-28' />
                    </div>
                  </div>
                  <Skeleton className='h-px w-full' />
                  <div className='space-y-2'>
                    <Skeleton className='h-3 w-16' />
                    <Skeleton className='h-5 w-full' />
                  </div>
                </CardContent>
              </Card>

              {/* Card Circonstances */}
              <Card>
                <CardHeader>
                  <div className='flex items-center gap-2'>
                    <Skeleton className='h-5 w-5 rounded' />
                    <Skeleton className='h-6 w-56' />
                  </div>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='space-y-2'>
                    <Skeleton className='h-4 w-32' />
                    <Skeleton className='h-20 w-full rounded-lg' />
                  </div>
                  <Skeleton className='h-px w-full' />
                  <div className='space-y-2'>
                    <Skeleton className='h-4 w-36' />
                    <Skeleton className='h-16 w-full rounded-lg' />
                  </div>
                </CardContent>
              </Card>

              {/* Card Témoins */}
              <Card>
                <CardHeader>
                  <div className='flex items-center gap-2'>
                    <Skeleton className='h-5 w-5 rounded' />
                    <Skeleton className='h-6 w-32' />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className='space-y-3'>
                    {[1, 2].map((i) => (
                      <Skeleton key={i} className='h-16 w-full rounded-lg' />
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Card Historique */}
              <Card>
                <CardHeader>
                  <div className='flex items-center gap-2'>
                    <Skeleton className='h-5 w-5 rounded' />
                    <Skeleton className='h-6 w-28' />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className='space-y-4'>
                    {[1, 2, 3].map((i) => (
                      <div key={i} className='flex gap-3'>
                        <Skeleton className='h-8 w-8 rounded-full' />
                        <div className='flex-1 space-y-2'>
                          <Skeleton className='h-4 w-48' />
                          <Skeleton className='h-3 w-full' />
                          <Skeleton className='h-3 w-32' />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Colonne latérale */}
            <div className='space-y-6'>
              {/* Card Suivi CNSS */}
              <Card>
                <CardHeader>
                  <div className='flex items-center gap-2'>
                    <Skeleton className='h-5 w-5 rounded' />
                    <Skeleton className='h-6 w-32' />
                  </div>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='space-y-2'>
                    <Skeleton className='h-3 w-24' />
                    <Skeleton className='h-5 w-32' />
                  </div>
                  <div className='space-y-2'>
                    <Skeleton className='h-3 w-28' />
                    <Skeleton className='h-4 w-40' />
                  </div>
                  <div className='space-y-2'>
                    <Skeleton className='h-3 w-20' />
                    <Skeleton className='h-6 w-24' />
                  </div>
                </CardContent>
              </Card>

              {/* Card Impact paie */}
              <Card>
                <CardHeader>
                  <div className='flex items-center gap-2'>
                    <Skeleton className='h-5 w-5 rounded' />
                    <Skeleton className='h-6 w-32' />
                  </div>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='space-y-2'>
                    <Skeleton className='h-3 w-32' />
                    <Skeleton className='h-5 w-12' />
                  </div>
                  <div className='space-y-2'>
                    <Skeleton className='h-3 w-40' />
                    <Skeleton className='h-6 w-32' />
                  </div>
                  <div className='space-y-2'>
                    <Skeleton className='h-3 w-28' />
                    <Skeleton className='h-6 w-20' />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (!accident) {
    return (
      <PageContainer scrollable>
        <div className='flex items-center justify-center py-20'>
          <div className='text-center'>
            <div className='text-muted-foreground mb-4'>
              Accident non trouvé
            </div>
            <Button onClick={() => router.back()}>Retour</Button>
          </div>
        </div>
      </PageContainer>
    );
  }

  const statutMap: Record<
    string,
    {
      text: string;
      tone: 'neutral' | 'success' | 'danger' | 'warning' | 'info';
    }
  > = {
    Brouillon: { text: 'Brouillon', tone: 'neutral' },
    Déclaré: { text: 'Déclaré', tone: 'info' },
    'Transmis CNSS': { text: 'Transmis CNSS', tone: 'warning' },
    'En instruction': { text: 'En instruction', tone: 'warning' },
    Accepté: { text: 'Accepté', tone: 'success' },
    Refusé: { text: 'Refusé', tone: 'danger' },
    Clos: { text: 'Clos', tone: 'neutral' }
  };

  const canEdit =
    accident.statut === 'Brouillon' || accident.statut === 'Déclaré';
  const canDeclareCNSS =
    accident.statut === 'Déclaré' && !accident.suiviCNSS.dateEnvoi;
  const canAddDecision =
    accident.statut === 'Transmis CNSS' || accident.statut === 'En instruction';
  const canCloturer = accident.statut === 'Accepté';

  return (
    <PageContainer scrollable>
      <div className='w-full space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-2'>
            <Button variant='ghost' size='icon' onClick={() => router.back()}>
              <ArrowLeft className='h-5 w-5' />
            </Button>
            <div>
              <h1 className='text-2xl font-semibold tracking-tight'>
                Accident #{accident.id}
              </h1>
              <p className='text-muted-foreground text-sm'>
                {accident.employe.prenom} {accident.employe.nom}
              </p>
            </div>
          </div>
          <div className='flex gap-2'>
            {canEdit && (
              <Button
                variant='outline'
                onClick={() =>
                  router.push(
                    `/admin/gestion-social/accidents-travail/${id}/modifier`
                  )
                }
              >
                <Edit className='mr-2 h-4 w-4' />
                Modifier
              </Button>
            )}
            {canDeclareCNSS && (
              <Button onClick={handleDeclarerCNSS}>
                <Send className='mr-2 h-4 w-4' />
                Déclarer à la CNSS
              </Button>
            )}
            {canAddDecision && (
              <Button onClick={() => setShowDecisionModal(true)}>
                <FileCheck className='mr-2 h-4 w-4' />
                Enregistrer décision CNSS
              </Button>
            )}
            {canCloturer && (
              <Button onClick={handleCloturer}>
                <CheckCircle2 className='mr-2 h-4 w-4' />
                Clôturer
              </Button>
            )}
          </div>
        </div>

        {/* Alerte délai */}
        {!accident.delaiDeclarationRespect && (
          <div className='rounded-lg border border-red-200 bg-red-50 p-4'>
            <div className='flex items-center gap-2 text-red-600'>
              <AlertTriangle className='h-5 w-5' />
              <div>
                <div className='font-semibold'>Délai légal dépassé</div>
                <div className='text-sm'>
                  La déclaration a été effectuée{' '}
                  {accident.heuresDepuisAccident.toFixed(1)} heures après
                  l&apos;accident (délai légal: 48h)
                </div>
              </div>
            </div>
          </div>
        )}

        <div className='grid gap-6 md:grid-cols-3'>
          {/* Colonne principale */}
          <div className='space-y-6 md:col-span-2'>
            {/* Informations générales */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <FileText className='h-5 w-5' />
                  Informations générales
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid gap-4 md:grid-cols-2'>
                  <div>
                    <div className='text-muted-foreground text-sm'>Employé</div>
                    <div className='font-medium'>
                      {accident.employe.prenom} {accident.employe.nom}
                    </div>
                    <div className='text-muted-foreground text-sm'>
                      {accident.employe.matricule} • CNSS:{' '}
                      {accident.employe.numeroCNSS}
                    </div>
                  </div>
                  <div>
                    <div className='text-muted-foreground text-sm'>
                      Date et heure
                    </div>
                    <div className='font-medium'>
                      {format(
                        new Date(accident.dateHeureAccident),
                        'dd/MM/yyyy à HH:mm',
                        {
                          locale: fr
                        }
                      )}
                    </div>
                  </div>
                </div>
                <Separator />
                <div className='grid gap-4 md:grid-cols-3'>
                  <div>
                    <div className='text-muted-foreground text-sm'>Type</div>
                    <Badge
                      variant={
                        accident.typeAccident === 'Sur site'
                          ? 'default'
                          : 'secondary'
                      }
                    >
                      {accident.typeAccident}
                    </Badge>
                  </div>
                  <div>
                    <div className='text-muted-foreground text-sm'>Gravité</div>
                    <Badge
                      className={
                        accident.gravite === 'Léger'
                          ? 'bg-green-100 text-green-700'
                          : accident.gravite === 'Moyen'
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-red-100 text-red-700'
                      }
                    >
                      {accident.gravite}
                    </Badge>
                  </div>
                  <div>
                    <div className='text-muted-foreground text-sm'>Statut</div>
                    <StatusBadge
                      label={
                        statutMap[accident.statut]?.text || accident.statut
                      }
                      tone={statutMap[accident.statut]?.tone || 'neutral'}
                    />
                  </div>
                </div>
                <Separator />
                <div>
                  <div className='text-muted-foreground mb-1 text-sm'>Lieu</div>
                  <div className='flex items-start gap-2'>
                    <div>{accident.lieu}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Circonstances et lésions */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <FileText className='h-5 w-5' />
                  Circonstances et lésions
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div>
                  <div className='text-muted-foreground mb-2 text-sm font-medium'>
                    Circonstances
                  </div>
                  <div className='bg-muted rounded-lg p-3 text-sm'>
                    {accident.circonstances}
                  </div>
                </div>
                <Separator />
                <div>
                  <div className='text-muted-foreground mb-2 text-sm font-medium'>
                    Nature des lésions
                  </div>
                  <div className='bg-muted rounded-lg p-3 text-sm'>
                    {accident.lesions}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Témoins */}
            {accident.temoins.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <Users className='h-5 w-5' />
                    Témoins ({accident.temoins.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='space-y-3'>
                    {accident.temoins.map((temoin: Temoin, index: number) => (
                      <div
                        key={index}
                        className='flex items-center justify-between rounded-lg border p-3'
                      >
                        <div>
                          <div className='font-medium'>{temoin.nom}</div>
                          <div className='text-muted-foreground text-sm'>
                            {temoin.contact}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Arrêt de travail */}
            {accident.arretTravail.existe && (
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <Activity className='h-5 w-5' />
                    Arrêt de travail
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='grid gap-4 md:grid-cols-3'>
                    <div>
                      <div className='text-muted-foreground text-sm'>Durée</div>
                      <div className='text-lg font-medium'>
                        {accident.arretTravail.dureePrevisionnelle} jours
                      </div>
                    </div>
                    {accident.arretTravail.dateDebut && (
                      <div>
                        <div className='text-muted-foreground text-sm'>Du</div>
                        <div className='font-medium'>
                          {format(
                            new Date(accident.arretTravail.dateDebut),
                            'dd/MM/yyyy'
                          )}
                        </div>
                      </div>
                    )}
                    {accident.arretTravail.dateFin && (
                      <div>
                        <div className='text-muted-foreground text-sm'>Au</div>
                        <div className='font-medium'>
                          {format(
                            new Date(accident.arretTravail.dateFin),
                            'dd/MM/yyyy'
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Pièces jointes */}
            {accident.piecesJointes && accident.piecesJointes.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <FileText className='h-5 w-5' />
                    Pièces jointes ({accident.piecesJointes.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='space-y-2'>
                    {accident.piecesJointes.map((piece: any, index: number) => (
                      <div
                        key={index}
                        className='flex items-center justify-between rounded-lg border p-3'
                      >
                        <div className='flex items-center gap-3'>
                          <div className='bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg'>
                            <FileText className='text-primary h-5 w-5' />
                          </div>
                          <div>
                            <div className='font-medium'>{piece.nom}</div>
                            <div className='text-muted-foreground text-sm'>
                              {piece.type} • {(piece.taille / 1024).toFixed(1)}{' '}
                              KB
                            </div>
                          </div>
                        </div>
                        <Button variant='ghost' size='sm'>
                          Télécharger
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Historique */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Activity className='h-5 w-5' />
                  Historique
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  {accident.historique.map(
                    (event: HistoriqueAT, index: number) => (
                      <div key={index} className='flex gap-3'>
                        <div className='bg-primary/10 mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full'>
                          <Calendar className='text-primary h-4 w-4' />
                        </div>
                        <div className='flex-1'>
                          <div className='flex items-start justify-between'>
                            <div>
                              <div className='font-medium'>{event.action}</div>
                              <div className='text-muted-foreground text-sm'>
                                {event.details}
                              </div>
                            </div>
                            <div className='text-muted-foreground text-xs'>
                              {format(new Date(event.date), 'dd/MM/yyyy HH:mm')}
                            </div>
                          </div>
                          <div className='text-muted-foreground mt-1 text-xs'>
                            Par {event.utilisateur}
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Colonne latérale */}
          <div className='space-y-6'>
            {/* Suivi CNSS */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <FileCheck className='h-5 w-5' />
                  Suivi CNSS
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                {accident.suiviCNSS.dateEnvoi ? (
                  <>
                    <div>
                      <div className='text-muted-foreground text-sm'>
                        Envoyé le
                      </div>
                      <div className='font-medium'>
                        {format(
                          new Date(accident.suiviCNSS.dateEnvoi),
                          'dd/MM/yyyy'
                        )}
                      </div>
                    </div>
                    <div>
                      <div className='text-muted-foreground text-sm'>
                        N° Récépissé
                      </div>
                      <div className='font-mono text-sm'>
                        {accident.suiviCNSS.numeroRecepisse}
                      </div>
                    </div>
                    {accident.suiviCNSS.decision && (
                      <div>
                        <div className='text-muted-foreground text-sm'>
                          Décision
                        </div>
                        <StatusBadge
                          label={accident.suiviCNSS.decision}
                          tone={
                            accident.suiviCNSS.decision === 'Accepté'
                              ? 'success'
                              : accident.suiviCNSS.decision === 'Refusé'
                                ? 'danger'
                                : 'warning'
                          }
                        />
                      </div>
                    )}
                    {accident.suiviCNSS.tauxIPP !== null && (
                      <div>
                        <div className='text-muted-foreground text-sm'>
                          Taux IPP
                        </div>
                        <div className='text-lg font-medium'>
                          {accident.suiviCNSS.tauxIPP}%
                        </div>
                      </div>
                    )}
                    {accident.suiviCNSS.montantIndemnite && (
                      <div>
                        <div className='text-muted-foreground text-sm'>
                          Montant indemnité
                        </div>
                        <div className='text-lg font-medium'>
                          {accident.suiviCNSS.montantIndemnite.toLocaleString(
                            'fr-FR'
                          )}{' '}
                          MAD
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className='text-muted-foreground text-center text-sm'>
                    Non transmis à la CNSS
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Impact paie */}
            {accident.impactPaie.impactBulletin && (
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <DollarSign className='h-5 w-5' />
                    Impact paie
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div>
                    <div className='text-muted-foreground text-sm'>
                      Jours indemnisés
                    </div>
                    <div className='font-medium'>
                      {accident.impactPaie.joursIndemnises}
                    </div>
                  </div>
                  <div>
                    <div className='text-muted-foreground text-sm'>
                      Indemnités journalières
                    </div>
                    <div className='text-lg font-medium'>
                      {accident.impactPaie.indemnitesJournalieres.toLocaleString(
                        'fr-FR'
                      )}{' '}
                      MAD
                    </div>
                  </div>
                  {accident.impactPaie.priseEnCharge && (
                    <div>
                      <div className='text-muted-foreground text-sm'>
                        Prise en charge
                      </div>
                      <Badge>{accident.impactPaie.priseEnCharge}</Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Modal décision CNSS */}
        <Dialog open={showDecisionModal} onOpenChange={setShowDecisionModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Enregistrer la décision CNSS</DialogTitle>
              <DialogDescription>
                Saisir les informations de la décision de la CNSS
              </DialogDescription>
            </DialogHeader>
            <div className='space-y-4'>
              <div>
                <Label>Décision</Label>
                <select
                  className='mt-1 w-full rounded-md border p-2'
                  value={decisionData.decision}
                  onChange={(e) =>
                    setDecisionData({
                      ...decisionData,
                      decision: e.target.value
                    })
                  }
                >
                  <option value='Accepté'>Accepté</option>
                  <option value='Refusé'>Refusé</option>
                </select>
              </div>
              <div>
                <Label>Taux IPP (%)</Label>
                <Input
                  type='number'
                  min='0'
                  max='100'
                  step='0.1'
                  value={decisionData.tauxIPP}
                  onChange={(e) =>
                    setDecisionData({
                      ...decisionData,
                      tauxIPP: e.target.value
                    })
                  }
                  placeholder='Ex: 7'
                />
              </div>
              <div>
                <Label>Montant indemnité (MAD)</Label>
                <Input
                  type='number'
                  min='0'
                  step='0.01'
                  value={decisionData.montantIndemnite}
                  onChange={(e) =>
                    setDecisionData({
                      ...decisionData,
                      montantIndemnite: e.target.value
                    })
                  }
                  placeholder='Ex: 4500'
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant='outline'
                onClick={() => setShowDecisionModal(false)}
              >
                Annuler
              </Button>
              <Button onClick={handleDecisionCNSS}>Enregistrer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageContainer>
  );
}
