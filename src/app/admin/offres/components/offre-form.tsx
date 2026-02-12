"use client";

import React, { useState, useEffect, useRef } from "react";
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
import { X, Plus, Loader2, Search } from "lucide-react";
import type {
  OffreFormData,
  ResponsableRecrutement,
  TypeContrat,
  StatutOffre,
  OffreEmploi,
  Competence,
  CanalDiffusion,
} from "@/types/offre";
import { createOffre, updateOffre } from "@/services/offreService";
import { getResponsables, getCompetences, getCanaux } from "@/services/formService";
import { z } from "zod";
import { offreFormSchema } from "./offre-form.schema";

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

export function OffreFormOptimized({ offre, mode }: OffreFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<OffreFormData>(initialFormData);
  
  // États pour les données API
  const [responsables, setResponsables] = useState<ResponsableRecrutement[]>([]);
  const [competences, setCompetences] = useState<Competence[]>([]);
  const [canaux, setCanaux] = useState<CanalDiffusion[]>([]);
  
  // États pour le chargement lazy
  const [competencesLoaded, setCompetencesLoaded] = useState(false);
  const [canauxLoaded, setCanauxLoaded] = useState(false);
  const [isLoadingCompetences, setIsLoadingCompetences] = useState(false);
  const [isLoadingCanaux, setIsLoadingCanaux] = useState(false);
  
  // États pour la recherche de compétences
  const [competenceSearch, setCompetenceSearch] = useState("");
  const [filteredCompetences, setFilteredCompetences] = useState<Competence[]>([]);
  const [showCompetenceDropdown, setShowCompetenceDropdown] = useState(false);
  
  // États existants
  const [newMission, setNewMission] = useState("");
  const [showSalaire, setShowSalaire] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  // État pour le chargement initial
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Ref pour gérer le dropdown
  const competenceSearchRef = useRef<HTMLDivElement>(null);
  const canauxSectionRef = useRef<HTMLDivElement>(null);

  // Charger uniquement les responsables au montage
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoadingData(true);
      try {
        const resps = await getResponsables();
        setResponsables(resps);

        // Si mode édition, charger les données de l'offre
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
          
          // Si l'offre a des compétences, charger la liste complète
          if (offre.competencesRequises.length > 0) {
            loadCompetences();
          }
          
          // Si l'offre a des canaux actifs, charger la liste
          if (Object.values(offre.diffusion).some(v => v)) {
            loadCanaux();
          }
        }
      } catch (err) {
        console.error("Erreur lors du chargement des données:", err);
        setError("Impossible de charger les données du formulaire");
      } finally {
        setIsLoadingData(false);
      }
    };

    loadInitialData();
  }, [offre, mode]);

  // Charger les compétences à la demande
  const loadCompetences = async () => {
    if (competencesLoaded) return;
    
    setIsLoadingCompetences(true);
    try {
      const comps = await getCompetences();
      setCompetences(comps);
      setCompetencesLoaded(true);
    } catch (err) {
      console.error("Erreur lors du chargement des compétences:", err);
      setError("Impossible de charger les compétences");
    } finally {
      setIsLoadingCompetences(false);
    }
  };

  // Charger les canaux à la demande
  const loadCanaux = async () => {
    if (canauxLoaded) return;
    
    setIsLoadingCanaux(true);
    try {
      const chlns = await getCanaux();
      setCanaux(chlns);
      setCanauxLoaded(true);
    } catch (err) {
      console.error("Erreur lors du chargement des canaux:", err);
      setError("Impossible de charger les canaux de diffusion");
    } finally {
      setIsLoadingCanaux(false);
    }
  };

  // Observer pour charger les canaux quand la section devient visible
  useEffect(() => {
    if (!canauxSectionRef.current || canauxLoaded) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadCanaux();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(canauxSectionRef.current);

    return () => observer.disconnect();
  }, [canauxLoaded]);

  // Filtrer les compétences en fonction de la recherche
  useEffect(() => {
    if (competenceSearch.trim()) {
      const filtered = competences.filter((comp) =>
        comp.libelle.toLowerCase().includes(competenceSearch.toLowerCase()) ||
        comp.categorie.toLowerCase().includes(competenceSearch.toLowerCase())
      );
      setFilteredCompetences(filtered);
    } else {
      setFilteredCompetences([]);
    }
  }, [competenceSearch, competences]);

  // Gérer les clics en dehors du dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        competenceSearchRef.current &&
        !competenceSearchRef.current.contains(event.target as Node)
      ) {
        setShowCompetenceDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setValidationErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
  };

  const handleProfilChange = (field: "formation" | "experience", value: string) => {
    setFormData((prev) => ({
      ...prev,
      profilRecherche: { ...prev.profilRecherche, [field]: value },
    }));
    setValidationErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[`profilRecherche.${field}`];
      return newErrors;
    });
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
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.missionsPrincipales;
        return newErrors;
      });
    }
  };

  const removeMission = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      missionsPrincipales: prev.missionsPrincipales.filter((_, i) => i !== index),
    }));
  };

  // Gérer le focus sur le champ de recherche des compétences
  const handleCompetenceSearchFocus = () => {
    setShowCompetenceDropdown(true);
    // Charger les compétences si pas encore chargées
    if (!competencesLoaded) {
      loadCompetences();
    }
  };

  // Ajouter une compétence depuis la recherche
  const addCompetence = (competence: Competence) => {
    const isAlreadySelected = formData.competencesRequises.some((c) =>
      typeof c === "object" ? c.id === competence.id : c === competence.libelle
    );

    if (!isAlreadySelected) {
      setFormData((prev) => ({
        ...prev,
        competencesRequises: [...prev.competencesRequises, competence],
      }));
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.competencesRequises;
        return newErrors;
      });
    }

    setCompetenceSearch("");
    setShowCompetenceDropdown(false);
  };

  // Retirer une compétence
  const removeCompetence = (competence: Competence | string) => {
    setFormData((prev) => ({
      ...prev,
      competencesRequises: prev.competencesRequises.filter((c) =>
        typeof c === "object" && typeof competence === "object"
          ? c.id !== competence.id
          : c !== competence
      ),
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

  const validateForm = (dataToValidate: OffreFormData): boolean => {
    try {
      offreFormSchema.parse(dataToValidate);
      setValidationErrors({});
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        err.errors.forEach((error) => {
          const path = error.path.join(".");
          errors[path] = error.message;
        });
        setValidationErrors(errors);
      }
      return false;
    }
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

      if (saveAs === "publiee" && !validateForm(dataToSave)) {
        setError("Veuillez corriger les erreurs dans le formulaire");
        setIsLoading(false);
        return;
      }

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

  const getFieldError = (fieldPath: string): string | undefined => {
    return validationErrors[fieldPath];
  };

  // Afficher un loader pendant le chargement initial
  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Chargement du formulaire...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Actions - Top Right */}
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
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Enregistrer en brouillon
        </Button>
        <Button
          type="button"
          onClick={() => handleSubmit("publiee")}
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Publier l&apos;offre
        </Button>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <form className="space-y-4">
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
                  className={getFieldError("intitulePoste") ? "border-destructive" : ""}
                />
                {getFieldError("intitulePoste") && (
                  <p className="text-sm text-destructive">
                    {getFieldError("intitulePoste")}
                  </p>
                )}
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
                  className={getFieldError("lieuTravail") ? "border-destructive" : ""}
                />
                {getFieldError("lieuTravail") && (
                  <p className="text-sm text-destructive">
                    {getFieldError("lieuTravail")}
                  </p>
                )}
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
                className={
                  getFieldError("descriptionPoste") ? "border-destructive" : ""
                }
              />
              {getFieldError("descriptionPoste") && (
                <p className="text-sm text-destructive">
                  {getFieldError("descriptionPoste")}
                </p>
              )}
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
                  className={
                    getFieldError("dateLimiteCandidature") ? "border-destructive" : ""
                  }
                />
                {getFieldError("dateLimiteCandidature") && (
                  <p className="text-sm text-destructive">
                    {getFieldError("dateLimiteCandidature")}
                  </p>
                )}
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
                onKeyDown={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addMission())
                }
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
            {getFieldError("missionsPrincipales") && (
              <p className="text-sm text-destructive">
                {getFieldError("missionsPrincipales")}
              </p>
            )}
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
                className={
                  getFieldError("profilRecherche.formation")
                    ? "border-destructive"
                    : ""
                }
              />
              {getFieldError("profilRecherche.formation") && (
                <p className="text-sm text-destructive">
                  {getFieldError("profilRecherche.formation")}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="experience">Expérience requise *</Label>
              <Input
                id="experience"
                value={formData.profilRecherche.experience}
                onChange={(e) => handleProfilChange("experience", e.target.value)}
                placeholder="Ex: 3-5 ans d'expérience en développement web"
                required
                className={
                  getFieldError("profilRecherche.experience")
                    ? "border-destructive"
                    : ""
                }
              />
              {getFieldError("profilRecherche.experience") && (
                <p className="text-sm text-destructive">
                  {getFieldError("profilRecherche.experience")}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Compétences requises avec recherche */}
        <Card>
          <CardHeader>
            <CardTitle>Compétences requises *</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Barre de recherche */}
            <div className="space-y-2" ref={competenceSearchRef}>
              <Label htmlFor="competenceSearch">
                Rechercher et ajouter des compétences
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="competenceSearch"
                  value={competenceSearch}
                  onChange={(e) => {
                    setCompetenceSearch(e.target.value);
                    setShowCompetenceDropdown(true);
                  }}
                  onFocus={handleCompetenceSearchFocus}
                  placeholder="Ex: React, Python, Communication..."
                  className="pl-10"
                  disabled={isLoadingCompetences}
                />
                
                {/* Indicateur de chargement dans le champ */}
                {isLoadingCompetences && (
                  <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                )}
                
                {/* Dropdown des résultats */}
                {showCompetenceDropdown && !isLoadingCompetences && filteredCompetences.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {filteredCompetences.map((competence) => {
                      const isSelected = formData.competencesRequises.some((c) =>
                        typeof c === "object" ? c.id === competence.id : false
                      );
                      
                      return (
                        <div
                          key={competence.id}
                          className={`px-4 py-2 cursor-pointer hover:bg-accent transition-colors ${
                            isSelected ? "bg-accent/50" : ""
                          }`}
                          onClick={() => addCompetence(competence)}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium">{competence.libelle}</p>
                              <p className="text-xs text-muted-foreground">
                                {competence.categorie}
                              </p>
                            </div>
                            {isSelected && (
                              <Badge variant="secondary" className="text-xs">
                                Sélectionné
                              </Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                
                {showCompetenceDropdown && 
                 !isLoadingCompetences &&
                 competenceSearch.trim() && 
                 filteredCompetences.length === 0 && 
                 competencesLoaded && (
                  <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg p-4 text-center text-muted-foreground">
                    Aucune compétence trouvée
                  </div>
                )}
              </div>
            </div>

            {/* Compétences sélectionnées */}
            {formData.competencesRequises.length > 0 && (
              <div className="pt-4 border-t">
                <p className="text-sm font-medium mb-3">
                  Compétences sélectionnées ({formData.competencesRequises.length}):
                </p>
                <div className="flex flex-wrap gap-2">
                  {formData.competencesRequises.map((competence) => {
                    const comp =
                      typeof competence === "object"
                        ? competence
                        : competences.find((c) => c.libelle === competence);
                    
                    return (
                      <Badge
                        key={typeof competence === "object" ? competence.id : competence}
                        variant="secondary"
                        className="gap-2 px-3 py-1.5"
                      >
                        <span>
                          {typeof competence === "object"
                            ? competence.libelle
                            : competence}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeCompetence(comp || competence)}
                          className="ml-1 hover:text-destructive transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}
            
            {getFieldError("competencesRequises") && (
              <p className="text-sm text-destructive">
                {getFieldError("competencesRequises")}
              </p>
            )}
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

        {/* Responsable et canaux de diffusion */}
        <Card ref={canauxSectionRef}>
          <CardHeader>
            <CardTitle>Responsable et diffusion</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Responsable de recrutement */}
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
                <SelectTrigger
                  className={
                    getFieldError("responsableRecrutementId")
                      ? "border-destructive"
                      : ""
                  }
                >
                  <SelectValue placeholder="Sélectionnez un responsable" />
                </SelectTrigger>
                <SelectContent>
                  {responsables.length > 0 ? (
                    responsables.map((r) => (
                      <SelectItem key={r.id} value={r.id.toString()}>
                        {r.nom} {r.email ? `(${r.email})` : ""}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="0" disabled>
                      Aucun responsable disponible
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {getFieldError("responsableRecrutementId") && (
                <p className="text-sm text-destructive">
                  {getFieldError("responsableRecrutementId")}
                </p>
              )}
            </div>

            {/* Canaux de diffusion */}
            <div className="space-y-3">
              <Label>Canaux de diffusion</Label>
              
              {isLoadingCanaux ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Chargement des canaux...</span>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {canaux.length > 0 ? (
                    canaux.map((canal) => (
                      <div key={canal.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`canal-${canal.id}`}
                          checked={
                            formData.diffusion[
                              canal.libelle as keyof typeof formData.diffusion
                            ] || false
                          }
                          onCheckedChange={(checked) =>
                            handleDiffusionChange(
                              canal.libelle as keyof typeof formData.diffusion,
                              checked as boolean
                            )
                          }
                        />
                        <label
                          htmlFor={`canal-${canal.id}`}
                          className="text-sm cursor-pointer"
                        >
                          {canal.libelle}
                        </label>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground col-span-full">
                      Aucun canal de diffusion disponible
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Option anonyme */}
            <div className="flex items-center space-x-2 pt-2 border-t">
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
      </form>
    </div>
  );
}