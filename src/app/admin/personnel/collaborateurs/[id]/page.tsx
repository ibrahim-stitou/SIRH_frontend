// Fiche employé
// TODO: US-EMP-003 Consulter Fiche Employé
// - Onglets: Identité & Coordonnées | Contrat & Mouvements | Documents | Absences & Congés | Paie | Formation & Compétences | Historique
// - Photo profil, statut, ancienneté calculée
// - Manager hiérarchique avec lien
// - Actions rapides: Modifier, Mouvement, Absence, Document
// - Timeline événements importants
// - Impression friendly + export PDF
// TODO: US-EMP-005 Gestion Documents
// - Liste documents + preview, upload multiple drag & drop, catégories, versioning, expiration + alertes, download ZIP, suppression traçable

interface EmployeFichePageProps {
  params: { id: string };
}

export default function EmployeFichePage({ params }: EmployeFichePageProps) {
  return (
    <div className='space-y-4 p-4'>
      <h1 className='text-2xl font-semibold'>Fiche Employé #{params.id}</h1>
      <p className='text-muted-foreground'>
        Détails et onglets (Implementation TODO)
      </p>
    </div>
  );
}
