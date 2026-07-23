export interface VideoItem {
  id: string;
  title: string;
  channelTitle: string;
  channelId?: string;
  description: string;
  thumbnailUrl: string;
  publishedAt: string;
  duration: string; // e.g. "24:15"
  subject: SubjectCategory;
  examCategory?: 'NCERT' | 'CBSE' | 'UPSC' | 'JEE' | 'NEET' | 'General';
  views?: string;
  verifiedEducational: boolean;
  keyTakeaways?: string[];
}

export type SubjectCategory =
  | 'All'
  | 'Mathematics'
  | 'Science'
  | 'Programming'
  | 'Geography'
  | 'History'
  | 'Political Science'
  | 'Economics'
  | 'English'
  | 'UPSC'
  | 'JEE'
  | 'NEET'
  | 'NCERT'
  | 'CBSE'
  | 'Psychology'
  | 'Legal Studies'
  | 'Revision';

export interface StudySession {
  id: string;
  date: string; // YYYY-MM-DD
  timestamp: number; // Unix epoch ms
  durationMinutes: number;
  type: 'study' | 'break';
  subject?: SubjectCategory;
  videoId?: string;
  videoTitle?: string;
}

export interface UserStats {
  currentStreak: number;
  bestStreak: number;
  totalMinutesStudied: number;
  totalSessionsCompleted: number;
  lastStudiedDate: string | null;
  lastStreakDate: string | null;
  weeklyMinutes: { [dayOfWeek: string]: number }; // e.g. { "Mon": 120, "Tue": 80 }
  monthlyMinutes: { [yearMonth: string]: number }; // e.g. { "2026-07": 1420 }
  dailyMinutes: { [date: string]: number }; // e.g. { "2026-07-23": 45 }
  subjectBreakdown: { [key in SubjectCategory]?: number }; // minutes per subject
}

export interface TimerConfig {
  studyMinutes: number;
  breakMinutes: number;
  autoStartBreaks: boolean;
  soundEnabled: boolean;
}

export interface MotivationalQuote {
  id: string;
  text: string;
  author: string;
  category: 'Focus' | 'Perseverance' | 'Learning' | 'Mindset';
}

export interface VideoNote {
  id: string;
  videoId: string;
  videoTitle: string;
  timestampSeconds: number; // e.g. 754 for 12:34
  noteText: string;
  createdAt: number;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  videoIds: string[];
  createdAt: number;
  isDefault?: boolean;
}

export interface WatchProgress {
  videoId: string;
  videoTitle: string;
  thumbnailUrl: string;
  channelTitle: string;
  subject: SubjectCategory;
  durationSeconds: number;
  positionSeconds: number;
  lastWatchedAt: number;
  completed: boolean;
}

export interface ExamInfo {
  id: string;
  examName: string;
  examDate: string; // YYYY-MM-DD
  subjects: string[];
  topics: string[];
}

export interface FollowedChannel {
  channelTitle: string;
  channelId?: string;
  followedAt: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: number | null; // null if locked
  category: 'time' | 'streak' | 'session' | 'video';
}

export interface NotificationSettings {
  enabled: boolean;
  studyEnabled: boolean;
  motivationEnabled: boolean;
  streakEnabled: boolean;
  examEnabled: boolean;
  goalEnabled: boolean;
  language: 'en' | 'hi' | 'both';
  frequencyMinutes: number; // e.g. every 15, 30, 60 mins
  customMessages: string[];
}

export interface SearchResult {
  blocked: boolean;
  blockedKeyword?: string;
  message?: string;
  videos: VideoItem[];
  nextPageToken?: string | null;
  apiError?: string;
  diagnosticLogs?: {
    candidateCount: number;
    returnedCount: number;
    pagesFetched: number;
    usedFallback?: boolean;
  };
}

