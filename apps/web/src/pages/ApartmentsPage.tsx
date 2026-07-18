import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useApartmentContext } from '@/auth/ApartmentProvider'
import { createApartment, listApartments } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export function ApartmentsPage() {
  const queryClient = useQueryClient()
  const { activeApartmentId, setActiveApartment } = useApartmentContext()
  const [name, setName] = useState('')

  const apartmentsQuery = useQuery({
    queryKey: ['apartments'],
    queryFn: listApartments,
  })

  const createMutation = useMutation({
    mutationFn: createApartment,
    onSuccess: async (apartment) => {
      setName('')
      setActiveApartment(apartment)
      await queryClient.invalidateQueries({ queryKey: ['apartments'] })
    },
  })

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!name.trim()) {
      return
    }
    createMutation.mutate(name.trim())
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Apartments</h2>
        <p className="text-sm text-muted-foreground">
          Select an active accommodation unit to unlock reservations and other modules.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Add apartment</CardTitle>
          <CardDescription>Thesis R2 — multiple smještajne jedinice.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-3 sm:flex-row" onSubmit={onSubmit}>
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Apartment name"
              required
            />
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Saving…' : 'Create'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2">
        {apartmentsQuery.isLoading && <p className="text-sm text-muted-foreground">Loading apartments…</p>}
        {apartmentsQuery.data?.map((apartment) => {
          const active = apartment.id === activeApartmentId
          return (
            <button
              key={apartment.id}
              type="button"
              onClick={() => setActiveApartment(apartment)}
              className={cn(
                'rounded-xl border bg-card p-4 text-left transition hover:border-primary',
                active && 'border-primary ring-2 ring-primary/30',
              )}
            >
              <p className="font-medium">{apartment.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {active ? 'Active unit' : 'Click to make active'}
              </p>
            </button>
          )
        })}
      </div>
    </div>
  )
}
