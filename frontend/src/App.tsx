import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth, SignIn, SignUp } from '@clerk/clerk-react'
import { setAuthTokenGetter } from '@/lib/api'
import Layout from '@/components/layout/Layout'
import Dashboard from '@/pages/Dashboard'
import Jobs from '@/pages/Jobs'
import Fabrics from '@/pages/Fabrics'
import Tailors from '@/pages/Tailors'
import Settings from '@/pages/Settings'

function AuthBridge() {
  const { getToken } = useAuth()

  useEffect(() => {
    setAuthTokenGetter(() => getToken())
  }, [getToken])

  return null
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth()

  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!isSignedIn) {
    return <Navigate to="/sign-in" replace />
  }

  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthBridge />
      <Routes>
        <Route
          path="/sign-in"
          element={
            <div className="flex min-h-screen items-center justify-center bg-muted/30">
              <SignIn routing="hash" signUpUrl="/sign-up" fallbackRedirectUrl="/dashboard" />
            </div>
          }
        />
        <Route
          path="/sign-up"
          element={
            <div className="flex min-h-screen items-center justify-center bg-muted/30">
              <SignUp routing="hash" signInUrl="/sign-in" fallbackRedirectUrl="/dashboard" />
            </div>
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="jobs" element={<Jobs />} />
          <Route path="fabrics" element={<Fabrics />} />
          <Route path="tailors" element={<Tailors />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/sign-in" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
