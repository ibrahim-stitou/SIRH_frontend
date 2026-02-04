import { OffresList } from "./components/offre-list";

export const metadata = {
  title: "Gestion des Offres d'Emploi",
  description: "Gérez vos offres d'emploi et suivez les candidatures",
};

export default function OffresPage() {
  return (
    <main className="container mx-auto py-8 px-4 overflow-auto pb-32" style={{maxHeight: 'calc(100vh - 64px)'}}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Offres d&apos;emploi</h1>
        <p className="text-muted-foreground mt-1">
          Gérez vos offres d&apos;emploi et suivez les candidatures
        </p>
      </div>
      <OffresList />
    </main>
  );
}
