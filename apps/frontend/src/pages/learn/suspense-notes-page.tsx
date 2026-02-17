import { Component, Suspense, type ReactNode } from "react";
import { QueryErrorResetBoundary, useSuspenseQuery } from "@tanstack/react-query";
import { notesListQueryOptions } from "@/lib/api";
import { NotesGrid } from "@/components/notes-grid";

type NotesErrorBoundaryProps = {
  children: ReactNode;
  onReset: () => void;
};

type NotesErrorBoundaryState = {
  error: Error | null;
};

class NotesErrorBoundary extends Component<NotesErrorBoundaryProps, NotesErrorBoundaryState> {
  state: NotesErrorBoundaryState = {
    error: null,
  };

  static getDerivedStateFromError(error: Error): NotesErrorBoundaryState {
    return { error };
  }

  private handleRetry = () => {
    this.setState({ error: null });
    this.props.onReset();
  };

  render() {
    if (this.state.error) {
      return (
        <NotesGrid
          isLoading={false}
          notes={[]}
          emptyMessage='Create a note to see your cache populate and re-render instantly.'
          hasError
          errorMessage={this.state.error.message}
          onRetry={this.handleRetry}
        />
      );
    }

    return this.props.children;
  }
}

function SuspenseNotesContent() {
  const notesQuery = useSuspenseQuery(notesListQueryOptions());

  return (
    <NotesGrid
      isLoading={false}
      notes={notesQuery.data}
      emptyMessage='Create a note to see your cache populate and re-render instantly.'
      onRetry={notesQuery.refetch}
    />
  );
}

export function SuspenseNotesPage() {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <NotesErrorBoundary onReset={reset}>
          <Suspense
            fallback={
              <NotesGrid
                isLoading
                notes={[]}
                emptyMessage='Create a note to see your cache populate and re-render instantly.'
              />
            }
          >
            <SuspenseNotesContent />
          </Suspense>
        </NotesErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}
