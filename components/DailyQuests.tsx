import React from 'react';
import { useData } from '../contexts/DataContext';
import { DAILY_QUESTS_LIST } from '../constants';
import { CheckCircle2, Circle, Gift } from './icons/EmojiIcons';

const DailyQuests: React.FC = () => {
    const { userProgress } = useData();
    const today = new Date().toISOString().split('T')[0];

    const isQuestCompleted = (questId: string): boolean => {
        if (!userProgress?.quests) return false;
        const questData = userProgress.quests[questId];
        return questData?.completed && questData.date === today;
    };

    return (
        <div className="bg-white/60 backdrop-blur-md p-6 rounded-[30px] border border-white/50 shadow-sm">
            <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2 font-cute">
                <Gift size={20} className="text-pink-500"/> เควสรายวัน (Daily Quests)
            </h3>
            <div className="space-y-3">
                {DAILY_QUESTS_LIST.map(quest => {
                    const isCompleted = isQuestCompleted(quest.id);
                    return (
                        <div key={quest.id} className={`flex items-center justify-between p-3 rounded-xl transition-all ${isCompleted ? 'bg-green-100/80 text-green-800' : 'bg-slate-50/80 text-slate-500'}`}>
                            <div className="flex items-center gap-3">
                                {isCompleted ? <CheckCircle2 size={20} className="text-green-500"/> : <Circle size={20} className="text-slate-300"/>}
                                <span className={`font-medium text-sm ${isCompleted ? 'text-green-800 line-through' : 'text-slate-700'}`}>{quest.title}</span>
                            </div>
                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${isCompleted ? 'bg-white text-green-700' : 'bg-white text-yellow-600'}`}>
                                +{quest.reward} XP
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default DailyQuests;