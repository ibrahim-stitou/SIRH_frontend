import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type StatusTone =
  | 'neutral'
  | 'info'
  | 'success'
  | 'warning'
  | 'danger'
  | 'purple'
  | 'orange';

export interface StatusBadgeProps {
  label: React.ReactNode;
  tone?: StatusTone;
  className?: string;
  icon?: React.ReactNode;
}

const toneClasses: Record<StatusTone, string> = {
  neutral: 'border-gray-400 text-gray-700',
  info: 'border-blue-500 text-blue-600',
  success: 'border-emerald-500 text-emerald-600',
  warning: 'border-amber-500 text-amber-600',
  danger: 'border-red-500 text-red-600',
  purple: 'border-purple-500 text-purple-600',
  orange: 'border-orange-500 text-orange-600'
};

export function StatusBadge({
  label,
  tone = 'neutral',
  className,
  icon
}: StatusBadgeProps) {
  return (
    <Badge
      variant='outline'
      className={cn('gap-1', toneClasses[tone], className)}
    >
      {icon ? <span className='[&>svg]:size-3'>{icon}</span> : null}
      {label}
    </Badge>
  );
}

export default StatusBadge;
