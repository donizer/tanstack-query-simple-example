import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { queryPersistenceOptions } from "./query-persistence";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./query-client";

export const QueryProvider: React.FC<React.PropsWithChildren<{ preserveEnabled?: boolean }>> = ({
  children,
  preserveEnabled = false,
}) => {
  if (preserveEnabled) {
    return (
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={queryPersistenceOptions}
      >
        {children}
      </PersistQueryClientProvider>
    );
  }

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};
