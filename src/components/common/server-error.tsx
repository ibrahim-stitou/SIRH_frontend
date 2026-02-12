'use client';

import { Button } from '@/components/ui/button';

interface ServerErrorProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export default function ServerError({
  title = 'Serveur indisponible',
  message = 'Impossible de se connecter au serveur.',
  onRetry
}: ServerErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
      <h2 className="text-xl font-semibold text-red-600">
        {title}
      </h2>

      <p className="text-slate-600 max-w-md">
        {message}
      </p>

      {onRetry && (
        <Button onClick={onRetry}>
          Réessayer
        </Button>
      )}
    </div>
  );
}
