import { useNotesMeta, usePaginatedNotes, usePrefetchPaginatedNotes } from "@/hooks/use-notes";
import { useCallback, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { AppPagination } from "@/components/app-pagination";

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

export const useNotesPagination = (limit: number) => {
  const notesMetaQuery = useNotesMeta();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = getPageFromSearchParam(searchParams.get("page"));
  const totalItems = notesMetaQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));

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
  const paginatedNotesQuery = usePaginatedNotes(currentPage, limit);

  usePrefetchPaginatedNotes({
    page: currentPage,
    limit,
    enabled: currentPage < totalPages,
  });

  const NotesPagination = useCallback(() => {
    return (
      <AppPagination
        currentPage={currentPage}
        setPage={setPage}
        paginationItems={paginationItems}
        totalPages={totalPages}
      />
    );
  }, [currentPage, setPage, paginationItems, totalPages]);

  return {
    paginatedNotesQuery,
    NotesPagination,
    totalItems,
  };
};
