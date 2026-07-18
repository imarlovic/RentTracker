import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useApartmentContext } from '@/auth/ApartmentProvider'
import { RequireActiveApartment } from '@/components/RequireActiveApartment'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  createLinkedCalendar,
  deleteLinkedCalendar,
  listIntegrations,
  listLinkedCalendars,
  syncLinkedCalendar,
} from '@/lib/api'

function IntegrationsInner() {
  const { activeApartmentId } = useApartmentContext()
  const apartmentId = activeApartmentId!
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [syncMessage, setSyncMessage] = useState<string | null>(null)

  const calendarsQuery = useQuery({
    queryKey: ['linked-calendars', apartmentId],
    queryFn: () => listLinkedCalendars(apartmentId),
  })
  const integrationsQuery = useQuery({
    queryKey: ['integrations', apartmentId],
    queryFn: () => listIntegrations(apartmentId),
  })

  const createMutation = useMutation({
    mutationFn: () => createLinkedCalendar(apartmentId, name.trim(), url.trim()),
    onSuccess: async () => {
      setName('')
      setUrl('')
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['linked-calendars', apartmentId] }),
        queryClient.invalidateQueries({ queryKey: ['integrations', apartmentId] }),
      ])
    },
  })

  const syncMutation = useMutation({
    mutationFn: (calendarId: string) => syncLinkedCalendar(apartmentId, calendarId),
    onSuccess: async (result) => {
      setSyncMessage(
        `Synced: ${result.created} created, ${result.updated} updated, ${result.canceled} canceled`,
      )
      await queryClient.invalidateQueries({ queryKey: ['reservations', apartmentId] })
      await queryClient.invalidateQueries({ queryKey: ['linked-calendars', apartmentId] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (calendarId: string) => deleteLinkedCalendar(apartmentId, calendarId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['linked-calendars', apartmentId] })
    },
  })

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    createMutation.mutate()
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Integrations</h2>
        <p className="text-sm text-muted-foreground">
          Sync Airbnb / Booking reservations via iCal feeds (thesis R6).
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Add linked calendar</CardTitle>
          <CardDescription>
            Paste an export iCal URL from Airbnb or Booking.com. Sync imports events as reservations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3" onSubmit={onSubmit}>
            <Input
              required
              placeholder="Name (e.g. Airbnb)"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              required
              type="url"
              placeholder="https://…/.ics"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Saving…' : 'Add calendar'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {syncMessage && <p className="text-sm text-primary">{syncMessage}</p>}

      <div className="space-y-2">
        {(calendarsQuery.data ?? []).map((calendar) => (
          <Card key={calendar.id}>
            <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
              <div className="min-w-0">
                <p className="font-medium">{calendar.name}</p>
                <p className="truncate text-sm text-muted-foreground">{calendar.url}</p>
                <p className="text-xs text-muted-foreground">
                  Last sync: {calendar.lastSyncedAt ?? 'never'}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={() => syncMutation.mutate(calendar.id)}
                  disabled={syncMutation.isPending}
                >
                  Sync now
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => deleteMutation.mutate(calendar.id)}
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Detected platforms</CardTitle>
          <CardDescription>Filled automatically when an iCal URL matches Airbnb or Booking.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {(integrationsQuery.data ?? []).length === 0 && (
            <p className="text-sm text-muted-foreground">No platform configs yet.</p>
          )}
          {(integrationsQuery.data ?? []).map((item) => (
            <div key={item.id} className="rounded-lg border px-3 py-2 text-sm">
              <span className="font-medium">{item.provider}</span>
              <span className="text-muted-foreground"> · {item.status}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

export function IntegrationsPage() {
  return (
    <RequireActiveApartment>
      <IntegrationsInner />
    </RequireActiveApartment>
  )
}
