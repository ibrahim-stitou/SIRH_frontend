'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import PageContainer from '@/components/layout/page-container';
import { AvenantsListing } from './components/avenants-listing';

export default function AvenantsPage() {
  const router = useRouter();

  return (
    <PageContainer scrollable={false}>
      <div className='flex flex-1 flex-col space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold'>Gestion des Avenants</h1>
            <p className='text-muted-foreground mt-1'>
              Liste de tous les avenants de contrat
            </p>
          </div>
        </div>

        {/* Table */}
        <AvenantsListing />
      </div>
    </PageContainer>
  );
}
