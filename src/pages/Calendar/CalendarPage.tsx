import { useMemo, useState } from "react";
import { useScheduleStore } from "../../stores/scheduleStore";
import { useSettingsStore } from "../../stores/settingsStore";
import { dateAddDays, localDateKey, minutesFromTime, startOfMonthGrid } from "../../utils/date";
import type { ScheduleCategory } from "../../types";

function sameMonth(a: Date, b: Date) { return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth(); }

export function CalendarPage() {
  const schedules = useScheduleStore((s) => s.schedules);
  const addSchedule = useScheduleStore((s) => s.addSchedule);
  const deleteSchedule = useScheduleStore((s) => s.deleteSchedule);
  const toggleComplete = useScheduleStore((s) => s.toggleComplete);
  const moveByMinutes = useScheduleStore((s) => s.moveByMinutes);
  const resizeByMinutes = useScheduleStore((s) => s.resizeByMinutes);
  const settingsView = useSettingsStore((s) => s.calendarView);
  const setSetting = useSettingsStore((s) => s.setSetting);
  const [selectedDate, setSelectedDate] = useState(localDateKey());
  const [cursor, setCursor] = useState(() => new Date());
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: "", date: localDateKey(), startTime: "09:00", endTime: "10:00", category: "personal" as ScheduleCategory, important: false, memo: "" });

  const monthDays = useMemo(() => {
    const start = startOfMonthGrid(cursor);
    return Array.from({ length: 42 }, (_, i) => dateAddDays(start, i));
  }, [cursor]);

  const weekStart = useMemo(() => {
    const base = new Date(`${selectedDate}T12:00:00`);
    const offset = (base.getDay() + 6) % 7;
    return dateAddDays(base, -offset);
  }, [selectedDate]);
  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => dateAddDays(weekStart, i)), [weekStart]);
  const selectedSchedules = schedules.filter((s) => s.date === selectedDate).sort((a, b) => a.startTime.localeCompare(b.startTime));

  const submitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const created = await addSchedule(form);
    if (created) {
      setSelectedDate(created.date);
      setShowAdd(false);
      setForm((f) => ({ ...f, title: "", memo: "" }));
    }
  };

  return (
    <section className="page calendar-page">
      <div className="page-head compact-head">
        <div><span className="kicker">TIME SYSTEM</span><h1>CALENDAR</h1><p>MONTH로 찾고, WEEK로 배치하고, DAY에서 조작합니다.</p></div>
        <div className="toolbar-actions"><button className="primary" onClick={() => { setForm((f) => ({ ...f, date: selectedDate })); setShowAdd(true); }}>+ SCHEDULE</button></div>
      </div>

      <div className="calendar-toolbar">
        <div className="segmented compact">{(["month", "week", "day"] as const).map((view) => <button key={view} className={settingsView === view ? "active" : ""} onClick={() => setSetting("calendarView", view)}>{view.toUpperCase()}</button>)}</div>
        <div className="calendar-nav"><button onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}>‹</button><b>{new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "long" }).format(cursor)}</b><button onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}>›</button><button onClick={() => { const today = new Date(); setCursor(today); setSelectedDate(localDateKey(today)); }}>TODAY</button></div>
      </div>

      {settingsView === "month" && (
        <div className="calendar-month-layout">
          <div className="month-grid-wrap">
            <div className="weekday-row">{["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((d) => <span key={d}>{d}</span>)}</div>
            <div className="month-grid">{monthDays.map((day) => {
              const key = localDateKey(day); const events = schedules.filter((s) => s.date === key); const selected = key === selectedDate;
              return <button key={key} className={`${sameMonth(day, cursor) ? "" : "outside"} ${selected ? "selected" : ""} ${key === localDateKey() ? "today" : ""}`} onClick={() => setSelectedDate(key)}><b>{day.getDate()}</b><div>{events.slice(0, 3).map((event) => <span key={event.id} className={`cat-${event.category}`}>{event.startTime} {event.title}</span>)}{events.length > 3 && <small>+{events.length - 3}</small>}</div></button>;
            })}</div>
          </div>
          <aside className="date-detail card"><span className="kicker">SELECTED DATE</span><h2>{selectedDate}</h2>{selectedSchedules.length ? selectedSchedules.map((event) => <article key={event.id} className={event.completed ? "done" : ""}><time>{event.startTime}<small>{event.endTime}</small></time><div><b>{event.title}</b><span>{event.category}</span></div><button onClick={() => toggleComplete(event.id)}>{event.completed ? "↺" : "✓"}</button></article>) : <p className="empty">일정 없음</p>}<button className="wide" onClick={() => { setForm((f) => ({ ...f, date: selectedDate })); setShowAdd(true); }}>+ 이 날짜에 일정</button></aside>
        </div>
      )}

      {settingsView === "week" && (
        <div className="week-view">
          <div className="week-columns">{weekDays.map((day) => { const key = localDateKey(day); const events = schedules.filter((s) => s.date === key); return <section key={key} className={key === localDateKey() ? "today-col" : ""}><header><span>{new Intl.DateTimeFormat("en", { weekday: "short" }).format(day)}</span><b>{day.getDate()}</b></header><div className="week-events">{events.map((event) => <button key={event.id} style={{ marginTop: `${Math.max(0, minutesFromTime(event.startTime) - 8 * 60) * 0.45}px`, minHeight: `${Math.max(34, (minutesFromTime(event.endTime) - minutesFromTime(event.startTime)) * 0.45)}px` }} className={`week-event cat-${event.category}`} onClick={() => { setSelectedDate(key); setSetting("calendarView", "day"); }}><time>{event.startTime}</time><b>{event.title}</b></button>)}</div></section>; })}</div>
        </div>
      )}

      {settingsView === "day" && (
        <div className="day-layout">
          <aside className="day-summary card"><span className="kicker">DAY</span><h2>{selectedDate}</h2><div className="metric-row small"><div><b>{selectedSchedules.length}</b><span>EVENTS</span></div><div><b>{selectedSchedules.filter((s) => s.completed).length}</b><span>DONE</span></div></div><button className="primary wide" onClick={() => { setForm((f) => ({ ...f, date: selectedDate })); setShowAdd(true); }}>+ 일정 추가</button></aside>
          <div className="day-timeline-scroll"><div className="day-timeline">{Array.from({ length: 24 }, (_, hour) => <div key={hour} className="hour-line" style={{ top: `${hour * 72}px` }}><time>{String(hour).padStart(2, "0")}:00</time></div>)}{selectedSchedules.map((event) => { const start = minutesFromTime(event.startTime); const end = minutesFromTime(event.endTime); return <article key={event.id} className={`day-event cat-${event.category} ${event.completed ? "done" : ""}`} style={{ top: `${start * 1.2}px`, height: `${Math.max(44, (end - start) * 1.2)}px` }}><div><time>{event.startTime}—{event.endTime}</time><b>{event.title}</b><small>{event.memo}</small></div><div className="event-actions"><button onClick={() => moveByMinutes(event.id, -30)}>−30</button><button onClick={() => moveByMinutes(event.id, 30)}>+30</button><button onClick={() => resizeByMinutes(event.id, 30)}>+DUR</button><button onClick={() => toggleComplete(event.id)}>✓</button><button onClick={() => deleteSchedule(event.id)}>×</button></div></article>; })}<div className="now-line" style={{ top: `${(new Date().getHours() * 60 + new Date().getMinutes()) * 1.2}px` }}><span>NOW</span></div></div></div>
        </div>
      )}

      {showAdd && <div className="overlay"><form className="panel-modal schedule-form" onSubmit={submitAdd}><header><div><span className="kicker">NEW EVENT</span><h2>SCHEDULE</h2></div><button type="button" onClick={() => setShowAdd(false)}>×</button></header><label>제목<input autoFocus value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></label><div className="form-grid"><label>날짜<input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></label><label>종류<select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as ScheduleCategory })}><option value="personal">개인</option><option value="work">업무</option><option value="appointment">약속</option><option value="important">중요</option></select></label><label>시작<input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} /></label><label>종료<input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} /></label></div><label>메모<textarea value={form.memo} onChange={(e) => setForm({ ...form, memo: e.target.value })} /></label><footer><button type="button" onClick={() => setShowAdd(false)}>취소</button><button className="primary">저장</button></footer></form></div>}
    </section>
  );
}
