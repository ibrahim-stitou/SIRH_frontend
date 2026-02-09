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
import { Button } from "@/components/ui/button";

import { Search, X, Plus } from "lucide-react";
import { QuickAddCompetenceModal } from "../components/QuickAddCompetenceModal";

export default function PosteProfilPage() {
  const { id } = useParams();
  const posteId = Number(id);

  const [poste, setPoste] = useState<Poste | null>(null);
  const [competences, setCompetences] = useState<PosteCompetence[]>([]);
  const [search, setSearch] = useState("");
  const [openQuickAdd, setOpenQuickAdd] = useState(false);

  /* =========================
     LOAD DATA
  ========================= */
  const loadData = async () => {
    const posteData = await getPosteById(posteId);
    const response = await getPosteCompetences(posteId);

    setPoste(posteData);

    const rawData = Array.isArray(response?.data) ? response.data : [];

    const normalized = rawData.map((item: any) => ({
      competence: item.competence,
      importance: item.importance,
      niveau_requis: item.niveau?.niveau ?? 0,
      niveau: item.niveau // ✅ GARDEZ L'OBJET NIVEAU COMPLET
    }));

    setCompetences(normalized);
  };

  useEffect(() => {
    if (!posteId) return;
    loadData();
  }, [posteId]);

  /* =========================
     FILTER
  ========================= */
  const filteredCompetences = useMemo(() => {
    return competences.filter(c =>
      c.competence?.libelle
        ?.toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [competences, search]);

  if (!poste) return null;

  return (
    <div className="space-y-6">
      {/* =========================
          POSTE INFOS
      ========================= */}
      <PosteInfoCard
        poste={poste}
        competencesCount={competences.length}
        onQuickAdd={() => setOpenQuickAdd(true)}
      />

      {/* =========================
          SEARCH (affiché seulement si >= 8 compétences)
      ========================= */}
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
                aria-label="Effacer"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* =========================
          COMPETENCES GRID
      ========================= */}
      <CompetenceGrid
        posteId={posteId}
        data={filteredCompetences}
        onRefresh={loadData}
      />

      {/* =========================
          QUICK ADD MODAL
      ========================= */}
      <QuickAddCompetenceModal
        open={openQuickAdd}
        posteId={posteId}
        onClose={() => setOpenQuickAdd(false)}
        onSuccess={loadData}
      />
    </div>
  );
}