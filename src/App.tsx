import React, { useState, useEffect, useRef } from 'react';
import { Search, ShieldAlert, Sparkles, Clock, Bookmark, BookOpen, AlertCircle, RefreshCw, Flame, ShieldCheck, Download, Mic, MicOff, Sliders, X, Calendar, FolderPlus, Ban, Bell } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { CategoryChips } from './components/CategoryChips';
import { VideoCard } from './components/VideoCard';
import { VideoPlayerModal } from './components/VideoPlayerModal';
import { StudyTimer } from './components/StudyTimer';
import { StatisticsView } from './components/StatisticsView';
import { SettingsView } from './components/SettingsView';
import { FocusModeModal } from './components/FocusModeModal';
import { AndroidExporter } from './components/AndroidExporter';
import { ErrorBoundary } from './components/ErrorBoundary';
import { PlaylistsModal } from './components/PlaylistsModal';
import { ExamModeModal } from './components/ExamModeModal';
import { ContinueWatchingRow } from './components/ContinueWatchingRow';
import { SubjectDashboardView } from './components/SubjectDashboardView';

import { VideoItem, SubjectCategory, UserStats } from './types';
import { VideoService } from './services/videoService';
import { StorageService } from './services/storageService';
import { CloudSyncService } from './services/cloudSyncService';
import { EDUCATIONAL_CATALOG } from './data/educationalCatalog';
import { dispatchNotification } from './services/notificationService';
import { checkExplicitContent } from './utils/explicitFilter';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'timer' | 'stats' | 'bookmarks' | 'subjects' | 'settings'>('home');
  const [darkMode, setDarkMode] = useState(true);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<SubjectCategory>('All');
  const [selectedExam, setSelectedExam] = useState<string>('General');

  // Video results state
  const [videos, setVideos] = useState<VideoItem[]>(() => 
    EDUCATIONAL_CATALOG.filter(v => 
      !checkExplicitContent(v.title).blocked && 
      !checkExplicitContent(v.description).blocked &&
      !checkExplicitContent(v.channelTitle || '').blocked
    ).map(v => ({ ...v }))
  );
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockedMessage, setBlockedMessage] = useState('');

  // Personalization: Hidden videos & Blocked channels
  const [hiddenVideos, setHiddenVideos] = useState<string[]>(StorageService.getHiddenVideos());
  const [blockedChannels, setBlockedChannels] = useState<string[]>(StorageService.getBlockedChannels());

  // Voice Search state
  const [isListening, setIsListening] = useState(false);

  // Modals & Selected Video
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [playbackBlockedError, setPlaybackBlockedError] = useState<string | null>(null);
  const [savedVideos, setSavedVideos] = useState<VideoItem[]>(StorageService.getSavedVideos());
  const [isFocusModeOpen, setIsFocusModeOpen] = useState(false);
  const [isAndroidExportOpen, setIsAndroidExportOpen] = useState(false);

  const handlePlayVideo = (video: VideoItem | null) => {
    if (!video) {
      setSelectedVideo(null);
      return;
    }
    // Pre-playback safety checks
    const explicitTitle = checkExplicitContent(video.title);
    const explicitDesc = checkExplicitContent(video.description);
    const explicitChannel = checkExplicitContent(video.channelTitle || '');
    if (explicitTitle.blocked || explicitDesc.blocked || explicitChannel.blocked) {
      setPlaybackBlockedError("This video is blocked by StudyTube's content filter.");
      return;
    }

    const isChanBlocked = StorageService.isChannelCompletelyBlocked(video.channelId || '', video.channelTitle);
    const isKwBlocked = StorageService.isKeywordBlocked(video.title) || StorageService.isKeywordBlocked(video.description);
    if (isChanBlocked || isKwBlocked) {
      setPlaybackBlockedError(`"${video.title}" is permanently blocked due to keyword or channel restrictions.`);
      return;
    }
    setSelectedVideo(video);
  };

  // New features modals
  const [isPlaylistsOpen, setIsPlaylistsOpen] = useState(false);
  const [videoToAddToPlaylist, setVideoToAddToPlaylist] = useState<VideoItem | null>(null);
  const [isExamModeOpen, setIsExamModeOpen] = useState(false);
  const [watchProgressList, setWatchProgressList] = useState(StorageService.getWatchProgressList());
  const [toast, setToast] = useState<{ title: string; body: string } | null>(null);

  // User Stats State
  const [stats, setStats] = useState<UserStats>(StorageService.getStats());

  // Initial duration enrichment for catalog
  useEffect(() => {
    VideoService.enrichVideosWithDurations(EDUCATIONAL_CATALOG).then(enriched => {
      const safeEnriched = enriched.filter(v => 
        !checkExplicitContent(v.title).blocked && 
        !checkExplicitContent(v.description).blocked &&
        !checkExplicitContent(v.channelTitle || '').blocked
      );
      setVideos([...safeEnriched]);
    });
  }, []);

  // Notifications Event Listener and recurring interval trigger
  useEffect(() => {
    const handleNotif = (e: Event) => {
      const customEvent = e as CustomEvent<{ title: string; body: string }>;
      setToast(customEvent.detail);
    };

    window.addEventListener('studytube-notification', handleNotif);

    const settings = StorageService.getNotificationSettings();
    if (settings.enabled) {
      // Trigger a soft greeting trigger shortly after load to welcome and prompt the user
      const timer = setTimeout(() => {
        dispatchNotification(StorageService.getNotificationSettings());
      }, 6000);

      // Setup standard interval trigger matching the configured frequency
      const intervalTime = settings.frequencyMinutes * 60 * 1000;
      const interval = setInterval(() => {
        dispatchNotification(StorageService.getNotificationSettings());
      }, intervalTime);

      return () => {
        window.removeEventListener('studytube-notification', handleNotif);
        clearTimeout(timer);
        clearInterval(interval);
      };
    }

    return () => {
      window.removeEventListener('studytube-notification', handleNotif);
    };
  }, []);

  // Auto-dismiss toast when set
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Input ref for voice & clear focus
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClearSearch = () => {
    setSearchQuery('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Execute Search
  const handleSearch = async (query = searchQuery, cat = selectedCategory) => {
    setIsSearching(true);
    setIsBlocked(false);
    setBlockedMessage('');
    setApiError(null);
    setNextPageToken(null);

    const result = await VideoService.searchVideos(query, cat, selectedExam);
    
    if (result.blocked) {
      setIsBlocked(true);
      setBlockedMessage(result.message || 'This search is blocked. Please search educational content only.');
      setVideos([]);
      setNextPageToken(null);
    } else {
      setIsBlocked(false);
      setVideos(result.videos);
      setNextPageToken(result.nextPageToken || null);
      if (result.apiError) {
        setApiError(result.apiError);
      }
    }

    setIsSearching(false);
  };

  // Voice Search Handler
  const handleVoiceSearch = () => {
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      alert('Voice recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    try {
      const recognition = new SpeechRecognitionAPI();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSearchQuery(transcript);
        handleSearch(transcript, selectedCategory);
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          alert('Microphone permission was denied. Please check your browser or iframe settings to allow microphone access.');
        } else if (event.error === 'no-speech') {
          // Silent or ignored
        } else {
          alert(`Voice recognition error: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      console.error('Failed to start speech recognition:', e);
      setIsListening(false);
      alert('Could not start voice recognition.');
    }
  };

  // Load More Lessons (Pagination)
  const handleLoadMore = async () => {
    if (!nextPageToken || isLoadingMore) return;
    setIsLoadingMore(true);

    const result = await VideoService.searchVideos(searchQuery, selectedCategory, selectedExam, nextPageToken);
    
    if (!result.blocked && result.videos.length > 0) {
      setVideos(prev => {
        const existingIds = new Set(prev.map(v => v.id));
        const newOnes = result.videos.filter(v => !existingIds.has(v.id));
        return [...prev, ...newOnes];
      });
      setNextPageToken(result.nextPageToken || null);
    } else {
      setNextPageToken(null);
    }

    if (result.apiError) {
      setApiError(result.apiError);
    }

    setIsLoadingMore(false);
  };

  // Trigger search on category selection change
  useEffect(() => {
    handleSearch(searchQuery, selectedCategory);
  }, [selectedCategory]);

  const handleSearchFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(searchQuery, selectedCategory);
  };

  const handleToggleSave = (video: VideoItem) => {
    StorageService.toggleSaveVideo(video);
    setSavedVideos(StorageService.getSavedVideos());
  };

  const isVideoSaved = (videoId: string) => {
    return savedVideos.some(v => v.id === videoId);
  };

  // Personalization Handlers
  const handleHideVideo = (video: VideoItem) => {
    StorageService.hideVideo(video.id);
    setHiddenVideos(StorageService.getHiddenVideos());
  };

  const handleBlockChannel = (channelTitle: string, channelId?: string) => {
    StorageService.blockChannel(channelTitle);
    if (channelId) {
      StorageService.blockChannelCompletely(channelId, channelTitle);
    } else {
      StorageService.blockChannelCompletely('blocked_' + channelTitle, channelTitle);
    }
    setBlockedChannels(StorageService.getBlockedChannels());
    
    // Auto-sync to cloud if user is signed in
    const currentUser = CloudSyncService.getCurrentUser();
    if (currentUser) {
      CloudSyncService.syncToCloud();
    }
  };

  const handleRestoreVideo = (videoId: string) => {
    StorageService.restoreVideo(videoId);
    setHiddenVideos(StorageService.getHiddenVideos());
  };

  const handleUnblockChannel = (channelTitle: string) => {
    StorageService.unblockChannel(channelTitle);
    // Unblock from completely blocked channels too to keep sync
    const compBlocked = StorageService.getCompletelyBlockedChannels();
    const matching = compBlocked.find(c => c.title.toLowerCase() === channelTitle.toLowerCase());
    if (matching) {
      StorageService.unblockChannelCompletely(matching.id);
    }
    setBlockedChannels(StorageService.getBlockedChannels());

    // Auto-sync to cloud if user is signed in
    const currentUser = CloudSyncService.getCurrentUser();
    if (currentUser) {
      CloudSyncService.syncToCloud();
    }
  };

  const handleClearDistractingHistory = () => {
    StorageService.clearDistractingHistory();
    StorageService.clearBlockedKeywords();
    StorageService.clearCompletelyBlockedChannels();
    setHiddenVideos([]);
    setBlockedChannels([]);

    // Auto-sync to cloud if user is signed in
    const currentUser = CloudSyncService.getCurrentUser();
    if (currentUser) {
      CloudSyncService.syncToCloud();
    }
  };

  const handleSessionLogged = (minutes: number, type: 'study' | 'break' = 'study', subject: SubjectCategory = 'Mathematics') => {
    const updated = StorageService.logSession(minutes, type, subject);
    setStats({ ...updated });
    setWatchProgressList(StorageService.getWatchProgressList());
  };

  // Filtered lists applying hidden videos, blocked channels, completely blocked channels, and blocked keywords
  const filteredVideos = videos.filter(v => {
    if (hiddenVideos.includes(v.id)) return false;
    if (blockedChannels.some(c => c.toLowerCase() === v.channelTitle.toLowerCase())) return false;
    if (StorageService.isChannelCompletelyBlocked(v.channelId || '', v.channelTitle)) return false;
    if (StorageService.isKeywordBlocked(v.title) || StorageService.isKeywordBlocked(v.description)) return false;
    if (checkExplicitContent(v.title).blocked || checkExplicitContent(v.description).blocked || checkExplicitContent(v.channelTitle || '').blocked) return false;
    return true;
  });

  const filteredSavedVideos = savedVideos.filter(v => {
    if (hiddenVideos.includes(v.id)) return false;
    if (blockedChannels.some(c => c.toLowerCase() === v.channelTitle.toLowerCase())) return false;
    if (StorageService.isChannelCompletelyBlocked(v.channelId || '', v.channelTitle)) return false;
    if (StorageService.isKeywordBlocked(v.title) || StorageService.isKeywordBlocked(v.description)) return false;
    if (checkExplicitContent(v.title).blocked || checkExplicitContent(v.description).blocked || checkExplicitContent(v.channelTitle || '').blocked) return false;
    return true;
  });

  const filteredWatchProgressList = watchProgressList.filter(p => {
    if (hiddenVideos.includes(p.videoId)) return false;
    if (blockedChannels.some(c => c.toLowerCase() === p.channelTitle.toLowerCase())) return false;
    if (StorageService.isChannelCompletelyBlocked('', p.channelTitle)) return false;
    if (StorageService.isKeywordBlocked(p.videoTitle)) return false;
    if (checkExplicitContent(p.videoTitle).blocked || checkExplicitContent(p.channelTitle || '').blocked) return false;
    return true;
  });

  return (
    <div className={`min-h-screen font-sans antialiased transition-colors duration-300 ${
      darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      
      {/* Top Header Navigation */}
      <Navbar
        stats={stats}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenFocusMode={() => setIsFocusModeOpen(true)}
        onOpenAndroidExport={() => setIsAndroidExportOpen(true)}
        onOpenPlaylists={() => { setVideoToAddToPlaylist(null); setIsPlaylistsOpen(true); }}
        onOpenExamMode={() => setIsExamModeOpen(true)}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      {/* Main App Canvas */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* TAB 1: EXPLORE VIDEOS */}
        {activeTab === 'home' && (
          <div className="space-y-6">
            
            {/* Continue Watching Row */}
            <ContinueWatchingRow
              progressList={filteredWatchProgressList}
              onSelectVideo={(v) => handlePlayVideo(v)}
            />

            {/* Search Hero Bar */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden backdrop-blur-md">
              <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

              <div className="max-w-3xl">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-bold border border-cyan-500/20 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> 100% Distraction Free
                  </span>
                  <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                    Prioritizing NCERT, CBSE, UPSC, JEE, NEET, STEM & Coding
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-4">
                  Learn without Distractions
                </h1>

                {/* Search Form */}
                <form onSubmit={handleSearchFormSubmit} className="relative flex items-center">
                  <div className="relative flex-1">
                    <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5 pointer-events-none" />
                    <input
                      ref={inputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search NCERT, JEE, UPSC, Calculus, Python, Physics, History..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-11 pr-52 py-3.5 text-sm text-white placeholder-slate-500 font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner"
                    />
                  </div>

                  <div className="absolute right-1.5 top-1.5 bottom-1.5 flex items-center gap-1.5">
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={handleClearSearch}
                        className="px-3 h-full rounded-xl border border-slate-700 bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 transition-all flex items-center justify-center"
                        title="Clear search"
                      >
                        <X className="w-4 h-4 text-slate-400" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleVoiceSearch}
                      className={`px-3.5 h-full rounded-xl border border-slate-700 bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 transition-all flex items-center gap-1.5 text-xs font-semibold ${
                        isListening ? 'animate-pulse bg-rose-600/30 text-rose-300 border-rose-500' : ''
                      }`}
                      title="Search by Voice"
                    >
                      {isListening ? (
                        <>
                          <MicOff className="w-4 h-4 text-rose-400 animate-spin" />
                          <span className="hidden sm:inline">Listening</span>
                        </>
                      ) : (
                        <>
                          <Mic className="w-4 h-4 text-indigo-400" />
                          <span className="hidden sm:inline">Voice</span>
                        </>
                      )}
                    </button>

                    <button
                      type="submit"
                      className="px-5 h-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/30 transition-all flex items-center gap-1.5 active:scale-95"
                    >
                      {isSearching ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Search'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Subject Category Chips */}
              <div className="mt-6 pt-4 border-t border-slate-800/80">
                <CategoryChips
                  selectedCategory={selectedCategory}
                  onSelectCategory={(cat) => setSelectedCategory(cat)}
                  selectedExam={selectedExam}
                  onSelectExam={(exam) => setSelectedExam(exam)}
                />
              </div>
            </div>

            {/* Blocked Search Warning Banner */}
            {isBlocked && (
              <div className="p-5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 flex items-start gap-3 shadow-lg animate-shake">
                <ShieldAlert className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-sm text-red-200">Search Filter Blocked</h3>
                  <p className="text-xs text-red-300/90 mt-1 leading-relaxed font-semibold">
                    {blockedMessage}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-2">
                    Entertainment, gaming, memes, shorts, and music searches are blocked to keep you focused on your studies.
                  </p>
                </div>
              </div>
            )}

            {/* Video Cards Grid */}
            {!isBlocked && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-indigo-400" />
                    {selectedCategory === 'All' ? 'Curated Educational Lessons' : `${selectedCategory} Lessons`}
                    <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                      {filteredVideos.length} videos
                    </span>
                  </h2>
                </div>

                {filteredVideos.length === 0 ? (
                  <div className="text-center py-16 bg-slate-900/50 rounded-3xl border border-slate-800">
                    <AlertCircle className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <h3 className="text-base font-bold text-slate-300">No lessons found</h3>
                    <p className="text-xs text-slate-500 mt-1">Try searching for a different subject topic like Calculus, Physics, or NCERT.</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {filteredVideos.map((video) => (
                        <VideoCard
                          key={video.id}
                          video={video}
                          onPlay={(v) => handlePlayVideo(v)}
                          isSaved={isVideoSaved(video.id)}
                          onToggleSave={handleToggleSave}
                          onHideVideo={handleHideVideo}
                          onBlockChannel={handleBlockChannel}
                        />
                      ))}
                    </div>

                    {/* Pagination - Load More Lessons */}
                    <div className="mt-8 flex flex-col items-center justify-center gap-3">
                      {nextPageToken ? (
                        <button
                          onClick={handleLoadMore}
                          disabled={isLoadingMore}
                          className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 active:scale-95"
                        >
                          {isLoadingMore ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin" />
                              Fetching Next YouTube Page...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4" />
                              Load More Educational Lessons
                            </>
                          )}
                        </button>
                      ) : (
                        filteredVideos.length > 8 && (
                          <p className="text-xs text-slate-500 font-medium">
                            Showing all available educational search results for this query.
                          </p>
                        )
                      )}

                      {apiError && (
                        <p className="text-[11px] text-amber-400/90 font-mono bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg max-w-lg text-center">
                          Note: {apiError} (Displaying fallback educational search results)
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

          </div>
        )}

        {/* TAB 2: SUBJECT DASHBOARD */}
        {activeTab === 'subjects' && (
          <ErrorBoundary fallbackTitle="Subject Dashboard failed to load">
            <SubjectDashboardView stats={stats} />
          </ErrorBoundary>
        )}

        {/* TAB 3: POMODORO TIMER */}
        {activeTab === 'timer' && (
          <div className="py-4">
            <ErrorBoundary fallbackTitle="Pomodoro Timer component failed to load">
              <StudyTimer
                onSessionComplete={(mins, type, subject) => handleSessionLogged(mins, type, subject)}
                onOpenFocusMode={() => setIsFocusModeOpen(true)}
              />
            </ErrorBoundary>
          </div>
        )}

        {/* TAB 4: STATISTICS */}
        {activeTab === 'stats' && (
          <ErrorBoundary fallbackTitle="Statistics Dashboard failed to load">
            <StatisticsView stats={stats} />
          </ErrorBoundary>
        )}

        {/* TAB 5: SAVED LESSONS */}
        {activeTab === 'bookmarks' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Bookmark className="w-6 h-6 text-indigo-400" />
                  Saved Lessons & Playlists
                </h2>
                <p className="text-xs text-slate-400 mt-1">Review saved educational lessons and playlists anytime</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setVideoToAddToPlaylist(null); setIsPlaylistsOpen(true); }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <FolderPlus className="w-4 h-4" />
                  Manage Playlists
                </button>
                <span className="text-xs font-semibold px-3 py-1 rounded-xl bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                  {filteredSavedVideos.length} Saved
                </span>
              </div>
            </div>

            {filteredSavedVideos.length === 0 ? (
              <div className="text-center py-20 bg-slate-900 border border-slate-800 rounded-3xl">
                <Bookmark className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-300">No saved lessons yet</h3>
                <p className="text-xs text-slate-500 mt-1">Click the bookmark icon on any video card to save it here for later revision.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredSavedVideos.map((video) => (
                  <VideoCard
                    key={video.id}
                    video={video}
                    onPlay={(v) => handlePlayVideo(v)}
                    isSaved={true}
                    onToggleSave={handleToggleSave}
                    onHideVideo={handleHideVideo}
                    onBlockChannel={handleBlockChannel}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 6: SETTINGS */}
        {activeTab === 'settings' && (
          <ErrorBoundary fallbackTitle="Settings Dashboard failed to load">
            <SettingsView
              hiddenVideos={hiddenVideos}
              blockedChannels={blockedChannels}
              onRestoreVideo={handleRestoreVideo}
              onUnblockChannel={handleUnblockChannel}
              onClearHistory={handleClearDistractingHistory}
              darkMode={darkMode}
              setDarkMode={setDarkMode}
              onDataSynced={() => {
                setStats(StorageService.getStats());
                setSavedVideos(StorageService.getSavedVideos());
                setHiddenVideos(StorageService.getHiddenVideos());
                setBlockedChannels(StorageService.getBlockedChannels());
              }}
            />
          </ErrorBoundary>
        )}

      </main>

      {/* Video Player Modal */}
      <VideoPlayerModal
        video={selectedVideo}
        onClose={() => setSelectedVideo(null)}
        isSaved={selectedVideo ? isVideoSaved(selectedVideo.id) : false}
        onToggleSave={handleToggleSave}
        onStudyLogged={(mins, subject, title) => handleSessionLogged(mins, 'study', subject)}
        onOpenPlaylistsModal={(v) => { setVideoToAddToPlaylist(v); setIsPlaylistsOpen(true); }}
      />

      {/* Playlists Modal */}
      <PlaylistsModal
        isOpen={isPlaylistsOpen}
        onClose={() => { setIsPlaylistsOpen(false); setVideoToAddToPlaylist(null); }}
        videoToAddToPlaylist={videoToAddToPlaylist}
        onSelectVideo={(v) => handlePlayVideo(v)}
      />

      {/* Exam Mode Modal */}
      <ExamModeModal
        isOpen={isExamModeOpen}
        onClose={() => setIsExamModeOpen(false)}
      />

      {/* Fullscreen Focus Mode Lock */}
      <FocusModeModal
        isOpen={isFocusModeOpen}
        onClose={() => setIsFocusModeOpen(false)}
        onStudyLogged={(mins) => handleSessionLogged(mins, 'study', 'Mathematics')}
      />

      {/* Android Exporter Modal */}
      <AndroidExporter
        isOpen={isAndroidExportOpen}
        onClose={() => setIsAndroidExportOpen(false)}
      />

      {/* Restricted Playback Overlay */}
      {playbackBlockedError && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-500/30 rounded-3xl p-6 max-w-md w-full shadow-2xl text-center space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto border border-rose-500/20">
              <Ban className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-extrabold text-white">Playback Restricted</h3>
              <p className="text-xs text-slate-300 px-4 leading-relaxed">{playbackBlockedError}</p>
            </div>
            <button
              onClick={() => setPlaybackBlockedError(null)}
              className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs transition-colors shadow-lg hover:shadow-rose-500/10"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Smart Toast Notification Toaster */}
      {toast && (
        <div className="fixed top-4 right-4 z-[999] max-w-sm w-full bg-[#2B2930]/95 backdrop-blur-md text-[#E6E1E5] border border-[#49454F] p-4 rounded-2xl shadow-2xl flex items-start gap-3 animate-slide-in">
          <div className="w-10 h-10 rounded-xl bg-[#6750A4] text-white flex items-center justify-center shrink-0">
            <Bell className="w-5 h-5 text-[#D0BCFF]" />
          </div>
          <div className="flex-1 min-w-0 space-y-0.5">
            <p className="text-xs font-bold text-white">{toast.title}</p>
            <p className="text-[11px] text-[#CAC4D0] leading-normal">{toast.body}</p>
          </div>
          <button
            onClick={() => setToast(null)}
            className="p-1 hover:bg-[#36343B] rounded-lg text-[#CAC4D0] transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

    </div>
  );
}
