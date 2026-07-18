import { buildPushPayload, type PushSubscription } from '@block65/webcrypto-web-push'
import type { Env } from './env'

export async function notifyUserNewReservation(
  env: Env,
  userId: string,
  payload: { title: string; body: string; url?: string },
) {
  if (!env.VAPID_PUBLIC_KEY || !env.VAPID_PRIVATE_KEY) {
    return
  }

  const { results } = await env.DB.prepare(
    'SELECT endpoint, p256dh, auth FROM push_notification_subscriptions WHERE user_id = ?',
  )
    .bind(userId)
    .all<{ endpoint: string; p256dh: string; auth: string }>()

  const subject = env.VAPID_SUBJECT || 'mailto:admin@renttracker.local'

  for (const row of results ?? []) {
    const subscription: PushSubscription = {
      endpoint: row.endpoint,
      expirationTime: null,
      keys: {
        p256dh: row.p256dh,
        auth: row.auth,
      },
    }

    try {
      const push = await buildPushPayload(
        {
          data: JSON.stringify(payload),
          options: {
            ttl: 60 * 60,
            urgency: 'normal',
          },
        },
        subscription,
        {
          subject,
          publicKey: env.VAPID_PUBLIC_KEY,
          privateKey: env.VAPID_PRIVATE_KEY,
        },
      )

      const response = await fetch(subscription.endpoint, push)
      if (response.status === 404 || response.status === 410) {
        await env.DB.prepare('DELETE FROM push_notification_subscriptions WHERE endpoint = ?')
          .bind(row.endpoint)
          .run()
      }
    } catch {
      // Best-effort notifications; ignore send failures.
    }
  }
}
