import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import ConsularForm from '@/components/consular/form'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('profile.creation')

  return {
    title: t('title'),
    description: t('subtitle'),
  }
}

export default async function ConsularRegistrationPage() {
  return (
    <div className="container py-6">
      <ConsularForm />
    </div>
  )
}