import React, { useState } from 'react';
import { X, Calendar, Award, Plus, Trash2, CheckCircle2, AlertCircle, BookOpen } from 'lucide-react';
import { ExamInfo } from '../types';
import { StorageService } from '../services/storageService';

interface ExamModeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExamModeModal: React.FC<ExamModeModalProps> = ({ isOpen, onClose }) => {
  const [exams, setExams] = useState<ExamInfo[]>(StorageService.getExams());
  const [isAdding, setIsAdding] = useState(false);

  const [examName, setExamName] = useState('');
  const [examDate, setExamDate] = useState('');
  const [subjectInput, setSubjectInput] = useState('');
  const [topicsInput, setTopicsInput] = useState('');

  if (!isOpen) return null;

  const handleSaveExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examName.trim() || !examDate) return;

    const newExam: ExamInfo = {
      id: `exam_${Date.now()}`,
      examName: examName.trim(),
      examDate,
      subjects: subjectInput ? subjectInput.split(',').map(s => s.trim()).filter(Boolean) : ['General'],
      topics: topicsInput ? topicsInput.split('\n').map(t => t.trim()).filter(Boolean) : []
    };

    StorageService.saveExam(newExam);
    setExams(StorageService.getExams());
    setExamName('');
    setExamDate('');
    setSubjectInput('');
    setTopicsInput('');
    setIsAdding(false);
  };

  const handleDelete = (id: string) => {
    StorageService.deleteExam(id);
    setExams(StorageService.getExams());
  };

  const getDaysRemaining = (dateStr: string) => {
    const diff = new Date(dateStr).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Exam Mode & Countdown</h2>
              <p className="text-xs text-slate-400">Target your upcoming exams and focus high-yield topics</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Active Exams</h3>
            <button
              onClick={() => setIsAdding(!isAdding)}
              className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Add Exam
            </button>
          </div>

          {isAdding && (
            <form onSubmit={handleSaveExam} className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-3 animate-in fade-in-50">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Exam Title</label>
                <input
                  type="text"
                  placeholder="e.g. Political Science Final Exam"
                  value={examName}
                  onChange={e => setExamName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Exam Date</label>
                <input
                  type="date"
                  value={examDate}
                  onChange={e => setExamDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Subjects (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Political Science, History"
                  value={subjectInput}
                  onChange={e => setSubjectInput(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Important Topics (one per line)</label>
                <textarea
                  rows={3}
                  placeholder="Constitution: Why and How&#10;Fundamental Rights"
                  value={topicsInput}
                  onChange={e => setTopicsInput(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-all"
                >
                  Save Exam
                </button>
              </div>
            </form>
          )}

          <div className="space-y-4">
            {exams.map((exam) => {
              const daysLeft = getDaysRemaining(exam.examDate);
              return (
                <div key={exam.id} className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-base font-bold text-white">{exam.examName}</h4>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3.5 h-3.5 text-amber-400" />
                        Date: {exam.examDate}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-lg font-black text-amber-400">
                        {daysLeft >= 0 ? `${daysLeft} days` : 'Exam Passed'}
                      </span>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">until exam</p>
                    </div>
                  </div>

                  {exam.subjects.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {exam.subjects.map(s => (
                        <span key={s} className="px-2.5 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 rounded-lg text-xs font-semibold">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}

                  {exam.topics.length > 0 && (
                    <div className="space-y-1.5 bg-slate-900/50 p-3 rounded-xl border border-slate-800">
                      <p className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                        Key Topics to Master:
                      </p>
                      <ul className="list-disc list-inside text-xs text-slate-400 space-y-1">
                        {exam.topics.map((t, idx) => (
                          <li key={idx}>{t}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex justify-end pt-2 border-t border-slate-800/80">
                    <button
                      onClick={() => handleDelete(exam.id)}
                      className="px-3 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl text-xs font-semibold transition-all flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Remove Exam
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
