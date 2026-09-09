import { create } from "zustand";
import { getAll, putOne, STORES } from "../db/database";
import type { Schedule, ScheduleCategory } from "../types";
import { isoNow, localDateKey, makeId, minutesFromTime, timeFromMinutes } from "../utils/date";

const SEED_KEY = "personal-system:schedule-seed:v1";

function sortSchedules(values: Schedule[]) {
  return [...values].sort((a, b) => `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`));
}

function seedSchedules(): Schedule[] {
  const date = localDateKey();
  const now = isoNow();
  return [
    { id: makeId("schedule"), title: "프로젝트 정리", date, startTime: "20:00", endTime: "21:00", category: "work" as const, important: false, memo: "", completed: false, createdAt: now, updatedAt: now, deletedAt: null },
  ];
}

type AddInput = { title: string; date?: string; startTime: string; endTime: string; category?: ScheduleCategory; important?: boolean; memo?: string };

type ScheduleState = {
  schedules: Schedule[]; hydrated: boolean; loading: boolean; error: string | null;
  hydrate: () => Promise<void>;
  addSchedule: (input: AddInput) => Promise<Schedule | null>;
  updateSchedule: (id: string, input: Partial<Schedule>) => Promise<void>;
  deleteSchedule: (id: string) => Promise<void>;
  toggleComplete: (id: string) => Promise<void>;
  moveByMinutes: (id: string, minutes: number) => Promise<void>;
  resizeByMinutes: (id: string, minutes: number) => Promise<void>;
};

export const useScheduleStore = create<ScheduleState>((set, get) => ({
  schedules: [], hydrated: false, loading: false, error: null,
  hydrate: async () => {
    if (get().hydrated || get().loading) return;
    set({ loading: true, error: null });
    try {
      let schedules = (await getAll<Schedule>(STORES.schedules)).filter((item) => !item.deletedAt);
      if (!localStorage.getItem(SEED_KEY) && schedules.length === 0) {
        schedules = seedSchedules();
        await Promise.all(schedules.map((value) => putOne(STORES.schedules, value)));
        localStorage.setItem(SEED_KEY, "1");
      }
      set({ schedules: sortSchedules(schedules), hydrated: true, loading: false });
    } catch (error) { set({ hydrated: true, loading: false, error: error instanceof Error ? error.message : "일정을 불러오지 못했습니다." }); }
  },
  addSchedule: async ({ title, date = localDateKey(), startTime, endTime, category = "personal", important = false, memo = "" }) => {
    const clean = title.trim();
    if (!clean || !/^\d{2}:\d{2}$/.test(startTime) || !/^\d{2}:\d{2}$/.test(endTime) || startTime >= endTime) return null;
    const now = isoNow();
    const schedule: Schedule = { id: makeId("schedule"), title: clean, date, startTime, endTime, category, important, memo, completed: false, createdAt: now, updatedAt: now, deletedAt: null };
    await putOne(STORES.schedules, schedule);
    set((state) => ({ schedules: sortSchedules([...state.schedules, schedule]) }));
    return schedule;
  },
  updateSchedule: async (id, input) => {
    const current = get().schedules.find((item) => item.id === id); if (!current) return;
    const updated: Schedule = { ...current, ...input, id: current.id, updatedAt: isoNow() };
    if (updated.startTime >= updated.endTime) return;
    await putOne(STORES.schedules, updated);
    set((state) => ({ schedules: sortSchedules(state.schedules.map((item) => item.id === id ? updated : item)) }));
  },
  deleteSchedule: async (id) => {
    const current = get().schedules.find((item) => item.id === id); if (!current) return;
    await putOne(STORES.schedules, { ...current, deletedAt: isoNow(), updatedAt: isoNow() });
    set((state) => ({ schedules: state.schedules.filter((item) => item.id !== id) }));
  },
  toggleComplete: async (id) => {
    const current = get().schedules.find((item) => item.id === id); if (!current) return;
    await get().updateSchedule(id, { completed: !current.completed });
  },
  moveByMinutes: async (id, minutes) => {
    const current = get().schedules.find((item) => item.id === id); if (!current) return;
    const duration = minutesFromTime(current.endTime) - minutesFromTime(current.startTime);
    const start = Math.max(0, Math.min(1439 - duration, minutesFromTime(current.startTime) + minutes));
    await get().updateSchedule(id, { startTime: timeFromMinutes(start), endTime: timeFromMinutes(start + duration) });
  },
  resizeByMinutes: async (id, minutes) => {
    const current = get().schedules.find((item) => item.id === id); if (!current) return;
    const start = minutesFromTime(current.startTime); const end = Math.max(start + 15, Math.min(1439, minutesFromTime(current.endTime) + minutes));
    await get().updateSchedule(id, { endTime: timeFromMinutes(end) });
  },
}));
