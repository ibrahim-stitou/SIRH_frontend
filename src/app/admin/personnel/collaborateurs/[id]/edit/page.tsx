// Modification employé
// TODO: US-EMP-004 Modifier Employé
// - Formulaire pré-rempli
// - Champs non modifiables grisés (matricule, CIN après validation)
// - Commentaire obligatoire modifications sensibles (salaire, poste)
// - Workflow validation modifications sensibles
// - Validation identique à la création

interface EmployeEditPageProps {
  params: { id: string };
}

export default function EmployeEditPage({ params }: EmployeEditPageProps) {
  return (
    <div className='space-y-4 p-4'>
      <h1 className='text-2xl font-semibold'>Modifier Employé #{params.id}</h1>
      <p className='text-muted-foreground'>
        Formulaire édition (Implementation TODO)
      </p>
    </div>
  );
}
