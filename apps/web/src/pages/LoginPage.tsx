import { Navigate } from 'react-router-dom'
import { useAuth } from '@/auth/AuthProvider'
import { GoogleSignInButton } from '@/components/GoogleSignInButton'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function LoginPage() {
  const { isAuthenticated } = useAuth()

  if (isAuthenticated) {
    return <Navigate to="/apartments" replace />
  }

  return (
    <div className="flex min-h-svh items-center justify-center px-4">
      <Card className="w-full max-w-md border-0 bg-card/90 shadow-xl backdrop-blur">
        <CardHeader className="space-y-3 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">RentTracker</p>
          <CardTitle className="text-3xl">Sign in to continue</CardTitle>
          <CardDescription>
            Google authentication only. Signed-in sessions use an app JWT issued by the Cloudflare Worker API.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <GoogleSignInButton />
        </CardContent>
      </Card>
    </div>
  )
}
