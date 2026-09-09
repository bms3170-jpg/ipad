import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFocusStore } from "../../stores/focusStore";
import { useMusicStore } from "../../stores/musicStore";
import { useNoteStore } from "../../stores/noteStore";
import { useScheduleStore } from "../../stores/scheduleStore";
import { useTaskStore } from "../../stores/taskStore";
import { useWeatherStore } from "../../stores/weatherStore";
import { localDateKey, minutesFromTime } from "../../utils/date";

const WEEK = ["S", "M", "T", "W", "T", "F", "S"];

export function ArtDecoHome() {
  const navigate = useNavigate();
  const [now, setNow] = useState(new Date());
  const tasks = useTaskStore((state) => state.tasks);
  const addTask = useTaskStore((state) => state.addTask);
  const toggleTask = useTaskStore((state) => state.toggleTask);
  const schedules = useScheduleStore((state) => state.schedules);
  const notes = useNoteStore((state) => state.notes);
  const weather = useWeatherStore((state) => state.snapshot);
  const loadWeather = useWeatherStore((state) => state.load);
  const music = useMusicStore();
  const focus = useFocusStore();

  useEffect(() => { const id = window.setInterval(() => setNow(new Date()), 1000); return () => window.clearInterval(id); }, []);
  useEffect(() => { loadWeather(); }, [loadWeather]);

  const dateKey = localDateKey(now);
  const list = useMemo(() => tasks.filter((task) => task.date === dateKey && !task.deletedAt).slice(0, 7), [tasks, dateKey]);
  const done = list.filter((task) => task.completed).length;
  const daySchedules = schedules.filter((item) => item.date === dateKey && !item.deletedAt).sort((a, b) => a.startTime.localeCompare(b.startTime));
  const minute = now.getHours() * 60 + now.getMinutes();
  const current = daySchedules.find((item) => minutesFromTime(item.startTime) <= minute && minutesFromTime(item.endTime) > minute);
  const next = daySchedules.find((item) => minutesFromTime(item.startTime) > minute);
  const note = notes.find((item) => !item.hidden && !item.deletedAt);
  const first = new Date(now.getFullYear(), now.getMonth(), 1).getDay();
  const days = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const time = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

  return <section className="deco-home" aria-label="Art Deco OS Home">
    <aside className="deco-nav">
      <header><i>✦</i><strong>ART DECO<br/><span>OS</span></strong><small>PERSONAL SYSTEM</small></header>
      <p>ELEGANCE<br/>ORGANIZES<br/>A BRIGHTER YOU</p>
      <nav>{[["⌂","Home","/"],["☑","Todo","/today"],["31","Calendar","/calendar"],["☷","Note","/notes"],["▧","Photo","/gallery"],["♫","Music","/music"],["◎","Web","/"],["■","Files","/"],["⚙","Setting","/settings"]].map(([icon,label,path]) => <button key={label} className={label === "Home" ? "active" : ""} onClick={() => navigate(path)}><b>{icon}</b>{label}</button>)}</nav>
      <footer>GOOD<br/>THINGS<br/>TAKE<br/>TIME.<i>✦</i></footer>
    </aside>

    <header className="deco-top"><b>LIVE BEAUTIFULLY</b><span>{now.toLocaleDateString("en-CA").replaceAll("-", " · ")}　{time}</span></header>

    <article className="deco-hero">
      <div className="deco-arch"><strong>{time}</strong><span>{now.toLocaleDateString("en-US", { year:"numeric", month:"2-digit", day:"2-digit", weekday:"short" }).replaceAll("/", " . ")}</span></div>
      <div className="deco-skyline"><i/><i/><i/><i/><i/><i/><i/></div>
      <p>오늘도,<br/>나답게,<br/>조금 더 멋지게.</p><small>A BRIGHTER<br/>YOU<br/>EVERYDAY.</small>
    </article>

    <article className="deco-weather deco-frame" onClick={() => loadWeather(true)}>
      <header>WEATHER</header><div><i>☀</i><strong>{weather?.temperature ?? 24}°</strong><p>H : {weather?.high ?? 26}°<br/>L : {weather?.low ?? 18}°<br/>HUM : 42%<br/>WIND : 2m/s</p></div><b>{weather?.description ?? "맑음"}<small>SEOUL, KR</small></b>
      <footer>{[0,1,2,3].map((n) => <span key={n}>☀<b>{now.getMonth()+1}/{now.getDate()+n}</b><small>{25-n}° / {17-n%2}°</small></span>)}</footer>
    </article>

    <article className="deco-music deco-frame"><header>MUSIC</header><div className="deco-vinyl"><i/></div><section><b>{music.title}</b><span>{music.artist || "Jazz Lounge"}</span><em><i style={{width:`${Math.max(28,music.progress)}%`}}/></em><div><button>◀</button><button onClick={music.togglePlay}>{music.playing ? "Ⅱ" : "▶"}</button><button onClick={() => navigate("/music")}>▶</button></div><small>Good Music<br/>Better Day.</small></section></article>

    <article className="deco-tasks deco-frame"><header><b>TODAY TASKS</b><span>{done} / {list.length || 0}</span></header><div>{list.map((task) => <button key={task.id} className={task.completed ? "done" : ""} onClick={() => toggleTask(task.id)}><i>{task.completed ? "✓" : ""}</i>{task.title}</button>)}</div><form onSubmit={(event) => { event.preventDefault(); void addTask({title:"새로운 할 일"}); }}><button>＋　새로운 할 일 추가하기</button><b>＋</b></form></article>

    <article className="deco-calendar deco-frame" onClick={() => navigate("/calendar")}><header><b>‹</b><span>CALENDAR</span><b>›</b></header><h3>{now.getFullYear()}. {String(now.getMonth()+1).padStart(2,"0")}</h3><div className="deco-week">{WEEK.map((d,i) => <b key={`${d}${i}`}>{d}</b>)}</div><div className="deco-month">{Array.from({length:first}).map((_,i)=><i key={`b${i}`}/>)}{Array.from({length:days},(_,i)=>i+1).map((d)=><span key={d} className={d===now.getDate()?"today":""}>{d}</span>)}</div><small>A NEW DAY<br/>A BETTER YOU.</small></article>

    <article className="deco-note deco-paper" onClick={() => navigate("/notes")}><b>QUICK NOTE</b><p>{note?.content || "지금도 충분히 잘하고 있어.\n오늘도, 좋은 하루. ♡"}</p><i>✒</i></article>
    <article className="deco-memory deco-paper" onClick={() => navigate("/gallery")}><b>MEMORY STRIP</b><div>{["city","cat","flower","note","sun"].map((kind)=><i key={kind} className={kind}/>)}</div><small>A PAGE A DAY, A BETTER ME.</small></article>

    <article className="deco-focus deco-frame"><header>FOCUS TIMER</header><div className="deco-focus-ring"><b>{focus.active ? `${Math.floor(focus.remainingSeconds()/60)}:${String(focus.remainingSeconds()%60).padStart(2,"0")}` : "25:00"}</b></div><section><button onClick={() => focus.start(25,"Focus")}>▶　Focus</button><button onClick={() => focus.start(5,"Short Break")}>♨　Short Break</button><button onClick={() => focus.start(15,"Long Break")}>⟳　Long Break</button></section><small>FOCUS NOW.<br/>A BETTER TOMORROW.</small></article>
    <article className="deco-now deco-paper"><header>NOW / NEXT</header><span>NOW</span><b>{current?.title || "FREE TIME"}</b><p>{current ? `${current.startTime} — ${current.endTime}` : "오늘 남은 일정 없음"}</p><span>NEXT</span><strong>{next ? `${next.startTime} · ${next.title}` : "-"}</strong></article>

    <footer className="deco-dock">{[["◎","Browser","/"],["▧","Photos","/gallery"],["31","Calendar","/calendar"],["♫","Music","/music"],["◉","ChatGPT","/"],["■","Files","/"],["☷","Notes","/notes"]].map(([icon,label,path])=><button key={label} onClick={()=>navigate(path)}><b>{icon}</b><span>{label}</span></button>)}<em>Good Mood<br/>Always　✦</em></footer>
  </section>;
}
