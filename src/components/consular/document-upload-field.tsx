import * as React from "react"
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from "framer-motion"
import { Upload, X, FileText, AlertCircle, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"

interface DocumentUploadFieldProps {
  id: string
  label: string
  accept?: string
  maxSize?: number // en MB
  required?: boolean
  value?: File | null
  onChange: (file: File | null) => void
  status?: 'idle' | 'uploading' | 'success' | 'error'
  progress?: number
  error?: string
  helpText?: string
  className?: string
}

export function DocumentUploadField({
                                      id,
                                      label,
                                      accept = "application/pdf,image/jpeg,image/png",
                                      maxSize = 5, // 5MB par défaut
                                      required = false,
                                      value,
                                      onChange,
                                      status = 'idle',
                                      progress = 0,
                                      error,
                                      helpText,
                                      className,
                                    }: DocumentUploadFieldProps) {
  const t = useTranslations('consular.documents')
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = React.useState(false)

  const handleDrag = React.useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = React.useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const file = e.dataTransfer.files?.[0]
    if (file) {
      validateAndUpload(file)
    }
  }, [])

  const validateAndUpload = (file: File) => {
    // Vérification du type de fichier
    if (!accept.split(',').some(type => file.type.match(type))) {
      onChange(null)
      return
    }

    // Vérification de la taille
    if (file.size > maxSize * 1024 * 1024) {
      onChange(null)
      return
    }

    onChange(file)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      validateAndUpload(file)
    }
  }

  const handleRemove = () => {
    onChange(null)
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-sm font-medium">
          {label}
          {required && <span className="text-destructive">*</span>}
        </label>
        {helpText && (
          <span className="text-xs text-muted-foreground">{helpText}</span>
        )}
      </div>

      <div
        className={cn(
          "relative rounded-lg border-2 border-dashed p-4",
          dragActive ? "border-primary bg-primary/5" : "border-muted",
          status === 'error' && "border-destructive bg-destructive/5"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <Input
          ref={inputRef}
          id={id}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="hidden"
        />

        <AnimatePresence mode="wait">
          {!value ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-2 py-4"
            >
              <Upload className="h-8 w-8 text-muted-foreground" />
              <div className="text-center">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => inputRef.current?.click()}
                >
                  {t('upload.click_to_upload')}
                </Button>
                <span className="text-sm text-muted-foreground">
                  {t('upload.or_drag_and_drop')}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {t('upload.file_requirements', { maxSize })}
              </p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-4"
            >
              <div className="flex items-center gap-2">
                <FileText className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm font-medium">{value.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(value.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="ml-auto"
                onClick={handleRemove}
              >
                <X className="h-4 w-4" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {status === 'uploading' && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50">
            <div className="w-full max-w-[80%] space-y-2 p-4">
              <Progress value={progress} />
              <p className="text-center text-sm">
                {t('upload.uploading')} {progress}%
              </p>
            </div>
          </div>
        )}
      </div>

      {status === 'error' && error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-sm text-destructive"
        >
          <AlertCircle className="h-4 w-4" />
          {error}
        </motion.div>
      )}

      {status === 'success' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-sm text-success"
        >
          <CheckCircle className="h-4 w-4" />
          {t('upload.success')}
        </motion.div>
      )}
    </div>
  )
}