import { newId, nowIso } from './db'
import { fetchIcal, parseIcalEvents } from './ical'

export async function syncLinkedCalendar(
  db: D1Database,
  apartmentId: string,
  calendarId: string,
): Promise<{ created: number; updated: number; canceled: number }> {
  const calendar = await db
    .prepare('SELECT * FROM linked_calendars WHERE id = ? AND apartment_id = ?')
    .bind(calendarId, apartmentId)
    .first<{ id: string; url: string; name: string }>()

  if (!calendar) {
    throw new Error('Linked calendar not found')
  }

  const ics = await fetchIcal(calendar.url)
  const events = parseIcalEvents(ics)

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
           SET holding_name = ?, start_date = ?, end_date = ?, state = 'Active', source = 'Other'
           WHERE id = ?`,
        )
        .bind(event.summary, event.startDate, event.endDate, existing.id)
        .run()
      updated++
    } else {
      await db
        .prepare(
          `INSERT INTO reservations (
            id, apartment_id, state, external_id, reference, booking_date,
            start_date, end_date, source, holding_name, people, adults, children, infants,
            price, commission, currency, country
          ) VALUES (?, ?, 'Active', ?, NULL, NULL, ?, ?, 'Other', ?, NULL, NULL, NULL, NULL, NULL, NULL, 'EUR', NULL)`,
        )
        .bind(newId(), apartmentId, externalId, event.startDate, event.endDate, event.summary)
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

  await db
    .prepare('UPDATE linked_calendars SET last_synced_at = ? WHERE id = ?')
    .bind(nowIso(), calendar.id)
    .run()

  return { created, updated, canceled }
}
