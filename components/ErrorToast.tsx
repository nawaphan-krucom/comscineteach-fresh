
import React from 'react';
import { useError } from '../contexts/ErrorContext';
import { XCircle, AlertCircle, Info, X, CheckCircle2 } from './icons/EmojiIcons';

const ErrorToast: React.FC = () => {
  const { errors, clearError } = useError();

  if (errors.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none" aria-live="polite">
      {errors.map((error) => (
        <div
          key={error.id}
          data-testid={error.type === 'success' ? 'ToastSuccess' : `Toast-${error.type}-${error.id}`}
          className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-xl border animate-fade-in backdrop-blur-md transition-all
            ${error.type === 'error' ? 'bg-red-50/95 border-red-200 text-red-800' : 
              error.type === 'warning' ? 'bg-amber-50/95 border-amber-200 text-amber-800' : 
              error.type === 'success' ? 'bg-green-50/95 border-green-200 text-green-800' :
              'bg-blue-50/95 border-blue-200 text-blue-800'}`}
        >
          <div className="mt-0.5 shrink-0">
             {error.type === 'error' ? <XCircle size={20}/> : 
              error.type === 'warning' ? <AlertCircle size={20}/> : 
              error.type === 'success' ? <CheckCircle2 size={20}/> :
              <Info size={20}/>}
          </div>
          <div className="flex-1 min-w-0">
             <p className="text-sm font-bold mb-0.5 capitalize">
               {error.type === 'error' ? 'เกิดข้อผิดพลาด' : 
                error.type === 'warning' ? 'คำเตือน' : 
                error.type === 'success' ? 'สำเร็จ' : 'แจ้งเตือน'}
             </p>
             <p className="text-sm opacity-90 break-words leading-tight">{error.message}</p>
          </div>
          <button 
            onClick={() => clearError(error.id)}
            className="text-current opacity-50 hover:opacity-100 p-1 hover:bg-black/5 rounded"
          >
            <X size={16}/>
          </button>
        </div>
      ))}
    </div>
  );
};

export default ErrorToast;
