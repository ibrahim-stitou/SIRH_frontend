"use client";

import React from "react"

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Loader2 } from "lucide-react";
import type {
  OffreFormData,
  ResponsableRecrutement,
  TypeContrat,
  StatutOffre,
  OffreEmploi,
} from "@/types/offre";
import { createOffre, updateOffre, getResponsables } from "@/services/offreService";

interface OffreFormProps {
  offre?: OffreEmploi;
  mode: "create" | "edit";
}

const initialFormData: OffreFormData = {
  intitulePoste: "",
  descriptionPoste: "",
  missionsPrincipales: [],
  profilRecherche: { formation: "", experience: "" },
  competencesRequises: [],
  lieuTravail: "",
  typeContrat: "CDI",
  fourchetteSalaire: null,
  dateLimiteCandidature: "",
  responsableRecrutementId: 0,
  statut: "brouillon",
  diffusion: {
    siteCarrieres: true,
    linkedin: false,
    rekrute: false,
    emploiMa: false,
    reseauxSociaux: false,
  },
  anonyme: false,
};

export function OffreForm({ offre, mode }: OffreFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<OffreFormData>(initialFormData);
  const [responsables, setResponsables] = useState<ResponsableRecrutement[]>([]);
  const [newMission, setNewMission] = useState("");
  const [newCompetence, setNewCompetence] = useState("");
  const [showSalaire, setShowSalaire] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getResponsables().then(setResponsables).catch(console.error);

    if (offre && mode === "edit") {
      setFormData({
        intitulePoste: offre.intitulePoste,
        descriptionPoste: offre.descriptionPoste,
        missionsPrincipales: offre.missionsPrincipales,
        profilRecherche: offre.profilRecherche,
        competencesRequises: offre.competencesRequises,
        lieuTravail: offre.lieuTravail,
        typeContrat: offre.typeContrat,
        fourchetteSalaire: offre.fourchetteSalaire,
        dateLimiteCandidature: offre.dateLimiteCandidature,
        responsableRecrutementId: offre.responsableRecrutement.id,
        statut: offre.statut,
        diffusion: offre.diffusion,
        anonyme: offre.anonyme,
      });
      setShowSalaire(!!offre.fourchetteSalaire);
    }
  }, [offre, mode]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfilChange = (field: "formation" | "experience", value: string) => {
    setFormData((prev) => ({
      ...prev,
      profilRecherche: { ...prev.profilRecherche, [field]: value },
    }));
  };

  const handleSalaireChange = (field: "min" | "max", value: string) => {
    const numValue = parseInt(value) || 0;
    setFormData((prev) => ({
      ...prev,
      fourchetteSalaire: {
        min: field === "min" ? numValue : (prev.fourchetteSalaire?.min || 0),
        max: field === "max" ? numValue : (prev.fourchetteSalaire?.max || 0),
        devise: "MAD",
      },
    }));
  };

  const addMission = () => {
    if (newMission.trim()) {
      setFormData((prev) => ({
        ...prev,
        missionsPrincipales: [...prev.missionsPrincipales, newMission.trim()],
      }));
      setNewMission("");
    }
  };

  const removeMission = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      missionsPrincipales: prev.missionsPrincipales.filter((_, i) => i !== index),
    }));
  };

  const addCompetence = () => {
    if (newCompetence.trim()) {
      setFormData((prev) => ({
        ...prev,
        competencesRequises: [...prev.competencesRequises, newCompetence.trim()],
      }));
      setNewCompetence("");
    }
  };

  const removeCompetence = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      competencesRequises: prev.competencesRequises.filter((_, i) => i !== index),
    }));
  };

  const handleDiffusionChange = (
    channel: keyof typeof formData.diffusion,
    checked: boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      diffusion: { ...prev.diffusion, [channel]: checked },
    }));
  };

  const handleSubmit = async (saveAs: StatutOffre) => {
    setIsLoading(true);
    setError(null);

    try {
      const responsable = responsables.find(
        (r) => r.id === formData.responsableRecrutementId
      );

      if (!responsable) {
        throw new Error("Veuillez sélectionner un responsable de recrutement");
      }

      const dataToSave = {
        ...formData,
        statut: saveAs,
        fourchetteSalaire: showSalaire ? formData.fourchetteSalaire : null,
      };

      if (mode === "create") {
        await createOffre(dataToSave, responsable);
      } else if (offre) {
        await updateOffre(offre.id, {
          ...dataToSave,
          responsableRecrutement: responsable,
        });
      }

      router.push("/admin/offres");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="space-y-8">
      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Informations générales */}
      <Card>
        <CardHeader>
          <CardTitle>Informations générales</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="intitulePoste">Intitulé du poste *</Label>
              <Input
                id="intitulePoste"
                name="intitulePoste"
                value={formData.intitulePoste}
                onChange={handleInputChange}
                placeholder="Ex: Développeur Full Stack"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lieuTravail">Lieu de travail *</Label>
              <Input
                id="lieuTravail"
                name="lieuTravail"
                value={formData.lieuTravail}
                onChange={handleInputChange}
                placeholder="Ex: Casablanca, Maroc"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descriptionPoste">Description du poste *</Label>
            <Textarea
              id="descriptionPoste"
              name="descriptionPoste"
              value={formData.descriptionPoste}
              onChange={handleInputChange}
              placeholder="Décrivez le poste et l'environnement de travail..."
              rows={4}
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="typeContrat">Type de contrat *</Label>
              <Select
                value={formData.typeContrat}
                onValueChange={(value: TypeContrat) =>
                  setFormData((prev) => ({ ...prev, typeContrat: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CDI">CDI</SelectItem>
                  <SelectItem value="CDD">CDD</SelectItem>
                  <SelectItem value="Stage">Stage</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateLimiteCandidature">
                Date limite de candidature *
              </Label>
              <Input
                id="dateLimiteCandidature"
                name="dateLimiteCandidature"
                type="date"
                value={formData.dateLimiteCandidature}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Missions principales */}
      <Card>
        <CardHeader>
          <CardTitle>Missions principales</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newMission}
              onChange={(e) => setNewMission(e.target.value)}
              placeholder="Ajouter une mission..."
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addMission())}
            />
            <Button type="button" onClick={addMission} size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-2">
            {formData.missionsPrincipales.map((mission, index) => (
              <div
                key={index}
                className="flex items-center gap-2 bg-muted px-3 py-2 rounded-lg"
              >
                <span className="flex-1">{mission}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => removeMission(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Profil recherché */}
      <Card>
        <CardHeader>
          <CardTitle>Profil recherché</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="formation">Formation requise *</Label>
            <Input
              id="formation"
              value={formData.profilRecherche.formation}
              onChange={(e) => handleProfilChange("formation", e.target.value)}
              placeholder="Ex: Bac+5 en informatique ou équivalent"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="experience">Expérience requise *</Label>
            <Input
              id="experience"
              value={formData.profilRecherche.experience}
              onChange={(e) => handleProfilChange("experience", e.target.value)}
              placeholder="Ex: 3-5 ans d'expérience en développement web"
              required
            />
          </div>
        </CardContent>
      </Card>

      {/* Compétences requises */}
      <Card>
        <CardHeader>
          <CardTitle>Compétences requises</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newCompetence}
              onChange={(e) => setNewCompetence(e.target.value)}
              placeholder="Ajouter une compétence..."
              onKeyDown={(e) =>
                e.key === "Enter" && (e.preventDefault(), addCompetence())
              }
            />
            <Button type="button" onClick={addCompetence} size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.competencesRequises.map((competence, index) => (
              <Badge key={index} variant="secondary" className="gap-1 px-3 py-1">
                {competence}
                <button
                  type="button"
                  onClick={() => removeCompetence(index)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Salaire */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Fourchette salariale
            <span className="text-sm font-normal text-muted-foreground">
              (optionnel)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="showSalaire"
              checked={showSalaire}
              onCheckedChange={(checked) => setShowSalaire(checked as boolean)}
            />
            <Label htmlFor="showSalaire">Afficher la fourchette salariale</Label>
          </div>
          {showSalaire && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="salaireMin">Salaire minimum (MAD)</Label>
                <Input
                  id="salaireMin"
                  type="number"
                  value={formData.fourchetteSalaire?.min || ""}
                  onChange={(e) => handleSalaireChange("min", e.target.value)}
                  placeholder="Ex: 15000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salaireMax">Salaire maximum (MAD)</Label>
                <Input
                  id="salaireMax"
                  type="number"
                  value={formData.fourchetteSalaire?.max || ""}
                  onChange={(e) => handleSalaireChange("max", e.target.value)}
                  placeholder="Ex: 25000"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Responsable et options */}
      <Card>
        <CardHeader>
          <CardTitle>Responsable et options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="responsable">Responsable de recrutement *</Label>
            <Select
              value={formData.responsableRecrutementId.toString()}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  responsableRecrutementId: parseInt(value),
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez un responsable" />
              </SelectTrigger>
              <SelectContent>
                {responsables.map((r) => (
                  <SelectItem key={r.id} value={r.id.toString()}>
                    {r.nom} - {r.departement}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="anonyme"
              checked={formData.anonyme}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, anonyme: checked as boolean }))
              }
            />
            <Label htmlFor="anonyme">
              Offre anonyme (masquer le nom de l&apos;entreprise)
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Multi-diffusion */}
      <Card>
        <CardHeader>
          <CardTitle>Multi-diffusion automatique</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="siteCarrieres"
                checked={formData.diffusion.siteCarrieres}
                onCheckedChange={(checked) =>
                  handleDiffusionChange("siteCarrieres", checked as boolean)
                }
              />
              <Label htmlFor="siteCarrieres">Site carrières entreprise</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="linkedin"
                checked={formData.diffusion.linkedin}
                onCheckedChange={(checked) =>
                  handleDiffusionChange("linkedin", checked as boolean)
                }
              />
              <Label htmlFor="linkedin">LinkedIn</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="rekrute"
                checked={formData.diffusion.rekrute}
                onCheckedChange={(checked) =>
                  handleDiffusionChange("rekrute", checked as boolean)
                }
              />
              <Label htmlFor="rekrute">Rekrute.com</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="emploiMa"
                checked={formData.diffusion.emploiMa}
                onCheckedChange={(checked) =>
                  handleDiffusionChange("emploiMa", checked as boolean)
                }
              />
              <Label htmlFor="emploiMa">Emploi.ma</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="reseauxSociaux"
                checked={formData.diffusion.reseauxSociaux}
                onCheckedChange={(checked) =>
                  handleDiffusionChange("reseauxSociaux", checked as boolean)
                }
              />
              <Label htmlFor="reseauxSociaux">Réseaux sociaux</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/offres")}
          disabled={isLoading}
          className="bg-transparent"
        >
          Annuler
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => handleSubmit("brouillon")}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          Enregistrer en brouillon
        </Button>
        <Button
          type="button"
          onClick={() => handleSubmit("publiee")}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          Publier l&apos;offre
        </Button>
      </div>
    </form>
  );
}
