# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

WordBeetle Frontend — a Next.js 16 (App Router) application with React 19, TypeScript, and a Rails API backend. Authentication via NextAuth.js v5 (Google/GitHub OAuth + Guest mode). The backend runs at `API_URL` (default `http://localhost:3001/api/v1`).

## Commands

- `pnpm install` — install dependencies (pnpm is enforced via preinstall script)
- `pnpm dev` — start dev server (http://localhost:3000)
- `pnpm build` — production build
- `pnpm lint` — run ESLint

No test framework is configured yet.

## Architecture

```
src/
├── app/
│   ├── (authenticated)/                 # Auth-guarded routes (layout redirects to /auth)
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
│   ├── actions/                         # Server Actions (wordbook, word, settings, guest)
│   ├── api/                             # API client + resource modules (wordbooks, words, meanings, examples, settings, guest-auth)
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
- **API client**: Thin `fetch` wrapper in `lib/api/client.ts`. Auth token from `auth()`, sent as `Authorization: Bearer`. Resource modules follow Rails convention (`{ resource: {...} }` body).
- **Client-side filtering**: API lacks query params for filtering, so words are fetched in bulk and filtered client-side via URL search params (`?status=hard&q=apple`).

### Auth flow

1. **OAuth**: Google/GitHub via NextAuth.js → JWT callback stores `idToken` + `apiUserId`
2. On sign-in, `idToken` is verified against Rails API (`POST {API_URL}/auth/google`)
3. **Guest**: NextAuth Credentials provider → `POST {API_URL}/auth/guest` → token stored in JWT like OAuth
4. Session callback exposes `idToken` and `apiUserId` for downstream API requests

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

**Prettier** (`.prettierrc`): single quotes, 80 char width, ES5 trailing commas, `prettier-plugin-organize-imports`.

## Environment Variables

Required in `.env.local`:
- `AUTH_SECRET` — NextAuth secret
- `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` — Google OAuth credentials
- `API_URL` — Rails backend base URL

## Path Aliases

`@/*` maps to `./src/*` (configured in `tsconfig.json`).
