import PageContainer from '@/components/layout/page-container';
import CompetenceList from '@/features/competences/competence-list';

export default function AbsencesPage() {
  return (
    <PageContainer scrollable={false}>
      <div className="flex h-full flex-col space-y-6  w-full">
        <div className="flex-1">
          <CompetenceList />
        </div>
      </div>
    </PageContainer>
  );
}
