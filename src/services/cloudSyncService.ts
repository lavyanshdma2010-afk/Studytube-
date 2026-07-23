export interface StudyUser {
  uid: string;
  email: string;
  name: string;
  photoUrl?: string;
  provider: 'google' | 'email';
}

export interface CloudUserData {
  user: StudyUser | null;
  lastSynced: string | null;
  stats: any;
  sessions: any[];
  timerConfig: any;
  savedVideos: any[];
  hiddenVideos: string[];
  blockedChannels: string[];
  uninstallProtectionEnabled: boolean;
}

const AUTH_USER_KEY = 'studytube_auth_user';
const SYNC_DATA_KEY = 'studytube_cloud_sync_data';
const LAST_SYNC_KEY = 'studytube_last_synced_at';
const UNINSTALL_PROTECTION_KEY = 'studytube_uninstall_protection';

export class CloudSyncService {
  static getCurrentUser(): StudyUser | null {
    try {
      const data = localStorage.getItem(AUTH_USER_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Error reading auth user:', e);
    }
    return null;
  }

  static setCurrentUser(user: StudyUser | null): void {
    try {
      if (user) {
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(AUTH_USER_KEY);
      }
    } catch (e) {
      console.error('Error setting auth user:', e);
    }
  }

  static getLastSynced(): string | null {
    try {
      return localStorage.getItem(LAST_SYNC_KEY);
    } catch (e) {
      return null;
    }
  }

  static getUninstallProtection(): boolean {
    try {
      return localStorage.getItem(UNINSTALL_PROTECTION_KEY) === 'true';
    } catch (e) {
      return false;
    }
  }

  static setUninstallProtection(enabled: boolean): void {
    try {
      localStorage.setItem(UNINSTALL_PROTECTION_KEY, String(enabled));
    } catch (e) {
      console.error('Error saving uninstall protection:', e);
    }
  }

  static async signInWithGoogle(): Promise<StudyUser> {
    // Simulated secure Google OAuth sign-in for StudyTube
    const user: StudyUser = {
      uid: `google_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      email: 'student.scholar@gmail.com',
      name: 'Scholar Student',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      provider: 'google'
    };
    this.setCurrentUser(user);
    await this.syncToCloud();
    return user;
  }

  static async signInWithEmail(email: string, name: string = 'StudyTube Scholar'): Promise<StudyUser> {
    const user: StudyUser = {
      uid: `email_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      email,
      name,
      provider: 'email'
    };
    this.setCurrentUser(user);
    await this.syncToCloud();
    return user;
  }

  static signOut(): void {
    localStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem(LAST_SYNC_KEY);
  }

  static async syncToCloud(): Promise<{ success: boolean; timestamp: string }> {
    const user = this.getCurrentUser();
    if (!user) {
      throw new Error('No user signed in');
    }

    const payload = {
      uid: user.uid,
      email: user.email,
      stats: JSON.parse(localStorage.getItem('studytube_user_stats') || '{}'),
      sessions: JSON.parse(localStorage.getItem('studytube_study_sessions') || '[]'),
      timerConfig: JSON.parse(localStorage.getItem('studytube_timer_config') || '{}'),
      savedVideos: JSON.parse(localStorage.getItem('studytube_saved_videos') || '[]'),
      hiddenVideos: JSON.parse(localStorage.getItem('studytube_hidden_videos') || '[]'),
      blockedChannels: JSON.parse(localStorage.getItem('studytube_blocked_channels') || '[]'),
      blockedKeywords: JSON.parse(localStorage.getItem('studytube_blocked_keywords') || '[]'),
      completelyBlockedChannels: JSON.parse(localStorage.getItem('studytube_completely_blocked_channels') || '[]'),
      uninstallProtectionEnabled: this.getUninstallProtection()
    };

    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
      const response = await fetch(`${baseUrl}/api/sync/push`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        throw new Error('Cloud sync server error');
      }
    } catch (e) {
      console.warn('Cloud sync offline fallback (saved locally):', e);
    }

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' ' + new Date().toLocaleDateString();
    localStorage.setItem(LAST_SYNC_KEY, timestamp);
    return { success: true, timestamp };
  }

  static async restoreFromCloud(): Promise<boolean> {
    const user = this.getCurrentUser();
    if (!user) return false;

    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
      const response = await fetch(`${baseUrl}/api/sync/pull?uid=${encodeURIComponent(user.uid)}`);
      if (response.ok) {
        const data = await response.json();
        if (data && data.stats) {
          localStorage.setItem('studytube_user_stats', JSON.stringify(data.stats));
          localStorage.setItem('studytube_study_sessions', JSON.stringify(data.sessions || []));
          localStorage.setItem('studytube_timer_config', JSON.stringify(data.timerConfig || {}));
          localStorage.setItem('studytube_saved_videos', JSON.stringify(data.savedVideos || []));
          localStorage.setItem('studytube_hidden_videos', JSON.stringify(data.hiddenVideos || []));
          localStorage.setItem('studytube_blocked_channels', JSON.stringify(data.blockedChannels || []));
          localStorage.setItem('studytube_blocked_keywords', JSON.stringify(data.blockedKeywords || []));
          localStorage.setItem('studytube_completely_blocked_channels', JSON.stringify(data.completelyBlockedChannels || []));
          if (data.uninstallProtectionEnabled !== undefined) {
            localStorage.setItem(UNINSTALL_PROTECTION_KEY, String(data.uninstallProtectionEnabled));
          }
          return true;
        }
      }
    } catch (e) {
      console.warn('Could not pull from cloud, using local cache:', e);
    }
    return false;
  }
}
