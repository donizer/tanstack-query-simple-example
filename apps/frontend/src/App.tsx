import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { NoteSchema, type Note, type CreateNote } from "@demo/shared";
import { z } from "zod";
import { generateRandomNote } from "./utils/noteGenerator";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Eye } from "lucide-react";

const API_URL = "http://localhost:3001/api/notes";

const fetchNotes = async (): Promise<Note[]> => {
  const res = await fetch(API_URL);
  const data = await res.json();
  return z.array(NoteSchema).parse(data);
};

const createNote = async (note: CreateNote): Promise<Note> => {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(note),
  });
  return NoteSchema.parse(await res.json());
};

const deleteNote = async (id: string): Promise<void> => {
  await fetch(`${API_URL}/${id}`, { method: "DELETE" });
};

function App() {
  const queryClient = useQueryClient();

  const notesQuery = useQuery({
    queryKey: ["notes"],
    queryFn: fetchNotes,
  });

  const createMutation = useMutation({
    mutationFn: createNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });

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
          disabled={createMutation.isPending}
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
          onClick={() => queryClient.invalidateQueries({ queryKey: ["notes"] })}
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
            <CardItem
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

const CardItem: React.FC<{ note: Note }> = ({ note }) => {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: deleteNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });

  return (
    <Card className='flex flex-col group transition-all hover:shadow-md'>
      <CardHeader>
        <CardTitle className='line-clamp-1'>{note.title}</CardTitle>
        <div className='text-xs text-muted-foreground'>{new Date(note.createdAt).toLocaleString()}</div>
      </CardHeader>
      <CardContent className='grow'>
        <p className='text-sm text-balance line-clamp-3'>{note.content}</p>
      </CardContent>
      <CardFooter className='pt-0 gap-2'>
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant='outline'
              size='sm'
              className='flex items-center gap-2'
            >
              <Eye className='h-4 w-4' />
              View
            </Button>
          </DialogTrigger>
          <DialogContent className='sm:max-w-150'>
            <DialogHeader>
              <DialogTitle className='text-2xl font-bold'>{note.title}</DialogTitle>
              <DialogDescription>Created on {new Date(note.createdAt).toLocaleString()}</DialogDescription>
            </DialogHeader>
            <div className='py-6 text-lg whitespace-pre-wrap leading-relaxed border-t mt-4'>{note.content}</div>
          </DialogContent>
        </Dialog>
        <Button
          variant='destructive'
          size='sm'
          onClick={() => deleteMutation.mutate(note.id)}
          disabled={deleteMutation.isPending}
        >
          {deleteMutation.isPending ? <Spinner className='h-4 w-4' /> : "Delete"}
        </Button>
      </CardFooter>
    </Card>
  );
};
