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
  TableRow
} from '@/components/ui/table';
import { Eye, Search, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import apiClient from '@/lib/api';
import { apiRoutes } from '@/config/apiRoutes';

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

interface EmployeesTabProps {
  periodeId: string;
  onViewBulletin: (employeeId: string) => void;
}

export default function EmployeesTab({
  periodeId,
  onViewBulletin
}: EmployeesTabProps) {
  const [bulletins, setBulletins] = useState<BulletinPaie[]>([]);
  const [filteredBulletins, setFilteredBulletins] = useState<BulletinPaie[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchBulletins = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(
          apiRoutes.admin.paies.bulletins.list(periodeId)
        );
        const data = response.data.data || response.data;
        setBulletins(data);
        setFilteredBulletins(data);
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBulletins();
  }, [periodeId]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredBulletins(bulletins);
      return;
    }

    const filtered = bulletins.filter(
      (bulletin) =>
        bulletin.nomComplet.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bulletin.numeroEmploye
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        bulletin.poste.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bulletin.departement.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredBulletins(filtered);
  }, [searchTerm, bulletins]);

  const getStatutBadge = (statut: string) => {
    const variants: Record<
      string,
      {
        label: string;
        variant: 'default' | 'secondary' | 'destructive' | 'outline';
      }
    > = {
      en_cours: { label: 'En cours', variant: 'default' },
      valide: { label: 'Validé', variant: 'secondary' },
      paye: { label: 'Payé', variant: 'outline' }
    };

    const config = variants[statut] || { label: statut, variant: 'outline' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <Loader2 className='text-primary h-8 w-8 animate-spin' />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div>
            <CardTitle>Employés de la période</CardTitle>
            <CardDescription>
              {filteredBulletins.length} employé(s) trouvé(s)
            </CardDescription>
          </div>
          <div className='relative w-64'>
            <Search className='text-muted-foreground absolute top-2.5 left-2 h-4 w-4' />
            <Input
              placeholder='Rechercher un employé...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='pl-8'
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className='rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>N° Employé</TableHead>
                <TableHead>Nom complet</TableHead>
                <TableHead>Poste</TableHead>
                <TableHead>Département</TableHead>
                <TableHead className='text-right'>Salaire net</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className='text-right'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBulletins.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className='h-24 text-center'>
                    Aucun employé trouvé
                  </TableCell>
                </TableRow>
              ) : (
                filteredBulletins.map((bulletin) => (
                  <TableRow key={bulletin.id}>
                    <TableCell className='font-medium'>
                      {bulletin.numeroEmploye}
                    </TableCell>
                    <TableCell>{bulletin.nomComplet}</TableCell>
                    <TableCell>{bulletin.poste}</TableCell>
                    <TableCell>{bulletin.departement}</TableCell>
                    <TableCell className='text-right font-medium'>
                      {new Intl.NumberFormat('fr-MA', {
                        style: 'currency',
                        currency: 'MAD'
                      }).format(bulletin.salaireNet)}
                    </TableCell>
                    <TableCell>{getStatutBadge(bulletin.statut)}</TableCell>
                    <TableCell className='text-right'>
                      <Button
                        size='sm'
                        variant='outline'
                        onClick={() => onViewBulletin(bulletin.employeId)}
                      >
                        <Eye className='mr-2 h-4 w-4' />
                        Voir la paie
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
