"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

import { getPosteById } from "@/services/posteService";
import { getPosteCompetences } from "@/services/poste-competence";

import { Poste } from "@/types/poste";
import { PosteCompetence } from "@/types/postecompetence";

import { PosteInfoCard } from "../components/poste-info-card";
import { CompetenceGrid } from "../components/competence-grid";

import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";

import { QuickAddCompetenceModal } from "../components/QuickAddCompetenceModal";
import { PosteInfoCardSkeleton } from "../skeleton/poste-info-card-skeleton";
import { SearchSkeleton } from "../skeleton/search-skeleton";
import { CompetenceGridSkeleton } from "../skeleton/competence-grid-skeleton";
import ServerError from "@/components/common/server-error";

export default function PosteProfilPage() {
  const { id } = useParams();
  const posteId = Number(id);

  const [poste, setPoste] = useState<Poste | null>(null);
  const [competences, setCompetences] = useState<PosteCompetence[]>([]);
  const [search, setSearch] = useState("");
  const [openQuickAdd, setOpenQuickAdd] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [serverError, setServerError] = useState(false);

  /* =========================
     LOAD DATA
  ========================= */
  const loadData = async () => {
    try {
      setIsLoading(true);
      setServerError(false);

      const posteData = await getPosteById(posteId);
      const response = await getPosteCompetences(posteId);

      setPoste(posteData);

      const rawData = Array.isArray(response?.data) ? response.data : [];

      const normalized: PosteCompetence[] = rawData.map((item: any) => ({
        id: item.id,
        poste_id: posteId,
        competence: item.competence,
        importance: item.importance,
        niveau_requis: item.niveau?.niveau ?? 0,
        niveau: item.niveau,
      }));

      setCompetences(normalized);
    } catch (err: any) {
      // 🔴 Serveur éteint / API inaccessible
      if (!err.response || err.code === "ECONNABORTED") {
        setServerError(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!posteId) return;
    loadData();
  }, [posteId]);

  /* =========================
     FILTER
  ========================= */
  const filteredCompetences = useMemo(() => {
    return competences.filter((c) =>
      c.competence?.libelle
        ?.toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [competences, search]);

  /* =========================
     LOADING STATE
  ========================= */
  if (isLoading) {
    return (
      <div className="space-y-6">
        <PosteInfoCardSkeleton />
        <SearchSkeleton />
        <CompetenceGridSkeleton />
      </div>
    );
  }

  /* =========================
     SERVER ERROR STATE
  ========================= */
  if (serverError) {
    return (
      <ServerError
        title="Serveur indisponible"
        message="Impossible de charger la liste des postes."
onRetry={loadData}       />
    );
  }
  if (!poste) return null;

  /* =========================
     RENDER
  ========================= */
  return (
    <div className="space-y-6">
      {/* POSTE INFOS */}
      <PosteInfoCard
        poste={poste}
        competencesCount={competences.length}
        onQuickAdd={() => setOpenQuickAdd(true)}
      />

      {/* SEARCH */}
      {competences.length >= 8 && (
        <div className="flex items-center gap-3">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <Input
              type="text"
              placeholder="Rechercher une compétence..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-10"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* GRID */}
      <CompetenceGrid
        posteId={posteId}
        data={filteredCompetences}
        onRefresh={loadData}
      />

      {/* QUICK ADD */}
      <QuickAddCompetenceModal
        open={openQuickAdd}
        posteId={posteId}
        onClose={() => setOpenQuickAdd(false)}
        onSuccess={loadData}
      />
    </div>
  );
}
