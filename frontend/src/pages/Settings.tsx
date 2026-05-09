import { UserProfile } from '@clerk/clerk-react'

export default function Settings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account and workspace preferences</p>
      </div>
      <UserProfile routing="hash" />
    </div>
  )
}
