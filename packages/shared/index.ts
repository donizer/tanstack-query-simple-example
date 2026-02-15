import { z } from "zod";

export const NoteSharedSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Title is required"),
  content: z.string(),
  status: z.enum(["active", "archived"]).default("active"),
});

export const NoteDBSchema = NoteSharedSchema.extend({
  createdAt: z.string(),
});
export const NoteAppSchema = NoteSharedSchema.extend({
  createdAt: z.string().transform((str) => new Date(str)),
});

export type NoteDB = z.input<typeof NoteDBSchema>;
export type NoteApp = z.output<typeof NoteAppSchema>;

export const CreateNoteSchema = NoteDBSchema.pick({ title: true, content: true });
export type CreateNote = z.infer<typeof CreateNoteSchema>;

export const UpdateNoteSchema = NoteDBSchema.pick({ title: true, content: true });
export type UpdateNote = z.infer<typeof UpdateNoteSchema>;

export class NoteDTO implements NoteApp {
  id: NoteDB["id"];
  title: NoteDB["title"];
  content: NoteDB["content"];
  createdAt: Date;
  status: NoteApp["status"];
  offline: boolean;

  constructor(_note: NoteDB, options?: { offline?: boolean }) {
    const note = NoteAppSchema.parse(_note);

    this.id = note.id;
    this.title = note.title;
    this.content = note.content;
    this.createdAt = new Date(note.createdAt);
    this.status = note.status;
    this.offline = options?.offline ?? false;
  }

  get formattedDate() {
    return this.createdAt.toLocaleString();
  }

  get formattedStatus() {
    switch (this.status) {
      case "active": {
        return "Active";
      }
      case "archived": {
        return "Archived";
      }
      default: {
        return "Unknown";
      }
    }
  }
}
export const NoteDTOSchema = NoteDBSchema.transform((note) => new NoteDTO(note));
