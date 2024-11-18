import * as React from 'react'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { Check, AlertTriangle, X } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'

export interface ExtractedData {
  field: string
  value: string
  confidence: number
  alternatives?: string[]
  required?: boolean
  type?: 'text' | 'date' | 'number' | 'select'
  options?: string[]
  validation?: {
    isValid: boolean
    message?: string
  }
}

interface DataValidationProps {
  data: ExtractedData[]
  onValidate: (validatedData: Record<string, string>) => void
  className?: string
}

export function DataValidation({
                                 data,
                                 onValidate,
                                 className
                               }: DataValidationProps) {
  const t = useTranslations('consular.validation')
  const [validatedData, setValidatedData] = React.useState<Record<string, string>>({})
  const [errors, setErrors] = React.useState<Record<string, string>>({})

  const handleChange = (field: string, value: string) => {
    setValidatedData(prev => ({
      ...prev,
      [field]: value
    }))

    // Clear error when field is modified
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleValidate = () => {
    const newErrors: Record<string, string> = {}

    // Validate required fields
    data.forEach(item => {
      if (item.required && !validatedData[item.field]) {
        newErrors[item.field] = t('errors.required')
      }
    })

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onValidate(validatedData)
  }

  const getConfidenceBadge = (confidence: number) => {
    let variant: 'default' | 'success' | 'warning' | 'destructive' = 'default'
    if (confidence >= 0.9) variant = 'success'
    else if (confidence >= 0.7) variant = 'warning'
    else variant = 'destructive'

    return (
      <Badge variant={variant}>
        {Math.round(confidence * 100)}% {t('confidence')}
      </Badge>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      <div className="space-y-4">
        {data.map((item) => (
          <motion.div
            key={item.field}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between">
              <Label htmlFor={item.field}>
                {t(`fields.${item.field}`)}
                {item.required && <span className="text-destructive">*</span>}
              </Label>
              {getConfidenceBadge(item.confidence)}
            </div>

            {item.type === 'select' ? (
              <Select
                value={validatedData[item.field] || item.value}
                onValueChange={(value) => handleChange(item.field, value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {item.options?.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                id={item.field}
                type={item.type}
                value={validatedData[item.field] || item.value}
                onChange={(e) => handleChange(item.field, e.target.value)}
                className={cn(
                  errors[item.field] && "border-destructive",
                  item.validation?.isValid === false && "border-warning"
                )}
              />
            )}

            {/* Alternatives si disponibles */}
            {item.alternatives && item.alternatives.length > 0 && (
              <div className="flex gap-2">
                <span className="text-xs text-muted-foreground">
                  {t('alternatives')}:
                </span>
                {item.alternatives.map((alt) => (
                  <Button
                    key={alt}
                    variant="ghost"
                    size="sm"
                    className="h-auto py-0 text-xs"
                    onClick={() => handleChange(item.field, alt)}
                  >
                    {alt}
                  </Button>
                ))}
              </div>
            )}

            {/* Messages d'erreur ou de validation */}
            {(errors[item.field] || item.validation?.message) && (
              <div className="flex items-center gap-2 text-sm">
                {errors[item.field] ? (
                  <X className="h-4 w-4 text-destructive" />
                ) : item.validation?.isValid ? (
                  <Check className="h-4 w-4 text-success" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-warning" />
                )}
                <span className={cn(
                  errors[item.field] && "text-destructive",
                  !item.validation?.isValid && "text-warning"
                )}>
                  {errors[item.field] || item.validation?.message}
                </span>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <div className="flex justify-end">
        <Button onClick={handleValidate}>
          {t('validate')}
        </Button>
      </div>
    </div>
  )
}