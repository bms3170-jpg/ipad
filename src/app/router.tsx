import { createHashRouter } from "react-router-dom";
import { AppShell } from "../layout/AppShell";

export const router = createHashRouter([{ path: "/", element: <AppShell />, children: [
  {index:true,lazy:async()=>({Component:(await import("../pages/Home/HomePage")).HomePage})},
  {path:"today",lazy:async()=>({Component:(await import("../pages/Today/TodayPage")).TodayPage})},
  {path:"calendar",lazy:async()=>({Component:(await import("../pages/Calendar/CalendarPage")).CalendarPage})},
  {path:"notes",lazy:async()=>({Component:(await import("../pages/Notes/NotesPage")).NotesPage})},
  {path:"music",lazy:async()=>({Component:(await import("../pages/Music/MusicPage")).MusicPage})},
  {path:"focus",lazy:async()=>({Component:(await import("../pages/Focus/FocusPage")).FocusPage})},
  {path:"gallery",lazy:async()=>({Component:(await import("../pages/Gallery/GalleryPage")).GalleryPage})},
  {path:"themes",lazy:async()=>({Component:(await import("../pages/ThemeLab/ThemeLabPage")).ThemeLabPage})},
  {path:"settings",lazy:async()=>({Component:(await import("../pages/Settings/SettingsPage")).SettingsPage})},
] }]);
