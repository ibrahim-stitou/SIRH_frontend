
import AbsencesListing from '@/features/absences/absences-listing';
import PageContainer from '@/components/layout/page-container';
export default function AbsencesPage(){
  return (
    <PageContainer scrollable={false}>
      <div className="flex flex-1 flex-col space-y-6">
        <AbsencesListing/>
      </div>
    </PageContainer>
  )
}