import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '@/components/AppShell'
import { RequireAuth } from '@/components/RequireAuth'
import { ApartmentsPage } from '@/pages/ApartmentsPage'
import { BusinessAnalysisPage } from '@/pages/BusinessAnalysisPage'
import { CalendarPage } from '@/pages/CalendarPage'
import { DocumentsPage } from '@/pages/DocumentsPage'
import { ExpensesPage } from '@/pages/ExpensesPage'
import { IntegrationsPage } from '@/pages/IntegrationsPage'
import { LoginPage } from '@/pages/LoginPage'
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
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/expenses" element={<ExpensesPage />} />
            <Route path="/documents" element={<DocumentsPage />} />
            <Route path="/business-analysis" element={<BusinessAnalysisPage />} />
            <Route path="/integrations" element={<IntegrationsPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
