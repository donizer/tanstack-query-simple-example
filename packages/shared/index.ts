import { z } from "zod";

export const NoteSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Title is required"),
  content: z.string(),
  createdAt: z.string(),
});

export type Note = z.infer<typeof NoteSchema>;

export const CreateNoteSchema = NoteSchema.omit({ id: true, createdAt: true });
export type CreateNote = z.infer<typeof CreateNoteSchema>;
