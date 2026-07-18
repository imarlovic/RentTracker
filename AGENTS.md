# RentTracker

Short-term rental manager. The repo is mid-migration to a **Cloudflare-only** stack.

- `apps/web/` — active app (Cloudflare Workers + Vite + React + TypeScript, D1, R2). **All development happens here.**
- `legacy/` — original 1.x ASP.NET Core + Vue app, kept for reference only. Do not set it up.

See `README.md` for the stack overview and `apps/web/package.json` for the canonical scripts.

## Cursor Cloud specific instructions

The startup update script runs `npm install` in `apps/web`. Everything below is per-session or non-obvious context; do it yourself when needed.

### First-time setup each session (before `npm run dev`)
Run from `apps/web`:
1. Create local config (gitignored, not created by the update script):
   - `cp .env.example .env` and set `VITE_GOOGLE_CLIENT_ID`.
   - `cp .dev.vars.example .dev.vars` and set `GOOGLE_CLIENT_ID` (a working placeholder client ID already lives in `wrangler.jsonc` `vars`) and a `JWT_SECRET` that is **≥ 32 characters** (the Worker throws otherwise).
2. `npm run db:migrate:local` — applies D1 migrations to the local SQLite state (idempotent; excluded from the update script on purpose).
3. `npm run dev` — Vite + `@cloudflare/vite-plugin` serve the SPA and run the Worker in workerd at `http://localhost:5173`. `/api/*` is handled by the Worker first; `GET /api/health` is a quick liveness check.

### Commands (all in `apps/web`)
- Lint: `npm run lint` (oxlint). Note: there is currently a **pre-existing** `rules-of-hooks` error in `src/pages/UpcomingPage.tsx`; the build still succeeds.
- Build / typecheck: `npm run build` (`tsc -b && vite build`).
- Dev server: `npm run dev`.

### Non-obvious gotchas
- Local D1 state lives in `apps/web/.wrangler/state/v3` (gitignored). `wrangler d1 execute renttracker --local ...` shares the **same** local DB as the running `npm run dev` server, so you can seed/inspect data while it runs.
- Google Sign-In cannot be completed on `localhost` unless the OAuth client whitelists the dev origin, so the login button will log a GSI `origin is not allowed` error — this is expected locally. To test authenticated flows without Google: insert a row into `users`, then mint an HS256 app JWT signed with `JWT_SECRET` whose `sub` is that user id and whose `iss`/`aud` match `JWT_ISSUER`/`JWT_AUDIENCE`. The claim shape is defined by `createAppJwt`/`verifyAppJwt` in `worker/auth.ts`. The client reads the session from `localStorage` keys `renttracker.accessToken` and `renttracker.user`.
- `.env`, `.dev.vars`, `.wrangler/`, `dist/`, and `node_modules/` are all gitignored.
- Remote Cloudflare (D1/R2/deploy) needs a real Cloudflare account + `wrangler login`; not required for local dev.
