import { useEffect, useMemo, useState } from "react";
import { useDailyStore } from "../../stores/dailyStore";
import { useFocusStore } from "../../stores/focusStore";
import { useGalleryStore } from "../../stores/galleryStore";
import { useMusicStore } from "../../stores/musicStore";
import { useScheduleStore } from "../../stores/scheduleStore";
import { useTaskStore } from "../../stores/taskStore";
import { dateAddDays, formatDuration, localDateKey } from "../../utils/date";

const tabs = ["OVERVIEW", "TIMELINE", "TASK BOARD", "HISTORY"] as const;
type Tab = (typeof tabs)[number];

export function TodayPage() {
  const [tab, setTab] = useState<Tab>("OVERVIEW");
  const [memo, setMemo] = useState("");
  const [mood, setMood] = useState("🙂");
  const [newTask, setNewTask] = useState("");

  const tasks = useTaskStore((s) => s.tasks);
  const addTask = useTaskStore((s) => s.addTask);
  const toggleTask = useTaskStore((s) => s.toggleTask);
  const moveToDate = useTaskStore((s) => s.moveToDate);
  const schedules = useScheduleStore((s) => s.schedules);
  const toggleSchedule = useScheduleStore((s) => s.toggleComplete);
  const focusRecords = useFocusStore((s) => s.records);
  const hydrateFocus = useFocusStore((s) => s.hydrateRecords);
  const photos = useGalleryStore((s) => s.photos);
  const hydrateGallery = useGalleryStore((s) => s.hydrate);
  const musicTitle = useMusicStore((s) => s.title);
  const musicArtist = useMusicStore((s) => s.artist);
  const dailyRecords = useDailyStore((s) => s.records);
  const hydrateDaily = useDailyStore((s) => s.hydrate);
  const saveDaily = useDailyStore((s) => s.save);

  const date = localDateKey();

  useEffect(() => {
    hydrateFocus();
    hydrateDaily();
    hydrateGallery();
  }, [hydrateFocus, hydrateDaily, hydrateGallery]);

  const todayTasks = tasks.filter((task) => task.date === date);
  const todaySchedules = schedules.filter((item) => item.date === date);
  const completedTasks = todayTasks.filter((task) => task.completed).length;
  const todayFocus = focusRecords.filter((record) => localDateKey(new Date(record.startedAt)) === date);
  const focusMinutes = todayFocus.reduce((sum, record) => sum + record.durationMinutes, 0);
  const todayPhoto = photos.find((photo) => photo.todayMemoryDate === date);
  const completion = todayTasks.length ? Math.round((completedTasks / todayTasks.length) * 100) : 0;

  const sortedTimeline = useMemo(
    () => [
      ...todaySchedules.map((s) => ({ id: s.id, time: s.startTime, title: s.title, kind: "SCHEDULE", completed: s.completed, onToggle: () => toggleSchedule(s.id) })),
      ...todayTasks.filter((t) => t.time).map((t) => ({ id: t.id, time: t.time!, title: t.title, kind: "TASK", completed: t.completed, onToggle: () => toggleTask(t.id) })),
    ].sort((a, b) => a.time.localeCompare(b.time)),
    [todaySchedules, todayTasks, toggleSchedule, toggleTask],
  );

  const closeDay = async () => {
    await saveDaily({
      date,
      taskTotal: todayTasks.length,
      taskCompleted: completedTasks,
      scheduleTotal: todaySchedules.length,
      scheduleCompleted: todaySchedules.filter((s) => s.completed).length,
      focusMinutes,
      photoId: todayPhoto?.id,
      musicTitle: `${musicTitle} · ${musicArtist}`,
      memo,
      mood,
      closedAt: new Date().toISOString(),
    });
    setTab("HISTORY");
  };

  const tomorrow = localDateKey(dateAddDays(new Date(), 1));

  return (
    <section className="page today-page">
      <div className="page-head">
        <div>
          <span className="kicker">{new Intl.DateTimeFormat("ko-KR", { dateStyle: "full" }).format(new Date())}</span>
          <h1>TODAY</h1>
          <p>오늘이라는 하루를 조종하는 화면.</p>
        </div>
        <div className="today-score"><strong>{completion}%</strong><span>{completedTasks}/{todayTasks.length} TASKS · {formatDuration(focusMinutes)} FOCUS</span></div>
      </div>

      <div className="segmented">{tabs.map((value) => <button key={value} className={tab === value ? "active" : ""} onClick={() => setTab(value)}>{value}</button>)}</div>

      <div className="today-content">
        {tab === "OVERVIEW" && (
          <div className="dashboard-grid">
            <article className="card span-2">
              <span className="kicker">DAY FLOW</span>
              <div className="metric-row">
                <div><b>{completedTasks}</b><span>DONE</span></div>
                <div><b>{todayTasks.length - completedTasks}</b><span>LEFT</span></div>
                <div><b>{formatDuration(focusMinutes)}</b><span>FOCUS</span></div>
                <div><b>{todaySchedules.length}</b><span>SCHEDULES</span></div>
              </div>
              <div className="progress-line"><i style={{ width: `${completion}%` }} /></div>
            </article>

            <article className="card">
              <span className="kicker">PRIORITY</span>
              {todayTasks.filter((t) => !t.completed).slice(0, 4).map((task) => (
                <button key={task.id} className="compact-row" onClick={() => toggleTask(task.id)}>
                  <span>{task.completed ? "✓" : "○"}</span><b>{task.title}</b>{task.time && <small>{task.time}</small>}
                </button>
              ))}
            </article>

            <article className="card">
              <span className="kicker">TODAY MEMO</span>
              <textarea value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="오늘의 메모를 남겨보세요." />
              <div className="mood-row">{["😵", "😐", "🙂", "😊", "🔥"].map((value) => <button key={value} className={mood === value ? "active" : ""} onClick={() => setMood(value)}>{value}</button>)}</div>
            </article>

            <article className="card span-2 day-complete-card">
              <div><span className="kicker">DAY COMPLETE</span><h2>오늘을 기록으로 남기기</h2><p>Task, 일정, Focus, 사진, 음악을 하나의 Daily Record로 묶습니다.</p></div>
              <button className="primary" onClick={closeDay}>오늘 마무리</button>
            </article>
          </div>
        )}

        {tab === "TIMELINE" && (
          <div className="timeline-list">
            {sortedTimeline.length ? sortedTimeline.map((item) => (
              <article key={`${item.kind}-${item.id}`} className={item.completed ? "done" : ""}>
                <time>{item.time}</time><i /><button onClick={item.onToggle}><span>{item.kind}</span><b>{item.title}</b></button>
              </article>
            )) : <p className="empty">시간이 지정된 일정이나 할 일이 없습니다.</p>}
          </div>
        )}

        {tab === "TASK BOARD" && (
          <div className="task-board">
            <form onSubmit={async (e) => { e.preventDefault(); if (!newTask.trim()) return; await addTask({ title: newTask }); setNewTask(""); }}>
              <input value={newTask} onChange={(e) => setNewTask(e.target.value)} placeholder="오늘 할 일 추가" />
              <button className="primary">ADD</button>
            </form>
            <div className="board-columns">
              <section><h3>MUST / TODAY</h3>{todayTasks.filter((t) => !t.completed).map((task) => <article key={task.id}><button onClick={() => toggleTask(task.id)}>○</button><div><b>{task.title}</b><span>{task.time ?? "시간 없음"}</span></div><button onClick={() => moveToDate(task.id, tomorrow)}>→ 내일</button></article>)}</section>
              <section><h3>DONE</h3>{todayTasks.filter((t) => t.completed).map((task) => <article key={task.id}><button onClick={() => toggleTask(task.id)}>✓</button><div><b>{task.title}</b><span>{task.completedAt ? new Date(task.completedAt).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }) : "완료"}</span></div></article>)}</section>
            </div>
          </div>
        )}

        {tab === "HISTORY" && (
          <div className="history-layout">
            <aside>{dailyRecords.map((record) => <button key={record.date}><b>{record.date}</b><span>{record.taskTotal ? Math.round(record.taskCompleted / record.taskTotal * 100) : 0}% · {record.mood ?? "—"}</span></button>)}{dailyRecords.length === 0 && <p className="empty">아직 마무리한 날이 없습니다.</p>}</aside>
            <main>{dailyRecords[0] ? <><span className="kicker">LATEST RECORD</span><h2>{dailyRecords[0].date}</h2><div className="metric-row"><div><b>{dailyRecords[0].taskCompleted}/{dailyRecords[0].taskTotal}</b><span>TASKS</span></div><div><b>{formatDuration(dailyRecords[0].focusMinutes)}</b><span>FOCUS</span></div><div><b>{dailyRecords[0].scheduleCompleted}/{dailyRecords[0].scheduleTotal}</b><span>EVENTS</span></div><div><b>{dailyRecords[0].mood ?? "—"}</b><span>MOOD</span></div></div><p className="history-memo">{dailyRecords[0].memo || "메모 없음"}</p><small>{dailyRecords[0].musicTitle}</small></> : <p className="empty">DAY COMPLETE를 누르면 여기에 기록이 쌓입니다.</p>}</main>
          </div>
        )}
      </div>
    </section>
  );
}
