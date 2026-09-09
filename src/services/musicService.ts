declare global {
  interface Window { MusicKit?: any; }
}

const SCRIPT_ID = "musickit-v3";

export async function loadMusicKit() {
  if (window.MusicKit) return window.MusicKit;
  const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
  if (existing) {
    await new Promise<void>((resolve, reject) => {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("MusicKit script load failed")), { once: true });
    });
    return window.MusicKit;
  }

  await new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = "https://js-cdn.music.apple.com/musickit/v3/musickit.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("MusicKit script load failed"));
    document.head.appendChild(script);
  });
  return window.MusicKit;
}

export async function configureMusicKit(developerToken: string) {
  const MusicKit = await loadMusicKit();
  if (!MusicKit) throw new Error("MusicKit을 불러오지 못했습니다.");
  try {
    MusicKit.configure({ developerToken, app: { name: "Personal System", build: "1.0.0" } });
  } catch {
    MusicKit.configure({ developerToken });
  }
  return MusicKit.getInstance();
}

export async function authorizeAndPlayTheme(developerToken: string, term: string) {
  const music = await configureMusicKit(developerToken);
  if (!music.isAuthorized) await music.authorize();
  let playlistId: string | undefined;
  try {
    const result = await music.api.search(term, { types: "playlists", limit: 1 });
    const bucket = result?.playlists?.data ?? result?.data?.results?.playlists?.data ?? [];
    playlistId = bucket[0]?.id;
  } catch {
    playlistId = undefined;
  }
  if (!playlistId) throw new Error(`Apple Music에서 '${term}' 플레이리스트를 찾지 못했습니다.`);
  await music.setQueue({ playlist: playlistId });
  await music.play();
  return { music, playlistId };
}
