import React, { useState, useEffect } from 'react';
import { X, Bookmark, Plus, Trash2, Edit2, Play, Check, FolderPlus, Film } from 'lucide-react';
import { Playlist, VideoItem } from '../types';
import { StorageService } from '../services/storageService';
import { checkExplicitContent } from '../utils/explicitFilter';

interface PlaylistsModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoToAddToPlaylist?: VideoItem | null;
  onSelectVideo?: (video: VideoItem) => void;
}

export const PlaylistsModal: React.FC<PlaylistsModalProps> = ({
  isOpen,
  onClose,
  videoToAddToPlaylist,
  onSelectVideo
}) => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDesc, setNewPlaylistDesc] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [activePlaylistId, setActivePlaylistId] = useState<string>('watch_later');
  const [playlistVideos, setPlaylistVideos] = useState<VideoItem[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadPlaylists();
    }
  }, [isOpen]);

  const loadPlaylists = () => {
    const list = StorageService.getPlaylists();
    setPlaylists(list);
    if (!list.some(p => p.id === activePlaylistId) && list.length > 0) {
      setActivePlaylistId(list[0].id);
    }
  };

  useEffect(() => {
    const active = playlists.find(p => p.id === activePlaylistId);
    if (active) {
      const allSaved = StorageService.getSavedVideos();
      const mapped: VideoItem[] = [];
      const hiddenVideos = StorageService.getHiddenVideos();
      const blockedChannels = StorageService.getBlockedChannels();

      for (const id of active.videoIds) {
        if (hiddenVideos.includes(id)) continue;
        const found = allSaved.find(v => v.id === id);
        if (found) {
          if (blockedChannels.some(c => c.toLowerCase() === found.channelTitle.toLowerCase())) continue;
          if (StorageService.isChannelCompletelyBlocked(found.channelId || '', found.channelTitle)) continue;
          if (StorageService.isKeywordBlocked(found.title) || StorageService.isKeywordBlocked(found.description)) continue;
          if (checkExplicitContent(found.title).blocked || checkExplicitContent(found.description).blocked || checkExplicitContent(found.channelTitle || '').blocked) continue;
          mapped.push(found);
        } else {
          mapped.push({
            id,
            title: `Study Lesson (${id})`,
            channelTitle: 'Verified Educational Channel',
            description: 'Saved study video',
            thumbnailUrl: `https://img.youtube.com/vi/${id}/mqdefault.jpg`,
            publishedAt: new Date().toISOString(),
            duration: '15:00',
            subject: 'Science',
            verifiedEducational: true
          });
        }
      }
      setPlaylistVideos(mapped);
    } else {
      setPlaylistVideos([]);
    }
  }, [activePlaylistId, playlists]);

  if (!isOpen) return null;

  const handleCreatePlaylist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    const created = StorageService.createPlaylist(newPlaylistName.trim(), newPlaylistDesc.trim());
    setNewPlaylistName('');
    setNewPlaylistDesc('');
    setIsCreating(false);
    loadPlaylists();
    setActivePlaylistId(created.id);
  };

  const handleDeletePlaylist = (id: string, isDefault?: boolean) => {
    if (isDefault) return;
    StorageService.deletePlaylist(id);
    loadPlaylists();
  };

  const handleAddVideoToPl = (playlistId: string) => {
    if (!videoToAddToPlaylist) return;
    const saved = StorageService.getSavedVideos();
    if (!saved.some(v => v.id === videoToAddToPlaylist.id)) {
      StorageService.toggleSaveVideo(videoToAddToPlaylist);
    }
    StorageService.addVideoToPlaylist(playlistId, videoToAddToPlaylist.id);
    loadPlaylists();
    alert(`Added to playlist successfully!`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Bookmark className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Study Playlists & Save for Later</h2>
              <p className="text-xs text-slate-400">Organize your study lectures and revision queues</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {videoToAddToPlaylist && (
          <div className="bg-cyan-500/10 border-b border-cyan-500/20 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={videoToAddToPlaylist.thumbnailUrl} alt="" className="w-16 h-10 object-cover rounded-lg" />
              <div>
                <p className="text-xs font-semibold text-cyan-300">Adding to Playlist:</p>
                <p className="text-sm font-bold text-white line-clamp-1">{videoToAddToPlaylist.title}</p>
              </div>
            </div>
            <p className="text-xs text-slate-300 font-medium">Select a playlist below to add this video</p>
          </div>
        )}

        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar Playlist List */}
          <div className="w-72 border-r border-slate-800 p-4 flex flex-col gap-3 bg-slate-950/30 overflow-y-auto">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Your Playlists</span>
              <button
                onClick={() => setIsCreating(!isCreating)}
                className="px-2.5 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 rounded-lg text-xs font-semibold transition-all flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                New
              </button>
            </div>

            {isCreating && (
              <form onSubmit={handleCreatePlaylist} className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-2.5 animate-in fade-in-50">
                <input
                  type="text"
                  placeholder="Playlist Name"
                  value={newPlaylistName}
                  onChange={e => setNewPlaylistName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  autoFocus
                />
                <input
                  type="text"
                  placeholder="Description (optional)"
                  value={newPlaylistDesc}
                  onChange={e => setNewPlaylistDesc(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs transition-all"
                  >
                    Create
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-1.5">
              {playlists.map((pl) => {
                const isActive = pl.id === activePlaylistId;
                return (
                  <div
                    key={pl.id}
                    onClick={() => setActivePlaylistId(pl.id)}
                    className={`p-3 rounded-2xl cursor-pointer transition-all flex items-center justify-between group ${
                      isActive ? 'bg-cyan-500/15 border border-cyan-500/30 text-white' : 'hover:bg-slate-800/50 text-slate-300 border border-transparent'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <FolderPlus className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                        <p className="text-xs font-bold truncate">{pl.name}</p>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{pl.videoIds.length} videos</p>
                    </div>

                    {videoToAddToPlaylist ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddVideoToPl(pl.id);
                        }}
                        className="px-2.5 py-1 bg-cyan-500 text-slate-950 font-bold rounded-xl text-[10px] hover:bg-cyan-400 transition-all"
                      >
                        Add Here
                      </button>
                    ) : (
                      !pl.isDefault && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePlaylist(pl.id, pl.isDefault);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-400 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {playlists.find(p => p.id === activePlaylistId) && (
              <div>
                <h3 className="text-base font-bold text-white">
                  {playlists.find(p => p.id === activePlaylistId)?.name}
                </h3>
                <p className="text-xs text-slate-400">
                  {playlists.find(p => p.id === activePlaylistId)?.description || 'Curated study queue'}
                </p>
              </div>
            )}

            {playlistVideos.length === 0 ? (
              <div className="text-center py-16 space-y-3 bg-slate-950/30 rounded-3xl border border-dashed border-slate-800">
                <Film className="w-10 h-10 text-slate-600 mx-auto" />
                <p className="text-sm font-semibold text-slate-300">This playlist is currently empty</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Browse study lectures on StudyTube and tap 'Save' or 'Add to Playlist' to queue them here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {playlistVideos.map((video) => (
                  <div
                    key={video.id}
                    className="bg-slate-950/60 border border-slate-800 hover:border-slate-700 rounded-2xl p-3 flex gap-3 group transition-all"
                  >
                    <div className="relative w-28 h-20 rounded-xl overflow-hidden bg-slate-900 flex-shrink-0">
                      <img src={video.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                      <span className="absolute bottom-1 right-1 bg-slate-950/80 text-[10px] font-mono font-bold text-white px-1.5 py-0.5 rounded">
                        {video.duration}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <h4
                          onClick={() => {
                            if (onSelectVideo) {
                              onSelectVideo(video);
                              onClose();
                            }
                          }}
                          className="text-xs font-bold text-white hover:text-cyan-400 cursor-pointer line-clamp-2 transition-all"
                        >
                          {video.title}
                        </h4>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">{video.channelTitle}</p>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <button
                          onClick={() => {
                            if (onSelectVideo) {
                              onSelectVideo(video);
                              onClose();
                            }
                          }}
                          className="px-3 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          Watch
                        </button>

                        <button
                          onClick={() => {
                            StorageService.removeVideoFromPlaylist(activePlaylistId, video.id);
                            loadPlaylists();
                          }}
                          className="text-slate-500 hover:text-rose-400 p-1 transition-all"
                          title="Remove from playlist"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
