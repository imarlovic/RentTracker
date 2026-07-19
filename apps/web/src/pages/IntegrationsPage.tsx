import { useEffect, useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useApartmentContext } from '@/auth/ApartmentProvider'
import { RequireActiveApartment } from '@/components/RequireActiveApartment'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  createLinkedCalendar,
  deleteLinkedCalendar,
  disconnectEmailConnection,
  ingestBookingEmailSample,
  listEmailConnections,
  listEmailIngestEvents,
  listIntegrations,
  listLinkedCalendars,
  startBookingGmailConnect,
  syncBookingGmail,
  syncLinkedCalendar,
} from '@/lib/api'

function formatSyncTime(value?: string | null) {
  if (!value) {
    return 'never'
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }
  return date.toLocaleString()
}

function IntegrationsInner() {
  const { activeApartmentId } = useApartmentContext()
  const apartmentId = activeApartmentId!
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [syncMessage, setSyncMessage] = useState<string | null>(null)
  const [syncError, setSyncError] = useState<string | null>(null)
  const [sampleSubject, setSampleSubject] = useState(
    'New booking - Reservation confirmation 4839201745',
  )
  const [sampleBody, setSampleBody] = useState(
    `Guest name: Ana Petrovic
Check-in: 2026-08-12
Check-out: 2026-08-15
Reservation number: 4839201745
Total price: EUR 420.00
Commission: EUR 63.00
Adults: 2
Country: Croatia`,
  )
  const [gmailBanner, setGmailBanner] = useState<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const gmail = params.get('gmail')
    if (!gmail) {
      return
    }
    if (gmail === 'connected') {
      setGmailBanner('Booking Gmail connected. Initial sync may take a moment.')
    } else {
      setGmailBanner(`Gmail connect failed: ${params.get('reason') || 'unknown error'}`)
    }
    params.delete('gmail')
    params.delete('reason')
    const next = `${window.location.pathname}${params.toString() ? `?${params}` : ''}`
    window.history.replaceState({}, '', next)
  }, [])

  const calendarsQuery = useQuery({
    queryKey: ['linked-calendars', apartmentId],
    queryFn: () => listLinkedCalendars(apartmentId),
  })
  const integrationsQuery = useQuery({
    queryKey: ['integrations', apartmentId],
    queryFn: () => listIntegrations(apartmentId),
  })
  const emailConnectionsQuery = useQuery({
    queryKey: ['email-connections', apartmentId],
    queryFn: () => listEmailConnections(apartmentId),
  })
  const ingestEventsQuery = useQuery({
    queryKey: ['email-ingest-events', apartmentId],
    queryFn: () => listEmailIngestEvents(apartmentId),
  })

  const bookingGmail = (emailConnectionsQuery.data ?? []).find(
    (item) => item.kind === 'gmail' && item.provider === 'Booking',
  )

  const invalidateEmail = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['email-connections', apartmentId] }),
      queryClient.invalidateQueries({ queryKey: ['email-ingest-events', apartmentId] }),
      queryClient.invalidateQueries({ queryKey: ['integrations', apartmentId] }),
      queryClient.invalidateQueries({ queryKey: ['reservations', apartmentId] }),
    ])
  }

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
      setSyncError(null)
      setSyncMessage(
        `Synced: ${result.created} created, ${result.updated} updated, ${result.canceled} canceled`,
      )
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['reservations', apartmentId] }),
        queryClient.invalidateQueries({ queryKey: ['linked-calendars', apartmentId] }),
        queryClient.invalidateQueries({ queryKey: ['integrations', apartmentId] }),
      ])
    },
    onError: (error) => {
      setSyncMessage(null)
      setSyncError(error instanceof Error ? error.message : 'Sync failed')
      void queryClient.invalidateQueries({ queryKey: ['linked-calendars', apartmentId] })
      void queryClient.invalidateQueries({ queryKey: ['integrations', apartmentId] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (calendarId: string) => deleteLinkedCalendar(apartmentId, calendarId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['linked-calendars', apartmentId] })
    },
  })

  const connectGmailMutation = useMutation({
    mutationFn: () => startBookingGmailConnect(apartmentId),
    onSuccess: ({ authUrl }) => {
      window.location.assign(authUrl)
    },
    onError: (error) => {
      setGmailBanner(error instanceof Error ? error.message : 'Could not start Gmail connect')
    },
  })

  const syncGmailMutation = useMutation({
    mutationFn: () => syncBookingGmail(apartmentId),
    onSuccess: async (result) => {
      setSyncMessage(
        `Gmail sync: scanned ${result.scanned}, ingested ${result.ingested}, failed ${result.failed}`,
      )
      await invalidateEmail()
    },
    onError: (error) => {
      setSyncError(error instanceof Error ? error.message : 'Gmail sync failed')
    },
  })

  const disconnectMutation = useMutation({
    mutationFn: (connectionId: string) => disconnectEmailConnection(apartmentId, connectionId),
    onSuccess: async () => {
      setGmailBanner('Booking Gmail disconnected.')
      await invalidateEmail()
    },
  })

  const sampleIngestMutation = useMutation({
    mutationFn: () =>
      ingestBookingEmailSample(apartmentId, {
        subject: sampleSubject,
        bodyText: sampleBody,
        fromAddress: 'noreply@booking.com',
      }),
    onSuccess: async (result) => {
      setSyncMessage(
        `Sample ingest: ${result.applyAction || result.parseStatus}` +
          (result.reservationId ? ` → ${result.reservationId}` : '') +
          (result.error ? ` (${result.error})` : ''),
      )
      await invalidateEmail()
    },
    onError: (error) => {
      setSyncError(error instanceof Error ? error.message : 'Sample ingest failed')
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
          Sync Airbnb / Booking via iCal, and enrich Booking stays from a separate Gmail inbox
          (can differ from your login Google account).
        </p>
      </div>

      {gmailBanner && <p className="text-sm text-primary">{gmailBanner}</p>}
      {syncMessage && <p className="text-sm text-primary">{syncMessage}</p>}
      {syncError && <p className="text-sm text-destructive">{syncError}</p>}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Booking Gmail inbox</CardTitle>
          <CardDescription>
            Connect the Google account that receives Booking.com host emails. This is independent of
            the account you use to sign in to RentTracker.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {bookingGmail ? (
            <div className="space-y-2 rounded-lg border px-3 py-3 text-sm">
              <p>
                <span className="font-medium">{bookingGmail.mailboxEmail}</span>
                <span className="text-muted-foreground"> · {bookingGmail.status}</span>
              </p>
              <p className="text-xs text-muted-foreground">
                Last sync: {formatSyncTime(bookingGmail.lastSyncedAt)}
              </p>
              {bookingGmail.lastSyncError && (
                <p className="text-xs text-destructive">{bookingGmail.lastSyncError}</p>
              )}
              <div className="flex flex-wrap gap-2 pt-1">
                <Button
                  type="button"
                  size="sm"
                  onClick={() => syncGmailMutation.mutate()}
                  disabled={syncGmailMutation.isPending}
                >
                  Sync Gmail now
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => connectGmailMutation.mutate()}
                  disabled={connectGmailMutation.isPending}
                >
                  Reconnect…
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => disconnectMutation.mutate(bookingGmail.id)}
                  disabled={disconnectMutation.isPending}
                >
                  Disconnect
                </Button>
              </div>
            </div>
          ) : (
            <Button
              type="button"
              onClick={() => connectGmailMutation.mutate()}
              disabled={connectGmailMutation.isPending}
            >
              {connectGmailMutation.isPending ? 'Starting…' : 'Connect Booking Gmail…'}
            </Button>
          )}

          <div className="space-y-2 border-t pt-3">
            <p className="text-sm font-medium">Paste a sample Booking email</p>
            <p className="text-xs text-muted-foreground">
              Useful for testing parsing before OAuth is fully configured.
            </p>
            <Input
              value={sampleSubject}
              onChange={(e) => setSampleSubject(e.target.value)}
              placeholder="Subject"
            />
            <textarea
              className="min-h-28 w-full rounded-md border bg-background px-3 py-2 text-sm"
              value={sampleBody}
              onChange={(e) => setSampleBody(e.target.value)}
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => sampleIngestMutation.mutate()}
              disabled={sampleIngestMutation.isPending}
            >
              Ingest sample
            </Button>
          </div>

          {(ingestEventsQuery.data ?? []).length > 0 && (
            <div className="space-y-2 border-t pt-3">
              <p className="text-sm font-medium">Recent email ingest</p>
              {(ingestEventsQuery.data ?? []).slice(0, 8).map((event) => (
                <div key={event.id} className="rounded-md border px-3 py-2 text-xs">
                  <p className="font-medium">{event.subject || '(no subject)'}</p>
                  <p className="text-muted-foreground">
                    {event.parseStatus}
                    {event.reservationId ? ` · reservation ${event.reservationId.slice(0, 8)}…` : ''}
                    {' · '}
                    {formatSyncTime(event.createdAt)}
                  </p>
                  {event.parseError && <p className="text-destructive">{event.parseError}</p>}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

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
              placeholder="Name (e.g. Booking.com)"
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

      <div className="space-y-2">
        {(calendarsQuery.data ?? []).map((calendar) => (
          <Card key={calendar.id}>
            <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
              <div className="min-w-0">
                <p className="font-medium">{calendar.name}</p>
                <p className="truncate text-sm text-muted-foreground">{calendar.url}</p>
                <p className="text-xs text-muted-foreground">
                  Last sync: {formatSyncTime(calendar.lastSyncedAt)}
                </p>
                {calendar.lastSyncError && (
                  <p className="text-xs text-destructive">Last error: {calendar.lastSyncError}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    setSyncError(null)
                    syncMutation.mutate(calendar.id)
                  }}
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
          <CardDescription>
            Filled automatically when an iCal URL matches Airbnb or Booking. Status updates after
            each sync.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {(integrationsQuery.data ?? []).length === 0 && (
            <p className="text-sm text-muted-foreground">No platform configs yet.</p>
          )}
          {(integrationsQuery.data ?? []).map((item) => (
            <div key={item.id} className="rounded-lg border px-3 py-2 text-sm">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="font-medium">{item.provider}</span>
                <span className="text-muted-foreground">· {item.status}</span>
                <span className="text-xs text-muted-foreground">
                  · Last sync: {formatSyncTime(item.lastSyncedAt)}
                </span>
              </div>
              {item.lastSyncError && (
                <p className="mt-1 text-xs text-destructive">{item.lastSyncError}</p>
              )}
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
