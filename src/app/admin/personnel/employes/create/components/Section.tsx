import React from 'react';
import { Label } from '@/components/ui/label';

export const Section: React.FC<{ title: string; description?: string; icon?: string; toolbar?: React.ReactNode; children: React.ReactNode }> = ({ title, description, icon, toolbar, children }) => (
  <div className="space-y-3">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {icon && <span className="text-xl">{icon}</span>}
        <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
      </div>
      {toolbar}
    </div>
    {description && <p className="text-sm text-muted-foreground">{description}</p>}
    <div className="space-y-4">{children}</div>
  </div>
);

type FormFieldProps = { label: string; error?: string; children: React.ReactNode; isRequired?: boolean; isrequired?: boolean };
export const FormField: React.FC<FormFieldProps> = ({ label, error, children, isRequired, isrequired }) => {
  const required = isRequired || isrequired;
  return (
    <div className="space-y-1" aria-required={required || undefined}>
      <Label className="text-sm font-medium">
        {label}{required && <span className="text-red-600 ml-0.5">*</span>}
      </Label>
      {children}
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
};

export const EmptyHint: React.FC<{ text: string }> = ({ text }) => (
  <div className="text-xs text-muted-foreground italic">{text}</div>
);
