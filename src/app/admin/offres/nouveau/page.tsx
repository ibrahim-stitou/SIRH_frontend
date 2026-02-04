import { OffreForm } from "../components/offre-form";

export const metadata = {
  title: "Nouvelle Offre d'Emploi",
  description: "Créez une nouvelle offre d'emploi",
};

export default function NouvelleOffrePage() {
  return (
    <main className="container mx-auto py-8 px-4 max-w-4xl overflow-auto pb-32" style={{maxHeight: 'calc(100vh - 64px)'}}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Créer une offre d&apos;emploi</h1>
        <p className="text-muted-foreground mt-1">
          Remplissez le formulaire pour publier une nouvelle offre
        </p>
      </div>
      <OffreForm mode="create" />
    </main>
  );
}
