import { useState, useCallback } from 'react'

interface UseDocumentUploadOptions {
  maxSize?: number
  acceptedTypes?: string[]
  onSuccess?: (file: File) => void
  onError?: (error: string) => void
}

export function useDocumentUpload({
                                    maxSize = 5, // 5MB
                                    acceptedTypes = ['application/pdf', 'image/jpeg', 'image/png'],
                                    onSuccess,
                                    onError,
                                  }: UseDocumentUploadOptions = {}) {
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const validateFile = useCallback((file: File) => {
    if (!acceptedTypes.includes(file.type)) {
      throw new Error('Type de fichier non supporté')
    }

    if (file.size > maxSize * 1024 * 1024) {
      throw new Error(`La taille du fichier ne doit pas dépasser ${maxSize}MB`)
    }

    return true
  }, [acceptedTypes, maxSize])

  const uploadFile = useCallback(async (file: File) => {
    try {
      validateFile(file)

      setStatus('uploading')
      setFile(file)

      // Simuler un upload progressif
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 200))
        setProgress(i)
      }

      setStatus('success')
      onSuccess?.(file)
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
      onError?.(err instanceof Error ? err.message : 'Une erreur est survenue')
    }
  }, [validateFile, onSuccess, onError])

  const reset = useCallback(() => {
    setFile(null)
    setStatus('idle')
    setProgress(0)
    setError(null)
  }, [])

  return {
    file,
    status,
    progress,
    error,
    uploadFile,
    reset,
  }
}