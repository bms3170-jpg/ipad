import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { HomeWidgetConfig, HomeWidgetType, WidgetSize } from "../types";
import { makeId } from "../utils/date";

const baseLayout: HomeWidgetConfig[] = [
  { id: "clock", type: "clock", size: "L", visible: true },
  { id: "tasks", type: "tasks", size: "L", visible: true },
  { id: "nowNext", type: "nowNext", size: "M", visible: true },
  { id: "weather", type: "weather", size: "M", visible: true },
  { id: "music", type: "music", size: "M", visible: true },
  { id: "focus", type: "focus", size: "M", visible: true },
];

const portraitLayout: HomeWidgetConfig[] = baseLayout.map((item) => ({ ...item, size: item.type === "clock" ? "M" : item.size }));

type Orientation = "landscape" | "portrait";

type HomeLayoutState = {
  landscape: HomeWidgetConfig[];
  portrait: HomeWidgetConfig[];
  editMode: boolean;
  setEditMode: (value: boolean) => void;
  moveWidget: (orientation: Orientation, id: string, direction: -1 | 1) => void;
  cycleSize: (orientation: Orientation, id: string) => void;
  toggleVisible: (orientation: Orientation, id: string) => void;
  addWidget: (orientation: Orientation, type: HomeWidgetType) => void;
  removeWidget: (orientation: Orientation, id: string) => void;
  reset: (orientation: Orientation) => void;
};

const nextSize = (size: WidgetSize): WidgetSize => (size === "S" ? "M" : size === "M" ? "L" : "S");

export const useHomeLayoutStore = create<HomeLayoutState>()(
  persist(
    (set) => ({
      landscape: baseLayout,
      portrait: portraitLayout,
      editMode: false,
      setEditMode: (value) => set({ editMode: value }),
      moveWidget: (orientation, id, direction) =>
        set((state) => {
          const list = [...state[orientation]];
          const index = list.findIndex((item) => item.id === id);
          const target = index + direction;
          if (index < 0 || target < 0 || target >= list.length) return {};
          [list[index], list[target]] = [list[target], list[index]];
          return { [orientation]: list } as Partial<HomeLayoutState>;
        }),
      cycleSize: (orientation, id) =>
        set((state) => ({
          [orientation]: state[orientation].map((item) => (item.id === id ? { ...item, size: nextSize(item.size) } : item)),
        } as Partial<HomeLayoutState>)),
      toggleVisible: (orientation, id) =>
        set((state) => ({
          [orientation]: state[orientation].map((item) => (item.id === id ? { ...item, visible: !item.visible } : item)),
        } as Partial<HomeLayoutState>)),
      addWidget: (orientation, type) =>
        set((state) => ({
          [orientation]: [...state[orientation], { id: makeId("widget"), type, size: "M", visible: true }],
        } as Partial<HomeLayoutState>)),
      removeWidget: (orientation, id) =>
        set((state) => ({ [orientation]: state[orientation].filter((item) => item.id !== id) } as Partial<HomeLayoutState>)),
      reset: (orientation) => set({ [orientation]: orientation === "landscape" ? baseLayout : portraitLayout } as Partial<HomeLayoutState>),
    }),
    { name: "personal-system:home-layout:v1", partialize: (state) => ({ landscape: state.landscape, portrait: state.portrait }) },
  ),
);
