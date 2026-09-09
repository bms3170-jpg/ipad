import { create } from "zustand";
import { persist } from "zustand/middleware";

export type MotionLevel = "quiet" | "default" | "lively";
export type ThemeMusicMode = "keep" | "recommend" | "auto";
export type CalendarView = "month" | "week" | "day";
export type DockMode = "always" | "home" | "auto";

export type SettingsState = {
  startPage: "home" | "today" | "last";
  timeFormat: "24" | "12";
  motionLevel: MotionLevel;
  soundEnabled: boolean;
  soundVolume: number;
  themeMusicMode: ThemeMusicMode;
  focusMusicEnabled: boolean;
  calendarView: CalendarView;
  weekStartsMonday: boolean;
  freeTimeEnabled: boolean;
  noteAutoSave: boolean;
  dailyNoteEnabled: boolean;
  dockMode: DockMode;
  dockBadges: boolean;
  weatherUseCurrentLocation: boolean;
  weatherLocationLabel: string;
  weatherLatitude: number;
  weatherLongitude: number;
  quietHoursEnabled: boolean;
  quietStart: string;
  quietEnd: string;
  uiScale: 90 | 100 | 110;
  textSize: "small" | "default" | "large";
  testMode: boolean;
  testTime: string;
  testWeather: "clear" | "rain" | "snow" | "cloudy";
  setSetting: <K extends keyof Omit<SettingsState, "setSetting" | "reset">>(key: K, value: SettingsState[K]) => void;
  reset: () => void;
};

const defaults = {
  startPage: "home" as const,
  timeFormat: "24" as const,
  motionLevel: "default" as const,
  soundEnabled: true,
  soundVolume: 0.35,
  themeMusicMode: "recommend" as const,
  focusMusicEnabled: true,
  calendarView: "month" as const,
  weekStartsMonday: true,
  freeTimeEnabled: true,
  noteAutoSave: true,
  dailyNoteEnabled: true,
  dockMode: "always" as const,
  dockBadges: true,
  weatherUseCurrentLocation: false,
  weatherLocationLabel: "서울",
  weatherLatitude: 37.5665,
  weatherLongitude: 126.978,
  quietHoursEnabled: true,
  quietStart: "23:00",
  quietEnd: "07:00",
  uiScale: 100 as const,
  textSize: "default" as const,
  testMode: false,
  testTime: "23:30",
  testWeather: "clear" as const,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaults,
      setSetting: (key, value) => set({ [key]: value } as Partial<SettingsState>),
      reset: () => set(defaults),
    }),
    { name: "personal-system:settings:v1" },
  ),
);
