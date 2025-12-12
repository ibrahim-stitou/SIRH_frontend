import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function AttestationsPageSkeleton() {
  return (
    <div className='mx-auto w-full space-y-6 px-4 py-8'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='space-y-2'>
          <Skeleton className='h-8 w-48' />
          <Skeleton className='h-4 w-96' />
        </div>
        <div className='flex gap-2'>
          <Skeleton className='h-10 w-40' />
          <Skeleton className='h-10 w-40' />
        </div>
      </div>

      {/* Stats Cards */}
      <div className='grid gap-4 md:grid-cols-4'>
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <Skeleton className='h-4 w-24' />
              <Skeleton className='h-4 w-4 rounded-full' />
            </CardHeader>
            <CardContent>
              <Skeleton className='h-8 w-16' />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className='space-y-4'>
        <Skeleton className='h-10 w-64' />

        {/* Table Card */}
        <Card>
          <CardHeader>
            <Skeleton className='h-6 w-48' />
            <Skeleton className='h-4 w-96' />
          </CardHeader>
          <CardContent className='space-y-4'>
            {/* Table Header */}
            <div className='flex gap-4'>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className='h-8 flex-1' />
              ))}
            </div>

            {/* Table Rows */}
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className='flex gap-4'>
                {[1, 2, 3, 4, 5, 6].map((j) => (
                  <Skeleton key={j} className='h-12 flex-1' />
                ))}
              </div>
            ))}

            {/* Pagination */}
            <div className='flex items-center justify-between'>
              <Skeleton className='h-8 w-32' />
              <div className='flex gap-2'>
                <Skeleton className='h-8 w-8' />
                <Skeleton className='h-8 w-8' />
                <Skeleton className='h-8 w-8' />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
