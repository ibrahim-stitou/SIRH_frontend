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
  <Card className={cn(
    "p-6 space-y-4 border-l-4 border-l-primary/20 transition-all duration-300 hover:shadow-md",
    variant === 'compact' && 'p-4'
  )}>
    <div className="flex items-start justify-between gap-4">
      <div className="space-y-1 flex-1">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-2xl">
              {icon}
            </div>
          )}
          <div>
            <h3 className="text-lg font-semibold tracking-tight text-foreground">{title}</h3>
            {description && (
              <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
            )}
          </div>
        </div>
      </div>
      {toolbar && <div className="flex-shrink-0">{toolbar}</div>}
    </div>
    <div className="space-y-4 pt-2">{children}</div>
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
    <div className="space-y-2" aria-required={required || undefined}>
      <Label className={cn(
        "text-sm font-medium transition-colors",
        error && "text-destructive"
      )}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {children}
      {hint && !error && (
        <p className="text-xs text-muted-foreground">{hint}</p>
      )}
      {error && (
        <p className="text-xs text-destructive flex items-center gap-1 animate-in slide-in-from-top-1">
          <span className="inline-block">⚠️</span>
          {error}
        </p>
      )}
    </div>
  );
};

export const EmptyHint: React.FC<{ text: string; icon?: string }> = ({ text, icon = "📋" }) => (
  <div className="flex items-center justify-center gap-2 py-8 px-4 border-2 border-dashed border-muted-foreground/20 rounded-lg bg-muted/5">
    <span className="text-2xl opacity-30">{icon}</span>
    <p className="text-sm text-muted-foreground italic">{text}</p>
  </div>
);
