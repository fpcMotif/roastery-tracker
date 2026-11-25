import { useCallback, useSyncExternalStore } from "react";
import { parseTastings, type Tasting } from "../query.ts";

const KEY = "roast-ledger:tastings";
const EMPTY: Tasting[] = [];
let cache: Tasting[] | undefined;
const listeners = new Set<() => void>();

function read(): Tasting[] {
  if (cache) return cache;
  try {
    const raw = window.localStorage.getItem(KEY);
    cache = raw ? parseTastings(JSON.parse(raw)) : [];
  } catch {
    cache = [];
  }
  return cache;
}

function persist(next: Tasting[]): boolean {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
    return true;
  } catch {
    return false;
  }
}

function write(next: Tasting[]): void {
  cache = next;
  persist(next);
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useTastings(): {
  tastings: Tasting[];
  add: (tasting: Tasting) => void;
  removeAt: (index: number) => Tasting | undefined;
  insertAt: (index: number, tasting: Tasting) => void;
} {
  const tastings = useSyncExternalStore(subscribe, read, () => EMPTY);
  const add = useCallback((tasting: Tasting) => write([tasting, ...read()]), []);
  const removeAt = useCallback((index: number) => {
    const current = read();
    const removed = current[index];
    write(current.filter((_, i) => i !== index));
    return removed;
  }, []);
  const insertAt = useCallback((index: number, tasting: Tasting) => {
    const next = [...read()];
    next.splice(index, 0, tasting);
    write(next);
  }, []);
  return { tastings, add, removeAt, insertAt };
}
