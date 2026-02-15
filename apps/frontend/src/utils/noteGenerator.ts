import { type CreateNote } from "@demo/shared";

const TITLES = [
  "Meeting Notes",
  "Grocery List",
  "React Tips",
  "TanStack Query Ideas",
  "Project Roadmap",
  "Books to Read",
  "Workout Plan",
];

const CONTENTS = [
  "Don't forget to buy milk and eggs.",
  "Check the documentation for useMutation.",
  "Discuss the new design with the team at 2 PM.",
  "Refactor the API layer for better performance.",
  "Read 'Clean Code' by Robert C. Martin.",
  "Go for a 5km run tomorrow morning.",
];

export const generateRandomNote = (): CreateNote => {
  const title = TITLES[Math.floor(Math.random() * TITLES.length)];
  const content = CONTENTS[Math.floor(Math.random() * CONTENTS.length)];

  return {
    title: `${title} (${new Date().toLocaleTimeString()})`,
    content,
    status: "active",
  };
};
