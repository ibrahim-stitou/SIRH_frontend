// Attestations de travail
// TODO: US-EMP-007 Générer Attestation
// - Sélection type (Travail / Salaire / Travail+Salaire)
// - Modèles FR / AR pré-remplis
// - Variables auto (nom, poste, ancienneté, salaire)
// - Logo + cachet + signature
// - Prévisualisation avant génération
// - Génération PDF <2s + téléchargement
// - Envoi email optionnel
// - Historique attestations générées + numérotation

export default function AttestationsPage() {
  return (
    <div className="space-y-4 p-4">
      <h1 className="text-2xl font-semibold">Attestations</h1>
      <p className="text-muted-foreground">Génération de documents (Implementation TODO)</p>
    </div>
  );
}

