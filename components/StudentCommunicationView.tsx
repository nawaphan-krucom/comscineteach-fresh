import React, { useState, useEffect, useMemo } from 'react';
import { ViewState } from '../types';
import type { QnAData, User } from '../types';

import { Bell, MessageSquare, Send, Calendar, User as UserIcon, CheckCircle2, MessageCircle, BookOpen, ChevronRight, PlayCircle, Star, HelpCircle, ArrowLeft } from './icons/EmojiIcons';
import { useData } from '../contexts/DataContext';

interface StudentCommunicationViewProps {
  currentUser: User | null;
  onNavigate: (view: ViewState) => void;
  onBack: () => void;
}

const StudentCommunicationView: React.FC<StudentCommunicationViewProps> = ({ currentUser, onNavigate, onBack }) => {
  const { userProgress, announcements, qnaList, addQuestion, courseUnits } = useData();
  const [activeTab, setActiveTab] = useState<'announcements' | 'qna' | 'lessons'>('qna');
  const [newQuestion, setNewQuestion] = useState('');

  // Auto-scroll to bottom of chat
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (activeTab === 'qna') {
        scrollToBottom();
    }
  }, [qnaList, activeTab]);

  const handleAskQuestion = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newQuestion.trim() || !currentUser) return;

      const question: QnAData = {
          id: Date.now(),
          studentId: currentUser.id,
          studentName: currentUser.name,
          studentAvatar: currentUser.avatar || '🎓',
          question: newQuestion,
          date: new Date().toISOString(),
      };

      addQuestion(question);
      setNewQuestion('');
  };

  const sortedQnA = useMemo(() => 
    [...qnaList].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()), 
  [qnaList]);


  // Dynamic Lessons from Course Units
  const lessons = courseUnits.filter(u => u.isActive).map(unit => ({
      id: unit.id,
      title: unit.subtitle,
      desc: unit.title,
      color: `from-${unit.color}-400 to-${unit.color}-600`
  }));

  const handleNavigateToUnit = (unitId: string) => {
      let targetView: ViewState;
      switch(unitId) {
          case 'unit_1': targetView = ViewState.UNIT_1; break;
          case 'unit_2': targetView = ViewState.UNIT_2; break;
          case 'unit_3': targetView = ViewState.UNIT_3; break;
          case 'unit_4': targetView = ViewState.UNIT_4; break;
          case 'unit_5': targetView = ViewState.UNIT_5; break;
          default: targetView = ViewState.HOME;
      }
      onNavigate(targetView);
  };

  return (
    <div className="animate-fade-in space-y-6 h-full flex flex-col">
      
      {/* Header */}
      <header className="flex items-center gap-4 shrink-0 mb-2">
        <button onClick={onBack} className="p-2 bg-white rounded-full shadow-sm hover:bg-slate-100 transition md:hidden">
            <ArrowLeft size={20}/>
        </button>
        <div>
          <h1 className="font-cute text-3xl text-gray-700 flex items-center gap-2">
            <MessageSquare className="text-indigo-500" /> คอมมูนิตี้ (Community)
          </h1>
          <p className="text-gray-500 text-sm mt-1">พื้นที่สื่อสาร แลกเปลี่ยนเรียนรู้ และติดตามข่าวสาร</p>
        </div>
      </header>

      {/* Modern Tabs */}
      <div className="flex bg-white/50 p-1.5 rounded-2xl w-full md:w-fit gap-2 shrink-0 border border-white shadow-sm">
          {[
              { id: 'announcements', label: 'ประกาศ', icon: <Bell size={18}/>, count: announcements.length },
              { id: 'qna', label: 'ถาม-ตอบ', icon: <HelpCircle size={18}/>, count: qnaList.length },
              { id: 'lessons', label: 'สรุปบทเรียน', icon: <BookOpen size={18}/>, count: 0 },
          ].map((tab) => (
            <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as "qna" | "announcements" | "lessons")}
                className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300 relative
                    ${activeTab === tab.id 
                    ? 'bg-white text-indigo-600 shadow-md ring-1 ring-indigo-100' 
                    : 'text-gray-500 hover:bg-white/60 hover:text-gray-700'}`}
            >
                {tab.icon} {tab.label}
                {tab.count > 0 && tab.id !== 'lessons' && (
                    <span className="bg-indigo-100 text-indigo-600 text-[10px] px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                        {tab.count}
                    </span>
                )}
            </button>
          ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden relative">
          
          {/* ANNOUNCEMENTS TAB */}
          {activeTab === 'announcements' && (
              <div className="h-full overflow-y-auto custom-scrollbar pb-10 animate-fade-in">
                  <div className="grid gap-4 max-w-4xl mx-auto">
                      {announcements.length === 0 ? (
                          <div className="text-center py-20 text-slate-400 bg-white/40 rounded-3xl border border-dashed border-slate-300">
                              ยังไม่มีประกาศใหม่
                          </div>
                      ) : (
                          announcements.slice().reverse().map(ann => (
                              <div key={ann.id} className="bg-white p-6 rounded-[25px] border border-slate-100 shadow-sm hover:shadow-lg transition-all relative overflow-hidden group">
                                  <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-amber-400 to-orange-500"></div>
                                  <div className="flex items-start gap-5">
                                      <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform duration-300">
                                          <Bell size={24}/>
                                      </div>
                                      <div className="flex-1">
                                          <div className="flex justify-between items-start mb-2">
                                              <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100">ประกาศใหม่</span>
                                              <span className="text-xs text-slate-400 flex items-center gap-1">
                                                  <Calendar size={12}/> {new Date(ann.date).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
                                              </span>
                                          </div>
                                          <p className="text-lg font-bold text-slate-700 leading-relaxed">{ann.text}</p>
                                      </div>
                                  </div>
                              </div>
                          ))
                      )}
                  </div>
              </div>
          )}

          {/* Q&A TAB - Redesigned */}
          {activeTab === 'qna' && (
              <div className="h-full flex flex-col animate-fade-in">
                  
                  {/* Q&A List */}
                  <div className="flex-1 overflow-y-auto custom-scrollbar pb-10 pr-2">
                      <div className="max-w-4xl mx-auto space-y-6">
                          {sortedQnA.length === 0 ? (
                              <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                      <MessageCircle size={40} className="text-slate-300"/>
                                  </div>
                                  <p>ยังไม่มีคำถาม เป็นคนแรกที่ถามเลย!</p>
                              </div>
                          ) : (
                              sortedQnA.map(qna => (
                                  <div key={qna.id} className="flex flex-col gap-3 group animate-slide-up">
                                      {/* Question Bubble */}
                                      <div className="flex items-end gap-3">
                                          <div className="w-10 h-10 bg-white border-2 border-white shadow-md rounded-full flex items-center justify-center text-xl overflow-hidden shrink-0">
                                              {qna.studentAvatar}
                                          </div>
                                          <div className="bg-white p-4 rounded-2xl rounded-bl-none shadow-sm border border-slate-100 max-w-[85%] relative">
                                              <div className="flex justify-between items-baseline mb-1 gap-4">
                                                  <span className="text-xs font-bold text-slate-500">{qna.studentName}</span>
                                                  <span className="text-[10px] text-slate-300">{new Date(qna.date).toLocaleDateString('th-TH')}</span>
                                              </div>
                                              <p className="text-slate-700 font-medium leading-relaxed">{qna.question}</p>
                                          </div>
                                      </div>

                                      {/* Answer Bubble */}
                                      {qna.answer ? (
                                          <div className="flex items-end gap-3 flex-row-reverse self-end max-w-[90%]">
                                              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-full flex items-center justify-center shadow-md shrink-0 border-2 border-white">
                                                  <UserIcon size={18}/>
                                              </div>
                                              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-4 rounded-2xl rounded-br-none shadow-md text-white relative">
                                                  <span className="text-[10px] font-bold text-indigo-200 block mb-1 opacity-80">คุณครูตอบกลับ:</span>
                                                  <p className="font-medium leading-relaxed text-sm">{qna.answer}</p>
                                                  <div className="text-[10px] text-indigo-200 mt-2 flex items-center justify-end gap-1 opacity-70">
                                                      <CheckCircle2 size={10}/> {qna.answeredAt ? new Date(qna.answeredAt).toLocaleTimeString('th-TH', {hour: '2-digit', minute:'2-digit'}) : 'ตอบแล้ว'}
                                                  </div>
                                              </div>
                                          </div>
                                      ) : (
                                          <div className="ml-14 flex items-center gap-2 text-xs text-slate-400 bg-slate-50/50 px-3 py-1.5 rounded-full w-fit border border-slate-100">
                                              <div className="flex gap-1">
                                                  <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce"></div>
                                                  <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce delay-100"></div>
                                                  <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce delay-200"></div>
                                              </div> 
                                              รอคุณครูตอบ...
                                          </div>
                                      )}
                                  </div>
                              ))
                          )}
                          <div ref={messagesEndRef} />
                      </div>
                  </div>

                  {/* Input Area */}
                  <form onSubmit={handleAskQuestion} className="shrink-0 mt-4 max-w-4xl mx-auto w-full">
                      <div className="relative">
                          <input 
                            type="text" 
                            value={newQuestion}
                            onChange={(e) => setNewQuestion(e.target.value)}
                            placeholder="พิมพ์คำถามของคุณที่นี่..."
                            className="w-full pl-6 pr-16 py-4 bg-white rounded-2xl border border-slate-200 shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all font-medium"
                          />
                          <button 
                            type="submit"
                            disabled={!newQuestion.trim()}
                            className="absolute right-3 top-3 w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 transition-all"
                          >
                              <Send size={18} className="ml-0.5"/>
                          </button>
                      </div>
                  </form>
              </div>
          )}

          {/* LESSONS TAB - Dynamic */}
          {activeTab === 'lessons' && (
              <div className="h-full overflow-y-auto custom-scrollbar pb-10 animate-fade-in">
                  <div className="max-w-5xl mx-auto">
                      <div className="mb-6 bg-white p-6 rounded-[25px] shadow-sm border border-slate-100 flex items-center justify-between">
                          <div>
                              <h3 className="text-lg font-bold text-slate-800">สรุปความคืบหน้า</h3>
                              <p className="text-slate-500 text-sm">คุณเรียนจบไปแล้ว {Object.values(userProgress?.units || {}).filter((u: { completed?: boolean }) => u.completed).length} จาก {lessons.length} หน่วย</p>
                          </div>
                              <div className="w-16 h-16 rounded-full bg-slate-100 border-4 border-white shadow flex items-center justify-center text-indigo-600 font-black text-xl">
                              {lessons.length > 0 ? Math.round((Object.values(userProgress?.units || {}).filter((u: { completed?: boolean }) => u.completed).length / lessons.length) * 100) : 0}%
                          </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {lessons.map((lesson) => {
                              const isCompleted = userProgress?.units?.[lesson.id]?.completed;
                              return (
                                  <div key={lesson.id} className={`group relative p-6 rounded-[25px] bg-white border-2 transition-all duration-300 overflow-hidden
                                      ${isCompleted ? 'border-green-400/30' : 'border-transparent hover:border-indigo-100 shadow-sm hover:shadow-md'}`}>
                                      
                                      {isCompleted && (
                                          <div className="absolute top-4 right-4 bg-green-100 text-green-600 px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1">
                                              <CheckCircle2 size={12}/> เรียนจบแล้ว
                                          </div>
                                      )}

                                      <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${lesson.color}`}></div>
                                      
                                      <div className="flex items-center gap-4 mb-3">
                                          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${lesson.color} flex items-center justify-center text-white shadow-lg`}>
                                              {isCompleted ? <Star size={24} fill="white"/> : <PlayCircle size={24}/>}
                                          </div>
                                          <div>
                                              <h4 className="font-bold text-slate-800 text-lg">{lesson.title}</h4>
                                              <p className="text-xs text-slate-500">{lesson.desc}</p>
                                          </div>
                                      </div>
                                      
                                      <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                                          <span className="text-xs font-bold text-slate-400">สถานะ: {isCompleted ? 'Completed' : 'In Progress'}</span>
                                          <button 
                                            onClick={() => handleNavigateToUnit(lesson.id)} 
                                            className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-3 py-1.5 rounded-lg font-bold transition-colors flex items-center gap-1"
                                          >
                                              ไปที่บทเรียน <ChevronRight size={14}/>
                                          </button>
                                      </div>
                                  </div>
                              );
                          })}
                      </div>
                  </div>
              </div>
          )}

      </div>
    </div>
  );
};

export default StudentCommunicationView;
