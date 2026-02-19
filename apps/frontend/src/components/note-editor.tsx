// Чистий UI компонент: форма редагування нотатки.
// Не знає про кеш, роутинг чи сервер — отримує дані через пропси.
// Батько передає key={note.id}, тому React скидає стан при зміні нотатки.

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import type { NoteDTO } from "@demo/shared";

interface NoteEditorProps {
  note: NoteDTO;
  isSaving: boolean;
  isSaved: boolean;
  onSave: (data: { title: string; content: string }) => void;
}

export function NoteEditor({ note, isSaving, isSaved, onSave }: NoteEditorProps) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);

  const isDirty = title !== note.title || content !== note.content;

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({ title, content });
  };

  return (
    <Card className='min-w-0 overflow-hidden'>
      <CardHeader>
        <CardTitle>Редактор</CardTitle>
        <p className='text-sm text-muted-foreground'>Редагуйте та зберігайте.</p>
      </CardHeader>

      <CardContent className='space-y-4'>
        <div className='space-y-2'>
          <label className='text-sm font-medium'>Заголовок</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className='space-y-2'>
          <label className='text-sm font-medium'>Зміст</label>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={10}
          />
        </div>

        <div className='flex items-center gap-3'>
          <Button
            type='button'
            onClick={handleSave}
            disabled={!isDirty || isSaving || !title.trim()}
          >
            {isSaving ? (
              <>
                <Spinner className='mr-2 h-4 w-4' />
                Зберігаю...
              </>
            ) : (
              "Зберегти"
            )}
          </Button>

          {isSaved && !isSaving ? <Badge variant='secondary'>Збережено</Badge> : null}
        </div>
      </CardContent>
    </Card>
  );
}
