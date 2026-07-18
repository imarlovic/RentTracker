export type Env = {
  DB: D1Database
  FILES: R2Bucket
  GOOGLE_CLIENT_ID: string
  JWT_SECRET: string
  JWT_ISSUER: string
  JWT_AUDIENCE: string
}

export type Variables = {
  userId: string
}
