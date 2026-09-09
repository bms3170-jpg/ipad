import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFocusStore } from "../../stores/focusStore";
import { useMusicStore } from "../../stores/musicStore";
import { useScheduleStore } from "../../stores/scheduleStore";
import { useTaskStore } from "../../stores/taskStore";
import { useWeatherStore } from "../../stores/weatherStore";
import { localDateKey } from "../../utils/date";

const nav=[["/","대시보드"],["/today","작업"],["/calendar","일정"],["/music","음악"],["/focus","타이머"],["/gallery","앱"],["/settings","시스템"]] as const;

export function RetroTerminalHome(){
  const navigate=useNavigate(); const [now,setNow]=useState(new Date()); const [quick,setQuick]=useState("");
  const tasks=useTaskStore((s)=>s.tasks); const addTask=useTaskStore((s)=>s.addTask); const toggleTask=useTaskStore((s)=>s.toggleTask);
  const schedules=useScheduleStore((s)=>s.schedules); const weather=useWeatherStore((s)=>s.snapshot); const loadWeather=useWeatherStore((s)=>s.load);
  const music=useMusicStore(); const focus=useFocusStore();
  useEffect(()=>{const id=window.setInterval(()=>setNow(new Date()),1000);return()=>clearInterval(id)},[]); useEffect(()=>{loadWeather()},[loadWeather]);
  const key=localDateKey(now); const todayTasks=useMemo(()=>tasks.filter((x)=>x.date===key&&!x.deletedAt).slice(0,8),[tasks,key]); const done=todayTasks.filter((x)=>x.completed).length;
  const events=schedules.filter((x)=>x.date===key&&!x.deletedAt).sort((a,b)=>a.startTime.localeCompare(b.startTime)).slice(0,8);
  const clock=now.toLocaleTimeString("ko-KR",{hour:"2-digit",minute:"2-digit",hour12:false}); const date=now.toLocaleDateString("ko-KR",{year:"numeric",month:"2-digit",day:"2-digit",weekday:"short"});
  const submit=async(e:React.FormEvent)=>{e.preventDefault();if(!quick.trim())return;await addTask({title:quick});setQuick("")};
  return <section className="terminal-home">
    <header className="terminal-head"><div><h1>THEME 02 · RETRO TERMINAL</h1><p>PERSONAL COMMAND CENTER v1.0.0<br/>&gt; GOOD IDEAS STILL WORK TODAY.</p></div><div className="terminal-motto">OLD TOOLS. A CALMER MIND. <i/></div><pre>SYSTEM  : ONLINE{"\n"}NETWORK : ONLINE{"\n"}STORAGE : OK{"\n"}ALL CORE: STABLE</pre></header>
    <nav className="terminal-nav">{nav.map(([to,label],i)=><button key={label} className={i===0?"active":""} onClick={()=>navigate(to)}>[ {String(i+1).padStart(2,"0")} {label} ]</button>)}</nav>
    <article className="term-panel term-time"><header>[ TIME / DATE ] <span>[ LIVE ] ■</span></header><strong>{clock}<i>_</i></strong><b>{date}</b><p>"오늘도,<br/>　좋은 하루를 만들고 있어요."</p></article>
    <article className="term-panel term-weather"><header>[ WEATHER ] <span>[ SEOUL ]</span></header><div><i>☁</i><strong>{weather?.temperature??22}°C</strong><p>서울특별시<br/>{weather?.description??"흐림"}</p><pre>H: {weather?.high??26}°C{"\n"}L: {weather?.low??18}°C{"\n"}습도: 68%{"\n"}바람: 3 m/s</pre></div><footer>&gt; 내일은 더 맑은 하루가 될 거예요.</footer></article>
    <article className="term-panel term-status"><header>[ SYSTEM STATUS ]</header><pre>BATTERY　[ ██████████　 ] 78%{"\n"}WI-FI　　[ ███████████ ] ONLINE{"\n"}BLUETOOTH [ █████　　　 ] ON{"\n"}STORAGE　[ ███████　　 ] 62%</pre><footer>&gt; EVERYTHING LOOKS GOOD.</footer></article>
    <article className="term-panel term-tasks"><header>[ TASK LIST ] <span>[ {done} / {todayTasks.length||0} ]</span></header><div>{todayTasks.length?todayTasks.map((x)=><button key={x.id} className={x.completed?"done":""} onClick={()=>toggleTask(x.id)}><i>{x.completed?"✓":""}</i>{x.title}</button>):<p>&gt; 오늘의 첫 작업을 입력하세요.</p>}</div><form onSubmit={submit}><span>&gt;</span><input value={quick} onChange={(e)=>setQuick(e.target.value)} placeholder="새 할 일을 입력하세요..."/><button>↵</button></form></article>
    <article className="term-panel term-schedule"><header>[ SCHEDULE : TODAY ] <span>[ {key.replaceAll("-",". ")} ]</span></header><div>{events.length?events.map((x)=><p key={x.id}><time>{x.startTime}</time><i>|</i><span>{x.title}</span></p>):<p><time>--:--</time><i>|</i><span>등록된 일정 없음</span></p>}</div><footer>&gt; PLAN TODAY. A BETTER TOMORROW.</footer></article>
    <article className="term-panel term-music"><header>[ MUSIC PLAYER ] <span>[ {music.connected?"ONLINE":"LOCAL"} ]</span></header><div className="term-track"><div className="term-art">♫<i/></div><section><b>{music.title}</b><span>{music.artist}</span><em>Another Day</em></section></div><div className="term-progress"><i style={{width:`${Math.max(18,music.progress)}%`}}/></div><div className="term-controls"><button>◀</button><button className="amber" onClick={music.togglePlay}>{music.playing?"Ⅱ":"▶"}</button><button onClick={()=>navigate("/music")}>▶</button></div><footer>&gt; MUSIC IS A SOFT RESET.</footer></article>
    <article className="term-panel term-focus"><header>[ FOCUS TIMER ] <span>[ FOCUS ]</span></header><div><div className="term-ring"><strong>{focus.active?`${Math.floor(focus.remainingSeconds()/60)}:${String(focus.remainingSeconds()%60).padStart(2,"0")}`:"25:00"}</strong><span>FOCUS</span></div><section><button className="amber" onClick={()=>focus.start(25,"Pomodoro")}>[P] 포모도로　25분</button><button onClick={()=>focus.start(5,"Short Break")}>[S] 짧은 휴식　5분</button><button onClick={()=>focus.start(15,"Long Break")}>[L] 긴 휴식　15분</button><button className="start" onClick={()=>{focus.start(25,"Focus");navigate("/focus")}}>[ ▶ 시작하기 ]</button></section></div><footer>&gt; DEEP WORK. BRIGHTER YOU.</footer></article>
    <article className="term-panel term-apps"><header>[ QUICK APPS ]</header><div>{[["▤","노트","/notes"],["31","캘린더","/calendar"],["✉","메일","#"],["▣","메시지","#"],["▧","사진","/gallery"],["▶","YouTube","#"],["N","Notion","#"],["◉","Music","/music"]].map(([icon,label,to])=><button key={label} onClick={()=>to!=="#"&&navigate(to)}><b>{icon}</b><span>{label}</span></button>)}</div></article>
    <article className="term-panel term-log"><header>[ SYSTEM LOG ] <span>[ CLEAR ]</span></header><pre>{clock}　Focus session ready.{"\n"}20:37　Wi-Fi reconnected.{"\n"}20:21　Task updated: {done} items done.{"\n"}19:03　Good evening. ☺</pre><footer>&gt; READY. _</footer></article>
    <footer className="terminal-command">C:\USER\TODAY&gt; KEEP GOING.<span>READY. ■</span></footer>
  </section>
}
