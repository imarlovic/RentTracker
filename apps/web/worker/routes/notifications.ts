import { Hono } from 'hono'
import { newId, nowIso } from '../db'
import type { Env, Variables } from '../env'

export const notificationRoutes = new Hono<{ Bindings: Env; Variables: Variables }>()

notificationRoutes.get('/public-key', (c) => {
  if (!c.env.VAPID_PUBLIC_KEY) {
    return c.json({ error: 'Push notifications are not configured.' }, 503)
  }
  return c.json({ publicKey: c.env.VAPID_PUBLIC_KEY })
})

notificationRoutes.post('/subscribe', async (c) => {
  const userId = c.get('userId')
  let body: { endpoint?: string; keys?: { p256dh?: string; auth?: string } } = {}
  try {
    body = await c.req.json()
  } catch {
    body = {}
  }

  if (!body.endpoint || !body.keys?.p256dh || !body.keys?.auth) {
    return c.json({ error: 'Invalid subscription.' }, 400)
  }

  const existing = await c.env.DB.prepare(
    'SELECT id FROM push_notification_subscriptions WHERE endpoint = ?',
  )
    .bind(body.endpoint)
    .first<{ id: string }>()

  if (existing) {
    await c.env.DB.prepare(
      `UPDATE push_notification_subscriptions
       SET user_id = ?, p256dh = ?, auth = ? WHERE id = ?`,
    )
      .bind(userId, body.keys.p256dh, body.keys.auth, existing.id)
      .run()
  } else {
    await c.env.DB.prepare(
      `INSERT INTO push_notification_subscriptions (id, user_id, endpoint, p256dh, auth, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
      .bind(newId(), userId, body.endpoint, body.keys.p256dh, body.keys.auth, nowIso())
      .run()
  }

  return c.json({ ok: true })
})

notificationRoutes.delete('/unsubscribe', async (c) => {
  let body: { endpoint?: string } = {}
  try {
    body = await c.req.json()
  } catch {
    body = {}
  }
  if (!body.endpoint) {
    return c.json({ error: 'endpoint required' }, 400)
  }

  await c.env.DB.prepare(
    'DELETE FROM push_notification_subscriptions WHERE endpoint = ? AND user_id = ?',
  )
    .bind(body.endpoint, c.get('userId'))
    .run()

  return c.body(null, 204)
})
