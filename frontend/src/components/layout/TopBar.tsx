import { Menu, Scissors } from 'lucide-react'
import { UserButton } from '@clerk/clerk-react'
import { useTranslation } from 'react-i18next'

interface Props {
  onMenuClick: () => void
}

export default function TopBar({ onMenuClick }: Props) {
  const { t } = useTranslation('common')
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b bg-card px-3">
      <button
        onClick={onMenuClick}
        aria-label={t('nav.dashboard')}
        className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Scissors className="h-3.5 w-3.5" />
        </div>
        <span className="text-sm font-semibold">Workshop</span>
      </div>

      <UserButton />
    </header>
  )
}
