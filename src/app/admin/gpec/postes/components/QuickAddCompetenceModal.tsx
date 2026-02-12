"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form"; // Ajout
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import apiClient from "@/lib/api";
import { apiRoutes } from "@/config/apiRoutes";

import { addPosteCompetence } from "@/services/poste-competence";
import {
  getCompetenceNiveaux,
  createCompetence
} from "@/services/competenceService";

import { LevelTooltip } from "./level-tooltip";
import { CompetenceNiveau } from "@/types/competence-niveau";
import { SelectField } from "@/components/custom/SelectField"; // Ajout

import { createCompetenceSchema,
  affectationCompetenceSchema,competenceNiveauSchema } from "./competence.schema";

interface Props {
  open: boolean;
  posteId: number;
  onClose: () => void;
  onSuccess: () => void;
}

type Step = "search" | "create";

type NiveauInput = {
  niveau: number;
  libelle: string;
  description: string;
};

type ValidationErrors = {
  categorie?: string;
  description?: string;
  niveaux?: string;
  niveauItems?: Record<number, { niveau?: string; libelle?: string; description?: string }>;
  affectation?: string;
};

export function QuickAddCompetenceModal({
  open,
  posteId,
  onClose,
  onSuccess
}: Props) {
  /** ===== Global ===== */
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [step, setStep] = useState<Step>("search");

  /** ===== Recherche ===== */
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [selectedCompetence, setSelectedCompetence] = useState<any | null>(null);

  /** ===== Création ===== */
  const [categorie, setCategorie] = useState("");
  const [description, setDescription] = useState("");
  const [newNiveaux, setNewNiveaux] = useState<NiveauInput[]>([]);

  /** ===== Affectation ===== */
  const [niveaux, setNiveaux] = useState<CompetenceNiveau[]>([]);
  const [niveauRequis, setNiveauRequis] = useState<number | null>(null);
  
  // Ajout du form pour l'importance
  const importanceForm = useForm({
    defaultValues: {
      importance: 1
    }
  });

  /** 🔄 Reset modal */
  useEffect(() => {
    if (!open) return;

    setStep("search");
    setQuery("");
    setResults([]);
    setSelectedCompetence(null);
    setCategorie("");
    setDescription("");
    setNewNiveaux([]);
    setNiveaux([]);
    setNiveauRequis(null);
    importanceForm.reset({ importance: 1 }); // Reset du form
    setError(null);
    setValidationErrors({});
  }, [open]);

  /** 🔍 Recherche */
  const searchCompetences = async (value: string) => {
    setQuery(value);
    setSelectedCompetence(null);
    setError(null);

    if (!value) {
      setResults([]);
      return;
    }

    const res = await apiClient.get(
      apiRoutes.admin.parametres.competences.list
    );

    const list = Array.isArray(res.data) ? res.data : res.data?.data ?? [];

    setResults(
      list.filter((c: any) =>
        c.libelle.toLowerCase().includes(value.toLowerCase())
      )
    );
  };

  const isNewCompetence =
    step === "search" &&
    query.length > 0 &&
    results.length === 0 &&
    !selectedCompetence;

  /** 📡 Charger niveaux */
  useEffect(() => {
    if (!selectedCompetence) return;

    getCompetenceNiveaux(selectedCompetence.id)
      .then((loadedNiveaux) => {
        console.log("Niveaux chargés:", loadedNiveaux);
        setNiveaux(loadedNiveaux);
      })
      .catch((err) => {
        console.error("Erreur chargement niveaux:", err);
        setNiveaux([]);
      });
  }, [selectedCompetence]);

  /** ✅ Validation création compétence */
  const validateCreateCompetence = () => {
    const errors: ValidationErrors = {};
    
    const result = createCompetenceSchema.safeParse({
      libelle: query,
      categorie,
      description,
      niveaux: newNiveaux
    });

    if (!result.success) {
      const zodErrors = result.error.flatten();
      
      if (zodErrors.fieldErrors.categorie) {
        errors.categorie = zodErrors.fieldErrors.categorie[0];
      }
      if (zodErrors.fieldErrors.description) {
        errors.description = zodErrors.fieldErrors.description[0];
      }
      if (zodErrors.fieldErrors.niveaux) {
        errors.niveaux = zodErrors.fieldErrors.niveaux[0];
      }

      // Validation individuelle des niveaux
      errors.niveauItems = {};
      newNiveaux.forEach((niveau, index) => {
        const niveauResult = competenceNiveauSchema.safeParse(niveau);
        if (!niveauResult.success) {
          const niveauErrors = niveauResult.error.flatten();
          errors.niveauItems![index] = {
            niveau: niveauErrors.fieldErrors.niveau?.[0],
            libelle: niveauErrors.fieldErrors.libelle?.[0],
            description: niveauErrors.fieldErrors.description?.[0]
          };
        }
      });

      if (Object.keys(errors.niveauItems).length === 0) {
        delete errors.niveauItems;
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /** ➕ Création compétence */
  const handleCreateCompetence = async () => {
    setError(null);

    if (!validateCreateCompetence()) {
      return;
    }

    try {
      setLoading(true);

      const savedQuery = query;

      const createdCompetence = await createCompetence({
        libelle: query,
        categorie,
        description,
        niveaux: newNiveaux
      });

      console.log("Compétence créée:", createdCompetence);

      // Revenir à l'étape de recherche
      setStep("search");
      setCategorie("");
      setDescription("");
      setNewNiveaux([]);
      setValidationErrors({});

      // Recharger la liste complète des compétences
      const res = await apiClient.get(
        apiRoutes.admin.parametres.competences.list
      );
      const list = Array.isArray(res.data) ? res.data : res.data?.data ?? [];

      // Trouver la compétence créée
      const foundCompetence = list.find(
        (c: any) => c.libelle.toLowerCase() === savedQuery.toLowerCase()
      );

      console.log("Compétence trouvée:", foundCompetence);

      if (foundCompetence) {
        setSelectedCompetence(foundCompetence);
        setQuery("");
        setResults([]);

        const niveauxLoaded = await getCompetenceNiveaux(foundCompetence.id);
        console.log("Niveaux de la compétence créée:", niveauxLoaded);
        setNiveaux(niveauxLoaded);
      } else if (createdCompetence) {
        setSelectedCompetence(createdCompetence);
        setQuery("");
        setResults([]);

        const niveauxLoaded = await getCompetenceNiveaux(createdCompetence.id);
        console.log("Niveaux de la compétence créée:", niveauxLoaded);
        setNiveaux(niveauxLoaded);
      }
    } catch (e: any) {
      console.error("Erreur création:", e);
      setError(e?.message || "Erreur lors de la création");
    } finally {
      setLoading(false);
    }
  };

  /** ✅ Validation affectation */
  const validateAffectation = () => {
    if (!selectedCompetence || !niveauRequis) {
      setError("Choisis une compétence et un niveau");
      return false;
    }

    const importance = importanceForm.getValues("importance"); // Récupérer la valeur du form

    const result = affectationCompetenceSchema.safeParse({
      posteId,
      competenceId: selectedCompetence.id,
      niveauRequis,
      importance
    });

    if (!result.success) {
      const zodErrors = result.error.flatten();
      setValidationErrors({ 
        affectation: zodErrors.formErrors[0] || "Erreur de validation" 
      });
      return false;
    }

    setValidationErrors({});
    return true;
  };

  /** 🔗 Affectation */
  const handleAffectation = async () => {
    setError(null);

    if (!validateAffectation()) {
      return;
    }

    try {
      setLoading(true);

      const importance = importanceForm.getValues("importance"); // Récupérer la valeur

      await addPosteCompetence({
        poste_id: posteId,
        competence_id: selectedCompetence.id,
        niveau_requis: niveauRequis,
        importance
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      const backendMessage = err?.response?.data?.message;
      setError(backendMessage || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={loading ? undefined : onClose}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ajouter une compétence</DialogTitle>
        </DialogHeader>

        {/* ===== RECHERCHE ===== */}
        {step === "search" && !selectedCompetence && (
          <div className="space-y-3">
            <Input
              placeholder="Ex : Java, React, SQL..."
              value={query}
              onChange={(e) => searchCompetences(e.target.value)}
            />

            {results.length > 0 && (
              <div className="border rounded-md max-h-40 overflow-auto">
                {results.map((c) => (
                  <button
                    key={c.id}
                    className="w-full px-3 py-2 text-left hover:bg-muted"
                    onClick={() => {
                      setSelectedCompetence(c);
                      setResults([]);
                      setQuery("");
                    }}
                  >
                    {c.libelle}
                  </button>
                ))}
              </div>
            )}

            {isNewCompetence && (
              <Button variant="secondary" onClick={() => setStep("create")}>
                ➕ Créer la compétence <b>{query}</b>
              </Button>
            )}
          </div>
        )}

        {/* ===== COMPÉTENCE SÉLECTIONNÉE ===== */}
        {selectedCompetence && (
          <div className="flex items-center justify-between border rounded-md px-3 py-2 bg-muted mt-3">
            <span className="font-medium">{selectedCompetence.libelle}</span>

            <button
              className="text-red-500 font-bold"
              onClick={() => {
                setSelectedCompetence(null);
                setNiveaux([]);
                setNiveauRequis(null);
                setValidationErrors({});
              }}
            >
              ✕
            </button>
          </div>
        )}

        {/* ===== CREATION ===== */}
        {step === "create" && (
          <div className="space-y-3 border rounded-md p-3 bg-muted/30">
            <div className="text-sm text-muted-foreground">
              Création de la compétence :
            </div>
            <div className="text-lg font-semibold">{query}</div>

            <div>
              <Input
                placeholder="Catégorie"
                value={categorie}
                onChange={(e) => {
                  setCategorie(e.target.value);
                  setValidationErrors(prev => ({ ...prev, categorie: undefined }));
                }}
                className={validationErrors.categorie ? "border-red-500" : ""}
              />
              {validationErrors.categorie && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.categorie}</p>
              )}
            </div>

            <div>
              <Input
                placeholder="Description de la compétence"
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  setValidationErrors(prev => ({ ...prev, description: undefined }));
                }}
                className={validationErrors.description ? "border-red-500" : ""}
              />
              {validationErrors.description && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.description}</p>
              )}
            </div>

            {validationErrors.niveaux && (
              <p className="text-red-500 text-sm">{validationErrors.niveaux}</p>
            )}

            {newNiveaux.map((n: NiveauInput, i: number) => (
              <div
                key={i}
                className="grid grid-cols-[70px_1fr_1fr_30px] gap-2 items-start border p-2 rounded-md"
              >
                <div>
                  <Input
                    type="number"
                    placeholder="Niv"
                    value={n.niveau}
                    onChange={(e) => {
                      const copy = [...newNiveaux];
                      copy[i].niveau = Number(e.target.value);
                      setNewNiveaux(copy);
                      setValidationErrors(prev => {
                        const newErrors = { ...prev };
                        if (newErrors.niveauItems?.[i]) {
                          delete newErrors.niveauItems[i].niveau;
                        }
                        return newErrors;
                      });
                    }}
                    className={validationErrors.niveauItems?.[i]?.niveau ? "border-red-500" : ""}
                  />
                  {validationErrors.niveauItems?.[i]?.niveau && (
                    <p className="text-red-500 text-xs mt-1">
                      {validationErrors.niveauItems[i].niveau}
                    </p>
                  )}
                </div>
                <div>
                  <Input
                    placeholder="Libellé"
                    value={n.libelle}
                    onChange={(e) => {
                      const copy = [...newNiveaux];
                      copy[i].libelle = e.target.value;
                      setNewNiveaux(copy);
                      setValidationErrors(prev => {
                        const newErrors = { ...prev };
                        if (newErrors.niveauItems?.[i]) {
                          delete newErrors.niveauItems[i].libelle;
                        }
                        return newErrors;
                      });
                    }}
                    className={validationErrors.niveauItems?.[i]?.libelle ? "border-red-500" : ""}
                  />
                  {validationErrors.niveauItems?.[i]?.libelle && (
                    <p className="text-red-500 text-xs mt-1">
                      {validationErrors.niveauItems[i].libelle}
                    </p>
                  )}
                </div>
                <div>
                  <Input
                    placeholder="Description"
                    value={n.description}
                    onChange={(e) => {
                      const copy = [...newNiveaux];
                      copy[i].description = e.target.value;
                      setNewNiveaux(copy);
                      setValidationErrors(prev => {
                        const newErrors = { ...prev };
                        if (newErrors.niveauItems?.[i]) {
                          delete newErrors.niveauItems[i].description;
                        }
                        return newErrors;
                      });
                    }}
                    className={validationErrors.niveauItems?.[i]?.description ? "border-red-500" : ""}
                  />
                  {validationErrors.niveauItems?.[i]?.description && (
                    <p className="text-red-500 text-xs mt-1">
                      {validationErrors.niveauItems[i].description}
                    </p>
                  )}
                </div>
                <button
                  onClick={() =>
                    setNewNiveaux(newNiveaux.filter((_, idx) => idx !== i))
                  }
                  className="text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              </div>
            ))}

            <Button
              variant="outline"
              onClick={() =>
                setNewNiveaux([
                  ...newNiveaux,
                  {
                    niveau: newNiveaux.length + 1,
                    libelle: "",
                    description: ""
                  }
                ])
              }
            >
              ➕ Ajouter un niveau
            </Button>

            <Button onClick={handleCreateCompetence} disabled={loading}>
              {loading ? "Création en cours..." : "Créer la compétence"}
            </Button>
          </div>
        )}

        {/* ===== AFFECTATION ===== */}
        {selectedCompetence && step === "search" && (
          <div className="space-y-3 mt-4">
            {niveaux.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                Chargement des niveaux...
              </div>
            ) : (
              <>
                <div className="font-medium text-sm">Niveau requis</div>

                <div className="flex gap-2 flex-wrap">
                  {niveaux.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => {
                        setNiveauRequis(n.niveau);
                        setValidationErrors({});
                        setError(null);
                      }}
                      className={`px-3 py-2 border rounded-md ${
                        niveauRequis === n.niveau
                          ? "bg-primary text-white"
                          : "hover:bg-muted"
                      }`}
                    >
                      <LevelTooltip level={n.niveau} description={n.description} />
                    </button>
                  ))}
                </div>

                {/* Remplacement du select natif par SelectField */}
                <SelectField
                  name="importance"
                  control={importanceForm.control}
                  options={[
                    { id: 1, label: 'Indispensable' },
                    { id: 5, label: 'Souhaitable' }
                  ]}
                  displayField="label"
                  placeholder="Sélectionner l'importance"
                  className="w-full"
                />

                {validationErrors.affectation && (
                  <p className="text-red-500 text-sm">{validationErrors.affectation}</p>
                )}

                <Button onClick={handleAffectation} disabled={!niveauRequis || loading}>
                  {loading ? "Ajout en cours..." : "Ajouter au poste"}
                </Button>
              </>
            )}
          </div>
        )}

        {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
      </DialogContent>
    </Dialog>
  );
}