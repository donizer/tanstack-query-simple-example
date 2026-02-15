import { z } from "zod";

export const NoteSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Title is required"),
  content: z.string(),
  createdAt: z.string(),
  status: z.enum(["active", "archived"]).default("active"),
});

export type Note = z.infer<typeof NoteSchema>;

export const CreateNoteSchema = NoteSchema.omit({ id: true, createdAt: true });
export type CreateNote = z.infer<typeof CreateNoteSchema>;

export class NoteDTO implements Note {
  id: Note["id"];
  title: Note["title"];
  content: Note["content"];
  createdAt: Note["createdAt"];
  status: Note["status"];

  constructor(note: Note) {
    this.id = note.id;
    this.title = note.title;
    this.content = note.content;
    this.createdAt = note.createdAt;
    this.status = note.status;
  }

  private statusTitleMap: Record<Note["status"], string> = {
    active: "Active",
    archived: "Archived",
  };

  get formattedDate() {
    return new Date(this.createdAt).toLocaleString();
  }

  get formattedStatus() {
    return this.statusTitleMap[this.status];
  }
}
export const NoteDTOSchema = NoteSchema.transform((note) => new NoteDTO(note));
