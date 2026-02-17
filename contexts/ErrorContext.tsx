

/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';

export interface AppError {
  id: string;
  message: string;
  type: 'error' | 'warning' | 'info' | 'success';
  timestamp: number;
}

interface ErrorContextType {
  errors: AppError[];
  logError: (message: string, type?: 'error' | 'warning' | 'info' | 'success') => void;
  clearError: (id: string) => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export const ErrorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [errors, setErrors] = useState<AppError[]>([]);

  const logError = useCallback((message: string, type: 'error' | 'warning' | 'info' | 'success' = 'error') => {
    const newError: AppError = {
      id: Math.random().toString(36).substring(7),
      message,
      type,
      timestamp: Date.now(),
    };
    
    setErrors((prev) => [...prev, newError]);
    
    if (type === 'error') console.error(`[App Error]: ${message}`);
    else if (type === 'warning') console.warn(`[App Warning]: ${message}`);
    else console.log(`[App Info]: ${message}`);

    setTimeout(() => {
        setErrors(prev => prev.filter(e => e.id !== newError.id));
    }, 5000);
  }, []);

  const clearError = useCallback((id: string) => {
    setErrors((prev) => prev.filter((e) => e.id !== id));
  }, []);

  return (
    <ErrorContext.Provider value={{ errors, logError, clearError }}>
      {children}
    </ErrorContext.Provider>
  );
};

export const useError = () => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
};
