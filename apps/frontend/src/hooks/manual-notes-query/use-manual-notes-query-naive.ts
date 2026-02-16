import { useEffect, useState } from "react";
import type { NoteDTO } from "@demo/shared";
import { fetchManualNotes } from "./fetch-manual-notes";
import type { ManualNotesQueryInput } from "./types";

/**
 * Manual Query QoL Checklist (Naive)
 *
 * Missing vs TanStack Query:
 * - No explicit `refetch` API
 * - No cancellation for in-flight requests
 * - No race/stale response protection
 * - No shared cache or cross-component deduplication
 * - No stale/cache lifetime controls
 * - No retry/backoff strategy
 * - No prefetch/invalidation graph
 */

export const useManualNotesQueryNaive = (): ManualNotesQueryInput => {
  const [data, setData] = useState<NoteDTO[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void fetchManualNotes()
      .then((result) => {
        setData(result.notes);
      })
      .catch((caughtError: unknown) => {
        setError(caughtError instanceof Error ? caughtError.message : "Unknown error");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return {
    data,
    error,
    isLoading,
  };
};
