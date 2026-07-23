import React, { ErrorInfo, ReactNode } from 'react';
import { AlertOctagon, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error inside ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl my-6 max-w-2xl mx-auto text-center space-y-4 shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
            <AlertOctagon className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-base font-bold text-white">
              {this.props.fallbackTitle || 'A widget in this view failed to load'}
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Our error safeguard intercepted an issue inside this view. Don't worry, your other StudyTube features and saved statistics remain fully intact.
            </p>
          </div>
          {this.state.error && (
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[10px] text-rose-300 max-h-24 overflow-y-auto text-left whitespace-pre-wrap">
              {this.state.error.message}
            </div>
          )}
          <button
            onClick={this.handleReset}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reload Workspace
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
