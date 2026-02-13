"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  MapPin,
  Calendar,
  Briefcase,
  User,
  Mail,
  Eye,
  Users,
  ExternalLink,
  Copy,
  Edit,
  Trash2,
  ArrowLeft,
  Play,
  Pause,
  Check,
  Linkedin,
  Globe,
  Share2,
} from "lucide-react";
import type {  StatutOffre } from "@/types/offre";
import {
  changerStatutOffre,
  getOffreById
} from "@/services/offreService";
import ServerError from "@/components/common/server-error";
import { OffreDetailSkeleton } from "./OffreDetailSkeleton";

interface OffreDetailProps {
  offreId: number;
}

const statutConfig: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  BROUILLON: { label: "Brouillon", variant: "secondary" },
  PUBLIEE: { label: "Publiée", variant: "default" },
  CLOTUREE: { label: "Clôturée", variant: "outline" },
  brouillon: { label: "Brouillon", variant: "secondary" },
  publiee: { label: "Publiée", variant: "default" },
  cloturee: { label: "Clôturée", variant: "outline" },
};

export function OffreDetail({ offreId }: OffreDetailProps) {
  const router = useRouter();
  const [offre, setOffre] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasServerError, setHasServerError] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchOffre = async () => {
      setIsLoading(true);
      setHasServerError(false);
      try {
        const data = await getOffreById(offreId);
        setOffre(data);
      } catch (error: any) {
        if (!error?.response || error.response.status >= 500) {
          setHasServerError(true);
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchOffre();
  }, [offreId]);




  const handleChangeStatut = async (
  nouveauStatut: "BROUILLON" | "PUBLIQUE" | "CLOTUREE"
) => {
  try {
    await changerStatutOffre(offre.id, nouveauStatut);

    // Recharger l'offre après modification
    const updated = await getOffreById(offre.id);
    setOffre(updated);

  } catch (error) {
    console.error("Erreur changement statut:", error);
    alert("Erreur lors du changement de statut");
  }
};


  const handleCopyLink = () => {
    if (!offre?.lienCandidature) return;
    navigator.clipboard.writeText(offre.lienCandidature);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (isLoading) return <OffreDetailSkeleton />;

  if (hasServerError)
    return (
      <ServerError
        title="Serveur indisponible"
        message="Impossible de charger le détail de l'offre."
        onRetry={() => window.location.reload()}
      />
    );

  if (!offre)
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Offre non trouvée</p>
        <Button asChild className="mt-4">
          <Link href="/admin/offres">Retour aux offres</Link>
        </Button>
      </div>
    );

  // Normaliser le statut (gérer BROUILLON vs brouillon)
  const normalizedStatut = offre.statut?.toLowerCase() || 'brouillon';
  const currentStatutConfig = statutConfig[offre.statut] || statutConfig.brouillon;

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-4 items-start justify-between">
        <div>
          <Button variant="ghost" size="sm" asChild className="mb-2 -ml-2">
            <Link href="/admin/offres">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour aux offres
            </Link>
          </Button>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <span className="font-mono">{offre.reference}</span>
            {offre.anonyme && (
              <Badge variant="outline" className="text-xs">
                Anonyme
              </Badge>
            )}
          </div>
          <h1 className="text-2xl font-bold">
            {offre.poste?.libelle || "Titre du poste non défini"}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={currentStatutConfig.variant}>
            {currentStatutConfig.label}
          </Badge>
          <div className="flex gap-2">
         {normalizedStatut === "brouillon" && (
  <Button
    size="sm"
    onClick={() => handleChangeStatut("PUBLIQUE")}
  >
    <Play className="mr-2 h-4 w-4" />
    Publier
  </Button>
)}

           {normalizedStatut === "publique" && (
  <Button
    size="sm"
    variant="outline"
    onClick={() => handleChangeStatut("CLOTUREE")}
  >
    <Pause className="mr-2 h-4 w-4" />
    Clôturer
  </Button>
)}

            {/* 🔥 Afficher le bouton Modifier UNIQUEMENT si statut = BROUILLON */}
            {normalizedStatut === "brouillon" && (
              <Button size="sm" variant="outline" asChild>
                <Link href={`/admin/offres/${offre.id}/modifier`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Modifier
                </Link>
              </Button>
            )}
            
            <Button size="sm" variant="destructive" >
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-3">
          <Card>
            <CardHeader>
              <CardTitle>Description du poste</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-line">
                {offre.descriptionPoste || "Aucune description disponible"}
              </p>
            </CardContent>
          </Card>

          {offre.missionsPrincipales && offre.missionsPrincipales.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Missions principales</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {offre.missionsPrincipales.map((mission: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>{mission}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {offre.profilRecherche && (
            <Card>
              <CardHeader>
                <CardTitle>Profil recherché</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {offre.profilRecherche.formation && (
                  <>
                    <div>
                      <h4 className="font-medium mb-1">Formation</h4>
                      <p className="text-muted-foreground">
                        {offre.profilRecherche.formation}
                      </p>
                    </div>
                    {offre.profilRecherche.experience && <Separator />}
                  </>
                )}
                {offre.profilRecherche.experience && (
                  <div>
                    <h4 className="font-medium mb-1">Expérience</h4>
                    <p className="text-muted-foreground">
                      {offre.profilRecherche.experience}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {offre.competencesRequises && offre.competencesRequises.length > 0 && (
         <Card>
  <CardHeader>
    <CardTitle>Compétences requises</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="flex flex-wrap gap-3">
      {offre.competencesRequises.map((comp: any, index: number) => (
        <Badge
          key={comp.id || index}
          variant="secondary"
          className="text-sm px-4 py-2 rounded-lg"
        >
          {comp.libelle}
        </Badge>
      ))}
    </div>
  </CardContent>
</Card>

          )}
        </div>

        <div className="space-y-3">
          <Card>
            <CardHeader>
              <CardTitle>Informations clés</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {offre.lieuTravail && (
                <>
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground">Lieu de travail</p>
                      <p className="font-medium">{offre.lieuTravail}</p>
                    </div>
                  </div>
                  <Separator />
                </>
              )}
              {offre.typeContrat && (
                <>
                  <div className="flex items-center gap-3">
                    <Briefcase className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Type de contrat
                      </p>
                      <p className="font-medium">{offre.typeContrat}</p>
                    </div>
                  </div>
                  <Separator />
                </>
              )}
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="text-sm text-muted-foreground">Date limite</p>
                  <p className="font-medium">
                    {formatDate(offre.dateLimiteCandidature)}
                  </p>
                </div>
              </div>
              {offre.fourchetteSalaire && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Fourchette salariale
                    </p>
                    <p className="font-medium">
                      {offre.fourchetteSalaire.min.toLocaleString()} -{" "}
                      {offre.fourchetteSalaire.max.toLocaleString()}{" "}
                      {offre.fourchetteSalaire.devise}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {offre.responsableRecrutement && (
            <Card>
              <CardHeader>
                <CardTitle>Responsable recrutement</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {offre.responsableRecrutement.nom && (
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <span>{offre.responsableRecrutement.nom}</span>
                  </div>
                )}
                {offre.responsableRecrutement.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <a
                      href={`mailto:${offre.responsableRecrutement.email}`}
                      className="text-primary hover:underline break-all"
                    >
                      {offre.responsableRecrutement.email}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {offre.lienCandidature && (
            <Card>
              <CardHeader>
                <CardTitle>Lien de candidature</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <code className="text-xs bg-muted p-2 rounded block break-all">
                  {offre.lienCandidature}
                </code>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={handleCopyLink}
                  >
                    {copied ? (
                      <Check className="mr-2 h-4 w-4" />
                    ) : (
                      <Copy className="mr-2 h-4 w-4" />
                    )}
                    {copied ? "Copié !" : "Copier"}
                  </Button>
                  <Button size="sm" className="flex-1" asChild>
                    <a href={offre.lienCandidature} target="_blank">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Ouvrir
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {offre.statistiques && (
            <Card>
              <CardHeader>
                <CardTitle>Statistiques</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <Eye className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-2xl font-bold">{offre.statistiques.vues || 0}</p>
                    <p className="text-xs text-muted-foreground">Vues</p>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <Users className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-2xl font-bold">
                      {offre.statistiques.candidaturesRecues || 0}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Candidatures
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {offre.diffusion && offre.diffusion.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Canaux de diffusion</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {offre.diffusion.map((canal: any) => {
                    // Déterminer l'icône en fonction du libellé
                    let Icon = Globe;
                    if (canal.libelle.toLowerCase().includes('linkedin')) {
                      Icon = Linkedin;
                    } else if (canal.libelle.toLowerCase().includes('social')) {
                      Icon = Share2;
                    }

                    return (
                      <div
                        key={canal.id}
                        className={`flex items-center gap-2 p-2 rounded ${
                          canal.statut === 'SUCCES'
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <Icon className="h-4 w-4 flex-shrink-0" />
                        <span className="text-sm flex-1">{canal.libelle}</span>
                        {canal.statut === 'SUCCES' && (
                          <Check className="h-4 w-4" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Historique</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {offre.dateCreation && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Créée le</span>
                  <span>{formatDate(offre.dateCreation)}</span>
                </div>
              )}
              {offre.datePublication && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Publiée le</span>
                  <span>{formatDate(offre.datePublication)}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}