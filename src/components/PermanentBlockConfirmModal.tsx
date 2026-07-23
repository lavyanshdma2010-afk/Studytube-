import React from 'react';
import { ShieldAlert, X } from 'lucide-react';

interface PermanentBlockConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  targetName: string;
  type: 'keyword' | 'channel';
}

export const PermanentBlockConfirmModal: React.FC<PermanentBlockConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  targetName,
  type,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-red-500/30 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
        <div className="flex items-start justify-between">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center shrink-0 border border-red-500/20">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-extrabold text-white tracking-tight">Block permanently?</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Are you sure you want to block the {type} <strong className="text-red-400 font-mono">"{targetName}"</strong>?
          </p>
          <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-2xl text-[11px] text-red-300 leading-normal font-medium">
            ⚠️ This {type} will be permanently blocked in StudyTube and cannot be unblocked from the normal app settings.
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all border border-slate-700"
          >
            CANCEL
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg hover:shadow-red-500/10"
          >
            PERMANENTLY BLOCK
          </button>
        </div>
      </div>
    </div>
  );
};
