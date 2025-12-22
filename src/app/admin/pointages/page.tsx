import PointagesListing from '@/features/pointages/pointages-listing';
import PageContainer from '@/components/layout/page-container';

export default function PointagesPage() {
  return (
    <PageContainer scrollable={false}>
      <div className='flex flex-1 flex-col space-y-6'>
        <PointagesListing />
      </div>
    </PageContainer>
  );
}
