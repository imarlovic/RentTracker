import { Hono } from 'hono'
import { cors } from 'hono/cors'
import type { MiddlewareHandler } from 'hono'
import { verifyAppJwt } from './auth'
import type { Env, Variables } from './env'
import { apartmentRoutes } from './routes/apartments'
import { authRoutes } from './routes/auth'
import { notificationRoutes } from './routes/notifications'
import { syncAllLinkedCalendars } from './sync'

type AppEnv = { Bindings: Env; Variables: Variables }

const app = new Hono<AppEnv>()

app.use('/api/*', cors())

app.get('/api/health', (c) =>
  c.json({
    status: 'ok',
    version: '2.0.0',
    platform: 'cloudflare-workers',
  }),
)

const withAuth: MiddlewareHandler<AppEnv> = async (c, next) => {
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
}

app.use('/api/auth/me', withAuth)
app.use('/api/apartments', withAuth)
app.use('/api/apartments/*', withAuth)

app.use('/api/notifications/*', async (c, next) => {
  if (c.req.path.endsWith('/public-key')) {
    await next()
    return
  }
  return withAuth(c, next)
})

app.route('/api/auth', authRoutes)
app.route('/api/apartments', apartmentRoutes)
app.route('/api/notifications', notificationRoutes)

app.notFound((c) => {
  if (c.req.path.startsWith('/api/')) {
    return c.json({ error: 'Not found' }, 404)
  }
  return c.text('Not found', 404)
})

const worker = {
  fetch: app.fetch,
  async scheduled(_controller: ScheduledController, env: Env, _ctx: ExecutionContext) {
    const result = await syncAllLinkedCalendars(env.DB)
    console.log(
      `Scheduled iCal sync: ${result.succeeded}/${result.calendars} ok, ${result.failed} failed`,
    )
  },
}

export default worker
