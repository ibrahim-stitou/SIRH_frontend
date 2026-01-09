'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { toast } from 'sonner';
import apiClient from '@/lib/api';
import { apiRoutes } from '@/config/apiRoutes';
import {
  ArrowLeft,
  TrendingUp,
  Users,
  Calendar,
  AlertTriangle,
  Activity,
  DollarSign,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  BarChart3,
  Plus
} from 'lucide-react';
import PageContainer from '@/components/layout/page-container';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { AccidentTravailStatistiqueSkeleton } from '@/components/skeletons/AccidentTravailStatistiqueSkeleton';

interface StatistiquesAT {
  nombreTotal: number;
  avecArret: number;
  sansArret: number;
  joursPerdus: number;
  parType: {
    surSite: number;
    trajet: number;
  };
  parGravite: {
    leger: number;
    moyen: number;
    grave: number;
  };
  parStatut: {
    brouillon: number;
    declare: number;
    transmisCNSS: number;
    enInstruction: number;
    accepte: number;
    refuse: number;
    clos: number;
  };
  delaisRespect: {
    respect: number;
    horsDelai: number;
  };
  montantIndemnites: number;
}

export default function StatistiquesAccidentsTravailPage() {
  const router = useRouter();
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<string>(String(currentYear));
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<StatistiquesAT | null>(null);

  // Générer les 5 dernières années
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  useEffect(() => {
    loadStatistics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear]);

  const loadStatistics = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(
        `${apiRoutes.admin.accidentsTravail.statistiques}?annee=${selectedYear}`
      );
      setStats(response.data.data);
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <PageContainer scrollable>
        <AccidentTravailStatistiqueSkeleton />
      </PageContainer>
    );
  }

  if (!stats) {
    return (
      <PageContainer scrollable>
        <div className='flex items-center justify-center py-20'>
          <div className='space-y-4 text-center'>
            <AlertTriangle className='text-muted-foreground mx-auto h-12 w-12' />
            <p className='text-lg font-medium'>Aucune donnée disponible</p>
            <p className='text-muted-foreground text-sm'>
              Une erreur s&apos;est produite lors du chargement des statistiques
            </p>
            <div className='flex justify-center gap-2'>
              <Button onClick={loadStatistics} variant='outline'>
                <Activity className='mr-2 h-4 w-4' />
                Réessayer
              </Button>
              <Button onClick={() => router.back()}>Retour</Button>
            </div>
          </div>
        </div>
      </PageContainer>
    );
  }

  // Show message if no accidents for selected year
  if (stats.nombreTotal === 0) {
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
                  Statistiques Accidents du Travail
                </h1>
                <p className='text-muted-foreground text-sm'>
                  Analyse et indicateurs de sécurité
                </p>
              </div>
            </div>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className='w-[180px]'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={String(year)}>
                    Année {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Empty State */}
          <Card>
            <CardContent className='flex flex-col items-center justify-center py-20'>
              <FileText className='text-muted-foreground mb-4 h-16 w-16' />
              <h3 className='mb-2 text-lg font-medium'>
                Aucun accident enregistré en {selectedYear}
              </h3>
              <p className='text-muted-foreground mb-6 text-center text-sm'>
                Il n&apos;y a aucun accident du travail enregistré pour
                l&apos;année sélectionnée.
                <br />
                Sélectionnez une autre année ou déclarez un nouvel accident.
              </p>
              <div className='flex gap-2'>
                <Button
                  variant='outline'
                  onClick={() =>
                    router.push('/admin/gestion-social/accidents-travail')
                  }
                >
                  Voir tous les accidents
                </Button>
                <Button
                  onClick={() =>
                    router.push(
                      '/admin/gestion-social/accidents-travail/ajouter'
                    )
                  }
                >
                  <Plus className='mr-2 h-4 w-4' />
                  Déclarer un accident
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    );
  }

  const tauxFrequence =
    stats.nombreTotal > 0
      ? ((stats.nombreTotal / 1000) * 1000000).toFixed(2)
      : '0';
  const tauxGravite =
    stats.nombreTotal > 0
      ? ((stats.joursPerdus / stats.nombreTotal) * 1000).toFixed(2)
      : '0';

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
                Statistiques Accidents du Travail
              </h1>
              <p className='text-muted-foreground text-sm'>
                Analyse et indicateurs de sécurité
              </p>
            </div>
          </div>
          <div className='flex items-center gap-4'>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className='w-[180px]'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={String(year)}>
                    Année {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button onClick={() => window.print()}>
              <FileText className='mr-2 h-4 w-4' />
              Exporter PDF
            </Button>
          </div>
        </div>

        {/* KPIs Principaux */}
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Total Accidents
              </CardTitle>
              <AlertTriangle className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{stats.nombreTotal}</div>
              <div className='text-muted-foreground flex items-center gap-2 text-xs'>
                <span className='text-green-600'>
                  {stats.sansArret} sans arrêt
                </span>
                <span>•</span>
                <span className='text-orange-600'>
                  {stats.avecArret} avec arrêt
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Jours Perdus
              </CardTitle>
              <Calendar className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{stats.joursPerdus}</div>
              <p className='text-muted-foreground text-xs'>
                {stats.avecArret > 0
                  ? `Moyenne: ${(stats.joursPerdus / stats.avecArret).toFixed(1)} j/accident`
                  : 'Aucun arrêt'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Taux de Fréquence
              </CardTitle>
              <TrendingUp className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{tauxFrequence}</div>
              <p className='text-muted-foreground text-xs'>
                Pour 1 000 000 d&apos;heures travaillées
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Indemnités CNSS
              </CardTitle>
              <DollarSign className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {stats.montantIndemnites.toLocaleString('fr-FR')} MAD
              </div>
              <p className='text-muted-foreground text-xs'>
                Montant total des indemnités
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Analyses Détaillées */}
        <div className='grid gap-6 md:grid-cols-2'>
          {/* Répartition par Type */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <BarChart3 className='h-5 w-5' />
                Répartition par Type
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm'>Sur site</span>
                  <div className='flex items-center gap-2'>
                    <Badge variant='default'>{stats.parType.surSite}</Badge>
                    <span className='text-muted-foreground text-xs'>
                      {stats.nombreTotal > 0
                        ? Math.round(
                            (stats.parType.surSite / stats.nombreTotal) * 100
                          )
                        : 0}
                      %
                    </span>
                  </div>
                </div>
                <div className='bg-secondary h-2 w-full overflow-hidden rounded-full'>
                  <div
                    className='bg-primary h-full'
                    style={{
                      width: `${stats.nombreTotal > 0 ? (stats.parType.surSite / stats.nombreTotal) * 100 : 0}%`
                    }}
                  />
                </div>
              </div>

              <div className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm'>Trajet</span>
                  <div className='flex items-center gap-2'>
                    <Badge variant='secondary'>{stats.parType.trajet}</Badge>
                    <span className='text-muted-foreground text-xs'>
                      {stats.nombreTotal > 0
                        ? Math.round(
                            (stats.parType.trajet / stats.nombreTotal) * 100
                          )
                        : 0}
                      %
                    </span>
                  </div>
                </div>
                <div className='bg-secondary h-2 w-full overflow-hidden rounded-full'>
                  <div
                    className='h-full bg-blue-500'
                    style={{
                      width: `${stats.nombreTotal > 0 ? (stats.parType.trajet / stats.nombreTotal) * 100 : 0}%`
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Répartition par Gravité */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Activity className='h-5 w-5' />
                Répartition par Gravité
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm'>Léger</span>
                  <div className='flex items-center gap-2'>
                    <Badge className='bg-green-100 text-green-700'>
                      {stats.parGravite.leger}
                    </Badge>
                    <span className='text-muted-foreground text-xs'>
                      {stats.nombreTotal > 0
                        ? Math.round(
                            (stats.parGravite.leger / stats.nombreTotal) * 100
                          )
                        : 0}
                      %
                    </span>
                  </div>
                </div>
                <div className='bg-secondary h-2 w-full overflow-hidden rounded-full'>
                  <div
                    className='h-full bg-green-500'
                    style={{
                      width: `${stats.nombreTotal > 0 ? (stats.parGravite.leger / stats.nombreTotal) * 100 : 0}%`
                    }}
                  />
                </div>
              </div>

              <div className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm'>Moyen</span>
                  <div className='flex items-center gap-2'>
                    <Badge className='bg-orange-100 text-orange-700'>
                      {stats.parGravite.moyen}
                    </Badge>
                    <span className='text-muted-foreground text-xs'>
                      {stats.nombreTotal > 0
                        ? Math.round(
                            (stats.parGravite.moyen / stats.nombreTotal) * 100
                          )
                        : 0}
                      %
                    </span>
                  </div>
                </div>
                <div className='bg-secondary h-2 w-full overflow-hidden rounded-full'>
                  <div
                    className='h-full bg-orange-500'
                    style={{
                      width: `${stats.nombreTotal > 0 ? (stats.parGravite.moyen / stats.nombreTotal) * 100 : 0}%`
                    }}
                  />
                </div>
              </div>

              <div className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm'>Grave</span>
                  <div className='flex items-center gap-2'>
                    <Badge className='bg-red-100 text-red-700'>
                      {stats.parGravite.grave}
                    </Badge>
                    <span className='text-muted-foreground text-xs'>
                      {stats.nombreTotal > 0
                        ? Math.round(
                            (stats.parGravite.grave / stats.nombreTotal) * 100
                          )
                        : 0}
                      %
                    </span>
                  </div>
                </div>
                <div className='bg-secondary h-2 w-full overflow-hidden rounded-full'>
                  <div
                    className='h-full bg-red-500'
                    style={{
                      width: `${stats.nombreTotal > 0 ? (stats.parGravite.grave / stats.nombreTotal) * 100 : 0}%`
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Répartition par Statut */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <FileText className='h-5 w-5' />
                Répartition par Statut
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              <div className='flex items-center justify-between text-sm'>
                <span>Brouillon</span>
                <Badge variant='outline'>{stats.parStatut.brouillon}</Badge>
              </div>
              <Separator />
              <div className='flex items-center justify-between text-sm'>
                <span>Déclaré</span>
                <Badge className='bg-blue-100 text-blue-700'>
                  {stats.parStatut.declare}
                </Badge>
              </div>
              <Separator />
              <div className='flex items-center justify-between text-sm'>
                <span>Transmis CNSS</span>
                <Badge className='bg-yellow-100 text-yellow-700'>
                  {stats.parStatut.transmisCNSS}
                </Badge>
              </div>
              <Separator />
              <div className='flex items-center justify-between text-sm'>
                <span>En instruction</span>
                <Badge className='bg-orange-100 text-orange-700'>
                  {stats.parStatut.enInstruction}
                </Badge>
              </div>
              <Separator />
              <div className='flex items-center justify-between text-sm'>
                <span>Accepté</span>
                <Badge className='bg-green-100 text-green-700'>
                  {stats.parStatut.accepte}
                </Badge>
              </div>
              <Separator />
              <div className='flex items-center justify-between text-sm'>
                <span>Refusé</span>
                <Badge className='bg-red-100 text-red-700'>
                  {stats.parStatut.refuse}
                </Badge>
              </div>
              <Separator />
              <div className='flex items-center justify-between text-sm'>
                <span>Clos</span>
                <Badge variant='secondary'>{stats.parStatut.clos}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Conformité Délai 48h */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Clock className='h-5 w-5' />
                Conformité Délai 48h
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <CheckCircle2 className='h-4 w-4 text-green-600' />
                    <span className='text-sm'>Délai respecté</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Badge className='bg-green-100 text-green-700'>
                      {stats.delaisRespect.respect}
                    </Badge>
                    <span className='text-muted-foreground text-xs'>
                      {stats.nombreTotal > 0
                        ? Math.round(
                            (stats.delaisRespect.respect / stats.nombreTotal) *
                              100
                          )
                        : 0}
                      %
                    </span>
                  </div>
                </div>
                <div className='bg-secondary h-2 w-full overflow-hidden rounded-full'>
                  <div
                    className='h-full bg-green-500'
                    style={{
                      width: `${stats.nombreTotal > 0 ? (stats.delaisRespect.respect / stats.nombreTotal) * 100 : 0}%`
                    }}
                  />
                </div>
              </div>

              <div className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <XCircle className='h-4 w-4 text-red-600' />
                    <span className='text-sm'>Hors délai</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Badge className='bg-red-100 text-red-700'>
                      {stats.delaisRespect.horsDelai}
                    </Badge>
                    <span className='text-muted-foreground text-xs'>
                      {stats.nombreTotal > 0
                        ? Math.round(
                            (stats.delaisRespect.horsDelai /
                              stats.nombreTotal) *
                              100
                          )
                        : 0}
                      %
                    </span>
                  </div>
                </div>
                <div className='bg-secondary h-2 w-full overflow-hidden rounded-full'>
                  <div
                    className='h-full bg-red-500'
                    style={{
                      width: `${stats.nombreTotal > 0 ? (stats.delaisRespect.horsDelai / stats.nombreTotal) * 100 : 0}%`
                    }}
                  />
                </div>
              </div>

              {stats.delaisRespect.horsDelai > 0 && (
                <div className='rounded-lg bg-red-50 p-3 text-sm text-red-700'>
                  ⚠️ {stats.delaisRespect.horsDelai} déclaration(s) hors délai
                  légal
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
