import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useApartmentContext } from '@/auth/ApartmentProvider'
import { RequireActiveApartment } from '@/components/RequireActiveApartment'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { createExpense, deleteExpense, listExpenses } from '@/lib/api'

function ExpensesInner() {
  const { activeApartmentId } = useApartmentContext()
  const apartmentId = activeApartmentId!
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')

  const expensesQuery = useQuery({
    queryKey: ['expenses', apartmentId],
    queryFn: () => listExpenses(apartmentId),
  })

  const createMutation = useMutation({
    mutationFn: () =>
      createExpense(apartmentId, {
        name: name.trim(),
        date,
        amount: Number(amount),
        description: description.trim() || undefined,
        currency: 'EUR',
      }),
    onSuccess: async () => {
      setName('')
      setAmount('')
      setDescription('')
      await queryClient.invalidateQueries({ queryKey: ['expenses', apartmentId] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteExpense(apartmentId, id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['expenses', apartmentId] })
    },
  })

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    createMutation.mutate()
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Expenses</h2>
        <p className="text-sm text-muted-foreground">Track costs for the active unit (thesis R4).</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Add expense</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 sm:grid-cols-2" onSubmit={onSubmit}>
            <Input required placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input required type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            <Input
              required
              type="number"
              step="0.01"
              placeholder="Amount (EUR)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <Input
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <Button type="submit" className="sm:col-span-2" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Saving…' : 'Add expense'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {(expensesQuery.data ?? []).map((expense) => (
          <Card key={expense.id}>
            <CardContent className="flex items-center justify-between gap-3 py-4">
              <div>
                <p className="font-medium">{expense.name}</p>
                <p className="text-sm text-muted-foreground">
                  {expense.date}
                  {expense.description ? ` · ${expense.description}` : ''}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-medium">
                  {expense.amount.toFixed(2)} {expense.currency}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => deleteMutation.mutate(expense.id)}
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export function ExpensesPage() {
  return (
    <RequireActiveApartment>
      <ExpensesInner />
    </RequireActiveApartment>
  )
}
