import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '@/components/AppShell'
import { RequireAuth } from '@/components/RequireAuth'
import { ApartmentsPage } from '@/pages/ApartmentsPage'
import { LoginPage } from '@/pages/LoginPage'
import { PlaceholderPage } from '@/pages/PlaceholderPage'
import { UpcomingPage } from '@/pages/UpcomingPage'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<RequireAuth />}>
          <Route element={<AppShell />}>
            <Route index element={<Navigate to="/upcoming" replace />} />
            <Route path="/upcoming" element={<UpcomingPage />} />
            <Route path="/apartments" element={<ApartmentsPage />} />
            <Route
              path="/calendar"
              element={
                <PlaceholderPage
                  title="Calendar"
                  description="Reservation calendar CRUD lands next — thesis R3."
                />
              }
            />
            <Route
              path="/expenses"
              element={
                <PlaceholderPage title="Expenses" description="Expense tracking per unit — thesis R4." />
              }
            />
            <Route
              path="/documents"
              element={
                <PlaceholderPage
                  title="Documents"
                  description="Document archive with blob storage — thesis R4."
                />
              }
            />
            <Route
              path="/business-analysis"
              element={
                <PlaceholderPage
                  title="Statistics"
                  description="Income, expense, and distribution charts — thesis R5."
                />
              }
            />
            <Route
              path="/integrations"
              element={
                <PlaceholderPage
                  title="Integrations"
                  description="Airbnb / Booking sync (iCal-first) — thesis R6."
                />
              }
            />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
