import React from 'react';
import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import FraisDetails from '@/features/paie/frais/frais-details';

export default function Page({ params }: { params: { id: string } }) {
  const idNum = Number(params.id);
  const router = useRouter();
  return (
    <PageContainer>
      <div className='flex items-center justify-between mb-6'>
        <Heading title={`Détail de la note NDF #${idNum}`} description={'Validation et contrôle des lignes de frais.'} />
        <Button variant='outline' onClick={() => router.push('/admin/paie/frais')}>
          <ArrowLeft className='mr-2 h-4 w-4' />
          Retour à la liste
        </Button>
      </div>
      <div className='rounded-lg border bg-card p-4 shadow-sm'>
        <FraisDetails id={idNum} />
      </div>
    </PageContainer>
  );
}
