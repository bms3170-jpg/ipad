import type { DailyRecord, FocusRecord, GalleryPhoto, Note, Schedule, Task } from "../types";

const DB_NAME = "personal-system";
const DB_VERSION = 4;

export const STORES = {
  tasks: "tasks",
  schedules: "schedules",
  notes: "notes",
  focusRecords: "focusRecords",
  dailyRecords: "dailyRecords",
  photos: "photos",
} as const;

type StoreName = (typeof STORES)[keyof typeof STORES];
let dbPromise: Promise<IDBDatabase> | null = null;

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("IndexedDB request failed"));
  });
}

function transactionDone(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error("IndexedDB transaction failed"));
    transaction.onabort = () => reject(transaction.error ?? new Error("IndexedDB transaction aborted"));
  });
}

export function openDatabase(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      const ensure = (name: StoreName, keyPath = "id") => {
        if (!db.objectStoreNames.contains(name)) db.createObjectStore(name, { keyPath });
      };
      ensure(STORES.tasks);
      ensure(STORES.schedules);
      ensure(STORES.notes);
      ensure(STORES.focusRecords);
      ensure(STORES.dailyRecords, "date");
      ensure(STORES.photos);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("IndexedDB open failed"));
  });
  return dbPromise;
}

export async function getAll<T>(storeName: StoreName): Promise<T[]> {
  const db = await openDatabase();
  const tx = db.transaction(storeName, "readonly");
  const result = await requestToPromise(tx.objectStore(storeName).getAll());
  await transactionDone(tx);
  return result as T[];
}

export async function getOne<T>(storeName: StoreName, key: IDBValidKey): Promise<T | undefined> {
  const db = await openDatabase();
  const tx = db.transaction(storeName, "readonly");
  const result = await requestToPromise(tx.objectStore(storeName).get(key));
  await transactionDone(tx);
  return result as T | undefined;
}

export async function putOne<T>(storeName: StoreName, value: T): Promise<void> {
  const db = await openDatabase();
  const tx = db.transaction(storeName, "readwrite");
  tx.objectStore(storeName).put(value);
  await transactionDone(tx);
}

export async function putMany<T>(storeName: StoreName, values: T[]): Promise<void> {
  const db = await openDatabase();
  const tx = db.transaction(storeName, "readwrite");
  const store = tx.objectStore(storeName);
  values.forEach((value) => store.put(value));
  await transactionDone(tx);
}

export async function deleteOne(storeName: StoreName, key: IDBValidKey): Promise<void> {
  const db = await openDatabase();
  const tx = db.transaction(storeName, "readwrite");
  tx.objectStore(storeName).delete(key);
  await transactionDone(tx);
}

export async function clearStore(storeName: StoreName): Promise<void> {
  const db = await openDatabase();
  const tx = db.transaction(storeName, "readwrite");
  tx.objectStore(storeName).clear();
  await transactionDone(tx);
}

export async function exportDatabase() {
  const [tasks, schedules, notes, focusRecords, dailyRecords] = await Promise.all([
    getAll<Task>(STORES.tasks),
    getAll<Schedule>(STORES.schedules),
    getAll<Note>(STORES.notes),
    getAll<FocusRecord>(STORES.focusRecords),
    getAll<DailyRecord>(STORES.dailyRecords),
  ]);
  const photos = await getAll<GalleryPhoto>(STORES.photos);
  const photoMeta = photos.map(({ blob: _blob, ...meta }) => meta);
  return { tasks, schedules, notes, focusRecords, dailyRecords, photoMeta };
}
