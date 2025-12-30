
import PageContainer from '@/components/layout/page-container';
import AvancesListing from '@/features/paie/avances/avances-listing';

export default function PaiePage() {
  return (
    <PageContainer scrollable={false}>
      <div className='flex flex-1 flex-col space-y-6'>
        <AvancesListing />
      </div>
    </PageContainer>
  );
}
