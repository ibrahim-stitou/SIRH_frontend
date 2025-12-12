import { ContratsListing } from './components/contrats-listing';
import PageContainer from '@/components/layout/page-container';

export default function ContratsPage() {
  return (
    <PageContainer scrollable={false}>
      <div className='flex flex-1 flex-col space-y-6'>
        <ContratsListing />
      </div>
    </PageContainer>
  );
}
