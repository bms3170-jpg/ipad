import { NavLink } from "react-router-dom";

type Props = { drawerOpen: boolean; onOpenDrawer: () => void; onCloseDrawer: () => void; onSearch: () => void; onNotifications: () => void };

const items = [
  ["/", "HOME", "⌂"], ["/today", "TODAY", "✓"], ["/calendar", "CALENDAR", "□"], ["/notes", "NOTE", "≡"], ["/music", "MUSIC", "♫"], ["/focus", "FOCUS", "◎"], ["/gallery", "GALLERY", "▧"], ["/themes", "THEME LAB", "✦"],
] as const;

export function Sidebar({ drawerOpen, onOpenDrawer, onCloseDrawer, onSearch, onNotifications }: Props) {
  return <>
    <header className="mobile-topbar">
      <button className="icon-button" onClick={onOpenDrawer} aria-label="메뉴 열기">☰</button>
      <div><b>PERSONAL SYSTEM</b><small>YOUR SPACE</small></div>
      <div className="mobile-actions"><button onClick={onSearch}>⌕</button><button onClick={onNotifications}>◌</button></div>
    </header>
    <aside className={`sidebar ${drawerOpen ? "is-open" : ""}`}>
      <div className="sidebar-brand"><span className="brand-mark">PS</span><div><strong>PERSONAL</strong><small>SYSTEM</small></div></div>
      <div className="sidebar-tools"><button onClick={onSearch}>⌕ SEARCH <kbd>⌘K</kbd></button><button onClick={onNotifications}>◌ ALERTS</button></div>
      <nav className="sidebar-nav">
        {items.map(([to, label, icon]) => <NavLink key={to} to={to} end={to === "/"} onClick={onCloseDrawer} className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""} ${label === "THEME LAB" ? "theme-lab-link" : ""}`}><span>{icon}</span>{label}</NavLink>)}
      </nav>
      <NavLink to="/settings" onClick={onCloseDrawer} className={({ isActive }) => `sidebar-link settings-link ${isActive ? "active" : ""}`}><span>⚙</span>SETTINGS</NavLink>
      <div className="system-card"><span className="status-dot" />LOCAL FIRST · READY</div>
    </aside>
    {drawerOpen && <button className="sidebar-backdrop" onClick={onCloseDrawer} aria-label="메뉴 닫기" />}
  </>;
}
