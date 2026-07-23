import React, { useState, useEffect, useRef } from 'react';
import { VideoItem, VideoNote, Playlist } from '../types';
import { X, ShieldCheck, CheckCircle2, Bookmark, FileText, Plus, Trash2, Clock, Play, Pause, Sparkles, BookOpen, AlertTriangle, HelpCircle, Check, Volume2, RotateCcw, Smartphone, Globe } from 'lucide-react';
import { StorageService } from '../services/storageService';
import { EDUCATIONAL_CATALOG } from '../data/educationalCatalog';
import { checkExplicitContent } from '../utils/explicitFilter';

interface VideoPlayerModalProps {
  video: VideoItem | null;
  onClose: () => void;
  isSaved: boolean;
  onToggleSave: (video: VideoItem) => void;
  onStudyLogged?: (minutes: number, subject: any, title: string) => void;
  onOpenPlaylistsModal?: (video: VideoItem) => void;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: any;
  }
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  video: propVideo,
  onClose,
  isSaved,
  onToggleSave,
  onStudyLogged,
  onOpenPlaylistsModal
}) => {
  const [currentVideo, setCurrentVideo] = useState<VideoItem | null>(propVideo);

  useEffect(() => {
    setCurrentVideo(propVideo);
  }, [propVideo]);

  const video = currentVideo;

  const [activeTab, setActiveTab] = useState<'overview' | 'notes' | 'summary' | 'quiz'>('overview');
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [externalLinkToConfirm, setExternalLinkToConfirm] = useState<string | null>(null);
  const [notes, setNotes] = useState<VideoNote[]>([]);
  const [newNoteText, setNewNoteText] = useState('');
  const [noteTimestamp, setNoteTimestamp] = useState('00:00');
  const [playerError, setPlayerError] = useState<string | null>(null);

  // Playback speed
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(StorageService.getPlaybackSpeed());

  // AI Summary state
  const [aiSummary, setAiSummary] = useState<any>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  // Quiz state
  const [quizData, setQuizData] = useState<any>(null);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [quizError, setQuizError] = useState<string | null>(null);
  const [userAnswers, setUserAnswers] = useState<{ [qId: string]: string }>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  // Mini study timer state
  const [timerActive, setTimerActive] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const ytPlayerRef = useRef<any>(null);

  const cleanVideoId = (video?.id || '').trim().replace(/[^a-zA-Z0-9_-]/g, '');

  useEffect(() => {
    setPlayerError(null);
    setAiSummary(null);
    setSummaryError(null);
    setQuizData(null);
    setQuizError(null);
    setUserAnswers({});
    setQuizSubmitted(false);

    if (video) {
      setNotes(StorageService.getNotes(video.id));
      // Load saved watch progress if any
      const progress = StorageService.getWatchProgressForVideo(video.id);
      if (progress && progress.positionSeconds > 5) {
        const mins = Math.floor(progress.positionSeconds / 60);
        const secs = progress.positionSeconds % 60;
        setNoteTimestamp(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
      }
    }
  }, [video]);

  // YouTube Iframe Player API
  useEffect(() => {
    if (video && !cleanVideoId) {
      setPlayerError('Invalid YouTube Video ID.');
      return;
    }
    if (!cleanVideoId) {
      return;
    }

    let isSubscribed = true;

    const initYTPlayer = () => {
      if (window.YT && window.YT.Player && iframeRef.current) {
        try {
          ytPlayerRef.current = new window.YT.Player(iframeRef.current, {
            events: {
              onReady: (e: any) => {
                if (e.target && e.target.setPlaybackRate) {
                  e.target.setPlaybackRate(playbackSpeed);
                }
                if (e.target && e.target.getDuration) {
                  try {
                    const rawSecs = e.target.getDuration();
                    if (rawSecs && rawSecs > 0) {
                      const h = Math.floor(rawSecs / 3600);
                      const m = Math.floor((rawSecs % 3600) / 60);
                      const s = Math.floor(rawSecs % 60);
                      const pad = (n: number) => n.toString().padStart(2, '0');
                      const formatted = h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
                      StorageService.cacheDuration(video.id, formatted);
                    }
                  } catch (err) {
                    // ignore
                  }
                }
              },
              onError: (e: any) => {
                console.warn('YouTube Player error code:', e.data);
                if (isSubscribed) {
                  setPlayerError('This video cannot be played inside StudyTube.');
                }
              }
            }
          });
        } catch (e) {
          console.warn('YT.Player attach error:', e);
        }
      }
    };

    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      if (firstScriptTag && firstScriptTag.parentNode) {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      }
      window.onYouTubeIframeAPIReady = () => {
        initYTPlayer();
      };
    } else {
      initYTPlayer();
    }

    return () => {
      isSubscribed = false;
      // Save watch progress on close
      if (ytPlayerRef.current && ytPlayerRef.current.getCurrentTime) {
        try {
          const currTime = Math.floor(ytPlayerRef.current.getCurrentTime() || 0);
          const duration = Math.floor(ytPlayerRef.current.getDuration() || 900);
          StorageService.saveWatchProgress({
            videoId: video.id,
            videoTitle: video.title,
            thumbnailUrl: video.thumbnailUrl,
            channelTitle: video.channelTitle,
            subject: video.subject,
            durationSeconds: duration,
            positionSeconds: currTime,
            lastWatchedAt: Date.now(),
            completed: currTime >= duration - 30
          });
        } catch (err) {
          // ignore
        }
      }

      if (ytPlayerRef.current && ytPlayerRef.current.destroy) {
        try {
          ytPlayerRef.current.destroy();
        } catch (e) {
          // ignore
        }
      }
    };
  }, [cleanVideoId]);

  // Mini timer tick
  useEffect(() => {
    let interval: any = null;
    if (timerActive) {
      interval = setInterval(() => {
        setTimerSeconds(s => s + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timerActive]);

  if (!video) return null;

  const explicitTitle = checkExplicitContent(video.title);
  const explicitDesc = checkExplicitContent(video.description);
  const explicitChannel = checkExplicitContent(video.channelTitle || '');
  const isExplicitBlocked = explicitTitle.blocked || explicitDesc.blocked || explicitChannel.blocked;
  const explicitBlockedReason = explicitTitle.blocked 
    ? explicitTitle.reason 
    : (explicitDesc.blocked 
        ? explicitDesc.reason 
        : explicitChannel.reason);

  const isVideoBlocked = StorageService.isKeywordBlocked(video.title) || 
                         StorageService.isKeywordBlocked(video.description) || 
                         StorageService.isKeywordBlocked(video.channelTitle) ||
                         StorageService.isChannelCompletelyBlocked(video.channelId || '', video.channelTitle);

  if (isExplicitBlocked) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-rose-500/40 rounded-3xl max-w-md w-full p-6 shadow-2xl text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center">
            <X className="w-8 h-8" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-bold text-white">Content Filter Block</h3>
            <p className="text-xs text-slate-300 font-medium">
              This video is blocked by StudyTube's content filter.
            </p>
          </div>
          <div className="p-3.5 bg-slate-950 rounded-2xl text-xs text-rose-400/95 border border-slate-800 text-left">
            <strong className="text-slate-300">Safety System Logs:</strong>
            <p className="text-[11px] font-mono mt-1 text-slate-400 break-words leading-relaxed">
              {explicitBlockedReason || 'Explicit content detected.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (isVideoBlocked) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-red-500/30 rounded-3xl max-w-md w-full p-6 shadow-2xl text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-red-500/10 text-red-500 flex items-center justify-center">
            <X className="w-8 h-8" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-bold text-white">Content Blocked</h3>
            <p className="text-xs text-slate-400">
              This video is blocked by your StudyTube settings.
            </p>
          </div>
          <div className="p-3.5 bg-slate-950 rounded-2xl text-xs text-red-400/90 border border-slate-800 text-left">
            <strong className="text-slate-300">Blocked Match:</strong>
            <p className="text-[11px] font-mono mt-1 text-slate-400 break-words line-clamp-2">
              "{video.title}" by {video.channelTitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    const parts = noteTimestamp.split(':');
    let seconds = 0;
    if (parts.length === 2) {
      seconds = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
    } else {
      seconds = parseInt(noteTimestamp, 10) || 0;
    }

    const created = StorageService.addNote(video.id, video.title, seconds, newNoteText.trim());
    setNotes([created, ...notes]);
    setNewNoteText('');
  };

  const handleDeleteNote = (id: string) => {
    StorageService.deleteNote(id);
    setNotes(notes.filter(n => n.id !== id));
  };

  const handleLinkClick = (e: React.MouseEvent, url: string) => {
    e.preventDefault();

    // Parse YouTube video ID if any
    let ytId: string | null = null;
    try {
      const parsedUrl = new URL(url);
      if (parsedUrl.hostname.includes('youtube.com') || parsedUrl.hostname.includes('youtu.be')) {
        if (parsedUrl.pathname.includes('/watch')) {
          ytId = parsedUrl.searchParams.get('v');
        } else if (parsedUrl.hostname.includes('youtu.be')) {
          ytId = parsedUrl.pathname.substring(1);
        } else if (parsedUrl.pathname.includes('/embed/')) {
          ytId = parsedUrl.pathname.split('/embed/')[1]?.split('?')[0];
        }
      }
    } catch (err) {
      if (url.includes('youtube.com/watch?v=')) {
        ytId = url.split('v=')[1]?.split('&')[0];
      } else if (url.includes('youtu.be/')) {
        ytId = url.split('youtu.be/')[1]?.split('?')[0];
      }
    }

    if (ytId) {
      const found = EDUCATIONAL_CATALOG.find(v => v.id === ytId);
      if (found) {
        setCurrentVideo(found);
      } else {
        const tempVideo: VideoItem = {
          id: ytId,
          title: "Linked Educational Resource",
          description: "Viewing linked educational video within StudyTube Focus Shield.",
          channelTitle: "External Channel",
          channelId: "",
          subject: video.subject,
          publishedAt: "Now",
          thumbnailUrl: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`,
          duration: "10:00",
          verifiedEducational: true
        };
        const isBlocked = StorageService.isKeywordBlocked(tempVideo.title) || StorageService.isKeywordBlocked(url);
        if (isBlocked) {
          alert("This video is restricted under your Focus Mode settings.");
          return;
        }
        setCurrentVideo(tempVideo);
      }
    } else {
      setExternalLinkToConfirm(url);
    }
  };

  const parseDescriptionLine = (line: string) => {
    const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;
    const timestampRegex = /\b((?:\d{1,2}:)?\d{2}:\d{2})\b/g;

    interface MatchToken {
      index: number;
      text: string;
      type: 'text' | 'url' | 'timestamp';
    }

    const matches: MatchToken[] = [];
    let match;

    while ((match = urlRegex.exec(line)) !== null) {
      matches.push({ index: match.index, text: match[0], type: 'url' });
    }

    while ((match = timestampRegex.exec(line)) !== null) {
      matches.push({ index: match.index, text: match[0], type: 'timestamp' });
    }

    matches.sort((a, b) => a.index - b.index);

    const result: React.ReactNode[] = [];
    let lastIdx = 0;

    for (const item of matches) {
      if (item.index < lastIdx) continue;

      if (item.index > lastIdx) {
        result.push(line.substring(lastIdx, item.index));
      }

      const tokenText = item.text;
      if (item.type === 'url') {
        let finalUrl = tokenText;
        if (!/^https?:\/\//i.test(finalUrl)) {
          finalUrl = 'https://' + finalUrl;
        }
        result.push(
          <a
            key={`url-${item.index}`}
            href={finalUrl}
            onClick={(e) => handleLinkClick(e, finalUrl)}
            className="text-cyan-400 hover:underline font-semibold break-all"
          >
            {tokenText}
          </a>
        );
      } else {
        const parts = tokenText.split(':').map(Number);
        let seconds = 0;
        if (parts.length === 3) {
          seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
        } else if (parts.length === 2) {
          seconds = parts[0] * 60 + parts[1];
        }
        result.push(
          <button
            key={`ts-${item.index}`}
            type="button"
            onClick={() => handleSeekToTimestamp(seconds)}
            className="text-indigo-400 hover:text-indigo-300 hover:underline font-mono font-bold px-1 py-0.5 bg-indigo-950/40 rounded border border-indigo-900/30 text-[11px] inline-flex items-center gap-0.5"
          >
            ⏱️ {tokenText}
          </button>
        );
      }

      lastIdx = item.index + tokenText.length;
    }

    if (lastIdx < line.length) {
      result.push(line.substring(lastIdx));
    }

    return result.length > 0 ? result : [line];
  };

  const handleSeekToTimestamp = (seconds: number) => {
    if (ytPlayerRef.current && ytPlayerRef.current.seekTo) {
      ytPlayerRef.current.seekTo(seconds, true);
      ytPlayerRef.current.playVideo();
    }
  };

  const handleSetSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    StorageService.setPlaybackSpeed(speed);
    if (ytPlayerRef.current && ytPlayerRef.current.setPlaybackRate) {
      ytPlayerRef.current.setPlaybackRate(speed);
    }
  };

  const handleFetchAiSummary = async () => {
    if (aiSummary) return;
    setLoadingSummary(true);
    setSummaryError(null);
    try {
      const res = await fetch('/api/ai/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId: video.id, title: video.title, description: video.description, channelTitle: video.channelTitle })
      });
      const data = await res.json();
      if (data.available && data.summary) {
        setAiSummary(data.summary);
      } else {
        setSummaryError(data.error || 'AI summary cannot currently be generated from this video.');
      }
    } catch (e: any) {
      setSummaryError('Failed to fetch AI summary.');
    }
    setLoadingSummary(false);
  };

  const handleFetchQuiz = async () => {
    if (quizData) return;
    setLoadingQuiz(true);
    setQuizError(null);
    try {
      const res = await fetch('/api/ai/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId: video.id, title: video.title, description: video.description })
      });
      const data = await res.json();
      if (data.available && data.quiz) {
        setQuizData(data.quiz);
      } else {
        setQuizError(data.error || 'Quiz cannot be generated for this video.');
      }
    } catch (e: any) {
      setQuizError('Failed to generate quiz.');
    }
    setLoadingQuiz(false);
  };

  const handleQuizSubmit = () => {
    if (!quizData || !quizData.questions) return;
    let correctCount = 0;
    quizData.questions.forEach((q: any) => {
      const userAns = (userAnswers[q.id] || '').trim().toLowerCase();
      const trueAns = (q.correctAnswer || '').trim().toLowerCase();
      if (userAns === trueAns) {
        correctCount += 1;
      }
    });
    setQuizScore(correctCount);
    setQuizSubmitted(true);
  };

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSaveStudySession = () => {
    const mins = Math.max(1, Math.round(timerSeconds / 60));
    StorageService.logSession(mins, 'study', video.subject, video.title, video.id);
    if (onStudyLogged) {
      onStudyLogged(mins, video.subject, video.title);
    }
    alert(`Successfully logged ${mins} minutes of study time for "${video.title}"!`);
    setTimerSeconds(0);
    setTimerActive(false);
  };

  const formatSecondsToTimestamp = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const speeds = [0.75, 1.0, 1.25, 1.5, 1.75, 2.0];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl max-h-[95vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-3 min-w-0 pr-4">
            <span className="px-2.5 py-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-bold text-xs rounded-xl flex-shrink-0">
              {video.subject}
            </span>
            <h2 className="text-sm sm:text-base font-bold text-white truncate">{video.title}</h2>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => onToggleSave(video)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                isSaved ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
              {isSaved ? 'Saved' : 'Save'}
            </button>

            {onOpenPlaylistsModal && (
              <button
                onClick={() => onOpenPlaylistsModal(video)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all"
              >
                Playlists
              </button>
            )}

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto flex flex-col lg:flex-row">
          
          {/* Left / Main Column: Video Player & Tabs */}
          <div className="flex-1 p-4 sm:p-6 space-y-5 border-b lg:border-b-0 lg:border-r border-slate-800">
            
            {/* Player Container */}
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-950 shadow-xl border border-slate-800">
              {playerError ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-slate-950 space-y-3">
                  <AlertTriangle className="w-10 h-10 text-amber-400" />
                  <p className="text-sm font-bold text-white">{playerError}</p>
                  <a
                    href={`https://www.youtube.com/watch?v=${cleanVideoId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs transition-all inline-flex items-center gap-1.5"
                  >
                    Open on YouTube Directly
                  </a>
                </div>
              ) : (
                <iframe
                  ref={iframeRef}
                  id="ytplayer"
                  src={`https://www.youtube.com/embed/${cleanVideoId}?enablejsapi=1&autoplay=1&modestbranding=1&rel=0`}
                  title={video.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}
            </div>

            {/* Playback speed selector */}
            <div className="flex items-center justify-between bg-slate-950/60 border border-slate-800 rounded-2xl px-4 py-3">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-semibold text-slate-300">Playback Speed:</span>
              </div>
              <div className="flex items-center gap-1.5">
                {speeds.map(spd => (
                  <button
                    key={spd}
                    onClick={() => handleSetSpeed(spd)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                      playbackSpeed === spd
                        ? 'bg-cyan-500 text-slate-950 shadow'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                    }`}
                  >
                    {spd}×
                  </button>
                ))}
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-800 gap-2">
              <button
                onClick={() => setActiveTab('overview')}
                className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                  activeTab === 'overview' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                Overview & Timer
              </button>
              <button
                onClick={() => setActiveTab('notes')}
                className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                  activeTab === 'notes' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <FileText className="w-4 h-4" />
                Notes ({notes.length})
              </button>
              <button
                onClick={() => {
                  setActiveTab('summary');
                  handleFetchAiSummary();
                }}
                className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                  activeTab === 'summary' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                AI Summary
              </button>
              <button
                onClick={() => {
                  setActiveTab('quiz');
                  handleFetchQuiz();
                }}
                className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                  activeTab === 'quiz' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <HelpCircle className="w-4 h-4" />
                Quiz Me
              </button>
            </div>

             {/* Tab 1: Overview & Timer */}
             {activeTab === 'overview' && (
               <div className="space-y-4 animate-in fade-in-50">
                 <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-4">
                   <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
                     <div>
                       <h3 className="text-sm font-bold text-white">{video.channelTitle}</h3>
                       <p className="text-[10px] text-slate-500">Verified StudyTube Educator</p>
                     </div>
                     <span className="text-xs text-slate-400 font-mono">{video.publishedAt}</span>
                   </div>

                   {/* Description Title & Content */}
                   <div className="space-y-2">
                     <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Description & Resources</h4>
                     <div className="text-xs text-slate-300 space-y-2 bg-slate-900/40 p-4 rounded-xl border border-slate-800/40 leading-relaxed max-h-[400px] overflow-y-auto">
                       {(() => {
                         const allLines = (video.description || 'No description available for this verified educational lecture.').split('\n');
                         const previewLinesLimit = 4;
                         const visibleLines = descriptionExpanded ? allLines : allLines.slice(0, previewLinesLimit);

                         return (
                           <>
                             {visibleLines.map((line, idx) => (
                               <p key={idx} className="min-h-[1.2rem] whitespace-pre-wrap">
                                 {parseDescriptionLine(line)}
                               </p>
                             ))}
                             
                             {!descriptionExpanded && allLines.length > previewLinesLimit && (
                               <p className="text-slate-500 font-bold">...</p>
                             )}

                             {allLines.length > previewLinesLimit && (
                               <button
                                 type="button"
                                 onClick={() => setDescriptionExpanded(!descriptionExpanded)}
                                 className="text-cyan-400 hover:text-cyan-300 font-bold text-xs mt-3 transition-all flex items-center gap-1 focus:outline-none"
                               >
                                 {descriptionExpanded ? 'Show Less ⬆️' : 'Show More ⬇️'}
                               </button>
                             )}
                           </>
                         );
                       })()}
                     </div>
                   </div>
                 </div>

                 {/* PiP Mode Guidance */}
                 <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-2">
                   <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs">
                     <Smartphone className="w-4 h-4" />
                     How to Play in Picture-in-Picture (PiP) Mode
                   </div>
                   <p className="text-[11px] text-slate-400 leading-relaxed">
                     Double right-click on the YouTube video and choose <strong className="text-slate-300">"Picture-in-Picture"</strong>, or use the native player overlay. This allows you to write notes or track goals in other tabs while continuing to study-watch safely!
                   </p>
                 </div>

                {/* Focus Study Session Tracker */}
                <div className="bg-gradient-to-r from-slate-950 via-cyan-950/30 to-slate-950 border border-cyan-500/20 rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Study Timer Tracker</p>
                      <p className="text-lg font-mono font-black text-cyan-400">{formatTimer(timerSeconds)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setTimerActive(!timerActive)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        timerActive ? 'bg-amber-500 text-slate-950' : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400'
                      }`}
                    >
                      {timerActive ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                      {timerActive ? 'Pause' : 'Start Focus'}
                    </button>

                    {timerSeconds > 30 && (
                      <button
                        onClick={handleSaveStudySession}
                        className="px-3 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-all"
                      >
                        Log Session
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Notes & Timestamped Notes */}
            {activeTab === 'notes' && (
              <div className="space-y-4 animate-in fade-in-50">
                <form onSubmit={handleAddNote} className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <label className="text-[11px] font-semibold text-slate-400 block mb-1">Timestamp</label>
                      <input
                        type="text"
                        value={noteTimestamp}
                        onChange={e => setNoteTimestamp(e.target.value)}
                        placeholder="05:00"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div className="flex-[3]">
                      <label className="text-[11px] font-semibold text-slate-400 block mb-1">Note Content</label>
                      <input
                        type="text"
                        value={newNoteText}
                        onChange={e => setNewNoteText(e.target.value)}
                        placeholder="Important explanation of Public Reason..."
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div className="pt-5">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs transition-all flex items-center gap-1"
                      >
                        <Plus className="w-4 h-4" />
                        Add Note
                      </button>
                    </div>
                  </div>
                </form>

                <div className="space-y-2.5">
                  {notes.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-8">No timestamped notes for this video yet.</p>
                  ) : (
                    notes.map((note) => (
                      <div key={note.id} className="bg-slate-950/50 border border-slate-800 rounded-2xl p-3 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <button
                            onClick={() => handleSeekToTimestamp(note.timestampSeconds)}
                            className="px-2.5 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 text-cyan-400 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1 flex-shrink-0"
                            title="Jump to timestamp in video"
                          >
                            <Play className="w-3 h-3 fill-current" />
                            {formatSecondsToTimestamp(note.timestampSeconds)}
                          </button>
                          <p className="text-xs text-slate-200 truncate">{note.noteText}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteNote(note.id)}
                          className="text-slate-500 hover:text-rose-400 p-1 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Tab 3: AI Summary */}
            {activeTab === 'summary' && (
              <div className="space-y-4 animate-in fade-in-50">
                {loadingSummary && (
                  <div className="text-center py-12 space-y-3">
                    <Sparkles className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
                    <p className="text-xs text-slate-300 font-medium">Generating AI study summary...</p>
                  </div>
                )}

                {summaryError && (
                  <div className="bg-amber-500/10 border border-amber-500/20 text-amber-300 p-4 rounded-2xl text-xs space-y-2">
                    <p className="font-bold">Notice:</p>
                    <p>{summaryError}</p>
                  </div>
                )}

                {aiSummary && (
                  <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-5 space-y-4 text-xs text-slate-200">
                    <div>
                      <h4 className="font-bold text-cyan-400 uppercase tracking-wider text-[11px] mb-1">Short Summary</h4>
                      <p className="text-white font-medium">{aiSummary.shortSummary}</p>
                    </div>

                    <div>
                      <h4 className="font-bold text-cyan-400 uppercase tracking-wider text-[11px] mb-1">Detailed Explanation</h4>
                      <p className="text-slate-300 leading-relaxed">{aiSummary.detailedSummary}</p>
                    </div>

                    {aiSummary.keyPoints && aiSummary.keyPoints.length > 0 && (
                      <div>
                        <h4 className="font-bold text-cyan-400 uppercase tracking-wider text-[11px] mb-1.5">Key Takeaway Points</h4>
                        <ul className="list-disc list-inside space-y-1 text-slate-300">
                          {aiSummary.keyPoints.map((kp: string, idx: number) => (
                            <li key={idx}>{kp}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {aiSummary.keyTerms && aiSummary.keyTerms.length > 0 && (
                      <div>
                        <h4 className="font-bold text-cyan-400 uppercase tracking-wider text-[11px] mb-1.5">Important Terms & Definitions</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {aiSummary.keyTerms.map((kt: any, idx: number) => (
                            <div key={idx} className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                              <span className="font-bold text-cyan-300">{kt.term}:</span> {kt.definition}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Tab 4: Quiz Me */}
            {activeTab === 'quiz' && (
              <div className="space-y-4 animate-in fade-in-50">
                {loadingQuiz && (
                  <div className="text-center py-12 space-y-3">
                    <HelpCircle className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
                    <p className="text-xs text-slate-300 font-medium">Generating quiz questions...</p>
                  </div>
                )}

                {quizError && (
                  <div className="bg-amber-500/10 border border-amber-500/20 text-amber-300 p-4 rounded-2xl text-xs space-y-2">
                    <p className="font-bold">Notice:</p>
                    <p>{quizError}</p>
                  </div>
                )}

                {quizData && quizData.questions && (
                  <div className="space-y-6">
                    {quizSubmitted && (
                      <div className="bg-cyan-500/10 border border-cyan-500/30 p-4 rounded-2xl flex items-center justify-between">
                        <div>
                          <p className="text-sm font-bold text-white">Quiz Result: {quizScore} / {quizData.questions.length} Correct</p>
                          <p className="text-xs text-cyan-300">Review your answers and explanations below.</p>
                        </div>
                        <button
                          onClick={() => {
                            setQuizSubmitted(false);
                            setUserAnswers({});
                          }}
                          className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs transition-all flex items-center gap-1.5"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          Try Again
                        </button>
                      </div>
                    )}

                    {quizData.questions.map((q: any, qIdx: number) => {
                      const isCorrect = (userAnswers[q.id] || '').trim().toLowerCase() === (q.correctAnswer || '').trim().toLowerCase();
                      return (
                        <div key={q.id} className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-3">
                          <p className="text-xs font-bold text-white">
                            Q{qIdx + 1}. {q.question}
                          </p>

                          {q.options && q.options.length > 0 ? (
                            <div className="space-y-2">
                              {q.options.map((opt: string) => {
                                const selected = userAnswers[q.id] === opt;
                                return (
                                  <button
                                    key={opt}
                                    disabled={quizSubmitted}
                                    onClick={() => setUserAnswers({ ...userAnswers, [q.id]: opt })}
                                    className={`w-full text-left px-3.5 py-2 rounded-xl text-xs transition-all border ${
                                      selected
                                        ? 'bg-cyan-500/20 border-cyan-500 text-cyan-200 font-bold'
                                        : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
                                    }`}
                                  >
                                    {opt}
                                  </button>
                                );
                              })}
                            </div>
                          ) : (
                            <input
                              type="text"
                              disabled={quizSubmitted}
                              placeholder="Type your short answer..."
                              value={userAnswers[q.id] || ''}
                              onChange={e => setUserAnswers({ ...userAnswers, [q.id]: e.target.value })}
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                            />
                          )}

                          {quizSubmitted && (
                            <div className={`p-3 rounded-xl text-xs ${isCorrect ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'}`}>
                              <p className="font-bold">{isCorrect ? '✓ Correct!' : `✗ Correct Answer: ${q.correctAnswer}`}</p>
                              <p className="text-[11px] text-slate-300 mt-1">{q.explanation}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {!quizSubmitted && (
                      <div className="flex justify-end pt-2">
                        <button
                          onClick={handleQuizSubmit}
                          className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-lg"
                        >
                          Submit Answers
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Right Column: Educational Metadata & Quick Actions */}
          <div className="w-full lg:w-80 p-4 sm:p-6 bg-slate-950/40 space-y-5">
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Verified Educational Metadata</h3>
              
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Subject</span>
                  <span className="font-bold text-cyan-400">{video.subject}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Duration</span>
                  <span className="font-mono font-bold text-white">{video.duration}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Safety Status</span>
                  <span className="font-bold text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified Clean
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Study Quick Tips</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Use timestamped notes while watching lectures to instantly jump back to key concepts during exam revision.
              </p>
            </div>
          </div>

        </div>

      </div>

      {/* Leaving StudyTube Warning Modal */}
      {externalLinkToConfirm && (
        <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-6 max-w-md w-full shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto border border-amber-500/20 animate-pulse">
              <AlertTriangle className="w-6 h-6 text-amber-400" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-extrabold text-white">Leaving StudyTube</h3>
              <p className="text-xs text-slate-300 px-4 leading-relaxed">
                You are leaving the StudyTube Focus environment. Before opening this link, verify the destination domain to stay on track!
              </p>
            </div>
            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-left font-mono text-[10px] text-amber-400 break-all select-all">
              {externalLinkToConfirm}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setExternalLinkToConfirm(null)}
                className="py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-colors"
              >
                Go Back
              </button>
              <a
                href={externalLinkToConfirm}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setExternalLinkToConfirm(null)}
                className="py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-colors text-center shadow-lg shadow-amber-500/10"
              >
                Open Link
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
