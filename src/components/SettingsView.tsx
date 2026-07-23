import React, { useState, useEffect } from 'react';
import { ShieldAlert, EyeOff, Ban, Trash2, CheckCircle2, RotateCcw, Sliders, Moon, Sun, Cloud, User, LogIn, LogOut, RefreshCw, Lock, ShieldCheck, Smartphone, X, Search, Loader2, Bell, Plus, Edit, Globe } from 'lucide-react';
import { StorageService } from '../services/storageService';
import { CloudSyncService, StudyUser } from '../services/cloudSyncService';
import { EDUCATIONAL_CATALOG } from '../data/educationalCatalog';
import { VideoService } from '../services/videoService';
import { PermanentBlockConfirmModal } from './PermanentBlockConfirmModal';
import { NotificationSettings } from '../types';

interface SettingsViewProps {
  hiddenVideos: string[];
  blockedChannels: string[];
  onRestoreVideo: (videoId: string) => void;
  onUnblockChannel: (channelTitle: string) => void;
  onClearHistory: () => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  onDataSynced?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  hiddenVideos,
  blockedChannels,
  onRestoreVideo,
  onUnblockChannel,
  onClearHistory,
  darkMode,
  setDarkMode,
  onDataSynced
}) => {
  const [clearedNotice, setClearedNotice] = useState(false);
  const [currentUser, setCurrentUser] = useState<StudyUser | null>(CloudSyncService.getCurrentUser());
  const [lastSynced, setLastSynced] = useState<string | null>(CloudSyncService.getLastSynced());
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  
  const [emailInput, setEmailInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [showEmailLogin, setShowEmailLogin] = useState(false);

  const [uninstallProtection, setUninstallProtection] = useState<boolean>(CloudSyncService.getUninstallProtection());
  const [showDeviceAdminModal, setShowDeviceAdminModal] = useState(false);

  // Advanced educational blocks state
  const [blockedKeywords, setBlockedKeywords] = useState<string[]>(StorageService.getBlockedKeywords());
  const [completelyBlockedChannels, setCompletelyBlockedChannels] = useState<{ id: string; title: string; thumbnailUrl?: string }[]>(StorageService.getCompletelyBlockedChannels());

  // Input fields for adding custom blocks
  const [newKeyword, setNewKeyword] = useState('');

  // Channel Search & Confirmation Modal states
  const [channelSearchQuery, setChannelSearchQuery] = useState('');
  const [channelSuggestions, setChannelSuggestions] = useState<{ channelId: string; channelTitle: string; thumbnailUrl: string }[]>([]);
  const [isSearchingChannels, setIsSearchingChannels] = useState(false);

  // Modal confirmation states
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [confirmType, setConfirmType] = useState<'keyword' | 'channel'>('keyword');
  const [pendingBlockKeyword, setPendingBlockKeyword] = useState('');
  const [pendingBlockChannel, setPendingBlockChannel] = useState<{ id: string; title: string; thumbnailUrl: string } | null>(null);

  // Notification states
  const [notificationConfig, setNotificationConfig] = useState<NotificationSettings>(StorageService.getNotificationSettings());
  const [newCustomMessage, setNewCustomMessage] = useState('');
  const [editingMessageIdx, setEditingMessageIdx] = useState<number | null>(null);
  const [editingMessageText, setEditingMessageText] = useState('');

  const handleSaveNotificationConfig = (updated: NotificationSettings) => {
    setNotificationConfig(updated);
    StorageService.saveNotificationSettings(updated);
    if (onDataSynced) onDataSynced();
    if (currentUser) {
      CloudSyncService.syncToCloud().then(({ timestamp }) => {
        setLastSynced(timestamp);
      });
    }
  };

  const handleTriggerTestNotification = () => {
    window.dispatchEvent(new CustomEvent('studytube-notification', {
      detail: {
        title: "⚡ Smart StudyTube Test!",
        body: "Your study and motivational reminders are active! English and Hindi alerts will boost your focus."
      }
    }));
  };

  useEffect(() => {
    setCurrentUser(CloudSyncService.getCurrentUser());
    setLastSynced(CloudSyncService.getLastSynced());
  }, []);

  // Fetch channel suggestions debounced
  useEffect(() => {
    if (!channelSearchQuery.trim()) {
      setChannelSuggestions([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setIsSearchingChannels(true);
      try {
        const results = await VideoService.searchChannels(channelSearchQuery);
        setChannelSuggestions(results);
      } catch (err) {
        console.error('Error searching channels:', err);
      } finally {
        setIsSearchingChannels(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [channelSearchQuery]);

  const handleAddKeyword = (e: React.FormEvent) => {
    e.preventDefault();
    const kw = newKeyword.trim();
    if (!kw) return;
    setPendingBlockKeyword(kw);
    setConfirmType('keyword');
    setConfirmModalOpen(true);
  };

  const handleConfirmKeywordBlock = () => {
    if (!pendingBlockKeyword) return;
    StorageService.addBlockedKeyword(pendingBlockKeyword);
    setBlockedKeywords(StorageService.getBlockedKeywords());
    setNewKeyword('');
    setPendingBlockKeyword('');
    if (onDataSynced) onDataSynced();
    if (currentUser) {
      CloudSyncService.syncToCloud().then(({ timestamp }) => {
        setLastSynced(timestamp);
      });
    }
  };

  const handleSelectChannelToBlock = (channel: { channelId: string; channelTitle: string; thumbnailUrl: string }) => {
    setPendingBlockChannel({ id: channel.channelId, title: channel.channelTitle, thumbnailUrl: channel.thumbnailUrl });
    setConfirmType('channel');
    setConfirmModalOpen(true);
  };

  const handleConfirmChannelBlock = () => {
    if (!pendingBlockChannel) return;
    StorageService.blockChannelCompletely(
      pendingBlockChannel.id, 
      pendingBlockChannel.title, 
      pendingBlockChannel.thumbnailUrl
    );
    setCompletelyBlockedChannels(StorageService.getCompletelyBlockedChannels());
    setChannelSearchQuery('');
    setChannelSuggestions([]);
    setPendingBlockChannel(null);
    if (onDataSynced) onDataSynced();
    if (currentUser) {
      CloudSyncService.syncToCloud().then(({ timestamp }) => {
        setLastSynced(timestamp);
      });
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const user = await CloudSyncService.signInWithGoogle();
      setCurrentUser(user);
      setLastSynced(CloudSyncService.getLastSynced());
      setSyncMessage('Successfully signed in with Google and synced cloud data.');
      if (onDataSynced) onDataSynced();
      setTimeout(() => setSyncMessage(null), 4000);
    } catch (e: any) {
      alert('Google Sign-In failed: ' + e.message);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    try {
      const user = await CloudSyncService.signInWithEmail(emailInput.trim(), nameInput.trim() || 'StudyTube Scholar');
      setCurrentUser(user);
      setLastSynced(CloudSyncService.getLastSynced());
      setEmailInput('');
      setNameInput('');
      setShowEmailLogin(false);
      setSyncMessage('Signed in successfully. Cloud data backed up.');
      if (onDataSynced) onDataSynced();
      setTimeout(() => setSyncMessage(null), 4000);
    } catch (e: any) {
      alert('Sign in failed: ' + e.message);
    }
  };

  const handleSignOut = () => {
    if (window.confirm('Are you sure you want to sign out? Your local data remains intact.')) {
      CloudSyncService.signOut();
      setCurrentUser(null);
      setLastSynced(null);
      setSyncMessage('Signed out successfully.');
      setTimeout(() => setSyncMessage(null), 3000);
    }
  };

  const handleSyncNow = async () => {
    if (!currentUser) return;
    setIsSyncing(true);
    setSyncMessage(null);
    try {
      const res = await CloudSyncService.syncToCloud();
      setLastSynced(res.timestamp);
      // Also test pull restore
      await CloudSyncService.restoreFromCloud();
      if (onDataSynced) onDataSynced();
      setSyncMessage('Cloud sync completed successfully! All streaks, stats, and preferences backed up.');
    } catch (e: any) {
      setSyncMessage('Sync error: ' + e.message);
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncMessage(null), 4000);
    }
  };

  const handleToggleUninstallProtection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.checked;
    if (val) {
      setShowDeviceAdminModal(true);
    } else {
      setUninstallProtection(false);
      CloudSyncService.setUninstallProtection(false);
    }
  };

  const confirmUninstallProtection = () => {
    setUninstallProtection(true);
    CloudSyncService.setUninstallProtection(true);
    setShowDeviceAdminModal(false);
  };

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear all hidden videos, blocked channels, keywords, and completely blocked channels history?')) {
      onClearHistory();
      StorageService.clearBlockedKeywords();
      StorageService.clearCompletelyBlockedChannels();
      setBlockedKeywords([]);
      setCompletelyBlockedChannels([]);
      setClearedNotice(true);
      setTimeout(() => setClearedNotice(false), 3000);
      if (currentUser) {
        CloudSyncService.syncToCloud().then(({ timestamp }) => {
          setLastSynced(timestamp);
        });
      }
    }
  };

  const savedVideos = StorageService.getSavedVideos();

  const getVideoTitle = (id: string) => {
    const foundCatalog = EDUCATIONAL_CATALOG.find(v => v.id === id);
    if (foundCatalog) return foundCatalog.title;
    const foundSaved = savedVideos.find(v => v.id === id);
    if (foundSaved) return foundSaved.title;
    return `Video ID: ${id}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Sliders className="w-5 h-5 text-indigo-400" />
          StudyTube Settings & Cloud Sync
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Manage your account, cloud backup, distraction-free preferences, and uninstall protection safeguards.
        </p>
      </div>

      {syncMessage && (
        <div className="p-4 bg-indigo-500/10 border border-indigo-500/30 text-indigo-200 text-xs rounded-2xl flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0" />
          <span>{syncMessage}</span>
        </div>
      )}

      {/* Account & Cloud Backup/Sync Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Cloud className="w-5 h-5 text-indigo-400" />
              Account & Cloud Backup
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Sync your study streaks, statistics, history, and preferences across devices so they survive uninstalls.
            </p>
          </div>
        </div>

        {!currentUser ? (
          <div className="space-y-4 p-5 bg-slate-950 rounded-2xl border border-slate-800">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-white">Sign in to back up your StudyTube data</h4>
                <p className="text-xs text-slate-400 mt-0.5">Protect your study progress, streaks, and settings in the cloud.</p>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={handleGoogleSignIn}
                  className="flex-1 sm:flex-none px-5 py-2.5 bg-white hover:bg-slate-100 text-slate-900 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md"
                >
                  <LogIn className="w-4 h-4 text-indigo-600" />
                  Sign in with Google
                </button>
                <button
                  onClick={() => setShowEmailLogin(!showEmailLogin)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all"
                >
                  Email
                </button>
              </div>
            </div>

            {showEmailLogin && (
              <form onSubmit={handleEmailSignIn} className="pt-4 border-t border-slate-800 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <input
                    type="email"
                    required
                    placeholder="student@example.com"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowEmailLogin(false)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md"
                  >
                    Create Account & Sync
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          <div className="space-y-4 p-5 bg-slate-950 rounded-2xl border border-slate-800">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center font-bold text-lg overflow-hidden">
                  {currentUser.photoUrl ? (
                    <img src={currentUser.photoUrl} alt={currentUser.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <User className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white">{currentUser.name}</h4>
                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold rounded-full">
                      Synced
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">{currentUser.email}</p>
                  {lastSynced && (
                    <p className="text-[10px] text-slate-500 mt-1">Last successful cloud sync: {lastSynced}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  onClick={handleSyncNow}
                  disabled={isSyncing}
                  className="flex-1 sm:flex-none px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  {isSyncing ? 'Syncing...' : 'Sync Now'}
                </button>
                <button
                  onClick={handleSignOut}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-rose-400 border border-rose-500/20 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                  title="Sign out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Android Uninstall Protection & Session Safeguard */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-amber-400" />
              Uninstall Protection & Study Safeguards
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Prevent impulsive uninstalls or distraction abandonment during active study hours.
            </p>
          </div>
        </div>

        <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-200">Enable Uninstall Protection Safeguard</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Requires confirmation and explains Android App Pinning / Device Admin rules.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={uninstallProtection}
                onChange={handleToggleUninstallProtection}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {uninstallProtection && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-200 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Uninstall Protection Active</p>
                <p className="text-[11px] text-amber-300/90 mt-0.5">
                  StudyTube session locks and Android App Pinning recommendations are enabled to help you maintain your focus streak.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Device Admin / Uninstall Explanation Modal */}
      {showDeviceAdminModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Android Uninstall Protection Policy</h3>
                <p className="text-xs text-slate-400">Official Android system specifications & compliance</p>
              </div>
            </div>

            <div className="text-xs text-slate-300 space-y-3 leading-relaxed bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <p>
                <strong>How Android handles uninstalls:</strong> Modern Android security policy restricts ordinary user-installed applications from directly blocking OS uninstalls without Device Owner / Enterprise MDM provisioning.
              </p>
              <p>
                To provide the strongest compliant safeguard, StudyTube enables:
              </p>
              <ul className="list-disc pl-4 space-y-1 text-slate-400">
                <li><strong>Cloud Backup Sync:</strong> Ensures your streaks and stats survive any uninstalls or device changes.</li>
                <li><strong>App Pinning Reminder:</strong> Guides you to use Android's built-in Recents App Pinning feature to lock StudyTube during study sessions.</li>
                <li><strong>Session Exit Confirmation:</strong> Prompts you when attempting to abandon an active study timer.</li>
              </ul>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeviceAdminModal(false)}
                className="px-4 py-2.5 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded-xl text-xs font-bold transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmUninstallProtection}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md"
              >
                Enable Safeguards
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden & Distracting Content Management Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <EyeOff className="w-5 h-5 text-amber-400" />
              Hidden & Distracting Content
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Permanently personalized feedback history. Videos and channels you marked as distracting or not interested.
            </p>
          </div>
          {(hiddenVideos.length > 0 || blockedChannels.length > 0) && (
            <button
              onClick={handleClear}
              className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear All History
            </button>
          )}
        </div>

        {clearedNotice && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Distracting content history successfully cleared.
          </div>
        )}

        {/* Hidden Videos List */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Hidden Videos ({hiddenVideos.length})</span>
          </h4>

          {hiddenVideos.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-3 px-4 bg-slate-950/50 rounded-2xl border border-slate-800">
              No hidden videos. Videos marked as "Not interested / Distracting" will appear here.
            </p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {hiddenVideos.map((id) => (
                <div key={id} className="flex items-center justify-between p-3 bg-slate-950 rounded-2xl border border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                      <EyeOff className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-200 line-clamp-1">{getVideoTitle(id)}</p>
                      <p className="text-[10px] text-slate-500 font-mono">ID: {id}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => onRestoreVideo(id)}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-all flex items-center gap-1 shrink-0"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Restore
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Blocked Channels List */}
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Blocked Recommendation Channels ({blockedChannels.length})
          </h4>

          {blockedChannels.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-3 px-4 bg-slate-950/50 rounded-2xl border border-slate-800">
              No soft-blocked channels. Channels you select "Don't recommend channel" for on Home will appear here.
            </p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {blockedChannels.map((channel) => (
                <div key={channel} className="flex items-center justify-between p-3 bg-slate-950 rounded-2xl border border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center shrink-0">
                      <Ban className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-200">{channel}</p>
                      <p className="text-[10px] text-slate-400">Soft hidden from recommendation rows</p>
                    </div>
                  </div>
                  <button
                    onClick={() => onUnblockChannel(channel)}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-all flex items-center gap-1 shrink-0"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Unblock
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Completely Blocked Channels List with Search & Suggestions */}
        <div className="space-y-3 pt-4 border-t border-slate-800/60">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Permanently Blocked Channels ({completelyBlockedChannels.length})
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              These channels are authoritatively blocked from appearing in search, home, related videos, or playing.
            </p>
          </div>

          {/* Channel Search Input with Auto-suggestions */}
          <div className="relative space-y-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Type YouTube channel name to block... (e.g. Ashish Chanchlani)"
                value={channelSearchQuery}
                onChange={(e) => setChannelSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500/50"
              />
              <div className="absolute left-3 top-3 text-slate-500">
                {isSearchingChannels ? (
                  <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </div>
            </div>

            {/* Suggestions dropdown */}
            {channelSuggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-12 z-30 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto divide-y divide-slate-800/60">
                {channelSuggestions.map((ch) => (
                  <button
                    key={ch.channelId}
                    type="button"
                    onClick={() => handleSelectChannelToBlock({ channelId: ch.channelId, channelTitle: ch.channelTitle, thumbnailUrl: ch.thumbnailUrl })}
                    className="w-full px-4 py-3 text-left hover:bg-slate-950 flex items-center gap-3 transition-colors text-xs text-slate-200"
                  >
                    <img
                      src={ch.thumbnailUrl}
                      alt={ch.channelTitle}
                      referrerPolicy="no-referrer"
                      className="w-8 h-8 rounded-full border border-slate-800 shrink-0 object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white truncate">{ch.channelTitle}</p>
                      <p className="text-[10px] text-slate-500 truncate font-mono">ID: {ch.channelId}</p>
                    </div>
                    <span className="text-[10px] bg-red-500/15 text-red-400 font-bold px-2.5 py-1 rounded-xl border border-red-500/20">
                      Block
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {completelyBlockedChannels.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-3 px-4 bg-slate-950/50 rounded-2xl border border-slate-800">
              No channels permanently blocked. Search above to permanently block a channel.
            </p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {completelyBlockedChannels.map((ch) => (
                <div key={ch.id} className="flex items-center justify-between p-3 bg-slate-950 rounded-2xl border border-slate-800">
                  <div className="flex items-center gap-3">
                    <img
                      src={ch.thumbnailUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(ch.title)}`}
                      alt={ch.title}
                      referrerPolicy="no-referrer"
                      className="w-8 h-8 rounded-full border border-slate-800 shrink-0 object-cover"
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-200">{ch.title}</p>
                      <span className="inline-block mt-0.5 text-[9px] bg-rose-500/10 text-rose-400 font-semibold px-1.5 py-0.5 rounded border border-rose-500/20">
                        Permanently Blocked
                      </span>
                    </div>
                  </div>
                  {/* Informational - No ordinary unblock controls! */}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Blocked Keywords/Topics List with Direct Input */}
        <div className="space-y-3 pt-4 border-t border-slate-800/60">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Permanently Blocked Keywords & Topics ({blockedKeywords.length})
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Searches or videos containing these words/phrases are blocked instantly. This is irreversible.
            </p>
          </div>

          {/* Add Keyword Form */}
          <form onSubmit={handleAddKeyword} className="flex gap-2 bg-slate-950 p-3 rounded-2xl border border-slate-800/80">
            <input
              type="text"
              required
              placeholder="Enter word or phrase to permanently block..."
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500/50"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shrink-0"
            >
              Block Keyword
            </button>
          </form>

          {blockedKeywords.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-3 px-4 bg-slate-950/50 rounded-2xl border border-slate-800">
              No custom keywords blocked. Use the form above to add keyword filters.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2 pt-1 max-h-48 overflow-y-auto">
              {blockedKeywords.map((kw) => (
                <div
                  key={kw}
                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-950 text-xs text-slate-300 border border-slate-800 rounded-xl"
                >
                  <span className="font-semibold text-rose-400">"{kw}"</span>
                  <span className="text-[10px] text-slate-500 font-medium bg-slate-900 px-1.5 py-0.5 rounded-md border border-slate-800">
                    Permanently Blocked
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Study Reminders & Smart Notifications Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Bell className="w-5 h-5 text-indigo-400" />
              Study Reminders & Smart Notifications
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Set bilingual alerts, custom motivational mantras, and streak safety alerts to double your concentration.
            </p>
          </div>
          <button
            onClick={handleTriggerTestNotification}
            className="px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-xl text-xs font-bold transition-all"
          >
            Test Alert Now
          </button>
        </div>

        {/* Master Switch */}
        <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-200">Enable Smart Study Reminders</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Allows StudyTube to run background intervals and trigger timely focus reminders.</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={notificationConfig.enabled}
              onChange={(e) => handleSaveNotificationConfig({ ...notificationConfig, enabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
        </div>

        {notificationConfig.enabled && (
          <div className="space-y-6 animate-fade-in">
            {/* Configuration Options Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Language Settings */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-indigo-400" />
                  Alert Language Preference
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['en', 'hi', 'both'] as const).map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => handleSaveNotificationConfig({ ...notificationConfig, language: lang })}
                      className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                        notificationConfig.language === lang
                          ? 'bg-indigo-600/25 border-indigo-500 text-white shadow-md'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {lang === 'en' ? 'English' : lang === 'hi' ? 'Hindi (हिंदी)' : 'Both (मिश्रित)'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Interval / Frequency */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-indigo-400" />
                  Notification Frequency
                </label>
                <select
                  value={notificationConfig.frequencyMinutes}
                  onChange={(e) => handleSaveNotificationConfig({ ...notificationConfig, frequencyMinutes: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value={15}>Every 15 Minutes (High focus checks)</option>
                  <option value={30}>Every 30 Minutes (Recommended)</option>
                  <option value={60}>Every 1 Hour (Standard checks)</option>
                  <option value={120}>Every 2 Hours (Gentle reminders)</option>
                </select>
              </div>
            </div>

            {/* Notification Categories Toggles */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Notification Types</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {/* Study Reminders */}
                <div className="flex items-center justify-between p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <div>
                    <p className="text-xs font-bold text-slate-200">Study Call Alerts</p>
                    <p className="text-[10px] text-slate-500">NCERT/CBSE check-ins</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationConfig.studyEnabled}
                    onChange={(e) => handleSaveNotificationConfig({ ...notificationConfig, studyEnabled: e.target.checked })}
                    className="rounded border-slate-800 text-indigo-600 bg-slate-950 focus:ring-indigo-500"
                  />
                </div>

                {/* Motivational boosters */}
                <div className="flex items-center justify-between p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <div>
                    <p className="text-xs font-bold text-slate-200">Motivational Boosters</p>
                    <p className="text-[10px] text-slate-500">Quotes & custom mantras</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationConfig.motivationEnabled}
                    onChange={(e) => handleSaveNotificationConfig({ ...notificationConfig, motivationEnabled: e.target.checked })}
                    className="rounded border-slate-800 text-indigo-600 bg-slate-950 focus:ring-indigo-500"
                  />
                </div>

                {/* Streak safety */}
                <div className="flex items-center justify-between p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <div>
                    <p className="text-xs font-bold text-slate-200">Streak Shields</p>
                    <p className="text-[10px] text-slate-500">Streak broken warnings</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationConfig.streakEnabled}
                    onChange={(e) => handleSaveNotificationConfig({ ...notificationConfig, streakEnabled: e.target.checked })}
                    className="rounded border-slate-800 text-indigo-600 bg-slate-950 focus:ring-indigo-500"
                  />
                </div>

                {/* Exam alerts */}
                <div className="flex items-center justify-between p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <div>
                    <p className="text-xs font-bold text-slate-200">Exam Countdowns</p>
                    <p className="text-[10px] text-slate-500">Schedules and topics</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationConfig.examEnabled}
                    onChange={(e) => handleSaveNotificationConfig({ ...notificationConfig, examEnabled: e.target.checked })}
                    className="rounded border-slate-800 text-indigo-600 bg-slate-950 focus:ring-indigo-500"
                  />
                </div>

                {/* Daily Goal alerts */}
                <div className="flex items-center justify-between p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <div>
                    <p className="text-xs font-bold text-slate-200">Goal Progress Alerts</p>
                    <p className="text-[10px] text-slate-500">Smart goal trackers</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationConfig.goalEnabled}
                    onChange={(e) => handleSaveNotificationConfig({ ...notificationConfig, goalEnabled: e.target.checked })}
                    className="rounded border-slate-800 text-indigo-600 bg-slate-950 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Custom Messages Section */}
            <div className="space-y-4 pt-2 border-t border-slate-800/60">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Custom Motivation & Mantras</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Write your personal study triggers or reminders. These will be randomly sent to push you into deep focus.</p>
              </div>

              {/* Add Custom Mantra Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const val = newCustomMessage.trim();
                  if (!val) return;
                  handleSaveNotificationConfig({
                    ...notificationConfig,
                    customMessages: [...notificationConfig.customMessages, val]
                  });
                  setNewCustomMessage('');
                }}
                className="flex gap-2 bg-slate-950 p-3 rounded-2xl border border-slate-800"
              >
                <input
                  type="text"
                  required
                  placeholder="Write a custom reminder (e.g., 'Aapka target IAS hai! Mobile door rakho.')"
                  value={newCustomMessage}
                  onChange={(e) => setNewCustomMessage(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shrink-0 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Mantra
                </button>
              </form>

              {/* Custom Mantras List */}
              {notificationConfig.customMessages.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {notificationConfig.customMessages.map((msg, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-slate-950 rounded-2xl border border-slate-800 gap-3">
                      <div className="flex-1 min-w-0">
                        {editingMessageIdx === idx ? (
                          <input
                            type="text"
                            value={editingMessageText}
                            onChange={(e) => setEditingMessageText(e.target.value)}
                            onBlur={() => {
                              const updated = [...notificationConfig.customMessages];
                              updated[idx] = editingMessageText.trim();
                              handleSaveNotificationConfig({ ...notificationConfig, customMessages: updated });
                              setEditingMessageIdx(null);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                const updated = [...notificationConfig.customMessages];
                                updated[idx] = editingMessageText.trim();
                                handleSaveNotificationConfig({ ...notificationConfig, customMessages: updated });
                                setEditingMessageIdx(null);
                              }
                            }}
                            autoFocus
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-indigo-500"
                          />
                        ) : (
                          <p className="text-xs text-slate-200 line-clamp-1 italic font-medium">"{msg}"</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {editingMessageIdx !== idx ? (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingMessageIdx(idx);
                              setEditingMessageText(msg);
                            }}
                            className="p-1.5 hover:bg-slate-900 rounded-lg text-slate-400 hover:text-indigo-400 transition-colors"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...notificationConfig.customMessages];
                            updated.splice(idx, 1);
                            handleSaveNotificationConfig({ ...notificationConfig, customMessages: updated });
                          }}
                          className="p-1.5 hover:bg-slate-900 rounded-lg text-slate-400 hover:text-rose-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic py-3 px-4 bg-slate-950/50 rounded-2xl border border-slate-800">
                  No custom reminders added. Add your custom mantras above!
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* App Appearance & Guardrails */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white">App Preferences</h3>
        <div className="flex items-center justify-between p-4 bg-slate-950 rounded-2xl border border-slate-800">
          <div>
            <p className="text-xs font-bold text-slate-200">Dark Mode Theme</p>
            <p className="text-[11px] text-slate-400">Optimized eye-safe night study appearance</p>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-indigo-400 border border-slate-700 transition-all"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          </button>
        </div>
      </div>

      <PermanentBlockConfirmModal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={confirmType === 'keyword' ? handleConfirmKeywordBlock : handleConfirmChannelBlock}
        targetName={confirmType === 'keyword' ? pendingBlockKeyword : (pendingBlockChannel?.title || '')}
        type={confirmType}
      />

    </div>
  );
};

