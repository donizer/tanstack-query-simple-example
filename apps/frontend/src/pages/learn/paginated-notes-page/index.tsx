import { NotesGrid } from "@/components/notes-grid";
import { useNotesMeta } from "@/hooks/use-notes";
import { useNotesPagination } from "./hooks/useNotesPagination";

const PAGE_SIZE = 6;

export function PaginatedNotesPage() {
  const notesMetaQuery = useNotesMeta();
  const { paginatedNotesQuery, NotesPagination, totalItems } = useNotesPagination(PAGE_SIZE);

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

      {!isPagesLoading && hasPages && <NotesPagination />}
    </section>
  );
}
