import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { DashboardSection } from "@/types/dashboard"
import { Button } from "@/components/ui/button"
import { useTranslations } from "next-intl"

interface SectionCardProps {
  section: DashboardSection
  onAction?: (actionId: string) => void
}

export function SectionCard({ section, onAction }: SectionCardProps) {
  const t = useTranslations('dashboard')

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t(`sections.${section.id}.title`)}</CardTitle>
        <CardDescription>{t(`sections.${section.id}.description`)}</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Contenu spécifique à chaque section */}
        <SectionContent section={section} />

        {/* Actions disponibles */}
        <div className="mt-4 flex flex-wrap gap-2">
          {section.actions.map(action => (
            <Button
              key={action.id}
              variant="outline"
              size="sm"
              onClick={() => onAction?.(action.id)}
            >
              {action.icon && <action.icon className="mr-2 h-4 w-4" />}
              {t(`actions.${action.id}`)}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}