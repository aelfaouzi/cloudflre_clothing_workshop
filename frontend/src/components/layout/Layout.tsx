import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import BottomTabBar from './BottomTabBar'

export default function Layout() {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar — visible only on lg+ */}
      <div className="hidden lg:flex lg:shrink-0">
        <Sidebar />
      </div>

      {/* Right side: top bar + scrollable content */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Mobile top bar — hidden on lg+ */}
        <div className="lg:hidden">
          <TopBar />
        </div>

        <main className="flex-1 overflow-y-auto">
          {/* pb-20 on mobile so content clears the bottom tab bar; lg overrides it */}
          <div className="mx-auto max-w-7xl p-4 pb-20 md:p-6 md:pb-20 lg:p-8 lg:pb-8">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile bottom tab bar — hidden on lg+ */}
      <BottomTabBar />
    </div>
  )
}
