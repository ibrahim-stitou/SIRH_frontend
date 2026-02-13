"use client";

import { useState, useEffect, use } from "react";
import { OffreForm } from "../../components/offre-form";
import { getOffreById } from "@/services/offreService";
import { Loader2 } from "lucide-react";
import { OffreEditForm } from "../../components/Offre-edit-form";
import { OffreEmploi } from "@/types/PosteOffre";

interface ModifierOffrePageProps {
  params: Promise<{ id: string }>;
}

export default function ModifierOffrePage({ params }: ModifierOffrePageProps) {
  const { id } = use(params);
  const [offre, setOffre] = useState<OffreEmploi | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOffre = async () => {
      try {
        const data = await getOffreById(parseInt(id));
        setOffre(data);
      } catch (error) {
        console.error("Erreur:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOffre();
  }, [id]);

  if (isLoading) {
    return (
      <main className="w-full py-8 px-4 overflow-auto pb-32" style={{maxHeight: 'calc(100vh - 64px)'}}>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </main>
    );
  }

  if (!offre) {
    return (
      <main className="w-full py-8 px-4 overflow-auto pb-32" style={{maxHeight: 'calc(100vh - 64px)'}}>
        <p className="text-center text-muted-foreground">Offre non trouvée</p>
      </main>
    );
  }

  return (
    <main className="w-full py-8 px-4 overflow-auto pb-32" style={{maxHeight: 'calc(100vh - 64px)'}}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Modifier l&apos;offre</h1>
        <p className="text-muted-foreground mt-1">
          Modifiez les informations de l&apos;offre {offre.reference}
        </p>
      </div>
      <OffreEditForm offre={offre}  />
    </main>
  );
}