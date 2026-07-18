import { Hono } from 'hono'
import { createAppJwt, verifyGoogleIdToken } from '../auth'
import {
  newId,
  nowIso,
  toUserDto,
  type UserRow,
} from '../db'
import type { Env, Variables } from '../env'

export const authRoutes = new Hono<{ Bindings: Env; Variables: Variables }>()

authRoutes.post('/google', async (c) => {
  let body: { idToken?: string } = {}
  try {
    body = await c.req.json<{ idToken?: string }>()
  } catch {
    body = {}
  }
  if (!body.idToken) {
    return c.json({ error: 'idToken is required.' }, 400)
  }

  if (!c.env.GOOGLE_CLIENT_ID || c.env.GOOGLE_CLIENT_ID.startsWith('REPLACE_')) {
    return c.json({ error: 'GOOGLE_CLIENT_ID is not configured.' }, 500)
  }

  let googleUser
  try {
    googleUser = await verifyGoogleIdToken(body.idToken, c.env.GOOGLE_CLIENT_ID)
  } catch {
    return c.json({ error: 'Invalid Google token.' }, 401)
  }

  const existing = await c.env.DB.prepare(
    'SELECT * FROM users WHERE google_subject = ?',
  )
    .bind(googleUser.subject)
    .first<UserRow>()

  const timestamp = nowIso()
  let user: UserRow

  if (!existing) {
    user = {
      id: newId(),
      email: googleUser.email,
      first_name: googleUser.givenName ?? null,
      last_name: googleUser.familyName ?? null,
      picture_url: googleUser.pictureUrl ?? null,
      google_subject: googleUser.subject,
      created_at: timestamp,
      last_login_at: timestamp,
    }

    await c.env.DB.prepare(
      `INSERT INTO users (id, email, first_name, last_name, picture_url, google_subject, created_at, last_login_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind(
        user.id,
        user.email,
        user.first_name,
        user.last_name,
        user.picture_url,
        user.google_subject,
        user.created_at,
        user.last_login_at,
      )
      .run()
  } else {
    user = {
      ...existing,
      email: googleUser.email,
      first_name: googleUser.givenName ?? null,
      last_name: googleUser.familyName ?? null,
      picture_url: googleUser.pictureUrl ?? null,
      last_login_at: timestamp,
    }

    await c.env.DB.prepare(
      `UPDATE users
       SET email = ?, first_name = ?, last_name = ?, picture_url = ?, last_login_at = ?
       WHERE id = ?`,
    )
      .bind(user.email, user.first_name, user.last_name, user.picture_url, user.last_login_at, user.id)
      .run()
  }

  const { token, expiresAt } = await createAppJwt(c.env, {
    id: user.id,
    email: user.email,
    googleSubject: user.google_subject,
    firstName: user.first_name,
    lastName: user.last_name,
  })

  return c.json({
    accessToken: token,
    expiresAt,
    user: toUserDto(user),
  })
})

authRoutes.get('/me', async (c) => {
  const userId = c.get('userId')
  const user = await c.env.DB.prepare('SELECT * FROM users WHERE id = ?')
    .bind(userId)
    .first<UserRow>()

  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  return c.json(toUserDto(user))
})
