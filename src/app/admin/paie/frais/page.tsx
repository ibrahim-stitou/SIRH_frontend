import React from 'react';
import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import FraisListing from '@/features/paie/frais/frais-listing';

export default function Page() {
  const router = useRouter();
  return (
    <PageContainer>
      <div className='flex items-center justify-between mb-6'>
        <Heading title={'Frais & Déplacements'} description={'Liste des notes de frais et déplacements.'} />
        <Button onClick={() => router.push('/admin/paie/frais/ajouter')}>
          <Plus className='mr-2 h-4 w-4' />
          Ajouter une note de frais
        </Button>
      </div>
      <div className='rounded-lg border bg-card p-4 shadow-sm'>
        <FraisListing />
      </div>
    </PageContainer>
  );
}
