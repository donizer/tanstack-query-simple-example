import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { InfiniteData, QueryKey } from "@tanstack/react-query";
import type { QueryClient } from "@tanstack/react-query";
import { type UpdateNote as UpdateNoteInput, NoteDTO } from "@demo/shared";
import {
  createNote,
  deleteNote,
  fetchNoteById,
  fetchNotes,
  fetchNotesMeta,
  fetchNotesPage,
  noteKeys,
  updateNote,
} from "../lib/api";
import type { PaginatedNotesResponse } from "../lib/api";

type InfiniteNotesData = InfiniteData<PaginatedNotesResponse, number>;

type MutationContext = {
  previousAll?: NoteDTO[];
  previousInfinite: Array<[QueryKey, InfiniteNotesData | undefined]>;
  previousDetail?: NoteDTO;
};

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null;

const isInfiniteListQueryKey = (queryKey: QueryKey) => {
  const [group, list, mode, params] = queryKey;

  return group === "notes" && list === "list" && mode === "infinite" && isRecord(params) && "limit" in params;
};

const addOptimisticNoteToPage = (pageData: PaginatedNotesResponse, note: NoteDTO): PaginatedNotesResponse => {
  const nextPage =
    pageData.pagination.page === 1 ? [note, ...pageData.data].slice(0, pageData.pagination.limit) : pageData.data;

  return {
    ...pageData,
    data: nextPage,
  };
};

const removeOptimisticNoteFromPage = (pageData: PaginatedNotesResponse, id: string): PaginatedNotesResponse => {
  return {
    ...pageData,
    data: pageData.data.filter((note) => note.id !== id),
  };
};

const addOptimisticNoteToInfinite = (data: InfiniteNotesData, note: NoteDTO): InfiniteNotesData => {
  const pages = data.pages.map((page, index) => (index === 0 ? addOptimisticNoteToPage(page, note) : page));

  return {
    ...data,
    pages,
  };
};

const removeOptimisticNoteFromInfinite = (data: InfiniteNotesData, id: string): InfiniteNotesData => {
  const pages = data.pages.map((page) => removeOptimisticNoteFromPage(page, id));

  return {
    ...data,
    pages,
  };
};

const buildOptimisticNote = (newNote: { title: string; content: string }) =>
  new NoteDTO(
    {
      ...newNote,
      id: `temp-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: "active",
    },
    {
      offline: true,
    },
  );

const patchNote = (note: NoteDTO, patch: UpdateNoteInput) =>
  new NoteDTO(
    {
      id: note.id,
      title: patch.title,
      content: patch.content,
      status: note.status,
      createdAt: note.createdAt.toISOString(),
    },
    { offline: note.offline },
  );

const applyCreateOptimisticUpdate = (queryClient: QueryClient, note: NoteDTO) => {
  queryClient.setQueryData<NoteDTO[]>(noteKeys.all, (previous = []) => [note, ...previous]);

  queryClient.setQueriesData<InfiniteNotesData>(
    { predicate: (query) => isInfiniteListQueryKey(query.queryKey) },
    (previous) => (previous ? addOptimisticNoteToInfinite(previous, note) : previous),
  );
};

const applyDeleteOptimisticUpdate = (queryClient: QueryClient, id: string) => {
  queryClient.setQueryData<NoteDTO[]>(noteKeys.all, (previous = []) => previous.filter((note) => note.id !== id));

  queryClient.setQueriesData<InfiniteNotesData>(
    { predicate: (query) => isInfiniteListQueryKey(query.queryKey) },
    (previous) => (previous ? removeOptimisticNoteFromInfinite(previous, id) : previous),
  );
};

const rollbackFromContext = (queryClient: QueryClient, context?: MutationContext) => {
  if (!context) {
    return;
  }

  queryClient.setQueryData(noteKeys.all, context.previousAll);
  context.previousInfinite.forEach(([key, data]) => {
    queryClient.setQueryData(key, data);
  });
};

const snapshotMutationContext = (queryClient: QueryClient): MutationContext => ({
  previousAll: queryClient.getQueryData<NoteDTO[]>(noteKeys.all),
  previousInfinite: queryClient.getQueriesData<InfiniteNotesData>({
    predicate: (query) => isInfiniteListQueryKey(query.queryKey),
  }),
});

const updateNoteInList = (notes: NoteDTO[], id: string, patch: UpdateNoteInput) =>
  notes.map((note) => (note.id === id ? patchNote(note, patch) : note));

const applyUpdateOptimisticUpdate = (queryClient: QueryClient, id: string, patch: UpdateNoteInput) => {
  queryClient.setQueryData<NoteDTO[]>(noteKeys.all, (previous = []) => updateNoteInList(previous, id, patch));

  queryClient.setQueriesData<InfiniteNotesData>(
    { predicate: (query) => isInfiniteListQueryKey(query.queryKey) },
    (previous) => {
      if (!previous) {
        return previous;
      }

      return {
        ...previous,
        pages: previous.pages.map((page) => ({
          ...page,
          data: updateNoteInList(page.data, id, patch),
        })),
      };
    },
  );

  queryClient.setQueryData<NoteDTO>(noteKeys.detail(id), (previous) => {
    if (!previous) {
      return previous;
    }

    return patchNote(previous, patch);
  });
};

const invalidateAllNoteQueries = async (queryClient: QueryClient) => {
  await Promise.all([
    queryClient.invalidateQueries({
      queryKey: noteKeys.all,
      refetchType: "active",
    }),
    queryClient.invalidateQueries({
      queryKey: noteKeys.meta(),
      refetchType: "active",
    }),
  ]);
};

export function useNotes() {
  return useQuery({
    queryKey: noteKeys.all,
    queryFn: fetchNotes,
  });
}

export function useNote(id: string, placeholder?: NoteDTO) {
  return useQuery({
    queryKey: noteKeys.detail(id),
    queryFn: () => fetchNoteById(id),
    enabled: Boolean(id),
    placeholderData: placeholder,
  });
}

export function useNotesMeta() {
  return useQuery({
    queryKey: noteKeys.meta(),
    queryFn: fetchNotesMeta,
  });
}

export function usePaginatedNotes(page: number, limit: number) {
  return useQuery({
    queryKey: noteKeys.paginatedList(page, limit),
    queryFn: () => fetchNotesPage(page, limit),
    placeholderData: (placeholderData) => placeholderData,
  });
}

export function useInfiniteNotes(limit: number) {
  return useInfiniteQuery({
    queryKey: noteKeys.infiniteList(limit),
    queryFn: ({ pageParam }) => fetchNotesPage(pageParam, limit),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (!lastPage.pagination.hasNextPage) {
        return undefined;
      }

      return lastPage.pagination.page + 1;
    },
  });
}

export function useCreateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createNote,
    onMutate: async (newNote) => {
      await queryClient.cancelQueries({ queryKey: noteKeys.all });

      const context = snapshotMutationContext(queryClient);
      const optimisticNote = buildOptimisticNote(newNote);
      applyCreateOptimisticUpdate(queryClient, optimisticNote);

      return context;
    },
    onError: (_error, _newNote, context) => {
      rollbackFromContext(queryClient, context);
    },
    onSettled: async () => {
      await invalidateAllNoteQueries(queryClient);
    },
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteNote,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: noteKeys.all });

      const context = snapshotMutationContext(queryClient);
      applyDeleteOptimisticUpdate(queryClient, id);

      return context;
    },
    onError: (_error, _id, context) => {
      rollbackFromContext(queryClient, context);
    },
    onSettled: async () => {
      await invalidateAllNoteQueries(queryClient);
    },
  });
}

export function useUpdateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, note }: { id: string; note: UpdateNoteInput }) => updateNote(id, note),
    onMutate: async ({ id, note }) => {
      await queryClient.cancelQueries({ queryKey: noteKeys.all });

      const context: MutationContext = {
        ...snapshotMutationContext(queryClient),
        previousDetail: queryClient.getQueryData<NoteDTO>(noteKeys.detail(id)),
      };

      applyUpdateOptimisticUpdate(queryClient, id, note);
      return context;
    },
    onError: (_error, variables, context) => {
      rollbackFromContext(queryClient, context);

      if (context?.previousDetail) {
        queryClient.setQueryData(noteKeys.detail(variables.id), context.previousDetail);
      }
    },
    onSettled: async (_data, _error, variables) => {
      await Promise.all([
        invalidateAllNoteQueries(queryClient),
        queryClient.invalidateQueries({ queryKey: noteKeys.detail(variables.id), refetchType: "active" }),
      ]);
    },
  });
}
