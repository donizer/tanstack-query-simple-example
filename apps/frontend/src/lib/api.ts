import { NoteDTOSchema, type CreateNote, type UpdateNote } from "@demo/shared";
import { z } from "zod";

const API_URL = "http://localhost:3001/api/notes";

export const noteKeys = {
  all: ["notes"] as const,
  meta: () => [...noteKeys.all, "meta"] as const,
  lists: () => [...noteKeys.all, "list"] as const,
  list: (filters: string) => [...noteKeys.lists(), { filters }] as const,
  paginatedList: (page: number, limit: number) => [...noteKeys.lists(), { page, limit }] as const,
  infiniteList: (limit: number) => [...noteKeys.lists(), "infinite", { limit }] as const,
  details: () => [...noteKeys.all, "detail"] as const,
  detail: (id: string) => [...noteKeys.details(), id] as const,
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

export const fetchNotes = async () => {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error("Failed to fetch notes");
  const data = await res.json();
  return NoteDTOSchema.array().parse(data);
};

export const fetchNotesPage = async (page: number, limit: number) => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  const res = await fetch(`${API_URL}?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch notes page");

  const data = await res.json();
  return PaginatedNotesResponseSchema.parse(data);
};

export const fetchNotesMeta = async () => {
  const res = await fetch(`${API_URL}/meta`);
  if (!res.ok) throw new Error("Failed to fetch notes metadata");

  const data = await res.json();
  return NotesMetaSchema.parse(data);
};

export const fetchNoteById = async (id: string) => {
  const res = await fetch(`${API_URL}/${id}`);
  if (!res.ok) throw new Error("Failed to fetch note");

  return NoteDTOSchema.parse(await res.json());
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

export const deleteNote = async (id: string) => {
  const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete note");
};

export const updateNote = async (id: string, note: UpdateNote) => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(note),
  });

  if (!res.ok) throw new Error("Failed to update note");
  return NoteDTOSchema.parse(await res.json());
};
