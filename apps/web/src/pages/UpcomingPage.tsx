import { useQuery } from '@tanstack/react-query'
import { Navigate } from 'react-router-dom'
import { useApartmentContext } from '@/auth/ApartmentProvider'
import { listReservations } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function UpcomingPage() {
  const { activeApartmentId } = useApartmentContext()

  if (!activeApartmentId) {
    return <Navigate to="/apartments" replace />
  }

  const reservationsQuery = useQuery({
    queryKey: ['reservations', activeApartmentId],
    queryFn: () => listReservations(activeApartmentId),
  })

  const today = new Date().toISOString().slice(0, 10)
  const upcoming =
    reservationsQuery.data
      ?.filter((r) => r.state === 'Active' && r.endDate >= today)
      .sort((a, b) => a.startDate.localeCompare(b.startDate)) ?? []

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Upcoming reservations</h2>
        <p className="text-sm text-muted-foreground">
          Current bookings for the active accommodation unit.
        </p>
      </div>

      {reservationsQuery.isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}

      <div className="space-y-3">
        {upcoming.length === 0 && !reservationsQuery.isLoading && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">No upcoming stays</CardTitle>
              <CardDescription>Create reservations from Calendar, or sync integrations later.</CardDescription>
            </CardHeader>
          </Card>
        )}

        {upcoming.map((reservation) => (
          <Card key={reservation.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{reservation.holdingName}</CardTitle>
              <CardDescription>
                {reservation.startDate} → {reservation.endDate} · {reservation.source}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {reservation.people ? `${reservation.people} guests` : 'Guests n/a'}
              {reservation.country ? ` · ${reservation.country}` : ''}
              {reservation.price != null ? ` · ${reservation.price} ${reservation.currency}` : ''}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
