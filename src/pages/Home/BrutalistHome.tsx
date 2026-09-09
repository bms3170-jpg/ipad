import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFocusStore } from "../../stores/focusStore";
import { useMusicStore } from "../../stores/musicStore";
import { useNoteStore } from "../../stores/noteStore";
import { useScheduleStore } from "../../stores/scheduleStore";
import { useTaskStore } from "../../stores/taskStore";
import { useWeatherStore } from "../../stores/weatherStore";
import { localDateKey, minutesFromTime } from "../../utils/date";

const DAYS = ["일", "월", "화", "수", "목", "금", "토"];

export function BrutalistHome() {
  const navigate = useNavigate();
  const [now, setNow] = useState(new Date());
  const tasks = useTaskStore((state) => state.tasks);
  const toggleTask = useTaskStore((state) => state.toggleTask);
  const schedules = useScheduleStore((state) => state.schedules);
  const weather = useWeatherStore((state) => state.snapshot);
  const loadWeather = useWeatherStore((state) => state.load);
  const notes = useNoteStore((state) => state.notes);
  const music = useMusicStore();
  const focus = useFocusStore();

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);
  useEffect(() => { loadWeather(); }, [loadWeather]);

  const dateKey = localDateKey(now);
  const todayTasks = useMemo(() => tasks.filter((task) => task.date === dateKey && !task.deletedAt).slice(0, 7), [tasks, dateKey]);
  const done = todayTasks.filter((task) => task.completed).length;
  const todaySchedules = schedules.filter((item) => item.date === dateKey && !item.deletedAt).sort((a, b) => a.startTime.localeCompare(b.startTime));
  const minute = now.getHours() * 60 + now.getMinutes();
  const current = todaySchedules.find((item) => minutesFromTime(item.startTime) <= minute && minutesFromTime(item.endTime) > minute);
  const next = todaySchedules.find((item) => minutesFromTime(item.startTime) > minute);
  const latestNote = notes.find((note) => !note.hidden && !note.deletedAt);
  const first = new Date(now.getFullYear(), now.getMonth(), 1).getDay();
  const days = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

  return (
    <section className="brutalist-home" aria-label="Brutalist OS Home">
      <header className="brutalist-banner">
        <div className="brutalist-title"><b>BRUTALIST OS</b><span>SIMPLE<br />BOLD<br />DIFFERENT</span></div>
        <div className="brutalist-mantra">FOCUS<br />PLAN<br />REPEAT</div>
        <div className="brutalist-red">사람<small>A BETTER<br />ME<br />EVERYDAY</small></div>
        <div className="brutalist-city" />
        <div className="brutalist-status">DISCIPLINE<br />CREATES<br />FREEDOM<small>SEOUL, KOREA<br />{weather?.temperature ?? 24}° CLEAR</small></div>
      </header>

      <article className="b-panel b-clock">
        <div className="b-time">{now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })}</div>
        <div className="b-day">{now.getHours() >= 12 ? "PM" : "AM"}<small>{DAYS[now.getDay()]}요일<br />{String(now.getMonth() + 1).padStart(2, "0")}.{String(now.getDate()).padStart(2, "0")}</small><i /></div>
        <p>오늘도,<br />나답게,<br />조금 더 멋지게.</p>
        <div className="b-architecture"><span>GOOD<br />DAYS<br />AHEAD</span></div>
        <small className="b-habit">SAME<br />HABITS<br />A BRIGHTER YOU.</small>
      </article>

      <article className="b-panel b-weather" onClick={() => loadWeather(true)}>
        <span className="b-label">SEOUL</span><button>•••</button>
        <div><i>☀</i><strong>{weather?.temperature ?? 24}°</strong></div>
        <p>{weather?.description ?? "맑음"}</p><small>H {weather?.high ?? 26}° · L {weather?.low ?? 18}°</small>
      </article>

      <article className="b-panel b-music">
        <div className="b-record"><i /></div><div className="b-track"><span>MUSIC</span><b>{music.title}</b><small>{music.artist}</small><em><i style={{ width: `${Math.max(12, music.progress)}%` }} /></em><div><button onClick={music.togglePlay}>◀</button><button onClick={music.togglePlay}>{music.playing ? "Ⅱ" : "▶"}</button><button onClick={() => navigate("/music")}>▶</button></div></div>
      </article>

      <article className="b-panel b-tasks">
        <header><b>TODAY TASKS</b><span>{done} / {todayTasks.length || 0}</span></header>
        <div>{todayTasks.length ? todayTasks.map((task) => <button key={task.id} className={task.completed ? "done" : ""} onClick={() => toggleTask(task.id)}><i>{task.completed ? "✓" : ""}</i><span>{task.title}</span></button>) : <p>오늘 할 일을 추가해보세요.</p>}</div>
        <small>DO IT<br />FOR A<br />BETTER<br />YOU.</small>
      </article>

      <article className="b-panel b-calendar" onClick={() => navigate("/calendar") }>
        <header><b>‹</b><span>{now.toLocaleDateString("ko-KR", { year: "numeric", month: "long" })}</span><b>›</b></header>
        <div className="b-week">{["S","M","T","W","T","F","S"].map((day, index) => <span key={`${day}-${index}`}>{day}</span>)}</div>
        <div className="b-month">{Array.from({ length: first }).map((_, index) => <i key={`blank-${index}`} />)}{Array.from({ length: days }, (_, index) => index + 1).map((day) => <span key={day} className={day === now.getDate() ? "today" : ""}>{day}</span>)}</div>
      </article>

      <aside className="b-callout">MAKE<br />TODAY<br />COUNT.</aside>

      <article className="b-panel b-note" onClick={() => navigate("/notes") }><span>QUICK NOTE</span><p>{latestNote?.content || "지금도 충분히 잘하고 있어.\n오늘도, 좋은 하루."}</p></article>

      <article className="b-panel b-focus">
        <span>FOCUS TIMER</span><div className="b-focus-ring"><b>{focus.active ? `${Math.floor(focus.remainingSeconds()/60)}:${String(focus.remainingSeconds()%60).padStart(2,"0")}` : "25:00"}</b></div>
        <div><button onClick={() => focus.start(25,"Focus")}>◉ Focus</button><button onClick={() => focus.start(5,"Short Break")}>☕ Short Break</button><button onClick={() => focus.start(15,"Long Break")}>◔ Long Break</button></div>
      </article>

      <article className="b-panel b-now"><span>NOW / NEXT</span><b>{current?.title || "FREE TIME"}</b><small>{current ? `${current.startTime} — ${current.endTime}` : "오늘 남은 일정 없음"}</small><em>NEXT</em><strong>{next ? `${next.startTime} · ${next.title}` : "-"}</strong></article>

      <article className="b-panel b-memory" onClick={() => navigate("/gallery") }><span>MEMORY STRIP</span><div>{[1,2,3,4,5].map((item) => <i key={item} />)}</div><small>A PAGE A DAY · A BETTER ME</small></article>
    </section>
  );
}
