import { AlertCircle, RefreshCw, Skull } from "lucide-react";
import { NotesGrid } from "@/components/notes-grid";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAPIPlaceholders, useManualNotesQueryAdvanced } from "@/hooks/manual-notes-query";

export function ShittyUseEffectPage() {
  const query = useAPIPlaceholders(useManualNotesQueryAdvanced());

  const queryLikeDebugLine = [
    `status=${query.status}`,
    `isLoading=${query.isLoading}`,
    `isFetching=${query.isFetching}`,
    `fetchedAt=${query.fetchedAtIso ?? "never"}`,
    `httpStatus=${query.meta?.statusCode ?? "n/a"}`,
    `latencyMs=${query.meta?.latencyMs ?? "n/a"}`,
  ].join(" | ");

  return (
    <section className='space-y-5'>
      <Card className='border-dashed'>
        <CardHeader className='space-y-2'>
          <CardTitle className='flex items-center gap-2'>
            <Skull className='h-5 w-5' />
            Manual Query With `useEffect` (No TanStack)
          </CardTitle>

          <p className='text-sm text-muted-foreground'>
            With TanStack Query you think about what data you want. With this custom hook you have to think about how
            loading, cancellation, errors, status transitions, and refetching work.
          </p>

          <p className='text-xs text-muted-foreground'>
            API placeholders pattern: `useAPIPlaceholders(useManualNotesQueryNaive())`
          </p>
        </CardHeader>

        <CardContent className='space-y-3'>
          <div className='flex flex-wrap items-center gap-2'>
            <Button
              variant='secondary'
              onClick={query.refetch}
              // disabled={query.isFetching}
            >
              <RefreshCw className='mr-2 h-4 w-4' />
              Refetch manually
            </Button>

            {query.isFetching ? (
              <Badge>Fetching manually...</Badge>
            ) : query.status === "error" ? (
              <Badge variant='destructive'>Error</Badge>
            ) : (
              <Badge variant='secondary'>Idle</Badge>
            )}

            <Badge variant='outline'>Naive status: {query.status}</Badge>
          </div>

          <p className='text-xs text-muted-foreground'>{queryLikeDebugLine}</p>
          <p className='line-clamp-2 text-xs text-muted-foreground'>{query.meta?.headersText ?? "no headers yet"}</p>

          {query.error ? (
            <Alert variant='destructive'>
              <AlertCircle className='h-4 w-4' />
              <AlertTitle>Manually managed error state</AlertTitle>
              <AlertDescription>{query.error}</AlertDescription>
            </Alert>
          ) : null}
        </CardContent>
      </Card>

      <NotesGrid
        isLoading={query.isLoading}
        notes={query.data}
        emptyMessage='No notes loaded by manual hook.'
        hasError={Boolean(query.error)}
        errorMessage={query.error ?? undefined}
        onRetry={query.refetch}
      />
    </section>
  );
}
