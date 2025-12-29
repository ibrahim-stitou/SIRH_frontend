'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Plus, Loader2, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import apiClient from '@/lib/api';
import { apiRoutes } from '@/config/apiRoutes';
import { useForm, useWatch } from 'react-hook-form';
import { SelectField } from '@/components/custom/SelectField';

interface ElementVariable {
  rubriquePaieId: string;
  libelle: string;
  type: string;
  montant: number;
  base?: number;
  taux?: number;
  quantite?: number;
  // Nouveaux champs patronaux
  tauxPatronal?: number;
  montantPatronal?: number;
}

interface BulletinPaie {
  id: string;
  employeId: string;
  numeroEmploye: string;
  nomComplet: string;
  poste: string;
  departement: string;
  dateEmbauche: string;
  rib: string;
  cnss: string;
  joursTravailles: number;
  joursConges: number;
  joursAbsences: number;
  joursRecuperationPayes: number;
  heuresTravaillees: number;
  salaireBase: number;
  tauxHoraire: number;
  elementsVariables: ElementVariable[];
  totalGains: number;
  salaireBrut: number;
  salaireBrutImposable: number;
  cotisations: ElementVariable[];
  totalCotisations: number;
  autresElements: ElementVariable[];
  totalAutres: number;
  salaireNet: number;
  cumulAnnuel: {
    salaireBrut: number;
    cotisations: number;
    salaireNet: number;
    ir: number;
  };
}

interface RubriquePaie {
  id: string;
  code: string;
  libelle: string;
  type: string;
  categorie: string;
  base: string;
  taux: number | null;
}

interface BulletinTabProps {
  periodeId: string;
  selectedEmployeeId: string | null;
  onEmployeeChange: (employeeId: string) => void;
}

export default function BulletinTab({
  periodeId,
  selectedEmployeeId,
  onEmployeeChange,
}: BulletinTabProps) {
  const [bulletin, setBulletin] = useState<BulletinPaie | null>(null);
  const [rubriques, setRubriques] = useState<RubriquePaie[]>([]);
  const [loading, setLoading] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [employeesOptions, setEmployeesOptions] = useState<Array<{ id: number | string; label: string }>>([]);

  // Form for employee selector
  const { control, setValue } = useForm<{ employeeId: string | number }>({
    defaultValues: { employeeId: (selectedEmployeeId as any) ?? undefined },
  });

  // État pour l'ajout d'un élément variable
  const [newElement, setNewElement] = useState({
    rubriquePaieId: '',
    montant: '',
    base: '',
    taux: '',
    quantite: '',
    commentaire: '',
  });

  // Charger les rubriques de paie
  useEffect(() => {
    const fetchRubriques = async () => {
      try {
        const response = await apiClient.get(apiRoutes.admin.paies.rubriques.list);
        setRubriques(response.data.data);
      } catch (error) {
        console.error('Erreur:', error);
      }
    };

    fetchRubriques();
  }, []);

  // Charger la liste simple des employés pour le sélecteur
  useEffect(() => {
    const fetchEmployeesSimple = async () => {
      try {
        const resp = await apiClient.get(apiRoutes.admin.employees.simpleList);
        const opts = (resp.data?.data || resp.data || [])
          .map((e: any) => ({ id: e.id, label: `${e.firstName || ''} ${e.lastName || ''}`.trim() }))
          .filter((o: any) => o.id !== undefined && o.label);
        setEmployeesOptions(opts);
        // Keep form in sync with selectedEmployeeId
        if (selectedEmployeeId) {
          setValue('employeeId', selectedEmployeeId as any);
        }
      } catch (error) {
        console.error('Erreur chargement employés:', error);
      }
    };
    fetchEmployeesSimple();
  }, [selectedEmployeeId, setValue]);

  // Charger le bulletin de l'employé sélectionné
  useEffect(() => {
    const fetchBulletin = async () => {
      if (!selectedEmployeeId) return;

      try {
        setLoading(true);
        const response = await apiClient.get(
          apiRoutes.admin.paies.bulletins.show(periodeId, selectedEmployeeId)
        );
        setBulletin(response.data.data);
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBulletin();
  }, [periodeId, selectedEmployeeId]);

  const handleAddElement = async () => {
    if (!newElement.rubriquePaieId || !newElement.montant) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const rubrique = rubriques.find((r) => r.id === newElement.rubriquePaieId);
    if (!rubrique) return;

    try {
      const response = await apiClient.post(
        apiRoutes.admin.paies.bulletins.addElement(periodeId, selectedEmployeeId!),
        {
          rubriquePaieId: rubrique.id,
          libelle: rubrique.libelle,
          type: rubrique.type,
          montant: parseFloat(newElement.montant),
          base: newElement.base ? parseFloat(newElement.base) : null,
          taux: newElement.taux ? parseFloat(newElement.taux) : null,
          quantite: newElement.quantite ? parseFloat(newElement.quantite) : null,
          commentaire: newElement.commentaire,
        }
      );

      setBulletin(response.data);

      // Réinitialiser le formulaire
      setNewElement({
        rubriquePaieId: '',
        montant: '',
        base: '',
        taux: '',
        quantite: '',
        commentaire: '',
      });
      setSheetOpen(false);
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'ajout de l\'élément');
    }
  };

  const handleDeleteElement = async (rubriqueId: string) => {
    if (!confirm('Voulez-vous vraiment supprimer cet élément ?')) return;

    try {
      const response = await apiClient.delete(
        apiRoutes.admin.paies.bulletins.deleteElement(periodeId, selectedEmployeeId!, rubriqueId)
      );

      setBulletin(response.data);
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la suppression de l\'élément');
    }
  };

  // Helper: render employee selector
  const EmployeeSelector = (
    <div className="md:w-72 w-full">
      <SelectField<{ employeeId: string | number }, 'employeeId'>
        name="employeeId"
        label="Employé"
        control={control}
        options={employeesOptions}
        required
        placeholder="Sélectionner un employé"
        onFocus={undefined}
        className=""
      />
      {/* React to value changes by subscribing via setValue hook trigger */}
      {/* Since SelectField uses react-hook-form Controller, we can listen to change via a hidden effect using control._formValues if available. */}
    </div>
  );

  // Subscribe to form value changes to propagate selection
  const employeeId = useWatch({ control, name: 'employeeId' });
  useEffect(() => {
    if (employeeId !== undefined && employeeId !== null && String(employeeId) !== String(selectedEmployeeId)) {
      onEmployeeChange(String(employeeId));
    }
  }, [employeeId, onEmployeeChange, selectedEmployeeId]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!bulletin && !selectedEmployeeId) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Bulletin de paie</CardTitle>
              <CardDescription>
                Sélectionnez un employé pour afficher son bulletin
              </CardDescription>
            </div>
            {EmployeeSelector}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <p>Aucun employé sélectionné</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!bulletin) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Bulletin de paie</CardTitle>
              <CardDescription>Chargement du bulletin...</CardDescription>
            </div>
            {EmployeeSelector}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Informations employé */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{bulletin.nomComplet}</CardTitle>
              <CardDescription>
                {bulletin.poste} - {bulletin.departement}
              </CardDescription>
            </div>
            {EmployeeSelector}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <Label className="text-muted-foreground">N° Employé</Label>
              <div className="font-medium">{bulletin.numeroEmploye}</div>
            </div>
            <div>
              <Label className="text-muted-foreground">CNSS</Label>
              <div className="font-medium">{bulletin.cnss}</div>
            </div>
            <div>
              <Label className="text-muted-foreground">RIB</Label>
              <div className="font-medium">{bulletin.rib}</div>
            </div>
            <div>
              <Label className="text-muted-foreground">Date d&apos;embauche</Label>
              <div className="font-medium">
                {new Date(bulletin.dateEmbauche).toLocaleDateString('fr-FR')}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informations de temps */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Informations de temps</CardTitle>
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen} >
              <SheetTrigger asChild>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter une rubrique
                </Button>
              </SheetTrigger>
              <SheetContent className="sm:max-w-xl">
                <SheetHeader>
                  <SheetTitle>Ajouter un élément variable</SheetTitle>
                  <SheetDescription>
                    Ajoutez un nouvel élément variable au bulletin de paie
                  </SheetDescription>
                </SheetHeader>
                <ScrollArea className="h-[calc(100vh-200px)] pr-4 p-4">
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="rubrique">Rubrique *</Label>
                      <Select
                        value={newElement.rubriquePaieId}
                        onValueChange={(value) =>
                          setNewElement({ ...newElement, rubriquePaieId: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez une rubrique" />
                        </SelectTrigger>
                        <SelectContent>
                          {rubriques
                            .filter((r) => r.type === 'gain' || r.type === 'autre')
                            .map((r) => (
                              <SelectItem key={r.id} value={r.id}>
                                {r.code} - {r.libelle} ({r.type})
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="montant">Montant *</Label>
                      <Input
                        id="montant"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={newElement.montant}
                        onChange={(e) =>
                          setNewElement({ ...newElement, montant: e.target.value })
                        }
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="base">Base</Label>
                        <Input
                          id="base"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={newElement.base}
                          onChange={(e) =>
                            setNewElement({ ...newElement, base: e.target.value })
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="taux">Taux</Label>
                        <Input
                          id="taux"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={newElement.taux}
                          onChange={(e) =>
                            setNewElement({ ...newElement, taux: e.target.value })
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="quantite">Quantité</Label>
                      <Input
                        id="quantite"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={newElement.quantite}
                        onChange={(e) =>
                          setNewElement({ ...newElement, quantite: e.target.value })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="commentaire">Commentaire</Label>
                      <Input
                        id="commentaire"
                        placeholder="Commentaire optionnel"
                        value={newElement.commentaire}
                        onChange={(e) =>
                          setNewElement({ ...newElement, commentaire: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </ScrollArea>
                <SheetFooter>
                  <div className="w-full flex items-center justify-end gap-2">
                  <SheetClose asChild className="w-1/2">
                    <Button variant="outline">Annuler</Button>
                  </SheetClose>
                  <Button onClick={handleAddElement} className="w-1/2">Ajouter</Button>
                  </div>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            <div>
              <Label className="text-muted-foreground">Jours travaillés</Label>
              <div className="text-2xl font-bold">{bulletin.joursTravailles}</div>
            </div>
            <div>
              <Label className="text-muted-foreground">Jours de congé</Label>
              <div className="text-2xl font-bold">{bulletin.joursConges}</div>
            </div>
            <div>
              <Label className="text-muted-foreground">Jours d&apos;absence</Label>
              <div className="text-2xl font-bold">{bulletin.joursAbsences}</div>
            </div>
            <div>
              <Label className="text-muted-foreground">Jours récup. payés</Label>
              <div className="text-2xl font-bold">{bulletin.joursRecuperationPayes}</div>
            </div>
            <div>
              <Label className="text-muted-foreground">Heures travaillées</Label>
              <div className="text-2xl font-bold">{bulletin.heuresTravaillees}h</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulletin de paie détaillé */}
      <Card>
        <CardHeader>
          <CardTitle>Bulletin de paie</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Section 1: Gains */}
          <div>
            <div className="mb-4 flex items-center">
              <Badge className="bg-green-500">Gains</Badge>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Libellé</TableHead>
                  <TableHead className="text-right">Base</TableHead>
                  <TableHead className="text-right">Taux</TableHead>
                  <TableHead className="text-right">Montant</TableHead>
                  <TableHead className="text-right">Taux patronal</TableHead>
                  <TableHead className="text-right">Montant patronal</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Salaire de base</TableCell>
                  <TableCell className="">{bulletin.heuresTravaillees}h</TableCell>
                  <TableCell className="">
                    {bulletin.tauxHoraire.toFixed(2)} MAD/h
                  </TableCell>
                  <TableCell className="">
                    {bulletin.salaireBase.toFixed(2)} MAD
                  </TableCell>
                  <TableCell className="">-</TableCell>
                  <TableCell className="">-</TableCell>
                  <TableCell></TableCell>
                </TableRow>
                {bulletin.elementsVariables?.map((ev, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{ev.libelle}</TableCell>
                    <TableCell className="">
                      {ev.base ? `${ev.base.toFixed(2)}` : '-'}
                    </TableCell>
                    <TableCell className="">
                      {ev.taux ? `${ev.taux.toFixed(2)}` : '-'}
                    </TableCell>
                    <TableCell className="">{ev.montant.toFixed(2)} MAD</TableCell>
                    <TableCell className="">
                      {ev.tauxPatronal !== undefined && ev.tauxPatronal !== null
                        ? `${ev.tauxPatronal.toFixed(2)}`
                        : '-'}
                    </TableCell>
                    <TableCell className="">
                      {ev.montantPatronal !== undefined && ev.montantPatronal !== null
                        ? `${ev.montantPatronal.toFixed(2)} MAD`
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDeleteElement(ev.rubriquePaieId)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={3} className="font-bold">
                    Salaire brut
                  </TableCell>
                  <TableCell className=" font-bold">
                    {bulletin.salaireBrut.toFixed(2)} MAD
                  </TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={3} className="font-bold">
                    Salaire brut imposable
                  </TableCell>
                  <TableCell className=" font-bold">
                    {bulletin.salaireBrutImposable.toFixed(2)} MAD
                  </TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>

          <Separator />

          {/* Section 2: Cotisations */}
          <div>
            <div className="mb-4 flex items-center">
              <Badge className="bg-red-500">Cotisations</Badge>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Libellé</TableHead>
                  <TableHead className="text-right">Base</TableHead>
                  <TableHead className="text-right">Taux</TableHead>
                  <TableHead className="text-right">Montant</TableHead>
                  <TableHead className="text-right">Taux patronal</TableHead>
                  <TableHead className="text-right">Montant patronal</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bulletin.cotisations?.map((cot, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{cot.libelle}</TableCell>
                    <TableCell className="">
                      {cot.base ? `${cot.base.toFixed(2)}` : '-'}
                    </TableCell>
                    <TableCell className="">
                      {cot.taux ? `${cot.taux.toFixed(2)}%` : '-'}
                    </TableCell>
                    <TableCell className=" text-red-600">
                      {cot.montant.toFixed(2)} MAD
                    </TableCell>
                    <TableCell className="">
                      {cot.tauxPatronal !== undefined && cot.tauxPatronal !== null
                        ? `${cot.tauxPatronal.toFixed(2)}%`
                        : '-'}
                    </TableCell>
                    <TableCell className="text-red-600">
                      {cot.montantPatronal !== undefined && cot.montantPatronal !== null
                        ? `${cot.montantPatronal.toFixed(2)} MAD`
                        : '-'}
                    </TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={3} className="font-bold">
                    Total cotisations
                  </TableCell>
                  <TableCell className=" font-bold text-red-600">
                    {bulletin.totalCotisations.toFixed(2)} MAD
                  </TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>

          <Separator />

          {/* Section 3: Autres éléments */}
          {bulletin.autresElements && bulletin.autresElements.length > 0 && (
            <div>
              <div className="mb-4 flex items-center">
                <Badge className="bg-blue-500">Autres éléments</Badge>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Libellé</TableHead>
                    <TableHead className="text-right">Montant</TableHead>
                    <TableHead className="text-right">Taux patronal</TableHead>
                    <TableHead className="text-right">Montant patronal</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bulletin.autresElements.map((autre, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{autre.libelle}</TableCell>
                      <TableCell
                        className={` ${
                          autre.montant < 0 ? 'text-red-600' : 'text-green-600'
                        }`}
                      >
                        {autre.montant.toFixed(2)} MAD
                      </TableCell>
                      <TableCell className="">
                        {autre.tauxPatronal !== undefined && autre.tauxPatronal !== null
                          ? `${autre.tauxPatronal.toFixed(2)}`
                          : '-'}
                      </TableCell>
                      <TableCell className="">
                        {autre.montantPatronal !== undefined && autre.montantPatronal !== null
                          ? `${autre.montantPatronal.toFixed(2)} MAD`
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDeleteElement(autre.rubriquePaieId)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <Separator />

          {/* Totaux finaux */}
          <div className="rounded-lg bg-primary/5 p-4">
            <div className="flex items-center justify-between text-2xl font-bold">
              <span>Salaire net à payer</span>
              <span className="text-primary">
                {new Intl.NumberFormat('fr-MA', {
                  style: 'currency',
                  currency: 'MAD',
                }).format(bulletin.salaireNet)}
              </span>
            </div>
          </div>

          {/* Cumuls annuels */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">Cumuls annuels</h3>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="rounded-lg border p-4">
                <Label className="text-muted-foreground">Salaire brut</Label>
                <div className="mt-2 text-xl font-bold">
                  {bulletin.cumulAnnuel.salaireBrut.toFixed(2)} MAD
                </div>
              </div>
              <div className="rounded-lg border p-4">
                <Label className="text-muted-foreground">Cotisations</Label>
                <div className="mt-2 text-xl font-bold text-red-600">
                  {bulletin.cumulAnnuel.cotisations.toFixed(2)} MAD
                </div>
              </div>
              <div className="rounded-lg border p-4">
                <Label className="text-muted-foreground">Salaire net</Label>
                <div className="mt-2 text-xl font-bold text-green-600">
                  {bulletin.cumulAnnuel.salaireNet.toFixed(2)} MAD
                </div>
              </div>
              <div className="rounded-lg border p-4">
                <Label className="text-muted-foreground">IR</Label>
                <div className="mt-2 text-xl font-bold">
                  {bulletin.cumulAnnuel.ir.toFixed(2)} MAD
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
