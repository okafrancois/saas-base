'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Pencil, X, Save } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'

interface EditableSectionProps {
  title: string
  children: React.ReactNode
  onSave?: () => Promise<void>
  isEditing: boolean
  onEdit: () => void
  onCancel: () => void
  className?: string
  isLoading?: boolean
}

export function EditableSection({
                                  title,
                                  children,
                                  onSave,
                                  isEditing,
                                  onEdit,
                                  onCancel,
                                  className,
                                  isLoading = false
                                }: EditableSectionProps) {
  const t = useTranslations('profile')

  return (
    <Card className={cn("relative", className)}>
      <CardHeader className="flex-row items-center justify-between space-y-0 mb-2 pb-2">
        <CardTitle className="text-base font-semibold md:text-lg">
          {title}
        </CardTitle>
        {!isEditing ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            className="h-8 px-2"
          >
            <Pencil className="h-4 w-4" />
            <span className="ml-2 hidden md:inline">
              {t('actions.edit')}
            </span>
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="h-8 px-2"
              disabled={isLoading}
            >
              <X className="h-4 w-4" />
              <span className="ml-2 hidden md:inline">
                {t('actions.cancel')}
              </span>
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={onSave}
              className="h-8 px-2"
              disabled={isLoading}
            >
              <Save className="h-4 w-4" />
              <span className="ml-2 hidden md:inline">
                {t('actions.save')}
              </span>
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  )
}