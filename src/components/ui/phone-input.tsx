import * as React from 'react'
import { Input } from '@/components/ui/input'

interface PhoneInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  on?: (value: string) => void
}

export const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ ...props }, ref) => {

    return (
      <Input
        autoFocus
        type="tel"
        autoComplete={'tel-area-code'}
        inputMode={'tel'}
        {...props}
        ref={ref}
      />
    )
  },
)

PhoneInput.displayName = 'PhoneInput'