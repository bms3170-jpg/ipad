import { create } from "zustand";
import { getAll, putOne, STORES } from "../db/database";
import type { GalleryPhoto } from "../types";
import { isoNow, localDateKey, makeId } from "../utils/date";

type GalleryState = {
  photos: GalleryPhoto[]; hydrated: boolean; loading: boolean;
  hydrate: () => Promise<void>;
  addFiles: (files: FileList | File[]) => Promise<void>;
  updatePhoto: (id: string, input: Partial<GalleryPhoto>) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  setTodayMemory: (id: string, date?: string) => Promise<void>;
  setWallpaper: (id: string) => Promise<void>;
  deletePhoto: (id: string) => Promise<void>;
};

export const useGalleryStore = create<GalleryState>((set, get) => ({
  photos: [], hydrated: false, loading: false,
  hydrate: async () => {
    if (get().hydrated || get().loading) return; set({ loading: true });
    const photos = (await getAll<GalleryPhoto>(STORES.photos)).filter((photo) => !photo.deletedAt).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    set({ photos, hydrated: true, loading: false });
  },
  addFiles: async (files) => {
    const list = Array.from(files); const created: GalleryPhoto[] = [];
    for (const file of list) {
      const now = isoNow();
      const photo: GalleryPhoto = { id: makeId("photo"), fileName: file.name, mimeType: file.type, blob: file, createdAt: now, updatedAt: now, title: file.name.replace(/\.[^.]+$/, ""), caption: "", tags: [], favorite: false, hidden: false, isWallpaper: false, linkedThemeIds: [], deletedAt: null };
      await putOne(STORES.photos, photo); created.push(photo);
    }
    set((state) => ({ photos: [...created, ...state.photos] }));
  },
  updatePhoto: async (id, input) => {
    const current = get().photos.find((photo) => photo.id === id); if (!current) return;
    const updated = { ...current, ...input, id: current.id, updatedAt: isoNow() };
    await putOne(STORES.photos, updated); set((state) => ({ photos: state.photos.map((photo) => photo.id === id ? updated : photo) }));
  },
  toggleFavorite: async (id) => { const current = get().photos.find((photo) => photo.id === id); if (current) await get().updatePhoto(id, { favorite: !current.favorite }); },
  setTodayMemory: async (id, date = localDateKey()) => {
    for (const photo of get().photos) {
      if (photo.todayMemoryDate === date && photo.id !== id) await get().updatePhoto(photo.id, { todayMemoryDate: undefined });
    }
    await get().updatePhoto(id, { todayMemoryDate: date });
  },
  setWallpaper: async (id) => {
    for (const photo of get().photos) if (photo.isWallpaper && photo.id !== id) await get().updatePhoto(photo.id, { isWallpaper: false });
    await get().updatePhoto(id, { isWallpaper: true });
  },
  deletePhoto: async (id) => {
    const current = get().photos.find((photo) => photo.id === id); if (!current) return;
    await putOne(STORES.photos, { ...current, deletedAt: isoNow(), updatedAt: isoNow() }); set((state) => ({ photos: state.photos.filter((photo) => photo.id !== id) }));
  },
}));
