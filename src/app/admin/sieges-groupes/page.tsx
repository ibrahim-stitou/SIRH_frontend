import React from 'react';
import PageContainer from '@/components/layout/page-container';
import SiegeListing from '@/features/siege/siege-listing';

export default function SiegesPage() {
  return (
    <PageContainer scrollable={false}>
      <div className='flex flex-1 flex-col space-y-6'>
        <SiegeListing />
      </div>
    </PageContainer>
  );
}

