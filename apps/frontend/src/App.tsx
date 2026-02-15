import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { NoteSchema, type Note, type CreateNote } from "@demo/shared";
import { z } from "zod";
import { generateRandomNote } from "./utils/noteGenerator";

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

  // 1. Query: Fetching notes
  const {
    data: notes,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["notes"],
    queryFn: fetchNotes,
  });

  // 2. Mutation: Creating a note
  const createMutation = useMutation({
    mutationFn: createNote,
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });

  // 3. Mutation: Deleting a note
  const deleteMutation = useMutation({
    mutationFn: deleteNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });

  const handleGenerateNote = () => {
    createMutation.mutate(generateRandomNote());
  };

  return (
    <div>
      <div className='header'>
        <h1>Note Taking App</h1>
        {isFetching && <span className='loading-indicator'>Syncing...</span>}
      </div>

      <div className='actions'>
        <button
          onClick={handleGenerateNote}
          disabled={createMutation.isPending}
        >
          {createMutation.isPending ? "Generating..." : "Generate Random Note"}
        </button>
        <button onClick={() => queryClient.invalidateQueries({ queryKey: ["notes"] })}>Refresh Cache</button>
      </div>

      {isLoading ? (
        <p>Loading notes...</p>
      ) : (
        <div className='note-grid'>
          {notes?.map((note) => (
            <div
              key={note.id}
              className='note-card'
            >
              <div>
                <h3>{note.title}</h3>
                <p>{note.content}</p>
                <div className='date'>{new Date(note.createdAt).toLocaleString()}</div>
              </div>
              <button
                className='btn-delete'
                onClick={() => deleteMutation.mutate(note.id)}
                disabled={deleteMutation.isPending}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}

      {notes?.length === 0 && <p>No notes found. Click generate to start!</p>}
    </div>
  );
}

export default App;
