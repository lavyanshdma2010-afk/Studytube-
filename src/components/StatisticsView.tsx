import React, { useState } from 'react';
import { UserStats, StudySession, SubjectCategory } from '../types';
import { Flame, Clock, Award, Calendar as CalendarIcon, PieChart, TrendingUp, CheckCircle, Sparkles } from 'lucide-react';
import { StorageService } from '../services/storageService';

interface StatisticsViewProps {
  stats: UserStats;
}

export const StatisticsView: React.FC<StatisticsViewProps> = ({ stats }) => {
  const sessions: StudySession[] = StorageService.getSessions();
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  // Days of week array for chart
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Defensive fallback copy of stats to ensure absolute stability against undefined objects/properties
  const safeStats: UserStats = {
    currentStreak: stats?.currentStreak ?? 0,
    bestStreak: stats?.bestStreak ?? 0,
    totalMinutesStudied: stats?.totalMinutesStudied ?? 0,
    totalSessionsCompleted: stats?.totalSessionsCompleted ?? 0,
    lastStudiedDate: stats?.lastStudiedDate ?? null,
    lastStreakDate: stats?.lastStreakDate ?? null,
    weeklyMinutes: {
      Mon: 0,
      Tue: 0,
      Wed: 0,
      Thu: 0,
      Fri: 0,
      Sat: 0,
      Sun: 0,
      ...(stats?.weeklyMinutes || {})
    },
    monthlyMinutes: stats?.monthlyMinutes || {},
    dailyMinutes: stats?.dailyMinutes || {},
    subjectBreakdown: stats?.subjectBreakdown || {}
  };

  const maxWeeklyMins = Math.max(60, ...daysOfWeek.map(d => safeStats.weeklyMinutes[d] || 0));

  // Calculate total hours
  const totalHours = (safeStats.totalMinutesStudied / 60).toFixed(1);

  // Subject breakdown list sorted by duration
  const subjectEntries = Object.entries(safeStats.subjectBreakdown || {}) as [SubjectCategory, number][];
  subjectEntries.sort((a, b) => b[1] - a[1]);
  const maxSubjectMins = Math.max(1, ...subjectEntries.map(e => e[1]));

  // Calendar Heatmap data generator for current month
  const getDaysInMonth = (yearMonth: string) => {
    const [year, month] = yearMonth.split('-').map(Number);
    const date = new Date(year, month - 1, 1);
    const days: { dateStr: string; dayNum: number; minutes: number }[] = [];
    
    while (date.getMonth() === month - 1) {
      const dStr = date.toISOString().split('T')[0];
      // Sum minutes studied on this day
      const dayMins = sessions
        .filter(s => s.date === dStr && s.type === 'study')
        .reduce((acc, s) => acc + s.durationMinutes, 0);

      days.push({
        dateStr: dStr,
        dayNum: date.getDate(),
        minutes: dayMins
      });
      date.setDate(date.getDate() + 1);
    }
    return days;
  };

  const calendarDays = getDaysInMonth(selectedMonth);

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
      
      {/* Top Banner Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Streak Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Current Streak</p>
            <h3 className="text-3xl font-black text-amber-400 mt-1 flex items-baseline gap-1">
              {safeStats.currentStreak} <span className="text-sm font-bold text-slate-400">Days</span>
            </h3>
            <p className="text-[11px] text-amber-500/80 mt-1 font-medium">Best: {safeStats.bestStreak} Days streak</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
            <Flame className="w-6 h-6 fill-amber-400/20 animate-pulse" />
          </div>
        </div>

        {/* Total Time Studied */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Learning</p>
            <h3 className="text-3xl font-black text-cyan-400 mt-1 flex items-baseline gap-1">
              {totalHours} <span className="text-sm font-bold text-slate-400">Hours</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">{safeStats.totalMinutesStudied} total minutes logged</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Sessions Completed */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Focus Sessions</p>
            <h3 className="text-3xl font-black text-indigo-400 mt-1 flex items-baseline gap-1">
              {safeStats.totalSessionsCompleted} <span className="text-sm font-bold text-slate-400">Completed</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">40-Min Pomodoros finished</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
        </div>

        {/* Monthly Target */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Monthly Progress</p>
            <h3 className="text-3xl font-black text-emerald-400 mt-1 flex items-baseline gap-1">
              {safeStats.monthlyMinutes[selectedMonth] || 0} <span className="text-sm font-bold text-slate-400">Mins</span>
            </h3>
            <p className="text-[11px] text-emerald-400/80 mt-1 font-medium">Consistency Grade: A+</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Weekly Study Time SVG Bar Chart (2 cols) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-400" />
                Weekly Study Time Distribution
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Study minutes completed per day this week</p>
            </div>
            <span className="px-3 py-1 rounded-xl bg-indigo-500/10 text-indigo-300 text-xs font-semibold border border-indigo-500/20">
              7-Day Activity
            </span>
          </div>

          {/* SVG Bar Chart */}
          <div className="h-56 flex items-end justify-between gap-2 pt-6 pb-2 px-2 border-b border-slate-800">
            {daysOfWeek.map((day) => {
              const mins = safeStats.weeklyMinutes[day] || 0;
              const heightPercent = Math.min(100, Math.max(8, (mins / maxWeeklyMins) * 100));
              const isToday = new Date().toLocaleDateString('en-US', { weekday: 'short' }) === day;

              return (
                <div key={day} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                  
                  {/* Tooltip on Hover */}
                  <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950 text-slate-200 border border-slate-700 text-[11px] font-mono font-bold px-2 py-1 rounded-md shadow-lg pointer-events-none z-20 whitespace-nowrap">
                    {day}: {mins} mins
                  </div>

                  {/* Bar Visual */}
                  <div className="w-full max-w-[42px] bg-slate-950 rounded-2xl p-1 h-full flex flex-col justify-end">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full rounded-xl transition-all duration-700 ${
                        isToday
                          ? 'bg-gradient-to-t from-cyan-500 to-indigo-500 shadow-lg shadow-indigo-500/30'
                          : mins > 0
                          ? 'bg-gradient-to-t from-indigo-600 to-blue-500'
                          : 'bg-slate-800/40'
                      }`}
                    />
                  </div>

                  {/* Day Label */}
                  <span className={`text-xs font-bold mt-2.5 ${isToday ? 'text-cyan-400' : 'text-slate-400'}`}>
                    {day}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block" /> Regular Study
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block" /> Today
            </span>
          </div>
        </div>

        {/* Subject Breakdown Distribution (1 col) */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <PieChart className="w-5 h-5 text-cyan-400" />
                Subject Distribution
              </h3>
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-xs text-slate-400 mb-4">Minutes invested per subject category</p>

            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {subjectEntries.length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center">No subject logs recorded yet.</p>
              ) : (
                subjectEntries.map(([subject, mins]) => {
                  const percent = Math.min(100, Math.round((mins / maxSubjectMins) * 100));
                  return (
                    <div key={subject} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-slate-200">{subject}</span>
                        <span className="text-indigo-400 font-mono">{mins} mins</span>
                      </div>
                      <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                        <div
                          style={{ width: `${percent}%` }}
                          className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full transition-all duration-500"
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 text-center font-medium">
            Keep balanced study across all subject modules
          </div>
        </div>

      </div>

      {/* Monthly Interactive Calendar Heatmap */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-emerald-400" />
              Monthly Study Activity Heatmap
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Track daily learning consistency on the calendar</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Month:</span>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 text-xs font-bold px-3 py-1.5 rounded-xl focus:outline-none"
            />
          </div>
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-xs font-bold text-slate-500 py-1">
              {day}
            </div>
          ))}

          {calendarDays.map((dayObj) => {
            const hasStudied = dayObj.minutes > 0;
            return (
              <div
                key={dayObj.dateStr}
                className={`aspect-square rounded-xl p-2 border transition-all flex flex-col items-center justify-between ${
                  hasStudied
                    ? 'bg-gradient-to-br from-emerald-600/30 to-indigo-600/30 border-emerald-500/50 text-white shadow-md'
                    : 'bg-slate-950/60 border-slate-800/80 text-slate-500 hover:border-slate-700'
                }`}
                title={`${dayObj.dateStr}: ${dayObj.minutes} minutes studied`}
              >
                <span className="text-xs font-bold">{dayObj.dayNum}</span>
                {hasStudied ? (
                  <span className="text-[10px] font-mono text-emerald-300 font-bold">
                    {dayObj.minutes}m
                  </span>
                ) : (
                  <span className="text-[9px] text-slate-600">•</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
