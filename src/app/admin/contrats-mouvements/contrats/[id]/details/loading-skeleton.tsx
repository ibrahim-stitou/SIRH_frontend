import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import PageContainer from '@/components/layout/page-container';

export default function ContractDetailsLoadingSkeleton() {
  return (
    <PageContainer className='m-auto w-full'>
      <div className='mx-auto w-full space-y-6 py-6'>
        {/* En-tête */}
        <div className='flex items-start justify-between'>
          <div className='space-y-2'>
            <div className='flex items-center gap-3'>
              <Skeleton className='h-10 w-10' />
              <div className='space-y-2'>
                <Skeleton className='h-8 w-64' />
                <Skeleton className='h-4 w-48' />
              </div>
            </div>
          </div>
          <Skeleton className='h-6 w-24' />
        </div>

        {/* Carte d'information principale */}
        <Card className='border-2'>
          <CardHeader className='pb-3'>
            <div className='flex items-center justify-between'>
              <div className='space-y-2'>
                <Skeleton className='h-6 w-48' />
                <Skeleton className='h-4 w-64' />
              </div>
              <div className='flex items-center gap-2'>
                <Skeleton className='h-9 w-32' />
                <Skeleton className='h-9 w-24' />
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Onglets */}
        <div className='space-y-6'>
          <Skeleton className='h-10 w-full lg:w-[600px]' />

          {/* Contenu des onglets */}
          <div className='grid gap-6'>
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className='h-6 w-48' />
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='grid grid-cols-2 gap-4'>
                    {[1, 2, 3, 4].map((j) => (
                      <div key={j} className='space-y-2'>
                        <Skeleton className='h-4 w-32' />
                        <Skeleton className='h-10 w-full' />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Historique */}
        <Card>
          <CardHeader>
            <Skeleton className='h-6 w-32' />
          </CardHeader>
          <CardContent className='space-y-3'>
            <div className='grid grid-cols-2 gap-4'>
              {[1, 2].map((i) => (
                <div key={i} className='space-y-2'>
                  <Skeleton className='h-4 w-24' />
                  <Skeleton className='h-5 w-40' />
                  <Skeleton className='h-3 w-32' />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
