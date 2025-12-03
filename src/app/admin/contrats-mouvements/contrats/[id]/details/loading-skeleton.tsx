import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function ContractDetailsLoadingSkeleton() {
  return (
    <div className="w-full mx-auto px-4 py-6 space-y-4 mt-2">
      {/* Compact Header Section */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-background opacity-50" />

        <div className="relative p-4 md:p-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Compact Avatar Skeleton */}
            <div className="flex-shrink-0">
              <Skeleton className="h-16 w-16 rounded-xl" />
            </div>

            {/* Compact Info Section Skeleton */}
            <div className="flex-1 space-y-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <Skeleton className="h-4 w-32" />
              </div>

              {/* Compact Info Cards Skeleton */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-2 p-2 rounded-lg border">
                    <Skeleton className="h-8 w-8 rounded-lg" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-2 w-12" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Compact Action Buttons Skeleton */}
          <div className="flex items-center gap-2 mt-4 pt-4 border-t">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-8 w-28" />
            <Skeleton className="h-8 w-36" />
          </div>
        </div>
      </Card>

      {/* Compact Content Grid Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <Skeleton className="h-4 w-24" />
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {[1, 2, 3].map((j) => (
                <div key={j} className="space-y-1">
                  <Skeleton className="h-2 w-20" />
                  <Skeleton className="h-3 w-full" />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bottom Card Skeleton */}
      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}