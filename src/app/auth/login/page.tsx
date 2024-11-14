import { LoadingSuspense } from '@/components/loading-suspense'
import { LoginForm } from '@/components/auth/login-form'

export default function LoginPage() {
  return (
    <LoadingSuspense>
      <LoginForm />
    </LoadingSuspense>
  )
}