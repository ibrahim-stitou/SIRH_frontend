import PageContainer from '@/components/layout/page-container';
import AbsencesCalendar from '@/features/absences/absences-calendar';

export default function CalendrierAbsencesPage() {
  return (
    <PageContainer scrollable={true}>
      <div className='space-y-6 w-full'>
        <div>
          <h1 className='text-2xl font-semibold tracking-tight'>
            Calendrier des Absences
          </h1>
          <p className='text-muted-foreground text-sm'>
            Visualisez et gérez les absences par mois ou par semaine
          </p>
        </div>
        <AbsencesCalendar />
      </div>
    </PageContainer>
  );
}

