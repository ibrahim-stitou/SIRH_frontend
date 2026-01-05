'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import FraisDetails from '@/features/paie/frais/frais-details';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';

export default function Page() {
  const router = useRouter();
  const params = useParams();
  const idParam = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const idNum = Number(idParam);

  if (!idParam || isNaN(idNum) || idNum <= 0) {
    return (
      <PageContainer>
        <div className='flex flex-col items-center justify-center py-12'>
          <div className='text-destructive mb-2 text-lg font-bold'>
            Erreur : identifiant de note de frais invalide
          </div>
          <Button
            variant='outline'
            onClick={() => router.push('/admin/paie/frais')}
          >
            <ArrowLeft className='mr-2 h-4 w-4' />
            Retour à la liste
          </Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <>
      <FraisDetails id={idNum} />
    </>
  );
}
