# TanStack Query Snippets (Lecture Pack)

Use this as a copy-paste reference during the workshop.
Start at the top and move down by complexity.

---

## 1) Query Client Setup

Коротко: це базова конфігурація клієнта, яка задає дефолтну поведінку кешу, рефетчу та повторних спроб.

- `staleTime` — скільки часу дані вважаються «свіжими». Поки час не минув, TanStack Query не буде агресивно рефетчити ці дані у фоні.
- `gcTime` — скільки часу неактивний кеш зберігається в пам'яті перед видаленням (garbage collection).
- Швидка формула: `staleTime` = fresh/stale логіка, `gcTime` = як довго тримати неактивні дані в кеші.

```ts
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 20_000,
      gcTime: 10 * 60_000,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      retry: 1,
    },
    mutations: {
      retry: 0,
    },
  },
});
```

---

## 2) Query Key Factory

Коротко: централізовані ключі запитів допомагають уникати помилок і спрощують інвалідацію кешу.

```ts
export const keysFactory = <T extends string, ID extends string = string>(key: T) => {
  const keys = {
    all: [key] as const,
    mutations: {
      all: () => [...keys.all, "mutation"] as const,
      create: () => [...keys.mutations.all(), "create"] as const,
      update: () => [...keys.mutations.all(), "update"] as const,
      delete: () => [...keys.mutations.all(), "delete"] as const,
    },
    meta: () => [...keys.all, "meta"] as const,
    lists: () => [...keys.all, "list"] as const,
    paginatedList: (page: number, limit: number) => [...keys.lists(), { page, limit }] as const,
    infiniteList: (limit: number) => [...keys.lists(), "infinite", { limit }] as const,
    details: () => [...keys.all, "detail"] as const,
    detail: (id: ID) => [...keys.details(), id] as const,
  };

  return keys;
};
```

---

## 3) Reusable Query Options

Коротко: винесення `queryOptions` в окремі фабрики прибирає дублювання і робить хуки читабельнішими.

```ts
import { queryOptions, infiniteQueryOptions } from "@tanstack/react-query";

export const notesListQueryOptions = () =>
  queryOptions({
    queryKey: noteKeys.all,
    queryFn: ({ signal }) => fetchNotes({ signal }),
  });

export const noteDetailQueryOptions = (id: string) =>
  queryOptions({
    queryKey: noteKeys.detail(id),
    queryFn: ({ signal }) => fetchNoteById(id, { signal }),
  });

export const paginatedNotesQueryOptions = (page: number, limit: number) =>
  queryOptions({
    queryKey: noteKeys.paginatedList(page, limit),
    queryFn: ({ signal }) => fetchNotesPage(page, limit, { signal }),
  });

export const infiniteNotesQueryOptions = (limit: number) =>
  infiniteQueryOptions({
    queryKey: noteKeys.infiniteList(limit),
    queryFn: ({ pageParam, signal }) => fetchNotesPage(pageParam, limit, { signal }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.pagination.hasNextPage ? lastPage.pagination.page + 1 : undefined),
  });
```

---

## 4) Basic `useQuery`

Коротко: найпростіший приклад читання даних з сервера через TanStack Query.

```ts
import { useQuery } from "@tanstack/react-query";

export function useNotes() {
  return useQuery(notesListQueryOptions());
}
```

```tsx
const { data, isLoading, isError, error, refetch } = useNotes();
```

---

## 5) Detail Query With `enabled`

Коротко: `enabled` дозволяє запускати запит лише тоді, коли є потрібний `id`.

```ts
export function useNote(id: string | undefined, placeholder?: NoteDTO) {
  return useQuery({
    ...noteDetailQueryOptions(id!),
    enabled: Boolean(id),
    placeholderData: placeholder,
  });
}
```

---

## 6) Pagination With `keepPreviousData`

Коротко: `keepPreviousData` прибирає мерехтіння і залишає попередню сторінку, поки вантажиться нова.

```ts
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export function usePaginatedNotes(page: number, limit: number) {
  return useQuery({
    ...paginatedNotesQueryOptions(page, limit),
    placeholderData: keepPreviousData,
  });
}
```

---

## 7) Prefetch Next Page

Коротко: префетч підвантажує ймовірно наступні дані наперед для швидшого UX.

```ts
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

export function usePrefetchPaginatedNotes({ page, limit, enabled }: { page: number; limit: number; enabled: boolean }) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled) return;
    void queryClient.prefetchQuery(paginatedNotesQueryOptions(page + 1, limit));
  }, [enabled, limit, page, queryClient]);
}
```

---

## 8) Infinite Query + Flattened Data

Коротко: нескінченний список отримує сторінки по мірі потреби, а `select` формує плоский масив для UI.

```ts
import { useInfiniteQuery } from "@tanstack/react-query";

export function useInfiniteNotes(limit: number) {
  return useInfiniteQuery({
    queryKey: noteKeys.infiniteList(limit),
    queryFn: ({ pageParam, signal }) => fetchNotesPage(pageParam, limit, { signal }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.pagination.hasNextPage ? lastPage.pagination.page + 1 : undefined),
    select: (data) => ({
      ...data,
      flattened: data.pages.flatMap((page) => page.data),
    }),
  });
}
```

---

## 9) Mutation + Invalidation

Коротко: після мутації інвалідуємо пов'язані запити, щоб підтягнути актуальні дані з бекенду.

```ts
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCreateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: noteKeys.mutations.create(),
    mutationFn: createNote,
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: noteKeys.all,
        refetchType: "active",
      });
    },
  });
}
```

---

## 10) Optimistic Update (Minimal Pattern)

Коротко: оптимістичне оновлення миттєво змінює UI, а при помилці робить rollback до попереднього стану.

```ts
export function useDeleteNoteOptimistic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteNote,
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: noteKeys.all });
      const previous = queryClient.getQueryData<NoteDTO[]>(noteKeys.all);

      queryClient.setQueryData<NoteDTO[]>(noteKeys.all, (old = []) => old.filter((note) => note.id !== id));

      return { previous };
    },
    onError: (_error, _id, context) => {
      queryClient.setQueryData(noteKeys.all, context?.previous);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: noteKeys.all, refetchType: "active" });
    },
  });
}
```

---

## 11) Global Activity Indicators

Коротко: глобальні індикатори показують фонову активність запитів і мутацій у застосунку.

```ts
import { useIsFetching, useIsMutating } from "@tanstack/react-query";

const fetchingNotesCount = useIsFetching({ queryKey: noteKeys.all });
const mutatingNotesCount = useIsMutating({ mutationKey: noteKeys.mutations.all() });

const isBusy = fetchingNotesCount > 0 || mutatingNotesCount > 0;
```

---

## Suggested Lecture Flow (60-90 min)

1. QueryClient + Devtools (5 min)
2. Basic query (10 min)
3. Keys + query options factory (10 min)
4. Pagination + keepPreviousData + prefetch (15 min)
5. Mutation + invalidation (10 min)
6. Optimistic update (10-15 min)
7. Infinite query (10-15 min)
8. Suspense mention only (2 min)
