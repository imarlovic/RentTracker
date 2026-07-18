import { useEffect } from 'react'
import { getPushPublicKey, subscribePush } from '@/lib/api'
import { useAuth } from '@/auth/AuthProvider'

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  const output = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) {
    output[i] = raw.charCodeAt(i)
  }
  return output
}

export function usePushSubscription() {
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    if (!isAuthenticated || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      return
    }

    let cancelled = false

    ;(async () => {
      try {
        const publicKey = await getPushPublicKey()
        if (!publicKey || cancelled) {
          return
        }
        const permission = await Notification.requestPermission()
        if (permission !== 'granted' || cancelled) {
          return
        }
        const registration = await navigator.serviceWorker.ready
        let subscription = await registration.pushManager.getSubscription()
        if (!subscription) {
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(publicKey),
          })
        }
        await subscribePush(subscription.toJSON())
      } catch {
        // Push is optional.
      }
    })()

    return () => {
      cancelled = true
    }
  }, [isAuthenticated])
}
