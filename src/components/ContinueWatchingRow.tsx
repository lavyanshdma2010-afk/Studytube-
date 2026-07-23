import React from 'react';
import { Play, Clock, CheckCircle2 } from 'lucide-react';
import { WatchProgress, VideoItem } from '../types';

interface ContinueWatchingRowProps {
  progressList: WatchProgress[];
  onSelectVideo: (video: VideoItem) => void;
}

export const ContinueWatchingRow: React.FC<ContinueWatchingRowProps> = ({
  progressList,
  onSelectVideo
}) => {
  const unfinished = progressList.filter(p => !p.completed && p.positionSeconds > 10);
  if (unfinished.length === 0) return null;

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    const hours = Math.floor(mins / 60);
    const m = mins % 60;
    if (hours > 0) {
      return `${hours}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="mb-8 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Continue Watching</h3>
        </div>
        <span className="text-xs text-slate-400 font-medium">{unfinished.length} lectures in progress</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {unfinished.map((item) => {
          const percent = Math.min(100, Math.max(5, Math.round((item.positionSeconds / (item.durationSeconds || 900)) * 100)));
          return (
            <div
              key={item.videoId}
              onClick={() => {
                onSelectVideo({
                  id: item.videoId,
                  title: item.videoTitle,
                  channelTitle: item.channelTitle,
                  description: 'Resuming study session',
                  thumbnailUrl: item.thumbnailUrl,
                  publishedAt: new Date().toISOString(),
                  duration: formatTime(item.durationSeconds),
                  subject: item.subject,
                  verifiedEducational: true
                });
              }}
              className="bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-3 flex gap-3 cursor-pointer group transition-all shadow-md hover:shadow-cyan-500/5"
            >
              <div className="relative w-32 h-20 rounded-xl overflow-hidden bg-slate-950 flex-shrink-0">
                <img src={item.thumbnailUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300" />
                <div className="absolute inset-0 bg-slate-950/30 group-hover:bg-transparent flex items-center justify-center transition-all">
                  <div className="w-8 h-8 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center shadow-lg opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all">
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  </div>
                </div>
                {/* Real Duration Badge on Continue Watching */}
                {item.durationSeconds && item.durationSeconds > 0 && (
                  <span className="absolute bottom-2 right-1.5 bg-slate-950/90 text-[10px] font-mono font-bold text-slate-200 px-1.5 py-0.5 rounded border border-slate-800 z-10">
                    {formatTime(item.durationSeconds)}
                  </span>
                )}
                {/* Progress bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800">
                  <div className="h-full bg-cyan-400" style={{ width: `${percent}%` }} />
                </div>
              </div>

              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-cyan-400 line-clamp-2 transition-all">
                    {item.videoTitle}
                  </h4>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">{item.channelTitle}</p>
                </div>
                <div className="flex items-center justify-between text-[11px] font-medium pt-1 border-t border-slate-800/60">
                  <span className="text-cyan-400 font-bold">Continue from {formatTime(item.positionSeconds)}</span>
                  <span className="text-slate-500 font-mono">{percent}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
