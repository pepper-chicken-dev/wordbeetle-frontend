# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

WordBeetle Frontend — a Next.js 16 (App Router) application with React 19, TypeScript, and a Rails API backend. Authentication via NextAuth.js v5 (Google/GitHub OAuth + Guest mode). The backend runs at `API_URL` (default `http://localhost:3001/api/v1`).

## Commands

- `pnpm install` — install dependencies (pnpm is enforced via preinstall script)
- `pnpm dev` — start dev server (<http://localhost:3000>)
- `pnpm build` — production build
- `pnpm lint` — run ESLint
- `pnpm test:e2e` — run Playwright E2E tests (headless)
- `pnpm test:e2e:ui` — run Playwright tests with interactive UI
- `pnpm test:e2e:headed` — run Playwright tests in headed browser
- `playwright-cli` — token-efficient browser automation CLI (see `.claude/skills/playwright-cli/`)

## Architecture

```
src/
├── app/
│   ├── (authenticated)/                 # Routes whose pages call into DAL (verifySession redirects to /auth)
│   │   ├── dashboard/                   # Wordbook list (home)
│   │   ├── settings/                    # SRS interval settings
│   │   └── wordbooks/
│   │       ├── new/                     # Create wordbook
│   │       └── [wordbookId]/
│   │           ├── page.tsx             # Wordbook detail (word list + filter)
│   │           ├── edit/                # Edit wordbook
│   │           ├── test/                # Flashcard test
│   │           └── words/
│   │               ├── new/             # Create word
│   │               └── [wordId]/        # Word detail + edit
│   ├── auth/                            # Login page (existing)
│   ├── api/auth/[...nextauth]/          # NextAuth route (existing)
│   └── page.tsx                         # Landing (redirects to /dashboard if authenticated)
├── components/
│   ├── audio/                           # Audio play button (Web Speech API)
│   ├── auth/                            # Auth form (OAuth + Guest), page template, provider icon
│   ├── layout/                          # Header, user menu
│   ├── settings/                        # SRS settings form, interval input
│   ├── test/                            # Flashcard, test session, evaluation buttons, completion
│   ├── ui/                              # shadcn/ui primitives
│   ├── word/                            # Word card, detail, form, filter bar, status badge, delete dialog
│   └── wordbook/                        # Wordbook card, list, form, delete dialog
├── lib/
│   ├── actions/                         # Server Actions (wordbook, word, settings, guest). May call DAL directly.
│   ├── dal/                             # Data Access Layer. Calls Rails API. Hosts verifySession()/getOptionalSession().
│   │                                    # Every authenticated DAL function calls verifySession() first (cached via React.cache).
│   │                                    # All files are marked `import 'server-only'`.
│   ├── dto/                             # View shaping layer. Components/pages import only from here, never from dal/.
│   │                                    # DTO output types are defined locally with explicit field selection (no spread).
│   ├── auth/                            # NextAuth config (OAuth + Credentials), providers, auth actions
│   └── utils.ts                         # Utilities (cn helper)
├── types/
│   ├── api.ts                           # API type definitions (Wordbook, Word, Meaning, Example, Setting, etc.)
│   └── next-auth.d.ts                   # NextAuth type extensions (idToken, apiUserId)
└── middleware.ts                         # Redirects authenticated users from /auth to /dashboard
```

### Key patterns

- **Flat structure**: `components/` for UI, `lib/` for logic/utilities, `types/` for type declarations.
- **kebab-case files, direct imports**: No barrel exports (index.ts). Import directly from the file (e.g., `@/components/auth/auth-form`).
- **Suspense boundaries**: All async data fetching is wrapped in `<Suspense>` (Next.js 16 PPR requirement). Data-fetching server components are extracted as separate `*-content.tsx` files.
- **Server Components by default**. Only use `'use client'` when interactivity is required.
- **Server Actions** live in `lib/actions/`. Use `useActionState` for form state and `useTransition` for non-form mutations.
- **shadcn/ui** (new-york style, Radix UI + Tailwind CSS + CVA). Components live in `src/components/ui/`.
- **DAL/DTO boundary**:
  - Components and pages under `app/` / `components/` import only from `lib/dto/` (or `lib/dal/session` for session reads). Importing DAL resource modules from these directories is enforced as an ESLint error.
  - Server Actions in `lib/actions/` may call `lib/dal/` directly for mutations.
  - DTO functions use explicit field selection (no `...spread` of API responses). DTO output types live in `lib/dto/` and are not re-exports of `types/api.ts`.
- **Auth boundary**: Authentication is enforced inside `lib/dal/` via `verifySession()` (redirects to `/auth` on missing token, cached with `React.cache`). **Do not call `auth()` from layouts, pages, or components** — use `verifySession()` for data-gating or `getOptionalSession()` for read-only session display. The ESLint rule blocks `auth` imports outside `lib/dal/`, `lib/auth/`, `lib/actions/`, and `middleware.ts`.
- **PPR**: `(authenticated)/layout.tsx` is a passthrough — it does not call `auth()` so layout shells and static page markup can be prerendered.
- **API client**: Thin `fetch` wrapper in `lib/dal/client.ts`. Auth token from `verifySession()`, sent as `Authorization: Bearer`. Resource modules follow Rails convention (`{ resource: {...} }` body).
- **Client-side filtering**: API lacks query params for filtering, so words are fetched in bulk and filtered client-side via URL search params (`?status=hard&q=apple`).

### Auth flow

1. **OAuth**: Google via NextAuth.js → JWT callback sends Google ID token to Rails API (`POST {API_URL}/auth/google`) → stores Rails JWT as `accessToken`
2. **Guest**: NextAuth Credentials provider → `POST {API_URL}/auth/guest` → Rails JWT stored as `accessToken` in JWT
3. Session callback exposes `accessToken` for downstream API requests

### E2E Testing

- **Playwright** for E2E tests. Config: `playwright.config.ts`. Tests: `e2e/*.spec.ts`.
- **Playwright CLI** (`@playwright/cli`) for token-efficient browser automation. Skills at `.claude/skills/playwright-cli/`.
- `webServer` config auto-starts `pnpm dev` and reuses an existing server if running.
- Guest login is used for authentication in tests (no external OAuth needed).
- Only Chromium is configured. Add Firefox/WebKit in `playwright.config.ts` if needed.

### SRS (Spaced Repetition)

- Word statuses: `not_studied` → `hard` / `uncertain` / `easy`
- On test evaluation, `next_review_at` = now + interval (from user settings or defaults: hard=1d, uncertain=3d, easy=7d)
- Test page filters words where `next_review_at` is null or in the past

## Code Style & Lint Rules

**ESLint** (flat config, `eslint.config.mjs`):

- `@typescript-eslint/strict-boolean-expressions` — no truthy/falsy coercion; use explicit comparisons (e.g., `!== undefined`, `!== null`)
- `@typescript-eslint/switch-exhaustiveness-check` — no default case for exhaustive switches
- `no-implicit-coercion` — no `!!`, `+""`, etc.
- `prefer-template` — use template literals over string concatenation
- `import/no-cycle` — no circular dependencies
- `unicorn/prefer-switch` — prefer switch over if-else chains
- `no-restricted-imports` — enforces the DAL/DTO boundary and `auth()` import rules described above (see `eslint.config.mjs`)

**Prettier** (`.prettierrc`): single quotes, 80 char width, ES5 trailing commas, `prettier-plugin-organize-imports`.

## Environment Variables

Required in `.env.local`:

- `AUTH_SECRET` — NextAuth secret
- `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` — Google OAuth credentials
- `API_URL` — Rails backend base URL

## Path Aliases

`@/*` maps to `./src/*` (configured in `tsconfig.json`).

## Workflow

- Before starting implementation, enter plan mode to design the approach and align with the user.
  - The plan must include a commit strategy: define how to group changes into logical commits and a draft commit message for each.
- When beginning work, always pull the latest main branch and create a new branch with an appropriate name before making any changes.
- During implementation, commit incrementally according to the plan. Create each commit as soon as the corresponding unit of work is complete, rather than batching all commits at the end.
- When committing, follow the rules defined in `.claude/skills/git-commit/SKILL.md`.
- After the final commit, immediately push the branch and create a PR following the rules in `.claude/skills/pull-request/SKILL.md`. Do not stop or wait for user input between the last commit and PR creation.


## Communication

- Respond in Japanese
- Write pull request and issue descriptions in English
- Do not include "authored by Claude" (or similar attribution) in commit messages, pull requests, or issues
