import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export const AppPagination = ({
  currentPage,
  setPage,
  paginationItems,
  totalPages,
}: {
  paginationItems: ("ellipsis" | number)[];
  currentPage: number;
  setPage: (page: number) => void;
  totalPages: number;
}) => {
  return (
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
  );
};
