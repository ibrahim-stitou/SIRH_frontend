'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// Redirection vers la bonne route
export default function AvenantRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Rediriger vers la liste des contrats
    router.push('/admin/contrats-mouvements/contrats');
  }, [router]);

  return null;
}
