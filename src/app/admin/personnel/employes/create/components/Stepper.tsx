import React from 'react';
import { cn } from '@/lib/utils';

export const Stepper: React.FC<{ current: number; steps: string[]; goTo: (i: number) => void }> = ({ current, steps, goTo }) => (
  <div className="flex items-center justify-between mb-8">
    {steps.map((s, idx) => {
      const done = idx < current;
      const active = idx === current;
      return (
        <div key={s} className="flex-1 flex flex-col items-center">
          <button
            type="button"
            onClick={() => idx <= current && goTo(idx)}
            className={cn(
              'relative flex h-10 w-10 items-center justify-center rounded-full border text-sm font-medium transition-all',
              done && 'bg-green-600 text-white border-green-600',
              active && 'bg-primary text-primary-foreground border-primary shadow',
              !done && !active && 'bg-muted text-muted-foreground border-muted-foreground/20'
            )}
          >
            {done ? '✓' : idx + 1}
          </button>
          <span className={cn('mt-2 text-xs font-medium', active ? 'text-foreground' : 'text-muted-foreground')}>{s}</span>
        </div>
      );
    })}
  </div>
);

