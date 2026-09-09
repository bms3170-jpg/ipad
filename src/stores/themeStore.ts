import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_THEME, getTheme } from "../themes/themeDefinitions";

export type AutoThemeMode = "off" | "time" | "weekday" | "random";
type ThemeState = {
  currentThemeId: string;
  favoriteThemeIds: string[];
  autoMode: AutoThemeMode;
  setTheme: (id: string) => void;
  toggleFavorite: (id: string) => void;
  setAutoMode: (mode: AutoThemeMode) => void;
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      currentThemeId: DEFAULT_THEME.id,
      favoriteThemeIds: [],
      autoMode: "off",
      setTheme: (id) => set({ currentThemeId: getTheme(id).id }),
      toggleFavorite: (id) => set((state) => ({ favoriteThemeIds: state.favoriteThemeIds.includes(id) ? state.favoriteThemeIds.filter((value) => value !== id) : [...state.favoriteThemeIds, id] })),
      setAutoMode: (autoMode) => set({ autoMode }),
    }),
    {
      name: "personal-system:theme:v1",
      merge: (persisted, current) => {
        const saved = (persisted ?? {}) as Partial<ThemeState>;
        const validFavorites = (saved.favoriteThemeIds ?? []).filter((id) => getTheme(id).id === id);
        return { ...current, ...saved, currentThemeId: getTheme(saved.currentThemeId ?? DEFAULT_THEME.id).id, favoriteThemeIds: validFavorites };
      },
    },
  ),
);
