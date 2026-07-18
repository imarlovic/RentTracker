import { Hono } from 'hono'
import {
  newId,
  nowIso,
  toApartmentDto,
  toReservationDto,
  type ApartmentRow,
  type ReservationRow,
} from '../db'
import type { Env, Variables } from '../env'

type CreateApartmentBody = { name?: string }
type UpdateApartmentBody = { name?: string }
type ReservationBody = {
  holdingName?: string
  startDate?: string
  endDate?: string
  state?: string
  source?: string
  price?: number
  commission?: number
  currency?: string
  country?: string
  people?: number
}

export const apartmentRoutes = new Hono<{ Bindings: Env; Variables: Variables }>()

async function getOwnedApartment(db: D1Database, apartmentId: string, userId: string) {
  return db
    .prepare('SELECT * FROM apartments WHERE id = ? AND owner_id = ?')
    .bind(apartmentId, userId)
    .first<ApartmentRow>()
}

apartmentRoutes.get('/', async (c) => {
  const userId = c.get('userId')
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM apartments WHERE owner_id = ? ORDER BY name COLLATE NOCASE',
  )
    .bind(userId)
    .all<ApartmentRow>()

  return c.json((results ?? []).map(toApartmentDto))
})

apartmentRoutes.post('/', async (c) => {
  const userId = c.get('userId')
  let body: CreateApartmentBody = {}
  try {
    body = await c.req.json<CreateApartmentBody>()
  } catch {
    body = {}
  }
  const name = body.name?.trim()
  if (!name) {
    return c.json({ error: 'Name is required.' }, 400)
  }

  const row: ApartmentRow = {
    id: newId(),
    name,
    owner_id: userId,
    header_blob_key: null,
    created_at: nowIso(),
  }

  await c.env.DB.prepare(
    'INSERT INTO apartments (id, name, owner_id, header_blob_key, created_at) VALUES (?, ?, ?, ?, ?)',
  )
    .bind(row.id, row.name, row.owner_id, row.header_blob_key, row.created_at)
    .run()

  return c.json(toApartmentDto(row), 201)
})

apartmentRoutes.get('/:apartmentId', async (c) => {
  const apartment = await getOwnedApartment(c.env.DB, c.req.param('apartmentId'), c.get('userId'))
  if (!apartment) {
    return c.json({ error: 'Not found' }, 404)
  }
  return c.json(toApartmentDto(apartment))
})

apartmentRoutes.put('/:apartmentId', async (c) => {
  const apartment = await getOwnedApartment(c.env.DB, c.req.param('apartmentId'), c.get('userId'))
  if (!apartment) {
    return c.json({ error: 'Not found' }, 404)
  }

  let body: UpdateApartmentBody = {}
  try {
    body = await c.req.json<UpdateApartmentBody>()
  } catch {
    body = {}
  }
  const name = body.name?.trim()
  if (!name) {
    return c.json({ error: 'Name is required.' }, 400)
  }

  await c.env.DB.prepare('UPDATE apartments SET name = ? WHERE id = ?')
    .bind(name, apartment.id)
    .run()

  return c.json(toApartmentDto({ ...apartment, name }))
})

apartmentRoutes.delete('/:apartmentId', async (c) => {
  const apartment = await getOwnedApartment(c.env.DB, c.req.param('apartmentId'), c.get('userId'))
  if (!apartment) {
    return c.json({ error: 'Not found' }, 404)
  }

  await c.env.DB.prepare('DELETE FROM apartments WHERE id = ?').bind(apartment.id).run()
  return c.body(null, 204)
})

apartmentRoutes.get('/:apartmentId/reservations', async (c) => {
  const apartment = await getOwnedApartment(c.env.DB, c.req.param('apartmentId'), c.get('userId'))
  if (!apartment) {
    return c.json({ error: 'Not found' }, 404)
  }

  const { results } = await c.env.DB.prepare(
    'SELECT * FROM reservations WHERE apartment_id = ? ORDER BY start_date',
  )
    .bind(apartment.id)
    .all<ReservationRow>()

  return c.json((results ?? []).map(toReservationDto))
})

apartmentRoutes.post('/:apartmentId/reservations', async (c) => {
  const apartment = await getOwnedApartment(c.env.DB, c.req.param('apartmentId'), c.get('userId'))
  if (!apartment) {
    return c.json({ error: 'Not found' }, 404)
  }

  let body: ReservationBody = {}
  try {
    body = await c.req.json<ReservationBody>()
  } catch {
    body = {}
  }

  if (!body.holdingName?.trim() || !body.startDate || !body.endDate || body.endDate < body.startDate) {
    return c.json({ error: 'Invalid reservation data.' }, 400)
  }

  const row: ReservationRow = {
    id: newId(),
    apartment_id: apartment.id,
    state: 'Active',
    external_id: null,
    reference: null,
    booking_date: null,
    start_date: body.startDate,
    end_date: body.endDate,
    source: body.source || 'RentTracker',
    holding_name: body.holdingName.trim(),
    people: body.people ?? null,
    adults: null,
    children: null,
    infants: null,
    price: body.price ?? null,
    commission: body.commission ?? null,
    currency: body.currency || 'EUR',
    country: body.country ?? null,
  }

  await c.env.DB.prepare(
    `INSERT INTO reservations (
      id, apartment_id, state, external_id, reference, booking_date,
      start_date, end_date, source, holding_name, people, adults, children, infants,
      price, commission, currency, country
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      row.id,
      row.apartment_id,
      row.state,
      row.external_id,
      row.reference,
      row.booking_date,
      row.start_date,
      row.end_date,
      row.source,
      row.holding_name,
      row.people,
      row.adults,
      row.children,
      row.infants,
      row.price,
      row.commission,
      row.currency,
      row.country,
    )
    .run()

  return c.json(toReservationDto(row), 201)
})

apartmentRoutes.put('/:apartmentId/reservations/:reservationId', async (c) => {
  const apartment = await getOwnedApartment(c.env.DB, c.req.param('apartmentId'), c.get('userId'))
  if (!apartment) {
    return c.json({ error: 'Not found' }, 404)
  }

  const existing = await c.env.DB.prepare(
    'SELECT * FROM reservations WHERE id = ? AND apartment_id = ?',
  )
    .bind(c.req.param('reservationId'), apartment.id)
    .first<ReservationRow>()

  if (!existing) {
    return c.json({ error: 'Not found' }, 404)
  }

  let body: ReservationBody = {}
  try {
    body = await c.req.json<ReservationBody>()
  } catch {
    body = {}
  }

  if (!body.holdingName?.trim() || !body.startDate || !body.endDate || body.endDate < body.startDate) {
    return c.json({ error: 'Invalid reservation data.' }, 400)
  }

  const row: ReservationRow = {
    ...existing,
    holding_name: body.holdingName.trim(),
    start_date: body.startDate,
    end_date: body.endDate,
    state: body.state || existing.state,
    source: body.source || existing.source,
    price: body.price ?? null,
    commission: body.commission ?? null,
    currency: body.currency || existing.currency,
    country: body.country ?? null,
    people: body.people ?? null,
  }

  await c.env.DB.prepare(
    `UPDATE reservations SET
      holding_name = ?, start_date = ?, end_date = ?, state = ?, source = ?,
      price = ?, commission = ?, currency = ?, country = ?, people = ?
     WHERE id = ?`,
  )
    .bind(
      row.holding_name,
      row.start_date,
      row.end_date,
      row.state,
      row.source,
      row.price,
      row.commission,
      row.currency,
      row.country,
      row.people,
      row.id,
    )
    .run()

  return c.json(toReservationDto(row))
})

apartmentRoutes.delete('/:apartmentId/reservations/:reservationId', async (c) => {
  const apartment = await getOwnedApartment(c.env.DB, c.req.param('apartmentId'), c.get('userId'))
  if (!apartment) {
    return c.json({ error: 'Not found' }, 404)
  }

  const existing = await c.env.DB.prepare(
    'SELECT id FROM reservations WHERE id = ? AND apartment_id = ?',
  )
    .bind(c.req.param('reservationId'), apartment.id)
    .first()

  if (!existing) {
    return c.json({ error: 'Not found' }, 404)
  }

  await c.env.DB.prepare('DELETE FROM reservations WHERE id = ?')
    .bind(c.req.param('reservationId'))
    .run()

  return c.body(null, 204)
})
