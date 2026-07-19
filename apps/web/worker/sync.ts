import { newId, nowIso } from './db'
import { detectCalendarProvider, fetchIcal, parseIcalEvents, type OtaSource } from './ical'

export type SyncResult = {
  created: number
  updated: number
  canceled: number
}

async function updateIntegrationStatus(
  db: D1Database,
  apartmentId: string,
  calendarUrl: string,
  ok: boolean,
  syncedAt: string,
  errorMessage: string | null,
  sourceHint: OtaSource = 'Other',
): Promise<void> {
  const fromUrl = detectCalendarProvider(calendarUrl)
  const provider = fromUrl !== 'Other' ? fromUrl : sourceHint

  if (ok) {
    if (provider !== 'Other') {
      await db
        .prepare(
          `UPDATE integration_configurations
           SET status = 'Active', last_synced_at = ?, last_sync_error = NULL, ical_url = ?
           WHERE apartment_id = ? AND provider = ?`,
        )
        .bind(syncedAt, calendarUrl, apartmentId, provider)
        .run()
    }
    await db
      .prepare(
        `UPDATE integration_configurations
         SET status = 'Active', last_synced_at = ?, last_sync_error = NULL
         WHERE apartment_id = ? AND ical_url = ?`,
      )
      .bind(syncedAt, apartmentId, calendarUrl)
      .run()
    return
  }

  if (provider !== 'Other') {
    await db
      .prepare(
        `UPDATE integration_configurations
         SET status = 'Error', last_sync_error = ?, ical_url = ?
         WHERE apartment_id = ? AND provider = ?`,
      )
      .bind(errorMessage, calendarUrl, apartmentId, provider)
      .run()
  }
  await db
    .prepare(
      `UPDATE integration_configurations
       SET status = 'Error', last_sync_error = ?
       WHERE apartment_id = ? AND ical_url = ?`,
    )
    .bind(errorMessage, apartmentId, calendarUrl)
    .run()
}

function dominantSource(events: { source: OtaSource }[]): OtaSource {
  for (const source of ['Booking', 'Airbnb'] as const) {
    if (events.some((event) => event.source === source)) {
      return source
    }
  }
  return 'Other'
}

export async function syncLinkedCalendar(
  db: D1Database,
  apartmentId: string,
  calendarId: string,
): Promise<SyncResult> {
  const calendar = await db
    .prepare('SELECT * FROM linked_calendars WHERE id = ? AND apartment_id = ?')
    .bind(calendarId, apartmentId)
    .first<{ id: string; url: string; name: string }>()

  if (!calendar) {
    throw new Error('Linked calendar not found')
  }

  let sourceHint: OtaSource = detectCalendarProvider(calendar.url)

  try {
    const ics = await fetchIcal(calendar.url)
    const events = parseIcalEvents(ics, calendar.url)
    const fromEvents = dominantSource(events)
    if (fromEvents !== 'Other') {
      sourceHint = fromEvents
    }

    let created = 0
    let updated = 0
    let canceled = 0

    const activeExternalIds = new Set<string>()

    for (const event of events) {
      const externalId = `ical:${calendar.id}:${event.uid}`
      activeExternalIds.add(externalId)

      const existing = await db
        .prepare('SELECT * FROM reservations WHERE apartment_id = ? AND external_id = ?')
        .bind(apartmentId, externalId)
        .first<{ id: string }>()

      if (existing) {
        await db
          .prepare(
            `UPDATE reservations
             SET holding_name = ?, start_date = ?, end_date = ?, state = 'Active',
                 source = ?, reference = COALESCE(?, reference)
             WHERE id = ?`,
          )
          .bind(
            event.holdingName,
            event.startDate,
            event.endDate,
            event.source,
            event.reference,
            existing.id,
          )
          .run()
        updated++
      } else {
        await db
          .prepare(
            `INSERT INTO reservations (
              id, apartment_id, state, external_id, reference, booking_date,
              start_date, end_date, source, holding_name, people, adults, children, infants,
              price, commission, currency, country
            ) VALUES (?, ?, 'Active', ?, ?, NULL, ?, ?, ?, ?, NULL, NULL, NULL, NULL, NULL, NULL, 'EUR', NULL)`,
          )
          .bind(
            newId(),
            apartmentId,
            externalId,
            event.reference,
            event.startDate,
            event.endDate,
            event.source,
            event.holdingName,
          )
          .run()
        created++
      }
    }

    // Cancel reservations from this calendar that disappeared from the feed
    const { results: existingFromCal } = await db
      .prepare(
        `SELECT id, external_id, state FROM reservations
         WHERE apartment_id = ? AND external_id LIKE ?`,
      )
      .bind(apartmentId, `ical:${calendar.id}:%`)
      .all<{ id: string; external_id: string; state: string }>()

    for (const row of existingFromCal ?? []) {
      if (row.external_id && !activeExternalIds.has(row.external_id) && row.state === 'Active') {
        await db.prepare(`UPDATE reservations SET state = 'Canceled' WHERE id = ?`).bind(row.id).run()
        canceled++
      }
    }

    const syncedAt = nowIso()
    await db
      .prepare(
        `UPDATE linked_calendars SET last_synced_at = ?, last_sync_error = NULL WHERE id = ?`,
      )
      .bind(syncedAt, calendar.id)
      .run()

    await updateIntegrationStatus(db, apartmentId, calendar.url, true, syncedAt, null, sourceHint)

    return { created, updated, canceled }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Sync failed'
    await db
      .prepare(`UPDATE linked_calendars SET last_sync_error = ? WHERE id = ?`)
      .bind(message, calendar.id)
      .run()
    await updateIntegrationStatus(db, apartmentId, calendar.url, false, nowIso(), message, sourceHint)
    throw error instanceof Error ? error : new Error(message)
  }
}

export async function syncAllLinkedCalendars(
  db: D1Database,
): Promise<{ calendars: number; succeeded: number; failed: number }> {
  const { results } = await db
    .prepare('SELECT id, apartment_id FROM linked_calendars ORDER BY id')
    .all<{ id: string; apartment_id: string }>()

  let succeeded = 0
  let failed = 0

  for (const calendar of results ?? []) {
    try {
      await syncLinkedCalendar(db, calendar.apartment_id, calendar.id)
      succeeded++
    } catch (error) {
      failed++
      console.error('Scheduled iCal sync failed', calendar.id, error)
    }
  }

  return { calendars: results?.length ?? 0, succeeded, failed }
}
