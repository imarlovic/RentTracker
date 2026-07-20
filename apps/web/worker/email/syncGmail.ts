import { newId, nowIso } from '../db'
import type { Env } from '../env'
import { notifyUserNewReservation } from '../push'
import { applyParsedOtaEmail } from './apply'
import { parseAirbnbEmail } from './airbnbParse'
import { parseBookingEmail } from './bookingParse'
import {
  getGmailMessage,
  listOtaMessages,
  openToken,
  refreshGmailAccessToken,
  sealToken,
} from './gmail'
import { isEmailProvider, type EmailProvider } from './providers'

export type EmailConnectionRow = {
  id: string
  apartment_id: string
  user_id: string
  kind: string
  provider: string
  mailbox_email: string
  status: string
  gmail_refresh_token_enc: string | null
  gmail_access_token_enc: string | null
  gmail_access_token_expires_at: string | null
  gmail_history_id: string | null
  last_synced_at: string | null
  last_sync_error: string | null
  created_at: string
}

const EXCERPT_MAX = 500

async function resolveAccessToken(
  env: Env,
  connection: EmailConnectionRow,
): Promise<{ accessToken: string; connection: EmailConnectionRow }> {
  if (!connection.gmail_refresh_token_enc) {
    throw new Error('Gmail connection is missing a refresh token. Reconnect the mailbox.')
  }

  const expiresAt = connection.gmail_access_token_expires_at
    ? Date.parse(connection.gmail_access_token_expires_at)
    : 0
  if (
    connection.gmail_access_token_enc &&
    Number.isFinite(expiresAt) &&
    expiresAt > Date.now() + 60_000
  ) {
    return {
      accessToken: await openToken(env, connection.gmail_access_token_enc),
      connection,
    }
  }

  const refreshToken = await openToken(env, connection.gmail_refresh_token_enc)
  const refreshed = await refreshGmailAccessToken(env, refreshToken)
  const accessEnc = await sealToken(env, refreshed.accessToken)
  const expiresIso = new Date(Date.now() + refreshed.expiresIn * 1000).toISOString()
  await env.DB.prepare(
    `UPDATE email_connections
     SET gmail_access_token_enc = ?, gmail_access_token_expires_at = ?, status = 'Active', last_sync_error = NULL
     WHERE id = ?`,
  )
    .bind(accessEnc, expiresIso, connection.id)
    .run()

  return {
    accessToken: refreshed.accessToken,
    connection: {
      ...connection,
      gmail_access_token_enc: accessEnc,
      gmail_access_token_expires_at: expiresIso,
      status: 'Active',
      last_sync_error: null,
    },
  }
}

async function alreadyIngested(
  db: D1Database,
  apartmentId: string,
  messageId: string,
): Promise<boolean> {
  const row = await db
    .prepare(
      `SELECT id FROM email_ingest_events WHERE apartment_id = ? AND message_id = ? LIMIT 1`,
    )
    .bind(apartmentId, messageId)
    .first()
  return Boolean(row)
}

export async function recordIngestEvent(
  db: D1Database,
  input: {
    apartmentId: string
    connectionId: string | null
    messageId: string
    fromAddress?: string | null
    subject?: string | null
    receivedAt?: string | null
    parseStatus: 'parsed' | 'ignored' | 'failed'
    parseError?: string | null
    rawExcerpt?: string | null
    reservationId?: string | null
  },
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO email_ingest_events (
        id, apartment_id, connection_id, message_id, from_address, subject, received_at,
        parse_status, parse_error, raw_excerpt, reservation_id, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(apartment_id, message_id) DO UPDATE SET
        parse_status = excluded.parse_status,
        parse_error = excluded.parse_error,
        raw_excerpt = excluded.raw_excerpt,
        reservation_id = excluded.reservation_id`,
    )
    .bind(
      newId(),
      input.apartmentId,
      input.connectionId,
      input.messageId,
      input.fromAddress ?? null,
      input.subject ?? null,
      input.receivedAt ?? null,
      input.parseStatus,
      input.parseError ?? null,
      input.rawExcerpt?.slice(0, EXCERPT_MAX) ?? null,
      input.reservationId ?? null,
      nowIso(),
    )
    .run()
}

export async function ingestOtaEmailMessage(
  env: Env,
  input: {
    apartmentId: string
    connectionId: string | null
    provider: EmailProvider
    userId?: string | null
    messageId: string
    fromAddress?: string | null
    subject?: string | null
    receivedAt?: string | null
    bodyText?: string | null
    bodyHtml?: string | null
    notifyOnCreate?: boolean
  },
): Promise<{
  parseStatus: 'parsed' | 'ignored' | 'failed'
  reservationId: string | null
  applyAction?: string
  error?: string
}> {
  try {
    const parsed =
      input.provider === 'Airbnb'
        ? parseAirbnbEmail({
            subject: input.subject,
            bodyText: input.bodyText,
            bodyHtml: input.bodyHtml,
          })
        : parseBookingEmail({
            subject: input.subject,
            bodyText: input.bodyText,
            bodyHtml: input.bodyHtml,
          })
    const apply = await applyParsedOtaEmail(env.DB, input.apartmentId, input.provider, parsed)
    const parseStatus =
      apply.action === 'ignored' ? 'ignored' : apply.reservationId ? 'parsed' : 'ignored'

    await recordIngestEvent(env.DB, {
      apartmentId: input.apartmentId,
      connectionId: input.connectionId,
      messageId: input.messageId,
      fromAddress: input.fromAddress,
      subject: input.subject,
      receivedAt: input.receivedAt,
      parseStatus,
      parseError: apply.reason ?? null,
      rawExcerpt: (input.bodyText || input.bodyHtml || input.subject || '').slice(0, EXCERPT_MAX),
      reservationId: apply.reservationId,
    })

    if (
      input.notifyOnCreate &&
      apply.action === 'created' &&
      apply.reservationId &&
      input.userId
    ) {
      await notifyUserNewReservation(env, input.userId, {
        title: `New ${input.provider} reservation`,
        body: `${parsed.guestName || 'Guest'} · ${parsed.startDate} → ${parsed.endDate}`,
        url: '/calendar',
      })
    }

    return {
      parseStatus,
      reservationId: apply.reservationId,
      applyAction: apply.action,
      error: apply.reason,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Ingest failed'
    await recordIngestEvent(env.DB, {
      apartmentId: input.apartmentId,
      connectionId: input.connectionId,
      messageId: input.messageId,
      fromAddress: input.fromAddress,
      subject: input.subject,
      receivedAt: input.receivedAt,
      parseStatus: 'failed',
      parseError: message,
      rawExcerpt: (input.bodyText || input.subject || '').slice(0, EXCERPT_MAX),
    })
    return { parseStatus: 'failed', reservationId: null, error: message }
  }
}

/** @deprecated Use ingestOtaEmailMessage with provider Booking */
export async function ingestBookingEmailMessage(
  env: Env,
  input: {
    apartmentId: string
    connectionId: string | null
    userId?: string | null
    messageId: string
    fromAddress?: string | null
    subject?: string | null
    receivedAt?: string | null
    bodyText?: string | null
    bodyHtml?: string | null
    notifyOnCreate?: boolean
  },
) {
  return ingestOtaEmailMessage(env, { ...input, provider: 'Booking' })
}

export async function syncGmailConnection(
  env: Env,
  connectionId: string,
): Promise<{ scanned: number; ingested: number; failed: number }> {
  const connection = await env.DB.prepare('SELECT * FROM email_connections WHERE id = ?')
    .bind(connectionId)
    .first<EmailConnectionRow>()
  if (!connection || connection.kind !== 'gmail') {
    throw new Error('Gmail connection not found')
  }

  try {
    const { accessToken } = await resolveAccessToken(env, connection)
    const provider: EmailProvider = isEmailProvider(connection.provider)
      ? connection.provider
      : 'Booking'
    const messages = await listOtaMessages(accessToken, provider)
    let ingested = 0
    let failed = 0

    for (const item of messages) {
      if (await alreadyIngested(env.DB, connection.apartment_id, item.id)) {
        continue
      }
      try {
        const full = await getGmailMessage(accessToken, item.id)
        const result = await ingestOtaEmailMessage(env, {
          apartmentId: connection.apartment_id,
          connectionId: connection.id,
          provider,
          userId: connection.user_id,
          messageId: full.id,
          fromAddress: full.from,
          subject: full.subject,
          receivedAt: full.receivedAt,
          bodyText: full.bodyText,
          bodyHtml: full.bodyHtml,
          notifyOnCreate: true,
        })
        if (result.parseStatus === 'failed') {
          failed++
        } else {
          ingested++
        }
      } catch (error) {
        failed++
        await recordIngestEvent(env.DB, {
          apartmentId: connection.apartment_id,
          connectionId: connection.id,
          messageId: item.id,
          parseStatus: 'failed',
          parseError: error instanceof Error ? error.message : 'Message fetch failed',
        })
      }
    }

    const syncedAt = nowIso()
    await env.DB.prepare(
      `UPDATE email_connections
       SET last_synced_at = ?, last_sync_error = NULL, status = 'Active'
       WHERE id = ?`,
    )
      .bind(syncedAt, connection.id)
      .run()

    await env.DB.prepare(
      `UPDATE integration_configurations
       SET status = 'Active', last_synced_at = ?, last_sync_error = NULL
       WHERE apartment_id = ? AND provider = ?`,
    )
      .bind(syncedAt, connection.apartment_id, provider)
      .run()

    return { scanned: messages.length, ingested, failed }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Gmail sync failed'
    const provider = isEmailProvider(connection.provider) ? connection.provider : 'Booking'
    await env.DB.prepare(
      `UPDATE email_connections
       SET status = 'Error', last_sync_error = ?
       WHERE id = ?`,
    )
      .bind(message, connection.id)
      .run()
    await env.DB.prepare(
      `UPDATE integration_configurations
       SET status = 'Error', last_sync_error = ?
       WHERE apartment_id = ? AND provider = ?`,
    )
      .bind(message, connection.apartment_id, provider)
      .run()
    throw error instanceof Error ? error : new Error(message)
  }
}

export async function syncAllGmailConnections(
  env: Env,
): Promise<{ connections: number; succeeded: number; failed: number }> {
  const { results } = await env.DB.prepare(
    `SELECT id FROM email_connections WHERE kind = 'gmail' AND status != 'Disabled' ORDER BY id`,
  ).all<{ id: string }>()

  let succeeded = 0
  let failed = 0
  for (const row of results ?? []) {
    try {
      await syncGmailConnection(env, row.id)
      succeeded++
    } catch (error) {
      failed++
      console.error('Gmail sync failed', row.id, error)
    }
  }
  return { connections: results?.length ?? 0, succeeded, failed }
}

/** Delete ingest events older than retentionDays (PII minimization). */
export async function pruneIngestEvents(db: D1Database, retentionDays = 30): Promise<number> {
  const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000).toISOString()
  const result = await db
    .prepare(`DELETE FROM email_ingest_events WHERE created_at < ?`)
    .bind(cutoff)
    .run()
  return result.meta.changes ?? 0
}
