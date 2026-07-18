const TOKEN_KEY = 'renttracker.accessToken'
const USER_KEY = 'renttracker.user'
const ACTIVE_APARTMENT_KEY = 'renttracker.activeApartmentId'

export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setAuthSession(token: string, userJson: string) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, userJson)
}

export function clearAuthSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export function getStoredUserJson(): string | null {
  return localStorage.getItem(USER_KEY)
}

export function getActiveApartmentId(): string | null {
  return localStorage.getItem(ACTIVE_APARTMENT_KEY)
}

export function setActiveApartmentId(id: string | null) {
  if (id) {
    localStorage.setItem(ACTIVE_APARTMENT_KEY, id)
  } else {
    localStorage.removeItem(ACTIVE_APARTMENT_KEY)
  }
}
