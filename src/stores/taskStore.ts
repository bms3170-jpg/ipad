import { create } from "zustand";
import { getAll, getOne, putMany, putOne, STORES } from "../db/database";
import type { Task, TaskPriority } from "../types";
import { isoNow, localDateKey, makeId } from "../utils/date";

const SEED_KEY = "personal-system:seed:v2";

function sortTasks(tasks: Task[]) {
  return [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    if (a.priority !== b.priority) return a.priority === "important" ? -1 : 1;
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    if (a.time && b.time && a.time !== b.time) return a.time.localeCompare(b.time);
    if (a.time && !b.time) return -1;
    if (!a.time && b.time) return 1;
    return a.createdAt.localeCompare(b.createdAt);
  });
}

function starterTasks(): Task[] {
  const date = localDateKey();
  const now = isoNow();
  const values = [
    ["오늘 일정 확인하기", "09:00", false, "normal"],
    ["웹앱 작업 이어서 하기", "14:00", false, "important"],
    ["메모 정리하기", undefined, true, "normal"],
    ["내일 할 일 정리", "20:30", false, "normal"],
  ] as const;
  return values.map(([title, time, completed, priority], index) => ({
    id: makeId("task"),
    title,
    date,
    time,
    priority: priority as TaskPriority,
    completed,
    createdAt: new Date(Date.now() + index).toISOString(),
    updatedAt: now,
    completedAt: completed ? now : null,
    deletedAt: null,
  }));
}

type AddTaskInput = { title: string; date?: string; time?: string; priority?: TaskPriority; memo?: string };

type TaskState = {
  tasks: Task[];
  hydrated: boolean;
  loading: boolean;
  error: string | null;
  hydrate: () => Promise<void>;
  addTask: (input: AddTaskInput) => Promise<Task | null>;
  updateTask: (id: string, input: Partial<Task>) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  togglePriority: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<Task | null>;
  restoreTask: (task: Task) => Promise<void>;
  moveToDate: (id: string, date: string) => Promise<void>;
};

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [], hydrated: false, loading: false, error: null,
  hydrate: async () => {
    if (get().hydrated || get().loading) return;
    set({ loading: true, error: null });
    try {
      let tasks = (await getAll<Task>(STORES.tasks)).filter((task) => !task.deletedAt);
      if (!localStorage.getItem(SEED_KEY) && tasks.length === 0) {
        tasks = starterTasks();
        await putMany(STORES.tasks, tasks);
        localStorage.setItem(SEED_KEY, "1");
      }
      set({ tasks: sortTasks(tasks), hydrated: true, loading: false });
    } catch (error) {
      set({ hydrated: true, loading: false, error: error instanceof Error ? error.message : "할 일을 불러오지 못했습니다." });
    }
  },
  addTask: async ({ title, date = localDateKey(), time, priority = "normal", memo }) => {
    const clean = title.trim();
    if (!clean) return null;
    const now = isoNow();
    const task: Task = { id: makeId("task"), title: clean, date, time: time || undefined, priority, completed: false, memo, createdAt: now, updatedAt: now, completedAt: null, deletedAt: null };
    await putOne(STORES.tasks, task);
    set((state) => ({ tasks: sortTasks([...state.tasks, task]) }));
    return task;
  },
  updateTask: async (id, input) => {
    const current = get().tasks.find((task) => task.id === id) ?? (await getOne<Task>(STORES.tasks, id));
    if (!current) return;
    const updated: Task = { ...current, ...input, id: current.id, updatedAt: isoNow() };
    await putOne(STORES.tasks, updated);
    set((state) => ({ tasks: sortTasks(state.tasks.map((task) => (task.id === id ? updated : task))) }));
  },
  toggleTask: async (id) => {
    const current = get().tasks.find((task) => task.id === id);
    if (!current) return;
    const completed = !current.completed;
    await get().updateTask(id, { completed, completedAt: completed ? isoNow() : null });
  },
  togglePriority: async (id) => {
    const current = get().tasks.find((task) => task.id === id);
    if (!current) return;
    await get().updateTask(id, { priority: current.priority === "important" ? "normal" : "important" });
  },
  deleteTask: async (id) => {
    const current = get().tasks.find((task) => task.id === id);
    if (!current) return null;
    const deleted = { ...current, deletedAt: isoNow(), updatedAt: isoNow() };
    await putOne(STORES.tasks, deleted);
    set((state) => ({ tasks: state.tasks.filter((task) => task.id !== id) }));
    return current;
  },
  restoreTask: async (task) => {
    const restored = { ...task, deletedAt: null, updatedAt: isoNow() };
    await putOne(STORES.tasks, restored);
    set((state) => ({ tasks: sortTasks([...state.tasks.filter((item) => item.id !== restored.id), restored]) }));
  },
  moveToDate: async (id, date) => get().updateTask(id, { date }),
}));
