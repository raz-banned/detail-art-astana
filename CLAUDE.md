# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

APELSIN DETAILING — a single-page marketing site (Russian-language) for a car detailing business in
Astana, built with TanStack Start (React 19 + SSR), Tailwind CSS 4, shadcn/ui, and Supabase. The
project is managed through [Lovable](https://lovable.dev): pushes to `main` sync back into the
Lovable editor, so keep the branch in a working state and avoid rewriting published history (force
push, rebase/amend/squash of pushed commits) — see `AGENTS.md`.

## Commands

- `npm run dev` — start the dev server (Vite)
- `npm run build` — production build
- `npm run build:dev` — build in development mode
- `npm run preview` — preview a production build
- `npm run lint` — ESLint (flat config, includes Prettier as a lint rule)
- `npm run format` — Prettier write

There is no test suite configured in this repo. Package manager is npm (`package-lock.json` is the
lockfile in use); a `bun.lock` and `bunfig.toml` also exist but bun's install is gated by a 24h
supply-chain guard (`minimumReleaseAge` in `bunfig.toml`) — check with the user before adding
packages to the bun-side excludes list.

## Git workflow

- Work on a feature branch off `main` (`feat/...`, `fix/...`) and merge through a GitHub PR.
- Commit messages: Conventional Commits subject (`feat: ...`, `fix: ...`) plus a short body on what
  changed and why.
- PR descriptions have `## Summary` (1–3 bullets), `## Test plan` (checklist: build/lint plus the
  manual checks a reviewer should do) and `## Screenshots` for UI changes.
- PRs are squash-merged, with the PR title plus ` (#N)` as the commit subject. Squashing on merge is
  fine for Lovable; only rewriting commits already on `main` is not.
- `git pull` is configured to rebase, so stash uncommitted changes before pulling.

## Architecture

**Routing**: TanStack Start file-based routing under `src/routes/`. `src/routes/__root.tsx` is the
only root layout/shell (wraps `<html>`, injects `<QueryClientProvider>`, defines the 404 and
error-boundary components) — never create `src/pages/` or Next.js/Remix-style route files.
`src/routeTree.gen.ts` is auto-generated; don't hand-edit it. See `src/routes/README.md` for the
file-based routing conventions (dynamic `$id`, optional `{-$category}`, splat `$.tsx`, `_layout.tsx`).

The entire homepage (hero, services, pricing, before/after gallery, reviews, about, booking form,
map, footer) lives in one file: `src/routes/index.tsx`. There are no separate section/page
components — content arrays (`services`, `pricing`, `reviews`) and the `BookingForm` /
`BeforeAfter` components are defined inline in that file. The only other page is
`src/routes/privacy.tsx` (privacy policy for the booking form's personal data).

**Business info**: `src/lib/business-info.ts` is the single source for contact and location data —
phone, WhatsApp link, address, working hours, 2GIS widget/org id, route links, social links and the
legal entity. Import from there instead of hardcoding these strings in markup. `SOCIAL_LINKS` and
`LEGAL_ENTITY` are intentionally empty until confirmed by the owner (the footer hides them while
empty); never invent company details such as the legal entity, BIN or social accounts.

## Content reliability

Most of the site's content is unverified placeholder data and is likely wrong. Real information is
still being collected from the company.

- **Reliable**: phone and WhatsApp number, the address (Apelsin Industrial Park, ул. Алаш 46/2,
  Астана), the map location / 2GIS organization, the brand name and logo. Anything else counts as
  unverified unless the user confirms it.
- **Unverified**: the services list and descriptions, pricing packages, the hero stats ("9 лет на
  рынке", "3 года гарантия керамики", 2GIS rating), working hours, promises such as "перезвоним в
  течение 15 минут", "2–3 машины в день" and "фотоотчёт", the "О нас" text, and the photos
  (`src/assets/hero-detailing.jpg` shows another studio's "PRO DETAILING" branding).

Don't use unverified content as a source for new work: don't copy it into structured data (JSON-LD),
meta tags, generated images, new pages or `business-info.ts`. Build around the reliable data, leave
explicit gaps for the rest, and ask the user when unsure whether something is confirmed.

**Server entry / SSR error handling**: `src/start.ts` registers global middleware
(`attachSupabaseAuth` for auth, `createCsrfMiddleware` for server functions — defining `src/start.ts`
opts out of TanStack Start's automatic CSRF middleware, so it's re-added explicitly here) plus an
error middleware that renders a plain HTML error page instead of leaking a raw 500. `src/server.ts`
wraps the generated `@tanstack/react-start/server-entry` fetch handler and additionally normalizes
h3's swallowed-error responses (500s that come back as `{"unhandled":true,"message":"HTTPError"}`
JSON) into the same rendered error page. `src/lib/error-capture.ts`, `error-page.ts`, and
`lovable-error-reporting.ts` support this error pipeline and report errors back to Lovable.

**Supabase integration** (`src/integrations/supabase/`): several files here are marked
"automatically generated — do not edit directly" (`client.ts`, `client.server.ts`, `types.ts`,
`auth-attacher.ts`, likely regenerated by the Lovable/Supabase tooling).
- `client.ts` — browser/SSR client using the publishable key (`VITE_SUPABASE_*` env vars on the
  client, `SUPABASE_*` as SSR fallback). Exported as a lazy `Proxy` so it's only constructed on
  first use.
- `client.server.ts` — admin client using the service-role key, bypasses RLS. Only import this from
  `.server.ts` files or inside server handlers (dynamic `import()`), never at top level in route
  files or `*.functions.ts`, since those ship to the client bundle.
- `auth-attacher.ts` — client-side function middleware that attaches the Supabase session's bearer
  token to server-function (RPC) requests; registered in `src/start.ts`.
- `previewAuthStorage.ts` / `cron-auth.ts` / `auth-middleware.ts` — auth storage brokering and
  server-side auth middleware for protected server functions/routes.

The booking form (`BookingForm` in `src/routes/index.tsx`) inserts into a `bookings` table via
`supabase.from("bookings").insert(...)`, validated client-side with a `zod` schema, then redirects a
pre-opened window to a `wa.me` WhatsApp deep link with the booking details prefilled. The window is
opened synchronously before the `await` (`window.open("", "_blank", ...)`) so it isn't blocked by
popup blockers, then its `location.href` is set after the Supabase insert resolves.

**Env vars**: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID` for
the client bundle; `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_PROJECT_ID` as SSR
fallbacks; `SUPABASE_SERVICE_ROLE_KEY` for the server-only admin client. Never expose the service
role key to client code.

**Styling**: Tailwind CSS 4 (via `@tailwindcss/vite`) with CSS variables, configured through
`components.json` (shadcn/ui, "new-york" style, no RSC, icon library `lucide`). Path alias `@/*` →
`./src/*` (see `tsconfig.json` and `components.json` aliases). Prettier: 100 print width, double
quotes, trailing commas, enforced via `eslint-plugin-prettier` as a lint error, not just a formatter.
`src/integrations/supabase/` is excluded from both ESLint and Prettier because Lovable regenerates
it and would undo any reformatting; `npm run lint` should exit with 0 errors (the remaining
`react-refresh` warnings in `src/components/ui/` are standard shadcn exports).

**Vite config**: Most Vite plugins (TanStack Start, React, Tailwind, tsconfig-paths, Nitro,
env injection, sandbox detection) are pre-configured inside `@lovable.dev/vite-tanstack-config` —
do not add them manually in `vite.config.ts` or the app breaks with duplicate plugins. Nitro build
targets `cloudflare` by default.
