import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const keysFactory = <T extends string, ID extends string = string>(key: T) => {
  const keys = {
    all: [key] as const,
    mutations: {
      all: () => [...keys.all, "mutation"] as const,
      create: () => [...keys.mutations.all(), "create"] as const,
      update: () => [...keys.mutations.all(), "update"] as const,
      delete: () => [...keys.mutations.all(), "delete"] as const,
    },
    meta: () => [...keys.all, "meta"] as const,
    lists: () => [...keys.all, "list"] as const,
    paginatedList: (page: number, limit: number) => [...keys.lists(), { page, limit }] as const,
    infiniteList: (limit: number) => [...keys.lists(), "infinite", { limit }] as const,
    details: () => [...keys.all, "detail"] as const,
    detail: (id: ID) => [...keys.details(), id] as const,
  };

  return keys;
};
