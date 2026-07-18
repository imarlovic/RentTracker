import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { signInWithGoogle } from '@/lib/api'
import {
  clearAuthSession,
  getAccessToken,
  getStoredUserJson,
  setAuthSession,
} from '@/lib/storage'
import type { User } from '@/types/api'

type AuthContextValue = {
  user: User | null
  isAuthenticated: boolean
  signIn: (idToken: string) => Promise<void>
  signOut: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function readInitialUser(): User | null {
  const token = getAccessToken()
  const raw = getStoredUserJson()
  if (!token || !raw) {
    return null
  }
  try {
    return JSON.parse(raw) as User
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => readInitialUser())

  const signIn = useCallback(async (idToken: string) => {
    const response = await signInWithGoogle(idToken)
    setAuthSession(response.accessToken, JSON.stringify(response.user))
    setUser(response.user)
  }, [])

  const signOut = useCallback(() => {
    clearAuthSession()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      signIn,
      signOut,
    }),
    [user, signIn, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
