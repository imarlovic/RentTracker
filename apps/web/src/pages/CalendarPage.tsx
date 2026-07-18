import { useMemo, useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { useApartmentContext } from '@/auth/ApartmentProvider'
import { RequireActiveApartment } from '@/components/RequireActiveApartment'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import {
  createReservation,
  deleteReservation,
  listReservations,
  updateReservation,
} from '@/lib/api'
import { cn } from '@/lib/utils'
import type { Reservation, ReservationInput } from '@/types/api'

function monthLabel(year: number, month: number) {
  return new Date(year, month, 1).toLocaleString(undefined, { month: 'long', year: 'numeric' })
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function overlapsDay(r: Reservation, isoDay: string) {
  return r.state === 'Active' && r.startDate <= isoDay && isoDay < r.endDate
}

const emptyForm: ReservationInput = {
  holdingName: '',
  startDate: '',
  endDate: '',
  source: 'RentTracker',
  price: null,
  currency: 'EUR',
  country: '',
  people: null,
}

function CalendarInner() {
  const { activeApartmentId } = useApartmentContext()
  const apartmentId = activeApartmentId!
  const queryClient = useQueryClient()
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Reservation | null>(null)
  const [form, setForm] = useState<ReservationInput>(emptyForm)

  const reservationsQuery = useQuery({
    queryKey: ['reservations', apartmentId],
    queryFn: () => listReservations(apartmentId),
  })

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editing) {
        return updateReservation(apartmentId, editing.id, form)
      }
      return createReservation(apartmentId, form)
    },
    onSuccess: async () => {
      setModalOpen(false)
      setEditing(null)
      setForm(emptyForm)
      await queryClient.invalidateQueries({ queryKey: ['reservations', apartmentId] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => deleteReservation(apartmentId, id),
    onSuccess: async () => {
      setModalOpen(false)
      setEditing(null)
      await queryClient.invalidateQueries({ queryKey: ['reservations', apartmentId] })
    },
  })

  const firstWeekday = new Date(year, month, 1).getDay()
  const totalDays = daysInMonth(year, month)
  const cells = useMemo(() => {
    const list: Array<{ day: number | null; iso: string | null }> = []
    for (let i = 0; i < firstWeekday; i++) {
      list.push({ day: null, iso: null })
    }
    for (let d = 1; d <= totalDays; d++) {
      const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      list.push({ day: d, iso })
    }
    return list
  }, [firstWeekday, totalDays, year, month])

  const openCreate = (iso?: string) => {
    setEditing(null)
    setForm({
      ...emptyForm,
      startDate: iso || '',
      endDate: iso || '',
    })
    setModalOpen(true)
  }

  const openEdit = (reservation: Reservation) => {
    setEditing(reservation)
    setForm({
      holdingName: reservation.holdingName,
      startDate: reservation.startDate,
      endDate: reservation.endDate,
      source: reservation.source,
      state: reservation.state,
      price: reservation.price ?? null,
      commission: reservation.commission ?? null,
      currency: reservation.currency,
      country: reservation.country ?? '',
      people: reservation.people ?? null,
    })
    setModalOpen(true)
  }

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    saveMutation.mutate()
  }

  const shiftMonth = (delta: number) => {
    const date = new Date(year, month + delta, 1)
    setYear(date.getFullYear())
    setMonth(date.getMonth())
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Calendar</h2>
          <p className="text-sm text-muted-foreground">Reservations for the active unit (thesis R3).</p>
        </div>
        <Button type="button" onClick={() => openCreate()}>
          <Plus /> Add reservation
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-lg">{monthLabel(year, month)}</CardTitle>
          <div className="flex gap-2">
            <Button type="button" size="icon" variant="outline" onClick={() => shiftMonth(-1)}>
              <ChevronLeft />
            </Button>
            <Button type="button" size="icon" variant="outline" onClick={() => shiftMonth(1)}>
              <ChevronRight />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {cells.map((cell, index) => {
              const dayReservations =
                cell.iso && reservationsQuery.data
                  ? reservationsQuery.data.filter((r) => overlapsDay(r, cell.iso!))
                  : []
              return (
                <button
                  key={index}
                  type="button"
                  disabled={!cell.day}
                  onClick={() => cell.iso && openCreate(cell.iso)}
                  className={cn(
                    'min-h-24 rounded-md border p-1 text-left align-top text-xs',
                    cell.day ? 'bg-card hover:border-primary' : 'border-transparent bg-transparent',
                  )}
                >
                  {cell.day && <div className="mb-1 font-medium">{cell.day}</div>}
                  <div className="space-y-1">
                    {dayReservations.slice(0, 3).map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        className="block w-full truncate rounded bg-primary/15 px-1 py-0.5 text-left text-[10px] text-primary"
                        onClick={(event) => {
                          event.stopPropagation()
                          openEdit(r)
                        }}
                      >
                        {r.holdingName}
                      </button>
                    ))}
                  </div>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">All reservations</CardTitle>
          <CardDescription>Click a row to edit.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {(reservationsQuery.data ?? []).map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => openEdit(r)}
              className="flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm hover:border-primary"
            >
              <span>
                <span className="font-medium">{r.holdingName}</span>
                <span className="text-muted-foreground">
                  {' '}
                  · {r.startDate} → {r.endDate} · {r.source} · {r.state}
                </span>
              </span>
              <span className="text-muted-foreground">
                {r.price != null ? `${r.price} ${r.currency}` : '—'}
              </span>
            </button>
          ))}
        </CardContent>
      </Card>

      <Modal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={editing ? 'Edit reservation' : 'New reservation'}
      >
        <form className="space-y-3" onSubmit={onSubmit}>
          <Input
            required
            placeholder="Guest / holding name"
            value={form.holdingName}
            onChange={(e) => setForm((f) => ({ ...f, holdingName: e.target.value }))}
          />
          <div className="grid grid-cols-2 gap-2">
            <Input
              required
              type="date"
              value={form.startDate}
              onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
            />
            <Input
              required
              type="date"
              value={form.endDate}
              onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <select
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              value={form.source || 'RentTracker'}
              onChange={(e) => setForm((f) => ({ ...f, source: e.target.value }))}
            >
              {['RentTracker', 'Airbnb', 'Booking', 'Other'].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <Input
              type="number"
              placeholder="Price"
              value={form.price ?? ''}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  price: e.target.value === '' ? null : Number(e.target.value),
                }))
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="Country"
              value={form.country ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
            />
            <Input
              type="number"
              placeholder="Guests"
              value={form.people ?? ''}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  people: e.target.value === '' ? null : Number(e.target.value),
                }))
              }
            />
          </div>
          <div className="flex justify-between gap-2 pt-2">
            {editing ? (
              <Button
                type="button"
                variant="destructive"
                onClick={() => deleteMutation.mutate(editing.id)}
                disabled={deleteMutation.isPending}
              >
                Delete
              </Button>
            ) : (
              <span />
            )}
            <Button type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export function CalendarPage() {
  return (
    <RequireActiveApartment>
      <CalendarInner />
    </RequireActiveApartment>
  )
}
