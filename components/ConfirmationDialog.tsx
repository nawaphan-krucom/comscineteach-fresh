import React from 'react';
import { AlertTriangle, Info } from './icons/EmojiIcons';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'info';
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="mac-window glass-card p-8 max-w-md w-full shadow-2xl border animate-scale-in">
        <div className="flex justify-between items-start mb-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${variant === 'danger' ? 'bg-red-100 text-red-500' : 'bg-blue-100 text-blue-500'}`}>
            {variant === 'danger' ? <AlertTriangle size={24} /> : <Info size={24} />}
          </div>
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2 font-cute">{title}</h3>
        <p className="text-slate-500 mb-6 text-sm leading-relaxed">{message}</p>
        <div className="flex gap-3 w-full">
          <button onClick={onClose} className="flex-1 py-3 ghost font-bold">
            {cancelText}
          </button>
          {variant === 'danger' ? (
            <button data-testid="ConfirmDialogConfirmBtn" onClick={onConfirm} className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-all">
              {confirmText}
            </button>
          ) : (
            <button data-testid="ConfirmDialogConfirmBtn" onClick={onConfirm} className="flex-1 py-3 primary font-bold">
              {confirmText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;