import * as React from 'react'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { ZoomIn, ZoomOut, RotateCw, RotateCcw, Download, Maximize2, Minimize2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Image from 'next/image'

interface DocumentPreviewProps {
  file: File | string // Accepte un fichier ou une URL
  type: 'passport' | 'identity' | 'proof' | 'birth_certificate' | 'residence_permit'
  className?: string
  onRotate?: (degrees: number) => void
  onZoom?: (scale: number) => void
  onDownload?: () => void
}

export function DocumentPreview({
                                  file,
                                  type,
                                  className,
                                  onRotate,
                                  onZoom,
                                  onDownload,
                                }: DocumentPreviewProps) {
  const t = useTranslations('consular.preview')
  const [rotation, setRotation] = React.useState(0)
  const [scale, setScale] = React.useState(1)
  const [isFullscreen, setIsFullscreen] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(true)

  // Gérer les différents types de documents
  const previewUrl = typeof file === 'string' ? file : URL.createObjectURL(file)
  const isPDF = typeof file !== 'string' && file.type === 'application/pdf'

  const handleRotate = (direction: 'left' | 'right') => {
    const newRotation = rotation + (direction === 'right' ? 90 : -90)
    setRotation(newRotation % 360)
    onRotate?.(newRotation)
  }

  const handleZoom = (action: 'in' | 'out') => {
    const newScale = action === 'in' ? scale + 0.1 : Math.max(0.5, scale - 0.1)
    setScale(newScale)
    onZoom?.(newScale)
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
    // Reset zoom and rotation when toggling fullscreen
    setScale(1)
    setRotation(0)
  }

  React.useEffect(() => {
    // Cleanup URL on unmount
    return () => {
      if (typeof file !== 'string') {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [file, previewUrl])

  return (
    <div className={cn(
      "relative rounded-lg border bg-background",
      isFullscreen && "fixed inset-4 z-50",
      className
    )}>
      {/* Toolbar */}
      <div className="absolute right-4 top-4 z-10 flex items-center gap-2 rounded-lg bg-background/80 p-2 backdrop-blur">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => handleZoom('in')}
          disabled={scale >= 2}
          title={t('zoom_in')}
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => handleZoom('out')}
          disabled={scale <= 0.5}
          title={t('zoom_out')}
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => handleRotate('left')}
          title={t('rotate_left')}
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => handleRotate('right')}
          title={t('rotate_right')}
        >
          <RotateCw className="h-4 w-4" />
        </Button>
        {onDownload && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onDownload}
            title={t('download')}
          >
            <Download className="h-4 w-4" />
          </Button>
        )}
        <Button
          size="sm"
          variant="ghost"
          onClick={toggleFullscreen}
          title={isFullscreen ? t('exit_fullscreen') : t('fullscreen')}
        >
          {isFullscreen ? (
            <Minimize2 className="h-4 w-4" />
          ) : (
            <Maximize2 className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Document preview */}
      <motion.div
        animate={{
          rotate: rotation,
          scale: scale
        }}
        className={cn(
          "relative overflow-hidden rounded-lg",
          isFullscreen ? "h-full" : "h-[600px]"
        )}
      >
        {isPDF ? (
          <iframe
            src={`${previewUrl}#toolbar=0`}
            className="h-full w-full"
            title={t('document_preview')}
            onLoad={() => setIsLoading(false)}
          />
        ) : (
          <Image
            src={previewUrl}
            alt={t('document_preview')}
            className={cn(
              "object-contain",
              isLoading && "animate-pulse"
            )}
            fill
            onLoadingComplete={() => setIsLoading(false)}
          />
        )}

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
            <div className="text-sm text-muted-foreground">
              {t('loading')}...
            </div>
          </div>
        )}
      </motion.div>

      {/* Document type indicator */}
      <div className="absolute left-4 top-4 rounded-lg bg-background/80 px-2 py-1 text-xs font-medium backdrop-blur">
        {t(`types.${type}`)}
      </div>
    </div>
  )
}