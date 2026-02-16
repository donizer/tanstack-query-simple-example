import { NoteDTOSchema, type CreateNote, type NoteId, type UpdateNote } from "@demo/shared";
import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
import { z } from "zod";

const API_URL = "http://localhost:3001/api/notes";

export const noteKeys = {
  all: ["notes"] as const,
  mutations: {
    all: () => [...noteKeys.all, "mutation"] as const,
    create: () => [...noteKeys.mutations.all(), "create"] as const,
    update: () => [...noteKeys.mutations.all(), "update"] as const,
    delete: () => [...noteKeys.mutations.all(), "delete"] as const,
  },
  meta: () => [...noteKeys.all, "meta"] as const,
  lists: () => [...noteKeys.all, "list"] as const,
  paginatedList: (page: number, limit: number) => [...noteKeys.lists(), { page, limit }] as const,
  infiniteList: (limit: number) => [...noteKeys.lists(), "infinite", { limit }] as const,
  details: () => [...noteKeys.all, "detail"] as const,
  detail: (id: NoteId) => [...noteKeys.details(), id] as const,
};

const NotesMetaSchema = z.object({
  total: z.number().int().nonnegative(),
});

const PaginatedNotesResponseSchema = z.object({
  data: NoteDTOSchema.array(),
  pagination: z.object({
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    hasNextPage: z.boolean(),
    hasPreviousPage: z.boolean(),
  }),
});

export type PaginatedNotesResponse = z.infer<typeof PaginatedNotesResponseSchema>;
export type NotesMeta = z.infer<typeof NotesMetaSchema>;

type FetchOptions = {
  signal?: AbortSignal;
};

const getJson = async <T>(
  url: string,
  errorMessage: string,
  parser: (input: unknown) => T,
  options?: FetchOptions,
): Promise<T> => {
  const response = await fetch(url, { signal: options?.signal });

  if (!response.ok) {
    throw new Error(errorMessage);
  }

  const payload = await response.json();
  return parser(payload);
};

export const fetchNotes = async (options?: FetchOptions) => {
  return getJson(API_URL, "Failed to fetch notes", (payload) => NoteDTOSchema.array().parse(payload), options);
};

export const fetchNotesPage = async (page: number, limit: number, options?: FetchOptions) => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  const res = await fetch(`${API_URL}?${params.toString()}`, { signal: options?.signal });
  if (!res.ok) throw new Error("Failed to fetch notes page");

  const data = await res.json();
  return PaginatedNotesResponseSchema.parse(data);
};

export const fetchNotesMeta = async (options?: FetchOptions) => {
  return getJson(
    `${API_URL}/meta`,
    "Failed to fetch notes metadata",
    (payload) => NotesMetaSchema.parse(payload),
    options,
  );
};

export const fetchNoteById = async (id: NoteId, options?: FetchOptions) => {
  return getJson(`${API_URL}/${id}`, "Failed to fetch note", (payload) => NoteDTOSchema.parse(payload), options);
};

export const createNote = async (note: CreateNote) => {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(note),
  });
  if (!res.ok) throw new Error("Failed to create note");
  return NoteDTOSchema.parse(await res.json());
};

export const deleteNote = async (id: NoteId) => {
  const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete note");
};

export const updateNote = async (id: NoteId, note: UpdateNote) => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(note),
  });

  if (!res.ok) throw new Error("Failed to update note");
  return NoteDTOSchema.parse(await res.json());
};

export const notesListQueryOptions = () =>
  queryOptions({
    queryKey: noteKeys.all,
    queryFn: ({ signal }) => fetchNotes({ signal }),
  });

export const noteDetailQueryOptions = (id: NoteId) =>
  queryOptions({
    queryKey: noteKeys.detail(id),
    queryFn: ({ signal }) => fetchNoteById(id, { signal }),
  });

export const notesMetaQueryOptions = () =>
  queryOptions({
    queryKey: noteKeys.meta(),
    queryFn: ({ signal }) => fetchNotesMeta({ signal }),
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
    getNextPageParam: (lastPage) => {
      if (!lastPage.pagination.hasNextPage) {
        return undefined;
      }

      return lastPage.pagination.page + 1;
    },
  });
