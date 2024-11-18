import { cn } from "@/lib/utils"
import { Check, Circle } from "lucide-react"
import { useTranslations } from "next-intl"

interface StepsProgressProps {
  steps: Array<{
    id: string
    title: string
    status: 'complete' | 'in_progress' | 'pending'
  }>
  currentStep: number
  totalSteps: number
}

export function StepsProgress({ steps, currentStep, totalSteps }: StepsProgressProps) {
  const t = useTranslations('consular_registration')

  return (
    <div className="w-full space-y-4">
      {/* Progress header */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {t('steps.progress', { current: currentStep, total: totalSteps })}
        </span>
      </div>

      {/* Progress bar */}
      <div className="relative">
        <div className="absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2 bg-muted">
          <div
            className="h-full bg-primary transition-all duration-500 ease-in-out"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>

        {/* Steps */}
        <div className="relative z-10 flex justify-between">
          {steps.map((step) => (
            <div
              key={step.id}
              className="flex flex-col items-center gap-2"
            >
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors duration-200",
                  step.status === 'complete' && "border-primary bg-primary text-primary-foreground",
                  step.status === 'in_progress' && "border-primary bg-background text-primary",
                  step.status === 'pending' && "border-muted bg-background text-muted-foreground"
                )}
              >
                {step.status === 'complete' ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Circle className="h-4 w-4" />
                )}
              </div>
              <span
                className={cn(
                  "text-xs font-medium",
                  step.status === 'complete' && "text-primary",
                  step.status === 'in_progress' && "text-primary",
                  step.status === 'pending' && "text-muted-foreground"
                )}
              >
                {step.title}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}