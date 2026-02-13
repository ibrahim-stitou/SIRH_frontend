import { OffreForm } from "../components/offre-form";

export const metadata = {
  title: "Nouvelle Offre d'Emploi",
  description: "Créez une nouvelle offre d'emploi",
};

export default function NouvelleOffrePage() {
  return (
    <main className="w-full py-8 px-4 overflow-auto pb-32" style={{maxHeight: 'calc(100vh - 64px)'}}>
   
      <OffreForm mode="create" />
    </main>
  );
}