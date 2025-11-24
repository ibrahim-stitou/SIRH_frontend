// components/FormSubmitButtons.tsx
import React from 'react';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/button';

type FormSubmitButtonsProps = {
  isSubmitting: boolean;
  onCancel: () => void;
};

export const FormSubmitButtons: React.FC<FormSubmitButtonsProps> = ({
                                                                      isSubmitting,
                                                                      onCancel
                                                                    }) => {
  return (
    <div className="flex justify-end space-x-4">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        className="px-6"
      >
        Annuler
      </Button>
      <Button
        type="submit"
        disabled={isSubmitting}
        className="px-6"
        size="default"
      >
        {isSubmitting ? (
          <>
            <div className="mr-2 flex gap-1">
              <div className="h-1 w-1 animate-bounce rounded-full bg-white [animation-delay:-0.3s]"></div>
              <div className="h-1 w-1 animate-bounce rounded-full bg-white [animation-delay:-0.15s]"></div>
              <div className="h-1 w-1 animate-bounce rounded-full bg-white"></div>
            </div>
            <span>Enregistrement...</span>
          </>
        ) : (
          <span className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Enregistrer le véhicule
          </span>
        )}
      </Button>
    </div>
  );
};