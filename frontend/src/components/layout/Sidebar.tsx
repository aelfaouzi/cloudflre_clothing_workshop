import { NavLink } from 'react-router-dom'
import { UserButton } from '@clerk/clerk-react'
import { LayoutDashboard, Briefcase, Layers, Users, Settings, Scissors } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import LanguageSwitcher from '@/components/LanguageSwitcher'

export default function Sidebar() {
  const { t } = useTranslation('common')

  const navItems = [
    { to: '/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { to: '/jobs', label: t('nav.jobs'), icon: Briefcase },
    { to: '/fabrics', label: t('nav.fabrics'), icon: Layers },
    { to: '/tailors', label: t('nav.tailors'), icon: Users },
    { to: '/settings', label: t('nav.settings'), icon: Settings },
  ]

  return (
    <aside className="flex h-screen w-60 flex-col border-e bg-card scrollbar-thin">
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center gap-2.5 border-b px-5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Scissors className="h-4 w-4" />
        </div>
        <span className="font-semibold tracking-tight">Workshop</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 scrollbar-thin" aria-label="Main navigation">
        <ul className="space-y-0.5 px-3">
          {navItems.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  cn(
                    'flex min-h-[40px] items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Language + User */}
      <div className="shrink-0 space-y-0.5 border-t p-3">
        <LanguageSwitcher />
        <div className="flex min-h-[40px] items-center gap-3 rounded-lg px-3 py-2">
          <UserButton />
          <span className="text-sm text-muted-foreground">{t('nav.account')}</span>
        </div>
      </div>
    </aside>
  )
}
