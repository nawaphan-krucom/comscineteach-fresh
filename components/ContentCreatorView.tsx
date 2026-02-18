
import React, { useState } from 'react';
// Added PlusCircle and Sparkles to the lucide-react imports to fix ReferenceErrors.
import { PlusSquare, Book, Activity, BrainCircuit, Loader2, Save, X, Plus, Trash2, CheckSquare, ListOrdered, Layers, FileText, MousePointer2, PlusCircle, Sparkles } from './icons/EmojiIcons';
import { useData } from '../contexts/DataContext';
import { useError } from '../contexts/ErrorContext';
import type { QuizData, Question, ActivityData } from '../types';

const ContentCreatorView: React.FC = () => {
  const { courseUnits, addCustomQuiz, addCustomActivity, customQuizzes, customActivities } = useData();
  const { logError } = useError();

  const [creatorType, setCreatorType] = useState<'quiz' | 'activity' | 'manage'>('quiz');
  
  // --- Quiz State ---
  const [quizTitle, setQuizTitle] = useState('');
  const [quizUnitId, setQuizUnitId] = useState(courseUnits[0]?.id || 'unit_1');
  const [questions, setQuestions] = useState<Partial<Question>[]>([{ question: '', options: ['', '', '', ''], correctAnswer: 0 }]);
  
  // --- Activity State ---
  const [actTitle, setActTitle] = useState('');
  const [actUnitId, setActUnitId] = useState(courseUnits[0]?.id || 'unit_1');
    const [actType, setActType] = useState<ActivityData['type']>('matching');
  const [actDesc, setActDesc] = useState('');
  
  // AI Modal State
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [aiNumQuestions, setAiNumQuestions] = useState(3);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // --- Handlers for Quiz ---
  const handleAddQuestion = () => {
    setQuestions([...questions, { question: '', options: ['', '', '', ''], correctAnswer: 0 }]);
  };

  const handleRemoveQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const handleQuestionChange = (index: number, field: string, value: unknown) => {
    const newQuestions = [...questions];
    (newQuestions[index] as Record<string, unknown>)[field] = value;
    setQuestions(newQuestions);
  };

  const handleOptionChange = (qIndex: number, oIndex: number, value: string) => {
    const newQuestions = [...questions];
    if (newQuestions[qIndex].options) {
      (newQuestions[qIndex].options as string[])[oIndex] = value;
      setQuestions(newQuestions);
    }
  };

  const handleGenerateWithAi = async () => {
    if (!aiTopic.trim()) {
      logError('กรุณาระบุหัวข้อสำหรับสร้างคำถาม', 'warning');
      return;
    }
    setIsAiLoading(true);

    try {
      logError('ฟีเจอร์ AI ยังไม่พร้อมใช้งานบนฝั่งไคลเอ็นต์ โปรดตั้งค่า backend เพื่อใช้งาน', 'error');
    } catch (e: unknown) {
      console.error('AI Generate Fallback Error:', e);
    } finally {
      setIsAiLoading(false);
      setIsAiModalOpen(false);
    }
  };

  const handleSaveQuiz = () => {
    if (!quizTitle.trim()) { logError('กรุณาตั้งชื่อแบบทดสอบ', 'warning'); return; }
    if (questions.some(q => !q.question?.trim() || q.options?.some(o => !o.trim()))) {
      logError('กรุณากรอกข้อมูลคำถามและตัวเลือกให้ครบทุกช่อง', 'warning'); return;
    }

    const newQuiz: QuizData = {
        id: `custom_quiz_${Date.now()}`,
        title: quizTitle,
        questions: questions as Question[],
        maxScore: questions.length,
        skill: 'design',
    };
    
    addCustomQuiz(quizUnitId, newQuiz);
    setQuizTitle('');
    setQuestions([{ question: '', options: ['', '', '', ''], correctAnswer: 0 }]);
  };

  const handleSaveActivity = () => {
    if (!actTitle.trim()) { logError('กรุณาตั้งชื่อกิจกรรม', 'warning'); return; }
    
    // Create a mock skeleton content based on type
    let content: unknown = {};
    if (actType === 'matching') {
        content = { question: "จงเลือกคู่ที่ถูกต้อง", options: [{ id: 1, text: "ตัวอย่าง 1", isCorrect: true }, { id: 2, text: "ตัวอย่าง 2", isCorrect: false }] };
    } else if (actType === 'ordering') {
        content = { items: ["Step 1", "Step 2", "Step 3"], correctOrder: ["Step 1", "Step 2", "Step 3"] };
    }

    const newActivity: ActivityData = {
        id: `custom_act_${Date.now()}`,
        unitId: actUnitId,
        title: actTitle,
        description: actDesc,
        type: actType,
        maxScore: 10,
        content: content,
        skill: 'algorithm'
    };

    addCustomActivity(actUnitId, newActivity);
    setActTitle('');
    setActDesc('');
  };

  return (
    <div className="bg-white rounded-[30px] p-4 md:p-8 animate-fade-in shadow-sm border border-slate-100">
        <h3 className="text-xl font-bold font-cute mb-6 flex items-center gap-2">
            <PlusSquare size={24} className="text-teal-500"/> เครื่องมือสร้างเนื้อหา (Content Creator)
        </h3>
        
        <div className="flex flex-wrap gap-2 mb-8">
            <button onClick={() => setCreatorType('quiz')} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${creatorType === 'quiz' ? 'bg-teal-600 text-white shadow-md' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>
                <Book size={18}/> สร้างแบบทดสอบ
            </button>
             <button onClick={() => setCreatorType('activity')} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${creatorType === 'activity' ? 'bg-teal-600 text-white shadow-md' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>
                <Activity size={18}/> สร้างกิจกรรม
            </button>
            <button onClick={() => setCreatorType('manage')} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${creatorType === 'manage' ? 'bg-teal-600 text-white shadow-md' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>
                <Layers size={18}/> จัดการเนื้อหา
            </button>
        </div>

        {creatorType === 'quiz' && (
            <div className="space-y-6 animate-fade-in">
                <div className="bg-slate-50 p-6 rounded-[25px] border border-slate-100 grid md:grid-cols-2 gap-6">
                    <div>
                        <label className="text-xs font-black text-slate-400 uppercase mb-2 block tracking-widest">Quiz Name</label>
                        <input type="text" value={quizTitle} onChange={e => setQuizTitle(e.target.value)} placeholder="เช่น แบบทดสอบย่อยบทที่ 1" className="w-full p-3 border rounded-xl bg-white focus:ring-2 ring-teal-300 outline-none"/>
                    </div>
                    <div>
                        <label className="text-xs font-black text-slate-400 uppercase mb-2 block tracking-widest">Select Unit</label>
                        <select value={quizUnitId} onChange={e => setQuizUnitId(e.target.value)} className="w-full p-3 border rounded-xl bg-white focus:ring-2 ring-teal-300 outline-none">
                            {courseUnits.map(u => <option key={u.id} value={u.id}>{u.subtitle}</option>)}
                        </select>
                    </div>
                </div>

                <div className="flex justify-between items-center px-2">
                    <h4 className="font-bold text-slate-700">คำถาม ({questions.length})</h4>
                    <button onClick={() => setIsAiModalOpen(true)} className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg font-bold flex items-center gap-2 hover:bg-indigo-100 text-sm shadow-sm transition-all active:scale-95">
                        <BrainCircuit size={16}/> ให้ AI ช่วยออกข้อสอบ ✨
                    </button>
                </div>

                <div className="space-y-4 max-h-[50vh] overflow-y-auto custom-scrollbar pr-4">
                    {questions.map((q, qIndex) => (
                        <div key={qIndex} className="bg-white p-6 rounded-2xl border-2 border-slate-100 relative group hover:border-teal-100 transition-all">
                            <button onClick={() => handleRemoveQuestion(qIndex)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={16}/></button>
                            
                            <div className="mb-4">
                                <label className="text-[10px] font-black text-slate-300 uppercase block mb-1">Question {qIndex + 1}</label>
                                <input type="text" value={q.question} onChange={e => handleQuestionChange(qIndex, 'question', e.target.value)} placeholder="พิมพ์คำถาม..." className="w-full p-2.5 text-lg font-bold text-slate-700 bg-slate-50 border-none rounded-lg focus:ring-2 ring-indigo-200 outline-none"/>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {q.options?.map((opt, oIndex) => (
                                    <div key={oIndex} className="relative group/opt">
                                        <div className={`flex items-center gap-3 p-2 rounded-xl border-2 transition-all ${q.correctAnswer === oIndex ? 'bg-green-50 border-green-400' : 'bg-white border-slate-100 hover:border-slate-200'}`}>
                                            <button 
                                                onClick={() => handleQuestionChange(qIndex, 'correctAnswer', oIndex)} 
                                                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${q.correctAnswer === oIndex ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-slate-200'}`}
                                            >
                                                {q.correctAnswer === oIndex && <CheckSquare size={14}/>}
                                            </button>
                                            <input type="text" value={opt} onChange={e => handleOptionChange(qIndex, oIndex, e.target.value)} placeholder={`ตัวเลือก ${oIndex+1}`} className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-slate-600"/>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex gap-4 pt-4">
                    <button onClick={handleAddQuestion} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-200 transition-all active:scale-95"><Plus size={20}/> เพิ่มคำถาม</button>
                    <button onClick={handleSaveQuiz} className="flex-[2] py-4 bg-teal-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-teal-700 shadow-xl shadow-teal-100 transition-all active:scale-95">
                        <Save size={20}/> บันทึกแบบทดสอบ
                    </button>
                </div>
            </div>
        )}

        {creatorType === 'activity' && (
            <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
                <div className="bg-slate-50 p-8 rounded-[35px] border-2 border-dashed border-teal-200 space-y-6">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Activity size={32}/>
                        </div>
                        <h4 className="text-xl font-bold text-slate-800">สร้างใบกิจกรรม/เกม</h4>
                        <p className="text-sm text-slate-500">เลือกประเภทและระบุรายละเอียดเบื้องต้น</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { id: 'matching', label: 'Matching', icon: <Layers size={20}/> },
                            { id: 'ordering', label: 'Ordering', icon: <ListOrdered size={20}/> },
                            { id: 'fill_blank', label: 'Fill Blanks', icon: <FileText size={20}/> },
                            { id: 'drawing', label: 'Drawing', icon: <MousePointer2 size={20}/> }
                        ].map(t => (
                            <button 
                                key={t.id} 
                                onClick={() => setActType(t.id as ActivityData['type'])}
                                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${actType === t.id ? 'bg-teal-500 text-white border-teal-600 shadow-md' : 'bg-white text-slate-400 border-slate-100 hover:border-teal-200'}`}
                            >
                                {t.icon}
                                <span className="text-xs font-bold uppercase">{t.label}</span>
                            </button>
                        ))}
                    </div>

                    <div className="space-y-4 pt-4">
                        <input type="text" value={actTitle} onChange={e => setActTitle(e.target.value)} placeholder="ชื่อกิจกรรม..." className="w-full p-3 border rounded-xl bg-white outline-none focus:ring-2 ring-teal-300"/>
                        <textarea value={actDesc} onChange={e => setActDesc(e.target.value)} placeholder="คำอธิบายกิจกรรม..." className="w-full p-3 border rounded-xl bg-white h-24 outline-none focus:ring-2 ring-teal-300"/>
                        <select value={actUnitId} onChange={e => setActUnitId(e.target.value)} className="w-full p-3 border rounded-xl bg-white font-bold text-slate-600">
                            {courseUnits.map(u => <option key={u.id} value={u.id}>Unit: {u.subtitle.split(':')[0]}</option>)}
                        </select>
                    </div>
                </div>

                <button onClick={handleSaveActivity} className="w-full py-4 bg-teal-600 text-white rounded-2xl font-bold shadow-lg hover:bg-teal-700 transition-all flex items-center justify-center gap-2">
                    <PlusCircle size={20}/> สร้างกิจกรรม (รับตัวอย่างโครงสร้าง)
                </button>
            </div>
        )}

        {creatorType === 'manage' && (
            <div className="space-y-8 animate-fade-in">
                <div>
                    <h4 className="font-bold text-slate-700 mb-4 flex items-center gap-2"><Book size={18}/> แบบทดสอบที่สร้างเอง ({customQuizzes.length})</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {customQuizzes.length > 0 ? customQuizzes.map(q => (
                            <div key={q.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex justify-between items-center group">
                                <div>
                                    <h5 className="font-bold text-slate-800">{q.title}</h5>
                                    <p className="text-xs text-slate-400">{q.questions.length} ข้อ | {q.id}</p>
                                </div>
                                <button className="p-2 text-red-400 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={18}/></button>
                            </div>
                        )) : <p className="text-center text-slate-400 py-10 w-full bg-slate-50 rounded-2xl col-span-2 border-2 border-dashed border-slate-100">ยังไม่มีแบบทดสอบที่สร้างเอง</p>}
                    </div>
                </div>

                <div>
                    <h4 className="font-bold text-slate-700 mb-4 flex items-center gap-2"><Activity size={18}/> กิจกรรมที่สร้างเอง ({customActivities.length})</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {customActivities.length > 0 ? customActivities.map(a => (
                            <div key={a.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex justify-between items-center group">
                                <div>
                                    <h5 className="font-bold text-slate-800">{a.title}</h5>
                                    <p className="text-xs text-slate-400 uppercase">{a.type} | {a.unitId}</p>
                                </div>
                                <button className="p-2 text-red-400 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={18}/></button>
                            </div>
                        )) : <p className="text-center text-slate-400 py-10 w-full bg-slate-50 rounded-2xl col-span-2 border-2 border-dashed border-slate-100">ยังไม่มีกิจกรรมที่สร้างเอง</p>}
                    </div>
                </div>
            </div>
        )}
        
        {isAiModalOpen && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-fade-in">
                <div className="bg-white rounded-[35px] p-8 max-md w-full shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -mr-16 -mt-16"></div>
                    
                    <div className="flex justify-between items-center mb-6 relative z-10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center"><BrainCircuit size={24}/></div>
                            <h4 className="font-bold text-lg">AI Quiz Generator</h4>
                        </div>
                        <button onClick={() => setIsAiModalOpen(false)} className="p-1 hover:bg-slate-100 rounded-full"><X size={24}/></button>
                    </div>

                    <div className="space-y-5 relative z-10">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1 block">หัวข้อที่ต้องการ (เช่น ประวัติคอมพิวเตอร์)</label>
                            <input type="text" value={aiTopic} onChange={e => setAiTopic(e.target.value)} placeholder="พิมพ์หัวข้อที่นี่..." className="w-full p-3.5 border-2 border-slate-100 rounded-2xl bg-slate-50 outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-400 transition-all"/>
                        </div>
                        
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1 block">จำนวนคำถาม ({aiNumQuestions})</label>
                            <input type="range" value={aiNumQuestions} onChange={e => setAiNumQuestions(parseInt(e.target.value))} min="1" max="10" className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-500"/>
                        </div>

                        <button 
                            onClick={handleGenerateWithAi} 
                            disabled={isAiLoading || !aiTopic.trim()} 
                            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95"
                        >
                            {isAiLoading ? <Loader2 className="animate-spin" size={24}/> : <Sparkles size={24}/>}
                            {isAiLoading ? 'กำลังใช้พลัง AI คิด...' : 'สร้างคำถามทันที'}
                        </button>
                    </div>
                    <p className="text-[10px] text-center text-slate-400 mt-6 font-bold uppercase tracking-widest">Powered by Gemini AI 3.0</p>
                </div>
            </div>
        )}
    </div>
  );
};

export default ContentCreatorView;
