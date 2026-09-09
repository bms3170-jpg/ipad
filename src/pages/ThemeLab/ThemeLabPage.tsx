import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMusicStore } from "../../stores/musicStore";
import { useThemeStore } from "../../stores/themeStore";
import { getTheme, THEMES } from "../../themes/themeDefinitions";
import { getThemeReference } from "../../themes/themeReferences";

export function ThemeLabPage() {
  const navigate = useNavigate();
  const currentThemeId = useThemeStore((s) => s.currentThemeId); const setTheme = useThemeStore((s) => s.setTheme); const favoriteThemeIds = useThemeStore((s) => s.favoriteThemeIds); const toggleFavorite = useThemeStore((s) => s.toggleFavorite); const autoMode = useThemeStore((s) => s.autoMode); const setAutoMode = useThemeStore((s) => s.setAutoMode);
  const syncMusic = useMusicStore((s) => s.syncThemeRecommendation);
  const [previewId, setPreviewId] = useState(currentThemeId); const [filter, setFilter] = useState<"all" | "favorite">("all");
  const preview = getTheme(previewId); const list = filter === "favorite" ? THEMES.filter((theme) => favoriteThemeIds.includes(theme.id)) : THEMES;

  const applyTheme=()=>{
    setAutoMode("off");
    setTheme(previewId);
    // Move first so a theme-wide geometry change cannot interrupt the click flow.
    navigate("/", { replace: true });
    window.setTimeout(syncMusic, 0);
  };
  return <section className="page theme-lab-page"><div className="page-head compact-head"><div><span className="kicker">20 THEMES / 1 PERSONAL SPACE</span><h1>THEME LAB</h1><p>테마를 선택한 뒤 적용하면 홈 화면으로 바로 이동합니다.</p></div><div className="theme-filter"><button className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>ALL 20</button><button className={filter === "favorite" ? "active" : ""} onClick={() => setFilter("favorite")}>★ FAVORITE</button></div></div>
    <div className="theme-lab-layout">
      <div className="theme-grid">{list.map((theme) => {const number=THEMES.findIndex(x=>x.id===theme.id)+1;return <button type="button" aria-pressed={previewId===theme.id} key={theme.id} className={`${previewId === theme.id ? "selected" : ""} ${currentThemeId === theme.id ? "applied" : ""}`} onClick={() => setPreviewId(theme.id)} style={{ "--theme-card-bg": theme.bg, "--theme-card-panel": theme.panel, "--theme-card-accent": theme.accent, "--theme-card-text": theme.text } as React.CSSProperties}><span>{String(number).padStart(2, "0")}</span><div className={`theme-thumb theme-thumb-${theme.id}`} style={{ backgroundImage: `linear-gradient(rgba(0,0,0,.08),rgba(0,0,0,.08)), url(${getThemeReference(theme.id)})` }}><i /><i /><i /></div><b>{theme.name}</b><small>{theme.subtitle}</small><em role="button" aria-label={`${theme.name} 즐겨찾기`} onClick={(e) => { e.stopPropagation(); toggleFavorite(theme.id); }}>{favoriteThemeIds.includes(theme.id) ? "★" : "☆"}</em></button>})}</div>
      <aside className="theme-preview" data-preview-theme={preview.id} style={{ "--preview-bg": preview.bg, "--preview-panel": preview.panel, "--preview-accent": preview.accent, "--preview-text": preview.text, "--preview-line": preview.line, "--preview-radius": preview.radius, "--preview-font": preview.font } as React.CSSProperties}><div className={`preview-canvas preview-${preview.id}`} style={{ backgroundImage: `linear-gradient(rgba(0,0,0,.04),rgba(0,0,0,.04)), url(${getThemeReference(preview.id)})` }} aria-label={`${preview.name} 전체 화면 미리보기`}><div className="preview-world" aria-hidden="true"><i /><i /><i /><span /></div></div><div className="theme-details"><span className="kicker">SELECTED THEME</span><h2>{preview.name}</h2><p>{preview.subtitle}</p><dl><div><dt>MAIN</dt><dd>{preview.music}</dd></div><div><dt>FOCUS</dt><dd>{preview.focusMusic}</dd></div><div><dt>RELAX</dt><dd>{preview.relaxMusic}</dd></div></dl><div className="auto-theme"><span>AUTO THEME</span>{(["off","time","weekday","random"] as const).map((mode) => <button key={mode} className={autoMode === mode ? "active" : ""} onClick={() => setAutoMode(mode)}>{mode.toUpperCase()}</button>)}</div><div className="theme-apply-actions"><button onClick={() => setPreviewId(currentThemeId)}>취소</button><button className="primary" disabled={previewId===currentThemeId} onClick={applyTheme}>{previewId===currentThemeId?"현재 적용 중":"적용하고 홈으로"}</button></div></div></aside>
    </div>
  </section>;
}
