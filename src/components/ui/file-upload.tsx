import React, { useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { TrashIcon, FileIcon, EyeIcon } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog';

type InputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value'>;

interface FileUploadProps extends InputProps {
  label?: string;
  url?: string;
  value?: FileList | null;
  onDelete?: () => void;
  className?: string;
  preview?: boolean;
  error?: boolean;
}

const FileUpload = React.forwardRef<HTMLInputElement, FileUploadProps>(
  ({ label, url, value, onDelete, className, preview = true, error, ...props }) => {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [isPdfPreview, setIsPdfPreview] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    React.useEffect(() => {
      if (value && value.length > 0) {
        const file = value[0]
        if (file.type === 'application/pdf') {
          setIsPdfPreview(true)
          setPreviewUrl(URL.createObjectURL(file))
        } else if (file.type.startsWith('image/')) {
          setIsPdfPreview(false)
          setPreviewUrl(URL.createObjectURL(file))
        }
        return () => {
          if (previewUrl) {
            URL.revokeObjectURL(previewUrl)
          }
        }
      }
    }, [value])

    const handleDelete = (e: React.MouseEvent) => {
      e.stopPropagation()
      if (inputRef.current) {
        inputRef.current.value = ''
      }
      if (onDelete) {
        onDelete()
      }
      setPreviewUrl(null)
    };

    const renderPreview = () => {
      const previewSrc = previewUrl || url
      if (!previewSrc) return null

      return (
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              className="relative aspect-square size-20 overflow-hidden rounded-lg border p-0"
            >
              {isPdfPreview ? (
                <div className="flex size-full items-center justify-center bg-muted">
                  <FileIcon className="size-8 text-muted-foreground" />
                </div>
              ) : (
                <img
                  src={previewSrc}
                  alt="Preview"
                  className="size-full object-cover"
                />
              )}
              <div
                className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity hover:opacity-100">
                <EyeIcon className="size-6 text-white" />
              </div>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            {isPdfPreview ? (
              <iframe
                src={previewSrc}
                className="h-[80vh] w-full"
                title="PDF Preview"
              />
            ) : (
              <img
                src={previewSrc}
                alt="Full Preview"
                className="max-h-[80vh] w-full object-contain"
              />
            )}
          </DialogContent>
        </Dialog>
      )
    };

    return (
      <div className={cn('relative', className)}>
        <div className="flex gap-4">
          {preview && renderPreview()}
          <div className="flex flex-1 flex-col gap-2">
            <Input
              {...props}
              type="file"
              ref={inputRef}
              className={cn(
                'cursor-pointer file:cursor-pointer',
                error && 'border-red-500',
              )}
            />
            {label && (
              <p className="text-sm text-muted-foreground">
                {label}
              </p>
            )}
          </div>
          {(value?.[0] || url) && (
            <Button
              type="button"
              variant="destructive"
              size="icon"
              onClick={handleDelete}
              className="size-10"
            >
              <TrashIcon className="size-4" />
            </Button>
          )}
        </div>
      </div>
    );
  }
);

FileUpload.displayName = 'FileUpload'

export default FileUpload