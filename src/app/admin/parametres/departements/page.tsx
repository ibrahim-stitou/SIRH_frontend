/**
 * EXEMPLE - Page de gestion des départements
 * Ce fichier sert d'exemple pour créer les pages de gestion des autres paramètres
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2, Plus, Pencil, Trash2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { toast } from '@/components/ui/sonner';

// Type pour un département
interface Departement {
  id: string;
  code: string;
  libelle: string;
}

export default function DepartementsPage() {
  const [departements, setDepartements] = useState<Departement[]>([
    { id: '1', code: '01', libelle: 'Ressources Humaines' },
    { id: '2', code: '02', libelle: 'Informatique' },
    { id: '3', code: '03', libelle: 'Commercial' },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDepartement, setEditingDepartement] = useState<Departement | null>(null);
  const [formData, setFormData] = useState({ code: '', libelle: '' });

  const handleSubmit = () => {
    if (editingDepartement) {
      // Mise à jour
      setDepartements(
        departements.map((d) =>
          d.id === editingDepartement.id
            ? { ...d, code: formData.code, libelle: formData.libelle }
            : d
        )
      );
      toast.success('Département modifié', {
        description: 'Le département a été modifié avec succès.',
      });
    } else {
      // Création
      const newDepartement: Departement = {
        id: Date.now().toString(),
        code: formData.code,
        libelle: formData.libelle,
      };
      setDepartements([...departements, newDepartement]);
      toast.success('Département créé', {
        description: 'Le département a été créé avec succès.',
      });
    }
    resetForm();
  };

  const handleEdit = (departement: Departement) => {
    setEditingDepartement(departement);
    setFormData({ code: departement.code, libelle: departement.libelle });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setDepartements(departements.filter((d) => d.id !== id));
    toast.error('Département supprimé', {
      description: 'Le département a été supprimé avec succès.',
    });
  };

  const resetForm = () => {
    setFormData({ code: '', libelle: '' });
    setEditingDepartement(null);
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec navigation retour */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link href="/parametres">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Building2 className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Départements</h1>
                <p className="text-muted-foreground">
                  Gérez la structure organisationnelle de l&apos;entreprise
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bouton d'ajout */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau département
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingDepartement ? 'Modifier le département' : 'Nouveau département'}
              </DialogTitle>
              <DialogDescription>
                {editingDepartement
                  ? 'Modifiez les informations du département.'
                  : 'Créez un nouveau département dans l\'organisation.'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="code">Code</Label>
                <Input
                  id="code"
                  placeholder="Ex: 01"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="libelle">Libellé</Label>
                <Input
                  id="libelle"
                  placeholder="Ex: Ressources Humaines"
                  value={formData.libelle}
                  onChange={(e) => setFormData({ ...formData, libelle: e.target.value })}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={resetForm}>
                Annuler
              </Button>
              <Button onClick={handleSubmit}>
                {editingDepartement ? 'Modifier' : 'Créer'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tableau des départements */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des départements</CardTitle>
          <CardDescription>
            {departements.length} département(s) enregistré(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Libellé</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {departements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                    Aucun département enregistré
                  </TableCell>
                </TableRow>
              ) : (
                departements.map((departement) => (
                  <TableRow key={departement.id}>
                    <TableCell className="font-medium">{departement.code}</TableCell>
                    <TableCell>{departement.libelle}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(departement)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(departement.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

