import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { NoteDTO } from "@demo/shared";
import { fetchNotes, fetchNotesPage, createNote, deleteNote, noteKeys } from "../lib/api";

export function useNotes() {
  return useQuery({
    queryKey: noteKeys.all,
    queryFn: fetchNotes,
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
      const previousNotes = queryClient.getQueryData<NoteDTO[]>(noteKeys.all);

      if (previousNotes) {
        const optimisticNote = new NoteDTO(
          {
            ...newNote,
            id: `temp-${Date.now()}`,
            createdAt: new Date().toISOString(),
          },
          {
            offline: true,
          },
        );

        queryClient.setQueryData<NoteDTO[]>(noteKeys.all, [optimisticNote, ...previousNotes]);
      }

      return { previousNotes };
    },
    onError: (_err, _newNote, context) => {
      if (context?.previousNotes) {
        queryClient.setQueryData(noteKeys.all, context.previousNotes);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: noteKeys.all });
    },
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteNote,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: noteKeys.all });
      const previousNotes = queryClient.getQueryData<NoteDTO[]>(noteKeys.all);

      if (previousNotes) {
        queryClient.setQueryData<NoteDTO[]>(
          noteKeys.all,
          previousNotes.filter((note) => note.id !== id),
        );
      }

      return { previousNotes };
    },
    onError: (_err, _id, context) => {
      if (context?.previousNotes) {
        queryClient.setQueryData(noteKeys.all, context.previousNotes);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: noteKeys.all });
    },
  });
}
