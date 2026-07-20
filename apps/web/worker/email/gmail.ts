import { SignJWT, jwtVerify } from 'jose'
import type { Env } from '../env'
import { decryptSecret, encryptSecret } from './crypto'

const GMAIL_SCOPE = 'https://www.googleapis.com/auth/gmail.readonly email openid'

export type GmailOAuthState = {
  userId: string
  apartmentId: string
  nonce: string
  provider: 'Booking' | 'Airbnb'
}

function secretKey(env: Env) {
  return new TextEncoder().encode(env.JWT_SECRET)
}

export function requireGoogleOAuthConfig(env: Env): { clientId: string; clientSecret: string } {
  const clientId = env.GOOGLE_CLIENT_ID
  const clientSecret = env.GOOGLE_CLIENT_SECRET
  if (!clientId || clientId.startsWith('REPLACE_')) {
    throw new Error('GOOGLE_CLIENT_ID is not configured')
  }
  if (!clientSecret) {
    throw new Error('GOOGLE_CLIENT_SECRET is not configured')
  }
  return { clientId, clientSecret }
}

export async function createGmailOAuthState(env: Env, state: GmailOAuthState): Promise<string> {
  return new SignJWT(state)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuer(env.JWT_ISSUER || 'renttracker')
    .setAudience('renttracker-gmail-oauth')
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(secretKey(env))
}

export async function verifyGmailOAuthState(env: Env, token: string): Promise<GmailOAuthState> {
  const { payload } = await jwtVerify(token, secretKey(env), {
    issuer: env.JWT_ISSUER || 'renttracker',
    audience: 'renttracker-gmail-oauth',
  })
  if (
    typeof payload.userId !== 'string' ||
    typeof payload.apartmentId !== 'string' ||
    typeof payload.nonce !== 'string'
  ) {
    throw new Error('Invalid OAuth state')
  }
  const provider = payload.provider === 'Airbnb' ? 'Airbnb' : 'Booking'
  return {
    userId: payload.userId,
    apartmentId: payload.apartmentId,
    nonce: payload.nonce,
    provider,
  }
}

export function buildGmailAuthUrl(input: {
  clientId: string
  redirectUri: string
  state: string
}): string {
  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth')
  url.searchParams.set('client_id', input.clientId)
  url.searchParams.set('redirect_uri', input.redirectUri)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('scope', GMAIL_SCOPE)
  url.searchParams.set('access_type', 'offline')
  url.searchParams.set('prompt', 'select_account consent')
  url.searchParams.set('include_granted_scopes', 'true')
  url.searchParams.set('state', input.state)
  return url.toString()
}

export async function exchangeGmailCode(
  env: Env,
  code: string,
  redirectUri: string,
): Promise<{
  accessToken: string
  refreshToken: string | null
  expiresIn: number
  email: string
}> {
  const { clientId, clientSecret } = requireGoogleOAuthConfig(env)
  const body = new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: 'authorization_code',
  })
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
  if (!tokenRes.ok) {
    const text = await tokenRes.text()
    throw new Error(`Google token exchange failed (${tokenRes.status}): ${text.slice(0, 200)}`)
  }
  const json = (await tokenRes.json()) as {
    access_token?: string
    refresh_token?: string
    expires_in?: number
    id_token?: string
  }
  if (!json.access_token) {
    throw new Error('Google token response missing access_token')
  }

  const profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${json.access_token}` },
  })
  if (!profileRes.ok) {
    throw new Error('Failed to load Google profile for Gmail mailbox')
  }
  const profile = (await profileRes.json()) as { email?: string }
  if (!profile.email) {
    throw new Error('Google profile missing email')
  }

  return {
    accessToken: json.access_token,
    refreshToken: json.refresh_token ?? null,
    expiresIn: json.expires_in ?? 3600,
    email: profile.email,
  }
}

export async function refreshGmailAccessToken(
  env: Env,
  refreshToken: string,
): Promise<{ accessToken: string; expiresIn: number }> {
  const { clientId, clientSecret } = requireGoogleOAuthConfig(env)
  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
  })
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
  if (!tokenRes.ok) {
    const text = await tokenRes.text()
    throw new Error(`Google refresh failed (${tokenRes.status}): ${text.slice(0, 200)}`)
  }
  const json = (await tokenRes.json()) as { access_token?: string; expires_in?: number }
  if (!json.access_token) {
    throw new Error('Google refresh response missing access_token')
  }
  return { accessToken: json.access_token, expiresIn: json.expires_in ?? 3600 }
}

export async function sealToken(env: Env, value: string): Promise<string> {
  return encryptSecret(env.JWT_SECRET, value)
}

export async function openToken(env: Env, value: string): Promise<string> {
  return decryptSecret(env.JWT_SECRET, value)
}

export type GmailMessageListItem = { id: string; threadId: string }

export async function listOtaMessages(
  accessToken: string,
  provider: 'Booking' | 'Airbnb',
  newerThanDays = 45,
): Promise<GmailMessageListItem[]> {
  const query =
    provider === 'Airbnb'
      ? [
          'from:(airbnb.com OR airbnb.co)',
          `(reservation OR confirmation OR cancelled OR canceled OR altered OR modified`,
          `OR "confirmation code" OR check-in OR checkout OR "check out" OR guest OR payout OR earnings)`,
          `newer_than:${newerThanDays}d`,
        ].join(' ')
      : [
          'from:(booking.com OR mchat.booking.com)',
          `(reservation OR rezervacij OR booking OR cancelled OR canceled OR storno OR otkaz`,
          `OR confirmation OR potvrda OR prijava OR check-in OR "Broj rezervacije"`,
          `OR "Booking number" OR "Confirmation number" OR "Ime gosta" OR "Guest name"`,
          `OR "poruku od gosta" OR "request has been confirmed")`,
          `newer_than:${newerThanDays}d`,
        ].join(' ')

  const url = new URL('https://gmail.googleapis.com/gmail/v1/users/me/messages')
  url.searchParams.set('q', query)
  url.searchParams.set('maxResults', '50')
  const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Gmail list failed (${res.status}): ${text.slice(0, 200)}`)
  }
  const json = (await res.json()) as { messages?: GmailMessageListItem[] }
  return json.messages ?? []
}

/** @deprecated Use listOtaMessages(..., 'Booking') */
export async function listBookingMessages(
  accessToken: string,
  newerThanDays = 45,
): Promise<GmailMessageListItem[]> {
  return listOtaMessages(accessToken, 'Booking', newerThanDays)
}

type GmailHeader = { name: string; value: string }
type GmailPart = {
  mimeType?: string
  filename?: string
  body?: { data?: string; size?: number }
  parts?: GmailPart[]
}

function decodeBase64Url(data: string): string {
  const padded = data.replace(/-/g, '+').replace(/_/g, '/')
  const pad = padded.length % 4 === 0 ? '' : '='.repeat(4 - (padded.length % 4))
  const binary = atob(padded + pad)
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

function collectParts(
  part: GmailPart | undefined,
  acc: { text: string[]; html: string[] },
): void {
  if (!part) {
    return
  }
  if (part.body?.data) {
    const decoded = decodeBase64Url(part.body.data)
    if (part.mimeType === 'text/plain') {
      acc.text.push(decoded)
    } else if (part.mimeType === 'text/html') {
      acc.html.push(decoded)
    }
  }
  for (const child of part.parts ?? []) {
    collectParts(child, acc)
  }
}

export async function getGmailMessage(
  accessToken: string,
  messageId: string,
): Promise<{
  id: string
  subject: string
  from: string
  receivedAt: string | null
  bodyText: string
  bodyHtml: string
}> {
  const url = new URL(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages/${encodeURIComponent(messageId)}`,
  )
  url.searchParams.set('format', 'full')
  const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Gmail get failed (${res.status}): ${text.slice(0, 200)}`)
  }
  const json = (await res.json()) as {
    id: string
    internalDate?: string
    payload?: GmailPart & { headers?: GmailHeader[] }
  }
  const headers = json.payload?.headers ?? []
  const subject = headers.find((h) => h.name.toLowerCase() === 'subject')?.value ?? ''
  const from = headers.find((h) => h.name.toLowerCase() === 'from')?.value ?? ''
  const bodies = { text: [] as string[], html: [] as string[] }
  collectParts(json.payload, bodies)
  return {
    id: json.id,
    subject,
    from,
    receivedAt: json.internalDate
      ? new Date(Number(json.internalDate)).toISOString()
      : null,
    bodyText: bodies.text.join('\n'),
    bodyHtml: bodies.html.join('\n'),
  }
}

export function gmailRedirectUri(requestUrl: string): string {
  const url = new URL(requestUrl)
  return `${url.origin}/api/auth/gmail/callback`
}

export function integrationsRedirect(origin: string, query: Record<string, string>): string {
  const url = new URL('/integrations', origin)
  for (const [key, value] of Object.entries(query)) {
    url.searchParams.set(key, value)
  }
  return url.toString()
}
