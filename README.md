# RentTracker 2.0

Short-term rental manager rewritten for **Cloudflare-first** deployment (VoidZero / Vite + Workers).

## Stack

| Layer | Technology |
|-------|------------|
| Tooling | Vite + `@cloudflare/vite-plugin` (workerd in dev) |
| UI | React + TypeScript + shadcn/ui + Tailwind + PWA |
| API | Cloudflare Worker (Hono) |
| Auth | Google Sign-In → app JWT (`jose`) |
| Database | Cloudflare D1 |
| Files | Cloudflare R2 |
| Deploy | `vite build` → `wrangler deploy` |

## Repository layout

```
apps/web/          Vite SPA + Worker API (single deployable unit)
  src/             React client
  worker/          /api/* Worker (auth, apartments, reservations)
  migrations/      D1 SQL migrations
  wrangler.jsonc   Workers / D1 / R2 / assets config
legacy/            Original 1.x ASP.NET + Vue app (reference)
```

## Prerequisites

- Node.js 22+
- Cloudflare account (for remote D1/R2/deploy)
- Google OAuth Web client ID

## Quick start (local)

```bash
cd apps/web
cp .env.example .env
cp .dev.vars.example .dev.vars
# Set VITE_GOOGLE_CLIENT_ID and GOOGLE_CLIENT_ID to the same OAuth client ID
# JWT_SECRET must be >= 32 characters

npm install
npm run db:migrate:local
npm run dev
```

Open `http://localhost:5173`. The Vite Cloudflare plugin serves the SPA and runs the Worker in **workerd**; `/api/*` is handled by the Worker first.

## Cloudflare setup

1. Create a D1 database and put its id in `wrangler.jsonc` → `d1_databases[0].database_id`
2. Create an R2 bucket named `renttracker-files` (or update `bucket_name`)
3. Set secrets:

```bash
npx wrangler secret put JWT_SECRET
```

4. Set `GOOGLE_CLIENT_ID` in `wrangler.jsonc` `vars` (or as a secret)
5. Apply migrations and deploy:

```bash
npm run db:migrate:remote
npm run deploy
```

## Auth flow

1. Browser Google Identity Services → Google ID token
2. `POST /api/auth/google` verifies the token (Google JWKS) and upserts the user in D1
3. Worker returns an HS256 app JWT
4. Client sends `Authorization: Bearer <token>` on API calls
5. Apartment-scoped routes require `owner_id == JWT sub`

## Thesis feature map

| Requirement | Status |
|-------------|--------|
| R1 Google auth | Done |
| R2 Apartments + active unit + upcoming | Done |
| R3 Calendar reservation CRUD | API partial / UI placeholder |
| R4 Expenses + documents | Schema ready (R2 binding present) |
| R5 Business charts | Placeholder |
| R6 Airbnb/Booking sync | Schema ready (cron next) |
| R7 Push notifications | Schema ready |
| R8 PWA | Vite PWA plugin wired |

## Legacy

`legacy/` keeps the masters-thesis 1.x codebase for reference during the rewrite.
