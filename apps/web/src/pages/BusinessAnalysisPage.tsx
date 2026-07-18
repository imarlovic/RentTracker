import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useApartmentContext } from '@/auth/ApartmentProvider'
import { RequireActiveApartment } from '@/components/RequireActiveApartment'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { listExpenses, listReservations } from '@/lib/api'

const COLORS = ['#0f766e', '#1d4ed8', '#b45309', '#be123c', '#7c3aed', '#334155']

function BusinessInner() {
  const { activeApartmentId } = useApartmentContext()
  const apartmentId = activeApartmentId!

  const reservationsQuery = useQuery({
    queryKey: ['reservations', apartmentId],
    queryFn: () => listReservations(apartmentId),
  })
  const expensesQuery = useQuery({
    queryKey: ['expenses', apartmentId],
    queryFn: () => listExpenses(apartmentId),
  })

  const charts = useMemo(() => {
    const reservations = (reservationsQuery.data ?? []).filter((r) => r.state === 'Active')
    const expenses = expensesQuery.data ?? []

    const monthly = new Map<string, { month: string; income: number; expenses: number; profit: number }>()

    for (const r of reservations) {
      const key = r.startDate.slice(0, 7)
      const row = monthly.get(key) ?? { month: key, income: 0, expenses: 0, profit: 0 }
      row.income += Number(r.price ?? 0) - Number(r.commission ?? 0)
      monthly.set(key, row)
    }
    for (const e of expenses) {
      const key = e.date.slice(0, 7)
      const row = monthly.get(key) ?? { month: key, income: 0, expenses: 0, profit: 0 }
      row.expenses += Number(e.amount)
      monthly.set(key, row)
    }
    const monthlyRows = [...monthly.values()]
      .map((row) => ({ ...row, profit: row.income - row.expenses }))
      .sort((a, b) => a.month.localeCompare(b.month))

    const bySource = new Map<string, number>()
    const byCountry = new Map<string, number>()
    for (const r of reservations) {
      bySource.set(r.source, (bySource.get(r.source) ?? 0) + 1)
      const country = r.country?.trim() || 'Unknown'
      byCountry.set(country, (byCountry.get(country) ?? 0) + 1)
    }

    return {
      monthlyRows,
      sourceRows: [...bySource.entries()].map(([name, value]) => ({ name, value })),
      countryRows: [...byCountry.entries()].map(([name, value]) => ({ name, value })),
    }
  }, [reservationsQuery.data, expensesQuery.data])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Business analysis</h2>
        <p className="text-sm text-muted-foreground">
          Income, expenses, and reservation distribution (thesis R5).
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Monthly income vs expenses</CardTitle>
          <CardDescription>Earnings use price − commission.</CardDescription>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={charts.monthlyRows}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="income" fill="#0f766e" name="Income" />
              <Bar dataKey="expenses" fill="#b45309" name="Expenses" />
              <Bar dataKey="profit" fill="#1d4ed8" name="Profit" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">By source</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={charts.sourceRows} dataKey="value" nameKey="name" outerRadius={90} label>
                  {charts.sourceRows.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">By country</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={charts.countryRows} dataKey="value" nameKey="name" outerRadius={90} label>
                  {charts.countryRows.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export function BusinessAnalysisPage() {
  return (
    <RequireActiveApartment>
      <BusinessInner />
    </RequireActiveApartment>
  )
}
