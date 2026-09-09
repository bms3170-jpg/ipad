export function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function isoNow() {
  return new Date().toISOString();
}

export function makeId(prefix: string) {
  return globalThis.crypto?.randomUUID?.() ?? `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

export function minutesFromTime(value: string) {
  const [h, m] = value.split(":").map(Number);
  return h * 60 + m;
}

export function timeFromMinutes(total: number) {
  const safe = Math.max(0, Math.min(1439, total));
  const h = Math.floor(safe / 60);
  const m = safe % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (!h) return `${m}M`;
  if (!m) return `${h}H`;
  return `${h}H ${m}M`;
}

export function startOfMonthGrid(date: Date) {
  const first = new Date(date.getFullYear(), date.getMonth(), 1);
  const offset = (first.getDay() + 6) % 7;
  const start = new Date(first);
  start.setDate(first.getDate() - offset);
  return start;
}

export function dateAddDays(date: Date, amount: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
}
