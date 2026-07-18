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

export type Expense = {
  id: string
  apartmentId: string
  name: string
  description?: string | null
  date: string
  amount: number
  currency: string
}

export type DocumentItem = {
  id: string
  apartmentId: string
  title: string
  fileName: string
  contentType: string
  sizeBytes: number
  uploadedAt: string
}

export type LinkedCalendar = {
  id: string
  apartmentId: string
  name: string
  url: string
  lastSyncedAt?: string | null
}

export type IntegrationConfiguration = {
  id: string
  apartmentId: string
  provider: string
  status: string
  icalUrl?: string | null
  lastSyncedAt?: string | null
}

export type ReservationInput = {
  holdingName: string
  startDate: string
  endDate: string
  source?: string
  state?: string
  price?: number | null
  commission?: number | null
  currency?: string
  country?: string | null
  people?: number | null
}
