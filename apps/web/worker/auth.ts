import { createRemoteJWKSet, jwtVerify, SignJWT } from 'jose'
import type { Env } from './env'

const googleJwks = createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'))

export type GoogleUser = {
  subject: string
  email: string
  givenName?: string
  familyName?: string
  pictureUrl?: string
}

export async function verifyGoogleIdToken(idToken: string, clientId: string): Promise<GoogleUser> {
  const { payload } = await jwtVerify(idToken, googleJwks, {
    audience: clientId,
    issuer: ['https://accounts.google.com', 'accounts.google.com'],
  })

  if (typeof payload.sub !== 'string' || typeof payload.email !== 'string') {
    throw new Error('Google token missing required claims')
  }

  return {
    subject: payload.sub,
    email: payload.email,
    givenName: typeof payload.given_name === 'string' ? payload.given_name : undefined,
    familyName: typeof payload.family_name === 'string' ? payload.family_name : undefined,
    pictureUrl: typeof payload.picture === 'string' ? payload.picture : undefined,
  }
}

function getSecretKey(secret: string) {
  return new TextEncoder().encode(secret)
}

export async function createAppJwt(
  env: Env,
  user: { id: string; email: string; googleSubject: string; firstName?: string | null; lastName?: string | null },
  expiryDays = 7,
): Promise<{ token: string; expiresAt: string }> {
  if (!env.JWT_SECRET || env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters')
  }

  const expiresAt = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000)

  const token = await new SignJWT({
    email: user.email,
    google_sub: user.googleSubject,
    given_name: user.firstName ?? undefined,
    family_name: user.lastName ?? undefined,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(user.id)
    .setIssuer(env.JWT_ISSUER || 'renttracker')
    .setAudience(env.JWT_AUDIENCE || 'renttracker-web')
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(getSecretKey(env.JWT_SECRET))

  return { token, expiresAt: expiresAt.toISOString() }
}

export async function verifyAppJwt(env: Env, token: string): Promise<{ userId: string }> {
  const { payload } = await jwtVerify(token, getSecretKey(env.JWT_SECRET), {
    issuer: env.JWT_ISSUER || 'renttracker',
    audience: env.JWT_AUDIENCE || 'renttracker-web',
  })

  if (typeof payload.sub !== 'string') {
    throw new Error('Invalid token subject')
  }

  return { userId: payload.sub }
}
