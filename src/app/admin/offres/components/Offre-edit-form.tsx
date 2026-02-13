"use client";

import React, { useState, useEffect } from "react";
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
import { DatePickerField } from "@/components/custom/DatePickerField";
import { OffreEmploi } from "@/types/PosteOffre";

// 🔥 Interface pour les données de l'offre reçues de l'API
interface OffreFromAPI {
  id: number;
  reference: string;
  poste?: {
    id: number;
    libelle: string;
  };
  descriptionPoste: string;
  missionsPrincipales: string[];
  competencesRequises: Array<{
    id: number;
    libelle: string;
    categorie: string;
  }>;
  lieuTravail: string;
  typeContrat: string;
  salaireMin?: number;
  salaireMax?: number;
  dateLimiteCandidature: string;
  profilRecherche: {
    formation: string;
    experience: string;
  };
  responsableRecrutement?: {
    id: number;
    nom: string;
  };
  diffusion?: Array<{
    id: number;
    libelle: string;
  }>;
  statut: string;
}

interface Poste {
  id: number;
  code: string;
  libelle: string;
  departement_id: number;
  is_active: boolean;
  metier: {
    id: number;
    code: string;
    libelle: string;
  };
  emploi: {
    id: number;
    code: string;
    libelle: string;
  };
}

interface Competence {
  id: number;
  libelle: string;
  categorie: string;
  description?: string;
  createdAt?: string;
}

interface Canal {
  id: number;
  libelle: string;
}

interface Responsable {
  id: number;
  nom: string;
  email: string;
  departement: string;
}

interface FormData {
  reference: string;
  description: string;
  posteId: number | null;
  intitulePoste: string;
  lieuTravail: string;
  typeContrat: string;
  salaireMin: number;
  salaireMax: number;
  dateLimiteCandidature: string;
  responsableId: number | null;
  missions: string[];
  profilRecherche: {
    formation: string;
    experience: string;
  };
  competenceIds: number[];
  canalIds: number[];
}

interface OffreEditFormProps {
  offre: OffreEmploi;
}

export function OffreEditForm({ offre }: OffreEditFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    reference: "",
    description: "",
    posteId: null,
    intitulePoste: "",
    lieuTravail: "",
    typeContrat: "CDI",
    salaireMin: 0,
    salaireMax: 0,
    dateLimiteCandidature: "",
    responsableId: null,
    missions: [],
    profilRecherche: {
      formation: "",
      experience: "",
    },
    competenceIds: [],
    canalIds: [],
  });

  const [postes, setPostes] = useState<Poste[]>([]);
  const [filteredPostes, setFilteredPostes] = useState<Poste[]>([]);
  const [competences, setCompetences] = useState<Competence[]>([]);
  const [filteredCompetences, setFilteredCompetences] = useState<Competence[]>([]);
  const [selectedCompetences, setSelectedCompetences] = useState<Competence[]>([]);
  const [canaux, setCanaux] = useState<Canal[]>([]);
  const [responsables, setResponsables] = useState<Responsable[]>([]);
  
  const [searchPoste, setSearchPoste] = useState("");
  const [searchCompetence, setSearchCompetence] = useState("");
  const [showPosteDropdown, setShowPosteDropdown] = useState(false);
  const [showCompetenceDropdown, setShowCompetenceDropdown] = useState(false);
  
  const [newMission, setNewMission] = useState("");
  const [showSalaire, setShowSalaire] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Charger les données au montage du composant
  useEffect(() => {
    loadPostes();
    loadCompetences();
    loadCanaux();
    loadResponsables();
    populateFormWithData(offre);
  }, [offre]);

  // 🔥 Remplir le formulaire avec les données de l'offre
  const populateFormWithData = (data: OffreFromAPI) => {
    setFormData({
      reference: data.reference || "",
      description: data.descriptionPoste || "",
      posteId: data.poste?.id || null,
      intitulePoste: data.poste?.libelle || "",
      lieuTravail: data.lieuTravail || "",
      typeContrat: data.typeContrat || "CDI",
      salaireMin: data.salaireMin || 0,
      salaireMax: data.salaireMax || 0,
      dateLimiteCandidature: data.dateLimiteCandidature?.split('T')[0] || "",
      responsableId: data.responsableRecrutement?.id || null,
      missions: data.missionsPrincipales || [],
      profilRecherche: data.profilRecherche || {
        formation: "",
        experience: "",
      },
      competenceIds: data.competencesRequises?.map(c => c.id) || [],
      canalIds: data.diffusion?.map(d => d.id) || [],
    });

    // Charger les compétences sélectionnées
    if (data.competencesRequises) {
      setSelectedCompetences(data.competencesRequises);
    }

    // Définir searchPoste pour l'affichage
    if (data.poste?.libelle) {
      setSearchPoste(data.poste.libelle);
    }

    // Afficher la section salaire si des valeurs existent
    if (data.salaireMin || data.salaireMax) {
      setShowSalaire(true);
    }
  };

  // Filtrer les postes selon la recherche
  useEffect(() => {
    if (searchPoste.trim() === "") {
      setFilteredPostes([]);
    } else {
      const filtered = postes.filter((poste) =>
        poste.libelle.toLowerCase().includes(searchPoste.toLowerCase()) ||
        poste.code.toLowerCase().includes(searchPoste.toLowerCase())
      );
      setFilteredPostes(filtered);
    }
  }, [searchPoste, postes]);

  // Filtrer les compétences selon la recherche
  useEffect(() => {
    if (searchCompetence.trim() === "") {
      setFilteredCompetences([]);
    } else {
      const filtered = competences.filter((comp) =>
        comp.libelle.toLowerCase().includes(searchCompetence.toLowerCase()) &&
        !selectedCompetences.some((selected) => selected.id === comp.id)
      );
      setFilteredCompetences(filtered);
    }
  }, [searchCompetence, competences, selectedCompetences]);

  const loadPostes = async () => {
    try {
      const response = await fetch("http://localhost:3001/settings/postes");
      const result = await response.json();
      if (result.status === "success") {
        setPostes(result.data.filter((p: Poste) => p.is_active));
      }
    } catch (err) {
      console.error("Erreur lors du chargement des postes:", err);
    }
  };

  const loadCompetences = async () => {
    try {
      const response = await fetch("http://localhost:3001/settings/competences");
      const result = await response.json();
      setCompetences(result.data);
    } catch (err) {
      console.error("Erreur lors du chargement des compétences:", err);
    }
  };

  const loadCanaux = async () => {
    try {
      const response = await fetch("http://localhost:3001/canaux/getAll");
      const result = await response.json();
      setCanaux(result);
    } catch (err) {
      console.error("Erreur lors du chargement des canaux:", err);
    }
  };

  const loadResponsables = async () => {
    try {
      const response = await fetch("http://localhost:3001/responsables");
      const result = await response.json();
      if (result.status === "success") {
        setResponsables(result.data);
      }
    } catch (err) {
      console.error("Erreur lors du chargement des responsables:", err);
    }
  };

  const handlePosteSelect = (poste: Poste) => {
    setFormData((prev) => ({
      ...prev,
      posteId: poste.id,
      intitulePoste: poste.libelle,
    }));
    setSearchPoste(poste.libelle);
    setShowPosteDropdown(false);
  };

  const handleCompetenceSelect = (competence: Competence) => {
    if (!selectedCompetences.some((c) => c.id === competence.id)) {
      setSelectedCompetences((prev) => [...prev, competence]);
      setFormData((prev) => ({
        ...prev,
        competenceIds: [...prev.competenceIds, competence.id],
      }));
    }
    setSearchCompetence("");
    setShowCompetenceDropdown(false);
  };

  const removeCompetence = (competenceId: number) => {
    setSelectedCompetences((prev) => prev.filter((c) => c.id !== competenceId));
    setFormData((prev) => ({
      ...prev,
      competenceIds: prev.competenceIds.filter((id) => id !== competenceId),
    }));
  };

  const addMission = () => {
    if (newMission.trim()) {
      setFormData((prev) => ({
        ...prev,
        missions: [...prev.missions, newMission.trim()],
      }));
      setNewMission("");
    }
  };

  const removeMission = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      missions: prev.missions.filter((_, i) => i !== index),
    }));
  };

  const handleCanalChange = (canalId: number, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      canalIds: checked
        ? [...prev.canalIds, canalId]
        : prev.canalIds.filter((id) => id !== canalId),
    }));
  };

  // 🔥 Fonction de soumission adaptée au format de votre API
  const handleSubmit = async (statut: "brouillon" | "publiee") => {
    setIsLoading(true);
    setError(null);

    try {
      const statutMapping: Record<string, string> = {
        brouillon: "BROUILLON",
        publiee: "PUBLIQUE",
      };

      // 🔥 Payload au format exact de votre API PATCH
      const payload = {
        offre: {
          reference: formData.reference,
          description: formData.description,
          posteId: formData.posteId,
          lieuTravail: formData.lieuTravail,
          typeContrat: formData.typeContrat,
          salaireMin: showSalaire ? formData.salaireMin : undefined,
          salaireMax: showSalaire ? formData.salaireMax : undefined,
          dateLimiteCandidature: formData.dateLimiteCandidature,
          responsableId: formData.responsableId,
          statut: statutMapping[statut],
        },
        missions: formData.missions, // Array de strings
        profilRecherche: formData.profilRecherche, // { formation, experience }
        competenceIds: formData.competenceIds, // Array d'IDs
        canalIds: formData.canalIds, // Array d'IDs
      };

      console.log("📤 Payload envoyé:", JSON.stringify(payload, null, 2));

      const response = await fetch(`http://localhost:3001/offres/${offre.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Erreur lors de la modification de l'offre");
      }

      const result = await response.json();
      console.log("✅ Réponse API:", result);

      router.push("/admin/offres");
      router.refresh();
    } catch (err) {
      console.error("❌ Erreur:", err);
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Actions - En haut du formulaire */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-end">
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
          Mettre à jour
        </Button>
      </div>

      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        {/* Informations générales */}
        <Card>
          <CardHeader>
            <CardTitle>Informations générales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="reference">Référence de l&apos;offre *</Label>
                <Input
                  id="reference"
                  name="reference"
                  value={formData.reference}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, reference: e.target.value }))
                  }
                  placeholder="Ex: OFF-2026-010"
                  required
                />
              </div>
              <div className="space-y-2 relative">
                <Label htmlFor="intitulePoste">Intitulé du poste *</Label>
                <Input
                  id="intitulePoste"
                  name="intitulePoste"
                  value={searchPoste}
                  onChange={(e) => setSearchPoste(e.target.value)}
                  onFocus={() => setShowPosteDropdown(true)}
                  placeholder="Ex: Développeur Full Stack"
                  required
                  autoComplete="off"
                />
                {showPosteDropdown && filteredPostes.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                    {filteredPostes.map((poste) => (
                      <div
                        key={poste.id}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => handlePosteSelect(poste)}
                      >
                        <div className="font-medium">{poste.libelle}</div>
                        <div className="text-sm text-gray-500">
                          {poste.code} - {poste.metier.libelle}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="lieuTravail">Lieu de travail *</Label>
                <Input
                  id="lieuTravail"
                  name="lieuTravail"
                  value={formData.lieuTravail}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, lieuTravail: e.target.value }))
                  }
                  placeholder="Ex: Casablanca, Maroc"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="typeContrat">Type de contrat *</Label>
                <Select
                  value={formData.typeContrat}
                  onValueChange={(value) =>
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
            </div>

            <DatePickerField
              name="dateLimiteCandidature"
              label="Date limite de candidature"
              value={formData.dateLimiteCandidature}
              onChange={(date) =>
                setFormData((prev) => ({
                  ...prev,
                  dateLimiteCandidature: date || "",
                }))
              }
              required
              placeholder="Sélectionnez une date"
              minDate={new Date(new Date().setHours(0, 0, 0, 0))}
              hint="La date à partir de laquelle les candidatures ne seront plus acceptées"
              showClearButton={true}
            />
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
              {formData.missions.map((mission, index) => (
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
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    profilRecherche: {
                      ...prev.profilRecherche,
                      formation: e.target.value,
                    },
                  }))
                }
                placeholder="Ex: Bac+5 en informatique ou équivalent"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="experience">Expérience requise *</Label>
              <Input
                id="experience"
                value={formData.profilRecherche.experience}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    profilRecherche: {
                      ...prev.profilRecherche,
                      experience: e.target.value,
                    },
                  }))
                }
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
            <div className="flex gap-2 relative">
              <Input
                value={searchCompetence}
                onChange={(e) => setSearchCompetence(e.target.value)}
                onFocus={() => setShowCompetenceDropdown(true)}
                placeholder="Rechercher une compétence..."
                autoComplete="off"
              />
              <Button type="button" size="icon" disabled>
                <Plus className="h-4 w-4" />
              </Button>
              {showCompetenceDropdown && filteredCompetences.length > 0 && (
                <div className="absolute z-10 w-full mt-12 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                  {filteredCompetences.map((competence) => (
                    <div
                      key={competence.id}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleCompetenceSelect(competence)}
                    >
                      <div className="font-medium">{competence.libelle}</div>
                      {competence.categorie && (
                        <div className="text-sm text-gray-500">
                          {competence.categorie}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedCompetences.map((competence) => (
                <Badge key={competence.id} variant="secondary" className="gap-1 px-3 py-1">
                  {competence.libelle}
                  <button
                    type="button"
                    onClick={() => removeCompetence(competence.id)}
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
                    value={formData.salaireMin || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        salaireMin: parseInt(e.target.value) || 0,
                      }))
                    }
                    placeholder="Ex: 15000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salaireMax">Salaire maximum (MAD)</Label>
                  <Input
                    id="salaireMax"
                    type="number"
                    value={formData.salaireMax || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        salaireMax: parseInt(e.target.value) || 0,
                      }))
                    }
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
                value={formData.responsableId?.toString() || ""}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    responsableId: value ? parseInt(value) : null,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un responsable" />
                </SelectTrigger>
                <SelectContent>
                  {responsables.map((responsable) => (
                    <SelectItem key={responsable.id} value={responsable.id.toString()}>
                      {responsable.nom} - {responsable.departement}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              {canaux.map((canal) => (
                <div key={canal.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`canal-${canal.id}`}
                    checked={formData.canalIds.includes(canal.id)}
                    onCheckedChange={(checked) =>
                      handleCanalChange(canal.id, checked as boolean)
                    }
                  />
                  <Label htmlFor={`canal-${canal.id}`}>{canal.libelle}</Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Description du poste */}
        <Card>
          <CardHeader>
            <CardTitle>Description du poste</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Décrivez le poste et l'environnement de travail..."
                rows={4}
                required
              />
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}