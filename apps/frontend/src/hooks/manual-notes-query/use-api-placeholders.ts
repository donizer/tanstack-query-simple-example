import type { ManualNotesQueryInput, ManualNotesQueryResult } from "./types";

const noopRefetch = () => undefined;

export const useAPIPlaceholders = (query: ManualNotesQueryInput): ManualNotesQueryResult => {
  const data = query.data ?? [];
  const error = query.error ?? null;
  const isLoading = query.isLoading ?? false;

  return {
    data,
    error,
    status: query.status ?? (isLoading ? "pending" : error ? "error" : "success"),
    isLoading,
    isFetching: query.isFetching ?? isLoading,
    fetchedAtIso: query.fetchedAtIso ?? null,
    meta: query.meta ?? null,
    refetch: query.refetch ?? noopRefetch,
  };
};
