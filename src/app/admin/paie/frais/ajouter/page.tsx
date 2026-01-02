import React from 'react';
import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import FraisForm from '@/features/paie/frais/frais-form';

export default function Page() {
  const router = useRouter();
  return (
    <PageContainer>
      <div className='flex items-center justify-between mb-6'>
        <Heading title={'Nouvelle note de frais'} description={'Créez une note de frais avec vos déplacements et justificatifs.'} />
        <Button variant='outline' onClick={() => router.push('/admin/paie/frais')}>
          <ArrowLeft className='mr-2 h-4 w-4' />
          Retour à la liste
        </Button>
      </div>
      <div className='rounded-lg border bg-card p-4 shadow-sm'>
        <FraisForm />
      </div>
    </PageContainer>
  );
}
