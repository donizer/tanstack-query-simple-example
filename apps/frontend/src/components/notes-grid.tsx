import type { NoteDTO } from "@demo/shared";
import { AlertCircle } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { NoteCard } from "@/components/note-card";

type NotesGridProps = {
  isLoading: boolean;
  notes: NoteDTO[] | undefined;
  emptyMessage: string;
  hasError?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
};

export function NotesGrid({
  isLoading,
  notes,
  emptyMessage,
  hasError = false,
  errorMessage = "Something went wrong while loading notes.",
  onRetry,
}: NotesGridProps) {
  if (isLoading) {
    return <NotesGridSkeleton />;
  }

  if (hasError) {
    return (
      <NotesGridError
        message={errorMessage}
        onRetry={onRetry}
      />
    );
  }

  if (!notes?.length) {
    return (
      <Empty className='py-14'>
        <EmptyHeader>
          <EmptyTitle>No notes yet</EmptyTitle>
          <EmptyDescription>{emptyMessage}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className='grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3'>
      {notes.map((note) => (
        <NoteCard
          key={note.id}
          note={note}
        />
      ))}
    </div>
  );
}

function NotesGridSkeleton() {
  return (
    <div className='grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3'>
      {[...Array(6)].map((_, index) => (
        <Card
          key={index}
          className='flex min-h-52 flex-col'
        >
          <CardHeader>
            <Skeleton className='h-6 w-2/3' />
          </CardHeader>
          <CardContent className='space-y-2'>
            <Skeleton className='h-4 w-full' />
            <Skeleton className='h-4 w-5/6' />
          </CardContent>
          <CardFooter className='mt-auto'>
            <Skeleton className='h-9 w-24' />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

function NotesGridError({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <Alert variant='destructive'>
      <AlertCircle className='h-4 w-4' />
      <AlertTitle>Failed to load notes</AlertTitle>
      <AlertDescription>
        <p>{message}</p>
        {onRetry ? (
          <Button
            size='sm'
            variant='outline'
            onClick={onRetry}
          >
            Try again
          </Button>
        ) : null}
      </AlertDescription>
    </Alert>
  );
}
