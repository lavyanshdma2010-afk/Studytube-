import React, { useState } from 'react';
import { VideoItem } from '../types';
import { Play, ShieldCheck, Bookmark, Clock, Eye, CheckCircle2, MoreVertical, EyeOff, Ban } from 'lucide-react';

interface VideoCardProps {
  video: VideoItem;
  onPlay: (video: VideoItem) => void;
  isSaved?: boolean;
  onToggleSave?: (video: VideoItem) => void;
  onHideVideo?: (video: VideoItem) => void;
  onBlockChannel?: (channelTitle: string, channelId?: string) => void;
}

export const VideoCard: React.FC<VideoCardProps> = ({
  video,
  onPlay,
  isSaved = false,
  onToggleSave,
  onHideVideo,
  onBlockChannel
}) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div 
      className="group bg-slate-900/90 rounded-2xl overflow-hidden border border-slate-800/90 hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col justify-between"
      onClick={() => {
        if (showMenu) setShowMenu(false);
      }}
    >
      {/* Thumbnail Area */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-950 cursor-pointer" onClick={() => onPlay(video)}>
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Play Overlay Button */}
        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
          <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/50 scale-90 group-hover:scale-100 transition-transform">
            <Play className="w-5 h-5 fill-current ml-0.5" />
          </div>
        </div>

        {/* Duration Badge */}
        {video.duration && (
          <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-slate-950/90 text-slate-200 text-[11px] font-mono font-medium flex items-center gap-1 border border-slate-800">
            <Clock className="w-3 h-3 text-slate-400" />
            {video.duration}
          </div>
        )}

        {/* Verified Badge */}
        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-emerald-500/90 backdrop-blur-md text-white text-[10px] font-bold tracking-wide flex items-center gap-1 shadow-md">
          <ShieldCheck className="w-3 h-3" />
          SAFE & VERIFIED
        </div>

        {/* Save/Bookmark & Menu Buttons */}
        <div className="absolute top-2 right-2 flex items-center gap-1 z-10">
          {onToggleSave && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleSave(video);
              }}
              className={`p-1.5 rounded-lg backdrop-blur-md transition-all ${
                isSaved
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              title={isSaved ? 'Remove from saved' : 'Save for later'}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
            </button>
          )}

          {/* Three-dot menu */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white backdrop-blur-md transition-all border border-slate-800"
              title="More options"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>

            {showMenu && (
              <div 
                className="absolute right-0 top-8 w-52 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-1.5 z-20 text-xs"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => {
                    setShowMenu(false);
                    if (onHideVideo) onHideVideo(video);
                  }}
                  className="w-full px-3 py-2.5 text-left text-slate-200 hover:bg-slate-800 flex items-center gap-2 transition-colors"
                >
                  <EyeOff className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <span>Not interested / Distracting</span>
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    if (onBlockChannel) onBlockChannel(video.channelTitle, video.channelId);
                  }}
                  className="w-full px-3 py-2.5 text-left text-slate-200 hover:bg-slate-800 flex items-center gap-2 border-t border-slate-800 transition-colors"
                >
                  <Ban className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                  <span>Permanently Block Channel</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Tags */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[11px] font-semibold">
              {video.subject}
            </span>
            {video.examCategory && (
              <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-[11px] font-semibold">
                {video.examCategory}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 
            onClick={() => onPlay(video)}
            className="text-sm font-bold text-slate-100 group-hover:text-indigo-300 transition-colors line-clamp-2 cursor-pointer leading-snug"
          >
            {video.title}
          </h3>

          {/* Channel Info */}
          <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1 font-medium">
            <span>{video.channelTitle}</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 fill-blue-400/20" />
          </p>

          {/* Key Takeaways preview if available */}
          {video.keyTakeaways && video.keyTakeaways.length > 0 && (
            <div className="mt-2.5 pt-2 border-t border-slate-800/80">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-1">Topics covered:</p>
              <div className="flex flex-wrap gap-1">
                {video.keyTakeaways.slice(0, 2).map((takeaway, idx) => (
                  <span key={idx} className="text-[10px] bg-slate-800/60 text-slate-300 px-1.5 py-0.5 rounded">
                    • {takeaway}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5 text-slate-500" />
            <span>{video.views || 'Educational'}</span>
          </div>
          <button
            onClick={() => onPlay(video)}
            className="text-indigo-400 hover:text-indigo-300 text-xs font-semibold flex items-center gap-1 transition-colors"
          >
            Watch Lesson →
          </button>
        </div>
      </div>
    </div>
  );
};
