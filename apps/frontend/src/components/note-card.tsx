import React from "react";
import { type NoteDTO } from "@demo/shared";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useDeleteNote } from "../hooks/use-notes";

interface NoteCardProps {
  note: NoteDTO;
}

export const NoteCard: React.FC<NoteCardProps> = ({ note }) => {
  const deleteMutation = useDeleteNote();

  return (
    <Card className='flex flex-col group transition-all hover:shadow-md'>
      <CardHeader>
        <CardTitle className='line-clamp-1'>{note.title}</CardTitle>
        <div className='text-xs text-muted-foreground'>{note.formattedDate}</div>
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
            <DialogHeader className='flex flex-row items-center justify-between'>
              <div className='space-y-1'>
                <DialogTitle className='text-2xl font-bold'>{note.title}</DialogTitle>
                <DialogDescription>Created on {note.formattedDate}</DialogDescription>
              </div>

              <Button
                variant='destructive'
                size='sm'
                onClick={() => deleteMutation.mutate(note.id)}
                disabled={deleteMutation.isPending || note.offline}
                className='mr-8'
              >
                {deleteMutation.isPending ? <Spinner className='h-4 w-4' /> : "Delete"}
              </Button>
            </DialogHeader>

            <div className='py-6 text-lg whitespace-pre-wrap leading-relaxed border-t mt-4'>{note.content}</div>
          </DialogContent>
        </Dialog>

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
