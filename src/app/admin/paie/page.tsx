import PaieListing from '@/features/paie/paie-listing';
import PageContainer from '@/components/layout/page-container';

export default function PaiePage() {
  return (
    <PageContainer scrollable={false}>
      <div className='flex flex-1 flex-col space-y-6'>
        <PaieListing />
      </div>
    </PageContainer>
  );
}
