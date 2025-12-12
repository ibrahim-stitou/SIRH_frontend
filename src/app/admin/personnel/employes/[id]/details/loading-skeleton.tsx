'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function EmployeeDetailsLoadingSkeleton() {
  return (
    <div className='mx-auto w-full space-y-6 px-4 py-6'>
      <Card className='relative overflow-hidden border-2'>
        <div className='relative p-6 md:p-8'>
          <div className='flex flex-col gap-6 md:flex-row'>
            <div className='flex-shrink-0'>
              <Skeleton className='h-24 w-24 rounded-full md:h-32 md:w-32' />
            </div>
            <div className='flex-1 space-y-4'>
              <div className='space-y-2'>
                <div className='flex items-start justify-between gap-4'>
                  <div className='space-y-2'>
                    <Skeleton className='h-8 w-64' />
                    <Skeleton className='h-6 w-48' />
                  </div>
                  <Skeleton className='h-6 w-20 rounded-full' />
                </div>
              </div>
              <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4'>
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className='bg-background/80 flex items-center gap-3 rounded-lg border p-3'
                  >
                    <Skeleton className='h-10 w-10 rounded-lg' />
                    <div className='min-w-0 flex-1 space-y-2'>
                      <Skeleton className='h-3 w-12' />
                      <Skeleton className='h-4 w-24' />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Card>
      <div className='space-y-4'>
        <div className='bg-muted/50 grid grid-cols-3 gap-2 rounded-lg p-1 lg:grid-cols-6'>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className='h-10 rounded-md' />
          ))}
        </div>
        <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i} className='space-y-4 p-6'>
              <div className='mb-4 flex items-center gap-3'>
                <Skeleton className='h-10 w-10 rounded-lg' />
                <div className='space-y-2'>
                  <Skeleton className='h-5 w-32' />
                  <Skeleton className='h-3 w-48' />
                </div>
              </div>
              <div className='space-y-3'>
                {Array.from({ length: 6 }).map((_, j) => (
                  <div
                    key={j}
                    className='flex items-start justify-between gap-4 border-b py-2'
                  >
                    <Skeleton className='h-4 w-24' />
                    <Skeleton className='h-4 w-32' />
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
