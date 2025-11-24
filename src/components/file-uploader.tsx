'use client';

import {
  FileText,
  X,
  Upload,
  FileImage,
  FileArchive,
  FileCode,
  AlertCircle,
  Loader2,
  Check,
  Download,
  Eye
} from 'lucide-react';
import Image from 'next/image';
import * as React from 'react';
import Dropzone, {
  type DropzoneProps,
  type FileRejection
} from 'react-dropzone';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useControllableState } from '@/hooks/use-controllable-state';
import { cn, formatBytes } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

interface FileUploaderProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: File[];
  onValueChange?: React.Dispatch<React.SetStateAction<File[]>>;
  onUpload?: (files: File[]) => Promise<void>;
  progresses?: Record<string, number>;
  accept?: DropzoneProps['accept'];
  maxSize?: DropzoneProps['maxSize'];
  maxFiles?: DropzoneProps['maxFiles'];
  multiple?: boolean;
  disabled?: boolean;
  description?: string;
  showPreview?: boolean;
  variant?: 'default' | 'compact';
}

export function FileUploader(props: FileUploaderProps) {
  const {
    value: valueProp,
    onValueChange,
    onUpload,
    progresses,
    accept = { 'image/*': [] },
    maxSize = 1024 * 1024 * 2,
    maxFiles = 1,
    multiple = maxFiles > 1,
    disabled = false,
    description,
    showPreview = true,
    variant = 'default',
    className,
    ...dropzoneProps
  } = props;

  const [files, setFiles] = useControllableState({
    prop: valueProp,
    onChange: onValueChange,
    defaultProp: []
  });

  const [dragActive, setDragActive] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);

  // Amélioration du formatage des types de fichiers acceptés
  const acceptedFileTypes = React.useMemo(() => {
    const typeLabels: Record<string, string> = {
      'application/pdf': 'PDF',
      'application/msword': 'DOC',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
      'image/jpeg': 'JPEG',
      'image/png': 'PNG',
      'image/*': 'Images',
      'text/*': 'Text'
    };

    return Object.keys(accept).map(key => {
      return typeLabels[key] || key.split('/')[1]?.toUpperCase() || key;
    }).join(', ');
  }, [accept]);

  const onDrop = React.useCallback(
    async (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      if (!multiple && acceptedFiles.length > 1) {
        toast.error('Vous ne pouvez télécharger qu\'un seul fichier à la fois');
        return;
      }

      if ((files?.length ?? 0) + acceptedFiles.length > maxFiles) {
        toast.error(`Vous ne pouvez pas télécharger plus de ${maxFiles} fichier(s)`);
        return;
      }

      const newFiles = acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
          id: `${file.name}-${Date.now()}-${Math.random()}`
        })
      );

      const updatedFiles = multiple ?
        (files ? [...files, ...newFiles] : newFiles) :
        newFiles;

      setFiles(updatedFiles);

      // Gestion améliorée des erreurs
      if (rejectedFiles.length > 0) {
        const errorMessages = rejectedFiles.map(({ file, errors }) => {
          const errorTexts = errors.map(e => {
            switch (e.code) {
              case 'file-too-large':
                return `Fichier trop volumineux (max: ${formatBytes(maxSize)})`;
              case 'file-invalid-type':
                return `Format non accepté`;
              case 'too-many-files':
                return `Trop de fichiers (max: ${maxFiles})`;
              default:
                return e.message;
            }
          });
          return `${file.name}: ${errorTexts.join(', ')}`;
        });

        errorMessages.forEach(message => toast.error(message, { duration: 5000 }));
      }

      // Upload automatique si configuré
      if (onUpload && updatedFiles.length > 0) {
        const target = updatedFiles.length > 1 ? `${updatedFiles.length} fichiers` : `le fichier`;
        setUploading(true);

        try {
          await onUpload(updatedFiles);
          toast.success(`${target} téléchargé avec succès`, {
            duration: 3000,
            icon: <Check className="h-4 w-4" />
          });
        } catch (error) {
          toast.error(`Échec du téléchargement de ${target}`, {
            duration: 5000,
            icon: <AlertCircle className="h-4 w-4" />
          });
          console.error('Upload error:', error);
        } finally {
          setUploading(false);
        }
      }
    },
    [files, maxFiles, maxSize, multiple, onUpload, setFiles]
  );

  function onRemove(index: number) {
    if (!files) return;

    const fileToRemove = files[index];
    if (isFileWithPreview(fileToRemove)) {
      URL.revokeObjectURL(fileToRemove.preview);
    }

    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);

    if (!multiple && newFiles.length === 0) {
      toast.info('Fichier supprimé');
    }
  }

  // Nettoyage des URLs d'aperçu
  React.useEffect(() => {
    return () => {
      if (!files) return;
      files.forEach((file) => {
        if (isFileWithPreview(file)) {
          URL.revokeObjectURL(file.preview);
        }
      });
    };
  }, [files]);

  const isMaxed = (files?.length ?? 0) >= maxFiles;
  const isDisabled = disabled || uploading;
  const hasFiles = files && files.length > 0;

  return (
    <div className="relative flex flex-col gap-4 overflow-hidden">
      <Dropzone
        onDrop={onDrop}
        accept={accept}
        maxSize={maxSize}
        maxFiles={maxFiles}
        multiple={multiple}
        disabled={isDisabled}
        onDragEnter={() => setDragActive(true)}
        onDragLeave={() => setDragActive(false)}
        onDropAccepted={() => setDragActive(false)}
        onDropRejected={() => setDragActive(false)}
      >
        {({ getRootProps, getInputProps, isDragActive: libDragActive }) => (
          <div
            {...getRootProps()}
            className={cn(
              'group relative w-full rounded-xl border-2 border-dashed transition-all duration-300 ease-in-out',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
              variant === 'compact' ? 'px-4 py-3' : 'px-6 py-5',
              dragActive || libDragActive
                ? 'border-primary bg-primary/8 shadow-lg shadow-primary/10 scale-[1.02]'
                : 'border-muted-foreground/20 hover:border-muted-foreground/40 hover:bg-muted/20',
              isDisabled && 'opacity-50 cursor-not-allowed pointer-events-none',
              !isDisabled && 'cursor-pointer',
              className
            )}
            {...dropzoneProps}
          >
            <input {...getInputProps()} />

            {/* Zone de dépôt améliorée */}
            {(!isMaxed || multiple) && (
              <div className={cn(
                "flex flex-col items-center justify-center gap-4 text-center",
                variant === 'compact' ? 'py-4' : 'py-8',
                hasFiles && variant !== 'compact' && 'border-b border-dashed border-muted-foreground/20 pb-6 mb-6'
              )}>
                <div className={cn(
                  "rounded-full p-4 transition-all duration-300",
                  dragActive || libDragActive
                    ? "bg-primary/15 text-primary shadow-lg"
                    : "bg-muted/50 text-muted-foreground group-hover:bg-muted group-hover:text-foreground"
                )}>
                  <Upload className={cn(
                    "transition-transform duration-300",
                    variant === 'compact' ? 'size-5' : 'size-7',
                    dragActive || libDragActive && 'scale-110'
                  )} aria-hidden="true" />
                </div>

                <div className="space-y-2 max-w-sm">
                  <div>
                    <p className={cn(
                      "font-semibold",
                      variant === 'compact' ? 'text-sm' : 'text-base'
                    )}>
                      {dragActive || libDragActive ? (
                        "Déposez vos fichiers ici"
                      ) : (
                        multiple ? "Glissez-déposez vos fichiers" : "Glissez-déposez votre fichier"
                      )}
                    </p>
                    <p className={cn(
                      "text-muted-foreground",
                      variant === 'compact' ? 'text-xs' : 'text-sm'
                    )}>
                      ou cliquez pour parcourir
                    </p>
                  </div>

                  {description ? (
                    <p className="text-xs text-muted-foreground/80">{description}</p>
                  ) : (
                    <div className="text-xs text-muted-foreground/80 space-y-1">
                      <p>Formats: <span className="font-medium">{acceptedFileTypes}</span></p>
                      <p>Taille max: <span className="font-medium">{formatBytes(maxSize)}</span></p>
                    </div>
                  )}
                </div>

                {multiple && maxFiles > 1 && (
                  <Badge variant="outline" className="font-normal bg-background/50">
                    <span className="font-medium">{files?.length || 0}</span>
                    <span className="text-muted-foreground">/{maxFiles}</span>
                  </Badge>
                )}
              </div>
            )}

            {/* Liste des fichiers améliorée */}
            {hasFiles && (
              <div
                className="w-full space-y-3"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="grid gap-3">
                  {files.map((file, index) => (
                    <FileCard
                      //@ts-ignore
                      key={file.id || `${file.name}-${index}`}
                      file={file}
                      onRemove={() => onRemove(index)}
                      progress={progresses?.[file.name]}
                      disabled={uploading}
                      showPreview={showPreview}
                      variant={variant}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Dropzone>

      {/* Informations supplémentaires */}
      {hasFiles && multiple && maxFiles > 1 && (
        <div className="flex justify-between items-center text-xs text-muted-foreground bg-muted/30 rounded-lg px-3 py-2">
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-2 h-2 rounded-full",
              isMaxed ? "bg-orange-500" : "bg-green-500"
            )} />
            <span>
              {files.length} fichier{files.length > 1 ? 's' : ''} sélectionné{files.length > 1 ? 's' : ''}
            </span>
          </div>
          <span className="font-medium">
            {maxFiles - files.length} restant{maxFiles - files.length > 1 ? 's' : ''}
          </span>
        </div>
      )}

      {uploading && (
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground bg-blue-50 rounded-lg px-3 py-2">
          <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
          <span>Téléchargement en cours...</span>
        </div>
      )}
    </div>
  );
}

interface FileCardProps {
  file: File;
  onRemove: () => void;
  progress?: number;
  disabled?: boolean;
  showPreview?: boolean;
  variant?: 'default' | 'compact';
}

function FileCard({
                    file,
                    progress,
                    onRemove,
                    disabled,
                    showPreview = true,
                    variant = 'default'
                  }: FileCardProps) {
  const fileSize = formatBytes(file.size);
  const isUploading = progress !== undefined && progress < 100;
  const isComplete = progress === 100;
  const isImage = isImageFile(file);

  const fileIcon = React.useMemo(() => {
    const iconProps = { className: "h-5 w-5" };

    if (file.type.includes('pdf')) return <FileArchive {...iconProps} className="h-5 w-5 text-red-500" />;
    if (file.type.includes('image')) return <FileImage {...iconProps} className="h-5 w-5 text-blue-500" />;
    if (file.type.includes('word') || file.type.includes('doc')) return <FileText {...iconProps} className="h-5 w-5 text-blue-700" />;
    if (file.type.includes('text') || file.type.includes('code')) return <FileCode {...iconProps} className="h-5 w-5 text-green-600" />;
    return <FileText {...iconProps} className="h-5 w-5 text-slate-500" />;
  }, [file.type]);

  const getStatusColor = () => {
    if (isComplete) return 'border-green-200 bg-green-50';
    if (isUploading) return 'border-blue-200 bg-blue-50';
    return 'border-muted bg-background';
  };

  return (
    <div className={cn(
      'flex items-center gap-3 p-3 border rounded-xl transition-all duration-200 hover:shadow-sm',
      getStatusColor(),
      variant === 'compact' && 'p-2'
    )}>
      {/* Aperçu ou icône */}
      <div className="flex-shrink-0">
        {isImage && isFileWithPreview(file) && showPreview ? (
          <div className={cn(
            "relative rounded-lg overflow-hidden border bg-muted/20",
            variant === 'compact' ? 'size-8' : 'size-12'
          )}>
            <Image
              src={file.preview}
              alt={file.name}
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div className={cn(
            "flex items-center justify-center rounded-lg bg-muted/30 border",
            variant === 'compact' ? 'size-8' : 'size-12'
          )}>
            {fileIcon}
          </div>
        )}
      </div>

      {/* Informations du fichier */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className={cn(
            "font-medium truncate",
            variant === 'compact' ? 'text-sm' : 'text-sm'
          )}>
            {file.name}
          </p>

          {/* Statut */}
          {isComplete && (
            <div className="flex items-center gap-1 text-green-600">
              <Check className="h-3 w-3" />
              <span className="text-xs font-medium">Terminé</span>
            </div>
          )}

          {isUploading && (
            <div className="flex items-center gap-1 text-blue-600">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span className="text-xs font-medium">{Math.round(progress)}%</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
          <span>{fileSize}</span>
          {file.type && (
            <>
              <span>•</span>
              <span className="uppercase font-medium">
                {file.type.split('/')[1]}
              </span>
            </>
          )}
        </div>

        {/* Barre de progression */}
        {isUploading && (
          <Progress
            value={progress}
            className="h-1.5 mt-2 bg-muted"
          />
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        {isImage && isFileWithPreview(file) && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => window.open(file.preview, '_blank')}
                  className="h-7 w-7 hover:bg-blue-50 hover:text-blue-600"
                >
                  <Eye className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Aperçu</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onRemove}
                disabled={disabled || isUploading}
                className="h-7 w-7 hover:bg-red-50 hover:text-red-600"
              >
                <span className="sr-only">Supprimer</span>
                {isUploading ? (
                  <Loader2 className="h-3 w-3 text-muted-foreground animate-spin" />
                ) : (
                  <X className="h-3 w-3" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Supprimer</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}

// Fonctions utilitaires
function isFileWithPreview(file: File): file is File & { preview: string } {
  return 'preview' in file && typeof file.preview === 'string';
}

function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}