import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import type { ComponentType, LazyExoticComponent } from "react";
import { useNavigate } from "react-router-dom";
import { useFocusStore } from "../../stores/focusStore";
import { useHomeLayoutStore } from "../../stores/homeLayoutStore";
import { useMusicStore } from "../../stores/musicStore";
import { useScheduleStore } from "../../stores/scheduleStore";
import { useTaskStore } from "../../stores/taskStore";
import { useWeatherStore } from "../../stores/weatherStore";
import { useSettingsStore } from "../../stores/settingsStore";
import type { HomeWidgetConfig, HomeWidgetType } from "../../types";
import { localDateKey, minutesFromTime } from "../../utils/date";
import { useThemeStore } from "../../stores/themeStore";
const BrutalistHome=lazy(()=>import("./BrutalistHome").then(m=>({default:m.BrutalistHome})));
const RetroTerminalHome=lazy(()=>import("./RetroTerminalHome").then(m=>({default:m.RetroTerminalHome})));
const BlueprintHome=lazy(()=>import("./BlueprintHome").then(m=>({default:m.BlueprintHome})));
const ArtDecoHome=lazy(()=>import("./ArtDecoHome").then(m=>({default:m.ArtDecoHome})));
const Y2KHome=lazy(()=>import("./Y2KHome").then(m=>({default:m.Y2KHome})));
const ScrapbookHome=lazy(()=>import("./ScrapbookHome").then(m=>({default:m.ScrapbookHome})));
const MoonBaseHome=lazy(()=>import("./MoonBaseHome").then(m=>({default:m.MoonBaseHome})));
const IsometricHome=lazy(()=>import("./IsometricHome").then(m=>({default:m.IsometricHome})));
const RetroPixelHome=lazy(()=>import("./RetroPixelHome").then(m=>({default:m.RetroPixelHome})));
const MinimalGalleryHome=lazy(()=>import("./MinimalGalleryHome").then(m=>({default:m.MinimalGalleryHome})));
const MangaHome=lazy(()=>import("./MangaHome").then(m=>({default:m.MangaHome})));
const ScientificLabHome=lazy(()=>import("./ScientificLabHome").then(m=>({default:m.ScientificLabHome})));
const RacingHome=lazy(()=>import("./RacingHome").then(m=>({default:m.RacingHome})));
const NewspaperHome=lazy(()=>import("./NewspaperHome").then(m=>({default:m.NewspaperHome})));
const TransitHome=lazy(()=>import("./TransitHome").then(m=>({default:m.TransitHome})));
const FantasyHome=lazy(()=>import("./FantasyHome").then(m=>({default:m.FantasyHome})));
const ModularSynthHome=lazy(()=>import("./ModularSynthHome").then(m=>({default:m.ModularSynthHome})));
const GothicHome=lazy(()=>import("./GothicHome").then(m=>({default:m.GothicHome})));
const MedicalHome=lazy(()=>import("./MedicalHome").then(m=>({default:m.MedicalHome})));
const LuxuryWatchHome=lazy(()=>import("./LuxuryWatchHome").then(m=>({default:m.LuxuryWatchHome})));

const themeHomes:Record<string,LazyExoticComponent<ComponentType>>={
  brutalist:BrutalistHome,"retro-terminal":RetroTerminalHome,blueprint:BlueprintHome,"art-deco":ArtDecoHome,y2k:Y2KHome,scrapbook:ScrapbookHome,"moon-base":MoonBaseHome,"isometric-island":IsometricHome,"retro-pixel":RetroPixelHome,"minimal-gallery":MinimalGalleryHome,"manga-panel":MangaHome,"scientific-lab":ScientificLabHome,racing:RacingHome,newspaper:NewspaperHome,transit:TransitHome,fantasy:FantasyHome,"modular-synth":ModularSynthHome,gothic:GothicHome,medical:MedicalHome,"luxury-watch":LuxuryWatchHome
};

function greetingFor(hour: number) { if (hour >= 5 && hour < 12) return "GOOD MORNING"; if (hour < 18) return "GOOD AFTERNOON"; if (hour < 23) return "GOOD EVENING"; return "GOOD NIGHT"; }
function weatherIcon(kind?: string) { return kind === "clear" ? "☀" : kind === "rain" ? "☂" : kind === "snow" ? "❄" : kind === "storm" ? "ϟ" : kind === "fog" ? "≋" : "☁"; }

export function HomePage() {
  const currentThemeId = useThemeStore((s) => s.currentThemeId);
  const navigate = useNavigate();
  const [now, setNow] = useState(new Date());
  const [quickTask, setQuickTask] = useState("");
  const [isPortrait, setIsPortrait] = useState(() => matchMedia("(orientation: portrait)").matches);
  const tasks = useTaskStore((s) => s.tasks); const addTask = useTaskStore((s) => s.addTask); const toggleTask = useTaskStore((s) => s.toggleTask); const togglePriority = useTaskStore((s) => s.togglePriority);
  const schedules = useScheduleStore((s) => s.schedules); const weather = useWeatherStore((s) => s.snapshot); const loadWeather = useWeatherStore((s) => s.load); const weatherLoading = useWeatherStore((s) => s.loading);
  const activeFocus = useFocusStore((s) => s.active); const focusStart = useFocusStore((s) => s.start);
  const music = useMusicStore();
  const testMode = useSettingsStore((s) => s.testMode); const testTime = useSettingsStore((s) => s.testTime); const testWeather = useSettingsStore((s) => s.testWeather);
  const layoutStore = useHomeLayoutStore(); const orientation = isPortrait ? "portrait" : "landscape"; const layout = layoutStore[orientation];

  useEffect(() => { const timer = window.setInterval(() => setNow(new Date()), 1000); return () => window.clearInterval(timer); }, []);
  useEffect(() => { loadWeather(); }, [loadWeather]);
  useEffect(() => { const media = matchMedia("(orientation: portrait)"); const handler = () => setIsPortrait(media.matches); media.addEventListener("change", handler); return () => media.removeEventListener("change", handler); }, []);

  const displayNow = testMode ? (() => { const d = new Date(now); const [h,m] = testTime.split(":").map(Number); d.setHours(h || 0, m || 0, 0, 0); return d; })() : now;
  const today = localDateKey(displayNow);
  const todayTasks = useMemo(() => tasks.filter((t) => t.date === today).sort((a,b) => Number(a.completed)-Number(b.completed) || Number(b.priority === "important")-Number(a.priority === "important") || (a.time ?? "99:99").localeCompare(b.time ?? "99:99")).slice(0, 6), [tasks, today]);
  const completed = todayTasks.filter((t) => t.completed).length;
  const nowMinutes = displayNow.getHours()*60+displayNow.getMinutes();
  const todaySchedules = schedules.filter((s) => s.date === today && !s.deletedAt).sort((a,b) => a.startTime.localeCompare(b.startTime));
  const current = todaySchedules.find((s) => minutesFromTime(s.startTime) <= nowMinutes && minutesFromTime(s.endTime) > nowMinutes);
  const next = todaySchedules.find((s) => minutesFromTime(s.startTime) > nowMinutes);

  const addQuickTask = async () => { if (!quickTask.trim()) return; await addTask({ title: quickTask }); setQuickTask(""); };

  const renderWidget = (item: HomeWidgetConfig) => {
    if (!item.visible) return null;
    const editTools = layoutStore.editMode ? <div className="widget-edit-tools"><button onClick={() => layoutStore.moveWidget(orientation, item.id, -1)}>←</button><button onClick={() => layoutStore.cycleSize(orientation, item.id)}>{item.size}</button><button onClick={() => layoutStore.moveWidget(orientation, item.id, 1)}>→</button><button onClick={() => layoutStore.removeWidget(orientation, item.id)}>×</button></div> : null;
    const cls = `home-widget widget-${item.type} size-${item.size}`;

    if (item.type === "clock") return <article key={item.id} className={`${cls} clock-widget`}>
      {editTools}<span className="widget-index">01</span><div className="clock-copy"><span className="kicker">{new Intl.DateTimeFormat("ko-KR", { month:"long", day:"numeric", weekday:"long" }).format(displayNow)}</span><h1>{greetingFor(displayNow.getHours())}</h1><p>오늘 필요한 것만 한 화면에.</p></div><div className="big-clock">{new Intl.DateTimeFormat("ko-KR", { hour:"2-digit", minute:"2-digit", hour12:false }).format(displayNow)}</div><div className="day-progress"><i style={{ width: `${((displayNow.getHours()*3600+displayNow.getMinutes()*60+displayNow.getSeconds())/86400)*100}%` }} /></div>
    </article>;

    if (item.type === "tasks") return <article key={item.id} className={cls}>
      {editTools}<span className="widget-index">02</span><header className="widget-heading"><div><span className="kicker">TODAY</span><h2>TASKS</h2></div><b>{completed}/{todayTasks.length}</b></header><div className="home-task-list">{todayTasks.length ? todayTasks.map((task) => <div key={task.id} className={`home-task ${task.completed ? "done" : ""}`}><button className="check" onClick={() => !layoutStore.editMode && toggleTask(task.id)}>{task.completed ? "✓" : ""}</button><button className="task-title" onClick={() => !layoutStore.editMode && navigate("/today")}>{task.time && <small>{task.time}</small>}{task.title}</button><button className={`star ${task.priority === "important" ? "on" : ""}`} onClick={() => !layoutStore.editMode && togglePriority(task.id)}>★</button></div>) : <div className="widget-empty-state"><b>NO TASKS</b><span>오늘의 첫 할 일을 추가해보세요.</span></div>}{!layoutStore.editMode && <form className="quick-task-form" onSubmit={(e) => { e.preventDefault(); addQuickTask(); }}><input value={quickTask} onChange={(e) => setQuickTask(e.target.value)} placeholder="+ 빠른 할 일" /><button>ADD</button></form>}</div>
    </article>;

    if (item.type === "nowNext") return <article key={item.id} className={cls}>
      {editTools}<span className="widget-index">03</span><header className="widget-heading"><div><span className="kicker">LIVE</span><h2>NOW / NEXT</h2></div></header>{activeFocus ? <div className="now-card"><span>FOCUSING</span><strong>{activeFocus.title}</strong><button onClick={() => navigate("/focus")}>FOCUS 열기 →</button></div> : current ? <div className="now-card"><span>NOW</span><strong>{current.title}</strong><small>{current.startTime} — {current.endTime}</small></div> : <div className="now-card"><span>NOW</span><strong>FREE TIME</strong><small>{next ? `${next.startTime}까지 여유 시간` : "오늘 남은 일정 없음"}</small></div>}<div className="next-row"><span>NEXT</span><b>{next ? `${next.startTime} · ${next.title}` : "—"}</b></div>
    </article>;

    if (item.type === "weather") return <article key={item.id} className={cls}>
      {editTools}<span className="widget-index">04</span><header className="widget-heading"><div><span className="kicker">{weather?.locationLabel ?? "WEATHER"}</span><h2>WEATHER</h2></div><button className="ghost" onClick={() => loadWeather(true)}>↻</button></header>{weather ? <><div className="weather-current"><span>{weatherIcon(testMode ? testWeather : weather.kind)}</span><strong>{weather.temperature}°</strong></div><p>{weather.description} · 체감 {weather.apparentTemperature}° · {weather.high}°/{weather.low}°</p>{item.size !== "S" && <div className="hour-strip">{weather.hourly.slice(0,4).map((h) => <div key={h.time}><span>{h.time.slice(11,16)}</span><b>{h.temperature}°</b><small>{h.precipitationProbability}%</small></div>)}</div>}</> : <p>{weatherLoading ? "날씨 불러오는 중…" : "날씨 데이터를 불러오지 못했습니다."}</p>}
    </article>;

    if (item.type === "music") return <article key={item.id} className={cls}>
      {editTools}<span className="widget-index">05</span><header className="widget-heading"><div><span className="kicker">AUDIO</span><h2>MUSIC</h2></div><span className={`status-dot ${music.playing ? "live" : ""}`} /></header><div className="music-mini"><div className="album">♫</div><div><b>{music.title}</b><span>{music.artist}</span></div></div><div className="music-controls"><button onClick={music.togglePlay}>{music.playing ? "❚❚" : "▶"}</button><button onClick={() => navigate("/music")}>OPEN</button></div>
    </article>;

    if (item.type === "focus") return <article key={item.id} className={cls}>
      {editTools}<span className="widget-index">06</span><header className="widget-heading"><div><span className="kicker">SESSION</span><h2>FOCUS</h2></div></header>{activeFocus ? <><div className="focus-mini">RUNNING</div><b>{activeFocus.title}</b><button className="primary wide" onClick={() => navigate("/focus")}>열기</button></> : <><div className="focus-mini">25:00</div><div className="focus-preset"><button onClick={() => focusStart(25, "Quick Focus")}>25</button><button onClick={() => focusStart(50, "Quick Focus")}>50</button><button onClick={() => focusStart(90, "Quick Focus")}>90</button><button className="primary" onClick={() => { focusStart(25, "Quick Focus"); navigate("/focus"); }}>START</button></div></>}
    </article>;

    return <article key={item.id} className={cls}>{editTools}<span className="widget-index">+</span><span className="kicker">{item.type.toUpperCase()}</span><h2>WIDGET</h2><p>추가 위젯 영역</p></article>;
  };

  const addable: HomeWidgetType[] = ["memo","calendar","photo","dday"];
  const ThemeHome=themeHomes[currentThemeId];
  if(ThemeHome)return <Suspense fallback={<div className="theme-home-loading"><i/><span>THEME LOADING</span></div>}><ThemeHome/></Suspense>;
  return <section className={`page home-page ${layoutStore.editMode ? "home-editing" : ""}`}>
    <div className="page-toolbar home-toolbar"><div><span className="kicker">PERSONAL SPACE</span><h3>HOME</h3></div><div className="toolbar-actions">{layoutStore.editMode && addable.map((type) => <button key={type} onClick={() => layoutStore.addWidget(orientation, type)}>+ {type}</button>)}{layoutStore.editMode && <button onClick={() => layoutStore.reset(orientation)}>RESET</button>}<button className={layoutStore.editMode ? "primary" : ""} onClick={() => layoutStore.setEditMode(!layoutStore.editMode)}>{layoutStore.editMode ? "완료" : "EDIT HOME"}</button></div></div>
    <div className="home-world-caption" aria-hidden="true"><span>THEME WORLD</span><i /></div>
    <div className="home-grid">{layout.map(renderWidget)}</div>
  </section>;
}
