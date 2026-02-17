import { useCallback, useEffect, useMemo, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { useInfiniteNotes, useNote, useUpdateNote } from "@/hooks/use-notes";
import { useForm, useWatch } from "react-hook-form";
import {} from "react-hook-form";
import { useIntersectionLoader } from "@/hooks/use-intersection-loader";
import { LoadMoreIndicator } from "@/components/load-more-indicator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { AlertCircle } from "lucide-react";
import type { NoteDTO, NoteId } from "@demo/shared";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 12;

const NoteEditSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string(),
});

type NoteEditFormValues = z.infer<typeof NoteEditSchema>;
type PageParam = { id: NoteId };

const useNavigateToFirstNote = (notes: NoteDTO[]) => {
  const navigate = useNavigate();

  const { id: selectedNoteId } = useParams<PageParam>();

  useEffect(() => {
    const firstNoteId = notes.at(0)?.id;

    if (!selectedNoteId && firstNoteId) {
      navigate(`/editor/${firstNoteId}`, { replace: true });
    }
  }, [selectedNoteId, notes, navigate]);
};

const useNoteForm = (selectedNote: NoteDTO | undefined) => {
  const { id: selectedNoteId } = useParams<PageParam>();
  const updateMutation = useUpdateNote();
  const form = useForm<NoteEditFormValues>({
    resolver: zodResolver(NoteEditSchema),
  });

  const handleSave = useCallback(
    () =>
      form.handleSubmit((values) => {
        if (!selectedNoteId || !selectedNote) {
          return;
        }

        updateMutation.mutate({
          id: selectedNoteId,
          note: {
            title: values.title,
            content: values.content,
          },
        });
      }),
    [form, selectedNote, selectedNoteId, updateMutation],
  );

  useEffect(() => {
    if (!selectedNote) {
      form.reset({ title: "", content: "" });
      return;
    }

    form.reset({
      title: selectedNote.title,
      content: selectedNote.content,
    });
  }, [selectedNote, form]);

  return { form, handleSave };
};

export function NoteEditorPage() {
  const { id: selectedNoteId } = useParams<PageParam>();
  const infiniteNotesQuery = useInfiniteNotes(PAGE_SIZE);
  const sidebarEndRef = useRef<HTMLDivElement | null>(null);

  const notes = useMemo(() => {
    return infiniteNotesQuery.data?.flattened ?? [];
  }, [infiniteNotesQuery.data?.flattened]);

  const selectedFromSidebar = useMemo(() => {
    return notes.find((note) => note.id === selectedNoteId);
  }, [notes, selectedNoteId]);

  const noteQuery = useNote(selectedNoteId, selectedFromSidebar);
  const updateMutation = useUpdateNote();
  const selectedNote = noteQuery.data;

  const { form, handleSave } = useNoteForm(selectedNote);

  useNavigateToFirstNote(notes);

  const loadMore = useCallback(() => {
    if (infiniteNotesQuery.hasNextPage && !infiniteNotesQuery.isFetchingNextPage) {
      void infiniteNotesQuery.fetchNextPage();
    }
  }, [infiniteNotesQuery]);

  useIntersectionLoader({
    targetRef: sidebarEndRef,
    onIntersect: loadMore,
    enabled: true,
    rootMargin: "180px",
  });

  return (
    <main className='mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 md:px-6 lg:py-10'>
      <div className='flex items-center justify-between gap-3'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Note Editor</h1>
          <p className='text-sm text-muted-foreground'>
            Browse notes with infinite query and edit one note with optimistic mutation.
          </p>
        </div>
        <Button
          variant='ghost'
          asChild
        >
          <Link to='/learn/basic'>Back to demos</Link>
        </Button>
      </div>

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]'>
        <aside className='rounded-lg border bg-card'>
          <div className='border-b p-4'>
            <h2 className='text-lg font-semibold'>Notes</h2>
            <p className='text-sm text-muted-foreground'>Infinite scroll list</p>
          </div>

          <div className='max-h-[68vh] space-y-1 overflow-y-auto p-2'>
            {notes.map((note) => (
              <Link
                key={note.id}
                to={`/editor/${note.id}`}
                className={cn(
                  "block rounded-md p-3 transition-colors",
                  note.id === selectedNoteId ? "bg-muted" : "hover:bg-muted/50",
                )}
              >
                <div className='line-clamp-1 text-sm font-medium'>{note.title}</div>
                <div className='mt-1 line-clamp-2 text-xs text-muted-foreground'>{note.content}</div>
              </Link>
            ))}

            <div
              ref={sidebarEndRef}
              className='flex min-h-8 items-center justify-center'
            >
              <LoadMoreIndicator isLoading={infiniteNotesQuery.isFetchingNextPage} />
            </div>
          </div>
        </aside>

        <Card>
          <CardHeader>
            <CardTitle>Editor</CardTitle>
            <p className='text-sm text-muted-foreground'>
              Edit a note and see optimistic changes reflected in the sidebar.
            </p>
          </CardHeader>

          <CardContent className='space-y-4'>
            {noteQuery.isError ? (
              <Alert variant='destructive'>
                <AlertCircle className='h-4 w-4' />
                <AlertTitle>Failed to load note</AlertTitle>
                <AlertDescription>
                  {noteQuery.error instanceof Error ? noteQuery.error.message : "Please try selecting the note again."}
                </AlertDescription>
              </Alert>
            ) : null}

            {!selectedNote ? (
              <Empty className='min-h-48'>
                <EmptyHeader>
                  <EmptyTitle>No note selected</EmptyTitle>
                  <EmptyDescription>Select a note from the left sidebar.</EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <form
                className='space-y-4'
                onSubmit={handleSave}
              >
                <div className='space-y-2'>
                  <label className='text-sm font-medium'>Title</label>
                  <Input
                    {...form.register("title", {
                      required: true,
                    })}
                  />
                </div>

                <div className='space-y-2'>
                  <label className='text-sm font-medium'>Content</label>
                  <Textarea
                    {...form.register("content")}
                    rows={10}
                  />
                </div>

                <div className='flex items-center gap-3'>
                  <SaveNoteButton
                    isPending={updateMutation.isPending}
                    form={form}
                  />

                  {updateMutation.isSuccess && !updateMutation.isPending ? (
                    <Badge variant='secondary'>Saved</Badge>
                  ) : null}
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

const SaveNoteButton: React.FC<{
  isPending: boolean;
  form: ReturnType<typeof useNoteForm>["form"];
}> = ({ isPending, form }) => {
  const title = useWatch({ control: form.control, name: "title" });

  return (
    <Button
      type='submit'
      disabled={!form.formState.isDirty || isPending || !title?.trim()}
    >
      {isPending ? (
        <>
          <Spinner className='mr-2 h-4 w-4' />
          Saving...
        </>
      ) : (
        "Save"
      )}
    </Button>
  );
};
