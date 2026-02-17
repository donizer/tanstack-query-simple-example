import { useCallback, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { NotesGrid } from "@/components/notes-grid";
import { useNotesMeta, usePaginatedNotes, usePrefetchPaginatedNotes } from "@/hooks/use-notes";
import { NotesPagination } from "./notes-pagination";

const PAGE_SIZE = 6;

const getPageFromSearchParam = (value: string | null) => {
  const parsed = Number(value ?? 1);

  if (!Number.isFinite(parsed)) {
    return 1;
  }

  return Math.max(1, parsed);
};

const getVisiblePaginationItems = (currentPage: number, totalPages: number): ("ellipsis" | number)[] => {
  const FIXED_SLOT_COUNT = 7;

  if (totalPages <= FIXED_SLOT_COUNT) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const firstPage = 1;
  const lastPage = totalPages;

  if (currentPage <= 4) {
    return [firstPage, 2, 3, 4, 5, "ellipsis", lastPage] as const;
  }

  if (currentPage >= totalPages - 3) {
    return [firstPage, "ellipsis", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, lastPage] as const;
  }

  return [firstPage, "ellipsis", currentPage - 1, currentPage, currentPage + 1, "ellipsis", lastPage] as const;
};

const usePagination = () => {
  const notesMetaQuery = useNotesMeta();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = getPageFromSearchParam(searchParams.get("page"));
  const totalItems = notesMetaQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));

  useEffect(() => {
    if (currentPage <= totalPages) {
      return;
    }

    setSearchParams(totalPages > 1 ? { page: String(totalPages) } : {});
  }, [currentPage, totalPages, setSearchParams]);

  const setPage = useCallback(
    (page: number) => {
      const safePage = Math.min(Math.max(1, page), totalPages);
      setSearchParams(safePage > 1 ? { page: String(safePage) } : {});
    },
    [setSearchParams, totalPages],
  );

  const paginationItems = getVisiblePaginationItems(currentPage, totalPages);
  const paginatedNotesQuery = usePaginatedNotes(currentPage, PAGE_SIZE);

  usePrefetchPaginatedNotes({
    page: currentPage,
    limit: PAGE_SIZE,
    enabled: currentPage < totalPages,
  });

  return { paginatedNotesQuery, totalItems, setPage, currentPage, totalPages, paginationItems };
};

export function PaginatedNotesPage() {
  const notesMetaQuery = useNotesMeta();
  const { paginatedNotesQuery, totalItems, setPage, currentPage, totalPages, paginationItems } = usePagination();

  const isPagesLoading = paginatedNotesQuery.isLoading || notesMetaQuery.isLoading;
  const hasPages = totalItems > 0;

  return (
    <section className='space-y-5'>
      <NotesGrid
        isLoading={isPagesLoading}
        notes={paginatedNotesQuery.data?.data}
        emptyMessage='No notes for this page yet.'
        hasError={paginatedNotesQuery.isError}
        errorMessage={paginatedNotesQuery.error instanceof Error ? paginatedNotesQuery.error.message : undefined}
        onRetry={paginatedNotesQuery.refetch}
      />

      {!isPagesLoading && hasPages && (
        <NotesPagination
          currentPage={currentPage}
          setPage={setPage}
          paginationItems={paginationItems}
          totalPages={totalPages}
        />
      )}
    </section>
  );
}
