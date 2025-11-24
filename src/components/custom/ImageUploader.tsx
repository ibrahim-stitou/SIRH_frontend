// components/ImageUploader.tsx
import React from 'react';
import { ImageIcon, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FormFieldCustom } from './FormFieldCustom';

type ImageUploaderProps = {
  preview: string | null;
  setPreview: (preview: string | null) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
  error?: string | null;
};

export const ImageUploader: React.FC<ImageUploaderProps> = ({
                                                              preview,
                                                              onChange,
                                                              onClear,
                                                              error
                                                            }) => {
  return (
    <div className="mt-6">
      <FormFieldCustom name="image" label="Image du Véhicule" error={error}>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-2">
          <div className="md:col-span-2">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center gap-2 p-3 border rounded-md bg-gray-50">
                <ImageIcon className="h-5 w-5 text-gray-400" />
                <Input
                  type="file"
                  accept="image/jpeg,image/png,image/jpg"
                  onChange={onChange}
                  className="cursor-pointer border-0 bg-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
              <p className="text-xs text-gray-500">
                Formats acceptés: JPEG, PNG. Taille max: 5MB
              </p>
            </div>
          </div>
          <div className="md:col-span-3">
            {preview ? (
              <div className="relative h-48 w-full overflow-hidden rounded-md border bg-gray-50">
                <img
                  src={preview}
                  alt="Vehicle preview"
                  className="h-full w-full object-contain"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2 opacity-90"
                  onClick={onClear}
                >
                  Supprimer
                </Button>
              </div>
            ) : (
              <div className="flex h-48 w-full items-center justify-center rounded-md border border-dashed bg-gray-50 p-6 text-center">
                <div className="flex flex-col items-center text-gray-500">
                  <ImageIcon className="mb-2 h-10 w-10 opacity-50" />
                  <p>Aperçu de l&apos;image</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </FormFieldCustom>
    </div>
  );
};