import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNoteStore } from "../stores/noteStore";
import { useScheduleStore } from "../stores/scheduleStore";
import { useTaskStore } from "../stores/taskStore";
import { THEMES } from "../themes/themeDefinitions";
import { useThemeStore } from "../stores/themeStore";
import { useFocusStore } from "../stores/focusStore";

type Props = { open: boolean; onClose: () => void };
export function SearchPalette({ open, onClose }: Props) {
  const [query, setQuery] = useState(""); const navigate = useNavigate();
  const tasks = useTaskStore((s) => s.tasks); const notes = useNoteStore((s) => s.notes); const schedules = useScheduleStore((s) => s.schedules); const setTheme = useThemeStore((s) => s.setTheme); const startFocus = useFocusStore((s) => s.start);
  const results = useMemo(() => {
    const q = query.trim().toLowerCase(); if (!q) return [];
    return [
      ...tasks.filter((v) => v.title.toLowerCase().includes(q)).slice(0, 4).map((v) => ({ type: "TASK", title: v.title, action: () => navigate("/today") })),
      ...schedules.filter((v) => v.title.toLowerCase().includes(q)).slice(0, 4).map((v) => ({ type: "SCHEDULE", title: `${v.date} ${v.startTime} · ${v.title}`, action: () => navigate("/calendar") })),
      ...notes.filter((v) => `${v.title} ${v.content} ${v.tags.join(" ")}`.toLowerCase().includes(q)).slice(0, 4).map((v) => ({ type: "NOTE", title: v.title, action: () => navigate(`/notes?id=${encodeURIComponent(v.id)}`) })),
      ...THEMES.filter((v) => `${v.name} ${v.subtitle}`.toLowerCase().includes(q)).slice(0, 4).map((v) => ({ type: "THEME", title: v.name, action: () => { setTheme(v.id); navigate("/themes"); } })),
    ];
  }, [query, tasks, schedules, notes, navigate, setTheme]);
  if (!open) return null;
  const executeCommand = () => {
    const value = query.trim().toLowerCase();
    if (value.startsWith("> focus")) { const n = Number(value.match(/\d+/)?.[0] ?? 25); startFocus(n, "Command Focus"); navigate("/focus"); onClose(); return; }
    if (value.startsWith("> theme")) { const term = value.replace("> theme", "").trim(); const found = THEMES.find((theme) => theme.name.toLowerCase().includes(term) || theme.id.includes(term)); if (found) setTheme(found.id); navigate("/themes"); onClose(); }
  };
  return <div className="overlay search-overlay" onPointerDown={(e) => { if (e.currentTarget === e.target) onClose(); }}><section className="search-palette panel-modal"><header><span className="search-symbol">⌕</span><input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => { if (e.key === "Escape") onClose(); if (e.key === "Enter" && query.startsWith(">")) executeCommand(); }} placeholder="전체 검색 또는 > 명령어" /><kbd>ESC</kbd></header>{!query ? <div className="quick-actions"><button onClick={() => { navigate("/today"); onClose(); }}>+ TASK</button><button onClick={() => { navigate("/calendar"); onClose(); }}>+ SCHEDULE</button><button onClick={() => { navigate("/notes"); onClose(); }}>+ NOTE</button><button onClick={() => { startFocus(25, "Quick Focus"); navigate("/focus"); onClose(); }}>◎ FOCUS 25</button><button onClick={() => { navigate("/themes"); onClose(); }}>✦ THEME LAB</button></div> : <div className="search-results">{query.startsWith(">") ? <button className="search-result" onClick={executeCommand}><span>COMMAND</span><b>{query}</b></button> : results.map((result, i) => <button key={`${result.type}-${i}`} className="search-result" onClick={() => { result.action(); onClose(); }}><span>{result.type}</span><b>{result.title}</b></button>)}{!query.startsWith(">") && results.length === 0 && <p className="empty">검색 결과가 없습니다.</p>}</div>}</section></div>;
}
