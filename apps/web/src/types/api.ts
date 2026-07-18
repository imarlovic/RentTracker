export type User = {
  id: string
  email: string
  firstName?: string | null
  lastName?: string | null
  pictureUrl?: string | null
}

export type AuthResponse = {
  accessToken: string
  expiresAt: string
  user: User
}

export type Apartment = {
  id: string
  name: string
  headerBlobKey?: string | null
  createdAt: string
}

export type Reservation = {
  id: string
  apartmentId: string
  state: string
  source: string
  holdingName: string
  startDate: string
  endDate: string
  price?: number | null
  commission?: number | null
  currency: string
  country?: string | null
  people?: number | null
}
