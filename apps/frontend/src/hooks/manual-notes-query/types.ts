import type { NoteDTO } from "@demo/shared";

export type NotesResponseMeta = {
  statusCode: number;
  latencyMs: number;
  headersText: string;
};

export type ManualQueryStatus = "idle" | "pending" | "success" | "error";

export type ManualNotesQueryResult = {
  data: NoteDTO[];
  error: string | null;
  status: ManualQueryStatus;
  isLoading: boolean;
  isFetching: boolean;
  fetchedAtIso: string | null;
  meta: NotesResponseMeta | null;
  refetch: () => void;
};

export type ManualNotesQueryInput = Partial<ManualNotesQueryResult> & {
  data?: NoteDTO[];
  error?: string | null;
};

export type UseManualNotesQueryHook = () => ManualNotesQueryResult;
