import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authorizeAndPlayTheme, configureMusicKit } from "../services/musicService";
import { getTheme } from "../themes/themeDefinitions";
import { useThemeStore } from "./themeStore";

type MusicMode = "main" | "focus" | "relax";

type MusicState = {
  connected: boolean;
  connecting: boolean;
  error: string | null;
  playing: boolean;
  mode: MusicMode;
  title: string;
  artist: string;
  progress: number;
  developerToken: string;
  connect: (token?: string) => Promise<void>;
  setDeveloperToken: (token: string) => void;
  togglePlay: () => void;
  setMode: (mode: MusicMode) => void;
  syncThemeRecommendation: () => void;
  playTheme: () => Promise<void>;
};

function themeTrack(mode: MusicMode) {
  const theme = getTheme(useThemeStore.getState().currentThemeId);
  return mode === "focus" ? theme.focusMusic : mode === "relax" ? theme.relaxMusic : theme.music;
}

export const useMusicStore = create<MusicState>()(
  persist(
    (set, get) => ({
      connected: false, connecting: false, error: null, playing: false, mode: "main", title: "Theme Soundtrack", artist: themeTrack("main"), progress: 0, developerToken: import.meta.env.VITE_APPLE_MUSIC_DEVELOPER_TOKEN ?? "",
      connect: async (token) => {
        const developerToken = token || get().developerToken;
        if (!developerToken) { set({ error: "Apple Music Developer Token이 필요합니다." }); return; }
        set({ connecting: true, error: null });
        try {
          const music = await configureMusicKit(developerToken);
          await music.authorize();
          set({ connected: true, connecting: false, error: null });
        } catch (error) { set({ connecting: false, connected: false, error: error instanceof Error ? error.message : "Apple Music 연결에 실패했습니다." }); }
      },
      setDeveloperToken: (developerToken) => set({ developerToken }),
      togglePlay: () => set((state) => ({ playing: !state.playing })),
      setMode: (mode) => set({ mode, artist: themeTrack(mode), title: mode === "focus" ? "FOCUS SOUNDTRACK" : mode === "relax" ? "RELAX SOUNDTRACK" : "THEME SOUNDTRACK" }),
      syncThemeRecommendation: () => set((state) => ({ artist: themeTrack(state.mode) })),
      playTheme: async () => {
        const token = get().developerToken;
        const term = themeTrack(get().mode);
        if (!token) { set({ error: "Apple Music Developer Token이 필요합니다." }); return; }
        set({ connecting: true, error: null });
        try {
          await authorizeAndPlayTheme(token, term);
          set({ connected: true, connecting: false, playing: true, title: "APPLE MUSIC", artist: term });
        } catch (error) {
          set({ connecting: false, error: error instanceof Error ? error.message : "테마 음악 재생에 실패했습니다." });
        }
      },
    }),
    { name: "personal-system:music:v1", partialize: (state) => ({ mode: state.mode, developerToken: state.developerToken }) },
  ),
);
