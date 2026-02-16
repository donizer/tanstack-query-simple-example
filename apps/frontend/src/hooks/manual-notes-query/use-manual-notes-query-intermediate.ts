import { useCallback, useEffect, useState } from "react";
import type { NoteDTO } from "@demo/shared";
import { fetchManualNotes } from "./fetch-manual-notes";
import type { ManualNotesQueryResult, ManualQueryStatus, NotesResponseMeta } from "./types";

/**
 * Manual Query QoL Checklist (Intermediate)
 *
 * Adds compared to naive:
 * - Explicit status model
 * - Metadata and fetched timestamp
 * - Manual `refetch`
 *
 * Still missing vs TanStack Query:
 * - Request cancellation
 * - Race/stale response protection
 * - Shared cache or cross-component deduplication
 * - Stale/cache lifetime controls
 * - Retry/backoff strategy
 * - Prefetch/invalidation graph
 */

export const useManualNotesQueryIntermediate = (): ManualNotesQueryResult => {
  const [data, setData] = useState<NoteDTO[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<ManualQueryStatus>("pending");
  const [isFetching, setIsFetching] = useState(true);
  const [fetchedAtIso, setFetchedAtIso] = useState<string | null>(null);
  const [meta, setMeta] = useState<NotesResponseMeta | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    void fetchManualNotes()
      .then((result) => {
        setData(result.notes);
        setMeta(result.meta);
        setFetchedAtIso(new Date().toISOString());
        setStatus("success");
      })
      .catch((caughtError: unknown) => {
        setStatus("error");
        setError(caughtError instanceof Error ? caughtError.message : "Unknown error");
      })
      .finally(() => {
        setIsFetching(false);
      });
  }, [reloadToken]);

  const refetch = useCallback(() => {
    setIsFetching(true);
    setError(null);
    setReloadToken((currentValue) => currentValue + 1);
  }, []);

  return {
    data,
    error,
    status,
    isLoading: status === "pending" && data.length === 0,
    isFetching,
    fetchedAtIso,
    meta,
    refetch,
  };
};
