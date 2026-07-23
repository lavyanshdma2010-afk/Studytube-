import React from 'react';
import { Flame, Clock, ShieldCheck, Download, Moon, Sun, Sparkles, BookOpen, Bookmark, Sliders, FolderPlus, Calendar } from 'lucide-react';
import { UserStats } from '../types';
import { StudyTubeLogo } from './StudyTubeLogo';

interface NavbarProps {
  stats: UserStats;
  activeTab: 'home' | 'timer' | 'stats' | 'bookmarks' | 'subjects' | 'settings';
  setActiveTab: (tab: 'home' | 'timer' | 'stats' | 'bookmarks' | 'subjects' | 'settings') => void;
  onOpenFocusMode: () => void;
  onOpenAndroidExport: () => void;
  onOpenPlaylists: () => void;
  onOpenExamMode: () => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  stats,
  activeTab,
  setActiveTab,
  onOpenFocusMode,
  onOpenAndroidExport,
  onOpenPlaylists,
  onOpenExamMode,
  darkMode,
  setDarkMode
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#2B2930]/95 backdrop-blur-md border-b border-[#49454F] text-[#E6E1E5] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setActiveTab('home')}>
          <div className="w-11 h-11 flex items-center justify-center group-hover:scale-105 transition-transform">
            <StudyTubeLogo size={42} color="#D0BCFF" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-white">
                StudyTube
              </span>
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#381E72] text-[#D0BCFF] border border-[#49454F] rounded-full flex items-center gap-0.5">
                <ShieldCheck className="w-3 h-3" /> Distraction Free
              </span>
            </div>
            <p className="text-[11px] text-[#CAC4D0] hidden sm:block font-medium">
              Verified Educational YouTube Application
            </p>
          </div>
        </div>

        {/* Navigation Tabs (Material 3 Pill Nav) */}
        <nav className="hidden xl:flex items-center gap-1 bg-[#1C1B1F] p-1.5 rounded-full border border-[#49454F]">
          <button
            onClick={() => setActiveTab('home')}
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
              activeTab === 'home'
                ? 'bg-[#D0BCFF] text-[#381E72] shadow-md scale-[1.02]'
                : 'text-[#CAC4D0] hover:text-white hover:bg-[#2B2930]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Explore
          </button>
          <button
            onClick={() => setActiveTab('subjects')}
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
              activeTab === 'subjects'
                ? 'bg-[#D0BCFF] text-[#381E72] shadow-md scale-[1.02]'
                : 'text-[#CAC4D0] hover:text-white hover:bg-[#2B2930]'
            }`}
          >
            Subjects
          </button>
          <button
            onClick={() => setActiveTab('timer')}
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
              activeTab === 'timer'
                ? 'bg-[#D0BCFF] text-[#381E72] shadow-md scale-[1.02]'
                : 'text-[#CAC4D0] hover:text-white hover:bg-[#2B2930]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Timer
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
              activeTab === 'stats'
                ? 'bg-[#D0BCFF] text-[#381E72] shadow-md scale-[1.02]'
                : 'text-[#CAC4D0] hover:text-white hover:bg-[#2B2930]'
            }`}
          >
            Stats
          </button>
          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
              activeTab === 'bookmarks'
                ? 'bg-[#D0BCFF] text-[#381E72] shadow-md scale-[1.02]'
                : 'text-[#CAC4D0] hover:text-white hover:bg-[#2B2930]'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            Saved
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
              activeTab === 'settings'
                ? 'bg-[#D0BCFF] text-[#381E72] shadow-md scale-[1.02]'
                : 'text-[#CAC4D0] hover:text-white hover:bg-[#2B2930]'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            Settings
          </button>
        </nav>

        {/* Right Badges & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Playlists Button */}
          <button
            onClick={onOpenPlaylists}
            className="p-2.5 rounded-2xl bg-[#1C1B1F] hover:bg-[#36343B] text-[#D0BCFF] transition-all border border-[#49454F]"
            title="Playlists & Save for Later"
          >
            <FolderPlus className="w-4 h-4" />
          </button>

          {/* Exam Mode Button */}
          <button
            onClick={onOpenExamMode}
            className="p-2.5 rounded-2xl bg-[#1C1B1F] hover:bg-[#36343B] text-amber-300 transition-all border border-[#49454F]"
            title="Exam Mode & Countdown"
          >
            <Calendar className="w-4 h-4" />
          </button>

          {/* Daily Streak Badge */}
          <div 
            onClick={() => setActiveTab('stats')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-[#EADDFF] text-[#21005D] text-xs font-black tracking-tight cursor-pointer hover:bg-[#D0BCFF] transition-all shadow-sm"
            title="Daily Study Streak"
          >
            <Flame className="w-4 h-4 text-[#6750A4] fill-[#6750A4]/30 animate-pulse" />
            <span>{stats.currentStreak} DAY STREAK</span>
          </div>

          {/* Quick Focus Mode Launcher */}
          <button
            onClick={onOpenFocusMode}
            className="hidden lg:flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-[#6750A4] hover:bg-[#7D52A8] text-white text-xs font-bold uppercase tracking-wider shadow-md transition-all active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D0BCFF]" />
            Focus Shield
          </button>

          {/* Android Studio Export Option */}
          <button
            onClick={onOpenAndroidExport}
            className="p-2.5 rounded-2xl bg-[#1C1B1F] hover:bg-[#36343B] text-[#D0BCFF] transition-all border border-[#49454F]"
            title="Android Studio Source Files & Build Guide"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2.5 rounded-2xl bg-[#1C1B1F] hover:bg-[#36343B] text-[#D0BCFF] transition-all border border-[#49454F]"
            title="Toggle theme"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-[#D0BCFF]" />}
          </button>
        </div>
      </div>

      {/* Mobile / Tablet Tab Bar */}
      <div className="xl:hidden flex items-center justify-around border-t border-[#49454F] bg-[#1C1B1F] py-2 px-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('home')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase whitespace-nowrap ${activeTab === 'home' ? 'text-[#381E72] bg-[#D0BCFF]' : 'text-[#CAC4D0]'}`}
        >
          Explore
        </button>
        <button
          onClick={() => setActiveTab('subjects')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase whitespace-nowrap ${activeTab === 'subjects' ? 'text-[#381E72] bg-[#D0BCFF]' : 'text-[#CAC4D0]'}`}
        >
          Subjects
        </button>
        <button
          onClick={() => setActiveTab('timer')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase whitespace-nowrap ${activeTab === 'timer' ? 'text-[#381E72] bg-[#D0BCFF]' : 'text-[#CAC4D0]'}`}
        >
          Timer
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase whitespace-nowrap ${activeTab === 'stats' ? 'text-[#381E72] bg-[#D0BCFF]' : 'text-[#CAC4D0]'}`}
        >
          Stats
        </button>
        <button
          onClick={() => setActiveTab('bookmarks')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase whitespace-nowrap ${activeTab === 'bookmarks' ? 'text-[#381E72] bg-[#D0BCFF]' : 'text-[#CAC4D0]'}`}
        >
          Saved
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase whitespace-nowrap ${activeTab === 'settings' ? 'text-[#381E72] bg-[#D0BCFF]' : 'text-[#CAC4D0]'}`}
        >
          Settings
        </button>
      </div>
    </header>
  );
};
