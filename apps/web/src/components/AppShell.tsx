import { NavLink, Outlet } from 'react-router-dom'
import { Building2, CalendarDays, ChartColumn, FileText, LogOut, Plug, Receipt, Rows3 } from 'lucide-react'
import { useAuth } from '@/auth/AuthProvider'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const links = [
  { to: '/upcoming', label: 'Upcoming', icon: Rows3 },
  { to: '/apartments', label: 'Apartments', icon: Building2 },
  { to: '/calendar', label: 'Calendar', icon: CalendarDays },
  { to: '/expenses', label: 'Expenses', icon: Receipt },
  { to: '/documents', label: 'Documents', icon: FileText },
  { to: '/business-analysis', label: 'Statistics', icon: ChartColumn },
  { to: '/integrations', label: 'Integrations', icon: Plug },
]

export function AppShell() {
  const { user, signOut } = useAuth()

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-6xl flex-col gap-6 px-4 py-6 md:px-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">RentTracker</p>
          <h1 className="text-2xl font-semibold tracking-tight">Property operations</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right text-sm">
            <p className="font-medium">{user?.firstName ?? user?.email}</p>
            <p className="text-muted-foreground">{user?.email}</p>
          </div>
          <Button variant="outline" size="icon" onClick={signOut} aria-label="Sign out">
            <LogOut />
          </Button>
        </div>
      </header>

      <nav className="flex flex-wrap gap-2 border-b pb-3">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground',
                isActive && 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground',
              )
            }
          >
            <Icon className="size-4" />
            {label}
          </NavLink>
        ))}
      </nav>

      <main className="flex-1 pb-10">
        <Outlet />
      </main>
    </div>
  )
}
