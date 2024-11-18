import * as React from "react"
import { useTranslations } from 'next-intl'
import { motion } from "framer-motion"
import { Check, X, AlertTriangle, Search } from "lucide-react"
import { cn } from "@/lib/utils"

interface ValidationRule {
  id: string
  label: string
  status: 'pending' | 'valid' | 'invalid' | 'warning'
  message?: string
}

interface DocumentVerificationProps {
  rules: ValidationRule[]
  className?: string
}

export function DocumentVerification({
                                       rules,
                                       className,
                                     }: DocumentVerificationProps) {
  const t = useTranslations('consular.verification')

  const statusIcons = {
    pending: Search,
    valid: Check,
    invalid: X,
    warning: AlertTriangle,
  }

  const statusStyles = {
    pending: "text-muted-foreground",
    valid: "text-success",
    invalid: "text-destructive",
    warning: "text-warning",
  }

  return (
    <div className={cn("space-y-4", className)}>
      <h4 className="text-sm font-medium">
        {t('title')}
      </h4>

      <div className="space-y-2">
        {rules.map((rule) => {
          const Icon = statusIcons[rule.status]

          return (
            <motion.div
              key={rule.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={cn(
                "flex items-start gap-2 rounded-lg border p-2",
                statusStyles[rule.status]
              )}
            >
              <Icon className="mt-0.5 h-4 w-4 shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-medium">{rule.label}</p>
                {rule.message && (
                  <p className="text-xs">{rule.message}</p>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}