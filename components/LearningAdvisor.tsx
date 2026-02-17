import React, { useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import type { ViewState } from '../types';
import { Lightbulb, BookOpen, ArrowRight, Rocket, Sparkles } from './icons/EmojiIcons';
import { UNIT_QUIZZES } from '../constants';

interface LearningAdvisorProps {
    onNavigate: (view: ViewState) => void;
}

const LearningAdvisor: React.FC<LearningAdvisorProps> = ({ onNavigate }) => {
    const { userProgress, courseUnits } = useData();

    const advisorContent = useMemo(() => {
        if (!userProgress) return null;

        // 1. Check for weak units
        const weakUnits: string[] = [];
        UNIT_QUIZZES.forEach(quiz => {
            const result = userProgress.quizzes[quiz.id];
            if (result && (result.score / quiz.maxScore) < 0.5) {
                if (!weakUnits.includes(quiz.id)) {
                    weakUnits.push(quiz.id);
                }
            }
        });

        const recommendations = weakUnits.map(unitId => courseUnits.find(u => u.id === unitId)).filter(Boolean);
        
        if (recommendations.length > 0) {
            return {
                type: 'review',
                title: 'คำแนะนำสำหรับคุณ',
                description: 'ดูเหมือนว่าคุณอาจจะต้องทบทวนบทเรียนเหล่านี้เพิ่มเติมนะ:',
                units: recommendations
            };
        }

        // 2. If no weak units, find the next lesson
        const sortedActiveUnits = courseUnits
            .filter(u => u.isActive)
            .sort((a, b) => a.order - b.order);

        const nextUnit = sortedActiveUnits.find(unit => !userProgress?.units?.[unit.id]?.completed);

        if (nextUnit) {
            return {
                type: 'next',
                title: 'บทเรียนถัดไป',
                description: 'ยอดเยี่ยม! ไม่มีบทเรียนที่ต้องทบทวนเป็นพิเศษ ไปต่อกันเลย!',
                units: [nextUnit]
            };
        }

        // 3. If all units are complete
        return {
            type: 'completed',
            title: 'สุดยอดไปเลย!',
            description: 'คุณเรียนจบครบทุกหน่วยการเรียนรู้แล้ว! ลองกลับไปทบทวนบทเรียนที่ชอบอีกครั้ง หรือไปที่แฟ้มผลงานเพื่อรับเกียรติบัตร',
            units: []
        };
    }, [userProgress, courseUnits]);

    if (!advisorContent) {
        return null;
    }

    if (advisorContent.type === 'review') {
        return (
            <div className="bg-yellow-50/80 backdrop-blur-md p-6 rounded-[30px] border-2 border-dashed border-yellow-200 animate-fade-in">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-yellow-100 text-yellow-500 rounded-2xl flex items-center justify-center shrink-0">
                        <Lightbulb size={24}/>
                    </div>
                    <div>
                        <h3 className="font-bold text-yellow-900 font-cute">{advisorContent.title}</h3>
                        <p className="text-yellow-800/80 text-sm mt-1">{advisorContent.description}</p>
                    </div>
                </div>
                <div className="mt-4 space-y-2">
                    {advisorContent.units.map(unit => unit && (
                        <button 
                            key={unit.id}
                            onClick={() => onNavigate(unit.id.toUpperCase() as ViewState)}
                            className="w-full flex items-center justify-between p-3 bg-white/80 rounded-xl hover:bg-white transition-all group border border-yellow-100"
                        >
                            <div className="flex items-center gap-3">
                                <BookOpen size={16} className="text-yellow-600"/>
                                <span className="font-bold text-sm text-slate-700">{unit.subtitle}</span>
                            </div>
                            <ArrowRight size={16} className="text-yellow-400 group-hover:translate-x-1 transition-transform"/>
                        </button>
                    ))}
                </div>
            </div>
        );
    }
    
    if (advisorContent.type === 'next') {
        const unit = advisorContent?.units?.[0];
        if (!unit) return null;
        return (
            <div className="bg-indigo-50/80 backdrop-blur-md p-6 rounded-[30px] border-2 border-dashed border-indigo-200 animate-fade-in">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-indigo-100 text-indigo-500 rounded-2xl flex items-center justify-center shrink-0">
                        <Rocket size={24}/>
                    </div>
                    <div>
                        <h3 className="font-bold text-indigo-900 font-cute">{advisorContent.title}</h3>
                        <p className="text-indigo-800/80 text-sm mt-1">{advisorContent.description}</p>
                    </div>
                </div>
                <div className="mt-4 space-y-2">
                    <button 
                        key={unit.id}
                        onClick={() => onNavigate(unit.id.toUpperCase() as ViewState)}
                        className="w-full flex items-center justify-between p-3 bg-white/80 rounded-xl hover:bg-white transition-all group border border-indigo-100"
                    >
                        <div className="flex items-center gap-3">
                            <BookOpen size={16} className="text-indigo-600"/>
                            <span className="font-bold text-sm text-slate-700">{unit.subtitle}</span>
                        </div>
                        <ArrowRight size={16} className="text-indigo-400 group-hover:translate-x-1 transition-transform"/>
                    </button>
                </div>
            </div>
        );
    }

    if (advisorContent.type === 'completed') {
        return (
            <div className="bg-green-50/80 backdrop-blur-md p-6 rounded-[30px] border-2 border-dashed border-green-200 animate-fade-in">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-100 text-green-500 rounded-2xl flex items-center justify-center shrink-0">
                        <Sparkles size={24}/>
                    </div>
                    <div>
                        <h3 className="font-bold text-green-900 font-cute">{advisorContent.title}</h3>
                        <p className="text-green-800/80 text-sm mt-1">{advisorContent.description}</p>
                    </div>
                </div>
            </div>
        );
    }
    
    return null;
};

export default LearningAdvisor;