import * as React from 'react';
import { useDropzone, FileWithPath } from 'react-dropzone';
import { UploadCloud, X, FileText, ArrowDownToLine } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import apiClient from '@/lib/api';
import { apiRoutes } from '@/config/apiRoutes';
import Image from 'next/image';

interface SingleFileUploadProps {
  onFileChange: (file: UploadedFile | null) => void;
  value?: UploadedFile | null;
  maxSize?: number; // in MB
  disabled?: boolean;
  className?: string;
  accept?: Record<string, string[]>;
  description?: string;
  previewHeight?: string;
  showPreview?: boolean;
  label?: string;
  collection?: string;
}

export interface UploadedFile {
  id?: number;
  name: string;
  url?: string;
  mime_type: string;
  size: number;
  file?: File;
  file_name?: string;
  path?: string;
  collection_name?: string;
  created_at?: string;
}

export function SingleFileUpload({
  onFileChange,
  value,
  maxSize = 10,
  disabled = false,
  className,
  accept = { 'application/pdf': ['.pdf'] },
  description = 'Upload a file',
  previewHeight = 'h-96',
  showPreview = true,
  label,
  collection = 'default'
}: SingleFileUploadProps) {
  const [error, setError] = React.useState<string | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [file, setFile] = React.useState<UploadedFile | null>(value || null);

  React.useEffect(() => {
    setFile(value || null);
  }, [value]);

  const uploadFile = React.useCallback(
    async (fileToUpload: File) => {
      try {
        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', fileToUpload);
        formData.append('collection', collection);

        const response = await apiClient.post(
          apiRoutes.files.uploadTemp,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );

        return {
          ...response.data,
          file: fileToUpload,
          collection_name: collection
        };
      } catch (error: any) {
        console.error('Upload failed:', error);
        const errorMsg =
          error.response?.data?.message ||
          'File upload failed. Please try again.';
        setError(errorMsg);
        throw error;
      } finally {
        setIsUploading(false);
      }
    },
    [collection]
  );

  const onDrop = React.useCallback(
    async (acceptedFiles: FileWithPath[]) => {
      setError(null);

      if (acceptedFiles.length === 0) {
        setError('No valid file selected');
        return;
      }

      const selectedFile = acceptedFiles[0];
      if (selectedFile.size > maxSize * 1024 * 1024) {
        setError(`File size exceeds ${maxSize}MB limit`);
        return;
      }

      try {
        const uploadedFile = await uploadFile(selectedFile);
        setFile(uploadedFile);
        onFileChange(uploadedFile);
      } catch (error) {}
    },
    [maxSize, onFileChange, uploadFile]
  );

  const removeFile = async () => {
    setFile(null);
    onFileChange(null);
    try {
      if (file?.path) {
        await apiClient.post(apiRoutes.files.cleanupTemp, {
          paths: [file.path]
        });
      }
    } catch (error) {
      console.error('Failed to cleanup file:', error);
    }
    setFile(null);
    onFileChange(null);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize: maxSize * 1024 * 1024,
    maxFiles: 1,
    disabled: disabled || !!file || isUploading
  });

  const getFileTypeDisplay = (mimeType: string) => {
    if (!mimeType) return 'File';
    if (mimeType.startsWith('image/')) return 'Image';
    if (mimeType === 'application/pdf') return 'PDF';
    if (mimeType.includes('document')) return 'Document';
    if (mimeType.includes('sheet')) return 'Spreadsheet';
    if (mimeType.includes('presentation')) return 'Presentation';
    return 'File';
  };

  if (file) {
    return (
      <div className={cn('overflow-hidden rounded-lg border', className)}>
        {label && <div className='px-4 pt-4 text-sm font-medium'>{label}</div>}
        <div className='p-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <span className='max-w-[200px] truncate font-medium'>
                {file.name}
              </span>
            </div>
            <div className='flex items-center gap-2'>
              {file.url && (
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  className='h-8'
                  onClick={() => window.open(file.url, '_blank')}
                >
                  <ArrowDownToLine className='mr-1 h-4 w-4' />
                  View
                </Button>
              )}
              <Button
                type='button'
                variant='ghost'
                size='icon'
                className='text-destructive h-8 w-8'
                onClick={removeFile}
                disabled={disabled || isUploading}
              >
                <X className='h-4 w-4' />
              </Button>
            </div>
          </div>
          <div className='text-muted-foreground mt-2 text-xs'>
            {getFileTypeDisplay(file.mime_type)} •{' '}
            {(file.size / 1024 / 1024).toFixed(2)} MB
            {file.created_at && (
              <span className='ml-1'>
                • {new Date(file.created_at).toLocaleDateString()}
              </span>
            )}
          </div>

          {showPreview &&
            (file.mime_type === 'application/pdf' ||
              file.mime_type.startsWith('image/')) && (
              <div className='mt-4 rounded border bg-white'>
                {file.url ? (
                  file.mime_type === 'application/pdf' ? (
                    <iframe
                      src={file.url}
                      className={`w-full ${previewHeight}`}
                      title={file.name}
                    />
                  ) : (
                    <Image
                      src={file.url}
                      alt={file.name}
                      width={1200}
                      height={800}
                      className={`w-full ${previewHeight} object-contain`}
                    />
                  )
                ) : file.file ? (
                  file.mime_type === 'application/pdf' ? (
                    <iframe
                      src={URL.createObjectURL(file.file)}
                      className={`w-full ${previewHeight}`}
                      title={file.name}
                    />
                  ) : (
                    <Image
                      src={URL.createObjectURL(file.file)}
                      alt={file.name}
                      width={1200}
                      height={800}
                      className={`w-full ${previewHeight} object-contain`}
                    />
                  )
                ) : (
                  <div
                    className={`w-full ${previewHeight} flex items-center justify-center`}
                  >
                    <FileText className='text-muted-foreground h-10 w-10' />
                  </div>
                )}
              </div>
            )}
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {label && <div className='mb-2 text-sm font-medium'>{label}</div>}
      <div
        {...getRootProps()}
        className={cn(
          'cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors',
          isDragActive
            ? 'border-primary bg-primary/10'
            : 'border-muted-foreground/30',
          (disabled || isUploading) && 'cursor-not-allowed opacity-50'
        )}
      >
        <input {...getInputProps()} />
        <div className='flex flex-col items-center justify-center gap-2'>
          <UploadCloud className='text-muted-foreground h-8 w-8' />
          <p className='text-muted-foreground text-sm'>
            {isUploading ? 'Uploading...' : description}
          </p>
          <p className='text-muted-foreground text-xs'>Max size: {maxSize}MB</p>
        </div>
      </div>
      {error && (
        <p className='text-destructive mt-2 text-sm font-medium'>{error}</p>
      )}
    </div>
  );
}
