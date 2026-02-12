"use client";

import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MapPin,
  Calendar,
  Briefcase,
  Eye,
  Users,
  MoreVertical,
  Edit,
  Trash2,
  Play,
  Pause,
  ExternalLink,
  Copy,
} from "lucide-react";
import type { OffreEmploiUI } from "@/types/PosteOffre";
import { updateOffreStatut, deleteOffre } from "@/services/offreService";

interface OffreCardProps {
  offre: OffreEmploiUI;
  onUpdate: () => void;
}

const statutConfig = {
  brouillon: { label: "Brouillon", variant: "secondary" as const },
  publiee: { label: "Publiée", variant: "default" as const },
  cloturee: { label: "Clôturée", variant: "outline" as const },
};

const typeContratColors: Record<string, string> = {
  CDI: "bg-emerald-100 text-emerald-800",
  CDD: "bg-amber-100 text-amber-800",
  Stage: "bg-sky-100 text-sky-800",
  Freelance: "bg-purple-100 text-purple-800",
};

export function OffreCard({ offre, onUpdate }: OffreCardProps) {
  const handleStatutChange = async (newStatut: "brouillon" | "publiee" | "cloturee") => {
    try {
      await updateOffreStatut(offre.id, newStatut);
      onUpdate();
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut:", error);
      alert("Erreur lors de la mise à jour du statut");
    }
  };

  const handleDelete = async () => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette offre ?")) {
      try {
        await deleteOffre(offre.id);
        onUpdate();
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
        alert("Erreur lors de la suppression de l'offre");
      }
    }
  };

  const handleCopyLink = () => {
    if (offre.lienCandidature) {
      navigator.clipboard.writeText(offre.lienCandidature);
      // Vous pouvez ajouter un toast notification ici
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const isExpired = new Date(offre.dateLimiteCandidature) < new Date();

  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-mono">{offre.reference}</span>
              {offre.anonyme && (
                <Badge variant="outline" className="text-xs">
                  Anonyme
                </Badge>
              )}
            </div>
            <Link
              href={`/admin/offres/${offre.id}`}
              className="text-lg font-semibold hover:underline line-clamp-1"
            >
              {offre.intitulePoste}
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={statutConfig[offre.statut].variant}>
              {statutConfig[offre.statut].label}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/admin/offres/${offre.id}/modifier`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Modifier
                  </Link>
                </DropdownMenuItem>
                {offre.statut === "brouillon" && (
                  <DropdownMenuItem onClick={() => handleStatutChange("publiee")}>
                    <Play className="mr-2 h-4 w-4" />
                    Publier
                  </DropdownMenuItem>
                )}
                {offre.statut === "publiee" && (
                  <DropdownMenuItem onClick={() => handleStatutChange("cloturee")}>
                    <Pause className="mr-2 h-4 w-4" />
                    Clôturer
                  </DropdownMenuItem>
                )}
                {offre.lienCandidature && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleCopyLink}>
                      <Copy className="mr-2 h-4 w-4" />
                      Copier le lien
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <a
                        href={offre.lienCandidature}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Voir la page candidature
                      </a>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {offre.descriptionPoste}
        </p>

        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            <span>{offre.lieuTravail}</span>
          </div>
          <div className="flex items-center gap-1">
            <Briefcase className="h-4 w-4" />
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${typeContratColors[offre.typeContrat] || "bg-gray-100 text-gray-800"}`}>
              {offre.typeContrat}
            </span>
          </div>
          <div className={`flex items-center gap-1 ${isExpired ? "text-destructive" : ""}`}>
            <Calendar className="h-4 w-4" />
            <span>
              {isExpired ? "Expirée le " : "Jusqu'au "}
              {formatDate(offre.dateLimiteCandidature)}
            </span>
          </div>
        </div>

        {offre.fourchetteSalaire && (
          <div className="mt-3 text-sm font-medium">
            {offre.fourchetteSalaire.min.toLocaleString()} -{" "}
            {offre.fourchetteSalaire.max.toLocaleString()} {offre.fourchetteSalaire.devise}
          </div>
        )}

        {offre.competencesRequises.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4">
            {offre.competencesRequises.slice(0, 4).map((comp, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {comp}
              </Badge>
            ))}
            {offre.competencesRequises.length > 4 && (
              <Badge variant="secondary" className="text-xs">
                +{offre.competencesRequises.length - 4}
              </Badge>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-3 border-t">
        <div className="flex items-center justify-between w-full text-sm">
          <div className="flex items-center gap-4 text-muted-foreground">
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>{offre.statistiques.vues} vues</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{offre.statistiques.candidaturesRecues} candidatures</span>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            Par {offre.responsableRecrutement.nom}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}