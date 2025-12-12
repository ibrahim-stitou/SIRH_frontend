import React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

export const Stepper: React.FC<{
  current: number;
  steps: string[];
  goTo: (i: number) => void;
}> = ({ current, steps, goTo }) => (
  <div className='relative mb-12'>
    {/* Progress line */}
    <div className='bg-muted absolute top-5 right-0 left-0 hidden h-0.5 md:block'>
      <div
        className='bg-primary h-full transition-all duration-500 ease-out'
        style={{ width: `${(current / (steps.length - 1)) * 100}%` }}
      />
    </div>

    <div className='relative flex items-start justify-between'>
      {steps.map((s, idx) => {
        const done = idx < current;
        const active = idx === current;
        const canNavigate = idx <= current;

        return (
          <div key={s} className='group flex flex-1 flex-col items-center'>
            {/* Step circle */}
            <button
              type='button'
              onClick={() => canNavigate && goTo(idx)}
              disabled={!canNavigate}
              className={cn(
                'relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all duration-300 ease-out',
                'focus:ring-primary focus:ring-2 focus:ring-offset-2 focus:outline-none',
                done &&
                  'bg-primary border-primary text-primary-foreground shadow-lg hover:scale-110 hover:shadow-xl',
                active &&
                  'bg-primary border-primary text-primary-foreground scale-110 animate-pulse shadow-lg',
                !done &&
                  !active &&
                  'bg-background border-muted-foreground/30 text-muted-foreground hover:border-primary/50',
                canNavigate && !active && 'cursor-pointer',
                !canNavigate && 'cursor-not-allowed opacity-50'
              )}
            >
              {done ? (
                <Check className='h-5 w-5' strokeWidth={3} />
              ) : (
                <span>{idx + 1}</span>
              )}
            </button>

            {/* Step label */}
            <div className='mt-3 flex max-w-[120px] flex-col items-center text-center'>
              <span
                className={cn(
                  'text-xs font-medium transition-colors duration-300 md:text-sm',
                  active && 'text-foreground font-semibold',
                  done && 'text-muted-foreground',
                  !done && !active && 'text-muted-foreground'
                )}
              >
                {s}
              </span>
              {active && (
                <div className='bg-primary mt-1 h-1 w-12 animate-pulse rounded-full' />
              )}
            </div>
          </div>
        );
      })}
    </div>
  </div>
);
