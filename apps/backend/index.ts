import express from "express";
import cors from "cors";
import { UserSchema, User } from "@demo/shared";

const app = express();
app.use(cors());
app.use(express.json());

const MOCK_USERS: User[] = [
  { id: 1, name: "Alice", email: "alice@example.com" },
  { id: 2, name: "Bob", email: "bob@example.com" },
];

app.get("/api/users", (req, res) => {
  res.json(MOCK_USERS);
});

app.post("/api/users", (req, res) => {
  const result = UserSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json(result.error);
  }
  const newUser = { ...result.data, id: Date.now() };
  MOCK_USERS.push(newUser);
  res.status(201).json(newUser);
});

app.listen(3001, () => console.log("Backend on http://localhost:3001"));
