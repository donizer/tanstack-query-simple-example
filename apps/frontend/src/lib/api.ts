import { NoteDTOSchema, type CreateNote } from "@demo/shared";

const API_URL = "http://localhost:3001/api/notes";

export const noteKeys = {
  all: ["notes"] as const,
  lists: () => [...noteKeys.all, "list"] as const,
  list: (filters: string) => [...noteKeys.lists(), { filters }] as const,
  details: () => [...noteKeys.all, "detail"] as const,
  detail: (id: string) => [...noteKeys.details(), id] as const,
};

export const fetchNotes = async () => {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error("Failed to fetch notes");
  const data = await res.json();
  return NoteDTOSchema.array().parse(data);
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
