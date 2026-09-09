import { create } from "zustand";
import type { WeatherSnapshot } from "../types";
import { fetchWeather, getCurrentPosition } from "../services/weatherService";
import { useSettingsStore } from "./settingsStore";

const CACHE_KEY = "personal-system:weather-cache:v1";

type WeatherState = {
  snapshot: WeatherSnapshot | null;
  loading: boolean;
  error: string | null;
  stale: boolean;
  load: (force?: boolean) => Promise<void>;
};

function readCache(): WeatherSnapshot | null {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY) ?? "null") as WeatherSnapshot | null; } catch { return null; }
}

export const useWeatherStore = create<WeatherState>((set, get) => ({
  snapshot: readCache(), loading: false, error: null, stale: false,
  load: async (force = false) => {
    const cached = get().snapshot;
    if (!force && cached && Date.now() - new Date(cached.updatedAt).getTime() < 15 * 60 * 1000) return;
    set({ loading: true, error: null });
    const settings = useSettingsStore.getState();
    try {
      let latitude = settings.weatherLatitude;
      let longitude = settings.weatherLongitude;
      let label = settings.weatherLocationLabel;
      if (settings.weatherUseCurrentLocation) {
        const position = await getCurrentPosition();
        latitude = position.coords.latitude; longitude = position.coords.longitude; label = "현재 위치";
      }
      const snapshot = await fetchWeather(latitude, longitude, label);
      localStorage.setItem(CACHE_KEY, JSON.stringify(snapshot));
      set({ snapshot, loading: false, stale: false });
    } catch (error) {
      set({ loading: false, stale: Boolean(cached), error: error instanceof Error ? error.message : "날씨를 가져오지 못했습니다." });
    }
  },
}));
