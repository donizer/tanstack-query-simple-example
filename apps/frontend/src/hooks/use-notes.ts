import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { NoteDTO } from "@demo/shared";
import { fetchNotes, createNote, deleteNote, noteKeys } from "../lib/api";

export function useNotes() {
  return useQuery({
    queryKey: noteKeys.all,
    queryFn: fetchNotes,
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
        const optimisticNote = new NoteDTO({
          ...newNote,
          id: `temp-${Date.now()}`,
          createdAt: new Date().toISOString(),
        });

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
