import { create } from "zustand";
import { getAll, putOne, STORES } from "../db/database";
import type { Note, NoteType } from "../types";
import { isoNow, localDateKey, makeId } from "../utils/date";

const SEED_KEY = "personal-system:note-seed:v1";

function sortNotes(notes: Note[]) {
  return [...notes].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return b.updatedAt.localeCompare(a.updatedAt);
  });
}

function seedNotes(): Note[] {
  const now = isoNow();
  return [{ id: makeId("note"), type: "normal", title: "PERSONAL SYSTEM", content: "20개 테마와 오늘의 기록을 한 곳에서 관리하는 개인 대시보드.", createdAt: now, updatedAt: now, pinned: true, favorite: true, hidden: false, tags: ["system"], checklist: [], photoIds: [], deletedAt: null }];
}

type NoteState = {
  notes: Note[]; hydrated: boolean; loading: boolean; error: string | null;
  hydrate: () => Promise<void>;
  addNote: (type?: NoteType, initial?: Partial<Note>) => Promise<Note>;
  updateNote: (id: string, input: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  restoreNote: (id: string) => Promise<void>;
  getOrCreateDailyNote: (date?: string) => Promise<Note>;
};

export const useNoteStore = create<NoteState>((set, get) => ({
  notes: [], hydrated: false, loading: false, error: null,
  hydrate: async () => {
    if (get().hydrated || get().loading) return;
    set({ loading: true });
    try {
      let notes = (await getAll<Note>(STORES.notes)).filter((note) => !note.deletedAt);
      if (!localStorage.getItem(SEED_KEY) && notes.length === 0) {
        notes = seedNotes(); await Promise.all(notes.map((value) => putOne(STORES.notes, value))); localStorage.setItem(SEED_KEY, "1");
      }
      set({ notes: sortNotes(notes), hydrated: true, loading: false });
    } catch (error) { set({ hydrated: true, loading: false, error: error instanceof Error ? error.message : "메모를 불러오지 못했습니다." }); }
  },
  addNote: async (type = "normal", initial = {}) => {
    const now = isoNow();
    const note: Note = { id: makeId("note"), type, title: initial.title ?? (type === "quick" ? "Quick Note" : "새 메모"), content: initial.content ?? "", createdAt: now, updatedAt: now, pinned: false, favorite: false, hidden: false, tags: initial.tags ?? [], checklist: initial.checklist ?? [], photoIds: initial.photoIds ?? [], dailyDate: initial.dailyDate, deletedAt: null, ...initial };
    await putOne(STORES.notes, note); set((state) => ({ notes: sortNotes([note, ...state.notes]) })); return note;
  },
  updateNote: async (id, input) => {
    const current = get().notes.find((note) => note.id === id); if (!current) return;
    const updated: Note = { ...current, ...input, id: current.id, updatedAt: isoNow() };
    await putOne(STORES.notes, updated); set((state) => ({ notes: sortNotes(state.notes.map((note) => note.id === id ? updated : note)) }));
  },
  deleteNote: async (id) => {
    const current = get().notes.find((note) => note.id === id); if (!current) return;
    await putOne(STORES.notes, { ...current, deletedAt: isoNow(), updatedAt: isoNow() }); set((state) => ({ notes: state.notes.filter((note) => note.id !== id) }));
  },
  restoreNote: async () => {},
  getOrCreateDailyNote: async (date = localDateKey()) => {
    const found = get().notes.find((note) => note.type === "daily" && note.dailyDate === date); if (found) return found;
    return get().addNote("daily", { title: `${date} DAILY NOTE`, dailyDate: date });
  },
}));
