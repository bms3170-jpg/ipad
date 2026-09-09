type Props = { themeId: string };

const WORLD_LABELS: Record<string, [string, string]> = {
  brutalist: ["RAW SYSTEM", "UTILITY GRID 01"],
  "retro-terminal": ["> SYSTEM_", "CRT SESSION ACTIVE"],
  blueprint: ["SHEET A-01", "PERSONAL SYSTEM / PLAN"],
  "art-deco": ["PRIVATE CLUB", "DAILY EDITION"],
  y2k: ["DIGITAL DREAM", "CHROME SPACE"],
  scrapbook: ["TODAY'S PAGE", "KEEP THE LITTLE THINGS"],
  "moon-base": ["LUNAR STATION", "HABITAT 09"],
  "isometric-island": ["MY LITTLE WORLD", "ISLAND STATUS"],
  "retro-pixel": ["PLAYER 01", "NIGHT ARCADE"],
  "minimal-gallery": ["PERSONAL ARCHIVE", "ROOM 01"],
  "manga-panel": ["EPISODE 09", "TODAY'S MISSION"],
  "scientific-lab": ["LAB SESSION", "SPECIMEN: TODAY"],
  racing: ["DRIVER MODE", "TELEMETRY LIVE"],
  newspaper: ["THE PERSONAL DAILY", "EVENING EDITION"],
  transit: ["PERSONAL LINE", "NEXT STOP: TODAY"],
  fantasy: ["THE DAILY CODEX", "QUEST LOG"],
  "modular-synth": ["PATCH 09", "SEQUENCE RUNNING"],
  gothic: ["VESPER ARCHIVE", "STAINED GLASS OS"],
  medical: ["SCAN SESSION", "VITALS / NORMAL"],
  "luxury-watch": ["CHRONOGRAPH", "PERSONAL CALIBRE"],
};

export function ThemeAtmosphere({ themeId }: Props) {
  const [title, subtitle] = WORLD_LABELS[themeId] ?? ["PERSONAL SYSTEM", "YOUR SPACE"];
  return (
    <div className="theme-atmosphere" aria-hidden="true">
      <div className="theme-reference-wash" />
      <div className="atmo-grid" />
      <span className="atmo-shape atmo-a" />
      <span className="atmo-shape atmo-b" />
      <span className="atmo-shape atmo-c" />
      <span className="atmo-line atmo-line-a" />
      <span className="atmo-line atmo-line-b" />
      <div className="world-stamp"><b>{title}</b><small>{subtitle}</small></div>
    </div>
  );
}
