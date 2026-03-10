# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

WordBeetle Frontend — a Next.js 16 (App Router) application with React 19, TypeScript, and a Rails API backend. Authentication via NextAuth.js v5 (Google/GitHub OAuth). The backend runs at `API_URL` (default `http://localhost:3001/api/v1`).

## Commands

- `pnpm install` — install dependencies (pnpm is enforced via preinstall script)
- `pnpm dev` — start dev server (http://localhost:3000)
- `pnpm build` — production build
- `pnpm lint` — run ESLint

No test framework is configured yet.

## Architecture

```
src/
├── app/                    # Next.js App Router (routes, layouts, global CSS)
├── features/               # Feature modules (domain-specific code)
│   └── auth/               # Auth feature
│       ├── actions/        # Server Actions (sign-in.action.ts, sign-out.action.ts)
│       ├── components/server/  # Server components (AuthForm, AuthPageTemplate, ProviderIcon)
│       ├── lib/            # Auth config (auth.ts, providers.ts)
│       └── types/          # Type extensions (next-auth.d.ts)
├── shared/                 # Cross-feature reusable code
│   ├── components/
│   │   ├── layout/server/  # Layout components (Header, UserMenu)
│   │   └── ui/             # shadcn/ui primitives
│   └── lib/                # Utilities (cn helper)
└── middleware.ts            # Auth guard (redirects authenticated users from /auth)
```

### Key patterns

- **Feature-based organization**: Domain logic lives in `src/features/{feature}/` with actions, components, lib, and types subdirectories.
- **Shared code** goes in `src/shared/` — UI primitives, layout components, utilities.
- **Container/Presenter**: Server components split into Container (data fetching) and Presenter (rendering with `'use cache'`). See `UserMenuContainer`/`UserMenuPresenter`.
- **Server Components by default**. Only use `'use client'` when interactivity is required.
- **Server Actions** for mutations, suffixed `.action.ts`.
- **shadcn/ui** (new-york style, Radix UI + Tailwind CSS + CVA). Components live in `src/shared/components/ui/`.

### Auth flow

1. OAuth via NextAuth.js (Google/GitHub) → JWT callback stores `idToken`
2. On sign-in, `idToken` is verified against Rails API (`POST {API_URL}/auth/google`)
3. Session callback exposes `idToken` for downstream API requests

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
