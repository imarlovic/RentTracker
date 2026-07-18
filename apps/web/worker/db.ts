export function newId(): string {
  return crypto.randomUUID()
}

export function nowIso(): string {
  return new Date().toISOString()
}

export type UserRow = {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  picture_url: string | null
  google_subject: string
  created_at: string
  last_login_at: string
}

export type ApartmentRow = {
  id: string
  name: string
  owner_id: string
  header_blob_key: string | null
  created_at: string
}

export type ReservationRow = {
  id: string
  apartment_id: string
  state: string
  external_id: string | null
  reference: string | null
  booking_date: string | null
  start_date: string
  end_date: string
  source: string
  holding_name: string
  people: number | null
  adults: number | null
  children: number | null
  infants: number | null
  price: number | null
  commission: number | null
  currency: string
  country: string | null
}

export function toUserDto(row: UserRow) {
  return {
    id: row.id,
    email: row.email,
    firstName: row.first_name,
    lastName: row.last_name,
    pictureUrl: row.picture_url,
  }
}

export function toApartmentDto(row: ApartmentRow) {
  return {
    id: row.id,
    name: row.name,
    headerBlobKey: row.header_blob_key,
    createdAt: row.created_at,
  }
}

export function toReservationDto(row: ReservationRow) {
  return {
    id: row.id,
    apartmentId: row.apartment_id,
    state: row.state,
    source: row.source,
    holdingName: row.holding_name,
    startDate: row.start_date,
    endDate: row.end_date,
    price: row.price,
    commission: row.commission,
    currency: row.currency,
    country: row.country,
    people: row.people,
  }
}
