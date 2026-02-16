# TanStack Query Learning Demo (Frontend)

This frontend is intentionally organized as learning material. The app demonstrates practical TanStack Query patterns with a small Notes API.

## Routes

- `/learn/basic` — baseline `useQuery` list fetch.
- `/learn/suspense` — route-level `useSuspenseQuery` + error reset boundary pattern.
- `/learn/pagination` — paginated query with URL state and next-page prefetch.
- `/learn/infinite` — infinite query with intersection-observer loading.
- `/editor/:id?` — note editor that uses detail query + optimistic updates.

## Where to look first

- `src/lib/api.ts`
  - query key factory
  - query option factories (`queryOptions`, `infiniteQueryOptions`)
  - API request functions with schema parsing
- `src/hooks/use-notes.ts`
  - feature hooks built on option factories
  - optimistic create/delete/update mutations with rollback
  - prefetch hooks for pagination and details
- `src/pages/learn/*`
  - each page isolates one query pattern
- `src/pages/learn/learn-layout.tsx`
  - shell layout, route tabs, and global activity indicators (`useIsFetching`, `useIsMutating`)

## TanStack Query features showcased

- `QueryClient` defaults (`staleTime`, `gcTime`, retries)
- structured query keys
- reusable `queryOptions` / `infiniteQueryOptions`
- optimistic mutations with rollback
- targeted invalidation
- `keepPreviousData` for pagination UX
- prefetching next pages and details
- background activity indicators
- localStorage cache persistence via `PersistQueryClientProvider`

## Query QoL audit

- Detailed inventory: [docs/tanstack-query-qol-inventory.md](docs/tanstack-query-qol-inventory.md)

## Run

From monorepo root:

```bash
pnpm dev

# -- OR separately --

pnpm --filter backend dev
pnpm --filter frontend dev

```

Open `http://localhost:5173`.
