import { useMemo } from "react";
import { useFocusStore } from "../stores/focusStore";
import { useScheduleStore } from "../stores/scheduleStore";
import { useTaskStore } from "../stores/taskStore";
import { useWeatherStore } from "../stores/weatherStore";
import { localDateKey, minutesFromTime } from "../utils/date";

type Props = { open: boolean; onClose: () => void };
export function NotificationPanel({ open, onClose }: Props) {
  const schedules = useScheduleStore((s) => s.schedules); const tasks = useTaskStore((s) => s.tasks); const weather = useWeatherStore((s) => s.snapshot); const focus = useFocusStore((s) => s.active);
  const items = useMemo(() => {
    const date = localDateKey(); const now = new Date(); const nowMin = now.getHours() * 60 + now.getMinutes(); const result: Array<{ level: string; title: string; detail: string }> = [];
    const next = schedules.filter((s) => s.date === date && minutesFromTime(s.startTime) >= nowMin).sort((a,b) => a.startTime.localeCompare(b.startTime))[0];
    if (next) { const diff = minutesFromTime(next.startTime) - nowMin; result.push({ level: diff <= 30 ? "HIGH" : "UPCOMING", title: diff <= 60 ? `${diff}분 후 일정` : "다음 일정", detail: `${next.startTime} · ${next.title}` }); }
    const overdue = tasks.filter((t) => t.date === date && t.time && !t.completed && minutesFromTime(t.time) < nowMin).slice(0,2); overdue.forEach((t) => result.push({ level: "TASK", title: "시간이 지난 할 일", detail: `${t.time} · ${t.title}` }));
    if (focus) result.push({ level: "FOCUS", title: "집중 세션 진행 중", detail: focus.title });
    if ((weather?.precipitationProbability ?? 0) >= 60) result.push({ level: "WEATHER", title: "비 가능성 높음", detail: `강수확률 ${weather?.precipitationProbability}% · 우산을 확인하세요.` });
    return result;
  }, [schedules, tasks, weather, focus]);
  if (!open) return null;
  return <div className="notification-shade" onPointerDown={(e) => { if (e.currentTarget === e.target) onClose(); }}><aside className="notification-panel"><header><div><span className="kicker">CENTER</span><h2>NOTIFICATIONS</h2></div><button onClick={onClose}>×</button></header><div className="notification-list">{items.length ? items.map((item, i) => <article key={i}><span>{item.level}</span><b>{item.title}</b><p>{item.detail}</p></article>) : <p className="empty">새 알림이 없습니다.</p>}</div></aside></div>;
}
