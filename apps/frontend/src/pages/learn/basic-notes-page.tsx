import { useNotes } from "@/hooks/use-notes";
import { NotesGrid } from "@/components/notes-grid";

export function BasicNotesPage() {
  const notesQuery = useNotes();

  return (
    <NotesGrid
      isLoading={notesQuery.isLoading}
      notes={notesQuery.data}
      emptyMessage='Create a note to see your cache populate and re-render instantly.'
      hasError={notesQuery.isError}
      errorMessage={notesQuery.error instanceof Error ? notesQuery.error.message : undefined}
      onRetry={() => notesQuery.refetch()}
    />
  );
}
