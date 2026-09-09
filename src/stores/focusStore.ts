import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getAll, putOne, STORES } from "../db/database";
import type { FocusMood, FocusRecord } from "../types";
import { isoNow, makeId } from "../utils/date";

type FocusSession = {
  id: string;
  title: string;
  taskId?: string;
  durationSeconds: number;
  startedAt: string;
  endsAt: string;
  pausedAt?: string;
  remainingAtPause?: number;
};

type FocusState = {
  active: FocusSession | null;
  records: FocusRecord[];
  hydratedRecords: boolean;
  start: (durationMinutes: number, title: string, taskId?: string) => void;
  pause: () => void;
  resume: () => void;
  finish: (mood?: FocusMood, music?: string) => Promise<void>;
  cancel: () => void;
  hydrateRecords: () => Promise<void>;
  remainingSeconds: () => number;
};

export const useFocusStore = create<FocusState>()(
  persist(
    (set, get) => ({
      active: null, records: [], hydratedRecords: false,
      start: (durationMinutes, title, taskId) => {
        const now = Date.now(); const seconds = durationMinutes * 60;
        set({ active: { id: makeId("focus"), title: title.trim() || "Focus Session", taskId, durationSeconds: seconds, startedAt: new Date(now).toISOString(), endsAt: new Date(now + seconds * 1000).toISOString() } });
      },
      pause: () => {
        const active = get().active; if (!active || active.pausedAt) return;
        const remaining = Math.max(0, Math.ceil((new Date(active.endsAt).getTime() - Date.now()) / 1000));
        set({ active: { ...active, pausedAt: isoNow(), remainingAtPause: remaining } });
      },
      resume: () => {
        const active = get().active; if (!active?.pausedAt) return;
        const remaining = active.remainingAtPause ?? 0;
        set({ active: { ...active, pausedAt: undefined, remainingAtPause: undefined, endsAt: new Date(Date.now() + remaining * 1000).toISOString() } });
      },
      finish: async (mood, music) => {
        const active = get().active; if (!active) return;
        const endedAt = isoNow();
        const elapsedSeconds = active.durationSeconds - get().remainingSeconds();
        const durationMinutes = Math.max(1, Math.round(elapsedSeconds / 60));
        const record: FocusRecord = { id: active.id, title: active.title, taskId: active.taskId, startedAt: active.startedAt, endedAt, durationMinutes, mood, music };
        await putOne(STORES.focusRecords, record);
        set((state) => ({ active: null, records: [record, ...state.records] }));
      },
      cancel: () => set({ active: null }),
      hydrateRecords: async () => {
        if (get().hydratedRecords) return;
        const records = await getAll<FocusRecord>(STORES.focusRecords);
        set({ records: records.sort((a, b) => b.startedAt.localeCompare(a.startedAt)), hydratedRecords: true });
      },
      remainingSeconds: () => {
        const active = get().active; if (!active) return 0;
        if (active.pausedAt) return Math.max(0, active.remainingAtPause ?? 0);
        return Math.max(0, Math.ceil((new Date(active.endsAt).getTime() - Date.now()) / 1000));
      },
    }),
    { name: "personal-system:focus-session:v1", partialize: (state) => ({ active: state.active }) },
  ),
);
