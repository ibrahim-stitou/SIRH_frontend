'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Download,
  Send,
  Search,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileText
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import apiClient from '@/lib/api';
import { apiRoutes } from '@/config/apiRoutes';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';

interface Virement {
  id: string;
  employeId: string;
  numeroEmploye: string;
  nomComplet: string;
  rib: string;
  montant: number;
  statut: string;
}

interface VirementsTabProps {
  periodeId: string;
}

export default function VirementsTab({ periodeId }: VirementsTabProps) {
  const [virements, setVirements] = useState<Virement[]>([]);
  const [filteredVirements, setFilteredVirements] = useState<Virement[]>([]);
  const [selectedVirements, setSelectedVirements] = useState<Set<string>>(
    new Set()
  );
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    const fetchVirements = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(
          apiRoutes.admin.paies.virements.list(periodeId)
        );
        const payload = response.data;
        const list = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data)
            ? payload.data
            : [];
        setVirements(list);
        setFilteredVirements(list);
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVirements();
  }, [periodeId]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredVirements(virements);
      return;
    }

    const filtered = virements.filter(
      (virement) =>
        virement.nomComplet.toLowerCase().includes(searchTerm.toLowerCase()) ||
        virement.numeroEmploye
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        virement.rib.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredVirements(filtered);
  }, [searchTerm, virements]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const pendingIds = filteredVirements
        .filter((v) => v.statut !== 'paye')
        .map((v) => v.employeId);
      setSelectedVirements(new Set(pendingIds));
    } else {
      setSelectedVirements(new Set());
    }
  };

  const handleSelectVirement = (employeId: string, checked: boolean) => {
    const newSelection = new Set(selectedVirements);
    if (checked) {
      newSelection.add(employeId);
    } else {
      newSelection.delete(employeId);
    }
    setSelectedVirements(newSelection);
  };

  const handleExecuteVirements = async () => {
    if (selectedVirements.size === 0) {
      alert('Veuillez sélectionner au moins un virement');
      return;
    }
    setShowConfirmModal(true);
  };

  const confirmExecuteVirements = async () => {
    setShowConfirmModal(false);
    try {
      setExecuting(true);
      await apiClient.post(apiRoutes.admin.paies.virements.execute(periodeId), {
        employeIds: Array.from(selectedVirements)
      });

      // Recharger les virements
      const virementsResponse = await apiClient.get(
        apiRoutes.admin.paies.virements.list(periodeId)
      );
      const payload = virementsResponse.data;
      const list = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
          ? payload.data
          : [];
      setVirements(list);
      setFilteredVirements(list);
      setSelectedVirements(new Set());
      setShowSuccess(true);

      setTimeout(() => setShowSuccess(false), 5000);
    } catch (error) {
      console.error('Erreur:', error);
      alert("Erreur lors de l'exécution des virements");
    } finally {
      setExecuting(false);
    }
  };

  const handleExportSEPA = () => {
    // Générer un fichier SEPA XML (simplifié)
    const selectedVirementsData = virements.filter((v) =>
      selectedVirements.has(v.employeId)
    );

    const csvContent = [
      ['Numéro employé', 'Nom complet', 'RIB', 'Montant'].join(';'),
      ...selectedVirementsData.map((v) =>
        [v.numeroEmploye, v.nomComplet, v.rib, v.montant.toFixed(2)].join(';')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `virements_${periodeId}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalSelected = Array.from(selectedVirements).reduce(
    (acc, employeId) => {
      const virement = virements.find((v) => v.employeId === employeId);
      return acc + (virement?.montant || 0);
    },
    0
  );

  const totalVirements = Array.isArray(virements)
    ? virements.reduce((acc, v) => acc + (Number(v.montant) || 0), 0)
    : 0;
  const virementsEnAttente = Array.isArray(virements)
    ? virements.filter((v) => v.statut !== 'paye').length
    : 0;
  const virementsPayes = Array.isArray(virements)
    ? virements.filter((v) => v.statut === 'paye').length
    : 0;

  const getStatutBadge = (statut: string) => {
    if (statut === 'paye') {
      return (
        <Badge variant='outline' className='text-green-600'>
          <CheckCircle2 className='mr-1 h-3 w-3' />
          Payé
        </Badge>
      );
    }
    return (
      <Badge variant='default'>
        <AlertCircle className='mr-1 h-3 w-3' />
        En attente
      </Badge>
    );
  };

  if (loading) {
    // Skeletons for table rows and actions
    return (
      <div className='space-y-6'>
        <Card>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <div>
                <Skeleton className='mb-2 h-6 w-48' />
                <Skeleton className='h-4 w-32' />
              </div>
              <div className='flex items-center gap-2'>
                <Skeleton className='h-10 w-64' />
                <Skeleton className='h-10 w-32' />
                <Skeleton className='h-10 w-40' />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className='rounded-md border'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className='w-[50px]'>
                      <Skeleton className='h-5 w-5 rounded' />
                    </TableHead>
                    <TableHead>
                      <Skeleton className='h-4 w-20' />
                    </TableHead>
                    <TableHead>
                      <Skeleton className='h-4 w-32' />
                    </TableHead>
                    <TableHead>
                      <Skeleton className='h-4 w-32' />
                    </TableHead>
                    <TableHead className='text-center'>
                      <Skeleton className='h-4 w-20' />
                    </TableHead>
                    <TableHead>
                      <Skeleton className='h-4 w-16' />
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Skeleton className='h-5 w-5 rounded' />
                      </TableCell>
                      <TableCell>
                        <Skeleton className='h-4 w-20' />
                      </TableCell>
                      <TableCell>
                        <Skeleton className='h-4 w-32' />
                      </TableCell>
                      <TableCell>
                        <Skeleton className='h-4 w-32' />
                      </TableCell>
                      <TableCell>
                        <Skeleton className='h-4 w-20' />
                      </TableCell>
                      <TableCell>
                        <Skeleton className='h-4 w-16' />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Modal de confirmation d'exécution des virements */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer l&apos;exécution</DialogTitle>
            <DialogDescription>
              Voulez-vous vraiment exécuter {selectedVirements.size} virement(s)
              ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setShowConfirmModal(false)}
            >
              Annuler
            </Button>
            <Button onClick={confirmExecuteVirements} disabled={executing}>
              {executing ? (
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              ) : null}
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Message de succès */}
      {showSuccess && (
        <Alert className='border-green-500 bg-green-50'>
          <CheckCircle2 className='h-4 w-4 text-green-600' />
          <AlertTitle className='text-green-800'>
            Virements exécutés avec succès
          </AlertTitle>
          <AlertDescription className='text-green-700'>
            Les virements sélectionnés ont été marqués comme payés.
          </AlertDescription>
        </Alert>
      )}

      {/* Actions et recherche */}
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle>Gestion des virements</CardTitle>
              <CardDescription>
                {selectedVirements.size > 0 && (
                  <span className='text-primary font-medium'>
                    {selectedVirements.size} virement(s) sélectionné(s) -{' '}
                    {new Intl.NumberFormat('fr-MA', {
                      style: 'currency',
                      currency: 'MAD'
                    }).format(totalSelected)}
                  </span>
                )}
              </CardDescription>
            </div>
            <div className='flex items-center gap-2'>
              <div className='relative w-64'>
                <Search className='text-muted-foreground absolute top-2.5 left-2 h-4 w-4' />
                <Input
                  placeholder='Rechercher...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='pl-8'
                />
              </div>
              <Button
                variant='outline'
                onClick={handleExportSEPA}
                disabled={selectedVirements.size === 0}
              >
                <Download className='mr-2 h-4 w-4' />
                Exporter SEPA
              </Button>
              <Button
                onClick={handleExecuteVirements}
                disabled={selectedVirements.size === 0 || executing}
              >
                {executing ? (
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                ) : (
                  <Send className='mr-2 h-4 w-4' />
                )}
                Exécuter les virements
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className='rounded-md border'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className='w-[50px]'>
                    <Checkbox
                      checked={
                        selectedVirements.size > 0 &&
                        selectedVirements.size ===
                          filteredVirements.filter((v) => v.statut !== 'paye')
                            .length
                      }
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>N° Employé</TableHead>
                  <TableHead>Nom complet</TableHead>
                  <TableHead>RIB</TableHead>
                  <TableHead className='text-center'>Montant</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVirements.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className='h-24 text-center'>
                      Aucun virement trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredVirements.map((virement) => (
                    <TableRow key={virement.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedVirements.has(virement.employeId)}
                          onCheckedChange={(checked) =>
                            handleSelectVirement(
                              virement.employeId,
                              checked as boolean
                            )
                          }
                          disabled={virement.statut === 'paye'}
                        />
                      </TableCell>
                      <TableCell className='font-medium'>
                        {virement.numeroEmploye}
                      </TableCell>
                      <TableCell>{virement.nomComplet}</TableCell>
                      <TableCell className='font-mono text-sm'>
                        {virement.rib}
                      </TableCell>
                      <TableCell className='font-medium'>
                        {new Intl.NumberFormat('fr-MA', {
                          style: 'currency',
                          currency: 'MAD'
                        }).format(virement.montant)}
                      </TableCell>
                      <TableCell>{getStatutBadge(virement.statut)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
              {filteredVirements.length > 0 && (
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={4} className='font-bold'>
                      Total
                    </TableCell>
                    <TableCell className='font-bold'>
                      {new Intl.NumberFormat('fr-MA', {
                        style: 'currency',
                        currency: 'MAD'
                      }).format(
                        filteredVirements.reduce((acc, v) => acc + v.montant, 0)
                      )}
                    </TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableFooter>
              )}
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
