import React from 'react';
import { SubjectCategory } from '../types';
import { BookOpen, Award, Compass, Calculator, Atom, Code, Landmark, Globe, Scale, TrendingUp, Languages } from 'lucide-react';

interface CategoryChipsProps {
  selectedCategory: SubjectCategory;
  onSelectCategory: (cat: SubjectCategory) => void;
  selectedExam: string;
  onSelectExam: (exam: string) => void;
}

const CATEGORIES: { id: SubjectCategory; label: string; icon: React.ReactNode }[] = [
  { id: 'All', label: 'All Subjects', icon: <BookOpen className="w-3.5 h-3.5" /> },
  { id: 'Mathematics', label: 'Mathematics', icon: <Calculator className="w-3.5 h-3.5" /> },
  { id: 'Science', label: 'Science / Physics / Chem', icon: <Atom className="w-3.5 h-3.5" /> },
  { id: 'Programming', label: 'Programming & CS', icon: <Code className="w-3.5 h-3.5" /> },
  { id: 'UPSC', label: 'UPSC Civil Services', icon: <Award className="w-3.5 h-3.5" /> },
  { id: 'JEE', label: 'JEE Main & Advanced', icon: <Compass className="w-3.5 h-3.5" /> },
  { id: 'NEET', label: 'NEET Medical', icon: <Atom className="w-3.5 h-3.5" /> },
  { id: 'NCERT', label: 'NCERT Solutions', icon: <BookOpen className="w-3.5 h-3.5" /> },
  { id: 'CBSE', label: 'CBSE Board Exams', icon: <Award className="w-3.5 h-3.5" /> },
  { id: 'History', label: 'History', icon: <Landmark className="w-3.5 h-3.5" /> },
  { id: 'Geography', label: 'Geography', icon: <Globe className="w-3.5 h-3.5" /> },
  { id: 'Political Science', label: 'Political Science', icon: <Scale className="w-3.5 h-3.5" /> },
  { id: 'Economics', label: 'Economics', icon: <TrendingUp className="w-3.5 h-3.5" /> },
  { id: 'English', label: 'English Literature', icon: <Languages className="w-3.5 h-3.5" /> }
];

export const CategoryChips: React.FC<CategoryChipsProps> = ({
  selectedCategory,
  onSelectCategory
}) => {
  return (
    <div className="w-full overflow-x-auto scrollbar-none py-2">
      <div className="flex items-center gap-2 min-w-max pb-1">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap border ${
                isSelected
                  ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white border-indigo-400 shadow-lg shadow-indigo-600/25 scale-[1.02]'
                  : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <span className={isSelected ? 'text-white' : 'text-indigo-400'}>
                {cat.icon}
              </span>
              {cat.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
