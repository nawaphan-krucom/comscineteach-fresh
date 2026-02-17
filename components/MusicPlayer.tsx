import React from 'react';
import { useMusic } from '../contexts/MusicContext';
import { Play, Pause } from './icons/EmojiIcons';

const MusicPlayer: React.FC = () => {
  const { currentSong, isPlaying, togglePlay } = useMusic();

  return (
    <div className="bg-white/40 backdrop-blur-sm p-2 rounded-full border border-white/40 shadow-sm flex items-center gap-2 group">
        <div className={`w-10 h-10 rounded-full overflow-hidden shadow-sm shrink-0 ${isPlaying ? 'animate-spin-slow' : ''}`}>
            <img src={currentSong.cover} alt="Cover" className="w-full h-full object-cover" />
        </div>
        <div className="overflow-hidden flex-1 min-w-0 pr-2">
            <p className="text-xs font-bold text-slate-700 truncate font-cute">{currentSong.title}</p>
            <p className="text-[9px] text-slate-500 truncate">{currentSong.artist}</p>
        </div>
        <button 
            onClick={togglePlay}
            className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-pink-500 shadow-sm hover:scale-110 transition shrink-0"
        >
            {isPlaying ? <Pause size={12} fill="currentColor"/> : <Play size={12} fill="currentColor" className="ml-0.5"/>}
        </button>
    </div>
  );
};

export default MusicPlayer;