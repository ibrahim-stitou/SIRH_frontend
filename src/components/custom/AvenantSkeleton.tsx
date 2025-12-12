import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

/**
 * Skeleton pour la page de détails d'un avenant
 */
export function AvenantDetailsSkeleton() {
  return (
    <div className='w-full space-y-6 p-4 md:p-6'>
      {/* Header Skeleton */}
      <div className='relative overflow-hidden rounded-lg border bg-gradient-to-r from-primary/10 via-primary/5 to-background p-6'>
        <div className='space-y-4'>
          <div className='h-8 w-32 bg-muted animate-pulse rounded' />
          <div className='flex items-center justify-between'>
            <div className='space-y-3 flex-1'>
              <div className='flex items-center gap-3'>
                <div className='h-9 w-48 bg-muted animate-pulse rounded' />
                <div className='h-7 w-24 bg-muted animate-pulse rounded' />
              </div>
              <div className='flex items-center gap-2'>
                <div className='h-5 w-40 bg-muted animate-pulse rounded' />
                <div className='h-5 w-px bg-muted' />
                <div className='h-5 w-48 bg-muted animate-pulse rounded' />
              </div>
            </div>
            <div className='flex gap-2'>
              <div className='h-9 w-32 bg-muted animate-pulse rounded' />
              <div className='h-9 w-32 bg-muted animate-pulse rounded' />
              <div className='h-9 w-32 bg-muted animate-pulse rounded' />
            </div>
          </div>
        </div>
      </div>

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
        {/* Colonne principale */}
        <div className='lg:col-span-3 space-y-6'>
          {/* Card Informations Générales Skeleton */}
          <Card>
            <CardHeader>
              <div className='h-6 w-48 bg-muted animate-pulse rounded' />
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className='space-y-2'>
                    <div className='h-4 w-24 bg-muted animate-pulse rounded' />
                    <div className='h-5 w-full bg-muted animate-pulse rounded' />
                  </div>
                ))}
              </div>
              <div className='space-y-2'>
                <div className='h-4 w-16 bg-muted animate-pulse rounded' />
                <div className='h-20 w-full bg-muted animate-pulse rounded' />
              </div>
            </CardContent>
          </Card>

          {/* Card Modifications Skeleton */}
          <Card>
            <CardHeader>
              <div className='h-6 w-32 bg-muted animate-pulse rounded' />
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <div className='space-y-3 p-4 border rounded-lg'>
                    <div className='h-5 w-20 bg-muted animate-pulse rounded' />
                    <div className='h-4 w-full bg-muted animate-pulse rounded' />
                    <div className='h-4 w-full bg-muted animate-pulse rounded' />
                  </div>
                  <div className='space-y-3 p-4 border rounded-lg'>
                    <div className='h-5 w-20 bg-muted animate-pulse rounded' />
                    <div className='h-4 w-full bg-muted animate-pulse rounded' />
                    <div className='h-4 w-full bg-muted animate-pulse rounded' />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card Documents Skeleton */}
          <Card>
            <CardHeader>
              <div className='h-6 w-32 bg-muted animate-pulse rounded' />
            </CardHeader>
            <CardContent className='space-y-3'>
              {[1, 2].map((i) => (
                <div key={i} className='flex items-center justify-between p-4 border rounded-lg'>
                  <div className='flex items-center gap-3'>
                    <div className='h-10 w-10 bg-muted animate-pulse rounded' />
                    <div className='space-y-2'>
                      <div className='h-4 w-48 bg-muted animate-pulse rounded' />
                      <div className='h-3 w-32 bg-muted animate-pulse rounded' />
                    </div>
                  </div>
                  <div className='flex gap-2'>
                    <div className='h-8 w-24 bg-muted animate-pulse rounded' />
                    <div className='h-8 w-24 bg-muted animate-pulse rounded' />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton pour la page d'édition/création d'un avenant
 */
export function AvenantFormSkeleton() {
  return (
    <div className='w-full space-y-6'>
      {/* Header Skeleton */}
      <div className='relative overflow-hidden rounded-lg border bg-gradient-to-r from-primary/10 via-primary/5 to-background p-6'>
        <div className='flex items-center justify-between'>
          <div className='space-y-3 flex-1'>
            <div className='flex items-center gap-3'>
              <div className='h-9 w-64 bg-muted animate-pulse rounded' />
              <div className='h-7 w-32 bg-muted animate-pulse rounded' />
              <div className='h-7 w-24 bg-muted animate-pulse rounded' />
            </div>
            <div className='flex items-center gap-2'>
              <div className='h-5 w-40 bg-muted animate-pulse rounded' />
              <div className='h-5 w-px bg-muted' />
              <div className='h-5 w-48 bg-muted animate-pulse rounded' />
            </div>
          </div>
          <div className='flex gap-3'>
            <div className='h-10 w-48 bg-muted animate-pulse rounded' />
            <div className='h-10 w-52 bg-muted animate-pulse rounded' />
          </div>
        </div>
      </div>

      <div className='grid grid-cols-1 gap-6 xl:grid-cols-4'>
        {/* Sidebar Skeleton */}
        <div className='xl:col-span-1 space-y-4'>
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className='pb-3'>
                <div className='h-5 w-32 bg-muted animate-pulse rounded' />
              </CardHeader>
              <CardContent className='space-y-3'>
                <div className='h-16 bg-muted animate-pulse rounded' />
                <div className='h-16 bg-muted animate-pulse rounded' />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Form Skeleton */}
        <div className='xl:col-span-3 space-y-6'>
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className='h-6 w-48 bg-muted animate-pulse rounded' />
                <div className='h-4 w-96 bg-muted animate-pulse rounded mt-2' />
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <div className='h-4 w-24 bg-muted animate-pulse rounded' />
                    <div className='h-10 bg-muted animate-pulse rounded' />
                  </div>
                  <div className='space-y-2'>
                    <div className='h-4 w-24 bg-muted animate-pulse rounded' />
                    <div className='h-10 bg-muted animate-pulse rounded' />
                  </div>
                </div>
                <div className='space-y-2'>
                  <div className='h-4 w-32 bg-muted animate-pulse rounded' />
                  <div className='h-24 bg-muted animate-pulse rounded' />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton générique pour les cards
 */
export function CardSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <Card>
      <CardHeader>
        <div className='h-6 w-48 bg-muted animate-pulse rounded' />
        <div className='h-4 w-full bg-muted animate-pulse rounded mt-2' />
      </CardHeader>
      <CardContent className='space-y-3'>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className='h-4 w-full bg-muted animate-pulse rounded' />
        ))}
      </CardContent>
    </Card>
  );
}

/**
 * Skeleton pour un formulaire simple
 */
export function FormFieldSkeleton() {
  return (
    <div className='space-y-2'>
      <div className='h-4 w-24 bg-muted animate-pulse rounded' />
      <div className='h-10 bg-muted animate-pulse rounded' />
    </div>
  );
}

/**
 * Skeleton pour une liste de documents
 */
export function DocumentListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className='space-y-3'>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className='flex items-center justify-between p-4 border rounded-lg'>
          <div className='flex items-center gap-3'>
            <div className='h-10 w-10 bg-muted animate-pulse rounded' />
            <div className='space-y-2'>
              <div className='h-4 w-48 bg-muted animate-pulse rounded' />
              <div className='h-3 w-32 bg-muted animate-pulse rounded' />
            </div>
          </div>
          <div className='flex gap-2'>
            <div className='h-8 w-24 bg-muted animate-pulse rounded' />
            <div className='h-8 w-24 bg-muted animate-pulse rounded' />
          </div>
        </div>
      ))}
    </div>
  );
}

