import PageContainer from '@/components/layout/page-container';
import PretsListing from '@/features/paie/prets/prets-listing';

export default function PretPage() {
  return (
    <PageContainer scrollable={false}>
      <div className='flex flex-1 flex-col space-y-6 w-full'>
        <PretsListing />
      </div>
    </PageContainer>
  );
}
