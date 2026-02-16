import { useCallback, useMemo, useRef } from "react";
import { useInfiniteNotes } from "@/hooks/use-notes";
import { useIntersectionLoader } from "@/hooks/use-intersection-loader";
import { NotesGrid } from "@/components/notes-grid";
import { LoadMoreIndicator } from "@/components/load-more-indicator";

const PAGE_SIZE = 6;

export function InfiniteNotesPage() {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const infiniteNotesQuery = useInfiniteNotes(PAGE_SIZE);

  const notes = useMemo(
    () => infiniteNotesQuery.data?.pages.flatMap((page) => page.data) ?? [],
    [infiniteNotesQuery.data?.pages],
  );

  const loadNextPage = useCallback(() => {
    if (infiniteNotesQuery.hasNextPage && !infiniteNotesQuery.isFetchingNextPage) {
      void infiniteNotesQuery.fetchNextPage();
    }
  }, [infiniteNotesQuery]);

  useIntersectionLoader({
    targetRef: sentinelRef,
    onIntersect: loadNextPage,
    enabled: infiniteNotesQuery.hasNextPage,
    rootMargin: "220px",
  });

  return (
    <section className='space-y-5'>
      <NotesGrid
        isLoading={infiniteNotesQuery.isLoading}
        notes={notes}
        emptyMessage='No notes available in this feed yet.'
        hasError={infiniteNotesQuery.isError}
        errorMessage={infiniteNotesQuery.error instanceof Error ? infiniteNotesQuery.error.message : undefined}
        onRetry={() => infiniteNotesQuery.refetch()}
      />

      <div
        ref={sentinelRef}
        className='flex min-h-8 items-center justify-center'
      >
        <LoadMoreIndicator
          isLoading={infiniteNotesQuery.isFetchingNextPage}
          hasNextPage={infiniteNotesQuery.hasNextPage}
          hasItems={notes.length > 0}
          endLabel='No more notes to load.'
        />
      </div>
    </section>
  );
}
