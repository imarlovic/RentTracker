import { newId, type ReservationRow } from '../db'
import type { ParsedBookingEmail } from './bookingParse'

export type ApplyResult = {
  reservationId: string | null
  action: 'created' | 'updated' | 'canceled' | 'ignored'
  reason?: string
}

function namesLooselyMatch(a: string | null | undefined, b: string | null | undefined): boolean {
  if (!a || !b) {
    return false
  }
  const norm = (value: string) =>
    value
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
  const left = norm(a)
  const right = norm(b)
  if (!left || !right) {
    return false
  }
  return left === right || left.includes(right) || right.includes(left)
}

function datesMatch(
  startA: string,
  endA: string,
  startB: string | null,
  endB: string | null,
): boolean {
  if (!startB || !endB) {
    return false
  }
  return startA === startB && endA === endB
}

async function findReservation(
  db: D1Database,
  apartmentId: string,
  parsed: ParsedBookingEmail,
): Promise<ReservationRow | null> {
  if (parsed.reservationNumber) {
    const byReference = await db
      .prepare(
        `SELECT * FROM reservations
         WHERE apartment_id = ?
           AND (reference = ? OR external_id = ? OR external_id LIKE ?)
         LIMIT 1`,
      )
      .bind(
        apartmentId,
        parsed.reservationNumber,
        `email:booking:${parsed.reservationNumber}`,
        `%:${parsed.reservationNumber}`,
      )
      .first<ReservationRow>()
    if (byReference) {
      return byReference
    }
  }

  if (parsed.startDate && parsed.endDate) {
    const { results } = await db
      .prepare(
        `SELECT * FROM reservations
         WHERE apartment_id = ?
           AND start_date = ?
           AND end_date = ?
           AND source IN ('Booking', 'Other')
         ORDER BY CASE WHEN source = 'Booking' THEN 0 ELSE 1 END`,
      )
      .bind(apartmentId, parsed.startDate, parsed.endDate)
      .all<ReservationRow>()

    const rows = results ?? []
    if (rows.length === 1) {
      return rows[0]
    }
    if (rows.length > 1 && parsed.guestName) {
      const named = rows.find((row) => namesLooselyMatch(row.holding_name, parsed.guestName))
      if (named) {
        return named
      }
    }
    if (rows.length > 1) {
      return rows.find((row) => row.source === 'Booking') ?? rows[0]
    }
  }

  return null
}

export async function applyParsedBookingEmail(
  db: D1Database,
  apartmentId: string,
  parsed: ParsedBookingEmail,
): Promise<ApplyResult> {
  if (parsed.confidence === 'low' && !parsed.reservationNumber && !(parsed.startDate && parsed.endDate)) {
    return { reservationId: null, action: 'ignored', reason: 'Insufficient booking fields' }
  }

  const existing = await findReservation(db, apartmentId, parsed)

  if (parsed.action === 'canceled') {
    if (!existing) {
      return { reservationId: null, action: 'ignored', reason: 'No reservation to cancel' }
    }
    await db
      .prepare(
        `UPDATE reservations
         SET state = 'Canceled',
             reference = COALESCE(?, reference),
             holding_name = COALESCE(?, holding_name)
         WHERE id = ?`,
      )
      .bind(parsed.reservationNumber, parsed.guestName, existing.id)
      .run()
    return { reservationId: existing.id, action: 'canceled' }
  }

  if (existing) {
    const holdingName = parsed.guestName || existing.holding_name
    const startDate = parsed.startDate || existing.start_date
    const endDate = parsed.endDate || existing.end_date
    await db
      .prepare(
        `UPDATE reservations
         SET state = 'Active',
             source = 'Booking',
             holding_name = ?,
             start_date = ?,
             end_date = ?,
             reference = COALESCE(?, reference),
             booking_date = COALESCE(?, booking_date),
             price = COALESCE(?, price),
             commission = COALESCE(?, commission),
             currency = COALESCE(?, currency),
             adults = COALESCE(?, adults),
             children = COALESCE(?, children),
             people = COALESCE(?, people),
             country = COALESCE(?, country),
             external_id = CASE
               WHEN external_id IS NULL OR external_id = '' THEN ?
               ELSE external_id
             END
         WHERE id = ?`,
      )
      .bind(
        holdingName,
        startDate,
        endDate,
        parsed.reservationNumber,
        parsed.bookingDate,
        parsed.price,
        parsed.commission,
        parsed.currency,
        parsed.adults,
        parsed.children,
        parsed.people,
        parsed.country,
        parsed.reservationNumber
          ? `email:booking:${parsed.reservationNumber}`
          : `email:booking:merge:${existing.id}`,
        existing.id,
      )
      .run()
    return { reservationId: existing.id, action: 'updated' }
  }

  if (!parsed.startDate || !parsed.endDate) {
    return { reservationId: null, action: 'ignored', reason: 'Missing dates for new reservation' }
  }

  const id = newId()
  const externalId = parsed.reservationNumber
    ? `email:booking:${parsed.reservationNumber}`
    : `email:booking:anon:${id}`

  await db
    .prepare(
      `INSERT INTO reservations (
        id, apartment_id, state, external_id, reference, booking_date,
        start_date, end_date, source, holding_name, people, adults, children, infants,
        price, commission, currency, country
      ) VALUES (?, ?, 'Active', ?, ?, ?, ?, ?, 'Booking', ?, ?, ?, ?, NULL, ?, ?, ?, ?)`,
    )
    .bind(
      id,
      apartmentId,
      externalId,
      parsed.reservationNumber,
      parsed.bookingDate,
      parsed.startDate,
      parsed.endDate,
      parsed.guestName || 'Booking guest',
      parsed.people,
      parsed.adults,
      parsed.children,
      parsed.price,
      parsed.commission,
      parsed.currency || 'EUR',
      parsed.country,
    )
    .run()

  return { reservationId: id, action: 'created' }
}

export function shouldPreferEmailFieldsOverIcal(
  existing: Pick<ReservationRow, 'reference' | 'price' | 'commission' | 'holding_name'>,
  icalHoldingName: string,
): { holdingName: string; keepReference: boolean } {
  // Keep richer email-sourced guest names when iCal only has CLOSED - X or identical dates merge.
  const icalLooksGeneric = /^CLOSED\s*-/i.test(icalHoldingName) || icalHoldingName === 'Reservation'
  if (existing.holding_name && icalLooksGeneric && !namesLooselyMatch(existing.holding_name, icalHoldingName)) {
    return { holdingName: existing.holding_name, keepReference: true }
  }
  return { holdingName: icalHoldingName, keepReference: true }
}

export { datesMatch, namesLooselyMatch }
