# RentTracker 2.0

Complete rewrite of the masters-thesis short-term rental manager.

## Stack

| Layer | Technology |
|-------|------------|
| Frontend | Vite + React + TypeScript + shadcn/ui + Tailwind + PWA |
| Backend | ASP.NET Core 9 Minimal APIs |
| Auth | Google Sign-In → API-issued JWT (no local passwords, no IdentityServer) |
| Database | PostgreSQL + EF Core |
| Files | Blob storage (MinIO locally) |

## Repository layout

```
apps/
  api/     ASP.NET solution (Domain, Infrastructure, Api)
  web/     Vite React app
legacy/    Original 1.x ASP.NET Core 2.2 + Vue 2 codebase (reference)
docker-compose.yml
```

## Prerequisites

- .NET 9 SDK
- Node.js 22+
- Docker (Postgres + MinIO)

## Quick start

### 1. Infrastructure

```bash
docker compose up -d
```

### 2. API

```bash
cd apps/api
# Set Google:ClientId in src/RentTracker.Api/appsettings.Development.json
dotnet run --project src/RentTracker.Api
```

API: `http://localhost:5080` (Swagger in Development)

On startup in Development, EF migrations are applied automatically.

### 3. Web

```bash
cd apps/web
cp .env.example .env
# Set VITE_GOOGLE_CLIENT_ID (same Google OAuth Web client ID as the API)
npm install
npm run dev
```

Web: `http://localhost:5173` (proxies `/api` → API)

### Google OAuth setup

1. Create an OAuth 2.0 Web client in Google Cloud Console.
2. Authorized JavaScript origins: `http://localhost:5173`
3. Put the client ID in:
   - `apps/web/.env` → `VITE_GOOGLE_CLIENT_ID`
   - `apps/api/.../appsettings.Development.json` → `Google:ClientId`

## Auth flow

1. User signs in with Google Identity Services in the browser.
2. Frontend sends Google ID token to `POST /api/auth/google`.
3. API validates the token, upserts the user, returns an app JWT.
4. Frontend stores the JWT and sends `Authorization: Bearer …` on API calls.

## Thesis feature map (2.0 status)

| Requirement | Status |
|-------------|--------|
| R1 Google auth | Done (scaffold) |
| R2 Apartments + active unit + upcoming | Done (scaffold) |
| R3 Calendar reservation CRUD | Placeholder UI / API partial |
| R4 Expenses + documents | Domain ready / UI placeholder |
| R5 Business charts | Placeholder |
| R6 Airbnb/Booking sync | Domain ready (iCal-first next) |
| R7 Push notifications | Domain ready |
| R8 PWA | Vite PWA plugin wired |

## Legacy

The original product lives under `legacy/` for reference during the rewrite.
