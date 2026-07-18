import { useEffect, useRef } from 'react'
import { useAuth } from '@/auth/AuthProvider'
import { Button } from '@/components/ui/button'

declare global {
  interface Window {
    google?: typeof google
  }
}

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined

export function GoogleSignInButton() {
  const { signIn } = useAuth()
  const buttonRef = useRef<HTMLDivElement>(null)
  const ready = Boolean(clientId && clientId !== 'REPLACE_WITH_GOOGLE_OAUTH_CLIENT_ID')

  useEffect(() => {
    if (!ready || !buttonRef.current) {
      return
    }

    const initialize = () => {
      if (!window.google || !buttonRef.current) {
        return
      }

      window.google.accounts.id.initialize({
        client_id: clientId!,
        callback: async (response) => {
          if (response.credential) {
            await signIn(response.credential)
          }
        },
      })

      window.google.accounts.id.renderButton(buttonRef.current, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        shape: 'rectangular',
        text: 'signin_with',
        width: 320,
      })
    }

    if (window.google?.accounts?.id) {
      initialize()
      return
    }

    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = initialize
    document.body.appendChild(script)

    return () => {
      script.remove()
    }
  }, [ready, signIn])

  if (!ready) {
    return (
      <div className="space-y-3 rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
        <p>Set <code className="rounded bg-muted px-1">VITE_GOOGLE_CLIENT_ID</code> in <code className="rounded bg-muted px-1">apps/web/.env</code>.</p>
        <Button type="button" disabled>
          Google Sign-In unavailable
        </Button>
      </div>
    )
  }

  return <div ref={buttonRef} className="flex min-h-10 justify-center" />
}
