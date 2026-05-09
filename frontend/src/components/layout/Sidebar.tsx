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
    <aside className="flex h-screen w-60 flex-col border-e bg-card">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2.5 border-b px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Scissors className="h-4 w-4" />
        </div>
        <span className="font-semibold tracking-tight">Workshop</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {navItems.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
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

      {/* Language switcher + User */}
      <div className="border-t p-3 space-y-1">
        <LanguageSwitcher />
        <div className="flex items-center gap-3 px-2 py-1.5">
          <UserButton afterSignOutUrl="/sign-in" />
          <span className="text-sm text-muted-foreground">{t('nav.account')}</span>
        </div>
      </div>
    </aside>
  )
}
