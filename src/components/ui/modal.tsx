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
        className={cn(
          "max-w-2xl p-0 gap-0 overflow-hidden",
          className
        )}
      >
        {/* Header avec icône et fond coloré */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-5 border-b border-blue-100">
          <DialogHeader>
            <div className="flex items-start gap-3">
              {icon && (
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  {icon}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <DialogTitle
                  className={cn(
                    "text-xl font-semibold text-gray-900 mb-1",
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
        <div className="px-6 py-5">
          {description && (
            <DialogDescription
              className={cn(
                "text-sm text-gray-700 leading-relaxed whitespace-pre-line",
                descriptionClassName
              )}
            >
              {description}
            </DialogDescription>
          )}
          {children && <div className="mt-4">{children}</div>}
        </div>
      </DialogContent>
    </Dialog>
  );
}
