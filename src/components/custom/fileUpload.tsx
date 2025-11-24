'use client';

import * as React from 'react';
import Image from 'next/image';
import { useDropzone, FileWithPath } from 'react-dropzone';
import { toast } from 'sonner';
import {
  UploadCloud,
  X,
  FileText,
  FileImage,
  FileArchive,
  FileCode,
  Eye,
  Check,
  Loader2
} from 'lucide-react';

import { cn, formatBytes } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import apiClient from '@/lib/api';
import { apiRoutes } from '@/config/apiRoutes';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';

interface FileUploaderProps {
  value?: UploadedFile[];
  onChange?: (files: UploadedFile[]) => void;
  maxSize?: number; // in MB
  maxFiles?: number;
  accept?: Record<string, string[]>;
  disabled?: boolean;
  className?: string;
  multiple?: boolean;
  showPreview?: boolean;
  variant?: 'default' | 'compact';
  description?: string;
  collection?: string;
  onRemove?: (file: UploadedFile) => void;
}

export interface UploadedFile {
  custom_properties: string;
  id?: string | number;
  name: string;
  size: number;
  type: string;
  path?: string;
  url?: string;
  preview?: string;
  file?: File;
  progress?: number;
  collection_name?: string;
  created_at?: string;
  uuid?: string;
}

export function FileUploader({
  value,
  onChange,
  onRemove,
  maxSize = 10,
  maxFiles = 10,
  accept = {
    'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
    'application/pdf': ['.pdf'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [
      '.docx'
    ]
  },
  disabled = false,
  className,
  multiple = true,
  showPreview = true,
  variant = 'default',
  description,
  collection = 'default'
}: FileUploaderProps) {
  const [files, setFiles] = React.useState<UploadedFile[]>(value || []);
  const [uploading, setUploading] = React.useState<boolean>(false);
  const [dragActive, setDragActive] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState<
    Record<string, number>
  >({});

  // Sync with external value prop
  React.useEffect(() => {
    if (value && JSON.stringify(value) !== JSON.stringify(files)) {
      setFiles(value);
    }
  }, [value]);

  // Calculate accepted file types for display
  const acceptedFileTypes = React.useMemo(() => {
    const typeLabels: Record<string, string> = {
      'application/pdf': 'PDF',
      'application/msword': 'DOC',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        'DOCX',
      'image/jpeg': 'JPEG',
      'image/png': 'PNG',
      'image/*': 'Images'
    };

    return Object.keys(accept)
      .map((key) => {
        return typeLabels[key] || key.split('/')[1]?.toUpperCase() || key;
      })
      .join(', ');
  }, [accept]);

  const uploadFile = async (file: File): Promise<UploadedFile> => {
    const fileId = `${file.name}-${Date.now()}`;

    try {
      // Set initial progress
      setUploadProgress((prev) => ({ ...prev, [fileId]: 0 }));

      const formData = new FormData();
      formData.append('file', file);
      formData.append('collection', collection);

      const response = await apiClient.post(
        apiRoutes.files.uploadTemp,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent: {
            loaded: number;
            total?: number;
          }) => {
            if (progressEvent.total) {
              const progress = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setUploadProgress((prev) => ({ ...prev, [fileId]: progress }));
            }
          }
        }
      );

      // Set final progress
      setUploadProgress((prev) => ({ ...prev, [fileId]: 100 }));

      return {
        custom_properties: '',
        id: response.data.id || fileId,
        name: file.name,
        size: file.size,
        type: file.type,
        path: response.data.path,
        url: response.data.url,
        preview: file.type.startsWith('image/')
          ? URL.createObjectURL(file)
          : undefined,
        file,
        progress: 100,
        collection_name: collection,
        created_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error(`Failed to upload ${file.name}`);
      throw error;
    }
  };

  const onDrop = React.useCallback(
    async (acceptedFiles: FileWithPath[], rejectedFiles: any[]) => {
      if (disabled || uploading) return;

      if (rejectedFiles.length > 0) {
        rejectedFiles.forEach(({ file, errors }) => {
          //@ts-ignore
          const errorMessages = errors.map((e: { code: any; message: any }) => {
            switch (e.code) {
              case 'file-too-large':
                return `File too large (max: ${maxSize}MB)`;
              case 'file-invalid-type':
                return 'File type not accepted';
              default:
                return e.message;
            }
          });
          toast.error(`${file.name}: ${errorMessages.join(', ')}`);
        });
      }

      if (acceptedFiles.length === 0) return;
      if (!multiple) {
        if (acceptedFiles.length > 1) {
          toast.warning('Only one file can be uploaded at a time');
          acceptedFiles = [acceptedFiles[0]];
        }
      } else if (files.length + acceptedFiles.length > maxFiles) {
        toast.warning(`Cannot upload more than ${maxFiles} files`);
        acceptedFiles = acceptedFiles.slice(0, maxFiles - files.length);
      }

      setUploading(true);

      try {
        const uploadPromises = acceptedFiles.map((file) => uploadFile(file));
        const uploadedFiles = await Promise.all(uploadPromises);
        const newFiles = multiple
          ? [...files, ...uploadedFiles]
          : uploadedFiles;

        setFiles(newFiles);
        onChange?.(newFiles);
        toast.success(`${uploadedFiles.length} file(s) uploaded successfully`);
      } catch (error) {
        console.error('Error during upload:', error);
      } finally {
        setUploading(false);
      }
    },
    [
      disabled,
      uploading,
      files,
      multiple,
      maxFiles,
      onChange,
      maxSize,
      collection
    ]
  );

  const removeFile = async (fileIndex: number) => {
    const fileToRemove = files[fileIndex];

    if (disabled || uploading) return;

    try {
      if (fileToRemove.path) {
        await apiClient.post(apiRoutes.files.cleanupTemp, {
          paths: [fileToRemove.path]
        });
      }
      if (fileToRemove.preview && fileToRemove.preview.startsWith('blob:')) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      const newFiles = [...files];
      newFiles.splice(fileIndex, 1);
      setFiles(newFiles);
      onChange?.(newFiles);
      onRemove?.(fileToRemove);

      toast.info(`${fileToRemove.name} removed`);
    } catch (error) {
      console.error('Error removing file:', error);
      toast.error(`Failed to remove ${fileToRemove.name}`);
    }
  };
  React.useEffect(() => {
    return () => {
      files.forEach((file) => {
        if (file.preview && file.preview.startsWith('blob:')) {
          URL.revokeObjectURL(file.preview);
        }
      });
    };
  }, [files]);
  const {
    getRootProps,
    getInputProps,
    isDragActive: libDragActive
  } = useDropzone({
    onDrop,
    accept,
    maxSize: maxSize * 1024 * 1024,
    maxFiles,
    multiple,
    disabled:
      disabled ||
      uploading ||
      (files.length >= maxFiles && multiple) ||
      (!multiple && files.length >= 1),
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
    onDropAccepted: () => setDragActive(false),
    onDropRejected: () => setDragActive(false)
  });
  const isMaxed = multiple ? files.length >= maxFiles : files.length >= 1;
  const isDisabled = disabled || uploading;
  const hasFiles = files.length > 0;
  const renderContent = () => {
    if (!hasFiles) {
      return (
        <div className='flex h-full flex-col items-center justify-center p-2 text-center'>
          <UploadCloud className='text-muted-foreground mb-2 h-8 w-8' />
          <p className='text-sm font-medium'>
            {multiple
              ? 'Drop files or click to upload'
              : 'Drop file or click to upload'}
          </p>
          <p className='text-muted-foreground mt-1 text-xs'>
            {acceptedFileTypes} (Max: {maxSize}MB)
          </p>
        </div>
      );
    }
    const imageFiles = files.filter((file) => file.type.startsWith('image/'));
    const pdfFiles = files.filter((file) => file.type.includes('pdf'));
    const otherFiles = files.filter(
      (file) => !file.type.startsWith('image/') && !file.type.includes('pdf')
    );

    return (
      <div className='flex h-full w-full flex-col'>
        {/* Reduced header when files are present */}
        {!isMaxed && (
          <div className='flex items-center justify-center gap-2 border-b border-dashed p-2'>
            <UploadCloud className='text-muted-foreground h-4 w-4' />
            <span className='text-xs'>
              {files.length} of {maxFiles}{' '}
              {files.length === 1 ? 'file' : 'files'}
            </span>
          </div>
        )}

        <div className='flex-1 overflow-auto p-2'>
          {/* Images grid */}
          {imageFiles.length > 0 && (
            <div
              className={`grid ${getGridClass(imageFiles.length)} mb-2 gap-2`}
            >
              {imageFiles.map((file, index) => (
                <FilePreviewCard
                  key={file.id || index}
                  file={file}
                  onRemove={() => removeFile(files.indexOf(file))}
                  disabled={isDisabled}
                />
              ))}
            </div>
          )}

          {/* PDF files */}
          {pdfFiles.length > 0 && (
            <div className='mb-2 space-y-2'>
              {pdfFiles.map((file, index) => (
                <FileCard
                  key={file.id || index}
                  file={file}
                  onRemove={() => removeFile(files.indexOf(file))}
                  disabled={isDisabled}
                  progress={file.progress}
                  isPdf={true}
                />
              ))}
            </div>
          )}

          {/* Other files */}
          {otherFiles.length > 0 && (
            <div className='space-y-2'>
              {otherFiles.map((file, index) => (
                <FileCard
                  key={file.id || index}
                  file={file}
                  onRemove={() => removeFile(files.indexOf(file))}
                  disabled={isDisabled}
                  progress={file.progress}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Helper function to determine grid class based on file count
  const getGridClass = (count: number) => {
    if (count === 1) return 'grid-cols-1';
    if (count === 2) return 'grid-cols-2';
    if (count === 3) return 'grid-cols-3';
    return 'grid-cols-2 md:grid-cols-4';
  };

  return (
    <div className='relative'>
      <div
        {...getRootProps()}
        className={cn(
          'group relative w-full rounded-xl border-2 border-dashed transition-colors',
          'focus-visible:ring-primary focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
          dragActive || libDragActive
            ? 'border-primary/50 bg-blue-50/30'
            : 'border-muted-foreground/20 hover:border-muted-foreground/40',
          isDisabled && 'pointer-events-none cursor-not-allowed opacity-60',
          !isDisabled && 'cursor-pointer',
          className || 'h-40'
        )}
      >
        <input {...getInputProps()} />
        {renderContent()}

        {/* Upload progress overlay */}
        {uploading && (
          <div className='bg-background/80 absolute inset-0 flex flex-col items-center justify-center rounded-xl backdrop-blur-sm'>
            <Loader2 className='text-primary mb-2 h-7 w-7 animate-spin' />
            <p className='text-sm font-medium'>Uploading...</p>
          </div>
        )}
      </div>

      {/* File counter if needed outside the box */}
      {hasFiles && multiple && maxFiles > 1 && !uploading && (
        <div className='text-muted-foreground mt-1.5 flex items-center justify-between text-xs'>
          <span>
            {files.length} of {maxFiles} files
          </span>
          {!isMaxed && (
            <span className='text-muted-foreground text-xs'>
              Drop more or click to upload
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// Image preview card component
function FilePreviewCard({
  file,
  onRemove,
  disabled
}: {
  file: UploadedFile;
  onRemove: () => void;
  disabled?: boolean;
}) {
  return (
    <div className='bg-muted/10 group relative aspect-square overflow-hidden rounded-md border'>
      {file.preview || file.url ? (
        <Image
          src={file.preview || file.url || ''}
          alt={file.name}
          fill
          className='object-cover'
          sizes='(max-width: 768px) 100vw, 33vw'
        />
      ) : (
        <div className='flex h-full w-full items-center justify-center'>
          <FileImage className='text-muted-foreground h-6 w-6' />
        </div>
      )}

      {/* Hover overlay with file name */}
      <div className='absolute inset-0 flex flex-col justify-between bg-black/40 p-1.5 opacity-0 transition-opacity group-hover:opacity-100'>
        <div className='self-end'>
          <button
            type='button'
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            disabled={disabled}
            className='rounded-full bg-black/50 p-1 text-white transition-colors hover:bg-red-600/80'
          >
            <X className='h-3 w-3' />
            <span className='sr-only'>Remove</span>
          </button>
        </div>
        <div className='truncate rounded-sm bg-black/70 p-1 text-xs text-white'>
          {file.name}
        </div>
      </div>
    </div>
  );
}

// File card for non-image files
function FileCard({
  file,
  onRemove,
  disabled,
  progress,
  isPdf = false
}: {
  file: UploadedFile;
  onRemove: () => void;
  disabled?: boolean;
  progress?: number;
  isPdf?: boolean;
}) {
  const isUploading = progress !== undefined && progress < 100;

  const fileIcon = React.useMemo(() => {
    if (file.type.includes('pdf'))
      return <FileArchive className='h-5 w-5 text-red-500' />;
    if (file.type.includes('word') || file.type.includes('doc'))
      return <FileText className='h-5 w-5 text-blue-700' />;
    if (file.type.includes('text') || file.type.includes('code'))
      return <FileCode className='h-5 w-5 text-green-600' />;
    return <FileText className='h-5 w-5 text-slate-500' />;
  }, [file.type]);

  return (
    <div className='bg-muted/20 flex items-center gap-2 rounded-md p-1.5'>
      {/* File icon */}
      <div className='flex h-8 w-8 flex-shrink-0 items-center justify-center rounded border bg-white'>
        {fileIcon}
      </div>

      {/* File info */}
      <div className='min-w-0 flex-1'>
        <div className='xs:flex-row xs:items-center xs:justify-between flex flex-col'>
          <p className='truncate text-xs font-medium'>{file.name}</p>

          {isUploading && (
            <span className='text-xs text-blue-600'>
              {Math.round(progress || 0)}%
            </span>
          )}
        </div>

        <div className='text-muted-foreground mt-0.5 flex items-center gap-1 text-xs'>
          <span>{formatBytes(file.size)}</span>
          {isPdf && <span className='font-medium text-amber-700'>PDF</span>}
        </div>

        {isUploading && <Progress value={progress} className='mt-1 h-1' />}
      </div>

      {/* Actions */}
      <div className='flex items-center gap-1'>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type='button'
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove();
                }}
                disabled={disabled || isUploading}
                className='rounded-sm p-1 text-red-600 hover:bg-red-50'
              >
                {isUploading ? (
                  <Loader2 className='text-muted-foreground h-3.5 w-3.5 animate-spin' />
                ) : (
                  <X className='h-3.5 w-3.5' />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent>Remove</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
