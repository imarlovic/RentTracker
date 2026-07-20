import { SignJWT, jwtVerify } from 'jose'
import type { Env } from '../env'
import { decryptSecret, encryptSecret } from './crypto'

const GMAIL_SCOPE = 'https://www.googleapis.com/auth/gmail.readonly email openid'

export type GmailOAuthState = {
  userId: string
  apartmentId: string
  nonce: string
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
  return {
    userId: payload.userId,
    apartmentId: payload.apartmentId,
    nonce: payload.nonce,
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

export type ListMailboxOptions = {
  newerThanDays?: number
  maxResults?: number
  /** Max messages to inspect across pages (includes already-seen). Default: max(maxResults*10, 200). */
  maxScan?: number
  pageToken?: string
}

/** Gmail search focused on reservation confirmations / changes, not marketing noise. */
export function buildMailboxSearchQuery(newerThanDays: number): string {
  const days = Math.min(365, Math.max(1, Math.floor(newerThanDays)))

  // Provider-specific subject filters beat a broad keyword OR-list that matches
  // reviews, security alerts, and promo digests.
  const airbnb = [
    'from:(automated@airbnb.com OR airbnb.com OR airbnb.co)',
    '(',
    'subject:("Rezervacija je potvrđena" OR "Reservation confirmed" OR "Booking confirmed"',
    'OR "Reservation canceled" OR "Reservation cancelled" OR "Reservation altered"',
    'OR "Reservation modified" OR "confirmation code" OR Konfirmacijski OR dolazi OR arrives)',
    'OR "konfirmacijski kod" OR "confirmation code" OR "potvrđena je nova rezervacija"',
    ')',
  ].join(' ')

  const booking = [
    'from:(noreply@booking.com OR no-reply@booking.com OR noreply@mchat.booking.com OR mchat.booking.com OR properties.booking.com)',
    '(',
    'subject:("New booking" OR "Reservation confirmation" OR "Modified reservation"',
    'OR "has been cancelled" OR "has been canceled" OR "request has been confirmed"',
    'OR "Nova rezervacija" OR "Broj rezervacije" OR "Reservation cancelled"',
    'OR "Reservation canceled" OR potvrđen OR potvrden)',
    'OR "Broj rezervacije" OR "Confirmation number" OR "Booking number" OR "reservation number"',
    ')',
  ].join(' ')

  // Drop high-volume noise that still comes from OTA domains.
  const exclude = [
    '-from:(partneraccountsecurity@booking.com OR security@booking.com)',
    '-subject:(zvjezdica OR "left a review" OR "gave you" OR "5 star" OR "5-star"',
    'OR Security OR "sign-in" OR "sign in" OR "New sign-in" OR newsletter',
    'OR Povećajte OR "stopu klikanja" OR cjenika OR "Mjesečni pregled"',
    'OR Pretvorite OR "transaction history" OR "Vaša zarada ovaj" OR "weekly earnings")',
  ].join(' ')

  return `((${airbnb}) OR (${booking})) ${exclude} newer_than:${days}d`
}

type ListPageResult = {
  messages: GmailMessageListItem[]
  nextPageToken: string | null
}

export async function listMailboxMessagesPage(
  accessToken: string,
  query: string,
  pageSize: number,
  pageToken?: string,
): Promise<ListPageResult> {
  const url = new URL('https://gmail.googleapis.com/gmail/v1/users/me/messages')
  url.searchParams.set('q', query)
  url.searchParams.set('maxResults', String(Math.min(100, Math.max(1, pageSize))))
  if (pageToken) {
    url.searchParams.set('pageToken', pageToken)
  }
  const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Gmail list failed (${res.status}): ${text.slice(0, 200)}`)
  }
  const json = (await res.json()) as {
    messages?: GmailMessageListItem[]
    nextPageToken?: string
  }
  return {
    messages: json.messages ?? [],
    nextPageToken: json.nextPageToken ?? null,
  }
}

/**
 * List host-mail candidates for Booking + Airbnb from one mailbox.
 * Paginates until `maxResults` messages are collected or `maxScan` ids were listed.
 */
export async function listMailboxMessages(
  accessToken: string,
  options: ListMailboxOptions | number = {},
): Promise<GmailMessageListItem[]> {
  const result = await listMailboxMessagesPaginated(accessToken, options)
  return result.messages
}

export async function listMailboxMessagesPaginated(
  accessToken: string,
  options: ListMailboxOptions | number = {},
): Promise<{
  messages: GmailMessageListItem[]
  listed: number
  pages: number
  query: string
}> {
  const opts: ListMailboxOptions = typeof options === 'number' ? { newerThanDays: options } : options
  const newerThanDays = Math.min(365, Math.max(1, Math.floor(opts.newerThanDays ?? 45)))
  const maxResults = Math.min(200, Math.max(1, Math.floor(opts.maxResults ?? 50)))
  const maxScan = Math.min(
    500,
    Math.max(maxResults, Math.floor(opts.maxScan ?? Math.max(maxResults * 10, 200))),
  )
  const query = buildMailboxSearchQuery(newerThanDays)

  const messages: GmailMessageListItem[] = []
  let pageToken: string | undefined = opts.pageToken
  let listed = 0
  let pages = 0

  while (messages.length < maxResults && listed < maxScan) {
    const pageSize = Math.min(100, maxScan - listed, maxResults - messages.length + 50)
    const page = await listMailboxMessagesPage(accessToken, query, pageSize, pageToken)
    pages += 1
    listed += page.messages.length
    for (const item of page.messages) {
      messages.push(item)
      if (messages.length >= maxResults) {
        break
      }
    }
    if (!page.nextPageToken || page.messages.length === 0) {
      break
    }
    pageToken = page.nextPageToken
  }

  return { messages, listed, pages, query }
}

/** @deprecated Use listMailboxMessages */
export async function listOtaMessages(
  accessToken: string,
  _provider: 'Booking' | 'Airbnb',
  newerThanDays = 45,
): Promise<GmailMessageListItem[]> {
  return listMailboxMessages(accessToken, { newerThanDays })
}

/** @deprecated Use listMailboxMessages */
export async function listBookingMessages(
  accessToken: string,
  newerThanDays = 45,
): Promise<GmailMessageListItem[]> {
  return listMailboxMessages(accessToken, { newerThanDays })
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
