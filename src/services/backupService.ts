import { clearStore, getAll, putMany, STORES } from "../db/database";
import type { DailyRecord, FocusRecord, GalleryPhoto, Note, Schedule, Task } from "../types";

type BackupPhoto = Omit<GalleryPhoto, "blob"> & { dataUrl: string };
type BackupFile = {
  format: "personal-system-backup";
  version: 1;
  createdAt: string;
  appVersion: string;
  localSettings: Record<string, string>;
  data: { tasks: Task[]; schedules: Schedule[]; notes: Note[]; focusRecords: FocusRecord[]; dailyRecords: DailyRecord[]; photos: BackupPhoto[] };
};

function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = () => reject(reader.error); reader.readAsDataURL(blob);
  });
}

async function dataUrlToBlob(dataUrl: string) {
  const response = await fetch(dataUrl); return response.blob();
}

export async function createBackup(): Promise<BackupFile> {
  const [tasks, schedules, notes, focusRecords, dailyRecords, photoRows] = await Promise.all([
    getAll<Task>(STORES.tasks), getAll<Schedule>(STORES.schedules), getAll<Note>(STORES.notes), getAll<FocusRecord>(STORES.focusRecords), getAll<DailyRecord>(STORES.dailyRecords), getAll<GalleryPhoto>(STORES.photos),
  ]);
  const photos: BackupPhoto[] = [];
  for (const photo of photoRows) { const { blob, ...meta } = photo; photos.push({ ...meta, dataUrl: await blobToDataUrl(blob) }); }
  const localSettings: Record<string, string> = {};
  for (let i = 0; i < localStorage.length; i++) { const key = localStorage.key(i); if (key?.startsWith("personal-system:")) localSettings[key] = localStorage.getItem(key) ?? ""; }
  return { format: "personal-system-backup", version: 1, createdAt: new Date().toISOString(), appVersion: "1.0.0", localSettings, data: { tasks, schedules, notes, focusRecords, dailyRecords, photos } };
}

export async function downloadBackup() {
  const data = await createBackup(); const blob = new Blob([JSON.stringify(data)], { type: "application/json" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `personal-system-backup-${new Date().toISOString().slice(0,10)}.json`; a.click(); URL.revokeObjectURL(url);
}

export async function restoreBackup(file: File) {
  const parsed = JSON.parse(await file.text()) as BackupFile;
  if (parsed.format !== "personal-system-backup") throw new Error("Personal System 백업 파일이 아닙니다.");
  const photos: GalleryPhoto[] = [];
  for (const photo of parsed.data.photos ?? []) { const { dataUrl, ...meta } = photo; photos.push({ ...meta, blob: await dataUrlToBlob(dataUrl) }); }
  await Promise.all(Object.values(STORES).map((store) => clearStore(store)));
  await Promise.all([
    putMany(STORES.tasks, parsed.data.tasks ?? []), putMany(STORES.schedules, parsed.data.schedules ?? []), putMany(STORES.notes, parsed.data.notes ?? []), putMany(STORES.focusRecords, parsed.data.focusRecords ?? []), putMany(STORES.dailyRecords, parsed.data.dailyRecords ?? []), putMany(STORES.photos, photos),
  ]);
  Object.entries(parsed.localSettings ?? {}).forEach(([key, value]) => localStorage.setItem(key, value));
}

export async function resetAllData() {
  await Promise.all(Object.values(STORES).map((store) => clearStore(store)));
  const keys = Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index)).filter((key): key is string => Boolean(key));
  keys.filter((key) => key.startsWith("personal-system:")).forEach((key) => localStorage.removeItem(key));
}
