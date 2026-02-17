import React, { useState, useEffect } from 'react';
import { ViewState } from '../types';
import { BookOpen, MoreHorizontal, Star, CheckCircle, Lock, ChevronRight, Award, Lightbulb, ArrowRight, Trophy, Book, LayoutGrid, Coffee, Monitor, Zap, PenTool, Layers } from './icons/EmojiIcons';
import { GREETINGS, UNIT_ACTIVITIES, UNIT_QUIZZES, UNIT_ASSIGNMENTS } from '../constants';
import { useData } from '../contexts/DataContext';
import { Skeleton } from './Skeleton';

interface HomeProps {
  onNavigate: (view: ViewState) => void;
  onStartMidterm: () => void;
  onStartExam: () => void;
  isUnitLocked: (view: ViewState) => boolean;
}

const Home: React.FC<HomeProps> = ({ onNavigate, onStartMidterm, onStartExam, isUnitLocked }) => {
  const { userProgress, courseUnits } = useData();
  const [greeting, setGreeting] = useState(GREETINGS[0]);

  useEffect(() => {
    const randomIdx = Math.floor(Math.random() * GREETINGS.length);
    setGreeting(GREETINGS[randomIdx]);
  }, []);

  const allSortedUnits = [...courseUnits].sort((a, b) => a.order - b.order);

  const getUnitProgress = (unitId: string) => {
      if (!userProgress) return { percent: 0, completed: 0, total: 4 };

      let completed = 0;
      let total = 0;
      
      // Check Quiz
      if (UNIT_QUIZZES.some(q => q.id === unitId)) {
          total++;
          if (userProgress.quizzes?.[unitId]?.submitted) completed++;
      }
      // Check Activity
      if (UNIT_ACTIVITIES.some(a => a.unitId === unitId)) {
          total++;
          if (userProgress.activities?.[UNIT_ACTIVITIES.find(a => a.unitId === unitId)!.id]?.submitted) completed++;
      }
      // Check Assignment
      if (UNIT_ASSIGNMENTS.some(a => a.unitId === unitId)) {
          total++;
          if (userProgress.assignments?.[UNIT_ASSIGNMENTS.find(a => a.unitId === unitId)!.id]) completed++;
      }
      // Check Notebook
      total++;
      if (userProgress.notebookScores?.[unitId]) completed++;

      return {
          percent: total > 0 ? (completed / total) * 100 : 0,
          completed,
          total
      };
  };

  const getIcon = (iconName: string) => {
      switch(iconName) {
          case 'Coffee': return <Coffee size={28}/>;
          case 'Monitor': return <Monitor size={28}/>;
          case 'Zap': return <Zap size={28}/>;
          case 'PenTool': return <PenTool size={28}/>;
          case 'Layers': return <Layers size={28}/>;
          default: return <Book size={28}/>;
      }
  }

  return (
    <div className="animate-fade-in space-y-16">
      
      {/* Hero Section with Better Visual Appeal */}
      <header className="text-center relative">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-32 h-32 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-40 h-40 bg-gradient-to-r from-blue-200 to-indigo-200 rounded-full opacity-20 blur-3xl"></div>
        </div>
        
        <div className="inline-flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 rounded-full text-sm font-bold mb-6 border border-indigo-200">
          <Star size={16} className="text-yellow-500 fill-yellow-500" />
          ยินดีต้อนรับสู่โลกการเรียนรู้
          <Star size={16} className="text-yellow-500 fill-yellow-500" />
        </div>
        
        <h1 className="font-cute text-5xl sm:text-6xl lg:text-7xl font-black text-slate-800 leading-tight mb-4">
          Learning <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-purple-600 to-pink-500 animate-gradient-x">
            Adventure!
          </span>
        </h1>
        
        <p className="text-slate-600 mt-4 text-xl font-medium max-w-2xl mx-auto leading-relaxed">
          &quot;{greeting}&quot;
        </p>
        
        {/* Quick Stats */}
        <div className="flex justify-center gap-6 mt-8">
          <div className="text-center">
            <div className="text-2xl font-black text-indigo-600">{userProgress?.level || 1}</div>
            <div className="text-xs text-slate-500 font-medium">Level</div>
          </div>
          <div className="w-px h-8 bg-slate-300"></div>
          <div className="text-center">
            <div className="text-2xl font-black text-purple-600">{userProgress?.xp || 0}</div>
            <div className="text-xs text-slate-500 font-medium">XP</div>
          </div>
          <div className="w-px h-8 bg-slate-300"></div>
          <div className="text-center">
            <div className="text-2xl font-black text-pink-600">
              {allSortedUnits.filter(u => userProgress?.units?.[u.id]?.completed).length}
            </div>
            <div className="text-xs text-slate-500 font-medium">Units Completed</div>
          </div>
        </div>
      </header>
      
      {/* Course Menu Section */}
      <div className="relative">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-slate-800 font-cute mb-4 flex items-center justify-center gap-4">
            <div className="w-3 h-12 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></div>
            เมนูบทเรียน (Course Menu)
            <div className="w-3 h-12 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
          </h3>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            เลือกหน่วยการเรียนรู้ที่คุณสนใจและเริ่มต้นการผจญภัยแห่งความรู้
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {courseUnits.length > 0 ? (
            allSortedUnits.map((course, index) => {
              const viewState = course.id.toUpperCase() as ViewState;
              const isLocked = isUnitLocked(viewState);
              const isFullyCompleted = userProgress?.units?.[course.id]?.completed;
              const { percent, completed, total } = getUnitProgress(course.id);
              const progressPercent = isFullyCompleted ? 100 : percent;

              return (
                <div 
                  key={course.id}
                  style={{ animationDelay: `${index * 150}ms` }}
                  className={`animate-fade-in group relative bg-white rounded-3xl p-8 border-2 flex flex-col transition-all duration-500 hover:shadow-2xl overflow-hidden
                    ${isLocked 
                      ? 'grayscale opacity-70 cursor-not-allowed bg-slate-50 border-slate-200' 
                      : `hover:scale-[1.03] cursor-pointer ${isFullyCompleted ? 'border-green-300 bg-gradient-to-br from-green-50 to-emerald-50' : 'border-slate-200 hover:border-indigo-300'}`
                    }`}
                  onClick={() => !isLocked && onNavigate(viewState)}
                >
                  {/* Background Pattern */}
                  <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
                    <div className={`w-full h-full bg-${course.color}-500 rounded-full`}></div>
                  </div>
                  
                  {/* Status Badges */}
                  {isFullyCompleted && !isLocked && (
                    <div className="absolute top-6 right-6 text-green-600 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 border border-green-200 shadow-lg z-10">
                      <CheckCircle size={14} className="fill-green-500 text-white" />
                      Completed
                    </div>
                  )}
                  {isLocked && (
                    <div className="absolute top-6 right-6 text-slate-400 bg-white/90 backdrop-blur-sm p-2 rounded-full border border-slate-200 shadow-lg z-10">
                      <Lock size={16}/>
                    </div>
                  )}

                  {/* Unit Number Badge */}
                  <div className="absolute top-6 left-6 w-8 h-8 bg-slate-800 text-white rounded-full flex items-center justify-center text-xs font-black shadow-lg">
                    {course.order}
                  </div>

                  <div className="flex items-center gap-6 mb-6 mt-8">
                    <div className={`w-20 h-20 rounded-3xl flex items-center justify-center shrink-0 shadow-lg transition-transform duration-300 group-hover:scale-110
                      ${isLocked ? 'bg-slate-200 text-slate-400' : `bg-gradient-to-br from-${course.color}-100 to-${course.color}-200 text-${course.color}-600 shadow-${course.color}-200` }
                    `}>
                      {getIcon(course.icon)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-bold uppercase tracking-wide ${isLocked ? 'text-slate-400' : `text-${course.color}-600`}`}>{course.title}</p>
                      <h4 className={`text-xl font-black ${isLocked ? 'text-slate-500' : 'text-slate-800'} font-cute leading-tight`}>
                        {course.subtitle}
                      </h4>
                    </div>
                  </div>

                  <div className="mt-auto space-y-4">
                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-slate-600">ความคืบหน้า</span>
                        <span className="text-sm font-black text-slate-700">{Math.round(progressPercent)}%</span>
                      </div>
                      <div className="w-full bg-slate-200/70 h-2.5 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-700 ease-out ${isFullyCompleted ? 'bg-gradient-to-r from-green-400 to-emerald-500' : `bg-gradient-to-r from-${course.color}-400 to-${course.color}-500`}`} style={{ width: `${progressPercent}%`}}></div>
                      </div>
                      <div className="flex justify-between items-center text-xs text-slate-500">
                        <span>กิจกรรมที่เสร็จ: {completed}/{total}</span>
                        {!isLocked && <span className="text-indigo-600 font-medium">คลิกเพื่อเริ่ม</span>}
                      </div>
                    </div>
                    
                    {/* Action Button */}
                    <button 
                      className={`w-full py-3 px-4 text-sm font-bold rounded-2xl flex items-center justify-center gap-2 transition-all duration-300 group-hover:shadow-lg
                        ${isLocked 
                          ? 'bg-slate-300 text-slate-500 cursor-not-allowed' 
                          : isFullyCompleted 
                            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700' 
                            : 'bg-gradient-to-r from-slate-800 to-slate-900 text-white hover:from-slate-900 hover:to-black'
                        }`}
                      disabled={isLocked}
                    >
                      {isFullyCompleted ? (
                        <>
                          <BookOpen size={16} />
                          ทบทวนเนื้อหา
                        </>
                      ) : (
                        <>
                          เริ่มเรียน 
                          <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            [...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-3xl p-6 flex flex-col gap-5">
                <div className="flex items-center gap-5">
                  <Skeleton className="w-16 h-16 rounded-2xl shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/3 rounded-md" />
                    <Skeleton className="h-5 w-full rounded-md" />
                  </div>
                </div>
                <Skeleton className="h-6 w-full rounded-md" />
              </div>
            ))
          )}
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-slate-700 font-cute mb-0">
          การวัดผล
        </h3>
        <div
          onClick={onStartMidterm}
          className="group relative bg-white rounded-3xl p-8 border-2 border-slate-200 hover:border-blue-300 hover:shadow-2xl hover:scale-[1.02] transition-all duration-500 cursor-pointer overflow-hidden flex flex-col md:flex-row items-center gap-8"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full opacity-50 -translate-y-16 translate-x-16"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-lg border border-blue-100">
              <BookOpen size={48} />
            </div>
            <div className="text-center md:text-left flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold mb-3">
                <Lightbulb size={12} />
                Midterm Exam
              </div>
              <h4 className="text-2xl font-black text-slate-800 font-cute mb-3">
                ทดสอบกลางภาค
              </h4>
              <p className="text-slate-600 mb-4 leading-relaxed">
                ทดสอบความรู้หน่วยที่ 1-2 • 20 ข้อ • 20 คะแนน
              </p>
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all group-hover:shadow-xl">
                เริ่มทำแบบทดสอบ 
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>

        <div
          onClick={onStartExam}
          className="group relative bg-white rounded-3xl p-8 border-2 border-transparent hover:border-amber-300 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer overflow-hidden flex flex-col md:flex-row items-center gap-8"
        >
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300 -rotate-6">
            <Trophy size={64} />
          </div>
          <div className="text-center md:text-left">
            <p className="text-sm font-bold text-amber-600">Final Exam Shot</p>
            <h4 className="text-2xl sm:text-3xl font-black text-slate-800 font-cute group-hover:text-slate-900 mb-2">
              ทดสอบปลายภาค
            </h4>
            <p className="text-slate-500 mb-4 leading-relaxed">
              ทดสอบความรู้ความเข้าใจทั้งหมด 30 ข้อ 30 คะแนน เตรียมตัวให้พร้อมแล้วมาเริ่มกันเลย!
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-full font-bold shadow-lg group-hover:bg-slate-700 transition-colors">
              เริ่มทำแบบทดสอบ <ArrowRight size={16} />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Home;