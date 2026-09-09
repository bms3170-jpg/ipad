import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFocusStore } from "../../stores/focusStore";
import { useMusicStore } from "../../stores/musicStore";
import { useScheduleStore } from "../../stores/scheduleStore";
import { useTaskStore } from "../../stores/taskStore";
import { useWeatherStore } from "../../stores/weatherStore";
import { localDateKey } from "../../utils/date";

export function Y2KHome() {
  const navigate = useNavigate();
  const [now, setNow] = useState(new Date());
  const tasks = useTaskStore((s) => s.tasks);
  const toggleTask = useTaskStore((s) => s.toggleTask);
  const schedules = useScheduleStore((s) => s.schedules);
  const weather = useWeatherStore((s) => s.snapshot);
  const loadWeather = useWeatherStore((s) => s.load);
  const music = useMusicStore();
  const focus = useFocusStore();

  useEffect(() => { const id = window.setInterval(() => setNow(new Date()), 1000); return () => window.clearInterval(id); }, []);
  useEffect(() => { loadWeather(); }, [loadWeather]);
  const key = localDateKey(now);
  const list = useMemo(() => tasks.filter((x) => x.date === key && !x.deletedAt).slice(0, 5), [tasks, key]);
  const events = schedules.filter((x) => x.date === key && !x.deletedAt).sort((a,b) => a.startTime.localeCompare(b.startTime)).slice(0, 6);
  const clock = now.toLocaleTimeString("en-GB", {hour:"2-digit",minute:"2-digit"});

  return <section className="y2k-home" aria-label="Y2K Chrome Home">
    <article className="y2k-blob y2k-clock"><small>IT’S A<br/>GOOD DAY ☺</small><strong>{clock}</strong><footer>{now.toLocaleDateString("ko-KR",{year:"numeric",month:"long",day:"numeric",weekday:"short"})}<b>오늘도 빛나는 하루야</b></footer><i>✦</i></article>
    <aside className="y2k-planet"><span>MORE<br/>FUN<br/>MORE<br/>YOU</span><b>☺</b><i/></aside>
    <article className="y2k-blob y2k-weather" onClick={()=>loadWeather(true)}><div><i>🌤️</i><section><b>{weather?.locationLabel || "서울특별시"}</b><span>{weather?.description || "맑음"}</span><strong>{weather?.temperature ?? 18}°C</strong></section></div><ul><li>오늘　☀　{weather?.high ?? 22}°　{weather?.low ?? 11}°</li><li>내일　☁　23°　13°</li><li>토　　☁　20°　12°</li><li>일　　☂　19°　11°</li></ul><small>예쁜 하루가<br/>기다리고 있어! ♡</small></article>
    <article className="y2k-blob y2k-tasks"><header>♡　오늘 할 일 <button onClick={()=>navigate("/today")}>＋</button></header><div>{list.length ? list.map((task)=><button key={task.id} className={task.completed?"done":""} onClick={()=>toggleTask(task.id)}><i>{task.completed?"✓":""}</i>{task.title}</button>) : <p>오늘의 첫 할 일을 추가해봐요 ✨</p>}</div></article>
    <aside className="y2k-mini">SMALL<br/>STEPS<br/>BIG<br/>CHANGES<br/><b>☆</b></aside>
    <div className="y2k-mascot"><div className="helmet"><i/><b>☺</b></div><div className="body">GOOD THINGS AHEAD ☺</div><span>a<br/>brighter<br/>version<br/>of me ♡</span></div>
    <article className="y2k-blob y2k-music"><div className="y2k-cd">BETTER<br/>DAYS ♡<i/></div><section><b>{music.title || "Better Days"}</b><span>{music.artist || "NewJeans"}</span><em><i style={{width:`${Math.max(24,music.progress)}%`}}/></em><small>0:52　　　　　　　　 3:24</small><div><button>◀</button><button onClick={music.togglePlay}>{music.playing?"Ⅱ":"▶"}</button><button onClick={()=>navigate("/music")}>▶</button><button>♥</button></div></section></article>
    <article className="y2k-blob y2k-schedule"><header>▣　오늘의 일정 <b>☆</b></header><div>{events.length?events.map((item)=><p key={item.id}><time>▸ {item.startTime}</time><span>{item.title}</span></p>):<p><time>▸ --:--</time><span>등록된 일정이 없어요</span></p>}</div></article>
    <article className="y2k-blob y2k-focus"><header>◎　집중 타이머</header><nav><button>집중</button><button>짧은 휴식</button><button>긴 휴식</button></nav><strong>{focus.active?`${Math.floor(focus.remainingSeconds()/60)}:${String(focus.remainingSeconds()%60).padStart(2,"0")}`:"25:00"}</strong><button className="start" onClick={()=>focus.start(25,"Y2K Focus")}>시작하기</button><p>지금, 더 좋은 내가 되고 있어요. ♡</p></article>
    <article className="y2k-blob y2k-device"><header>ϟ　기기 상태</header><div className="y2k-battery"><i/><b>78%</b></div><p>충전 중이 아니에요<br/>오늘도 충분히 잘 하고 있어요!</p><span>☺</span></article>
    <article className="y2k-blob y2k-apps"><header>★　빠른 실행</header><div>{[["N","노션","/notes"],["31","캘린더","/calendar"],["🌈","사진","/gallery"],["▶","유튜브","/music"],["●","스포티파이","/music"],["TALK","카카오톡","/"],["◎","인스타그램","/gallery"],["⚙","설정","/settings"]].map(([icon,label,path])=><button key={label} onClick={()=>navigate(path)}><b>{icon}</b><span>{label}</span></button>)}</div></article>
    <aside className="y2k-cube">DREAM<br/>PLAN<br/>DO<br/>REPEAT</aside>
    <footer className="y2k-dock">{[["☆","/today"],["▰","/calendar"],["♄","/focus"],["♡","/music"],["✉","/notes"],["🦋","/gallery"],["◉","/gallery"],["◎","/settings"]].map(([icon,path],i)=><button key={i} onClick={()=>navigate(path)}>{icon}</button>)}</footer>
    <span className="y2k-slogan">2000s<br/>VIBES<br/>FOREVER　♡</span><span className="y2k-mood">Y2K<br/>MOOD<br/>☆</span>
  </section>;
}
