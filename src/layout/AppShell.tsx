import { useEffect, useMemo, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Dock } from "../components/Dock/Dock";
import { NotificationPanel } from "../components/NotificationPanel";
import { QuickNotePanel } from "../components/QuickNotePanel";
import { SearchPalette } from "../components/SearchPalette";
import { Sidebar } from "../components/Sidebar/Sidebar";
import { ThemeAtmosphere } from "../components/ThemeAtmosphere";
import { useDailyStore } from "../stores/dailyStore";
import { useFocusStore } from "../stores/focusStore";
import { useGalleryStore } from "../stores/galleryStore";
import { useNoteStore } from "../stores/noteStore";
import { useScheduleStore } from "../stores/scheduleStore";
import { useSettingsStore } from "../stores/settingsStore";
import { useTaskStore } from "../stores/taskStore";
import { useThemeStore } from "../stores/themeStore";
import { getTheme, THEMES } from "../themes/themeDefinitions";
import { getThemeBackground } from "../themes/themeBackgrounds";

export function AppShell() {
  const [drawerOpen, setDrawerOpen] = useState(false); const [quickOpen, setQuickOpen] = useState(false); const [searchOpen, setSearchOpen] = useState(false); const [notificationsOpen, setNotificationsOpen] = useState(false); const [wallpaperUrl, setWallpaperUrl] = useState(""); const [updateAvailable,setUpdateAvailable] = useState(false);
  const location = useLocation();
  const currentThemeId = useThemeStore((s) => s.currentThemeId); const setTheme = useThemeStore((s) => s.setTheme); const autoMode = useThemeStore((s) => s.autoMode);
  const theme = getTheme(currentThemeId); const settings = useSettingsStore();
  const photos = useGalleryStore((s) => s.photos); const hydrateGallery = useGalleryStore((s) => s.hydrate);
  const activeFocus = useFocusStore((s) => s.active);

  useEffect(() => { useTaskStore.getState().hydrate(); useScheduleStore.getState().hydrate(); useNoteStore.getState().hydrate(); useFocusStore.getState().hydrateRecords(); useDailyStore.getState().hydrate(); hydrateGallery(); }, [hydrateGallery]);
  useEffect(() => { const onUpdate = () => setUpdateAvailable(true); window.addEventListener("personal-system:update-available", onUpdate); return () => window.removeEventListener("personal-system:update-available", onUpdate); }, []);
  useEffect(() => { const key = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setSearchOpen(true); } if (e.key === "Escape") { setSearchOpen(false); setQuickOpen(false); setNotificationsOpen(false); setDrawerOpen(false); } }; window.addEventListener("keydown", key); return () => window.removeEventListener("keydown", key); }, []);
  useEffect(() => {
    if (autoMode === "off") return;
    const apply = () => {
      const now = new Date();
      if (autoMode === "time") { const hour = now.getHours(); setTheme(hour < 6 ? "moon-base" : hour < 12 ? "isometric-island" : hour < 18 ? "minimal-gallery" : hour < 22 ? "art-deco" : "gothic"); }
      if (autoMode === "weekday") { const ids = ["fantasy","blueprint","scientific-lab","newspaper","racing","scrapbook","minimal-gallery"]; setTheme(ids[now.getDay()]); }
      if (autoMode === "random") { const dateKey = now.toISOString().slice(0,10); const stored = localStorage.getItem("personal-system:auto-random-date"); if (stored !== dateKey) { setTheme(THEMES[Math.floor(Math.random()*THEMES.length)].id); localStorage.setItem("personal-system:auto-random-date", dateKey); } }
    };
    apply(); const id = window.setInterval(apply, 60_000); return () => clearInterval(id);
  }, [autoMode, setTheme]);
  useEffect(() => {
    const wallpaper = photos.find((photo) => photo.isWallpaper && !photo.deletedAt);
    if (!wallpaper) { setWallpaperUrl(""); return; }
    const url = URL.createObjectURL(wallpaper.blob); setWallpaperUrl(url); return () => URL.revokeObjectURL(url);
  }, [photos]);

  const style = useMemo(() => ({
    "--bg": theme.bg, "--panel": theme.panel, "--text": theme.text, "--muted": theme.muted, "--line": theme.line, "--accent": theme.accent, "--accent2": theme.accent2, "--radius": theme.radius, "--theme-font": theme.font, "--title-font": theme.titleFont, "--number-font": theme.numberFont, "--ui-scale": settings.uiScale / 100,
    "--theme-background-image": `url(${getThemeBackground(theme.id)})`,
    ...(wallpaperUrl ? { "--wallpaper": `linear-gradient(rgba(0,0,0,.18),rgba(0,0,0,.18)), url(${wallpaperUrl})` } : { "--wallpaper": "none" }),
  }) as React.CSSProperties, [theme, settings.uiScale, wallpaperUrl]);

  const routeClass = location.pathname === "/" ? "home" : location.pathname.slice(1).replaceAll("/", "-");

  return <div className={`app-shell route-${routeClass} ${location.pathname === "/" ? "home-route" : ""}`} data-theme={theme.id} data-motion={settings.motionLevel} data-text-size={settings.textSize} style={style}>
    <ThemeAtmosphere themeId={theme.id} />
    <Sidebar drawerOpen={drawerOpen} onOpenDrawer={() => setDrawerOpen(true)} onCloseDrawer={() => setDrawerOpen(false)} onSearch={() => setSearchOpen(true)} onNotifications={() => setNotificationsOpen(true)} />
    <main className="page-area"><Outlet /></main>
    <Dock />
    {location.pathname !== "/focus" || !activeFocus ? <button className="quick-note-button" onClick={() => setQuickOpen(true)} aria-label="Quick Note">+</button> : null}
    <QuickNotePanel open={quickOpen} onClose={() => setQuickOpen(false)} />
    <SearchPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
    <NotificationPanel open={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
    {updateAvailable && <div className="update-toast"><div><b>UPDATE AVAILABLE</b><span>새 버전이 준비됐어요.</span></div><button onClick={()=>setUpdateAvailable(false)}>나중에</button><button className="primary" onClick={()=>window.location.reload()}>업데이트</button></div>}
  </div>;
}
