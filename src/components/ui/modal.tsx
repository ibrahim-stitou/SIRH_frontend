'use client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  className?: string; // Optional className for custom styling
  titleClassName?: string;
  descriptionClassName?: string;
  icon?: React.ReactNode;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
  titleClassName,
  descriptionClassName,
  icon
}: ModalProps) {
  const onChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onChange}>
      <DialogContent
        className={cn('max-w-2xl gap-0 overflow-hidden p-0', className)}
      >
        {/* Header avec icône et fond coloré */}
        <div className='border-b border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-5'>
          <DialogHeader>
            <div className='flex items-start gap-3'>
              {icon && (
                <div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600'>
                  {icon}
                </div>
              )}
              <div className='min-w-0 flex-1'>
                <DialogTitle
                  className={cn(
                    'mb-1 text-xl font-semibold text-gray-900',
                    titleClassName
                  )}
                >
                  {title}
                </DialogTitle>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Contenu du modal */}
        <div className='px-6 py-5'>
          {description && (
            <DialogDescription
              className={cn(
                'text-sm leading-relaxed whitespace-pre-line text-gray-700',
                descriptionClassName
              )}
            >
              {description}
            </DialogDescription>
          )}
          {children && <div className='mt-4'>{children}</div>}
        </div>
      </DialogContent>
    </Dialog>
  );
}
