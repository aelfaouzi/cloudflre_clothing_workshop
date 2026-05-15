import { Scissors } from 'lucide-react'
import { UserButton } from '@clerk/clerk-react'

export default function TopBar() {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b bg-card px-4">
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
