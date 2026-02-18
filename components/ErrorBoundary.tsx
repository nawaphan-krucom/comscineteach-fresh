import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from './icons/EmojiIcons';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen w-screen flex items-center justify-center bg-red-50 p-4 font-sans">
          <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md text-center border border-red-100">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
                <AlertTriangle size={40}/>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">อุ๊ปส์! เกิดข้อผิดพลาด</h1>
            <p className="text-gray-500 mb-6">ระบบทำงานขัดข้อง โปรดรีเฟรชหน้าจอเพื่อลองใหม่อีกครั้ง</p>
            <div className="bg-slate-50 p-4 rounded-xl text-left mb-6 overflow-auto max-h-32 text-xs text-red-400 font-mono border border-slate-200">
                {this.state.error?.message}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-red-500 text-white rounded-xl font-bold shadow-lg hover:bg-red-600 transition-all flex items-center justify-center gap-2 w-full"
            >
              <RefreshCw size={18}/> รีโหลดหน้าจอ
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;