import { create } from "zustand";
import { getAll, putOne, STORES } from "../db/database";
import type { DailyRecord } from "../types";

type DailyState = {
  records: DailyRecord[]; hydrated: boolean;
  hydrate: () => Promise<void>;
  save: (record: DailyRecord) => Promise<void>;
};

export const useDailyStore = create<DailyState>((set, get) => ({
  records: [], hydrated: false,
  hydrate: async () => {
    if (get().hydrated) return;
    const records = await getAll<DailyRecord>(STORES.dailyRecords);
    set({ records: records.sort((a, b) => b.date.localeCompare(a.date)), hydrated: true });
  },
  save: async (record) => {
    await putOne(STORES.dailyRecords, record);
    set((state) => ({ records: [record, ...state.records.filter((item) => item.date !== record.date)].sort((a, b) => b.date.localeCompare(a.date)) }));
  },
}));
