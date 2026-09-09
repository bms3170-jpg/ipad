import { useEffect } from "react";
import { useMusicStore } from "../../stores/musicStore";
import { useThemeStore } from "../../stores/themeStore";
import { getTheme } from "../../themes/themeDefinitions";

export function MusicPage() {
  const currentThemeId = useThemeStore((s) => s.currentThemeId);
  const theme = getTheme(currentThemeId);
  const music = useMusicStore();

  useEffect(() => { music.syncThemeRecommendation(); }, [currentThemeId]);

  const modes = [
    ["main", "THEME", theme.music],
    ["focus", "FOCUS", theme.focusMusic],
    ["relax", "RELAX", theme.relaxMusic],
  ] as const;

  return (
    <section className="page music-page">
      <div className="page-head compact-head"><div><span className="kicker">APPLE MUSIC / THEME SOUND</span><h1>MUSIC</h1><p>테마와 Focus에 맞는 음악을 한 플레이어에서 관리합니다.</p></div><div className={`connection-pill ${music.connected ? "connected" : ""}`}>{music.connected ? "● CONNECTED" : "○ NOT CONNECTED"}</div></div>
      <div className="music-layout">
        <article className="now-playing-card card">
          <div className="record-art"><span>♫</span><i /></div>
          <span className="kicker">NOW PLAYING</span>
          <h2>{music.title}</h2><p>{music.artist}</p>
          <div className="fake-progress"><i style={{ width: music.playing ? "38%" : "0%" }} /></div>
          <div className="player-controls"><button>↶</button><button>◀</button><button className="play-main" onClick={music.togglePlay}>{music.playing ? "❚❚" : "▶"}</button><button>▶</button><button>↷</button></div>
          <button className="primary wide" disabled={music.connecting} onClick={() => music.connected ? music.playTheme() : music.connect()}>{music.connecting ? "CONNECTING…" : music.connected ? "테마 음악 재생" : "Apple Music 연결"}</button>
          {music.error && <p className="error-text">{music.error}</p>}
        </article>

        <main className="music-browse">
          <article className="card soundtrack-card"><span className="kicker">CURRENT THEME</span><h2>{theme.name}</h2><p>{theme.subtitle}</p><div className="soundtrack-modes">{modes.map(([mode, label, title]) => <button key={mode} className={music.mode === mode ? "active" : ""} onClick={() => music.setMode(mode)}><span>{label}</span><b>{title}</b><small>SELECT MOOD →</small></button>)}</div></article>
          <article className="card"><span className="kicker">MOOD</span><div className="mood-chips"><button onClick={() => music.setMode("focus")}>FOCUS</button><button onClick={() => music.setMode("relax")}>RELAX</button><button onClick={() => music.setMode("main")}>NIGHT</button><button onClick={() => music.setMode("main")}>DRIVE</button><button onClick={() => music.setMode("relax")}>CALM</button></div></article>
        </main>

        <aside className="music-queue card"><span className="kicker">UP NEXT</span><h3>Theme Queue</h3>{[theme.music, theme.focusMusic, theme.relaxMusic, "Daily Favorite"].map((value, i) => <article key={`${value}-${i}`}><span>{String(i + 1).padStart(2, "0")}</span><div><b>{value}</b><small>{theme.name}</small></div></article>)}<div className="music-note"><b>MusicKit v3</b><p>실제 Apple Music 재생에는 Apple Developer의 MusicKit Developer Token이 필요합니다. SETTINGS에서 토큰을 넣으면 연결 버튼이 활성화됩니다.</p></div></aside>
      </div>
    </section>
  );
}
