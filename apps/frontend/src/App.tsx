import { useEffect, useMemo, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Link, Navigate, Route, Routes, useLocation, useSearchParams } from "react-router-dom";
import { generateRandomNote } from "./utils/noteGenerator";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useInfiniteNotes, useNotes, useCreateNote, usePaginatedNotes } from "./hooks/use-notes";
import { NoteCard } from "./components/note-card";
import { noteKeys } from "./lib/api";
import { NoteDTO } from "@demo/shared";

const PAGE_SIZE = 6;

type NotesGridProps = {
  isLoading: boolean;
  notes: NoteDTO[] | undefined;
  emptyMessage?: string;
};

function NotesGrid({ isLoading, notes, emptyMessage = "No notes found. Click generate to start!" }: NotesGridProps) {
  if (isLoading) {
    return (
      <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
        {[...Array(6)].map((_, index) => (
          <Card
            key={index}
            className='flex h-50 flex-col'
          >
            <CardHeader>
              <Skeleton className='h-6 w-2/3' />
            </CardHeader>
            <CardContent>
              <Skeleton className='mb-2 h-4 w-full' />
              <Skeleton className='h-4 w-5/6' />
            </CardContent>
            <CardFooter className='mt-auto'>
              <Skeleton className='h-9 w-20' />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (!notes?.length) {
    return (
      <div className='rounded-lg border-2 border-dashed py-20 text-center'>
        <p className='text-lg text-muted-foreground'>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
      {notes.map((note) => (
        <NoteCard
          key={note.id}
          note={note}
        />
      ))}
    </div>
  );
}

function ExampleTab() {
  const notesQuery = useNotes();

  return (
    <NotesGrid
      isLoading={notesQuery.isLoading}
      notes={notesQuery.data}
    />
  );
}

function PaginationTab() {
  const [searchParams, setSearchParams] = useSearchParams();
  const pageFromUrl = Number(searchParams.get("page") ?? 1);
  const currentPage = Number.isFinite(pageFromUrl) ? Math.max(1, pageFromUrl) : 1;
  const paginatedNotesQuery = usePaginatedNotes(currentPage, PAGE_SIZE);

  const totalItems = paginatedNotesQuery.data?.pagination.total ?? 0;
  const totalPages = paginatedNotesQuery.data?.pagination.totalPages ?? 1;
  const paginatedNotes = paginatedNotesQuery.data?.data;

  const setPage = (page: number) => {
    const nextPage = Math.min(Math.max(1, page), totalPages);
    setSearchParams(nextPage > 1 ? { page: String(nextPage) } : {});
  };

  return (
    <div className='space-y-6'>
      <NotesGrid
        isLoading={paginatedNotesQuery.isLoading}
        notes={paginatedNotes}
        emptyMessage='No notes found for this page.'
      />

      {!paginatedNotesQuery.isLoading && totalItems > 0 && (
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

            {Array.from({ length: totalPages }).map((_, index) => {
              const page = index + 1;

              return (
                <PaginationItem key={page}>
                  <PaginationLink
                    href='#'
                    isActive={page === currentPage}
                    onClick={(event) => {
                      event.preventDefault();
                      setPage(page);
                    }}
                  >
                    {page}
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
    </div>
  );
}

function InfiniteScrollTab() {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const infiniteQuery = useInfiniteNotes(PAGE_SIZE);

  const notes = useMemo(
    () => infiniteQuery.data?.pages.flatMap((page) => page.data) ?? [],
    [infiniteQuery.data?.pages],
  );

  useEffect(() => {
    const sentinel = sentinelRef.current;

    if (!sentinel) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];

        if (entry.isIntersecting && infiniteQuery.hasNextPage && !infiniteQuery.isFetchingNextPage) {
          void infiniteQuery.fetchNextPage();
        }
      },
      {
        rootMargin: "200px",
      },
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [infiniteQuery]);

  return (
    <div className='space-y-6'>
      <NotesGrid
        isLoading={infiniteQuery.isLoading}
        notes={notes}
        emptyMessage='No notes found.'
      />

      <div
        ref={sentinelRef}
        className='flex min-h-8 items-center justify-center'
      >
        {infiniteQuery.isFetchingNextPage ? (
          <Badge
            variant='secondary'
            className='flex items-center gap-2'
          >
            <Spinner className='h-3 w-3' />
            Loading more...
          </Badge>
        ) : !infiniteQuery.hasNextPage && notes.length > 0 ? (
          <p className='text-sm text-muted-foreground'>You reached the end.</p>
        ) : null}
      </div>
    </div>
  );
}

function App() {
  const location = useLocation();
  const queryClient = useQueryClient();
  const notesQuery = useNotes();
  const createMutation = useCreateNote();

  const activeTab = location.pathname.startsWith("/pagination")
    ? "pagination"
    : location.pathname.startsWith("/infinite-scroll")
      ? "infinite-scroll"
      : "example";

  const handleGenerateNote = () => {
    createMutation.mutate(generateRandomNote());
  };

  return (
    <div className='container mx-auto py-10 space-y-8'>
      <div className='flex items-center justify-between'>
        <h1 className='text-4xl font-bold tracking-tight'>Note Taking App</h1>
        {notesQuery.isFetching && (
          <Badge
            variant='secondary'
            className='flex items-center gap-2'
          >
            <Spinner className='h-3 w-3' />
            Syncing...
          </Badge>
        )}
      </div>

      <div className='flex gap-4'>
        <Button onClick={handleGenerateNote}>
          {createMutation.isPending ? (
            <>
              <Spinner className='mr-2 h-4 w-4' />
              Generating...
            </>
          ) : (
            "Generate Random Note"
          )}
        </Button>
        <Button
          variant='outline'
          onClick={() => queryClient.invalidateQueries({ queryKey: noteKeys.all })}
        >
          Refresh Cache
        </Button>
      </div>

      <Tabs
        value={activeTab}
        className='w-full'
      >
        <TabsList>
          <TabsTrigger
            value='example'
            asChild
          >
            <Link to='/example'>Example</Link>
          </TabsTrigger>
          <TabsTrigger
            value='pagination'
            asChild
          >
            <Link to='/pagination'>Pagination</Link>
          </TabsTrigger>
          <TabsTrigger
            value='infinite-scroll'
            asChild
          >
            <Link to='/infinite-scroll'>Infinite Scroll</Link>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <Routes>
        <Route
          path='/'
          element={
            <Navigate
              to='/example'
              replace
            />
          }
        />
        <Route
          path='/example'
          element={<ExampleTab />}
        />
        <Route
          path='/pagination'
          element={<PaginationTab />}
        />
        <Route
          path='/infinite-scroll'
          element={<InfiniteScrollTab />}
        />
      </Routes>
    </div>
  );
}

export default App;
