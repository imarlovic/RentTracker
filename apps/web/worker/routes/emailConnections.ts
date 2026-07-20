import { Hono } from 'hono'
import { newId, nowIso } from '../db'
import { parseAirbnbEmail } from '../email/airbnbParse'
import { parseBookingEmail } from '../email/bookingParse'
import {
  buildGmailAuthUrl,
  createGmailOAuthState,
  exchangeGmailCode,
  gmailRedirectUri,
  integrationsRedirect,
  requireGoogleOAuthConfig,
  sealToken,
  verifyGmailOAuthState,
} from '../email/gmail'
import { detectEmailProvider, isEmailProvider, type EmailProvider } from '../email/providers'
import {
  clearSeenIngestEvents,
  ingestDetectedEmailMessage,
  ingestOtaEmailMessage,
  syncGmailConnection,
  type EmailConnectionRow,
} from '../email/syncGmail'
import type { Env, Variables } from '../env'
import { getOwnedApartment } from '../ownership'

export const emailConnectionRoutes = new Hono<{ Bindings: Env; Variables: Variables }>()

function toConnectionDto(row: EmailConnectionRow) {
  return {
    id: row.id,
    apartmentId: row.apartment_id,
    kind: row.kind,
    provider: row.provider,
    mailboxEmail: row.mailbox_email,
    status: row.status,
    lastSyncedAt: row.last_synced_at,
    lastSyncError: row.last_sync_error,
    createdAt: row.created_at,
  }
}

async function upsertOtaIntegrations(db: D1Database, apartmentId: string): Promise<void> {
  for (const provider of ['Booking', 'Airbnb'] as const) {
    const integration = await db
      .prepare(
        `SELECT id FROM integration_configurations WHERE apartment_id = ? AND provider = ?`,
      )
      .bind(apartmentId, provider)
      .first<{ id: string }>()
    if (integration) {
      await db
        .prepare(
          `UPDATE integration_configurations SET status = 'Active', last_sync_error = NULL WHERE id = ?`,
        )
        .bind(integration.id)
        .run()
    } else {
      await db
        .prepare(
          `INSERT INTO integration_configurations
            (id, apartment_id, provider, status, external_property_id, ical_url, last_synced_at, last_sync_error)
           VALUES (?, ?, ?, 'Active', NULL, NULL, NULL, NULL)`,
        )
        .bind(newId(), apartmentId, provider)
        .run()
    }
  }
}

emailConnectionRoutes.get('/:apartmentId/email-connections', async (c) => {
  const apartment = await getOwnedApartment(c.env.DB, c.req.param('apartmentId'), c.get('userId'))
  if (!apartment) {
    return c.json({ error: 'Not found' }, 404)
  }
  const { results } = await c.env.DB.prepare(
    `SELECT * FROM email_connections WHERE apartment_id = ? ORDER BY created_at DESC`,
  )
    .bind(apartment.id)
    .all<EmailConnectionRow>()
  return c.json((results ?? []).map(toConnectionDto))
})

emailConnectionRoutes.get('/:apartmentId/email-connections/events', async (c) => {
  const apartment = await getOwnedApartment(c.env.DB, c.req.param('apartmentId'), c.get('userId'))
  if (!apartment) {
    return c.json({ error: 'Not found' }, 404)
  }
  const { results } = await c.env.DB.prepare(
    `SELECT id, message_id, from_address, subject, received_at, parse_status, parse_error,
            reservation_id, created_at
     FROM email_ingest_events
     WHERE apartment_id = ?
     ORDER BY created_at DESC
     LIMIT 20`,
  )
    .bind(apartment.id)
    .all<{
      id: string
      message_id: string
      from_address: string | null
      subject: string | null
      received_at: string | null
      parse_status: string
      parse_error: string | null
      reservation_id: string | null
      created_at: string
    }>()

  return c.json(
    (results ?? []).map((row) => ({
      id: row.id,
      messageId: row.message_id,
      fromAddress: row.from_address,
      subject: row.subject,
      receivedAt: row.received_at,
      parseStatus: row.parse_status,
      parseError: row.parse_error,
      reservationId: row.reservation_id,
      createdAt: row.created_at,
    })),
  )
})

emailConnectionRoutes.post('/:apartmentId/email-connections/gmail/start', async (c) => {
  const apartment = await getOwnedApartment(c.env.DB, c.req.param('apartmentId'), c.get('userId'))
  if (!apartment) {
    return c.json({ error: 'Not found' }, 404)
  }

  try {
    const { clientId } = requireGoogleOAuthConfig(c.env)
    const state = await createGmailOAuthState(c.env, {
      userId: c.get('userId'),
      apartmentId: apartment.id,
      nonce: newId(),
    })
    const redirectUri = gmailRedirectUri(c.req.url)
    const authUrl = buildGmailAuthUrl({ clientId, redirectUri, state })
    return c.json({ authUrl, redirectUri })
  } catch (error) {
    return c.json(
      { error: error instanceof Error ? error.message : 'Gmail OAuth is not configured' },
      400,
    )
  }
})

emailConnectionRoutes.post('/:apartmentId/email-connections/gmail/sync', async (c) => {
  const apartment = await getOwnedApartment(c.env.DB, c.req.param('apartmentId'), c.get('userId'))
  if (!apartment) {
    return c.json({ error: 'Not found' }, 404)
  }
  const connection = await c.env.DB.prepare(
    `SELECT * FROM email_connections
     WHERE apartment_id = ? AND kind = 'gmail'
     LIMIT 1`,
  )
    .bind(apartment.id)
    .first<EmailConnectionRow>()
  if (!connection) {
    return c.json({ error: 'No mailbox connected. Connect a Gmail inbox first.' }, 404)
  }

  let body: {
    newerThanDays?: number
    maxMessages?: number
    clearSeen?: boolean
  } = {}
  try {
    body = await c.req.json()
  } catch {
    body = {}
  }

  const newerThanDaysRaw = body.newerThanDays ?? Number(c.req.query('newerThanDays'))
  const maxMessagesRaw = body.maxMessages ?? Number(c.req.query('maxMessages'))
  const clearSeen =
    body.clearSeen === true ||
    c.req.query('clearSeen') === '1' ||
    c.req.query('clearSeen') === 'true'

  try {
    const result = await syncGmailConnection(c.env, connection.id, {
      newerThanDays: Number.isFinite(newerThanDaysRaw) ? newerThanDaysRaw : undefined,
      maxMessages: Number.isFinite(maxMessagesRaw) ? maxMessagesRaw : undefined,
      clearSeen,
    })
    return c.json(result)
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Sync failed' }, 400)
  }
})

emailConnectionRoutes.delete('/:apartmentId/email-connections/seen', async (c) => {
  const apartment = await getOwnedApartment(c.env.DB, c.req.param('apartmentId'), c.get('userId'))
  if (!apartment) {
    return c.json({ error: 'Not found' }, 404)
  }
  const cleared = await clearSeenIngestEvents(c.env.DB, apartment.id)
  return c.json({ cleared })
})

emailConnectionRoutes.delete('/:apartmentId/email-connections/:connectionId', async (c) => {
  const apartment = await getOwnedApartment(c.env.DB, c.req.param('apartmentId'), c.get('userId'))
  if (!apartment) {
    return c.json({ error: 'Not found' }, 404)
  }
  const existing = await c.env.DB.prepare(
    `SELECT id FROM email_connections WHERE id = ? AND apartment_id = ?`,
  )
    .bind(c.req.param('connectionId'), apartment.id)
    .first()
  if (!existing) {
    return c.json({ error: 'Not found' }, 404)
  }
  await c.env.DB.prepare(`DELETE FROM email_connections WHERE id = ?`)
    .bind(c.req.param('connectionId'))
    .run()
  return c.body(null, 204)
})

/** Manual ingest for testing parsers without Gmail OAuth. Auto-detects Booking vs Airbnb. */
emailConnectionRoutes.post('/:apartmentId/email-connections/ingest', async (c) => {
  const apartment = await getOwnedApartment(c.env.DB, c.req.param('apartmentId'), c.get('userId'))
  if (!apartment) {
    return c.json({ error: 'Not found' }, 404)
  }

  let body: {
    subject?: string
    bodyText?: string
    bodyHtml?: string
    fromAddress?: string
    messageId?: string
    provider?: string
  } = {}
  try {
    body = await c.req.json()
  } catch {
    body = {}
  }
  if (!body.subject && !body.bodyText && !body.bodyHtml) {
    return c.json({ error: 'Provide subject and/or bodyText' }, 400)
  }

  const connection = await c.env.DB.prepare(
    `SELECT id FROM email_connections WHERE apartment_id = ? AND kind = 'gmail' LIMIT 1`,
  )
    .bind(apartment.id)
    .first<{ id: string }>()

  const providerHint = isEmailProvider(body.provider ?? '') ? (body.provider as EmailProvider) : null

  const result = await ingestDetectedEmailMessage(c.env, {
    apartmentId: apartment.id,
    connectionId: connection?.id ?? null,
    providerHint,
    userId: c.get('userId'),
    messageId: body.messageId || `manual:${newId()}`,
    fromAddress: body.fromAddress,
    subject: body.subject,
    receivedAt: nowIso(),
    bodyText: body.bodyText,
    bodyHtml: body.bodyHtml,
    notifyOnCreate: true,
  })
  return c.json(result)
})

/** @deprecated Prefer POST .../email-connections/ingest with auto-detect */
emailConnectionRoutes.post('/:apartmentId/email-connections/:provider/ingest', async (c) => {
  const apartment = await getOwnedApartment(c.env.DB, c.req.param('apartmentId'), c.get('userId'))
  if (!apartment) {
    return c.json({ error: 'Not found' }, 404)
  }
  const providerParam = c.req.param('provider')
  const provider: EmailProvider =
    providerParam.toLowerCase() === 'airbnb'
      ? 'Airbnb'
      : providerParam.toLowerCase() === 'booking'
        ? 'Booking'
        : 'Booking'
  if (providerParam.toLowerCase() !== 'airbnb' && providerParam.toLowerCase() !== 'booking') {
    return c.json({ error: 'provider must be booking or airbnb' }, 400)
  }

  let body: {
    subject?: string
    bodyText?: string
    bodyHtml?: string
    fromAddress?: string
    messageId?: string
  } = {}
  try {
    body = await c.req.json()
  } catch {
    body = {}
  }
  if (!body.subject && !body.bodyText && !body.bodyHtml) {
    return c.json({ error: 'Provide subject and/or bodyText' }, 400)
  }

  const connection = await c.env.DB.prepare(
    `SELECT id FROM email_connections WHERE apartment_id = ? AND kind = 'gmail' LIMIT 1`,
  )
    .bind(apartment.id)
    .first<{ id: string }>()

  const result = await ingestOtaEmailMessage(c.env, {
    apartmentId: apartment.id,
    connectionId: connection?.id ?? null,
    provider,
    userId: c.get('userId'),
    messageId: body.messageId || `manual:${newId()}`,
    fromAddress:
      body.fromAddress || (provider === 'Airbnb' ? 'manual@airbnb.com' : 'manual@booking.com'),
    subject: body.subject,
    receivedAt: nowIso(),
    bodyText: body.bodyText,
    bodyHtml: body.bodyHtml,
    notifyOnCreate: true,
  })
  return c.json(result)
})

emailConnectionRoutes.post('/:apartmentId/email-connections/parse-preview', async (c) => {
  const apartment = await getOwnedApartment(c.env.DB, c.req.param('apartmentId'), c.get('userId'))
  if (!apartment) {
    return c.json({ error: 'Not found' }, 404)
  }
  let body: {
    subject?: string
    bodyText?: string
    bodyHtml?: string
    fromAddress?: string
  } = {}
  try {
    body = await c.req.json()
  } catch {
    body = {}
  }
  const provider = detectEmailProvider(body.fromAddress, body.subject, body.bodyText, body.bodyHtml)
  if (!provider) {
    return c.json({ provider: null, error: 'Could not detect Booking or Airbnb' }, 400)
  }
  const parsed =
    provider === 'Airbnb'
      ? parseAirbnbEmail(body)
      : parseBookingEmail(body)
  return c.json({ provider, ...parsed })
})

/** @deprecated Prefer POST .../email-connections/parse-preview */
emailConnectionRoutes.post('/:apartmentId/email-connections/:provider/parse-preview', async (c) => {
  const apartment = await getOwnedApartment(c.env.DB, c.req.param('apartmentId'), c.get('userId'))
  if (!apartment) {
    return c.json({ error: 'Not found' }, 404)
  }
  const providerParam = c.req.param('provider').toLowerCase()
  if (providerParam !== 'airbnb' && providerParam !== 'booking') {
    return c.json({ error: 'provider must be booking or airbnb' }, 400)
  }
  let body: { subject?: string; bodyText?: string; bodyHtml?: string } = {}
  try {
    body = await c.req.json()
  } catch {
    body = {}
  }
  return c.json(providerParam === 'airbnb' ? parseAirbnbEmail(body) : parseBookingEmail(body))
})

/** Public OAuth callback (mounted under /api/auth). */
export const gmailOAuthCallbackRoutes = new Hono<{ Bindings: Env; Variables: Variables }>()

gmailOAuthCallbackRoutes.get('/gmail/callback', async (c) => {
  const url = new URL(c.req.url)
  const err = url.searchParams.get('error')
  const origin = url.origin
  if (err) {
    return c.redirect(integrationsRedirect(origin, { gmail: 'error', reason: err }))
  }

  const code = url.searchParams.get('code')
  const stateToken = url.searchParams.get('state')
  if (!code || !stateToken) {
    return c.redirect(integrationsRedirect(origin, { gmail: 'error', reason: 'missing_code' }))
  }

  try {
    const state = await verifyGmailOAuthState(c.env, stateToken)
    const apartment = await getOwnedApartment(c.env.DB, state.apartmentId, state.userId)
    if (!apartment) {
      return c.redirect(integrationsRedirect(origin, { gmail: 'error', reason: 'apartment' }))
    }

    const redirectUri = gmailRedirectUri(c.req.url)
    const tokens = await exchangeGmailCode(c.env, code, redirectUri)
    if (!tokens.refreshToken) {
      const existing = await c.env.DB.prepare(
        `SELECT gmail_refresh_token_enc FROM email_connections
         WHERE apartment_id = ? AND kind = 'gmail'`,
      )
        .bind(apartment.id)
        .first<{ gmail_refresh_token_enc: string | null }>()
      if (!existing?.gmail_refresh_token_enc) {
        return c.redirect(
          integrationsRedirect(origin, { gmail: 'error', reason: 'missing_refresh_token' }),
        )
      }
    }

    const refreshEnc = tokens.refreshToken
      ? await sealToken(c.env, tokens.refreshToken)
      : (
          await c.env.DB.prepare(
            `SELECT gmail_refresh_token_enc FROM email_connections
             WHERE apartment_id = ? AND kind = 'gmail'`,
          )
            .bind(apartment.id)
            .first<{ gmail_refresh_token_enc: string }>()
        )?.gmail_refresh_token_enc

    if (!refreshEnc) {
      return c.redirect(
        integrationsRedirect(origin, { gmail: 'error', reason: 'missing_refresh_token' }),
      )
    }

    const accessEnc = await sealToken(c.env, tokens.accessToken)
    const expiresAt = new Date(Date.now() + tokens.expiresIn * 1000).toISOString()
    const existingConn = await c.env.DB.prepare(
      `SELECT id FROM email_connections
       WHERE apartment_id = ? AND kind = 'gmail'`,
    )
      .bind(apartment.id)
      .first<{ id: string }>()

    if (existingConn) {
      await c.env.DB.prepare(
        `UPDATE email_connections
         SET user_id = ?, provider = 'Mailbox', mailbox_email = ?, status = 'Active',
             gmail_refresh_token_enc = ?, gmail_access_token_enc = ?,
             gmail_access_token_expires_at = ?, last_sync_error = NULL
         WHERE id = ?`,
      )
        .bind(state.userId, tokens.email, refreshEnc, accessEnc, expiresAt, existingConn.id)
        .run()
    } else {
      await c.env.DB.prepare(
        `INSERT INTO email_connections (
          id, apartment_id, user_id, kind, provider, mailbox_email, status,
          gmail_refresh_token_enc, gmail_access_token_enc, gmail_access_token_expires_at,
          gmail_history_id, last_synced_at, last_sync_error, created_at
        ) VALUES (?, ?, ?, 'gmail', 'Mailbox', ?, 'Active', ?, ?, ?, NULL, NULL, NULL, ?)`,
      )
        .bind(
          newId(),
          apartment.id,
          state.userId,
          tokens.email,
          refreshEnc,
          accessEnc,
          expiresAt,
          nowIso(),
        )
        .run()
    }

    await upsertOtaIntegrations(c.env.DB, apartment.id)

    const conn = await c.env.DB.prepare(
      `SELECT id FROM email_connections WHERE apartment_id = ? AND kind = 'gmail' LIMIT 1`,
    )
      .bind(apartment.id)
      .first<{ id: string }>()
    if (conn) {
      try {
        c.executionCtx.waitUntil(
          syncGmailConnection(c.env, conn.id).catch((error) =>
            console.error('Initial Gmail sync failed', error),
          ),
        )
      } catch {
        void syncGmailConnection(c.env, conn.id).catch((error) =>
          console.error('Initial Gmail sync failed', error),
        )
      }
    }

    return c.redirect(integrationsRedirect(origin, { gmail: 'connected' }))
  } catch (error) {
    console.error('Gmail OAuth callback failed', error)
    return c.redirect(
      integrationsRedirect(origin, {
        gmail: 'error',
        reason: error instanceof Error ? error.message.slice(0, 80) : 'callback_failed',
      }),
    )
  }
})
