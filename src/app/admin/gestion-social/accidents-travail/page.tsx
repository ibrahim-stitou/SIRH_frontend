import PageContainer from '@/components/layout/page-container';
import AccidentsTravailListing from '@/features/gestion-social/accidents-travail/accidents-travail-listing';

export default function AccidentPage() {
  return (
    <PageContainer scrollable={false}>
      <div className='flex flex-1 flex-col space-y-6'>
        <AccidentsTravailListing />
      </div>
    </PageContainer>
  );
}
