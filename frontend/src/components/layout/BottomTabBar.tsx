import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Briefcase, Layers, Users, Settings } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

const TABS = [
  { to: '/dashboard', icon: LayoutDashboard, labelKey: 'nav.dashboard' },
  { to: '/fabrics',   icon: Layers,          labelKey: 'nav.fabrics'   },
  { to: '/jobs',      icon: Briefcase,       labelKey: 'nav.jobs'      },
  { to: '/tailors',   icon: Users,           labelKey: 'nav.tailors'   },
  { to: '/settings',  icon: Settings,        labelKey: 'nav.settings'  },
]

export default function BottomTabBar() {
  const { t } = useTranslation('common')

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 flex h-16 border-t bg-card lg:hidden"
      aria-label="Bottom navigation"
    >
      {TABS.map(({ to, icon: Icon, labelKey }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            cn(
              'flex flex-1 flex-col items-center justify-center gap-0.5 transition-colors',
              isActive ? 'text-primary' : 'text-muted-foreground',
            )
          }
        >
          {({ isActive }) => (
            <>
              <Icon className={cn('h-5 w-5', isActive && 'text-primary')} strokeWidth={isActive ? 2.5 : 1.75} />
              <span className="text-[10px] font-medium">{t(labelKey)}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
