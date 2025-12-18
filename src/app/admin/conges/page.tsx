import PageContainer from '@/components/layout/page-container';
import CongeListing from '@/features/conges/conges-listing';
export default function AbsencesPage() {
  return (
    <PageContainer scrollable={false}>
      <div className='flex flex-1 flex-col space-y-6'>
        <CongeListing />
      </div>
    </PageContainer>
  );
}
