'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, Calendar, Users, DollarSign, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import apiClient from '@/lib/api';
import { apiRoutes } from '@/config/apiRoutes';
import CustomTable from '@/components/custom/data-table/custom-table';
import {
  CustomTableColumn,
  CustomTableFilterConfig,
  UseTableReturn
} from '@/components/custom/data-table/types';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

// Import des composants des onglets
import BulletinTab from '@/features/paie/bulletin-tab';
import VirementsTab from '@/features/paie/virements-tab';
import PageContainer from '@/components/layout/page-container';

interface PeriodePaie {
  id: string;
  nom: string;
  mois: number;
  annee: number;
  dateDebut: string;
  dateFin: string;
  dateEcheance: string;
  statut: string;
  nombreEmployes: number;
  montantTotal: number;
}

interface BulletinPaie {
  id: string;
  employeId: string;
  numeroEmploye: string;
  nomComplet: string;
  poste: string;
  departement: string;
  salaireNet: number;
  statut: string;
}

export default function PeriodePaiePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const periodeId = params.id as string;

  const [periode, setPeriode] = useState<PeriodePaie | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('employes');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [tableInstance, setTableInstance] = useState<Partial<
    UseTableReturn<BulletinPaie>
  > | null>(null);

  // Récupérer l'employé sélectionné depuis les paramètres URL
  useEffect(() => {
    const employeeId = searchParams.get('employeeId');
    const tab = searchParams.get('tab');
    
    if (employeeId) {
      setSelectedEmployeeId(employeeId);
    }
    
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Charger les données de la période
  useEffect(() => {
    const fetchPeriode = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(apiRoutes.admin.paies.periodes.show(periodeId));
        setPeriode(response.data.data as PeriodePaie);
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setLoading(false);
      }
    };

    if (periodeId) {
      fetchPeriode();
    }
  }, [periodeId]);

  const handleViewBulletin = (employeeId: string) => {
    setSelectedEmployeeId(employeeId);
    setActiveTab('bulletin');
    // Mettre à jour l'URL
    router.push(`/admin/paie/${periodeId}?tab=bulletin&employeeId=${employeeId}`);
  };

  const getStatutBadge = (statut: string) => {
    const variants: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      en_cours: { label: 'En cours', variant: 'default' },
      valide: { label: 'Validé', variant: 'secondary' },
      paye: { label: 'Payé', variant: 'outline' },
    };

    const config = variants[statut] || { label: statut, variant: 'outline' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  // Colonnes pour la table des employés
  const employeesColumns: CustomTableColumn<BulletinPaie>[] = [
    {
      data: 'numeroEmploye',
      label: 'N° Employé',
      sortable: true,
      render: (value) => <div className="font-medium">{value}</div>,
    },
    {
      data: 'nomComplet',
      label: 'Nom complet',
      sortable: true,
      render: (_value, row) => (
        <div className="space-y-0.5">
          <div className="font-medium">{row.nomComplet}</div>
          {/* matricule en gras sous le nom */}
          {row.numeroEmploye && (
            <div className="text-sm font-semibold text-muted-foreground">{row.numeroEmploye}</div>
          )}
        </div>
      )
    },
    {
      data: 'poste',
      label: 'Poste',
      sortable: true,
    },
    {
      data: 'departement',
      label: 'Département',
      sortable: true,
    },
    {
      data: 'salaireNet',
      label: 'Salaire net',
      sortable: true,
      render: (value) => (
        <div className="text-right font-medium">
          {new Intl.NumberFormat('fr-MA', {
            style: 'currency',
            currency: 'MAD',
          }).format(value as number)}
        </div>
      ),
    },
    {
      data: 'statut',
      label: 'Statut',
      sortable: true,
      render: (value) => getStatutBadge(value as string),
    },
    {
      data: 'employeId',
      label: 'Actions',
      sortable: false,
      render: (_value, row) => (
        <div className="flex justify-end">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                className="h-8 w-8 p-1.5"
                onClick={() => handleViewBulletin(row.employeId)}
              >
                <Eye className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Voir la paie</TooltipContent>
          </Tooltip>
        </div>
      ),
    },
  ];

  const employeesFilters: CustomTableFilterConfig[] = [
    {
      field: 'nomComplet',
      label: 'Nom',
      type: 'text',
    },
    {
      field: 'numeroEmploye',
      label: 'N° Employé',
      type: 'text',
    },
    {
      field: 'statut',
      label: 'Statut',
      type: 'datatable-select',
      options: [
        { label: 'Tous', value: '' },
        { label: 'En cours', value: 'en_cours' },
        { label: 'Validé', value: 'valide' },
        { label: 'Payé', value: 'paye' },
      ],
    },
  ];

  // Safe date formatting helpers
  const safeFormatDate = (val?: string, fmt: string = 'dd MMMM yyyy') => {
    if (!val) return '—';
    // Try parse ISO; fallback to Date directly
    const parsed = new Date(val);
    // If invalid, return raw or dash
    if (isNaN(parsed.getTime())) return '—';
    return format(parsed, fmt, { locale: fr });
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!periode) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Période non trouvée</CardTitle>
            <CardDescription>La période de paie demandée n&apos;existe pas.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/admin/paie')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <PageContainer>
    <div className=" mx-auto p-6 space-y-6 w-full">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/admin/paie')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{periode.nom}</h1>
            <p className="text-muted-foreground">
              Du {safeFormatDate(periode.dateDebut)} au {safeFormatDate(periode.dateFin)}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {getStatutBadge(periode.statut)}
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nombre d&apos;employés</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{periode.nombreEmployes}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Montant total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('fr-MA', {
                style: 'currency',
                currency: 'MAD',
              }).format(periode.montantTotal)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Date d&apos;échéance</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {safeFormatDate(periode.dateEcheance, 'dd MMM')}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Onglets */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-muted/50 grid w-full grid-cols-3">
          <TabsTrigger value="employes" className="text-sm">
            <Users className="mr-2 h-4 w-4" />
            Employés
          </TabsTrigger>
          <TabsTrigger value="bulletin" className="text-sm">
            <DollarSign className="mr-2 h-4 w-4" />
            Bulletin de paie
          </TabsTrigger>
          <TabsTrigger value="virements" className="text-sm">
            <Calendar className="mr-2 h-4 w-4" />
            Virements
          </TabsTrigger>
        </TabsList>

        <TabsContent value="employes" className="flex flex-col h-full min-h-0">
          <Card className="flex flex-col flex-1 min-h-0">
            <CardHeader>
              <CardTitle>Employés de la période</CardTitle>
              <CardDescription>
                Liste complète des employés avec pagination et recherche
              </CardDescription>
            </CardHeader>

            <CardContent className="flex flex-col flex-1 min-h-0">
              <div className="flex-1 min-h-0">
                <CustomTable<BulletinPaie>
                  columns={employeesColumns}
                  url={apiRoutes.admin.paies.bulletins.list(periodeId)}
                  filters={employeesFilters}
                  onInit={(instance) => setTableInstance(instance)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>


        <TabsContent value="bulletin" className="space-y-4">
          <BulletinTab
            periodeId={periodeId}
            selectedEmployeeId={selectedEmployeeId}
            onEmployeeChange={setSelectedEmployeeId}
          />
        </TabsContent>

        <TabsContent value="virements" className="space-y-4">
          <VirementsTab periodeId={periodeId} />
        </TabsContent>
      </Tabs>
    </div>
    </PageContainer>
  );
}
