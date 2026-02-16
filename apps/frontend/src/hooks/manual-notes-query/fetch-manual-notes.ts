import { NoteDTOSchema, type NoteDTO } from "@demo/shared";
import type { NotesResponseMeta } from "./types";

const NOTES_API_URL = "http://localhost:3001/api/notes";
const PAGE = 1;
const LIMIT = 12;

export const fetchManualNotes = async (
  signal?: AbortSignal,
): Promise<{ notes: NoteDTO[]; meta: NotesResponseMeta }> => {
  const url = new URL(NOTES_API_URL);
  url.searchParams.set("page", String(PAGE));
  url.searchParams.set("limit", String(LIMIT));

  const startedAt = performance.now();
  const response = await fetch(url.toString(), { signal });
  const latencyMs = Math.round(performance.now() - startedAt);

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  const payload = (await response.json()) as unknown;
  const parsed = NoteDTOSchema.array().safeParse((payload as { data?: unknown }).data ?? payload);

  if (!parsed.success) {
    throw new Error("Could not validate notes payload");
  }

  const headersText = Array.from(response.headers)
    .map(([key, value]) => `${key}=${value}`)
    .join(" | ");

  return {
    notes: parsed.data,
    meta: {
      statusCode: response.status,
      latencyMs,
      headersText,
    },
  };
};
