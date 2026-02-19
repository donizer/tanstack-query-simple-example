// Чистий UI компонент: список нотаток з пагінацією.
// Не знає про роутинг чи кеш — викликає onSelect / onPageChange.

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { NoteDTO, NoteId } from "@demo/shared";

interface NotesSidebarProps {
  notes: NoteDTO[];
  selectedId?: NoteId;
  onSelect: (id: NoteId) => void;
  onCreate: () => void;
  isCreating: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading: boolean;
}

export function NotesSidebar({
  notes,
  selectedId,
  onSelect,
  onCreate,
  isCreating,
  currentPage,
  totalPages,
  onPageChange,
  isLoading,
}: NotesSidebarProps) {
  return (
    <aside className='flex min-w-0 flex-col overflow-hidden rounded-lg border bg-card lg:h-[75vh]'>
      <div className='flex items-center justify-between border-b p-4'>
        <div>
          <h2 className='text-lg font-semibold'>Нотатки</h2>
          <p className='text-sm text-muted-foreground'>Оберіть нотатку</p>
        </div>
        <Button
          type='button'
          size='sm'
          onClick={onCreate}
          disabled={isCreating}
        >
          <Plus className='mr-1 h-4 w-4' />
          Нова
        </Button>
      </div>

      <div className='flex-1 space-y-1 overflow-y-auto p-2'>
        {notes.map((note) => (
          <button
            key={note.id}
            type='button'
            onClick={() => onSelect(note.id)}
            className={cn(
              "block w-full rounded-md p-3 text-left transition-colors",
              note.id === selectedId ? "bg-muted" : "hover:bg-muted/50",
            )}
          >
            <div className='line-clamp-1 text-sm font-medium'>{note.title}</div>
            <div className='mt-1 line-clamp-2 text-xs text-muted-foreground'>{note.content}</div>
          </button>
        ))}

        {isLoading ? <div className='px-3 py-2 text-xs text-muted-foreground'>Завантаження...</div> : null}
      </div>

      <div className='flex items-center justify-between border-t px-3 py-3'>
        <Button
          type='button'
          size='sm'
          variant='outline'
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
        >
          Назад
        </Button>
        <span className='text-xs text-muted-foreground'>
          {currentPage} / {totalPages}
        </span>
        <Button
          type='button'
          size='sm'
          variant='outline'
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
        >
          Далі
        </Button>
      </div>
    </aside>
  );
}
