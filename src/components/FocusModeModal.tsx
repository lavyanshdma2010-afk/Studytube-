import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, Sparkles, Volume2, VolumeX, RefreshCw, Quote, ShieldAlert } from 'lucide-react';
import { MOTIVATIONAL_QUOTES } from '../data/quotes';

interface FocusModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStudyLogged?: (minutes: number) => void;
}

export const FocusModeModal: React.FC<FocusModeModalProps> = ({
  isOpen,
  onClose,
  onStudyLogged
}) => {
  if (!isOpen) return null;

  const [seconds, setSeconds] = useState(40 * 60); // 40 min
  const [isRunning, setIsRunning] = useState(true);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [ambientSound, setAmbientSound] = useState<'off' | 'rain' | 'waves'>('off');

  const audioCtxRef = useRef<AudioContext | null>(null);
  const noiseNodeRef = useRef<AudioNode | null>(null);

  // Timer interval
  useEffect(() => {
    let interval: any = null;
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((s) => {
          if (s <= 1) {
            clearInterval(interval);
            setIsRunning(false);
            if (onStudyLogged) onStudyLogged(40);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, onStudyLogged]);

  // Ambient sound generator via Web Audio API
  useEffect(() => {
    if (ambientSound === 'off') {
      if (noiseNodeRef.current) {
        try {
          (noiseNodeRef.current as any).disconnect();
        } catch (e) {}
        noiseNodeRef.current = null;
      }
      return;
    }

    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      // Disconnect previous
      if (noiseNodeRef.current) {
        try {
          (noiseNodeRef.current as any).disconnect();
        } catch (e) {}
      }

      // Generate pink noise / rain simulation
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);

      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        output[i] *= 0.04; // low volume
        b6 = white * 0.115926;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      // Low pass filter for rain atmosphere
      const filter = ctx.createBiquadFilter();
      filter.type = ambientSound === 'rain' ? 'lowpass' : 'bandpass';
      filter.frequency.value = ambientSound === 'rain' ? 800 : 400;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.1, ctx.currentTime);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      whiteNoise.start();
      noiseNodeRef.current = whiteNoise;
    } catch (e) {
      console.error('Ambient sound error:', e);
    }

    return () => {
      if (noiseNodeRef.current) {
        try {
          (noiseNodeRef.current as any).disconnect();
        } catch (e) {}
      }
    };
  }, [ambientSound]);

  const currentQuote = MOTIVATIONAL_QUOTES[quoteIndex % MOTIVATIONAL_QUOTES.length];

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col justify-between p-6 sm:p-12 overflow-hidden animate-fade-in">
      
      {/* Background Pulsing Aura */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl animate-pulse" />
      </div>

      {/* Top Bar */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-bold text-sm text-slate-100">StudyTube Focus Shield</h2>
            <p className="text-[11px] text-slate-400">All distractions, notifications & videos locked out</p>
          </div>
        </div>

        {/* Ambient Sound Controls & Exit */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-medium">
            <span className="text-slate-400">Ambience:</span>
            <button
              onClick={() => setAmbientSound('off')}
              className={`px-2 py-0.5 rounded ${ambientSound === 'off' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
            >
              Off
            </button>
            <button
              onClick={() => setAmbientSound('rain')}
              className={`px-2 py-0.5 rounded ${ambientSound === 'rain' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
            >
              Rain
            </button>
            <button
              onClick={() => setAmbientSound('waves')}
              className={`px-2 py-0.5 rounded ${ambientSound === 'waves' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
            >
              Focus Waves
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Center Section: Ticking Focus Timer & Breathing Circle */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center max-w-xl mx-auto my-auto py-8">
        
        {/* Timer Display */}
        <div className="mb-8">
          <span className="font-mono text-7xl sm:text-8xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-indigo-300 drop-shadow-xl">
            {formatTime(seconds)}
          </span>
          <p className="text-xs font-bold text-cyan-400 uppercase tracking-widest mt-2 flex items-center justify-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5" /> Deep Study In Progress
          </p>
        </div>

        {/* Play/Pause Control */}
        <div className="flex items-center gap-4 mb-10">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`px-8 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 transition-all ${
              isRunning
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/40'
            }`}
          >
            {isRunning ? <><Pause className="w-5 h-5" /> Pause Timer</> : <><Play className="w-5 h-5 fill-current" /> Resume Timer</>}
          </button>
        </div>

        {/* Motivational Quote Card */}
        <div className="w-full bg-slate-900/80 border border-slate-800/80 rounded-3xl p-6 relative backdrop-blur-md">
          <Quote className="w-8 h-8 text-indigo-500/30 absolute top-4 left-4" />
          <p className="text-sm sm:text-base font-medium italic text-slate-200 relative z-10 px-4">
            "{currentQuote.text}"
          </p>
          <p className="text-xs font-bold text-indigo-400 mt-3 tracking-wide">
            — {currentQuote.author}
          </p>

          <button
            onClick={() => setQuoteIndex(i => i + 1)}
            className="mt-4 text-[11px] font-semibold text-slate-400 hover:text-white flex items-center gap-1 mx-auto"
          >
            <RefreshCw className="w-3 h-3" /> Next Motivational Quote
          </button>
        </div>

      </div>

      {/* Footer */}
      <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 border-t border-slate-900 pt-4">
        <span>Press ESC or X above to exit Focus Mode</span>
        <span className="text-emerald-400 font-semibold">Zero Distractions Guarantee</span>
      </div>

    </div>
  );
};
