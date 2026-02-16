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
import { useIntersectionLoader } from "@/hooks/use-intersection-loader";
import { LoadMoreIndicator } from "@/components/load-more-indicator";

const PAGE_SIZE = 12;

export function NoteEditorPage() {
  const navigate = useNavigate();
  const { id: selectedNoteId = "" } = useParams<{ id: string }>();
  const sidebarEndRef = useRef<HTMLDivElement | null>(null);

  const infiniteNotesQuery = useInfiniteNotes(PAGE_SIZE);
  const notes = useMemo(
    () => infiniteNotesQuery.data?.pages.flatMap((page) => page.data) ?? [],
    [infiniteNotesQuery.data?.pages],
  );

  const selectedFromSidebar = notes.find((note) => note.id === selectedNoteId);
  const noteQuery = useNote(selectedNoteId, selectedFromSidebar);
  const updateMutation = useUpdateNote();
  const selectedNote = noteQuery.data;

  const form = useForm<{ title: string; content: string }>({
    defaultValues: {
      title: "",
      content: "",
    },
  });

  const title = useWatch({ control: form.control, name: "title" });

  useEffect(() => {
    if (!selectedNoteId && notes.length > 0) {
      navigate(`/editor/${notes[0].id}`, { replace: true });
    }
  }, [selectedNoteId, notes, navigate]);

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

  const handleSave = form.handleSubmit((values) => {
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
  });

  return (
    <div className='grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]'>
      <aside className='rounded-lg border bg-card'>
        <div className='border-b p-4'>
          <h2 className='text-lg font-semibold'>Notes Sidebar</h2>
          <p className='text-sm text-muted-foreground'>Infinite scroll list</p>
        </div>

        <div className='max-h-[68vh] space-y-1 overflow-y-auto p-2'>
          {notes.map((note) => (
            <Link
              key={note.id}
              to={`/editor/${note.id}`}
              className={`block rounded-md p-3 transition-colors ${
                note.id === selectedNoteId ? "bg-muted" : "hover:bg-muted/50"
              }`}
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
          <CardTitle>Simple Editor</CardTitle>
          <p className='text-sm text-muted-foreground'>
            Edit a note and see optimistic changes reflected in the sidebar.
          </p>
        </CardHeader>

        <CardContent className='space-y-4'>
          {!selectedNote ? (
            <p className='text-sm text-muted-foreground'>Select a note from the sidebar.</p>
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
                <Button
                  type='submit'
                  disabled={!form.formState.isDirty || updateMutation.isPending || !title?.trim()}
                >
                  {updateMutation.isPending ? (
                    <>
                      <Spinner className='mr-2 h-4 w-4' />
                      Saving...
                    </>
                  ) : (
                    "Save"
                  )}
                </Button>

                {updateMutation.isSuccess && !updateMutation.isPending ? (
                  <Badge variant='secondary'>Saved</Badge>
                ) : null}
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
