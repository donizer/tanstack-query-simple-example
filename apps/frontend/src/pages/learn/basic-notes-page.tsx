import { useNotes } from "@/hooks/use-notes";
import { NotesGrid } from "@/components/notes-grid";

export function BasicNotesPage() {
  const { data: notes, isLoading, isError, error, refetch } = useNotes();

  return (
    <NotesGrid
      isLoading={isLoading}
      notes={notes}
      emptyMessage='Create a note to see your cache populate and re-render instantly.'
      hasError={isError}
      errorMessage={error instanceof Error ? error.message : undefined}
      onRetry={refetch}
    />
  );
}
