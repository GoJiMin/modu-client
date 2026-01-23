# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.
Use Korean to communicate with users

## Commands

```bash
pnpm dev                    # Start dev server on dev.modu-review.com:3000 with HTTPS
pnpm build                  # Production build
pnpm lint                   # Run ESLint
pnpm test                   # Run all tests
pnpm test:watch             # Run tests in watch mode
pnpm test -- path/to/file   # Run a single test file
```

## Architecture

This is a Next.js 15 (App Router) project using **Feature-Sliced Design (FSD)** architecture with React 19.

### FSD Layer Structure (`src/`)

- **shared/** - Reusable utilities, UI components, hooks, and API core
  - `apis/` - Fetch wrapper (`request-core.ts`) with automatic 401 token refresh
  - `shadcnComponent/` - shadcn/ui components
  - `ui/` - Custom shared components (modals, icons, etc.)
  - `lib/` - Utilities and constants
- **entities/** - Business entities with data + UI (auth, review, reviews, users, notifications, contact, error)
  - Each entity has: `apis/api-service.ts`, `model/query-service.ts`, `model/types.ts`, hooks (`use*.ts`)
- **features/** - User actions/interactions (auth, contact, notifications, review, search)
- **widgets/** - Composite UI blocks (header, footer, pagination, error boundaries)
- **views/** - Full page components corresponding to routes
- **app/** - App-level providers, layouts, styles, fonts

### App Router Pages (`app/`)

Route files re-export from `src/views/`. Example: `app/layout.ts` exports from `@/app/layouts`.

### Key Patterns

**Data Fetching (TanStack Query v5):**

- Query keys and options defined in `entities/*/model/query-service.ts`
- API functions in `entities/*/apis/api-service.ts`
- Mutations in dedicated hooks: `usePost*`, `usePatch*`, `useDelete*`

**State Management:**

- Server state: TanStack Query
- Client state: Zustand stores in `entities/*/model/*Store.ts`

**Error Handling:**

- Custom `RequestError` and `RequestGetError` classes in `shared/apis/request-error.ts`
- `errorHandlingType` prop controls whether errors use toast or error boundary
- Sentry integration for error reporting

**Path Aliases:**

- `@/*` maps to `src/*` (configured in tsconfig with baseUrl: "src")

## Commit Message Convention

```
[type] Message

- Description of changes
```

Types: `[feat]`, `[fix]`, `[refactor]`, `[docs]`, `[resource]`, `[style]`, `[comment]`, `[chore]`, `[merge]`, `[test]`

## Testing

Tests use Jest + React Testing Library. Test files are placed in `test/` subdirectories next to the code being tested (e.g., `shared/apis/test/request-core.spec.ts`).
