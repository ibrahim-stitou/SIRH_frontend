import React from 'react';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export const Section: React.FC<{
  title: string;
  description?: string;
  icon?: React.ReactNode;
  toolbar?: React.ReactNode;
  children: React.ReactNode;
  variant?: 'default' | 'compact';
}> = ({ title, description, icon, toolbar, children, variant = 'default' }) => (
  <Card
    className={cn(
      'border-l-primary/20 space-y-4 border-l-4 p-6 transition-all duration-300 hover:shadow-md',
      variant === 'compact' && 'p-4'
    )}
  >
    <div className='flex items-start justify-between gap-4'>
      <div className='flex-1 space-y-1'>
        <div className='flex items-center gap-3'>
          {icon && (
            <div className='bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg text-2xl'>
              {icon}
            </div>
          )}
          <div>
            <h3 className='text-foreground text-lg font-semibold tracking-tight'>
              {title}
            </h3>
            {description && (
              <p className='text-muted-foreground mt-0.5 text-sm'>
                {description}
              </p>
            )}
          </div>
        </div>
      </div>
      {toolbar && <div className='flex-shrink-0'>{toolbar}</div>}
    </div>
    <div className='space-y-4 pt-2'>{children}</div>
  </Card>
);

type FormFieldProps = {
  label: string;
  error?: string;
  children: React.ReactNode;
  isRequired?: boolean;
  isrequired?: boolean;
  hint?: string;
};

export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  children,
  isRequired,
  isrequired,
  hint
}) => {
  const required = isRequired || isrequired;
  return (
    <div className='space-y-2' aria-required={required || undefined}>
      <Label
        className={cn(
          'text-sm font-medium transition-colors',
          error && 'text-destructive'
        )}
      >
        {label}
        {required && <span className='text-destructive ml-1'>*</span>}
      </Label>
      {children}
      {hint && !error && (
        <p className='text-muted-foreground text-xs'>{hint}</p>
      )}
      {error && (
        <p className='text-destructive animate-in slide-in-from-top-1 flex items-center gap-1 text-xs'>
          <span className='inline-block'>⚠️</span>
          {error}
        </p>
      )}
    </div>
  );
};

export const EmptyHint: React.FC<{ text: string; icon?: string }> = ({
  text,
  icon = '📋'
}) => (
  <div className='border-muted-foreground/20 bg-muted/5 flex items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-8'>
    <span className='text-2xl opacity-30'>{icon}</span>
    <p className='text-muted-foreground text-sm italic'>{text}</p>
  </div>
);
