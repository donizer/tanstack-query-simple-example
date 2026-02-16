import { useEffect, useState } from "react";
import type { NoteDTO } from "@demo/shared";
import { fetchManualNotes } from "./fetch-manual-notes";
import type { ManualNotesQueryInput } from "./types";

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
