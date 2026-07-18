export type Env = {
  DB: D1Database
  FILES?: R2Bucket
  GOOGLE_CLIENT_ID: string
  JWT_SECRET: string
  JWT_ISSUER: string
  JWT_AUDIENCE: string
  VAPID_PUBLIC_KEY?: string
  VAPID_PRIVATE_KEY?: string
  VAPID_SUBJECT?: string
}

export type Variables = {
  userId: string
}
