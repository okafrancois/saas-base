// src/components/consular/photo-cropper.tsx
import * as React from 'react'
import { useTranslations } from 'next-intl'
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface PhotoCropperProps {
  imageUrl: string
  aspectRatio?: number
  minWidth?: number
  minHeight?: number
  guidelines?: boolean
  className?: string
  onCropComplete: (croppedImage: string) => void
  onCancel?: () => void
}

export function PhotoCropper({
                               imageUrl,
                               aspectRatio = 1,
                               minWidth = 400,
                               minHeight = 400,
                               guidelines = true,
                               className,
                               onCropComplete,
                               onCancel,
                             }: PhotoCropperProps) {
  const t = useTranslations('consular.photo_cropper')
  const [crop, setCrop] = React.useState<Crop>()
  const [completedCrop, setCompletedCrop] = React.useState<PixelCrop>()
  const imageRef = React.useRef<HTMLImageElement>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  // Guidelines for ID photos
  const Guidelines = () => (
    <div className="absolute inset-0 pointer-events-none">
      {/* Face outline */}
      <div className="absolute left-1/2 top-[30%] h-[45%] w-[60%] -translate-x-1/2 rounded-full border-2 border-dashed border-primary/50" />

      {/* Horizontal lines */}
      <div className="absolute left-0 top-[15%] w-full border border-primary/30" />
      <div className="absolute left-0 top-[85%] w-full border border-primary/30" />

      {/* Vertical lines */}
      <div className="absolute left-[15%] top-0 h-full border border-primary/30" />
      <div className="absolute left-[85%] top-0 h-full border border-primary/30" />
    </div>
  )

  const getCroppedImg = React.useCallback(async () => {
    try {
      const image = imageRef.current
      const crop = completedCrop

      if (!image || !crop) return

      const canvas = document.createElement('canvas')
      const scaleX = image.naturalWidth / image.width
      const scaleY = image.naturalHeight / image.height

      // src/components/consular/photo-cropper.tsx (suite)
      canvas.width = crop.width
      canvas.height = crop.height

      const ctx = canvas.getContext('2d')

      if (!ctx) {
        throw new Error(t('errors.canvas_not_supported'))
      }

      ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width,
        crop.height
      )

      // Convert to base64
      const base64Image = canvas.toDataURL('image/jpeg', 0.9)
      return base64Image
    } catch (error) {
      console.error('Error cropping image:', error)
      throw error
    }
  }, [completedCrop, t])

  const handleComplete = async () => {
    try {
      const croppedImage = await getCroppedImg()
      if (croppedImage) {
        onCropComplete(croppedImage)
      }
    } catch (error) {
      console.error('Error completing crop:', error)
    }
  }

  // Validation des dimensions
  const validateCrop = (crop: PixelCrop) => {
    if (!crop) return false
    return crop.width >= minWidth && crop.height >= minHeight
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Instructions */}
      <div className="rounded-lg bg-muted p-4 text-sm">
        <h3 className="mb-2 font-medium">{t('instructions.title')}</h3>
        <ul className="list-inside list-disc space-y-1 text-muted-foreground">
          <li>{t('instructions.face_centered')}</li>
          <li>{t('instructions.neutral_expression')}</li>
          <li>{t('instructions.no_accessories')}</li>
          <li>{t('instructions.min_dimensions', { width: minWidth, height: minHeight })}</li>
        </ul>
      </div>

      {/* Crop Area */}
      <div className="relative rounded-lg border bg-background">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative aspect-[3/4] w-full"
        >
          <ReactCrop
            crop={crop}
            onChange={(_, percentCrop) => setCrop(percentCrop)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={aspectRatio}
            minWidth={minWidth}
            minHeight={minHeight}
            className="h-full"
          >
            <img
              ref={imageRef}
              src={imageUrl}
              alt={t('photo_to_crop')}
              className="h-full w-full object-contain"
              onLoad={() => {
                setIsLoading(false)
                // Set initial crop to center
                if (!crop && imageRef.current) {
                  const { width, height } = imageRef.current
                  const cropSize = Math.min(width, height)
                  setCrop({
                    unit: '%',
                    x: (width - cropSize) / 2,
                    y: (height - cropSize) / 2,
                    width: cropSize,
                    height: cropSize
                  })
                }
              }}
            />
            {guidelines && <Guidelines />}
          </ReactCrop>

          {/* Loading overlay */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
              <div className="text-sm text-muted-foreground">
                {t('loading')}...
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Dimensions info */}
      {completedCrop && (
        <div className="flex items-center justify-between rounded-lg bg-muted px-4 py-2 text-sm">
          <span>
            {t('dimensions')}: {Math.round(completedCrop.width)} x{' '}
            {Math.round(completedCrop.height)} px
          </span>
          {!validateCrop(completedCrop) && (
            <span className="text-destructive">
              {t('errors.dimensions_too_small')}
            </span>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button variant="outline" onClick={onCancel}>
            {t('cancel')}
          </Button>
        )}
        <Button
          onClick={handleComplete}
          disabled={!completedCrop || !validateCrop(completedCrop)}
        >
          {t('validate')}
        </Button>
      </div>
    </div>
  )
}