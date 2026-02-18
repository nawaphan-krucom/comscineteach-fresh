import React from 'react';
import { ArrowLeft, Award } from './icons/EmojiIcons';
import { useData } from '../contexts/DataContext';
import { ACHIEVEMENTS_LIST } from '../constants';

interface AchievementsViewProps {
  onBack: () => void;
}

const AchievementsView: React.FC<AchievementsViewProps> = ({ onBack }) => {
  const { userProgress } = useData();
  const earnedAchievements = userProgress?.achievements || [];
  const totalAchievements = ACHIEVEMENTS_LIST.length;

  return (
    <div className="h-full flex flex-col animate-fade-in">
      <header className="flex items-center gap-4 mb-6 shrink-0">
        <button onClick={onBack} className="p-3 bg-white rounded-full shadow-sm hover:bg-slate-100 transition">
          <ArrowLeft size={20}/>
        </button>
        <div>
          <h1 className="text-3xl font-bold text-slate-800 font-cute flex items-center gap-2">
            <Award className="text-amber-500" size={32}/> ความสำเร็จ (Achievements)
          </h1>
          <p className="text-slate-500 text-sm">สะสมเหรียญตราทั้งหมดเพื่อปลดล็อกรางวัลพิเศษ!</p>
        </div>
      </header>

      <div className="bg-white/50 p-6 rounded-3xl border border-white mb-6 flex items-center justify-between">
          <div>
              <p className="text-xs font-bold text-slate-500 uppercase">สะสมแล้ว</p>
              <p className="text-3xl font-black text-slate-700">{earnedAchievements.length} <span className="text-lg text-slate-400">/ {totalAchievements}</span></p>
          </div>
          <div className="w-24 bg-slate-200 h-4 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
                style={{ width: `${(earnedAchievements.length / totalAchievements) * 100}%` }}
              ></div>
          </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 -mr-2">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {ACHIEVEMENTS_LIST.map(ach => {
                const isEarned = earnedAchievements.includes(ach.id);
                return (
                    <div 
                        key={ach.id}
                        className={`p-6 rounded-3xl border-2 transition-all duration-300 flex flex-col items-center text-center
                            ${isEarned ? 'bg-white border-transparent shadow-lg transform scale-105' : 'bg-slate-50 border-slate-200 border-dashed opacity-60'}
                        `}
                    >
                        <div className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl mb-4 transition-all duration-500
                            ${isEarned ? 'bg-gradient-to-br from-yellow-300 to-orange-400 shadow-md' : 'bg-slate-200 grayscale'}
                        `}>
                            {ach.icon}
                        </div>
                        <h3 className={`font-bold text-lg ${isEarned ? 'text-slate-800' : 'text-slate-500'}`}>{ach.title}</h3>
                        <p className={`text-xs mt-1 ${isEarned ? 'text-slate-500' : 'text-slate-400'}`}>{ach.description}</p>
                    </div>
                );
            })}
        </div>
      </div>
    </div>
  );
};

export default AchievementsView;
