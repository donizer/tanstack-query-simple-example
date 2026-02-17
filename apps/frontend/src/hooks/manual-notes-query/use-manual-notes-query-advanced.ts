import { useCallback, useEffect, useRef, useState } from "react";
import { fetchManualNotes } from "./fetch-manual-notes";
import type { NoteDTO } from "@demo/shared";
import type { ManualNotesQueryResult, ManualQueryStatus, NotesResponseMeta } from "./types";

/**
 * Manual Query QoL Checklist (Advanced)
 *
 * Adds compared to intermediate:
 * - Abort-based cancellation
 * - Stale response protection via request id
 *
 * Still missing vs TanStack Query:
 * - Shared cache or cross-component deduplication
 * - Query invalidation graph and key-based orchestration
 * - Configurable stale/cache lifetime policies
 * - Built-in background refetch triggers (focus/reconnect)
 * - Prefetch and cache-warming APIs
 */

export const useManualNotesQueryAdvanced = (): ManualNotesQueryResult => {
  const [data, setData] = useState<NoteDTO[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<ManualQueryStatus>("pending");
  const [isFetching, setIsFetching] = useState(true);
  const [fetchedAtIso, setFetchedAtIso] = useState<string | null>(null);
  const [meta, setMeta] = useState<NotesResponseMeta | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const latestRequestIdRef = useRef(0);

  useEffect(() => {
    const controller = new AbortController();
    const currentRequestId = latestRequestIdRef.current + 1;
    latestRequestIdRef.current = currentRequestId;

    void fetchManualNotes(controller.signal)
      .then((result) => {
        if (latestRequestIdRef.current !== currentRequestId) {
          return;
        }

        setData(result.notes);
        setMeta(result.meta);
        setFetchedAtIso(new Date().toISOString());
        setStatus("success");
      })
      .catch((caughtError: unknown) => {
        if (latestRequestIdRef.current !== currentRequestId) {
          return;
        }

        if (caughtError instanceof Error && caughtError.name === "AbortError") {
          return;
        }

        setStatus("error");
        setError(caughtError instanceof Error ? caughtError.message : "Unknown error");
      })
      .finally(() => {
        if (latestRequestIdRef.current === currentRequestId) {
          setIsFetching(false);
        }
      });

    return () => {
      controller.abort();
    };
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
