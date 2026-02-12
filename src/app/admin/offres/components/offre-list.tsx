"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OffreCard } from "./offre-card";
import { OffresListSkeleton } from "./offre-list-skeleton";
import { Search, Plus } from "lucide-react";
import Link from "next/link";
import type { OffreEmploiUI, TypeContrat } from "@/types/PosteOffre";
import { getOffres } from "@/services/offreService";
import ServerError from "@/components/common/server-error";

type StatutFilter = "brouillon" | "publiee" | "cloturee" | "all";

export function OffresList() {
  const [offres, setOffres] = useState<OffreEmploiUI[]>([]);
  const [filteredOffres, setFilteredOffres] = useState<OffreEmploiUI[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasServerError, setHasServerError] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [statutFilter, setStatutFilter] = useState<StatutFilter>("all");
  const [typeFilter, setTypeFilter] = useState<TypeContrat | "all">("all");

  const fetchOffres = async () => {
    setIsLoading(true);
    setHasServerError(false);

    try {
      const data = await getOffres();
      setOffres(data);
      setFilteredOffres(data);
    } catch (error: any) {
      // Erreur serveur ou pas de réponse
      if (!error?.response || error?.response?.status >= 500) {
        setHasServerError(true);
      }
      console.error("Erreur lors de la récupération des offres :", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOffres();
  }, []);

  useEffect(() => {
    let result = offres;

    // Filtre de recherche
    // Filtre de recherche
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      result = result.filter(
        (offre) =>
          offre.intitulePoste.toLowerCase().includes(search) ||
          offre.reference.toLowerCase().includes(search) ||
          offre.lieuTravail.toLowerCase().includes(search) ||
          offre.competencesRequises.some(
            (c) => c.libelle.toLowerCase().includes(search) // ✅ Ajoutez .libelle
          )
      );
    }

    // Filtre par statut
    if (statutFilter !== "all") {
      result = result.filter((offre) => offre.statut === statutFilter);
    }

    // Filtre par type de contrat
    if (typeFilter !== "all") {
      result = result.filter((offre) => offre.typeContrat === typeFilter);
    }

    setFilteredOffres(result);
  }, [offres, searchTerm, statutFilter, typeFilter]);

  // Calcul des statistiques
  const stats = {
    total: offres.length,
    publiees: offres.filter((o) => o.statut === "publiee").length,
    brouillons: offres.filter((o) => o.statut === "brouillon").length,
    cloturees: offres.filter((o) => o.statut === "cloturee").length,
  };

  // État de chargement
  if (isLoading) {
    return <OffresListSkeleton />;
  }

  // Erreur serveur
  if (hasServerError) {
    return (
      <ServerError
        title="Erreur serveur"
        message="Impossible de récupérer les offres pour le moment."
        onRetry={fetchOffres}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border rounded-lg p-4">
          <div className="text-2xl font-bold">{stats.total}</div>
          <div className="text-sm text-muted-foreground">Total offres</div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="text-2xl font-bold text-emerald-600">
            {stats.publiees}
          </div>
          <div className="text-sm text-muted-foreground">Publiées</div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="text-2xl font-bold text-amber-600">
            {stats.brouillons}
          </div>
          <div className="text-sm text-muted-foreground">Brouillons</div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="text-2xl font-bold text-muted-foreground">
            {stats.cloturees}
          </div>
          <div className="text-sm text-muted-foreground">Clôturées</div>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {/* Recherche */}
          <div className="relative flex-1 sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher une offre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Filtre par statut */}
          <Select
            value={statutFilter}
            onValueChange={(value) => setStatutFilter(value as StatutFilter)}
          >
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="brouillon">Brouillon</SelectItem>
              <SelectItem value="publiee">Publiée</SelectItem>
              <SelectItem value="cloturee">Clôturée</SelectItem>
            </SelectContent>
          </Select>

          {/* Filtre par type de contrat */}
          <Select
            value={typeFilter}
            onValueChange={(value) =>
              setTypeFilter(value as TypeContrat | "all")
            }
          >
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Type contrat" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les types</SelectItem>
              <SelectItem value="CDI">CDI</SelectItem>
              <SelectItem value="CDD">CDD</SelectItem>
              <SelectItem value="Stage">Stage</SelectItem>
              <SelectItem value="Freelance">Freelance</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Bouton nouvelle offre */}
        <Button asChild>
          <Link href="/admin/offres/nouveau">
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle offre
          </Link>
        </Button>
      </div>

      {/* Liste des offres */}
      {filteredOffres.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchTerm || statutFilter !== "all" || typeFilter !== "all"
              ? "Aucune offre ne correspond aux critères de recherche"
              : "Aucune offre d'emploi disponible"}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredOffres.map((offre) => (
            <OffreCard key={offre.id} offre={offre} onUpdate={fetchOffres} />
          ))}
        </div>
      )}
    </div>
  );
}