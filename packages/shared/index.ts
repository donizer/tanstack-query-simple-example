import { z } from "zod";

export const NoteDBSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Title is required"),
  content: z.string(),
  createdAt: z.string(),
  status: z.enum(["active", "archived"]).default("active"),
});

export type NoteDB = z.infer<typeof NoteDBSchema>;

export const CreateNoteSchema = NoteDBSchema.omit({ id: true, createdAt: true });
export type CreateNote = z.infer<typeof CreateNoteSchema>;

export class NoteDTO {
  id: NoteDB["id"];
  title: NoteDB["title"];
  content: NoteDB["content"];
  createdAt: Date;
  status: NoteDB["status"];

  constructor(note: NoteDB) {
    this.id = note.id;
    this.title = note.title;
    this.content = note.content;
    this.createdAt = new Date(note.createdAt);
    this.status = note.status;
  }

  private statusTitleMap: Record<NoteDB["status"], string> = {
    active: "Active",
    archived: "Archived",
  };

  get formattedDate() {
    return this.createdAt.toLocaleString();
  }

  get formattedStatus() {
    return this.statusTitleMap[this.status];
  }
}
export const NoteDTOSchema = NoteDBSchema.transform((note) => new NoteDTO(note));
