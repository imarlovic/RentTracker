import type { ApartmentRow } from './db'

export async function getOwnedApartment(db: D1Database, apartmentId: string, userId: string) {
  return db
    .prepare('SELECT * FROM apartments WHERE id = ? AND owner_id = ?')
    .bind(apartmentId, userId)
    .first<ApartmentRow>()
}
