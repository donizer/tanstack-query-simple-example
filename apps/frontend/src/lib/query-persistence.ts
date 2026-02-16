import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";

export const queryCachePersister = createSyncStoragePersister({
  storage: typeof window !== "undefined" ? window.localStorage : undefined,
  key: "query-demo-notes-cache",
  throttleTime: 1_000,
});

export const queryPersistenceOptions = {
  persister: queryCachePersister,
  maxAge: 24 * 60 * 60 * 1_000,
  buster: "v1",
} as const;
