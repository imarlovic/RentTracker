import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { verifyAppJwt } from './auth'
import type { Env, Variables } from './env'
import { apartmentRoutes } from './routes/apartments'
import { authRoutes } from './routes/auth'

const app = new Hono<{ Bindings: Env; Variables: Variables }>()

app.use('/api/*', cors())

app.get('/api/health', (c) =>
  c.json({
    status: 'ok',
    version: '2.0.0',
    platform: 'cloudflare-workers',
  }),
)

app.use('/api/auth/me', async (c, next) => {
  const header = c.req.header('Authorization')
  if (!header?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  try {
    const { userId } = await verifyAppJwt(c.env, header.slice(7))
    c.set('userId', userId)
    await next()
  } catch {
    return c.json({ error: 'Unauthorized' }, 401)
  }
})

app.use('/api/apartments/*', async (c, next) => {
  const header = c.req.header('Authorization')
  if (!header?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  try {
    const { userId } = await verifyAppJwt(c.env, header.slice(7))
    c.set('userId', userId)
    await next()
  } catch {
    return c.json({ error: 'Unauthorized' }, 401)
  }
})

// Also protect exact /api/apartments (list/create)
app.use('/api/apartments', async (c, next) => {
  const header = c.req.header('Authorization')
  if (!header?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  try {
    const { userId } = await verifyAppJwt(c.env, header.slice(7))
    c.set('userId', userId)
    await next()
  } catch {
    return c.json({ error: 'Unauthorized' }, 401)
  }
})

app.route('/api/auth', authRoutes)
app.route('/api/apartments', apartmentRoutes)

app.notFound((c) => {
  if (c.req.path.startsWith('/api/')) {
    return c.json({ error: 'Not found' }, 404)
  }
  return c.text('Not found', 404)
})

export default app
