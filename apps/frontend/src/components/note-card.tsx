import React from "react";
import { type NoteDTO } from "@demo/shared";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { useDeleteNote, usePrefetchNote } from "../hooks/use-notes";

interface NoteCardProps {
  note: NoteDTO;
}

export const NoteCard: React.FC<NoteCardProps> = ({ note }) => {
  const deleteMutation = useDeleteNote();
  const prefetchNote = usePrefetchNote();

  return (
    <Card className='group flex flex-col transition-all hover:shadow-md'>
      <CardHeader>
        <CardTitle className='line-clamp-1'>{note.title}</CardTitle>
        <div className='text-xs text-muted-foreground'>{note.formattedDate}</div>
      </CardHeader>

      <CardContent className='grow'>
        <p className='text-sm text-balance line-clamp-3'>{note.content}</p>
      </CardContent>

      <CardFooter className='gap-2 pt-0'>
        <Button
          variant='outline'
          size='sm'
          className='flex items-center gap-2'
          asChild
        >
          <Link
            to={`/editor/${note.id}`}
            onMouseEnter={() => {
              void prefetchNote(note.id);
            }}
            onFocus={() => {
              void prefetchNote(note.id);
            }}
          >
            <Eye className='h-4 w-4' />
            Edit
          </Link>
        </Button>

        <Button
          variant='destructive'
          size='sm'
          onClick={() => deleteMutation.mutate(note.id)}
          disabled={deleteMutation.isPending || note.offline}
        >
          {deleteMutation.isPending ? <Spinner className='h-4 w-4' /> : "Delete"}
        </Button>
      </CardFooter>
    </Card>
  );
};
