import React from 'react';

export default function OverviewLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-6" role="region" aria-label="HR Overview Layout">
      {children}
    </div>
  );
}

