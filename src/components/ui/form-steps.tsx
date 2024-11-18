import * as React from "react"
import { cn } from "@/lib/utils"

interface FormStepsProps {
  steps: {
    id: string
    title: string
    description?: string
    isComplete?: boolean
    isCurrent?: boolean
  }[]
  currentStep: number
}

export function FormSteps({ steps, currentStep }: FormStepsProps) {
  return (
    <div className="space-y-4">
      <nav aria-label="Progress">
        <ol role="list" className="space-y-4 md:flex md:space-x-8 md:space-y-0">
          {steps.map((step, index) => (
            <li key={step.id} className="md:flex-1">
              <div
                className={cn(
                  "group flex flex-col border-l-4 py-2 pl-4 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4",
                  step.isComplete
                    ? "border-primary"
                    : index <= currentStep
                      ? "border-primary"
                      : "border-muted",
                )}
              >
                <span className="text-sm font-medium">
                  {index + 1}. {step.title}
                </span>
                {step.description && (
                  <span className="text-sm text-muted-foreground">
                    {step.description}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ol>
      </nav>
    </div>
  )
}