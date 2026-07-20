import axios from 'axios'
import { clearAuthSession, getAccessToken } from '@/lib/storage'
import type {
  Apartment,
  AuthResponse,
  DocumentItem,
  EmailConnection,
  EmailIngestEvent,
  Expense,
  IntegrationConfiguration,
  LinkedCalendar,
  Reservation,
  ReservationInput,
  User,
} from '@/types/api'

export const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuthSession()
      if (window.location.pathname !== '/login') {
        window.location.assign('/login')
      }
    }
    return Promise.reject(error)
  },
)

export async function signInWithGoogle(idToken: string): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/google', { idToken })
  return data
}

export async function fetchMe(): Promise<User> {
  const { data } = await api.get<User>('/auth/me')
  return data
}

export async function listApartments(): Promise<Apartment[]> {
  const { data } = await api.get<Apartment[]>('/apartments')
  return data
}

export async function createApartment(name: string): Promise<Apartment> {
  const { data } = await api.post<Apartment>('/apartments', { name })
  return data
}

export async function listReservations(apartmentId: string): Promise<Reservation[]> {
  const { data } = await api.get<Reservation[]>(`/apartments/${apartmentId}/reservations`)
  return data
}

export async function createReservation(apartmentId: string, input: ReservationInput) {
  const { data } = await api.post<Reservation>(`/apartments/${apartmentId}/reservations`, input)
  return data
}

export async function updateReservation(
  apartmentId: string,
  reservationId: string,
  input: ReservationInput,
) {
  const { data } = await api.put<Reservation>(
    `/apartments/${apartmentId}/reservations/${reservationId}`,
    input,
  )
  return data
}

export async function deleteReservation(apartmentId: string, reservationId: string) {
  await api.delete(`/apartments/${apartmentId}/reservations/${reservationId}`)
}

export async function listExpenses(apartmentId: string): Promise<Expense[]> {
  const { data } = await api.get<Expense[]>(`/apartments/${apartmentId}/expenses`)
  return data
}

export async function createExpense(
  apartmentId: string,
  input: { name: string; description?: string; date: string; amount: number; currency?: string },
) {
  const { data } = await api.post<Expense>(`/apartments/${apartmentId}/expenses`, input)
  return data
}

export async function deleteExpense(apartmentId: string, expenseId: string) {
  await api.delete(`/apartments/${apartmentId}/expenses/${expenseId}`)
}

export async function listDocuments(apartmentId: string): Promise<DocumentItem[]> {
  const { data } = await api.get<DocumentItem[]>(`/apartments/${apartmentId}/documents`)
  return data
}

export async function uploadDocument(apartmentId: string, title: string, file: File) {
  const form = new FormData()
  form.append('title', title)
  form.append('file', file)
  const { data } = await api.post<DocumentItem>(`/apartments/${apartmentId}/documents`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export async function deleteDocument(apartmentId: string, documentId: string) {
  await api.delete(`/apartments/${apartmentId}/documents/${documentId}`)
}

export function documentDownloadUrl(apartmentId: string, documentId: string) {
  return `/api/apartments/${apartmentId}/documents/${documentId}/download`
}

export async function listLinkedCalendars(apartmentId: string): Promise<LinkedCalendar[]> {
  const { data } = await api.get<LinkedCalendar[]>(`/apartments/${apartmentId}/linked-calendars`)
  return data
}

export async function createLinkedCalendar(apartmentId: string, name: string, url: string) {
  const { data } = await api.post<LinkedCalendar>(`/apartments/${apartmentId}/linked-calendars`, {
    name,
    url,
  })
  return data
}

export async function deleteLinkedCalendar(apartmentId: string, calendarId: string) {
  await api.delete(`/apartments/${apartmentId}/linked-calendars/${calendarId}`)
}

export async function syncLinkedCalendar(apartmentId: string, calendarId: string) {
  try {
    const { data } = await api.post<{ created: number; updated: number; canceled: number }>(
      `/apartments/${apartmentId}/linked-calendars/${calendarId}/sync`,
    )
    return data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = (error.response?.data as { error?: string } | undefined)?.error
      throw new Error(message || error.message)
    }
    throw error
  }
}

export async function listIntegrations(apartmentId: string): Promise<IntegrationConfiguration[]> {
  const { data } = await api.get<IntegrationConfiguration[]>(
    `/apartments/${apartmentId}/integration-configurations`,
  )
  return data
}

export async function listEmailConnections(apartmentId: string): Promise<EmailConnection[]> {
  const { data } = await api.get<EmailConnection[]>(`/apartments/${apartmentId}/email-connections`)
  return data
}

export async function listEmailIngestEvents(apartmentId: string): Promise<EmailIngestEvent[]> {
  const { data } = await api.get<EmailIngestEvent[]>(
    `/apartments/${apartmentId}/email-connections/events`,
  )
  return data
}

export async function startMailboxGmailConnect(
  apartmentId: string,
): Promise<{ authUrl: string; redirectUri: string }> {
  try {
    const { data } = await api.post<{ authUrl: string; redirectUri: string }>(
      `/apartments/${apartmentId}/email-connections/gmail/start`,
    )
    return data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = (error.response?.data as { error?: string } | undefined)?.error
      throw new Error(message || error.message)
    }
    throw error
  }
}

/** @deprecated Use startMailboxGmailConnect */
export const startBookingGmailConnect = startMailboxGmailConnect

export async function syncMailboxGmail(
  apartmentId: string,
  options?: {
    newerThanDays?: number
    maxMessages?: number
    clearSeen?: boolean
  },
) {
  try {
    const { data } = await api.post<{
      scanned: number
      listed?: number
      pages?: number
      ingested: number
      failed: number
      skipped?: number
      clearedSeen?: number
      newerThanDays?: number
      maxMessages?: number
      byProvider?: Partial<Record<'Booking' | 'Airbnb', number>>
    }>(`/apartments/${apartmentId}/email-connections/gmail/sync`, options ?? {})
    return data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = (error.response?.data as { error?: string } | undefined)?.error
      throw new Error(message || error.message)
    }
    throw error
  }
}

/** @deprecated Use syncMailboxGmail */
export const syncBookingGmail = syncMailboxGmail

export async function clearMailboxSeenMessages(apartmentId: string) {
  try {
    const { data } = await api.delete<{ cleared: number }>(
      `/apartments/${apartmentId}/email-connections/seen`,
    )
    return data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = (error.response?.data as { error?: string } | undefined)?.error
      throw new Error(message || error.message)
    }
    throw error
  }
}

export async function disconnectEmailConnection(apartmentId: string, connectionId: string) {
  await api.delete(`/apartments/${apartmentId}/email-connections/${connectionId}`)
}

export async function ingestMailboxEmailSample(
  apartmentId: string,
  payload: {
    subject?: string
    bodyText?: string
    fromAddress?: string
    messageId?: string
    provider?: 'Booking' | 'Airbnb'
  },
) {
  try {
    const { data } = await api.post<{
      parseStatus: string
      reservationId: string | null
      applyAction?: string
      provider?: string | null
      error?: string
    }>(`/apartments/${apartmentId}/email-connections/ingest`, payload)
    return data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = (error.response?.data as { error?: string } | undefined)?.error
      throw new Error(message || error.message)
    }
    throw error
  }
}

/** @deprecated Use ingestMailboxEmailSample */
export async function ingestBookingEmailSample(
  apartmentId: string,
  payload: { subject?: string; bodyText?: string; fromAddress?: string; messageId?: string },
  provider: 'Booking' | 'Airbnb' = 'Booking',
) {
  return ingestMailboxEmailSample(apartmentId, { ...payload, provider })
}

export async function getPushPublicKey(): Promise<string | null> {
  try {
    const { data } = await api.get<{ publicKey: string }>('/notifications/public-key')
    return data.publicKey
  } catch {
    return null
  }
}

export async function subscribePush(subscription: PushSubscriptionJSON) {
  await api.post('/notifications/subscribe', subscription)
}
