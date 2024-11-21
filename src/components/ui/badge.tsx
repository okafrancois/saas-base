import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground',
        destructive:
          'border-transparent bg-red-100 text-red-500',
        outline: "text-foreground",
        warning:
          'border-transparent bg-orange-100 text-orange-500',
        pending: 'bg-blue-100 text-blue-500',
        approved: 'bg-green-100 text-green-500',
        rejected: 'bg-red-100 text-red-500',
        in_progress: 'bg-blue-100 text-blue-500',
        incomplete: 'bg-yellow-100 text-yellow-500',
        success: 'bg-green-100 text-green-500',
        info: 'bg-blue-100 text-blue-500',
        valid: 'bg-green-100 text-green-500',
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }