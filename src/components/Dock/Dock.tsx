import { useLocation, useNavigate } from "react-router-dom";
import { useFocusStore } from "../../stores/focusStore";
import { useQuickAppsStore } from "../../stores/quickAppsStore";
import { useSettingsStore } from "../../stores/settingsStore";
import { useTaskStore } from "../../stores/taskStore";
import { localDateKey } from "../../utils/date";

export function Dock() {
  const location = useLocation(); const navigate = useNavigate(); const settings = useSettingsStore(); const apps = useQuickAppsStore((s) => s.apps).filter((app) => app.enabled); const active = useFocusStore((s) => s.active); const tasks = useTaskStore((s) => s.tasks);
  if (settings.dockMode === "home" && location.pathname !== "/") return null;
  const unfinished = tasks.filter((t) => t.date === localDateKey() && !t.completed).length;
  const open = (app: (typeof apps)[number]) => { if (app.type === "internal") navigate(app.target); else if (app.type === "web") window.open(app.target, "_blank", "noopener,noreferrer"); else { window.location.href = app.target; } };
  return <nav className={`dock dock-${settings.dockMode}`} aria-label="Quick Apps">{apps.map((app) => { const isActive = app.type === "internal" && location.pathname === app.target; return <button key={app.id} className={`dock-item ${isActive ? "active" : ""}`} onClick={() => open(app)} title={app.name}><span className="dock-icon">{app.icon}{settings.dockBadges && app.id === "browser" && unfinished > 0 ? <em>{unfinished}</em> : null}{settings.dockBadges && app.id === "focus" && active ? <i /> : null}</span><span className="dock-label">{app.name}</span></button>; })}</nav>;
}
