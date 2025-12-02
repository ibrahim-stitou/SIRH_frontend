import React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

export const Stepper: React.FC<{ current: number; steps: string[]; goTo: (i: number) => void }> = ({ current, steps, goTo }) => (
  <div className="relative mb-12">
    {/* Progress line */}
    <div className="absolute top-5 left-0 right-0 h-0.5 bg-muted hidden md:block">
      <div
        className="h-full bg-primary transition-all duration-500 ease-out"
        style={{ width: `${(current / (steps.length - 1)) * 100}%` }}
      />
    </div>

    <div className="relative flex items-start justify-between">
      {steps.map((s, idx) => {
        const done = idx < current;
        const active = idx === current;
        const canNavigate = idx <= current;

        return (
          <div key={s} className="flex-1 flex flex-col items-center group">
            {/* Step circle */}
            <button
              type="button"
              onClick={() => canNavigate && goTo(idx)}
              disabled={!canNavigate}
              className={cn(
                'relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all duration-300 ease-out',
                'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                done && 'bg-primary border-primary text-primary-foreground shadow-lg hover:shadow-xl hover:scale-110',
                active && 'bg-primary border-primary text-primary-foreground shadow-lg scale-110 animate-pulse',
                !done && !active && 'bg-background border-muted-foreground/30 text-muted-foreground hover:border-primary/50',
                canNavigate && !active && 'cursor-pointer',
                !canNavigate && 'cursor-not-allowed opacity-50'
              )}
            >
              {done ? (
                <Check className="h-5 w-5" strokeWidth={3} />
              ) : (
                <span>{idx + 1}</span>
              )}
            </button>

            {/* Step label */}
            <div className="mt-3 flex flex-col items-center text-center max-w-[120px]">
              <span className={cn(
                'text-xs md:text-sm font-medium transition-colors duration-300',
                active && 'text-foreground font-semibold',
                done && 'text-muted-foreground',
                !done && !active && 'text-muted-foreground'
              )}>
                {s}
              </span>
              {active && (
                <div className="mt-1 h-1 w-12 rounded-full bg-primary animate-pulse" />
              )}
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

