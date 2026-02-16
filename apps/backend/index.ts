import express from "express";
import cors from "cors";
import { CreateNoteSchema, NoteDB, UpdateNoteSchema } from "@demo/shared";

const app = express();
app.use(cors());
app.use(express.json());

// Mock Database State
let NOTES: NoteDB[] = [
  {
    id: "1",
    title: "Welcome Note",
    content: "This is your first note in the TanStack Query showcase!",
    createdAt: new Date().toISOString(),
    status: "active",
  },
  {
    id: "2",
    title: "Learning Query",
    content: "Remember to check out the DevTools for cache inspection.",
    createdAt: new Date().toISOString(),
    status: "active",
  },
];

// Artificial delay to showcase loading states.
// The delay scales with payload size so the relationship is easy to observe.
const BASE_DELAY_MS = 120;
const PER_ITEM_DELAY_MS = 6;
const MAX_DELAY_MS = 4_000;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const getSimulatedDelayMs = (itemCount: number) => {
  const safeCount = Math.max(0, itemCount);
  const scaledDelay = BASE_DELAY_MS + safeCount * PER_ITEM_DELAY_MS;

  return Math.min(MAX_DELAY_MS, scaledDelay);
};

const sleepForItems = async (itemCount: number) => {
  const delayMs = getSimulatedDelayMs(itemCount);
  await wait(delayMs);
  return delayMs;
};

const MAX_PAGE_SIZE = 100;
const DEFAULT_PAGE_SIZE = 10;

const parsePositiveInt = (value: unknown) => {
  if (typeof value !== "string") {
    return undefined;
  }

  const parsed = Number.parseInt(value, 10);

  if (!Number.isFinite(parsed) || parsed < 1) {
    return undefined;
  }

  return parsed;
};

app.get("/api/notes/meta", async (_req, res) => {
  const delayMs = await sleepForItems(1);
  res.setHeader("X-Simulated-Latency", `${delayMs}ms`);

  res.json({
    total: NOTES.length,
  });
});

app.get("/api/notes", async (req, res) => {
  const pageParam = parsePositiveInt(req.query.page);
  const limitParam = parsePositiveInt(req.query.limit);

  if (pageParam === undefined && limitParam === undefined) {
    const delayMs = await sleepForItems(NOTES.length);
    res.setHeader("X-Total-Count", String(NOTES.length));
    res.setHeader("X-Simulated-Latency", `${delayMs}ms`);
    return res.json(NOTES);
  }

  const limit = Math.min(limitParam ?? DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
  const total = NOTES.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const requestedPage = pageParam ?? 1;
  const page = Math.min(requestedPage, totalPages);
  const start = (page - 1) * limit;
  const end = start + limit;

  const data = NOTES.slice(start, end);

  res.setHeader("X-Total-Count", String(total));
  res.setHeader("X-Page", String(page));
  res.setHeader("X-Limit", String(limit));
  res.setHeader("X-Total-Pages", String(totalPages));
  const delayMs = await sleepForItems(data.length);
  res.setHeader("X-Simulated-Latency", `${delayMs}ms`);

  return res.json({
    data,
    pagination: {
      page,
      limit,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  });
});

app.get("/api/notes/:id", async (req, res) => {
  const delayMs = await sleepForItems(1);
  res.setHeader("X-Simulated-Latency", `${delayMs}ms`);

  const note = NOTES.find((item) => item.id === req.params.id);
  if (!note) {
    return res.status(404).json({ message: "Note not found" });
  }

  return res.json(note);
});

app.post("/api/notes", async (req, res) => {
  const delayMs = await sleepForItems(1);
  res.setHeader("X-Simulated-Latency", `${delayMs}ms`);
  const result = CreateNoteSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json(result.error);
  }
  const newNote: NoteDB = {
    ...result.data,
    id: Math.random().toString(36).substring(7),
    createdAt: new Date().toISOString(),
  };
  NOTES.unshift(newNote); // Add to top);
  res.status(201).json(newNote);
});

app.delete("/api/notes/:id", async (req, res) => {
  const delayMs = await sleepForItems(1);
  res.setHeader("X-Simulated-Latency", `${delayMs}ms`);
  const { id } = req.params;
  NOTES = NOTES.filter((n) => n.id !== id);
  res.status(204).send();
});

app.patch("/api/notes/:id", async (req, res) => {
  const delayMs = await sleepForItems(1);
  res.setHeader("X-Simulated-Latency", `${delayMs}ms`);

  const result = UpdateNoteSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json(result.error);
  }

  const noteIndex = NOTES.findIndex((item) => item.id === req.params.id);
  if (noteIndex === -1) {
    return res.status(404).json({ message: "Note not found" });
  }

  const updatedNote: NoteDB = {
    ...NOTES[noteIndex],
    ...result.data,
  };

  NOTES[noteIndex] = updatedNote;
  return res.json(updatedNote);
});

app.listen(3001, () => console.log("Backend on http://localhost:3001"));
