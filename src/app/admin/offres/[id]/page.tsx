import { OffreDetail } from "../components/offre-detail";

export const metadata = {
  title: "Détail de l'Offre",
  description: "Consultez les détails de l'offre d'emploi",
};

interface OffrePageProps {
  params: Promise<{ id: string }>;
}

export default async function OffrePage({ params }: OffrePageProps) {
  const { id } = await params;
  const offreId = parseInt(id);

  return (
    <main className="container mx-auto py-4 px-4 overflow-auto pb-16" style={{maxHeight: 'calc(100vh - 64px)'}}>
      <OffreDetail offreId={offreId} />
    </main>
  );
}
