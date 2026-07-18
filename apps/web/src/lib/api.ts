import axios from 'axios'
import { clearAuthSession, getAccessToken } from '@/lib/storage'
import type { Apartment, AuthResponse, Reservation, User } from '@/types/api'

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
