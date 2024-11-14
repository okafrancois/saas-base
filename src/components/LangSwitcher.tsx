import LanguageSwitcherSelect from '@/components/ui/LanguageSwitcher'
import { useLocale, useTranslations } from 'next-intl'

export default function LangSwitcher() {
  const t = useTranslations('common.lang_switcher')
  const locale = useLocale()

  return (
    <LanguageSwitcherSelect
      defaultValue={locale}
      languages={[
        {
          value: 'fr',
          label: t('fr'),
        },
        {
          value: 'en',
          label: t('en'),
        },
        {
          value: 'es',
          label: t('es'),
        },
      ]}
      label={t('label')}
    />
  )
}