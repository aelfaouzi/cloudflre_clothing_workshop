import { useTranslation } from 'react-i18next'
import { UserProfile } from '@clerk/clerk-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import LanguageSwitcher from '@/components/LanguageSwitcher'

export default function Settings() {
  const { t } = useTranslation('common')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold md:text-3xl">{t('settings.title')}</h1>
        <p className="text-sm text-muted-foreground">{t('settings.subtitle')}</p>
      </div>

      <Card className="w-full max-w-xs">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">{t('settings.language')}</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <LanguageSwitcher />
        </CardContent>
      </Card>

      <UserProfile routing="hash" />
    </div>
  )
}
