import { useEffect, useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useApartmentContext } from '@/auth/ApartmentProvider'
import { RequireActiveApartment } from '@/components/RequireActiveApartment'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import type { EmailConnection, EmailIngestEvent } from '@/types/api'
import {
  clearMailboxSeenMessages,
  createLinkedCalendar,
  deleteLinkedCalendar,
  disconnectEmailConnection,
  importMailboxHistoryBatched,
  ingestMailboxEmailSample,
  listEmailConnections,
  listEmailIngestEvents,
  listIntegrations,
  listLinkedCalendars,
  startMailboxGmailConnect,
  syncLinkedCalendar,
  syncMailboxGmail,
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

const SAMPLE_SUBJECT = 'New booking - Reservation confirmation 4839201745'
const SAMPLE_BODY = `Guest name: Ana Petrovic
Check-in: 2026-08-12
Check-out: 2026-08-15
Reservation number: 4839201745
Total price: EUR 420.00
Commission: EUR 63.00
Adults: 2
Country: Croatia`

function MailboxCard({
  connection,
  apartmentId,
  onBanner,
  onMessage,
  onError,
  invalidate,
  events,
}: {
  connection?: EmailConnection
  apartmentId: string
  onBanner: (value: string | null) => void
  onMessage: (value: string | null) => void
  onError: (value: string | null) => void
  invalidate: () => Promise<void>
  events: EmailIngestEvent[]
}) {
  const [sampleSubject, setSampleSubject] = useState(SAMPLE_SUBJECT)
  const [sampleBody, setSampleBody] = useState(SAMPLE_BODY)
  const [newerThanDays, setNewerThanDays] = useState(45)
  const [maxMessages, setMaxMessages] = useState(50)
  const [clearSeen, setClearSeen] = useState(false)
  const [historyDays, setHistoryDays] = useState(180)
  const [historyMaxMessages, setHistoryMaxMessages] = useState(300)

  const connectMutation = useMutation({
    mutationFn: () => startMailboxGmailConnect(apartmentId),
    onSuccess: ({ authUrl }) => {
      window.location.assign(authUrl)
    },
    onError: (error) => {
      onBanner(error instanceof Error ? error.message : 'Could not start Gmail connect')
    },
  })

  const formatSyncResult = (
    label: string,
    result: {
      newerThanDays?: number
      maxMessages?: number
      listed?: number
      pages?: number
      scanned: number
      ingested: number
      failed: number
      clearedSeen?: number
      byProvider?: Partial<Record<'Booking' | 'Airbnb', number>>
    },
    fallbackDays: number,
    fallbackMax: number,
  ) => {
    const byProvider = result.byProvider
      ? Object.entries(result.byProvider)
          .map(([provider, count]) => `${provider}: ${count}`)
          .join(', ')
      : null
    return (
      `${label} (${result.newerThanDays ?? fallbackDays}d / max ${result.maxMessages ?? fallbackMax}` +
      (result.listed != null ? `, listed ${result.listed}` : '') +
      (result.pages != null ? `/${result.pages}p` : '') +
      `): scanned ${result.scanned}, ingested ${result.ingested}, failed ${result.failed}` +
      (result.clearedSeen ? `, cleared ${result.clearedSeen} seen` : '') +
      (byProvider ? ` (${byProvider})` : '')
    )
  }

  const syncMutation = useMutation({
    mutationFn: () =>
      syncMailboxGmail(apartmentId, {
        newerThanDays,
        maxMessages,
        clearSeen,
      }),
    onSuccess: async (result) => {
      onMessage(formatSyncResult('Mailbox sync', result, newerThanDays, maxMessages))
      setClearSeen(false)
      await invalidate()
    },
    onError: (error) => {
      onError(error instanceof Error ? error.message : 'Mailbox sync failed')
    },
  })

  const historyMutation = useMutation({
    mutationFn: () =>
      importMailboxHistoryBatched(apartmentId, {
        newerThanDays: historyDays,
        maxMessages: historyMaxMessages,
        onProgress: (round, partial) => {
          onMessage(
            `History import round ${round}: scanned ${partial.scanned}, ingested ${partial.ingested}` +
              (partial.hasMore ? '… continuing' : ''),
          )
        },
      }),
    onSuccess: async (result) => {
      onMessage(
        formatSyncResult(
          `History import (${result.rounds} batch${result.rounds === 1 ? '' : 'es'})`,
          result,
          historyDays,
          historyMaxMessages,
        ),
      )
      await invalidate()
    },
    onError: (error) => {
      onError(error instanceof Error ? error.message : 'History import failed')
    },
  })

  const clearSeenMutation = useMutation({
    mutationFn: () => clearMailboxSeenMessages(apartmentId),
    onSuccess: async (result) => {
      onMessage(`Cleared ${result.cleared} already-seen message id(s). Next sync can re-parse them.`)
      await invalidate()
    },
    onError: (error) => {
      onError(error instanceof Error ? error.message : 'Could not clear seen messages')
    },
  })

  const disconnectMutation = useMutation({
    mutationFn: (connectionId: string) => disconnectEmailConnection(apartmentId, connectionId),
    onSuccess: async () => {
      onBanner('Mailbox disconnected.')
      await invalidate()
    },
  })

  const sampleIngestMutation = useMutation({
    mutationFn: () =>
      ingestMailboxEmailSample(apartmentId, {
        subject: sampleSubject,
        bodyText: sampleBody,
      }),
    onSuccess: async (result) => {
      onMessage(
        `Sample${result.provider ? ` (${result.provider})` : ''}: ${result.applyAction || result.parseStatus}` +
          (result.reservationId ? ` → ${result.reservationId}` : '') +
          (result.error ? ` (${result.error})` : ''),
      )
      await invalidate()
    },
    onError: (error) => {
      onError(error instanceof Error ? error.message : 'Sample ingest failed')
    },
  })

  const busy =
    syncMutation.isPending ||
    historyMutation.isPending ||
    clearSeenMutation.isPending ||
    disconnectMutation.isPending

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Reservation mailbox</CardTitle>
        <CardDescription>
          Connect the Google account that receives Booking.com and Airbnb host emails. One mailbox
          covers both — RentTracker detects the provider per message.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {connection ? (
          <div className="space-y-3 rounded-lg border px-3 py-3 text-sm">
            <div className="space-y-2">
              <p>
                <span className="font-medium">{connection.mailboxEmail}</span>
                <span className="text-muted-foreground"> · {connection.status}</span>
              </p>
              <p className="text-xs text-muted-foreground">
                Last sync: {formatSyncTime(connection.lastSyncedAt)}
              </p>
              <p className="text-xs text-muted-foreground">
                History import: {formatSyncTime(connection.historyImportedAt)}
              </p>
              {connection.lastSyncError && (
                <p className="text-xs text-destructive">{connection.lastSyncError}</p>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-1 text-xs">
                <span className="text-muted-foreground">Lookback (days)</span>
                <Input
                  type="number"
                  min={1}
                  max={365}
                  value={newerThanDays}
                  onChange={(e) => setNewerThanDays(Number(e.target.value) || 1)}
                />
              </label>
              <label className="space-y-1 text-xs">
                <span className="text-muted-foreground">Max messages</span>
                <Input
                  type="number"
                  min={1}
                  max={200}
                  value={maxMessages}
                  onChange={(e) => setMaxMessages(Number(e.target.value) || 1)}
                />
              </label>
            </div>

            <label className="flex items-start gap-2 text-xs">
              <input
                type="checkbox"
                className="mt-0.5"
                checked={clearSeen}
                onChange={(e) => setClearSeen(e.target.checked)}
              />
              <span>
                Clear already-seen message ids before sync (re-parse previously ingested mail)
              </span>
            </label>

            <div className="flex flex-wrap gap-2 pt-1">
              <Button
                type="button"
                size="sm"
                onClick={() => syncMutation.mutate()}
                disabled={busy}
              >
                {syncMutation.isPending ? 'Syncing…' : 'Sync mailbox now'}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => clearSeenMutation.mutate()}
                disabled={busy}
              >
                {clearSeenMutation.isPending ? 'Clearing…' : 'Clear seen only'}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => connectMutation.mutate()}
                disabled={busy || connectMutation.isPending}
              >
                Reconnect…
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => disconnectMutation.mutate(connection.id)}
                disabled={busy}
              >
                Disconnect
              </Button>
            </div>

            <div className="space-y-2 border-t pt-3">
              <p className="text-sm font-medium">Import history (one-time)</p>
              <p className="text-xs text-muted-foreground">
                Deeper scan for past Booking/Airbnb confirmations. Uses a tight Gmail filter so
                reviews and promo mail are skipped. Safe to re-run; already-seen ids are skipped.
              </p>
              <div className="flex flex-wrap gap-2">
                {[90, 180, 365].map((days) => (
                  <Button
                    key={days}
                    type="button"
                    size="sm"
                    variant={historyDays === days ? 'default' : 'outline'}
                    onClick={() => setHistoryDays(days)}
                    disabled={busy}
                  >
                    {days}d
                  </Button>
                ))}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-1 text-xs">
                  <span className="text-muted-foreground">History lookback (days)</span>
                  <Input
                    type="number"
                    min={1}
                    max={365}
                    value={historyDays}
                    onChange={(e) => setHistoryDays(Number(e.target.value) || 1)}
                  />
                </label>
                <label className="space-y-1 text-xs">
                  <span className="text-muted-foreground">History max messages</span>
                  <Input
                    type="number"
                    min={1}
                    max={500}
                    value={historyMaxMessages}
                    onChange={(e) => setHistoryMaxMessages(Number(e.target.value) || 1)}
                  />
                </label>
              </div>
              <Button
                type="button"
                size="sm"
                onClick={() => historyMutation.mutate()}
                disabled={busy}
              >
                {historyMutation.isPending ? 'Importing…' : 'Import mailbox history'}
              </Button>
            </div>
          </div>
        ) : (
          <Button
            type="button"
            onClick={() => connectMutation.mutate()}
            disabled={connectMutation.isPending}
          >
            {connectMutation.isPending ? 'Starting…' : 'Connect Gmail mailbox…'}
          </Button>
        )}

        <div className="space-y-2 border-t pt-3">
          <p className="text-sm font-medium">Paste a sample Booking or Airbnb email</p>
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

        {events.length > 0 && (
          <div className="space-y-2 border-t pt-3">
            <p className="text-sm font-medium">Recent email ingest</p>
            {events.slice(0, 8).map((event) => (
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
  )
}

function IntegrationsInner() {
  const { activeApartmentId } = useApartmentContext()
  const apartmentId = activeApartmentId!
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [syncMessage, setSyncMessage] = useState<string | null>(null)
  const [syncError, setSyncError] = useState<string | null>(null)
  const [gmailBanner, setGmailBanner] = useState<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const gmail = params.get('gmail')
    if (!gmail) {
      return
    }
    if (gmail === 'connected') {
      setGmailBanner('Mailbox connected. Initial sync may take a moment.')
    } else {
      setGmailBanner(`Gmail connect failed: ${params.get('reason') || 'unknown error'}`)
    }
    params.delete('gmail')
    params.delete('reason')
    params.delete('provider')
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

  const mailbox = (emailConnectionsQuery.data ?? []).find((item) => item.kind === 'gmail')

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

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    createMutation.mutate()
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Integrations</h2>
        <p className="text-sm text-muted-foreground">
          Sync Airbnb / Booking via iCal, and enrich stays from one Gmail mailbox that receives host
          mail from both platforms.
        </p>
      </div>

      {gmailBanner && <p className="text-sm text-primary">{gmailBanner}</p>}
      {syncMessage && <p className="text-sm text-primary">{syncMessage}</p>}
      {syncError && <p className="text-sm text-destructive">{syncError}</p>}

      <MailboxCard
        connection={mailbox}
        apartmentId={apartmentId}
        onBanner={setGmailBanner}
        onMessage={setSyncMessage}
        onError={setSyncError}
        invalidate={invalidateEmail}
        events={ingestEventsQuery.data ?? []}
      />

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
            Filled automatically when an iCal URL or mailbox matches Airbnb or Booking.
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
