import { Navigate } from 'react-router-dom'
import { useApartmentContext } from '@/auth/ApartmentProvider'
import type { ReactNode } from 'react'

export function RequireActiveApartment({ children }: { children: ReactNode }) {
  const { activeApartmentId } = useApartmentContext()
  if (!activeApartmentId) {
    return <Navigate to="/apartments" replace />
  }
  return children
}
