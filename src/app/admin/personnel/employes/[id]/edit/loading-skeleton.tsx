"use client";

import React from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function EmployeeEditLoadingSkeleton() {
  return (
    <div className="w-full mx-auto px-4 py-8">
      {/* Header Skeleton */}
      <div className="mb-10">
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Stepper Skeleton */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          {Array.from({ length: 3 }).map((_, i) => (
            <React.Fragment key={i}>
              <div className="flex flex-col items-center gap-2">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
              {i < 2 && <Skeleton className="h-0.5 w-24 flex-1 mx-2" />}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Form Card Skeleton */}
      <Card className="p-6 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
          ))}
        </div>

        <div className="border-t pt-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
      </Card>
    </div>
  );
}

