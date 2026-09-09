import { create } from "zustand";
import { persist } from "zustand/middleware";
import { makeId } from "../utils/date";

export type QuickApp = { id: string; name: string; icon: string; type: "internal" | "web" | "system"; target: string; enabled: boolean };
const defaults: QuickApp[] = [
  { id: "browser", name: "Browser", icon: "◫", type: "web", target: "https://www.google.com", enabled: true },
  { id: "photos", name: "Photos", icon: "▧", type: "internal", target: "/gallery", enabled: true },
  { id: "calendar", name: "Calendar", icon: "31", type: "internal", target: "/calendar", enabled: true },
  { id: "music", name: "Music", icon: "♫", type: "internal", target: "/music", enabled: true },
  { id: "chatgpt", name: "ChatGPT", icon: "✦", type: "web", target: "https://chatgpt.com", enabled: true },
  { id: "files", name: "Files", icon: "□", type: "system", target: "shareddocuments://", enabled: true },
  { id: "notes", name: "Notes", icon: "≡", type: "internal", target: "/notes", enabled: true },
];

type Store = { apps: QuickApp[]; add: (input: Omit<QuickApp,"id"|"enabled">) => void; remove: (id:string)=>void; move:(id:string,direction:-1|1)=>void; update:(id:string,input:Partial<QuickApp>)=>void; reset:()=>void };
export const useQuickAppsStore = create<Store>()(persist((set) => ({
  apps: defaults,
  add: (input) => set((state) => ({ apps: [...state.apps, { ...input, id: makeId("app"), enabled: true }] })),
  remove: (id) => set((state) => ({ apps: state.apps.filter((app) => app.id !== id) })),
  move: (id,direction) => set((state) => { const apps=[...state.apps]; const i=apps.findIndex((app)=>app.id===id); const t=i+direction; if(i<0||t<0||t>=apps.length)return {}; [apps[i],apps[t]]=[apps[t],apps[i]]; return {apps}; }),
  update: (id,input) => set((state) => ({ apps: state.apps.map((app) => app.id===id ? {...app,...input} : app) })),
  reset: () => set({ apps: defaults }),
}), { name:"personal-system:quick-apps:v1" }));
