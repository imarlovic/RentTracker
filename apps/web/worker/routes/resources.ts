import { Hono } from 'hono'
import {
  newId,
  nowIso,
  toDocumentDto,
  toExpenseDto,
  toLinkedCalendarDto,
  type DocumentRow,
  type ExpenseRow,
  type LinkedCalendarRow,
} from '../db'
import type { Env, Variables } from '../env'
import { getOwnedApartment } from '../ownership'
import { syncLinkedCalendar } from '../sync'

export const resourceRoutes = new Hono<{ Bindings: Env; Variables: Variables }>()

// —— Expenses ——

resourceRoutes.get('/:apartmentId/expenses', async (c) => {
  const apartment = await getOwnedApartment(c.env.DB, c.req.param('apartmentId'), c.get('userId'))
  if (!apartment) {
    return c.json({ error: 'Not found' }, 404)
  }

  const { results } = await c.env.DB.prepare(
    'SELECT * FROM expenses WHERE apartment_id = ? ORDER BY date DESC',
  )
    .bind(apartment.id)
    .all<ExpenseRow>()

  return c.json((results ?? []).map(toExpenseDto))
})

resourceRoutes.post('/:apartmentId/expenses', async (c) => {
  const apartment = await getOwnedApartment(c.env.DB, c.req.param('apartmentId'), c.get('userId'))
  if (!apartment) {
    return c.json({ error: 'Not found' }, 404)
  }

  let body: { name?: string; description?: string; date?: string; amount?: number; currency?: string } = {}
  try {
    body = await c.req.json()
  } catch {
    body = {}
  }

  if (!body.name?.trim() || !body.date || body.amount == null || Number.isNaN(Number(body.amount))) {
    return c.json({ error: 'Invalid expense data.' }, 400)
  }

  const row: ExpenseRow = {
    id: newId(),
    apartment_id: apartment.id,
    name: body.name.trim(),
    description: body.description?.trim() || null,
    date: body.date,
    amount: Number(body.amount),
    currency: body.currency || 'EUR',
  }

  await c.env.DB.prepare(
    `INSERT INTO expenses (id, apartment_id, name, description, date, amount, currency)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(row.id, row.apartment_id, row.name, row.description, row.date, row.amount, row.currency)
    .run()

  return c.json(toExpenseDto(row), 201)
})

resourceRoutes.put('/:apartmentId/expenses/:expenseId', async (c) => {
  const apartment = await getOwnedApartment(c.env.DB, c.req.param('apartmentId'), c.get('userId'))
  if (!apartment) {
    return c.json({ error: 'Not found' }, 404)
  }

  const existing = await c.env.DB.prepare(
    'SELECT * FROM expenses WHERE id = ? AND apartment_id = ?',
  )
    .bind(c.req.param('expenseId'), apartment.id)
    .first<ExpenseRow>()
  if (!existing) {
    return c.json({ error: 'Not found' }, 404)
  }

  let body: { name?: string; description?: string; date?: string; amount?: number; currency?: string } = {}
  try {
    body = await c.req.json()
  } catch {
    body = {}
  }

  if (!body.name?.trim() || !body.date || body.amount == null) {
    return c.json({ error: 'Invalid expense data.' }, 400)
  }

  const row: ExpenseRow = {
    ...existing,
    name: body.name.trim(),
    description: body.description?.trim() || null,
    date: body.date,
    amount: Number(body.amount),
    currency: body.currency || existing.currency,
  }

  await c.env.DB.prepare(
    `UPDATE expenses SET name = ?, description = ?, date = ?, amount = ?, currency = ? WHERE id = ?`,
  )
    .bind(row.name, row.description, row.date, row.amount, row.currency, row.id)
    .run()

  return c.json(toExpenseDto(row))
})

resourceRoutes.delete('/:apartmentId/expenses/:expenseId', async (c) => {
  const apartment = await getOwnedApartment(c.env.DB, c.req.param('apartmentId'), c.get('userId'))
  if (!apartment) {
    return c.json({ error: 'Not found' }, 404)
  }

  const existing = await c.env.DB.prepare(
    'SELECT id FROM expenses WHERE id = ? AND apartment_id = ?',
  )
    .bind(c.req.param('expenseId'), apartment.id)
    .first()
  if (!existing) {
    return c.json({ error: 'Not found' }, 404)
  }

  await c.env.DB.prepare('DELETE FROM expenses WHERE id = ?').bind(c.req.param('expenseId')).run()
  return c.body(null, 204)
})

// —— Documents ——

const MAX_DOC_BYTES = 2 * 1024 * 1024

resourceRoutes.get('/:apartmentId/documents', async (c) => {
  const apartment = await getOwnedApartment(c.env.DB, c.req.param('apartmentId'), c.get('userId'))
  if (!apartment) {
    return c.json({ error: 'Not found' }, 404)
  }

  const { results } = await c.env.DB.prepare(
    'SELECT * FROM documents WHERE apartment_id = ? ORDER BY uploaded_at DESC',
  )
    .bind(apartment.id)
    .all<DocumentRow>()

  return c.json((results ?? []).map(toDocumentDto))
})

resourceRoutes.post('/:apartmentId/documents', async (c) => {
  const apartment = await getOwnedApartment(c.env.DB, c.req.param('apartmentId'), c.get('userId'))
  if (!apartment) {
    return c.json({ error: 'Not found' }, 404)
  }

  const form = await c.req.formData()
  const title = String(form.get('title') || '').trim()
  const file = form.get('file')

  if (!title || !(file instanceof File)) {
    return c.json({ error: 'Title and file are required.' }, 400)
  }

  if (file.size > MAX_DOC_BYTES) {
    return c.json({ error: 'File exceeds 2MB limit.' }, 400)
  }

  const bytes = new Uint8Array(await file.arrayBuffer())
  const id = newId()
  const blobKey = c.env.FILES ? `docs/${apartment.id}/${id}` : `d1:${id}`

  const row: DocumentRow = {
    id,
    apartment_id: apartment.id,
    title,
    file_name: file.name || 'file',
    content_type: file.type || 'application/octet-stream',
    size_bytes: bytes.byteLength,
    blob_key: blobKey,
    uploaded_at: nowIso(),
  }

  await c.env.DB.prepare(
    `INSERT INTO documents (id, apartment_id, title, file_name, content_type, size_bytes, blob_key, uploaded_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      row.id,
      row.apartment_id,
      row.title,
      row.file_name,
      row.content_type,
      row.size_bytes,
      row.blob_key,
      row.uploaded_at,
    )
    .run()

  if (c.env.FILES) {
    await c.env.FILES.put(blobKey, bytes, {
      httpMetadata: { contentType: row.content_type },
    })
  } else {
    await c.env.DB.prepare('INSERT INTO document_blobs (document_id, data) VALUES (?, ?)')
      .bind(id, bytes)
      .run()
  }

  return c.json(toDocumentDto(row), 201)
})

resourceRoutes.get('/:apartmentId/documents/:documentId/download', async (c) => {
  const apartment = await getOwnedApartment(c.env.DB, c.req.param('apartmentId'), c.get('userId'))
  if (!apartment) {
    return c.json({ error: 'Not found' }, 404)
  }

  const doc = await c.env.DB.prepare(
    'SELECT * FROM documents WHERE id = ? AND apartment_id = ?',
  )
    .bind(c.req.param('documentId'), apartment.id)
    .first<DocumentRow>()
  if (!doc) {
    return c.json({ error: 'Not found' }, 404)
  }

  let bytes: ArrayBuffer | Uint8Array | null = null

  if (doc.blob_key.startsWith('d1:')) {
    const blob = await c.env.DB.prepare('SELECT data FROM document_blobs WHERE document_id = ?')
      .bind(doc.id)
      .first<{ data: ArrayBuffer }>()
    bytes = blob?.data ?? null
  } else if (c.env.FILES) {
    const obj = await c.env.FILES.get(doc.blob_key)
    bytes = obj ? await obj.arrayBuffer() : null
  }

  if (!bytes) {
    return c.json({ error: 'File missing' }, 404)
  }

  return new Response(bytes, {
    headers: {
      'Content-Type': doc.content_type,
      'Content-Disposition': `attachment; filename="${doc.file_name.replace(/"/g, '')}"`,
    },
  })
})

resourceRoutes.delete('/:apartmentId/documents/:documentId', async (c) => {
  const apartment = await getOwnedApartment(c.env.DB, c.req.param('apartmentId'), c.get('userId'))
  if (!apartment) {
    return c.json({ error: 'Not found' }, 404)
  }

  const doc = await c.env.DB.prepare(
    'SELECT * FROM documents WHERE id = ? AND apartment_id = ?',
  )
    .bind(c.req.param('documentId'), apartment.id)
    .first<DocumentRow>()
  if (!doc) {
    return c.json({ error: 'Not found' }, 404)
  }

  if (doc.blob_key.startsWith('d1:')) {
    await c.env.DB.prepare('DELETE FROM document_blobs WHERE document_id = ?').bind(doc.id).run()
  } else if (c.env.FILES) {
    await c.env.FILES.delete(doc.blob_key)
  }

  await c.env.DB.prepare('DELETE FROM documents WHERE id = ?').bind(doc.id).run()
  return c.body(null, 204)
})

// —— Linked calendars (iCal) ——

resourceRoutes.get('/:apartmentId/linked-calendars', async (c) => {
  const apartment = await getOwnedApartment(c.env.DB, c.req.param('apartmentId'), c.get('userId'))
  if (!apartment) {
    return c.json({ error: 'Not found' }, 404)
  }

  const { results } = await c.env.DB.prepare(
    'SELECT * FROM linked_calendars WHERE apartment_id = ? ORDER BY name COLLATE NOCASE',
  )
    .bind(apartment.id)
    .all<LinkedCalendarRow>()

  return c.json((results ?? []).map(toLinkedCalendarDto))
})

resourceRoutes.post('/:apartmentId/linked-calendars', async (c) => {
  const apartment = await getOwnedApartment(c.env.DB, c.req.param('apartmentId'), c.get('userId'))
  if (!apartment) {
    return c.json({ error: 'Not found' }, 404)
  }

  let body: { name?: string; url?: string } = {}
  try {
    body = await c.req.json()
  } catch {
    body = {}
  }

  if (!body.name?.trim() || !body.url?.trim()) {
    return c.json({ error: 'Name and URL are required.' }, 400)
  }

  const row: LinkedCalendarRow = {
    id: newId(),
    apartment_id: apartment.id,
    name: body.name.trim(),
    url: body.url.trim(),
    last_synced_at: null,
  }

  await c.env.DB.prepare(
    `INSERT INTO linked_calendars (id, apartment_id, name, url, last_synced_at) VALUES (?, ?, ?, ?, NULL)`,
  )
    .bind(row.id, row.apartment_id, row.name, row.url)
    .run()

  // Also upsert Booking/Airbnb integration config when URL looks like one
  const provider = row.url.includes('airbnb')
    ? 'Airbnb'
    : row.url.includes('booking.com')
      ? 'Booking'
      : null
  if (provider) {
    const existing = await c.env.DB.prepare(
      'SELECT id FROM integration_configurations WHERE apartment_id = ? AND provider = ?',
    )
      .bind(apartment.id, provider)
      .first()
    if (existing) {
      await c.env.DB.prepare(
        `UPDATE integration_configurations SET status = 'Active', ical_url = ?, last_synced_at = NULL WHERE id = ?`,
      )
        .bind(row.url, existing.id)
        .run()
    } else {
      await c.env.DB.prepare(
        `INSERT INTO integration_configurations
          (id, apartment_id, provider, status, external_property_id, ical_url, last_synced_at)
         VALUES (?, ?, ?, 'Active', NULL, ?, NULL)`,
      )
        .bind(newId(), apartment.id, provider, row.url)
        .run()
    }
  }

  return c.json(toLinkedCalendarDto(row), 201)
})

resourceRoutes.delete('/:apartmentId/linked-calendars/:calendarId', async (c) => {
  const apartment = await getOwnedApartment(c.env.DB, c.req.param('apartmentId'), c.get('userId'))
  if (!apartment) {
    return c.json({ error: 'Not found' }, 404)
  }

  const existing = await c.env.DB.prepare(
    'SELECT id FROM linked_calendars WHERE id = ? AND apartment_id = ?',
  )
    .bind(c.req.param('calendarId'), apartment.id)
    .first()
  if (!existing) {
    return c.json({ error: 'Not found' }, 404)
  }

  await c.env.DB.prepare('DELETE FROM linked_calendars WHERE id = ?')
    .bind(c.req.param('calendarId'))
    .run()
  return c.body(null, 204)
})

resourceRoutes.post('/:apartmentId/linked-calendars/:calendarId/sync', async (c) => {
  const apartment = await getOwnedApartment(c.env.DB, c.req.param('apartmentId'), c.get('userId'))
  if (!apartment) {
    return c.json({ error: 'Not found' }, 404)
  }

  try {
    const result = await syncLinkedCalendar(c.env.DB, apartment.id, c.req.param('calendarId'))
    return c.json(result)
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Sync failed' }, 400)
  }
})

resourceRoutes.get('/:apartmentId/integration-configurations', async (c) => {
  const apartment = await getOwnedApartment(c.env.DB, c.req.param('apartmentId'), c.get('userId'))
  if (!apartment) {
    return c.json({ error: 'Not found' }, 404)
  }

  const { results } = await c.env.DB.prepare(
    'SELECT id, apartment_id, provider, status, ical_url, last_synced_at FROM integration_configurations WHERE apartment_id = ?',
  )
    .bind(apartment.id)
    .all<{
      id: string
      apartment_id: string
      provider: string
      status: string
      ical_url: string | null
      last_synced_at: string | null
    }>()

  return c.json(
    (results ?? []).map((row) => ({
      id: row.id,
      apartmentId: row.apartment_id,
      provider: row.provider,
      status: row.status,
      icalUrl: row.ical_url,
      lastSyncedAt: row.last_synced_at,
    })),
  )
})
