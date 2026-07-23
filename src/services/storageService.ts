import { StudySession, UserStats, TimerConfig, VideoNote, VideoItem, SubjectCategory, Playlist, WatchProgress, ExamInfo, FollowedChannel, Achievement, NotificationSettings } from '../types';

const STATS_KEY = 'studytube_user_stats';
const SESSIONS_KEY = 'studytube_study_sessions';
const TIMER_CONFIG_KEY = 'studytube_timer_config';
const NOTES_KEY = 'studytube_video_notes';
const SAVED_VIDEOS_KEY = 'studytube_saved_videos';
const PLAYLISTS_KEY = 'studytube_playlists';
const WATCH_PROGRESS_KEY = 'studytube_watch_progress';
const EXAMS_KEY = 'studytube_exams';
const FOLLOWED_CHANNELS_KEY = 'studytube_followed_channels';
const SEARCH_HISTORY_KEY = 'studytube_search_history';
const DAILY_GOAL_KEY = 'studytube_daily_goal';
const PLAYBACK_SPEED_KEY = 'studytube_playback_speed';
const NOTIFICATION_SETTINGS_KEY = 'studytube_notification_settings';


const DEFAULT_TIMER_CONFIG: TimerConfig = {
  studyMinutes: 40,
  breakMinutes: 5,
  autoStartBreaks: false,
  soundEnabled: true,
};

const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enabled: true,
  studyEnabled: true,
  motivationEnabled: true,
  streakEnabled: true,
  examEnabled: true,
  goalEnabled: true,
  language: 'both',
  frequencyMinutes: 30,
  customMessages: [],
};

const DEFAULT_STATS: UserStats = {
  currentStreak: 1,
  bestStreak: 3,
  totalMinutesStudied: 160,
  totalSessionsCompleted: 4,
  lastStudiedDate: new Date().toISOString().split('T')[0],
  lastStreakDate: null,
  weeklyMinutes: {
    Mon: 40,
    Tue: 40,
    Wed: 40,
    Thu: 40,
    Fri: 0,
    Sat: 0,
    Sun: 0
  },
  monthlyMinutes: {
    [new Date().toISOString().slice(0, 7)]: 160
  },
  dailyMinutes: {},
  subjectBreakdown: {
    Mathematics: 40,
    Science: 40,
    Programming: 40,
    History: 40
  }
};

export class StorageService {
  static getStats(): UserStats {
    try {
      const data = localStorage.getItem(STATS_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        return {
          currentStreak: typeof parsed.currentStreak === 'number' ? parsed.currentStreak : 0,
          bestStreak: typeof parsed.bestStreak === 'number' ? parsed.bestStreak : 0,
          totalMinutesStudied: typeof parsed.totalMinutesStudied === 'number' ? parsed.totalMinutesStudied : 0,
          totalSessionsCompleted: typeof parsed.totalSessionsCompleted === 'number' ? parsed.totalSessionsCompleted : 0,
          lastStudiedDate: parsed.lastStudiedDate || null,
          lastStreakDate: parsed.lastStreakDate || null,
          weeklyMinutes: {
            Mon: parsed.weeklyMinutes?.Mon ?? 0,
            Tue: parsed.weeklyMinutes?.Tue ?? 0,
            Wed: parsed.weeklyMinutes?.Wed ?? 0,
            Thu: parsed.weeklyMinutes?.Thu ?? 0,
            Fri: parsed.weeklyMinutes?.Fri ?? 0,
            Sat: parsed.weeklyMinutes?.Sat ?? 0,
            Sun: parsed.weeklyMinutes?.Sun ?? 0,
            ...(parsed.weeklyMinutes || {})
          },
          monthlyMinutes: parsed.monthlyMinutes || {},
          dailyMinutes: parsed.dailyMinutes || {},
          subjectBreakdown: parsed.subjectBreakdown || {}
        };
      }
    } catch (e) {
      console.error('Error reading stats:', e);
    }
    return DEFAULT_STATS;
  }

  static saveStats(stats: UserStats): void {
    try {
      localStorage.setItem(STATS_KEY, JSON.stringify(stats));
    } catch (e) {
      console.error('Error saving stats:', e);
    }
  }

  static getSessions(): StudySession[] {
    try {
      const data = localStorage.getItem(SESSIONS_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Error reading sessions:', e);
    }
    // Return sample initial sessions if empty
    const todayStr = new Date().toISOString().split('T')[0];
    return [
      {
        id: 's1',
        date: todayStr,
        timestamp: Date.now() - 3600000 * 2,
        durationMinutes: 40,
        type: 'study',
        subject: 'Mathematics',
        videoTitle: 'Calculus 1 - Limits & Derivatives'
      },
      {
        id: 's2',
        date: todayStr,
        timestamp: Date.now() - 3600000 * 5,
        durationMinutes: 40,
        type: 'study',
        subject: 'Science',
        videoTitle: 'Newton’s Laws of Motion'
      }
    ];
  }

  static logSession(durationMinutes: number, type: 'study' | 'break', subject: SubjectCategory = 'Mathematics', videoTitle?: string, videoId?: string): UserStats {
    const sessions = this.getSessions();
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const monthStr = now.toISOString().slice(0, 7); // YYYY-MM
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayName = dayNames[now.getDay()];

    const newSession: StudySession = {
      id: `session_${Date.now()}`,
      date: todayStr,
      timestamp: Date.now(),
      durationMinutes,
      type,
      subject,
      videoId,
      videoTitle
    };

    sessions.unshift(newSession);
    try {
      localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
    } catch (e) {
      console.error('Error logging session:', e);
    }

    // Update stats only if it's a study session
    const stats = this.getStats();
    if (type === 'study') {
      stats.totalMinutesStudied += durationMinutes;
      stats.totalSessionsCompleted += 1;

      // Update weekly minutes
      stats.weeklyMinutes[dayName] = (stats.weeklyMinutes[dayName] || 0) + durationMinutes;

      // Update monthly minutes
      stats.monthlyMinutes[monthStr] = (stats.monthlyMinutes[monthStr] || 0) + durationMinutes;

      // Update subject breakdown
      stats.subjectBreakdown[subject] = (stats.subjectBreakdown[subject] || 0) + durationMinutes;

      // Update daily minutes
      const oldDailyTotal = stats.dailyMinutes[todayStr] || 0;
      stats.dailyMinutes[todayStr] = oldDailyTotal + durationMinutes;
      const newDailyTotal = stats.dailyMinutes[todayStr];

      // Update streak only if threshold is crossed today for the first time
      if (newDailyTotal >= 10 && oldDailyTotal < 10) {
        if (!stats.lastStreakDate) {
          stats.currentStreak = 1;
        } else {
          const lastStreakDate = new Date(stats.lastStreakDate);
          const diffDays = Math.floor((now.getTime() - lastStreakDate.getTime()) / (1000 * 3600 * 24));
          
          if (diffDays === 1) {
            stats.currentStreak += 1;
          } else if (diffDays > 1) {
            stats.currentStreak = 1;
          }
        }
        stats.lastStreakDate = todayStr;
      }

      if (stats.currentStreak > stats.bestStreak) {
        stats.bestStreak = stats.currentStreak;
      }

      stats.lastStudiedDate = todayStr;
      this.saveStats(stats);
    }

    return stats;
  }

  static getTimerConfig(): TimerConfig {
    try {
      const data = localStorage.getItem(TIMER_CONFIG_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        return {
          studyMinutes: typeof parsed.studyMinutes === 'number' && parsed.studyMinutes > 0 ? parsed.studyMinutes : DEFAULT_TIMER_CONFIG.studyMinutes,
          breakMinutes: typeof parsed.breakMinutes === 'number' && parsed.breakMinutes > 0 ? parsed.breakMinutes : DEFAULT_TIMER_CONFIG.breakMinutes,
          autoStartBreaks: typeof parsed.autoStartBreaks === 'boolean' ? parsed.autoStartBreaks : DEFAULT_TIMER_CONFIG.autoStartBreaks,
          soundEnabled: typeof parsed.soundEnabled === 'boolean' ? parsed.soundEnabled : DEFAULT_TIMER_CONFIG.soundEnabled,
        };
      }
    } catch (e) {
      console.error('Error reading timer config:', e);
    }
    return DEFAULT_TIMER_CONFIG;
  }

  static saveTimerConfig(config: TimerConfig): void {
    try {
      localStorage.setItem(TIMER_CONFIG_KEY, JSON.stringify(config));
    } catch (e) {
      console.error('Error saving timer config:', e);
    }
  }

  static getNotes(videoId?: string): VideoNote[] {
    try {
      const data = localStorage.getItem(NOTES_KEY);
      const allNotes: VideoNote[] = data ? JSON.parse(data) : [];
      if (videoId) {
        return allNotes.filter(n => n.videoId === videoId);
      }
      return allNotes;
    } catch (e) {
      console.error('Error reading notes:', e);
      return [];
    }
  }

  static addNote(videoId: string, videoTitle: string, timestampSeconds: number, noteText: string): VideoNote {
    const allNotes = this.getNotes();
    const newNote: VideoNote = {
      id: `note_${Date.now()}`,
      videoId,
      videoTitle,
      timestampSeconds,
      noteText,
      createdAt: Date.now()
    };
    allNotes.unshift(newNote);
    try {
      localStorage.setItem(NOTES_KEY, JSON.stringify(allNotes));
    } catch (e) {
      console.error('Error saving note:', e);
    }
    return newNote;
  }

  static deleteNote(noteId: string): void {
    const allNotes = this.getNotes().filter(n => n.id !== noteId);
    try {
      localStorage.setItem(NOTES_KEY, JSON.stringify(allNotes));
    } catch (e) {
      console.error('Error deleting note:', e);
    }
  }

  static getSavedVideos(): VideoItem[] {
    try {
      const data = localStorage.getItem(SAVED_VIDEOS_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Error reading saved videos:', e);
    }
    return [];
  }

  static toggleSaveVideo(video: VideoItem): boolean {
    const saved = this.getSavedVideos();
    const index = saved.findIndex(v => v.id === video.id);
    let isSaved = false;
    if (index >= 0) {
      saved.splice(index, 1);
      isSaved = false;
    } else {
      saved.unshift(video);
      isSaved = true;
    }
    try {
      localStorage.setItem(SAVED_VIDEOS_KEY, JSON.stringify(saved));
    } catch (e) {
      console.error('Error saving video:', e);
    }
    return isSaved;
  }

  // Hidden Videos & Blocked Channels (Not Interested / Don't recommend channel)
  static getHiddenVideos(): string[] {
    try {
      const data = localStorage.getItem('studytube_hidden_videos');
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  static hideVideo(videoId: string): void {
    const hidden = this.getHiddenVideos();
    if (!hidden.includes(videoId)) {
      hidden.push(videoId);
      localStorage.setItem('studytube_hidden_videos', JSON.stringify(hidden));
    }
  }

  static restoreVideo(videoId: string): void {
    const hidden = this.getHiddenVideos().filter(id => id !== videoId);
    localStorage.setItem('studytube_hidden_videos', JSON.stringify(hidden));
  }

  static isVidHidden(videoId: string): boolean {
    return this.getHiddenVideos().includes(videoId);
  }

  static getBlockedChannels(): string[] {
    try {
      const data = localStorage.getItem('studytube_blocked_channels');
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  static blockChannel(channelTitle: string): void {
    const blocked = this.getBlockedChannels();
    const trimmed = channelTitle.trim();
    if (trimmed && !blocked.includes(trimmed)) {
      blocked.push(trimmed);
      localStorage.setItem('studytube_blocked_channels', JSON.stringify(blocked));
    }
  }

  static unblockChannel(channelTitle: string): void {
    const blocked = this.getBlockedChannels().filter(c => c !== channelTitle);
    localStorage.setItem('studytube_blocked_channels', JSON.stringify(blocked));
  }

  static isChannelBlocked(channelTitle: string): boolean {
    const blocked = this.getBlockedChannels();
    return blocked.some(c => c.toLowerCase() === channelTitle.toLowerCase());
  }

  // Personal Blocked Keywords
  static getBlockedKeywords(): string[] {
    try {
      const data = localStorage.getItem('studytube_blocked_keywords');
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  static addBlockedKeyword(keyword: string): void {
    const keywords = this.getBlockedKeywords();
    const normalized = keyword.trim().replace(/\s+/g, ' ');
    if (!normalized) return;
    const exists = keywords.some(k => k.toLowerCase().replace(/\s+/g, ' ') === normalized.toLowerCase());
    if (!exists) {
      keywords.push(normalized);
      localStorage.setItem('studytube_blocked_keywords', JSON.stringify(keywords));
    }
  }

  static removeBlockedKeyword(keyword: string): void {
    const keywords = this.getBlockedKeywords();
    const normalized = keyword.trim().replace(/\s+/g, ' ').toLowerCase();
    const filtered = keywords.filter(k => k.toLowerCase().replace(/\s+/g, ' ') !== normalized);
    localStorage.setItem('studytube_blocked_keywords', JSON.stringify(filtered));
  }

  static isKeywordBlocked(text: string): boolean {
    if (!text) return false;
    const personal = this.getBlockedKeywords();
    const globalKeywords = [
      'minecraft', 'gta', 'fortnite', 'roblox', 'pubg', 'bgmi', 'free fire',
      'valorant', 'call of duty', 'gaming', 'gameplay', 'walkthrough',
      'music video', 'song', 'full movie', 'movie trailer', 'anime', 'netflix',
      'reels', 'shorts', 'funny clips', 'memes', 'prank', 'reaction', 'vlog'
    ];
    const allBlocked = [...globalKeywords, ...personal];
    
    const normalizedText = text.toLowerCase().replace(/\s+/g, ' ').trim();
    for (const rawKw of allBlocked) {
      const normalizedKw = rawKw.toLowerCase().replace(/\s+/g, ' ').trim();
      if (!normalizedKw) continue;
      
      const escaped = normalizedKw.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
      const hasSpaces = normalizedKw.includes(' ');
      let regex: RegExp;
      if (hasSpaces) {
        regex = new RegExp(`(?:\\b|^)${escaped}(?:\\b|$)`, 'i');
      } else {
        regex = new RegExp(`\\b${escaped}\\b`, 'i');
      }
      if (regex.test(normalizedText)) {
        return true;
      }
    }
    return false;
  }

  // Completely Blocked Channels (by ID and title)
  static getCompletelyBlockedChannels(): { id: string; title: string; thumbnailUrl?: string }[] {
    try {
      const data = localStorage.getItem('studytube_completely_blocked_channels');
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  static blockChannelCompletely(id: string, title: string, thumbnailUrl?: string): void {
    const blocked = this.getCompletelyBlockedChannels();
    const trimmedId = id.trim();
    if (!trimmedId) return;
    const exists = blocked.some(c => c.id === trimmedId);
    if (!exists) {
      blocked.push({ id: trimmedId, title: title.trim(), thumbnailUrl });
      localStorage.setItem('studytube_completely_blocked_channels', JSON.stringify(blocked));
    }
  }

  static unblockChannelCompletely(id: string): void {
    const blocked = this.getCompletelyBlockedChannels().filter(c => c.id !== id);
    localStorage.setItem('studytube_completely_blocked_channels', JSON.stringify(blocked));
  }

  static isChannelCompletelyBlocked(channelId: string, channelTitle?: string): boolean {
    const blocked = this.getCompletelyBlockedChannels();
    if (channelId && blocked.some(c => c.id === channelId)) {
      return true;
    }
    if (channelTitle) {
      return blocked.some(c => c.title.toLowerCase() === channelTitle.toLowerCase());
    }
    return false;
  }

  static clearDistractingHistory(): void {
    localStorage.removeItem('studytube_hidden_videos');
    localStorage.removeItem('studytube_blocked_channels');
    localStorage.removeItem('studytube_blocked_keywords');
    localStorage.removeItem('studytube_completely_blocked_channels');
  }

  static clearBlockedKeywords(): void {
    localStorage.removeItem('studytube_blocked_keywords');
  }

  static clearCompletelyBlockedChannels(): void {
    localStorage.removeItem('studytube_completely_blocked_channels');
  }

  // Playlists
  static getPlaylists(): Playlist[] {
    try {
      const data = localStorage.getItem(PLAYLISTS_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Error reading playlists:', e);
    }
    // Default playlists
    const defaultPlaylists: Playlist[] = [
      { id: 'watch_later', name: 'Watch Later', description: 'Default queue for saved study videos', videoIds: [], createdAt: Date.now(), isDefault: true },
      { id: 'political_science', name: 'Political Science', description: 'Constitution, rights, and governance lectures', videoIds: [], createdAt: Date.now() },
      { id: 'geography', name: 'Geography', description: 'Physical geography & NCERT summaries', videoIds: [], createdAt: Date.now() },
      { id: 'history', name: 'History', description: 'World history and Indian freedom struggle', videoIds: [], createdAt: Date.now() },
      { id: 'revision', name: 'Revision', description: 'High yield exam revision notes', videoIds: [], createdAt: Date.now() }
    ];
    this.savePlaylists(defaultPlaylists);
    return defaultPlaylists;
  }

  static savePlaylists(playlists: Playlist[]): void {
    try {
      localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(playlists));
    } catch (e) {
      console.error('Error saving playlists:', e);
    }
  }

  static createPlaylist(name: string, description?: string): Playlist {
    const playlists = this.getPlaylists();
    const newPlaylist: Playlist = {
      id: `pl_${Date.now()}`,
      name: name.trim(),
      description: description?.trim(),
      videoIds: [],
      createdAt: Date.now()
    };
    playlists.push(newPlaylist);
    this.savePlaylists(playlists);
    return newPlaylist;
  }

  static deletePlaylist(id: string): void {
    const playlists = this.getPlaylists().filter(p => p.id !== id && !p.isDefault);
    this.savePlaylists(playlists);
  }

  static renamePlaylist(id: string, newName: string): void {
    const playlists = this.getPlaylists();
    const pl = playlists.find(p => p.id === id);
    if (pl) {
      pl.name = newName.trim();
      this.savePlaylists(playlists);
    }
  }

  static addVideoToPlaylist(playlistId: string, videoId: string): void {
    const playlists = this.getPlaylists();
    const pl = playlists.find(p => p.id === playlistId);
    if (pl && !pl.videoIds.includes(videoId)) {
      pl.videoIds.push(videoId);
      this.savePlaylists(playlists);
    }
  }

  static removeVideoFromPlaylist(playlistId: string, videoId: string): void {
    const playlists = this.getPlaylists();
    const pl = playlists.find(p => p.id === playlistId);
    if (pl) {
      pl.videoIds = pl.videoIds.filter(id => id !== videoId);
      this.savePlaylists(playlists);
    }
  }

  // Continue Watching / Watch Progress
  static getWatchProgressList(): WatchProgress[] {
    try {
      const data = localStorage.getItem(WATCH_PROGRESS_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Error reading watch progress:', e);
    }
    return [];
  }

  static getWatchProgressForVideo(videoId: string): WatchProgress | null {
    const list = this.getWatchProgressList();
    return list.find(w => w.videoId === videoId) || null;
  }

  static saveWatchProgress(progress: WatchProgress): void {
    const list = this.getWatchProgressList();
    const index = list.findIndex(w => w.videoId === progress.videoId);
    if (index >= 0) {
      list[index] = progress;
    } else {
      list.unshift(progress);
    }
    try {
      localStorage.setItem(WATCH_PROGRESS_KEY, JSON.stringify(list));
    } catch (e) {
      console.error('Error saving watch progress:', e);
    }
  }

  // Exam Mode
  static getExams(): ExamInfo[] {
    try {
      const data = localStorage.getItem(EXAMS_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Error reading exams:', e);
    }
    return [
      {
        id: 'exam_default_1',
        examName: 'Political Science Final Exam',
        examDate: '2026-08-12',
        subjects: ['Political Science'],
        topics: ['Constitution: Why and How', 'Rights in the Indian Constitution', 'Election and Representation']
      }
    ];
  }

  static saveExam(exam: ExamInfo): void {
    const exams = this.getExams();
    const index = exams.findIndex(e => e.id === exam.id);
    if (index >= 0) {
      exams[index] = exam;
    } else {
      exams.unshift(exam);
    }
    try {
      localStorage.setItem(EXAMS_KEY, JSON.stringify(exams));
    } catch (e) {
      console.error('Error saving exam:', e);
    }
  }

  static deleteExam(id: string): void {
    const exams = this.getExams().filter(e => e.id !== id);
    try {
      localStorage.setItem(EXAMS_KEY, JSON.stringify(exams));
    } catch (e) {
      console.error('Error deleting exam:', e);
    }
  }

  // Followed Channels
  static getFollowedChannels(): FollowedChannel[] {
    try {
      const data = localStorage.getItem(FOLLOWED_CHANNELS_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Error reading followed channels:', e);
    }
    return [];
  }

  static isChannelFollowed(channelTitle: string): boolean {
    const followed = this.getFollowedChannels();
    return followed.some(c => c.channelTitle.toLowerCase() === channelTitle.toLowerCase());
  }

  static toggleFollowChannel(channelTitle: string): boolean {
    const followed = this.getFollowedChannels();
    const index = followed.findIndex(c => c.channelTitle.toLowerCase() === channelTitle.toLowerCase());
    let isNowFollowed = false;
    if (index >= 0) {
      followed.splice(index, 1);
      isNowFollowed = false;
    } else {
      followed.push({ channelTitle, followedAt: Date.now() });
      isNowFollowed = true;
    }
    try {
      localStorage.setItem(FOLLOWED_CHANNELS_KEY, JSON.stringify(followed));
    } catch (e) {
      console.error('Error saving followed channels:', e);
    }
    return isNowFollowed;
  }

  // Search History
  static getSearchHistory(): string[] {
    try {
      const data = localStorage.getItem(SEARCH_HISTORY_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Error reading search history:', e);
    }
    return ['Constitution Why and How', 'Fundamental Rights', 'Interior of the Earth Class 11', 'Memory Psychology'];
  }

  static addSearchHistory(query: string): void {
    const trimmed = query.trim();
    if (!trimmed) return;
    let history = this.getSearchHistory().filter(q => q.toLowerCase() !== trimmed.toLowerCase());
    history.unshift(trimmed);
    if (history.length > 15) history = history.slice(0, 15);
    try {
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history));
    } catch (e) {
      console.error('Error saving search history:', e);
    }
  }

  static deleteSearchHistory(query: string): void {
    const history = this.getSearchHistory().filter(q => q !== query);
    try {
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history));
    } catch (e) {
      console.error('Error deleting search history:', e);
    }
  }

  static clearSearchHistory(): void {
    try {
      localStorage.removeItem(SEARCH_HISTORY_KEY);
    } catch (e) {
      console.error('Error clearing search history:', e);
    }
  }

  // Daily Study Goal
  static getDailyGoalMinutes(): number {
    try {
      const data = localStorage.getItem(DAILY_GOAL_KEY);
      if (data) return parseInt(data, 10) || 90;
    } catch (e) {
      // ignore
    }
    return 90; // default 90 mins
  }

  static setDailyGoalMinutes(mins: number): void {
    try {
      localStorage.setItem(DAILY_GOAL_KEY, String(mins));
    } catch (e) {
      // ignore
    }
  }

  // Playback Speed
  static getPlaybackSpeed(): number {
    try {
      const data = localStorage.getItem(PLAYBACK_SPEED_KEY);
      if (data) return parseFloat(data) || 1.0;
    } catch (e) {
      // ignore
    }
    return 1.0;
  }

  static setPlaybackSpeed(speed: number): void {
    try {
      localStorage.setItem(PLAYBACK_SPEED_KEY, String(speed));
    } catch (e) {
      // ignore
    }
  }

  // Achievements
  static getAchievements(stats: UserStats): Achievement[] {
    const totalMins = stats.totalMinutesStudied;
    const streak = stats.currentStreak;
    const sessions = stats.totalSessionsCompleted;

    return [
      {
        id: 'ach_1',
        title: 'First Study Session',
        description: 'Completed your first focused study session',
        icon: 'Sparkles',
        unlockedAt: sessions >= 1 ? Date.now() : null,
        category: 'session'
      },
      {
        id: 'ach_2',
        title: '1 Hour Studied',
        description: 'Accumulated over 60 minutes of study time',
        icon: 'Clock',
        unlockedAt: totalMins >= 60 ? Date.now() : null,
        category: 'time'
      },
      {
        id: 'ach_3',
        title: '10 Hours Studied',
        description: 'Accumulated over 600 minutes of deep study',
        icon: 'Award',
        unlockedAt: totalMins >= 600 ? Date.now() : null,
        category: 'time'
      },
      {
        id: 'ach_4',
        title: '7-Day Streak',
        description: 'Maintained a 7-day consistent study streak',
        icon: 'Flame',
        unlockedAt: streak >= 7 ? Date.now() : null,
        category: 'streak'
      },
      {
        id: 'ach_5',
        title: '30-Day Streak',
        description: 'Incredible dedication with a 30-day streak',
        icon: 'Zap',
        unlockedAt: streak >= 30 ? Date.now() : null,
        category: 'streak'
      }
    ];
  }

  // Duration Cache
  static getDurationCache(): { [videoId: string]: string } {
    try {
      const data = localStorage.getItem('studytube_duration_cache');
      return data ? JSON.parse(data) : {};
    } catch (e) {
      return {};
    }
  }

  static cacheDuration(videoId: string, duration: string): void {
    if (!videoId || !duration) return;
    try {
      const cache = this.getDurationCache();
      cache[videoId] = duration;
      localStorage.setItem('studytube_duration_cache', JSON.stringify(cache));
    } catch (e) {
      // ignore
    }
  }

  static cacheDurations(map: { [videoId: string]: string }): void {
    try {
      const cache = this.getDurationCache();
      let changed = false;
      for (const [id, dur] of Object.entries(map)) {
        if (id && dur && cache[id] !== dur) {
          cache[id] = dur;
          changed = true;
        }
      }
      if (changed) {
        localStorage.setItem('studytube_duration_cache', JSON.stringify(cache));
      }
    } catch (e) {
      // ignore
    }
  }

  static getNotificationSettings(): NotificationSettings {
    try {
      const data = localStorage.getItem(NOTIFICATION_SETTINGS_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        return {
          enabled: typeof parsed.enabled === 'boolean' ? parsed.enabled : DEFAULT_NOTIFICATION_SETTINGS.enabled,
          studyEnabled: typeof parsed.studyEnabled === 'boolean' ? parsed.studyEnabled : DEFAULT_NOTIFICATION_SETTINGS.studyEnabled,
          motivationEnabled: typeof parsed.motivationEnabled === 'boolean' ? parsed.motivationEnabled : DEFAULT_NOTIFICATION_SETTINGS.motivationEnabled,
          streakEnabled: typeof parsed.streakEnabled === 'boolean' ? parsed.streakEnabled : DEFAULT_NOTIFICATION_SETTINGS.streakEnabled,
          examEnabled: typeof parsed.examEnabled === 'boolean' ? parsed.examEnabled : DEFAULT_NOTIFICATION_SETTINGS.examEnabled,
          goalEnabled: typeof parsed.goalEnabled === 'boolean' ? parsed.goalEnabled : DEFAULT_NOTIFICATION_SETTINGS.goalEnabled,
          language: parsed.language || DEFAULT_NOTIFICATION_SETTINGS.language,
          frequencyMinutes: typeof parsed.frequencyMinutes === 'number' ? parsed.frequencyMinutes : DEFAULT_NOTIFICATION_SETTINGS.frequencyMinutes,
          customMessages: Array.isArray(parsed.customMessages) ? parsed.customMessages : DEFAULT_NOTIFICATION_SETTINGS.customMessages,
        };
      }
    } catch (e) {
      console.error('Error reading notification settings:', e);
    }
    return DEFAULT_NOTIFICATION_SETTINGS;
  }

  static saveNotificationSettings(settings: NotificationSettings): void {
    try {
      localStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Error saving notification settings:', e);
    }
  }
}

