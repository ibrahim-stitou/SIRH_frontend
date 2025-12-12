'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// Redirection vers la bonne route - les avenants sont créés depuis un contrat spécifique
export default function CreateAvenantRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Rediriger vers la liste des contrats
    router.push('/admin/contrats-mouvements/contrats');
  }, [router]);

  return null;
}

