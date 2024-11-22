import { RegistrationForm } from '@/components/registration/form'

export default async function RegistrationPage() {
  return (
    <main className={'min-h-screen w-screen overflow-auto overflow-x-hidden bg-muted py-6 pt-14'}>
      <div className="container flex flex-col py-6">
        <RegistrationForm />
      </div>
    </main>
  )
}