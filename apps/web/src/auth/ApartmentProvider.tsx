import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { getActiveApartmentId, setActiveApartmentId } from '@/lib/storage'
import type { Apartment } from '@/types/api'

type ApartmentContextValue = {
  activeApartmentId: string | null
  setActiveApartment: (apartment: Apartment | null) => void
}

const ApartmentContext = createContext<ApartmentContextValue | null>(null)

export function ApartmentProvider({ children }: { children: ReactNode }) {
  const [activeApartmentId, setId] = useState<string | null>(() => getActiveApartmentId())

  const value = useMemo(
    () => ({
      activeApartmentId,
      setActiveApartment: (apartment: Apartment | null) => {
        const next = apartment?.id ?? null
        setActiveApartmentId(next)
        setId(next)
      },
    }),
    [activeApartmentId],
  )

  return <ApartmentContext.Provider value={value}>{children}</ApartmentContext.Provider>
}

export function useApartmentContext() {
  const ctx = useContext(ApartmentContext)
  if (!ctx) {
    throw new Error('useApartmentContext must be used within ApartmentProvider')
  }
  return ctx
}
