export type TaskPriority = "normal" | "important";

export type Task = {
  id: string;
  title: string;
  date: string;
  time?: string;
  priority: TaskPriority;
  completed: boolean;
  memo?: string;
  repeat?: string;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  deletedAt: string | null;
};

export type ScheduleCategory = "work" | "personal" | "appointment" | "important";

export type Schedule = {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  category: ScheduleCategory;
  important: boolean;
  memo: string;
  completed: boolean;
  repeat?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type CheckItem = {
  id: string;
  text: string;
  completed: boolean;
};

export type NoteType = "normal" | "quick" | "checklist" | "photo" | "daily";

export type Note = {
  id: string;
  type: NoteType;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  pinned: boolean;
  favorite: boolean;
  hidden: boolean;
  tags: string[];
  checklist: CheckItem[];
  photoIds: string[];
  dailyDate?: string;
  deletedAt: string | null;
};

export type FocusMood = "tired" | "neutral" | "good" | "fire";

export type FocusRecord = {
  id: string;
  title: string;
  taskId?: string;
  startedAt: string;
  endedAt: string;
  durationMinutes: number;
  mood?: FocusMood;
  music?: string;
};

export type DailyRecord = {
  date: string;
  taskTotal: number;
  taskCompleted: number;
  scheduleTotal: number;
  scheduleCompleted: number;
  focusMinutes: number;
  photoId?: string;
  musicTitle?: string;
  memo?: string;
  mood?: string;
  closedAt: string;
};

export type GalleryPhoto = {
  id: string;
  fileName: string;
  mimeType: string;
  blob: Blob;
  createdAt: string;
  updatedAt: string;
  title: string;
  caption: string;
  tags: string[];
  favorite: boolean;
  hidden: boolean;
  todayMemoryDate?: string;
  isWallpaper: boolean;
  linkedNoteId?: string;
  linkedThemeIds: string[];
  deletedAt: string | null;
};

export type WeatherKind = "clear" | "cloudy" | "rain" | "snow" | "storm" | "fog";

export type WeatherSnapshot = {
  locationLabel: string;
  latitude: number;
  longitude: number;
  temperature: number;
  apparentTemperature: number;
  high: number;
  low: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  kind: WeatherKind;
  description: string;
  precipitationProbability: number;
  hourly: Array<{
    time: string;
    temperature: number;
    weatherCode: number;
    precipitationProbability: number;
  }>;
  updatedAt: string;
};

export type WidgetSize = "S" | "M" | "L";
export type HomeWidgetType = "clock" | "tasks" | "nowNext" | "weather" | "music" | "focus" | "memo" | "calendar" | "photo" | "dday";

export type HomeWidgetConfig = {
  id: string;
  type: HomeWidgetType;
  size: WidgetSize;
  visible: boolean;
};
