import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Coffee, Brain } from './icons/EmojiIcons';

const PomodoroTimer: React.FC = () => {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'focus' | 'break'>('focus'); // focus = 25, break = 5

  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isActive) {
      timerRef.current = window.setInterval(() => {
        setSeconds((prevSeconds) => {
          if (prevSeconds === 0) {
            setMinutes((prevMinutes) => {
              if (prevMinutes === 0) {
                clearInterval(timerRef.current!);
                setIsActive(false);
                return 0;
              }
              return prevMinutes - 1;
            });
            return 59;
          }
          return prevSeconds - 1;
        });
      }, 1000);
    } else if (!isActive && timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    if (mode === 'focus') {
      setMinutes(25);
    } else {
      setMinutes(5);
    }
    setSeconds(0);
  };

  const switchMode = (newMode: 'focus' | 'break') => {
    if (mode === newMode) return;
    setIsActive(false);
    setMode(newMode);
    setMinutes(newMode === 'focus' ? 25 : 5);
    setSeconds(0);
  };

  const formatTime = (time: number) => time < 10 ? `0${time}` : time;

  return (
    <div className="bg-white/40 backdrop-blur-sm p-2 rounded-full border border-white/40 shadow-sm flex items-center gap-3">
      <div className="flex items-center gap-1 pl-1">
        <button onClick={() => switchMode('focus')} className={`p-1 rounded-full ${mode === 'focus' ? 'bg-white shadow-sm' : ''}`}><Brain size={16} className="text-indigo-500"/></button>
        <button onClick={() => switchMode('break')} className={`p-1 rounded-full ${mode === 'break' ? 'bg-white shadow-sm' : ''}`}><Coffee size={16} className="text-amber-500"/></button>
      </div>

      <div className={`text-xl font-black font-mono tracking-widest ${mode === 'focus' ? 'text-indigo-600' : 'text-amber-600'}`}>
        {formatTime(minutes)}:{formatTime(seconds)}
      </div>
      
      <div className="flex gap-1">
          <button 
            onClick={toggleTimer}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-white shadow-md hover:scale-110 transition-transform ${mode === 'focus' ? 'bg-indigo-500' : 'bg-amber-500'}`}
          >
            {isActive ? <Pause size={14} fill="currentColor"/> : <Play size={14} fill="currentColor" className="ml-0.5"/>}
          </button>
          <button 
            onClick={resetTimer}
            className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-slate-400 shadow-sm hover:text-slate-600 hover:scale-110 transition-transform"
          >
            <RotateCcw size={14}/>
          </button>
      </div>
    </div>
  );
};

export default PomodoroTimer;
