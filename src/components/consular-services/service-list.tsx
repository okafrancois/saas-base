'use client'

import { useTranslations } from 'next-intl'
import { ConsularService } from '@prisma/client'
import { ServiceCard } from './service-card'
import { EmptyState } from '@/components/ui/empty-state'
import { FileText } from 'lucide-react'

interface ServiceListProps {
  services: ConsularService[]
  onStartService: (id: string) => void
  disabledServices?: string[]
}

export function ServiceList({
                              services,
                              onStartService,
                              disabledServices = []
                            }: ServiceListProps) {
  const t = useTranslations('consular.services')

  if (services.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title={t('empty.title')}
        description={t('empty.description')}
      />
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {services.map((service) => (
        <ServiceCard
          key={service.id}
          service={service}
          onStart={onStartService}
          disabled={disabledServices.includes(service.id)}
        />
      ))}
    </div>
  )
}