// TanStack Query хуки для нотаток.
// Кожен хук обгортає одну серверну операцію з кешуванням.

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateNote as CreateNoteInput, NoteDTO, NoteId, UpdateNote as UpdateNoteInput } from "@demo/shared";
import { createNote, fetchNoteById, fetchNotesMeta, fetchNotesPage, updateNote } from "../lib/api";

// Ключі кешу — однаковий ключ = та сама кеш-запис.
const noteKeys = {
  all: ["notes"] as const,
  meta: ["notes", "meta"] as const,
  paginatedList: (page: number, limit: number) => ["notes", "list", { page, limit }] as const,
  detail: (id: NoteId) => ["notes", "detail", id] as const,
};

/** Загальна кількість нотаток (для підрахунку сторінок). */
export function useNotesMeta() {
  return useQuery({
    queryKey: noteKeys.meta,
    queryFn: ({ signal }) => fetchNotesMeta({ signal }),
  });
}

/** Одна сторінка нотаток для списку. */
export function usePaginatedNotes(page: number, limit: number) {
  return useQuery({
    queryKey: noteKeys.paginatedList(page, limit),
    queryFn: ({ signal }) => fetchNotesPage(page, limit, { signal }),
    placeholderData: keepPreviousData, // показуємо стару сторінку поки вантажиться нова
  });
}

/** Одна нотатка за id (для редактора). */
export function useNote(id: NoteId | undefined, placeholder?: NoteDTO) {
  return useQuery({
    queryKey: noteKeys.detail(id as NoteId),
    queryFn: ({ signal }) => fetchNoteById(id as NoteId, { signal }),
    enabled: Boolean(id),
    placeholderData: placeholder, // показуємо дані зі списку поки вантажиться деталь
  });
}

/** Створити нову нотатку, потім оновити кеш. */
export function useCreateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (note: CreateNoteInput) => createNote(note),
    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: noteKeys.all }),
        queryClient.invalidateQueries({ queryKey: noteKeys.meta }),
      ]);
    },
  });
}

/** Зберегти зміни нотатки, потім оновити кеш. */
export function useUpdateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, note }: { id: NoteId; note: UpdateNoteInput }) => updateNote(id, note),
    onSettled: async (_data, _error, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: noteKeys.all }),
        queryClient.invalidateQueries({ queryKey: noteKeys.meta }),
        queryClient.invalidateQueries({ queryKey: noteKeys.detail(variables.id) }),
      ]);
    },
  });
}
