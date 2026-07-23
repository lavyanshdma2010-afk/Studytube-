import React from 'react';
import { BookOpen, Clock, Flame, Award, TrendingUp, Sparkles } from 'lucide-react';
import { UserStats, SubjectCategory } from '../types';

interface SubjectDashboardViewProps {
  stats: UserStats;
}

export const SubjectDashboardView: React.FC<SubjectDashboardViewProps> = ({ stats }) => {
  const subjects: SubjectCategory[] = [
    'Political Science',
    'Geography',
    'History',
    'Mathematics',
    'Science',
    'Programming',
    'Psychology',
    'Legal Studies',
    'Economics',
    'UPSC',
    'JEE',
    'NEET',
    'NCERT',
    'CBSE',
    'Revision'
  ];

  const subjectBreakdown = stats.subjectBreakdown || {};
  const totalMins = stats.totalMinutesStudied || 1;

  // sort subjects by study duration descending
  const sortedSubjects = [...subjects].sort((a, b) => {
    return (subjectBreakdown[b] || 0) - (subjectBreakdown[a] || 0);
  });

  const maxSubjectMins = Math.max(1, ...Object.values(subjectBreakdown));

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Subject Study Dashboard</h2>
            <p className="text-xs text-slate-400">Track and analyze deep study hours across your curriculum</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-950/60 border border-slate-800 px-4 py-2 rounded-2xl text-center">
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Total Logged</p>
            <p className="text-lg font-black text-cyan-400">{(stats.totalMinutesStudied / 60).toFixed(1)} hrs</p>
          </div>
          <div className="bg-slate-950/60 border border-slate-800 px-4 py-2 rounded-2xl text-center">
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Streak</p>
            <p className="text-lg font-black text-amber-400">{stats.currentStreak} Days</p>
          </div>
        </div>
      </div>
      
      {/* Today's Streak Progress */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-slate-300">Today's Study Streak</p>
          <p className="text-[10px] text-slate-500">
            {(stats.dailyMinutes[new Date().toISOString().split('T')[0]] || 0) >= 10 
              ? "Today's streak completed" 
              : `Progress: ${stats.dailyMinutes[new Date().toISOString().split('T')[0]] || 0} / 10 min`}
          </p>
        </div>
        <div className="w-24 h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
           <div 
            className="h-full bg-amber-500 rounded-full"
            style={{ width: `${Math.min(100, ((stats.dailyMinutes[new Date().toISOString().split('T')[0]] || 0) / 10) * 100)}%` }}
           />
        </div>
      </div>

      {/* Grid of Subject Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedSubjects.map((sub) => {
          const mins = subjectBreakdown[sub] || 0;
          const hours = (mins / 60).toFixed(1);
          const percent = Math.min(100, Math.round((mins / maxSubjectMins) * 100));

          return (
            <div
              key={sub}
              className="bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 rounded-3xl p-5 flex flex-col justify-between space-y-4 shadow-lg transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white">{sub}</span>
                <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-xl border border-cyan-500/20">
                  {hours} hrs ({mins}m)
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
                  <span>Relative Activity</span>
                  <span>{percent}%</span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full transition-all duration-500"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <span>Weekly & Monthly Pace</span>
                <span className="text-emerald-400 font-medium">Active Focus</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
