import React from 'react';
import PageContainer from '@/components/layout/page-container';
import FraisListing from '@/features/paie/frais/frais-listing';

export default function Page() {
  return (
    <PageContainer scrollable={false}>
      <div className='flex flex-1 flex-col space-y-6'>
        <FraisListing />
      </div>
    </PageContainer>
  );
}
