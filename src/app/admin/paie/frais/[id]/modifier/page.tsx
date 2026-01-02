import React from 'react';
import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import FraisForm from '@/features/paie/frais/frais-form';

export default function Page({ params }: { params: { id: string } }) {
  const idNum = Number(params.id);
  const router = useRouter();
  return (
    <PageContainer>
      <div className='flex items-center justify-between mb-6'>
        <Heading title={`Modifier la note NDF #${idNum}`} description={'Mettez à jour les informations et les lignes de frais.'} />
        <Button variant='outline' onClick={() => router.push('/admin/paie/frais')}>
          <ArrowLeft className='mr-2 h-4 w-4' />
          Retour à la liste
        </Button>
      </div>
      <div className='rounded-lg border bg-card p-4 shadow-sm'>
        <FraisForm id={idNum} />
      </div>
    </PageContainer>
  );
}
