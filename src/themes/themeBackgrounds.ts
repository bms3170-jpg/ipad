const BACKGROUNDS: Record<string, string> = {
  brutalist: "/theme-backgrounds/brutalist.png",
  "retro-terminal": "/theme-backgrounds/retro-terminal.png",
  blueprint: "/theme-backgrounds/blueprint.png",
  "art-deco": "/theme-backgrounds/art-deco.png",
  "pastel-city": "/theme-backgrounds/isometric-island.png",
  "sunset-cyber": "/theme-backgrounds/racing.png",
  "neon-metropolis": "/theme-backgrounds/retro-pixel.png",
  y2k: "/theme-backgrounds/y2k.png",
  scrapbook: "/theme-backgrounds/scrapbook.png",
  "airy-minimal": "/theme-backgrounds/minimal-gallery.png",
  "cafe-editorial": "/theme-backgrounds/scrapbook.png",
  "moon-base": "/theme-backgrounds/moon-base.png",
  "abyss-aquarium": "/theme-backgrounds/scientific-lab.png",
  "desert-twilight": "/theme-backgrounds/art-deco.png",
  "botanical-forest": "/theme-backgrounds/isometric-island.png",
  "deep-space": "/theme-backgrounds/moon-base.png",
  "sakura-night": "/theme-backgrounds/gothic.png",
  "anime-hologram": "/theme-backgrounds/retro-pixel.png",
  "starship-cockpit": "/theme-backgrounds/moon-base.png",
  "isometric-island": "/theme-backgrounds/isometric-island.png",
  "retro-pixel": "/theme-backgrounds/retro-pixel.png",
  "minimal-gallery": "/theme-backgrounds/minimal-gallery.png",
  "manga-panel": "/theme-backgrounds/manga-panel.png",
  "scientific-lab": "/theme-backgrounds/scientific-lab.png",
  racing: "/theme-backgrounds/racing.png",
  newspaper: "/theme-backgrounds/newspaper.png",
  transit: "/theme-backgrounds/transit.png",
  fantasy: "/theme-backgrounds/fantasy.png",
  "modular-synth": "/theme-backgrounds/modular-synth.png",
  gothic: "/theme-backgrounds/gothic.png",
  medical: "/theme-backgrounds/medical.png",
  "luxury-watch": "/theme-backgrounds/luxury-watch.png",
};

export function getThemeBackground(themeId: string) {
  const path = BACKGROUNDS[themeId] ?? BACKGROUNDS.brutalist;
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;
}
