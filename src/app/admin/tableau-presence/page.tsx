import PageContainer from '@/components/layout/page-container';
import TableauPresenceListing from '@/features/tableau-presence/tableau-presence-listing';

export default function TableauPresencePage() {
  return(
    <PageContainer scrollable={false}>
      <div className="flex flex-1 flex-col space-y-6">
        <TableauPresenceListing/>
      </div>
    </PageContainer>
  );
}