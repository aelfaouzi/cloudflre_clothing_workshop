import { useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { UserButton } from '@clerk/clerk-react'
import { X, LayoutDashboard, Briefcase, Layers, Users, Settings, Scissors } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import LanguageSwitcher from '@/components/LanguageSwitcher'

interface Props {
  open: boolean
  onClose: () => void
}

export default function MobileDrawer({ open, onClose }: Props) {
  const { t } = useTranslation('common')

  const navItems = [
    { to: '/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { to: '/jobs', label: t('nav.jobs'), icon: Briefcase },
    { to: '/fabrics', label: t('nav.fabrics'), icon: Layers },
    { to: '/tailors', label: t('nav.tailors'), icon: Users },
    { to: '/settings', label: t('nav.settings'), icon: Settings },
  ]

  // Lock body scroll while drawer is open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  // Close on Escape key
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className={cn(
          'fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        )}
      />

      {/* Drawer panel — slides from inline-start (left in LTR, right in RTL) */}
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          'fixed inset-y-0 start-0 z-50 flex w-72 flex-col bg-card shadow-2xl',
          'transition-transform duration-300 ease-in-out lg:hidden',
          open ? 'translate-x-0 rtl:translate-x-0' : 'ltr:-translate-x-full rtl:translate-x-full',
        )}
      >
        {/* Header */}
        <div className="flex h-14 items-center justify-between border-b px-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Scissors className="h-4 w-4" />
            </div>
            <span className="font-semibold tracking-tight">Workshop</span>
          </div>
          <button
            onClick={onClose}
            aria-label={t('common.close')}
            className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3" aria-label="Main navigation">
          <ul className="space-y-0.5 px-3">
            {navItems.map(({ to, label, icon: Icon }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    cn(
                      'flex min-h-[44px] items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                    )
                  }
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="space-y-1 border-t p-3">
          <LanguageSwitcher />
          <div className="flex min-h-[44px] items-center gap-3 rounded-lg px-3 py-2">
            <UserButton />
            <span className="text-sm text-muted-foreground">{t('nav.account')}</span>
          </div>
        </div>
      </div>
    </>
  )
}
