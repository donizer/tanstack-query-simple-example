import { useQueryClient } from "@tanstack/react-query";
import { generateRandomNote } from "./utils/noteGenerator";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Skeleton } from "@/components/ui/skeleton";
import { useNotes, useCreateNote } from "./hooks/use-notes";
import { NoteCard } from "./components/note-card";
import { noteKeys } from "./lib/api";

function App() {
  const queryClient = useQueryClient();
  const notesQuery = useNotes();
  const createMutation = useCreateNote();

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
        <Button
          onClick={handleGenerateNote}
          // disabled={createMutation.isPending}
        >
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

      {notesQuery.isLoading ? (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {[...Array(6)].map((_, i) => (
            <Card
              key={i}
              className='flex flex-col h-50'
            >
              <CardHeader>
                <Skeleton className='h-6 w-2/3' />
              </CardHeader>
              <CardContent>
                <Skeleton className='h-4 w-full mb-2' />
                <Skeleton className='h-4 w-5/6' />
              </CardContent>
              <CardFooter className='mt-auto'>
                <Skeleton className='h-9 w-20' />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {notesQuery.data?.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
            />
          ))}
        </div>
      )}

      {notesQuery.data?.length === 0 && !notesQuery.isLoading && (
        <div className='text-center py-20 border-2 border-dashed rounded-lg'>
          <p className='text-muted-foreground text-lg'>No notes found. Click generate to start!</p>
        </div>
      )}
    </div>
  );
}

export default App;
