
import React, { useEffect, useState, useMemo } from 'react';
import { ViewState } from '../types';
import type { UserProgress } from '../types';
import { UNIT_QUIZZES, FINAL_EXAM, UNIT_ACTIVITIES, UNIT_ASSIGNMENTS, NOTEBOOK_MAX_SCORE, DEFAULT_COURSE_UNITS, ACHIEVEMENTS_LIST, MIDTERM_EXAM, XP_PER_LEVEL } from '../constants';
import { BookOpen, Trophy, Award, Star, PlayCircle, ArrowRight, Flame, PenTool, BarChart3, Briefcase, BrainCircuit } from './icons/EmojiIcons';
import { useData } from '../contexts/DataContext';
import { DashboardSkeleton } from './Skeleton';
import DailyQuests from './DailyQuests';
import LearningAdvisor from './LearningAdvisor';

// --- SVG Radar Chart Component ---
const SkillRadarChart: React.FC<{ data: { skill: string, value: number }[] }> = ({ data }) => {
  const size = 200;
  const center = size / 2;
  const numLevels = 5;
  const angleSlice = (Math.PI * 2) / data.length;

  const points = data.map((d, i) => {
    const angle = angleSlice * i - Math.PI / 2;
    const value = Math.max(0, d.value) / 100;
    const x = center + center * value * 0.8 * Math.cos(angle);
    const y = center + center * value * 0.8 * Math.sin(angle);
    return `${x},${y}`;
  }).join(' ');
  
  const axisPoints = data.map((d, i) => {
    const angle = angleSlice * i - Math.PI / 2;
    const x = center + center * 0.9 * Math.cos(angle);
    const y = center + center * 0.9 * Math.sin(angle);
    return { x, y, label: d.skill.charAt(0).toUpperCase() + d.skill.slice(1,3) };
  });

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full">
        <g>
          {[...Array(numLevels)].map((_, i) => {
            const radius = (center * 0.8 / numLevels) * (i + 1);
            return <circle key={i} cx={center} cy={center} r={radius} fill="none" stroke="#e5e7eb" strokeWidth="0.5"/>
          })}
          {axisPoints.map((p, i) => <line key={i} x1={center} y1={center} x2={p.x} y2={p.y} stroke="#e5e7eb" strokeWidth="0.5"/>)}
        </g>
        <g>
          <polygon points={points} fill="rgba(139, 92, 246, 0.4)" stroke="#8B5CF6" strokeWidth="2" />
        </g>
      </svg>
      {axisPoints.map((p, i) => (
        <div key={i} className="absolute text-[10px] font-bold text-slate-500" style={{ left: `${p.x / size * 100}%`, top: `${p.y / size * 100}%`, transform: 'translate(-50%, -50%)' }}>
          {p.label}
        </div>
      ))}
    </div>
  );
};


interface DashboardProps {
    onNavigate?: (view: ViewState) => void;
    progress?: UserProgress; 
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate = () => {}, progress: progressProp }) => {
  const { userProgress: progressFromContext, getLeaderboard, checkCourseCompletion } = useData();
  const [leaderboard, setLeaderboard] = useState(getLeaderboard());
  
  const progress = progressProp || progressFromContext;
  
  const isCourseCompleted = checkCourseCompletion();

  useEffect(() => {
      const interval = setInterval(() => {
          setLeaderboard(getLeaderboard());
      }, 5000);
      return () => clearInterval(interval);
  }, [getLeaderboard]);

  const calculateTotalScore = (p: UserProgress) => {
      if (!p) return 0;
      let total = 0;
      UNIT_ACTIVITIES.forEach(act => total += (p.activities?.[act.id]?.score || 0));
      UNIT_QUIZZES.forEach(quiz => total += (p.quizzes?.[quiz.id]?.score || 0));
      total += (p.quizzes?.[MIDTERM_EXAM.id]?.score || 0);
      UNIT_ASSIGNMENTS.forEach(assign => {
          const sub = p.assignments?.[assign.id];
          if (sub && sub.status === 'graded') total += (sub.score || 0);
      });
      DEFAULT_COURSE_UNITS.forEach(unit => total += (p.notebookScores?.[unit.id] || 0));
      total += (p.quizzes?.[FINAL_EXAM.id]?.score || 0);
      return total;
  };

  const calculateSkillScores = useMemo(() => {
    if (!progress) return [];
    const skills: Record<string, { score: number, max: number }> = {
      decomposition: { score: 0, max: 0 },
      pattern: { score: 0, max: 0 },
      abstraction: { score: 0, max: 0 },
      algorithm: { score: 0, max: 0 },
      system: { score: 0, max: 0 },
      design: { score: 0, max: 0 },
    };

    const allAssessments = [...UNIT_ACTIVITIES, ...UNIT_QUIZZES, MIDTERM_EXAM];

    allAssessments.forEach(item => {
        if (skills[item.skill]) {
            const result = progress.quizzes[item.id] || progress.activities[item.id];
            skills[item.skill].max += item.maxScore;
            if (result) {
                skills[item.skill].score += result.score;
            }
        }
    });

    // Add notebook scores to skills
    Object.entries(progress.notebookScores || {}).forEach(([unitId, score]) => {
        const correspondingQuiz = UNIT_QUIZZES.find(q => q.id === unitId);
        if (correspondingQuiz && skills[correspondingQuiz.skill]) {
            skills[correspondingQuiz.skill].max += NOTEBOOK_MAX_SCORE;
            skills[correspondingQuiz.skill].score += (score as number || 0);
        }
    });

    return Object.entries(skills).map(([name, data]) => ({
        skill: name,
        value: data.max > 0 ? (data.score / data.max) * 100 : 0
    }));
  }, [progress]);
  
  if (!progress) {
    return (
      <DashboardSkeleton />
    );
  }

  const earnedAchievements = progress.achievements || [];
  const currentUserRank = useMemo(() => leaderboard.find(entry => entry.studentId === progress.studentId), [leaderboard, progress.studentId]);
  const totalStudents = leaderboard.length;
  const currentTotalScore = calculateTotalScore(progress);
  
  const xpForNextLevel = progress.level * XP_PER_LEVEL;
  const xpPercentage = Math.min(100, (progress.xp / xpForNextLevel) * 100);
  
  const projects = progress.projects || [];
  const completedProjectsCount = projects.filter(p => p.status === 'completed').length;

  return (
    <div className="animate-fade-in space-y-8">
      
      <header className="mb-6 flex justify-between items-end">
        <div>
            <h1 className="font-cute text-2xl sm:text-3xl text-gray-700">ผลการเรียนของฉัน</h1>
            <p className="text-gray-500 text-sm">ภาพรวมความก้าวหน้าและอันดับคะแนน</p>
        </div>
        {isCourseCompleted && (
            <button 
                onClick={() => onNavigate(ViewState.CERTIFICATE)}
                className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-4 py-2 md:px-6 md:py-3 rounded-2xl font-bold shadow-lg hover:scale-105 transition-all flex items-center gap-2 animate-pulse text-sm md:text-base"
            >
                <Award size={24}/> รับเกียรติบัตร
            </button>
        )}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[30px] border border-slate-100 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer flex flex-col justify-center text-center" onClick={() => onNavigate(ViewState.LEADERBOARD)}>
            <Trophy size={32} className="mx-auto text-amber-500 mb-3"/>
            <p className="text-xs font-bold text-slate-400 uppercase">Class Rank</p>
            <p className="text-5xl font-black text-slate-800">
                {currentUserRank?.rank || '-'}
                <span className="text-2xl text-slate-300">/{totalStudents}</span>
            </p>
            <p className="text-xs font-bold text-indigo-500 mt-2">Total Score: {currentTotalScore}</p>
        </div>
        <div className="bg-white p-6 rounded-[30px] border border-slate-100 shadow-sm flex flex-col justify-center">
            <div className="flex justify-between items-center mb-2">
                <p className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1"><Star size={14} className="text-indigo-400"/> Level Progress</p>
                <p className="text-sm font-bold text-indigo-600">Level {progress.level}</p>
            </div>
            <p className="text-2xl font-black text-slate-800">{progress.xp} <span className="text-base text-slate-400">/ {xpForNextLevel} XP</span></p>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mt-3 border border-slate-200">
                <div className="h-full bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full" style={{ width: `${xpPercentage}%`}}></div>
            </div>
        </div>
        <div className="bg-white p-6 rounded-[30px] border border-slate-100 shadow-sm flex flex-col justify-center text-center">
            <Flame size={32} className="mx-auto text-red-500 mb-3"/>
            <p className="text-xs font-bold text-slate-400 uppercase">Login Streak</p>
            <p className="text-5xl font-black text-slate-800">
                {progress.loginStreak}
                <span className="text-2xl text-slate-300"> days</span>
            </p>
        </div>
      </div>

      {/* คะแนนการเรียน */}
      <div className="bg-white p-8 rounded-[30px] border border-slate-100 shadow-sm">
        <h3 className="text-xl font-bold text-slate-800 font-cute mb-6 flex items-center gap-2">
          <BarChart3 size={24} className="text-blue-500"/> คะแนนการเรียนของฉัน
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Activities Score */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200">
            <div className="flex items-center gap-3 mb-3">
              <PlayCircle size={24} className="text-blue-600"/>
              <h4 className="font-bold text-blue-800">กิจกรรม</h4>
            </div>
            <div className="text-3xl font-black text-blue-900">
              {UNIT_ACTIVITIES.reduce((sum, act) => sum + (progress.activities?.[act.id]?.score || 0), 0)}
              <span className="text-lg text-blue-600">/{UNIT_ACTIVITIES.length * 10}</span>
            </div>
            <div className="w-full bg-blue-200 h-2 rounded-full mt-3">
              <div 
                className="h-full bg-blue-600 rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, (UNIT_ACTIVITIES.reduce((sum, act) => sum + (progress.activities?.[act.id]?.score || 0), 0) / (UNIT_ACTIVITIES.length * 10)) * 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Quizzes Score */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border border-green-200">
            <div className="flex items-center gap-3 mb-3">
              <BookOpen size={24} className="text-green-600"/>
              <h4 className="font-bold text-green-800">แบบทดสอบ</h4>
            </div>
            <div className="text-3xl font-black text-green-900">
              {UNIT_QUIZZES.reduce((sum, quiz) => sum + (progress.quizzes?.[quiz.id]?.score || 0), 0)}
              <span className="text-lg text-green-600">/{UNIT_QUIZZES.length * 10}</span>
            </div>
            <div className="w-full bg-green-200 h-2 rounded-full mt-3">
              <div 
                className="h-full bg-green-600 rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, (UNIT_QUIZZES.reduce((sum, quiz) => sum + (progress.quizzes?.[quiz.id]?.score || 0), 0) / (UNIT_QUIZZES.length * 10)) * 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Assignments Score */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border border-purple-200">
            <div className="flex items-center gap-3 mb-3">
              <PenTool size={24} className="text-purple-600"/>
              <h4 className="font-bold text-purple-800">การบ้าน</h4>
            </div>
            <div className="text-3xl font-black text-purple-900">
              {UNIT_ASSIGNMENTS.reduce((sum, assign) => {
                const sub = progress.assignments?.[assign.id];
                return sum + (sub && sub.status === 'graded' ? (sub.score || 0) : 0);
              }, 0)}
              <span className="text-lg text-purple-600">/{UNIT_ASSIGNMENTS.length * 10}</span>
            </div>
            <div className="w-full bg-purple-200 h-2 rounded-full mt-3">
              <div 
                className="h-full bg-purple-600 rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, (UNIT_ASSIGNMENTS.reduce((sum, assign) => {
                  const sub = progress.assignments?.[assign.id];
                  return sum + (sub && sub.status === 'graded' ? (sub.score || 0) : 0);
                }, 0) / (UNIT_ASSIGNMENTS.length * 10)) * 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Notebooks Score */}
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-2xl border border-indigo-200">
            <div className="flex items-center gap-3 mb-3">
              <BookOpen size={24} className="text-indigo-600"/>
              <h4 className="font-bold text-indigo-800">สมุดบันทึก</h4>
            </div>
            <div className="text-3xl font-black text-indigo-900">
              {DEFAULT_COURSE_UNITS.reduce((sum, unit) => sum + (progress.notebookScores?.[unit.id] || 0), 0)}
              <span className="text-lg text-indigo-600">/{DEFAULT_COURSE_UNITS.length * NOTEBOOK_MAX_SCORE}</span>
            </div>
            <div className="w-full bg-indigo-200 h-2 rounded-full mt-3">
              <div 
                className="h-full bg-indigo-600 rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, (DEFAULT_COURSE_UNITS.reduce((sum, unit) => sum + (progress.notebookScores?.[unit.id] || 0), 0) / (DEFAULT_COURSE_UNITS.length * NOTEBOOK_MAX_SCORE)) * 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Exams Section */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-2xl border border-orange-200">
            <div className="flex items-center gap-3 mb-3">
              <BookOpen size={24} className="text-orange-600"/>
              <h4 className="font-bold text-orange-800">ข้อสอบกลางภาค</h4>
            </div>
            <div className="text-4xl font-black text-orange-900">
              {progress.quizzes?.[MIDTERM_EXAM.id]?.score || 0}
              <span className="text-xl text-orange-600">/{MIDTERM_EXAM.maxScore}</span>
            </div>
            <div className="w-full bg-orange-200 h-3 rounded-full mt-3">
              <div 
                className="h-full bg-orange-600 rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, ((progress.quizzes?.[MIDTERM_EXAM.id]?.score || 0) / MIDTERM_EXAM.maxScore) * 100)}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-2xl border border-red-200">
            <div className="flex items-center gap-3 mb-3">
              <BookOpen size={24} className="text-red-600"/>
              <h4 className="font-bold text-red-800">ข้อสอบปลายภาค</h4>
            </div>
            <div className="text-4xl font-black text-red-900">
              {progress.quizzes?.[FINAL_EXAM.id]?.score || 0}
              <span className="text-xl text-red-600">/{FINAL_EXAM.maxScore}</span>
            </div>
            <div className="w-full bg-red-200 h-3 rounded-full mt-3">
              <div 
                className="h-full bg-red-600 rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, ((progress.quizzes?.[FINAL_EXAM.id]?.score || 0) / FINAL_EXAM.maxScore) * 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Total Score Summary */}
        <div className="mt-6 bg-gradient-to-r from-slate-50 to-slate-100 p-6 rounded-2xl border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-bold text-slate-800">คะแนนรวมทั้งหมด</h4>
              <p className="text-sm text-slate-600">รวมทุกส่วนการเรียนรู้</p>
            </div>
            <div className="text-right">
              <div className="text-5xl font-black text-slate-900">{currentTotalScore}</div>
              <div className="text-sm text-slate-500">คะแนนเต็มที่เป็นไปได้</div>
            </div>
          </div>
          <div className="w-full bg-slate-200 h-4 rounded-full mt-4">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 via-green-500 to-purple-500 rounded-full transition-all duration-1000" 
              style={{ width: `${Math.min(100, (currentTotalScore / 250) * 100)}%` }} // Assuming max total around 250
            ></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
            <LearningAdvisor onNavigate={onNavigate} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div onClick={() => onNavigate(ViewState.PORTFOLIO)} className="glass-card rounded-[30px] p-8 flex items-center justify-between group cursor-pointer hover:border-teal-200">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-teal-100 text-teal-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform"><Award size={40}/></div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-700 font-cute">แฟ้มผลงาน</h3>
                            <p className="text-sm text-slate-500">ดูผลงานทั้งหมด</p>
                        </div>
                    </div>
                </div>
                <div onClick={() => onNavigate(ViewState.PROJECT_HUB)} className="glass-card rounded-[30px] p-8 flex items-center justify-between group cursor-pointer hover:border-purple-200">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform"><Briefcase size={40}/></div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-700 font-cute">โครงงาน</h3>
                            <p className="text-sm text-slate-500">{completedProjectsCount} สำเร็จ</p>
                        </div>
                    </div>
                </div>
            </div>
            <div onClick={() => onNavigate(ViewState.ACHIEVEMENTS)} className="glass-card rounded-[30px] p-8 cursor-pointer group hover:border-amber-200">
                <h3 className="text-lg font-bold text-gray-700 mb-6 flex items-center gap-2 font-cute">
                    <Trophy size={20} className="text-amber-500"/> เหรียญรางวัลความสำเร็จ ({earnedAchievements.length}/{ACHIEVEMENTS_LIST.length})
                </h3>
                <div className="flex flex-wrap gap-4">
                    {ACHIEVEMENTS_LIST.slice(0, 7).map(ach => {
                        const isEarned = earnedAchievements.includes(ach.id);
                        return (
                            <div key={ach.id} className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl transition-all duration-300 relative group
                                ${isEarned ? 'bg-gradient-to-br from-yellow-300 to-orange-400 shadow-md' : 'bg-slate-200 grayscale opacity-60'}
                            `}>
                                {ach.icon}
                            </div>
                        )
                    })}
                    <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 group-hover:border-amber-400 group-hover:text-amber-500 transition-colors">
                        <ArrowRight/>
                    </div>
                </div>
            </div>
        </div>

        <div className="space-y-6">
            <DailyQuests />
            <div className="glass-card rounded-[30px] p-6 h-fit">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 font-cute">
                    <BrainCircuit size={20} className="text-purple-500"/> CT Skills
                </h3>
                <div className="h-56">
                    {calculateSkillScores.length > 0 && <SkillRadarChart data={calculateSkillScores} />}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
