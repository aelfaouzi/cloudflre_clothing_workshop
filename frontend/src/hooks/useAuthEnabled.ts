import { useAuth } from '@clerk/clerk-react'

export function useAuthEnabled() {
  const { isLoaded, isSignedIn } = useAuth()
  return isLoaded && !!isSignedIn
}
