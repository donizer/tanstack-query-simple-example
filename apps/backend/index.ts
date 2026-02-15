import express from "express";
import cors from "cors";
import { CreateNoteSchema, Note } from "@demo/shared";

const app = express();
app.use(cors());
app.use(express.json());

// Mock Database State
let NOTES: Note[] = [
  {
    id: "1",
    title: "Welcome Note",
    content: "This is your first note in the TanStack Query showcase!",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Learning Query",
    content: "Remember to check out the DevTools for cache inspection.",
    createdAt: new Date().toISOString(),
  },
];

// Artificial delay to showcase loading states
const DELAY = 600;
const sleep = () => new Promise((resolve) => setTimeout(resolve, DELAY));

app.get("/api/notes", async (req, res) => {
  await sleep();
  res.json(NOTES);
});

app.post("/api/notes", async (req, res) => {
  await sleep();
  const result = CreateNoteSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json(result.error);
  }
  const newNote: Note = {
    ...result.data,
    id: Math.random().toString(36).substring(7),
    createdAt: new Date().toISOString(),
  };
  NOTES.unshift(newNote); // Add to top
  res.status(201).json(newNote);
});

app.delete("/api/notes/:id", async (req, res) => {
  await sleep();
  const { id } = req.params;
  NOTES = NOTES.filter((n) => n.id !== id);
  res.status(204).send();
});

app.listen(3001, () => console.log("Backend on http://localhost:3001"));
