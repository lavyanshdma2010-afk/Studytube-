import React, { useState, useEffect, useRef } from 'react';
import { TimerConfig, SubjectCategory } from '../types';
import { Play, Pause, RotateCcw, Settings, CheckCircle, Sparkles, Volume2, VolumeX, Bell } from 'lucide-react';
import { StorageService } from '../services/storageService';
import confetti from 'canvas-confetti';

interface StudyTimerProps {
  onSessionComplete: (minutes: number, type: 'study' | 'break', subject: SubjectCategory) => void;
  onOpenFocusMode: () => void;
}

export const StudyTimer: React.FC<StudyTimerProps> = ({
  onSessionComplete,
  onOpenFocusMode
}) => {
  const [config, setConfig] = useState<TimerConfig>(StorageService.getTimerConfig());
  const [mode, setMode] = useState<'study' | 'break'>('study');
  const [selectedSubject, setSelectedSubject] = useState<SubjectCategory>('Mathematics');
  const [isRunning, setIsRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(config.studyMinutes * 60);
  const [showSettings, setShowSettings] = useState(false);

  // Custom inputs state
  const [customStudyMins, setCustomStudyMins] = useState(config.studyMinutes);
  const [customBreakMins, setCustomBreakMins] = useState(config.breakMinutes);

  const audioCtxRef = useRef<AudioContext | null>(null);

  // Sync timer when mode or config changes
  useEffect(() => {
    if (!isRunning) {
      setSecondsLeft(mode === 'study' ? config.studyMinutes * 60 : config.breakMinutes * 60);
    }
  }, [mode, config.studyMinutes, config.breakMinutes]);

  // Play chime sound using Web Audio API
  const playCompletionChime = () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;
      // Synthesize pleasant two-tone chime
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'triangle';

      osc1.frequency.setValueAtTime(523.25, now); // C5
      osc1.frequency.exponentialRampToValueAtTime(659.25, now + 0.3); // E5
      osc1.frequency.exponentialRampToValueAtTime(783.99, now + 0.6); // G5

      osc2.frequency.setValueAtTime(261.63, now); // C4
      osc2.frequency.exponentialRampToValueAtTime(329.63, now + 0.6); // E4

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 1.2);
      osc2.stop(now + 1.2);
    } catch (e) {
      console.error('Audio play error:', e);
    }
  };

  // Timer interval countdown
  useEffect(() => {
    let timer: any = null;
    if (isRunning) {
      timer = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsRunning(false);

            if (config.soundEnabled) {
              playCompletionChime();
            }

            // Confetti celebration for completed study
            if (mode === 'study') {
              confetti({
                particleCount: 80,
                spread: 70,
                origin: { y: 0.6 }
              });
              onSessionComplete(config.studyMinutes, 'study', selectedSubject);
              // Switch to break mode
              setMode('break');
              setSecondsLeft(config.breakMinutes * 60);
            } else {
              onSessionComplete(config.breakMinutes, 'break', selectedSubject);
              setMode('study');
              setSecondsLeft(config.studyMinutes * 60);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timer);
    }

    return () => clearInterval(timer);
  }, [isRunning, mode, config, selectedSubject, onSessionComplete]);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const newConfig: TimerConfig = {
      ...config,
      studyMinutes: Math.max(1, Math.min(180, customStudyMins)),
      breakMinutes: Math.max(1, Math.min(60, customBreakMins))
    };
    setConfig(newConfig);
    StorageService.saveTimerConfig(newConfig);
    setShowSettings(false);
    setIsRunning(false);
    setSecondsLeft(mode === 'study' ? newConfig.studyMinutes * 60 : newConfig.breakMinutes * 60);
  };

  const totalSeconds = (mode === 'study' ? config.studyMinutes * 60 : config.breakMinutes * 60) || 1;
  const rawPercent = ((totalSeconds - secondsLeft) / totalSeconds) * 100;
  const progressPercent = isFinite(rawPercent) ? Math.min(100, Math.max(0, rawPercent)) : 0;

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div className="w-full max-w-2xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
      
      {/* Background ambient glow */}
      <div className={`absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl pointer-events-none transition-all duration-1000 ${
        mode === 'study' ? 'bg-indigo-600/15' : 'bg-emerald-600/15'
      }`} />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full animate-ping ${mode === 'study' ? 'bg-indigo-400' : 'bg-emerald-400'}`} />
          <h2 className="text-xl font-bold text-white tracking-tight">
            Pomodoro Focus Timer
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            title="Custom Timer Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Settings Panel Drawer */}
      {showSettings && (
        <form onSubmit={handleSaveSettings} className="mb-6 p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Custom Timing Configuration
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Study Session (Minutes)
              </label>
              <input
                type="number"
                min="1"
                max="180"
                value={customStudyMins}
                onChange={(e) => setCustomStudyMins(parseInt(e.target.value, 10) || 40)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm font-bold text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Break Duration (Minutes)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={customBreakMins}
                onChange={(e) => setCustomBreakMins(parseInt(e.target.value, 10) || 5)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm font-bold text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => {
                const updated = { ...config, soundEnabled: !config.soundEnabled };
                setConfig(updated);
                StorageService.saveTimerConfig(updated);
              }}
              className="flex items-center gap-1.5 text-xs text-slate-300 font-medium"
            >
              {config.soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
              Completion Sound {config.soundEnabled ? 'ON' : 'OFF'}
            </button>

            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 transition-colors"
            >
              Apply Timing
            </button>
          </div>
        </form>
      )}

      {/* Mode Switcher Buttons */}
      <div className="flex items-center gap-2 p-1 bg-slate-950 rounded-2xl border border-slate-800 mb-8">
        <button
          onClick={() => {
            setMode('study');
            setIsRunning(false);
            setSecondsLeft(config.studyMinutes * 60);
          }}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            mode === 'study'
              ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-600/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4 text-cyan-300" />
          40-Min Study ({config.studyMinutes}m)
        </button>
        <button
          onClick={() => {
            setMode('break');
            setIsRunning(false);
            setSecondsLeft(config.breakMinutes * 60);
          }}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            mode === 'break'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <CheckCircle className="w-4 h-4 text-emerald-300" />
          5-Min Rest ({config.breakMinutes}m)
        </button>
      </div>

      {/* Subject Selection for Study Log */}
      {mode === 'study' && (
        <div className="mb-6 flex items-center justify-between text-xs bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80">
          <span className="text-slate-400 font-semibold">Tag Subject for Log:</span>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value as SubjectCategory)}
            className="bg-slate-900 border border-slate-800 text-indigo-300 font-bold px-3 py-1.5 rounded-xl focus:outline-none focus:border-indigo-500 text-xs"
          >
            <option value="Mathematics">Mathematics</option>
            <option value="Science">Science / Physics / Chem</option>
            <option value="Programming">Programming & CS</option>
            <option value="Geography">Geography</option>
            <option value="History">History</option>
            <option value="Political Science">Political Science</option>
            <option value="Economics">Economics</option>
            <option value="English">English</option>
            <option value="UPSC">UPSC</option>
            <option value="JEE">JEE</option>
            <option value="NEET">NEET</option>
            <option value="NCERT">NCERT</option>
            <option value="CBSE">CBSE</option>
          </select>
        </div>
      )}

      {/* Clock Visual Display */}
      <div className="flex flex-col items-center justify-center my-6 relative">
        {/* Circular Progress Ring */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
            {/* Background Track */}
            <circle
              cx="50"
              cy="50"
              r="44"
              stroke="currentColor"
              strokeWidth="6"
              className="text-slate-950"
              fill="transparent"
            />
            {/* Animated Progress Ring */}
            <circle
              cx="50"
              cy="50"
              r="44"
              stroke="currentColor"
              strokeWidth="6"
              strokeDasharray={276.46}
              strokeDashoffset={276.46 - (276.46 * progressPercent) / 100}
              strokeLinecap="round"
              className={`transition-all duration-1000 ${
                mode === 'study' ? 'text-indigo-500' : 'text-emerald-500'
              }`}
              fill="transparent"
            />
          </svg>

          {/* Time Text Inside Ring */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="font-mono text-5xl sm:text-6xl font-black tracking-tight text-white drop-shadow-md">
              {formattedTime}
            </span>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-2">
              {mode === 'study' ? 'Study Focus Session' : 'Rest & Refresh'}
            </span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 mt-6">
        <button
          onClick={() => setIsRunning(!isRunning)}
          className={`px-8 py-3.5 rounded-2xl font-bold text-sm flex items-center gap-2 shadow-xl transition-all active:scale-95 ${
            isRunning
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30'
              : mode === 'study'
              ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/40'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/40'
          }`}
        >
          {isRunning ? (
            <>
              <Pause className="w-5 h-5" /> Pause Timer
            </>
          ) : (
            <>
              <Play className="w-5 h-5 fill-current" /> Start Session
            </>
          )}
        </button>

        <button
          onClick={() => {
            setIsRunning(false);
            setSecondsLeft(mode === 'study' ? config.studyMinutes * 60 : config.breakMinutes * 60);
          }}
          className="p-3.5 rounded-2xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors border border-slate-700"
          title="Reset Timer"
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        {/* Fullscreen Immersive Focus Launcher */}
        <button
          onClick={onOpenFocusMode}
          className="px-4 py-3.5 rounded-2xl bg-slate-950 hover:bg-slate-800 text-cyan-400 border border-cyan-500/30 text-xs font-bold flex items-center gap-1.5 transition-all"
        >
          <Sparkles className="w-4 h-4" /> Fullscreen Focus
        </button>
      </div>

    </div>
  );
};
