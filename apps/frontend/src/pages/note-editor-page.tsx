// Сторінка-оркестратор: з'єднує TanStack Query хуки з UI компонентами.
// UI компоненти (NotesSidebar, NoteEditor) нічого не знають про кеш чи роутинг.

import { useEffect, useMemo } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useCreateNote, useNote, useNotesMeta, usePaginatedNotes, useUpdateNote } from "@/hooks/use-notes";
import { NotesSidebar } from "@/components/notes-sidebar";
import { NoteEditor } from "@/components/note-editor";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { AlertCircle } from "lucide-react";
import type { NoteId } from "@demo/shared";

const PAGE_SIZE = 8;

// ── Допоміжні хуки ───────────────────────────────────────

/** Читає ?page= з URL і тримає його в допустимих межах. */
function usePageParam() {
  const [searchParams, setSearchParams] = useSearchParams();
  const notesMetaQuery = useNotesMeta();

  const raw = Number(searchParams.get("page") ?? 1);
  const currentPage = Number.isFinite(raw) ? Math.max(1, raw) : 1;

  const totalItems = notesMetaQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));

  // Якщо сторінка більша за максимум — скидаємо
  useEffect(() => {
    if (currentPage > totalPages) {
      const next = new URLSearchParams();
      if (totalPages > 1) next.set("page", String(totalPages));
      setSearchParams(next);
    }
  }, [currentPage, setSearchParams, totalPages]);

  return { currentPage, totalPages };
}

/** Якщо нотатка не обрана — автоматично вибирає першу зі списку. */
function useAutoSelectFirstNote(notes: { id: NoteId }[], selectedNoteId: NoteId | undefined, currentPage: number) {
  const navigate = useNavigate();

  useEffect(() => {
    const firstId = notes.at(0)?.id;
    if (selectedNoteId || !firstId) return;

    const search = new URLSearchParams();
    if (currentPage > 1) search.set("page", String(currentPage));

    navigate({ pathname: `/editor/${firstId}`, search: search.toString() }, { replace: true });
  }, [currentPage, navigate, notes, selectedNoteId]);
}

// ── Хелпер для побудови URL ──────────────────────────────

function buildEditorUrl(noteId: NoteId | undefined, page: number) {
  const search = new URLSearchParams();
  if (page > 1) search.set("page", String(page));

  const pathname = noteId ? `/editor/${noteId}` : "/editor";
  const qs = search.toString();

  return qs ? `${pathname}?${qs}` : pathname;
}

// ── Компонент сторінки ───────────────────────────────────

export function NoteEditorPage() {
  const { id: selectedNoteId } = useParams<{ id: NoteId }>();
  const navigate = useNavigate();

  // Пагінація
  const { currentPage, totalPages } = usePageParam();

  // TanStack Query
  const notesListQuery = usePaginatedNotes(currentPage, PAGE_SIZE);
  const createNoteMutation = useCreateNote();
  const saveNoteMutation = useUpdateNote();

  const notes = useMemo(() => notesListQuery.data?.data ?? [], [notesListQuery.data?.data]);

  // Автовибір першої нотатки
  useAutoSelectFirstNote(notes, selectedNoteId, currentPage);

  // Деталі обраної нотатки (з placeholder із списку)
  const selectedFromList = notes.find((n) => n.id === selectedNoteId);
  const noteDetailsQuery = useNote(selectedNoteId, selectedFromList);
  const selectedNote = noteDetailsQuery.data;

  // Колбеки для дочірніх компонентів
  const selectNote = (noteId: NoteId) => navigate(buildEditorUrl(noteId, currentPage));

  const addNote = () => {
    createNoteMutation.mutate(
      { title: "Нова нотатка", content: "" },
      {
        onSuccess: (created) => navigate(buildEditorUrl(created.id, currentPage)),
      },
    );
  };

  const addRandomNote = () => {
    const titles = [
      "Купити продукти",
      "Ідея для проєкту",
      "Нотатка зі зустрічі",
      "TODO на тиждень",
      "Рецепт",
      "Книга для читання",
      "Фідбек з рев'ю",
    ];
    const contents = [
      "Молоко, хліб, яйця, масло, сир, кава.",
      "Зробити CLI тулзу для генерації шаблонів.",
      "Обговорили дедлайни. Наступний спринт — рефакторинг.",
      "Написати тести, оновити залежності, зробити PR.",
      "Змішати борошно, цукор та яйця. Випікати 30 хв.",
      "Clean Code — Robert Martin. Почати з розділу 3.",
      "Компонент занадто великий — розбити на менші частини.",
    ];
    const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
    createNoteMutation.mutate(
      { title: pick(titles), content: pick(contents) },
      {
        onSuccess: (created) => navigate(buildEditorUrl(created.id, currentPage)),
      },
    );
  };

  const goToPage = (page: number) => {
    const safe = Math.min(Math.max(1, page), totalPages);
    navigate(buildEditorUrl(selectedNoteId, safe));
  };

  const saveNote = (data: { title: string; content: string }) => {
    if (!selectedNoteId) return;
    saveNoteMutation.mutate({ id: selectedNoteId, note: data });
  };

  return (
    <main className='mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 md:px-6 lg:py-10'>
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>Нотатки</h1>
        <p className='text-sm text-muted-foreground'>Приклад TanStack Query: пагінований список + редактор.</p>
      </div>

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-[320px_minmax(0,1fr)]'>
        {/* Список нотаток */}
        <NotesSidebar
          notes={notes}
          selectedId={selectedNoteId}
          onSelect={selectNote}
          onCreate={addNote}
          onCreateRandom={addRandomNote}
          isCreating={createNoteMutation.isPending}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={goToPage}
          isLoading={notesListQuery.isLoading}
        />

        {/* Редактор або порожній стан */}
        {notesListQuery.isError || noteDetailsQuery.isError ? (
          <Card className='min-w-0 overflow-hidden'>
            <CardHeader>
              <CardTitle>Редактор</CardTitle>
            </CardHeader>
            <CardContent>
              <Alert variant='destructive'>
                <AlertCircle className='h-4 w-4' />
                <AlertTitle>Помилка завантаження</AlertTitle>
                <AlertDescription>
                  {(notesListQuery.error ?? noteDetailsQuery.error)?.message ?? "Спробуйте ще раз."}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        ) : selectedNote ? (
          <NoteEditor
            key={selectedNote.id}
            note={selectedNote}
            onSave={saveNote}
            isSaving={saveNoteMutation.isPending}
            isSaved={saveNoteMutation.isSuccess}
          />
        ) : (
          <Card className='min-w-0 overflow-hidden'>
            <CardHeader>
              <CardTitle>Редактор</CardTitle>
            </CardHeader>

            <CardContent>
              <Empty className='min-h-48'>
                <EmptyHeader>
                  <EmptyTitle>Нотатку не обрано</EmptyTitle>
                  <EmptyDescription>Оберіть нотатку зі списку зліва.</EmptyDescription>
                </EmptyHeader>
              </Empty>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
