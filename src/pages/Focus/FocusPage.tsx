import { useEffect, useMemo, useState } from "react";
import { useFocusStore } from "../../stores/focusStore";
import { useMusicStore } from "../../stores/musicStore";
import { useTaskStore } from "../../stores/taskStore";
import { formatDuration, localDateKey } from "../../utils/date";
import type { FocusMood } from "../../types";

function formatSeconds(value: number) {
  const m = Math.floor(value / 60); const s = value % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function FocusPage() {
  const active = useFocusStore((s) => s.active); const start = useFocusStore((s) => s.start); const pause = useFocusStore((s) => s.pause); const resume = useFocusStore((s) => s.resume); const finish = useFocusStore((s) => s.finish); const cancel = useFocusStore((s) => s.cancel); const remainingSeconds = useFocusStore((s) => s.remainingSeconds); const records = useFocusStore((s) => s.records); const hydrateRecords = useFocusStore((s) => s.hydrateRecords);
  const music = useMusicStore(); const tasks = useTaskStore((s) => s.tasks);
  const [tick, setTick] = useState(0); const [title, setTitle] = useState("Deep Work"); const [duration, setDuration] = useState(50); const [taskId, setTaskId] = useState(""); const [completed, setCompleted] = useState(false);
  useEffect(() => { hydrateRecords(); const timer = window.setInterval(() => setTick((v) => v + 1), 1000); return () => window.clearInterval(timer); }, [hydrateRecords]);
  const remaining = active ? remainingSeconds() : 0; void tick;
  useEffect(() => { if (active && remaining <= 0) { finish(undefined, music.artist).then(() => setCompleted(true)); } }, [active, remaining, finish, music.artist]);
  const todayRecords = useMemo(() => records.filter((record) => localDateKey(new Date(record.startedAt)) === localDateKey()), [records]);
  const todayMinutes = todayRecords.reduce((sum, record) => sum + record.durationMinutes, 0);
  const eligibleTasks = tasks.filter((task) => task.date === localDateKey() && !task.completed);
  const begin = () => { start(duration, title, taskId || undefined); music.setMode("focus"); setCompleted(false); };
  const completeWithMood = async (mood: FocusMood) => { await finish(mood, music.artist); setCompleted(true); };

  return <section className={`page focus-page ${active ? "focus-active" : ""}`}>
    <div className="focus-main">
      <div className="focus-status"><span className="kicker">DISTRACTION FREE</span><b>{active ? active.pausedAt ? "PAUSED" : "FOCUSING" : completed ? "FOCUS COMPLETE" : "READY"}</b></div>
      <div className="focus-ring"><div><strong>{active ? formatSeconds(remaining) : `${duration}:00`}</strong><span>{active?.title ?? title}</span></div></div>
      {!active ? <div className="focus-setup"><div className="focus-duration">{[25,50,90].map((value) => <button key={value} className={duration === value ? "active" : ""} onClick={() => setDuration(value)}>{value} MIN</button>)}<input type="number" min={5} max={240} value={duration} onChange={(e) => setDuration(Math.max(5, Math.min(240, Number(e.target.value))))} /></div><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="집중할 작업" /><select value={taskId} onChange={(e) => { setTaskId(e.target.value); const task = eligibleTasks.find((t) => t.id === e.target.value); if (task) setTitle(task.title); }}><option value="">Task 연결 안 함</option>{eligibleTasks.map((task) => <option key={task.id} value={task.id}>{task.title}</option>)}</select><button className="primary focus-start" onClick={begin}>START FOCUS</button></div> : <div className="focus-live-actions"><button onClick={active.pausedAt ? resume : pause}>{active.pausedAt ? "▶ RESUME" : "❚❚ PAUSE"}</button><button onClick={() => completeWithMood("good")}>✓ COMPLETE</button><button className="danger" onClick={cancel}>END</button></div>}
      {completed && !active && <div className="focus-complete-box"><b>FOCUS COMPLETE</b><span>집중은 어땠나요?</span><div>{(["tired","neutral","good","fire"] as FocusMood[]).map((value, i) => <button key={value} onClick={() => setCompleted(false)}>{["😵","😐","🙂","🔥"][i]}</button>)}</div></div>}
    </div>
    <aside className="focus-side"><article className="card"><span className="kicker">TODAY</span><div className="metric-row small"><div><b>{todayRecords.length}</b><span>SESSIONS</span></div><div><b>{formatDuration(todayMinutes)}</b><span>FOCUS</span></div></div></article><article className="card"><span className="kicker">FOCUS MUSIC</span><h3>{music.artist}</h3><p>{music.playing ? "재생 중" : "준비됨"}</p><button className="wide" onClick={music.togglePlay}>{music.playing ? "PAUSE" : "PLAY"}</button></article><article className="card focus-history"><span className="kicker">RECENT</span>{records.slice(0,5).map((record) => <div key={record.id}><b>{record.title}</b><span>{record.durationMinutes}m · {record.mood ?? "—"}</span></div>)}{!records.length && <p className="empty">아직 Focus 기록이 없습니다.</p>}</article></aside>
  </section>;
}
