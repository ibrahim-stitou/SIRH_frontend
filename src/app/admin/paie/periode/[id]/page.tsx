'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Loader2,
  ArrowLeft,
  Calendar,
  Users,
  DollarSign,
  Eye,
  MoreVertical,
  Lock,
  FileText,
  Mail,
  Download
} from 'lucide-react';
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';

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
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(
    null
  );
  const [tableInstance, setTableInstance] = useState<Partial<
    UseTableReturn<BulletinPaie>
  > | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showClotureModal, setShowClotureModal] = useState(false);

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
        const response = await apiClient.get(
          apiRoutes.admin.paies.periodes.show(periodeId)
        );
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
    router.push(
      `/admin/paie/periode/${periodeId}?tab=bulletin&employeeId=${employeeId}`
    );
  };

  const handleClotureClick = () => {
    setShowClotureModal(true);
  };

  const handleCloturePeriode = async () => {
    setActionLoading('cloture');
    try {
      await apiClient.post(apiRoutes.admin.paies.periodes.cloture(periodeId));
      const response = await apiClient.get(
        apiRoutes.admin.paies.periodes.show(periodeId)
      );
      setPeriode(response.data.data as PeriodePaie);
      // Refetch la datatable des employés si elle existe
      if (tableInstance && typeof tableInstance.refresh === 'function') {
        tableInstance.refresh();
      }
    } catch (error) {
      console.error('Erreur lors de la clôture:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleGeneratePDF = async () => {
    setActionLoading('pdf');
    try {
      // API call to generate all bulletins in PDF
      await apiClient.post(
        apiRoutes.admin.paies.periodes.generatePDF(periodeId)
      );
      console.log('PDF générés avec succès');
    } catch (error) {
      console.error('Erreur lors de la génération des PDF:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleSendEmails = async () => {
    setActionLoading('email');
    try {
      // API call to send emails to all employees
      await apiClient.post(
        apiRoutes.admin.paies.periodes.sendEmails(periodeId)
      );
      console.log('Emails envoyés avec succès');
    } catch (error) {
      console.error("Erreur lors de l'envoi des emails:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleExportData = async () => {
    setActionLoading('export');
    try {
      // API call to export period data
      const response = await apiClient.get(
        apiRoutes.admin.paies.periodes.export(periodeId),
        {
          responseType: 'blob'
        }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `paie_${periode?.nom}_${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Erreur lors de l'export:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatutBadge = (statut: string) => {
    const variants: Record<
      string,
      {
        label: string;
        variant: 'default' | 'secondary' | 'destructive' | 'outline';
        className: string;
      }
    > = {
      en_cours: {
        label: 'En cours',
        variant: 'default',
        className: 'bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200'
      },
      valide: {
        label: 'Validé',
        variant: 'secondary',
        className:
          'bg-green-100 text-green-800 hover:bg-green-200 border-green-200'
      },
      paye: {
        label: 'Payé',
        variant: 'outline',
        className:
          'bg-purple-100 text-purple-800 hover:bg-purple-200 border-purple-200'
      },
      cloture: {
        label: 'Cloturé',
        variant: 'destructive',
        className: 'bg-red-100 text-red-800 hover:bg-red-200 border-red-200'
      }
    };

    const config = variants[statut] || {
      label: statut,
      variant: 'outline',
      className: ''
    };
    return (
      <Badge
        variant={config.variant}
        className={`${config.className} px-3 py-1 font-medium`}
      >
        {config.label}
      </Badge>
    );
  };

  // Colonnes pour la table des employés
  const employeesColumns: CustomTableColumn<BulletinPaie>[] = [
    {
      data: 'numeroEmploye',
      label: 'N° Employé',
      sortable: true,
      width: 120,
      render: (value) => (
        <div className='text-sm font-semibold text-gray-700'>{value}</div>
      )
    },
    {
      data: 'nomComplet',
      label: 'Nom complet',
      sortable: true,
      render: (_value, row) => (
        <div className='space-y-1'>
          <div className='font-semibold text-gray-900'>{row.nomComplet}</div>
          <div className='text-xs text-gray-500'>{row.numeroEmploye}</div>
        </div>
      )
    },
    {
      data: 'poste',
      label: 'Poste',
      sortable: true,
      render: (value) => <div className='text-sm text-gray-700'>{value}</div>
    },
    {
      data: 'departement',
      label: 'Département',
      sortable: true,
      render: (value) => (
        <Badge
          variant='outline'
          className='border-gray-200 bg-gray-50 text-gray-700'
        >
          {value}
        </Badge>
      )
    },
    {
      data: 'salaireNet',
      label: 'Salaire net',
      sortable: true,
      width: 140,
      render: (value) => (
        <div className='text-sm font-bold text-gray-900'>
          {new Intl.NumberFormat('fr-MA', {
            style: 'currency',
            currency: 'MAD'
          }).format(value as number)}
        </div>
      )
    },
    {
      data: 'statut',
      label: 'Statut',
      sortable: true,
      width: 120,
      render: (value) => getStatutBadge(value as string)
    },
    {
      data: 'employeId',
      label: 'Actions',
      sortable: false,
      width: 80,
      render: (_value, row) => (
        <div className='flex justify-center'>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='ghost'
                size='sm'
                className='hover:bg-primary/10 hover:text-primary h-8 w-8 p-0 transition-colors'
                onClick={() => handleViewBulletin(row.employeId)}
              >
                <Eye className='h-4 w-4' />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Voir le bulletin</TooltipContent>
          </Tooltip>
        </div>
      )
    }
  ];

  const employeesFilters: CustomTableFilterConfig[] = [
    {
      field: 'nomComplet',
      label: 'Nom',
      type: 'text'
    },
    {
      field: 'numeroEmploye',
      label: 'N° Employé',
      type: 'text'
    },
    {
      field: 'statut',
      label: 'Statut',
      type: 'datatable-select',
      options: [
        { label: 'Tous', value: '' },
        { label: 'En cours', value: 'en_cours' },
        { label: 'Validé', value: 'valide' },
        { label: 'Payé', value: 'paye' }
      ]
    }
  ];

  const safeFormatDate = (val?: string, fmt: string = 'dd MMMM yyyy') => {
    if (!val) return '—';
    const parsed = new Date(val);
    if (isNaN(parsed.getTime())) return '—';
    return format(parsed, fmt, { locale: fr });
  };

  if (loading) {
    return (
      <PageContainer scrollable={false}>
        <div className='flex h-full w-full flex-col space-y-6'>
          <div className='flex flex-shrink-0 items-center justify-between'>
            <div className='flex items-center space-x-4'>
              <Skeleton className='h-10 w-10 rounded-lg' />
              <div className='space-y-2'>
                <Skeleton className='h-8 w-64 rounded' />
                <Skeleton className='h-4 w-48 rounded' />
              </div>
            </div>
            <Skeleton className='h-10 w-32 rounded-lg' />
          </div>
          <Skeleton className='h-12 w-full rounded-lg' />
          <Skeleton className='w-full flex-1 rounded-xl' />
        </div>
      </PageContainer>
    );
  }

  if (!periode) {
    return (
      <div className='flex h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100'>
        <Card className='w-96 border-0 shadow-xl'>
          <CardHeader className='space-y-3'>
            <div className='mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100'>
              <ArrowLeft className='h-6 w-6 text-red-600' />
            </div>
            <CardTitle className='text-center text-2xl'>
              Période non trouvée
            </CardTitle>
            <CardDescription className='text-center'>
              La période de paie demandée n&apos;existe pas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => router.push('/admin/paie/periode')}
              className='w-full'
              size='lg'
            >
              <ArrowLeft className='mr-2 h-4 w-4' />
              Retour à la liste
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <PageContainer scrollable={false}>
      <div className='flex h-full w-full flex-col space-y-6'>
        {/* En-tête amélioré */}
        <div className='flex flex-shrink-0 items-center justify-between rounded-xl border bg-gradient-to-r from-white to-gray-50 p-2 shadow-sm'>
          <div className='flex items-center space-x-4'>
            <Button
              variant='ghost'
              size='icon'
              onClick={() => router.push('/admin/paie/periode')}
              className='rounded-lg hover:bg-gray-100'
            >
              <ArrowLeft className='h-5 w-5' />
            </Button>
            <div>
              <h1 className='bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-3xl font-bold text-transparent'>
                {periode.nom}
              </h1>
              <p className='mt-1 flex items-center gap-2 text-sm text-gray-600'>
                <Calendar className='h-4 w-4' />
                Du {safeFormatDate(periode.dateDebut)} au{' '}
                {safeFormatDate(periode.dateFin)}
              </p>
            </div>
          </div>

          <div className='flex items-center gap-3'>
            {getStatutBadge(periode.statut)}

            {/* Menu Actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='outline'
                  size='sm'
                  className='gap-2 shadow-sm transition-shadow hover:shadow-md'
                  disabled={!!actionLoading}
                >
                  {actionLoading ? (
                    <Loader2 className='h-4 w-4 animate-spin' />
                  ) : (
                    <MoreVertical className='h-4 w-4' />
                  )}
                  Actions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='w-56'>
                <DropdownMenuLabel className='font-semibold'>
                  Actions de période
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={handleClotureClick}
                  disabled={periode.statut !== 'en_cours' || !!actionLoading}
                  className='cursor-pointer gap-2'
                >
                  <Lock className='h-4 w-4' />
                  <span>Clôturer la période</span>
                  {actionLoading === 'cloture' && (
                    <Loader2 className='ml-auto h-3 w-3 animate-spin' />
                  )}
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={handleGeneratePDF}
                  disabled={!!actionLoading}
                  className='cursor-pointer gap-2'
                >
                  <FileText className='h-4 w-4' />
                  <span>Générer tous les PDF A4</span>
                  {actionLoading === 'pdf' && (
                    <Loader2 className='ml-auto h-3 w-3 animate-spin' />
                  )}
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={handleSendEmails}
                  disabled={!!actionLoading}
                  className='cursor-pointer gap-2'
                >
                  <Mail className='h-4 w-4' />
                  <span>Envoyer les bulletins par email</span>
                  {actionLoading === 'email' && (
                    <Loader2 className='ml-auto h-3 w-3 animate-spin' />
                  )}
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={handleExportData}
                  disabled={!!actionLoading}
                  className='cursor-pointer gap-2'
                >
                  <Download className='h-4 w-4' />
                  <span>Exporter les données</span>
                  {actionLoading === 'export' && (
                    <Loader2 className='ml-auto h-3 w-3 animate-spin' />
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Onglets stylisés */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className='flex min-h-0 flex-1 flex-col space-y-4'
        >
          <TabsList className='grid h-10 w-full flex-shrink-0 grid-cols-3 rounded-lg border bg-white p-1 shadow-sm'>
            <TabsTrigger
              value='employes'
              className='data-[state=active]:bg-primary rounded-md p-1 transition-all data-[state=active]:text-white data-[state=active]:shadow-sm'
            >
              <Users className='mr-2 h-4 w-4' />
              <span className='font-medium'>Employés</span>
            </TabsTrigger>
            <TabsTrigger
              value='bulletin'
              className='data-[state=active]:bg-primary rounded-md p-1 transition-all data-[state=active]:text-white data-[state=active]:shadow-sm'
            >
              <DollarSign className='mr-2 h-4 w-4' />
              <span className='font-medium'>Bulletin de paie</span>
            </TabsTrigger>
            <TabsTrigger
              value='virements'
              className='data-[state=active]:bg-primary rounded-md p-1 transition-all data-[state=active]:text-white data-[state=active]:shadow-sm'
            >
              <Calendar className='mr-2 h-4 w-4' />
              <span className='font-medium'>Virements</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value='employes'
            className='mt-0 flex min-h-0 flex-1 flex-col'
          >
            <Card className='flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border-gray-200 pt-0 pb-0 shadow-sm'>
              <CardHeader className='flex-shrink-0 border-b bg-gradient-to-r from-white to-gray-50 pt-2 pb-0'>
                <div className='flex items-center justify-between pb-0'>
                  <div>
                    <CardTitle className='text-xl'>
                      Employés de la période
                    </CardTitle>
                    <CardDescription className='mt-1'>
                      {periode.nombreEmployes} employé(s) • Montant total:{' '}
                      {new Intl.NumberFormat('fr-MA', {
                        style: 'currency',
                        currency: 'MAD'
                      }).format(periode.montantTotal)}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className='flex min-h-0 flex-1 flex-col overflow-hidden p-2'>
                <CustomTable<BulletinPaie>
                  columns={employeesColumns}
                  url={apiRoutes.admin.paies.bulletins.list(periodeId)}
                  filters={employeesFilters}
                  onInit={(instance) => setTableInstance(instance)}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='bulletin' className='min-h-0 flex-1'>
            <BulletinTab
              periodeId={periodeId}
              selectedEmployeeId={selectedEmployeeId}
              onEmployeeChange={setSelectedEmployeeId}
              periodeStatut={periode.statut}
            />
          </TabsContent>

          <TabsContent value='virements' className='min-h-0 flex-1'>
            <VirementsTab periodeId={periodeId} />
          </TabsContent>
        </Tabs>

        {/* Modal de confirmation pour la clôture de période */}
        <Dialog open={showClotureModal} onOpenChange={setShowClotureModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmer la clôture</DialogTitle>
              <DialogDescription>
                Voulez-vous vraiment clôturer cette période de paie ? Cette
                action est irréversible.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant='outline'
                onClick={() => setShowClotureModal(false)}
              >
                Annuler
              </Button>
              <Button
                onClick={() => {
                  setShowClotureModal(false);
                  handleCloturePeriode();
                }}
              >
                Confirmer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageContainer>
  );
}
