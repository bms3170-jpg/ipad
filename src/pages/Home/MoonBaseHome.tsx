import { useEffect,useMemo,useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFocusStore } from "../../stores/focusStore";
import { useMusicStore } from "../../stores/musicStore";
import { useScheduleStore } from "../../stores/scheduleStore";
import { useTaskStore } from "../../stores/taskStore";
import { useWeatherStore } from "../../stores/weatherStore";
import { localDateKey } from "../../utils/date";

const WEEK=["일","월","화","수","목","금","토"];
export function MoonBaseHome(){
 const nav=useNavigate();const [now,setNow]=useState(new Date());const tasks=useTaskStore(s=>s.tasks);const toggle=useTaskStore(s=>s.toggleTask);const schedules=useScheduleStore(s=>s.schedules);const weather=useWeatherStore(s=>s.snapshot);const load=useWeatherStore(s=>s.load);const music=useMusicStore();const focus=useFocusStore();
 useEffect(()=>{const id=setInterval(()=>setNow(new Date()),1000);return()=>clearInterval(id)},[]);useEffect(()=>{load()},[load]);const key=localDateKey(now);const list=useMemo(()=>tasks.filter(x=>x.date===key&&!x.deletedAt).slice(0,7),[tasks,key]);const done=list.filter(x=>x.completed).length;const todayEvents=schedules.filter(x=>x.date===key&&!x.deletedAt).slice(0,4);const first=new Date(now.getFullYear(),now.getMonth(),1).getDay();const days=new Date(now.getFullYear(),now.getMonth()+1,0).getDate();
 return <section className="moon-home">
  <div className="moon-window"><i className="moon-orb"/><div className="moon-ground"/><div className="moon-chair"/><div className="moon-table"/></div>
  <article className="moon-clock"><small>GOOD<br/>FOCUS<br/>GOOD<br/>LIFE</small><strong>{now.toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"})}</strong><b>{now.toLocaleDateString("ko-KR",{month:"long",day:"numeric",weekday:"long"})}</b><p>A NEW DAY<br/>A NEW POSSIBILITY.</p></article>
  <article className="moon-panel moon-weather" onClick={()=>load(true)}><div className="moon-small-orb"/><section><span>SEOUL</span><strong>{weather?.temperature??21}°</strong><b>{weather?.description??"맑음"}</b><small>체감 {weather?.apparentTemperature??20}°　미세먼지 <em>좋음</em></small></section><ul>{[["12시","☀","22°"],["15시","☀","24°"],["18시","☾","23°"],["21시","☾","21°"]].map(x=><li key={x[0]}><span>{x[0]}</span><i>{x[1]}</i><b>{x[2]}</b></li>)}</ul></article>
  <aside className="moon-quote">“<br/><p>오늘도,<br/>좋은 하루가 될 거야.</p>”<hr/><b>BETTER ME<br/>TOMORROW</b></aside>
  <nav className="moon-nav">{[["⌂","Home","/"],["▣","Plan","/calendar"],["◎","Focus","/focus"],["▤","Note","/notes"],["♫","Music","/music"],["▧","Gallery","/gallery"],["⚙","Settings","/settings"]].map(([i,n,p])=><button key={n} className={n==="Home"?"active":""} onClick={()=>nav(p)}><b>{i}</b>{n}</button>)}</nav>
  <article className="moon-panel moon-music"><div className="moon-record"><i/></div><section><b>{music.title||"Midnight Drive"}</b><span>{music.artist||"Chill Vibes"}</span><em>▂▃▅▆▃▇▅▃▂</em></section><footer><button>◀</button><button onClick={music.togglePlay}>{music.playing?"Ⅱ":"▶"}</button><button onClick={()=>nav("/music")}>▶</button><button>♡</button></footer></article>
  <article className="moon-panel moon-tasks"><header><b>오늘 할 일</b><span>{done}/{list.length||0}</span><button onClick={()=>nav("/today")}>＋</button></header><div>{list.map((x,i)=><button key={x.id} className={x.completed?"done":""} onClick={()=>toggle(x.id)}><i>{x.completed?"✓":""}</i><span>{x.title}</span><time>{x.time||`${10+i*2}:00`}</time></button>)}</div></article>
  <article className="moon-panel moon-calendar" onClick={()=>nav("/calendar")}><header>{now.getFullYear()}년 {now.getMonth()+1}월</header><div className="moon-week">{WEEK.map(x=><b key={x}>{x}</b>)}</div><div className="moon-month">{Array.from({length:first}).map((_,i)=><i key={i}/>)}{Array.from({length:days},(_,i)=>i+1).map(d=><span key={d} className={d===now.getDate()?"today":""}>{d}</span>)}</div><aside><b>D-DAY</b>{todayEvents.length?todayEvents.map((x,i)=><p key={x.id}><span>{["✈","♟","♥","▤"][i]}</span>{x.title}<strong>D-{12+i*26}</strong></p>):<><p>✈　여행 <strong>D-12</strong></p><p>♥　우리 기념일 <strong>D-72</strong></p><p>▤　자격증 시험 <strong>D-105</strong></p></>}</aside></article>
  <aside className="moon-mantra">DISCIPLINE<br/>CREATES<br/>FREEDOM.</aside>
  <aside className="moon-side-copy">STAY<br/>FOCUSED<br/>STAY<br/>HAPPY</aside>
  <footer className="moon-dock">{[["◉","/"],["🌈","/gallery"],["▱","/notes"],["8","/calendar"],["♫","/music"],["◉","/"],["▰","/gallery"],["⚙","/settings"],["A","/settings"]].map(([i,p],n)=><button key={n} onClick={()=>nav(p)}>{i}</button>)}</footer>
  <button className="moon-focus-shortcut" onClick={()=>focus.active?nav("/focus"):focus.start(25,"Moon Focus")}>{focus.active?"FOCUS ACTIVE":"START FOCUS"}</button>
  <small className="moon-bottom-left">SMALL<br/>STEPS<br/>BIG<br/>CHANGES</small><small className="moon-bottom-right">LIVE<br/>A LIFE<br/>YOU LOVE</small>
 </section>
}
