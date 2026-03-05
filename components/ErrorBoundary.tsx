
import React, { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can also log the error to an error reporting service here
    console.error("Uncaught error:", error, errorInfo);
  }

  handleRefresh = () => {
    window.location.reload();
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 text-center">
          <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md border border-slate-100 animate-fade-in-up">
            <div className="w-20 h-20 bg-red-50 text-lt-red rounded-full flex items-center justify-center mx-auto mb-6 border border-red-100">
                <i className="fas fa-bug text-4xl"></i>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-800 mb-2">Oops! Something went wrong.</h1>
            <p className="text-slate-600 mb-8 leading-relaxed text-sm">
              We encountered an unexpected error. Don't worry, it's not your fault. A quick refresh usually fixes it.
            </p>
            <button 
                onClick={this.handleRefresh}
                className="w-full bg-lt-orange text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:bg-lt-red transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2"
            >
                <i className="fas fa-redo-alt"></i> Refresh Page
            </button>
            
            {/* Developer Error Details */}
            {this.state.error && (
                <div className="mt-8 p-4 bg-slate-50 rounded-xl text-left border border-slate-200 overflow-hidden">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Error Details</p>
                    <p className="text-xs font-mono text-red-500 break-all">
                        {this.state.error.toString()}
                    </p>
                </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;