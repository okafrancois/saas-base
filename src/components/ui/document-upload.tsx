import * as React from "react"
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from "framer-motion"
import { Upload, X, FileText, AlertCircle, CheckCircle, Eye } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

interface DocumentUploadFieldProps {
  id: string
  label: string
  description?: string
  accept?: string
  maxSize?: number // en MB
  required?: boolean
  disabled?: boolean
  defaultValue?: File | null
  onChange?: (file: File | null) => void
  error?: string
  className?: string
}

export function DocumentUploadField({
                                      id,
                                      label,
                                      description,
                                      accept = "application/pdf,image/*",
                                      maxSize = 5,
                                      required = false,
                                      disabled = false,
                                      defaultValue,
                                      onChange,
                                      error,
                                      className,
                                    }: DocumentUploadFieldProps) {
  const t = useTranslations('common.upload')
  const { toast } = useToast()
  const inputRef = React.useRef<HTMLInputElement>(null)

  const [file, setFile] = React.useState<File | null>(defaultValue || null)
  const [preview, setPreview] = React.useState<string | null>(null)
  const [isDragging, setIsDragging] = React.useState(false)
  const [uploadProgress, setUploadProgress] = React.useState(0)
  const [isUploading, setIsUploading] = React.useState(false)

  // Gérer la prévisualisation du fichier
  React.useEffect(() => {
    if (!file) {
      setPreview(null)
      return
    }

    // Créer l'URL de prévisualisation pour les images
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file)
      setPreview(url)
      return () => URL.revokeObjectURL(url)
    }

    // Pour les PDF, on pourrait utiliser une icône ou une prévisualisation PDF
    if (file.type === 'application/pdf') {
      setPreview('/icons/pdf-preview.svg')
    }
  }, [file])

  // Simuler un upload progressif (à remplacer par votre logique d'upload réelle)
  const simulateUpload = async (file: File) => {
    setIsUploading(true)
    setUploadProgress(0)

    for (let progress = 0; progress <= 100; progress += 10) {
      await new Promise(resolve => setTimeout(resolve, 100))
      setUploadProgress(progress)
    }

    setIsUploading(false)
    return true
  }

  const validateFile = (file: File): boolean => {
    // Vérifier le type de fichier
    const acceptedTypes = accept.split(',')
    const isValidType = acceptedTypes.some(type => {
      if (type.includes('/*')) {
        const mainType = type.split('/')[0]
        return file.type.startsWith(`${mainType}/`)
      }
      return file.type === type
    })

    if (!isValidType) {
      toast({
        title: t('error.invalid_type.title'),
        description: t('error.invalid_type.description'),
        variant: "destructive"
      })
      return false
    }

    // Vérifier la taille
    if (file.size > maxSize * 1024 * 1024) {
      toast({
        title: t('error.file_too_large.title'),
        description: t('error.file_too_large.description', { size: maxSize }),
        variant: "destructive"
      })
      return false
    }

    return true
  }

  const handleFile = async (file: File) => {
    if (!validateFile(file)) return

    try {
      await simulateUpload(file)
      setFile(file)
      onChange?.(file)

      toast({
        title: t('success.title'),
        description: t('success.description'),
        variant: "success"
      })
    } catch (error) {
      toast({
        title: t('error.upload_failed.title'),
        description: t('error.upload_failed.description'),
        variant: "destructive"
      })
    }
  }

  const handleDrop = React.useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragging(false)

      if (disabled) return

      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile) {
        handleFile(droppedFile)
      }
    },
    [disabled]
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      handleFile(selectedFile)
    }
  }

  const removeFile = () => {
    setFile(null)
    onChange?.(null)
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      {/* Label et description */}
      <div className="flex flex-col space-y-1">
        <label
          htmlFor={id}
          className={cn(
            "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
            required && "after:text-destructive after:content-['*']"
          )}
        >
          {label}
        </label>
        {description && (
          <p className="text-xs text-muted-foreground">
            {description}
          </p>
        )}
      </div>

      {/* Zone de drop */}
      <div
        onDragOver={(e) => {
          e.preventDefault()
          if (!disabled) setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "relative rounded-lg border-2 border-dashed border-muted-foreground/25 transition-colors",
          isDragging && "border-primary bg-primary/5",
          disabled && "cursor-not-allowed opacity-60",
          error && "border-destructive"
        )}
      >
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept={accept}
          onChange={handleChange}
          disabled={disabled}
          className="hidden"
        />

        <AnimatePresence mode="wait">
          {!file ? (
            // État vide
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center p-6 text-center"
            >
              <Upload className="mb-4 h-8 w-8 text-muted-foreground" />
              <Button
                type="button"
                variant="ghost"
                disabled={disabled}
                onClick={() => inputRef.current?.click()}
              >
                {t('drop_zone.button')}
              </Button>
              <p className="mt-2 text-sm text-muted-foreground">
                {t('drop_zone.description', { size: maxSize })}
              </p>
            </motion.div>
          ) : (
            // Fichier sélectionné
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative p-4"
            >
              <div className="flex items-center gap-4">
                {/* Prévisualisation */}
                {preview && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" className="p-0">
                        {file.type.startsWith('image/') ? (
                          <div className="relative h-16 w-16 overflow-hidden rounded">
                            <Image
                              src={preview}
                              alt={file.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <FileText className="h-16 w-16 text-primary" />
                        )}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl">
                      {file.type.startsWith('image/') ? (
                        <div className="relative aspect-square w-full overflow-hidden rounded-lg">
                          <Image
                            src={preview}
                            alt={file.name}
                            fill
                            className="object-contain"
                          />
                        </div>
                      ) : (
                        <iframe
                          src={preview}
                          className="h-[80vh] w-full"
                          title={file.name}
                        />
                      )}
                    </DialogContent>
                  </Dialog>
                )}

                {/* Informations du fichier */}
                <div className="flex-1">
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => inputRef.current?.click()}
                    disabled={disabled || isUploading}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={removeFile}
                    disabled={disabled || isUploading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Barre de progression */}
              {isUploading && (
                <div className="mt-4 space-y-2">
                  <Progress value={uploadProgress} className="h-1" />
                  <p className="text-center text-sm text-muted-foreground">
                    {uploadProgress}%
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Message d'erreur */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-sm text-destructive"
        >
          <AlertCircle className="h-4 w-4" />
          {error}
        </motion.div>
      )}
    </div>
  )
}