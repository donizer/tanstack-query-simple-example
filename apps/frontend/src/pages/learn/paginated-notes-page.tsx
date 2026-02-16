import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { NotesGrid } from "@/components/notes-grid";
import { useNotesMeta, usePaginatedNotes, usePrefetchPaginatedNotes } from "@/hooks/use-notes";

const PAGE_SIZE = 6;

const getPageFromSearchParam = (value: string | null) => {
  const parsed = Number(value ?? 1);

  if (!Number.isFinite(parsed)) {
    return 1;
  }

  return Math.max(1, parsed);
};

const getVisiblePaginationItems = (currentPage: number, totalPages: number) => {
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

export function PaginatedNotesPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const currentPage = getPageFromSearchParam(searchParams.get("page"));
  const notesMetaQuery = useNotesMeta();
  const paginatedNotesQuery = usePaginatedNotes(currentPage, PAGE_SIZE);

  const totalItems = notesMetaQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const paginationItems = getVisiblePaginationItems(currentPage, totalPages);

  usePrefetchPaginatedNotes({
    page: currentPage,
    limit: PAGE_SIZE,
    enabled: currentPage < totalPages,
  });

  useEffect(() => {
    if (currentPage <= totalPages) {
      return;
    }

    setSearchParams(totalPages > 1 ? { page: String(totalPages) } : {});
  }, [currentPage, totalPages, setSearchParams]);

  const setPage = (page: number) => {
    const safePage = Math.min(Math.max(1, page), totalPages);
    setSearchParams(safePage > 1 ? { page: String(safePage) } : {});
  };

  return (
    <section className='space-y-5'>
      <NotesGrid
        isLoading={paginatedNotesQuery.isLoading}
        notes={paginatedNotesQuery.data?.data}
        emptyMessage='No notes for this page yet.'
        hasError={paginatedNotesQuery.isError}
        errorMessage={paginatedNotesQuery.error instanceof Error ? paginatedNotesQuery.error.message : undefined}
        onRetry={() => paginatedNotesQuery.refetch()}
      />

      {!paginatedNotesQuery.isLoading && !notesMetaQuery.isLoading && totalItems > 0 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href='#'
                onClick={(event) => {
                  event.preventDefault();
                  setPage(currentPage - 1);
                }}
                aria-disabled={currentPage === 1}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : undefined}
              />
            </PaginationItem>

            {paginationItems.map((item, index) => {
              if (item === "ellipsis") {
                return (
                  <PaginationItem key={`ellipsis-${index}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                );
              }

              return (
                <PaginationItem key={item}>
                  <PaginationLink
                    href='#'
                    isActive={item === currentPage}
                    onClick={(event) => {
                      event.preventDefault();
                      setPage(item);
                    }}
                  >
                    {item}
                  </PaginationLink>
                </PaginationItem>
              );
            })}

            <PaginationItem>
              <PaginationNext
                href='#'
                onClick={(event) => {
                  event.preventDefault();
                  setPage(currentPage + 1);
                }}
                aria-disabled={currentPage === totalPages}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : undefined}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </section>
  );
}
