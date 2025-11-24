// components/FormFieldCustom.tsx
import React from 'react';
import { cn } from '@/lib/utils';

type FormFieldCustomProps = {
  name: string;
  label?: string;
  children: React.ReactNode;
  required?: boolean;
  error?: string | null;
  description?: string;
  onFocus?: () => void;
  className?: string;
};

export const FormFieldCustom: React.FC<FormFieldCustomProps> = ({
                                                                  name,
                                                                  label,
                                                                  children,
                                                                  required = false,
                                                                  error,
                                                                  description,
                                                                  onFocus,
                                                                  className
                                                                }) => {
  const handleFocus = React.useCallback(() => {
    if (onFocus) onFocus();
  }, [onFocus]);

  return (
    <div className={cn('space-y-2', className)} onFocus={handleFocus}>
      {label && (
        <div className='flex items-baseline justify-between'>
          <label
            htmlFor={name}
            className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
          >
            {label}
            {required && <span className='text-destructive ml-1'>*</span>}
          </label>
        </div>
      )}

      {description && (
        <p className="text-xs text-muted-foreground mb-1">{description}</p>
      )}

      <div className="w-full">{children}</div>

      {error && (
        <p className="text-xs text-destructive mt-1">{error}</p>
      )}
    </div>
  );
};