import * as React from "react"
import { cn } from "@/lib/utils"
import { useTranslations } from 'next-intl'
import { Check, AlertCircle } from 'lucide-react'
import { motion } from "framer-motion"
import { fadeIn, scale } from '@/lib/animations'

interface FormStep {
  id: string
  title: string
  description?: string
  status: 'complete' | 'current' | 'upcoming' | 'error'
  errorMessage?: string
}

interface FormStepsAdvancedProps {
  steps: FormStep[]
  currentStep: number
  orientation?: 'horizontal' | 'vertical'
  showNumbers?: boolean
  className?: string
}


export function FormStepsAdvanced({
                                    steps,
                                    currentStep,
                                    orientation = 'horizontal',
                                    showNumbers = true,
                                    className,
                                  }: FormStepsAdvancedProps) {
  const t = useTranslations('common.form.steps')

  const getStepIcon = (step: FormStep, index: number) => {
    if (step.status === 'complete') {
      return <Check className="h-5 w-5" />
    }
    if (step.status === 'error') {
      return <AlertCircle className="h-5 w-5" />
    }
    if (showNumbers) {
      return <span>{index + 1}</span>
    }
    return null
  }

  return (
    <div className={cn("w-full", orientation === 'vertical' ? 'space-y-4' : 'flex justify-between', className)}>
      {steps.map((step, index) => (
        <motion.div
          key={step.id}
          initial="initial"
          animate="animate"
          exit="exit"
          variants={{
            initial: { opacity: 0, y: 20 },
            animate: {
              opacity: 1,
              y: 0,
              transition: { delay: index * 0.1 }
            },
            exit: { opacity: 0, y: 20 }
          }}
          className={cn(
            "relative",
            orientation === 'horizontal' && "flex-1",
            index !== steps.length - 1 && orientation === 'horizontal' && "pr-8"
          )}
        >
          {/* Connecteur avec animation de progression */}
          {index !== steps.length - 1 && (
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{
                scaleX: step.status === 'complete' ? 1 : 0,
                backgroundColor: step.status === 'complete' ? 'var(--primary)' : 'var(--muted)'
              }}
              className={cn(
                "absolute",
                orientation === 'horizontal'
                  ? "left-0 right-8 top-[15px] h-[2px] origin-left"
                  : "left-[15px] top-0 bottom-0 w-[2px]"
              )}
            />
          )}

          {/* Indicateur avec animation */}
          <motion.div
            className="relative flex items-center gap-4"
            variants={scale}
          >
            <motion.div
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2",
                step.status === 'complete' && "border-primary bg-primary text-primary-foreground",
                step.status === 'current' && "border-primary",
                step.status === 'error' && "border-destructive bg-destructive text-destructive-foreground",
                step.status === 'upcoming' && "border-muted bg-muted"
              )}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {getStepIcon(step, index)}
            </motion.div>

            <motion.div
              className="flex min-w-0 flex-col"
              variants={fadeIn}
            >
              <span className="text-sm font-medium">
                {step.title}
              </span>
              {step.description && (
                <span className="text-sm text-muted-foreground">
                  {step.description}
                </span>
              )}
              {step.status === 'error' && step.errorMessage && (
                <motion.span
                  className="text-sm text-destructive"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                >
                  {step.errorMessage}
                </motion.span>
              )}
            </motion.div>
          </motion.div>
        </motion.div>
      ))}
    </div>
  )
}