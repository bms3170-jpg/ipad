export const THEME_REFERENCE_IMAGES: Record<string, string> = {
  brutalist: "/theme-references/brutalist.webp",
  "retro-terminal": "/theme-references/retro-terminal.webp",
  blueprint: "/theme-references/blueprint.webp",
  "art-deco": "/theme-references/art-deco.webp",
  "pastel-city": "/theme-references/isometric-island.webp",
  "sunset-cyber": "/theme-references/racing.webp",
  "neon-metropolis": "/theme-references/retro-pixel.webp",
  y2k: "/theme-references/y2k.webp",
  scrapbook: "/theme-references/scrapbook.webp",
  "airy-minimal": "/theme-references/minimal-gallery.webp",
  "cafe-editorial": "/theme-references/scrapbook.webp",
  "moon-base": "/theme-references/moon-base.webp",
  "abyss-aquarium": "/theme-references/scientific-lab.webp",
  "desert-twilight": "/theme-references/art-deco.webp",
  "botanical-forest": "/theme-references/isometric-island.webp",
  "deep-space": "/theme-references/moon-base.webp",
  "sakura-night": "/theme-references/gothic.webp",
  "anime-hologram": "/theme-references/retro-pixel.webp",
  "starship-cockpit": "/theme-references/moon-base.webp",
  "isometric-island": "/theme-references/isometric-island.webp",
  "retro-pixel": "/theme-references/retro-pixel.webp",
  "minimal-gallery": "/theme-references/minimal-gallery.webp",
  "manga-panel": "/theme-references/manga-panel.webp",
  "scientific-lab": "/theme-references/scientific-lab.webp",
  racing: "/theme-references/racing.webp",
  newspaper: "/theme-references/newspaper.webp",
  transit: "/theme-references/transit.webp",
  fantasy: "/theme-references/fantasy.webp",
  "modular-synth": "/theme-references/modular-synth.webp",
  gothic: "/theme-references/gothic.webp",
  medical: "/theme-references/medical.webp",
  "luxury-watch": "/theme-references/luxury-watch.webp",
};

export function getThemeReference(themeId: string) {
  const path = THEME_REFERENCE_IMAGES[themeId] ?? THEME_REFERENCE_IMAGES["moon-base"];
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;
}
