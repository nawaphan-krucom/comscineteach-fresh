
import React from 'react';
import { useData } from '../contexts/DataContext';
import { ArrowLeft, Trophy, Star } from './icons/EmojiIcons';

interface LeaderboardViewProps {
  onBack: () => void;
}

const LeaderboardView: React.FC<LeaderboardViewProps> = ({ onBack }) => {
  const { user, getLeaderboard } = useData();
  const leaderboard = getLeaderboard();

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-br from-amber-400 to-yellow-500 text-white border-yellow-500';
    if (rank === 2) return 'bg-gradient-to-br from-slate-300 to-slate-400 text-white border-slate-400';
    if (rank === 3) return 'bg-gradient-to-br from-orange-400 to-amber-600 text-white border-orange-500';
    return 'bg-white text-slate-500 border-slate-200';
  };

  return (
    <div className="h-full flex flex-col animate-fade-in">
      <header className="flex items-center gap-4 mb-6 shrink-0">
        <button onClick={onBack} className="p-3 bg-white rounded-full shadow-sm hover:bg-slate-100 transition">
          <ArrowLeft size={20}/>
        </button>
        <div>
          <h1 className="text-3xl font-bold text-slate-800 font-cute flex items-center gap-2">
            <Trophy className="text-amber-500" size={32}/> กระดานผู้นำ (Leaderboard)
          </h1>
          <p className="text-slate-500 text-sm">จัดอันดับคะแนนรวมของนักเรียนทั้งหมดในห้องเรียน</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 -mr-2">
        <div className="space-y-3 max-w-4xl mx-auto">
          {leaderboard.map(entry => {
            const isCurrentUser = user && entry.studentId === user.id;
            const rankColor = getRankColor(entry.rank);

            return (
              <div
                key={entry.studentId}
                className={`flex items-center p-4 rounded-2xl transition-all duration-300 border-2 ${
                  isCurrentUser ? 'bg-indigo-50 border-indigo-500 shadow-lg scale-105' : 'bg-white border-transparent'
                }`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-black mr-4 border-2 shadow-sm shrink-0 ${rankColor}`}>
                  {entry.rank}
                </div>
                <div className="w-12 h-12 text-3xl bg-slate-100 rounded-full flex items-center justify-center mr-4 shrink-0">
                  {entry.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-800 truncate">{entry.name}</p>
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    {entry.badges.slice(0, 3).map(() => '🏆')}
                  </div>
                </div>
                <div className="text-right ml-4 shrink-0">
                    <p className="text-2xl font-black text-indigo-600">{entry.totalScore}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Points</p>
                </div>
                {isCurrentUser && <Star size={16} className="text-yellow-500 ml-4 shrink-0" fill="currentColor"/>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LeaderboardView;
