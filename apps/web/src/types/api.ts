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
  reference?: string | null
  bookingDate?: string | null
  price?: number | null
  commission?: number | null
  currency: string
  country?: string | null
  people?: number | null
  adults?: number | null
  children?: number | null
}

export type EmailConnection = {
  id: string
  apartmentId: string
  kind: string
  provider: string
  mailboxEmail: string
  status: string
  lastSyncedAt?: string | null
  lastSyncError?: string | null
  historyImportedAt?: string | null
  createdAt: string
}

export type EmailIngestEvent = {
  id: string
  messageId: string
  fromAddress?: string | null
  subject?: string | null
  receivedAt?: string | null
  parseStatus: string
  parseError?: string | null
  reservationId?: string | null
  createdAt: string
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
  lastSyncError?: string | null
}

export type IntegrationConfiguration = {
  id: string
  apartmentId: string
  provider: string
  status: string
  icalUrl?: string | null
  lastSyncedAt?: string | null
  lastSyncError?: string | null
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
