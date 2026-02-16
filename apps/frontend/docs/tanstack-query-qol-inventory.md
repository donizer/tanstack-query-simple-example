# TanStack Query QoL Inventory

This document audits current TanStack Query usage in the frontend and highlights practical quality-of-life features.

## Legend

- ✅ Implemented in current codebase
- ⚠️ Partially implemented or inconsistent
- ❌ Not implemented

## Feature Matrix

| Feature                               | Status | Current usage                                                                                                        | Gap / Notes                                                                  |
| ------------------------------------- | ------ | -------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Query key factory                     | ✅     | `noteKeys` in `src/lib/api.ts`                                                                                       | Centralized and typed key shape for notes domain.                            |
| Reusable query option factories       | ✅     | `notesListQueryOptions`, `paginatedNotesQueryOptions`, `infiniteNotesQueryOptions`, `noteDetailQueryOptions`         | Good composition pattern across hooks/pages.                                 |
| Global defaults                       | ✅     | `QueryClient` defaults in `src/lib/query-client.ts` (`staleTime`, `gcTime`, retries, reconnect/focus refetch)        | Baseline policy exists and is consistent.                                    |
| Abort signal propagation              | ✅     | Query `signal` now forwarded via option factories in `src/lib/api.ts`                                                | Cancels in-flight fetches when queries are replaced or unmounted.            |
| Pagination UX continuity              | ✅     | `keepPreviousData` in `usePaginatedNotes` (`src/hooks/use-notes.ts`)                                                 | Prevents visible loading flicker while changing pages.                       |
| Infinite query flow                   | ✅     | `useInfiniteQuery` + `getNextPageParam` in `src/lib/api.ts` and `src/hooks/use-notes.ts`                             | Good baseline for load-more UX.                                              |
| Prefetching                           | ✅     | `usePrefetchPaginatedNotes`, `usePrefetchNote` in `src/hooks/use-notes.ts`                                           | Reduces wait for likely-next interactions.                                   |
| Optimistic updates + rollback         | ✅     | create/delete/update mutations in `src/hooks/use-notes.ts`                                                           | Includes cancel, snapshot, rollback, settle invalidation.                    |
| Activity indicators                   | ✅     | `useIsFetching`, `useIsMutating` in `src/pages/learn/learn-layout.tsx`                                               | Useful global feedback for background work.                                  |
| Selectors (`select`) for derived data | ✅     | `useInfiniteNotes` in `src/hooks/use-notes.ts` derives `flattened` via `select`                                      | Derivation now centralized in query layer instead of page-level memo.        |
| Suspense/error-boundary integration   | ✅     | `SuspenseNotesPage` uses `useSuspenseQuery` + `QueryErrorResetBoundary` in `src/pages/learn/suspense-notes-page.tsx` | Adds a route-level reference implementation for loading/error orchestration. |
| Query/mutation per-key defaults       | ✅     | `setQueryDefaults` for detail/meta in `src/lib/query-client.ts`                                                      | Adds key-level freshness policies beyond global defaults.                    |
| Cache persistence/offline resume      | ✅     | `PersistQueryClientProvider` + localStorage persister in `src/main.tsx` and `src/lib/query-persistence.ts`           | Persists query cache across reloads with 24h max age.                        |

## High-Value Gaps to Fill Next (Optional)

No high-priority TanStack Query QoL gaps remain for this demo scope.

## Manual `useEffect` Hook Comparison

These manual hooks are educational and intentionally do **not** match TanStack Query capabilities.

- `use-manual-notes-query-naive.ts`
  - Missing: refetch API, cancellation, race protection, cache sharing/deduping, stale/cache policy, retries, prefetch, invalidation graph.
- `use-manual-notes-query-intermediate.ts`
  - Adds: explicit status, metadata, `refetch`.
  - Still missing: cancellation, race protection, cache sharing/deduping, stale/cache policy, retries/backoff, prefetch and invalidation semantics.
- `use-manual-notes-query-advanced.ts`
  - Adds: cancellation (`AbortController`) and stale response guard (request id).
  - Still missing: shared cache/dedup across components, invalidation graph, stale policy controls, background refetch triggers, prefetch APIs.

## Notes

- This inventory is scoped to production TanStack hooks (`src/hooks/use-notes.ts`, `src/lib/api.ts`, `src/lib/query-client.ts`).
- Manual hooks remain unchanged functionally and are documented as contrast examples.
