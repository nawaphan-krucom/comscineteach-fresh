import React, { useState, useRef, useEffect } from 'react';
import type { ActivityData } from '../types';
import { CheckCircle2, Trophy, Eraser, PenTool, ArrowLeft, ArrowRight, XCircle, HelpCircle } from './icons/EmojiIcons';
import { useData } from '../contexts/DataContext';



interface ActivityViewProps {
  activity: ActivityData;
  onBack: () => void;
}

const ActivityView: React.FC<ActivityViewProps> = ({ activity, onBack }) => {
  const { saveActivityResult, userProgress } = useData();
  const [completed, setCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<{status: 'success' | 'error' | null, message: string}>({ status: null, message: '' });
  const [countdown, setCountdown] = useState(5);

  // Determine if activity is auto-gradable
  const isAutoGrade = ['matching', 'ordering', 'multiple_choice_game'].includes(activity.type);
  const rawContent = activity.content as unknown;

  // Local content type guards
  type MatchingContent = { options: { id: number; label: string; isCorrect?: boolean }[] };
  const isMatchingContent = (v: unknown): v is MatchingContent => {
    return typeof v === 'object' && v !== null && Array.isArray((v as Record<string, unknown>).options);
  };

  type OrderingContent = { items: string[]; correctOrder: string[] };
  const isOrderingContent = (v: unknown): v is OrderingContent => {
    return typeof v === 'object' && v !== null && Array.isArray((v as Record<string, unknown>).items);
  };

  type FillBlankContent = { input: { correct: string }; process: { correct: string }; output: { correct: string } };
  const isFillBlankContent = (v: unknown): v is FillBlankContent => {
    const r = typeof v === 'object' && v !== null ? (v as Record<string, unknown>) : null;
    return !!r && typeof r.input === 'object' && typeof r.process === 'object' && typeof r.output === 'object';
  };

  type MCQQuestion = { q?: string; question?: string; options: string[]; correct?: string; correctAnswer?: string };
  const isMCQContent = (v: unknown): v is MCQQuestion[] => Array.isArray(v) && v.every(item => typeof item === 'object' && item !== null && (('q' in (item as Record<string, unknown>)) || ('question' in (item as Record<string, unknown>))) && ('options' in (item as Record<string, unknown>)));

  type ShortAnswerContent = { correctKeywords?: string[]; hint?: string };

  // --- Matching Game State ---
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  // --- Ordering Game State ---
  const [orderItems, setOrderItems] = useState<string[]>(() => {
    if (activity.type === 'ordering' && isOrderingContent(rawContent)) {
      return [...rawContent.items].sort(() => Math.random() - 0.5);
    }
    return [];
  });
  // --- Fill Blank State ---
  const [blankAnswers, setBlankAnswers] = useState<{input: string, process: string, output: string}>({ input: '', process: '', output: '' });
  // --- Multiple Choice Game State ---
  const [mcqState, setMcqState] = useState({ current: 0, score: 0, finished: false, answered: false, selected: '' });
  // --- Short Answer State ---
  const [shortAnswerText, setShortAnswerText] = useState('');
  // --- Drawing State ---
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Confirmation Dialog State
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  // Clear feedback after 3 seconds
  useEffect(() => {
      if(feedback.status) {
          const timer = setTimeout(() => setFeedback({ status: null, message: '' }), 3000);
          return () => clearTimeout(timer);
      }
  }, [feedback]);

  // Auto-redirect on completion
  useEffect(() => {
    if (completed) {
        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    onBack();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }
  }, [completed, onBack]);

  const requestSubmit = (action: () => void) => {
      setPendingAction(() => action);
      setShowConfirm(true);
  };

  const confirmAction = () => {
      if (pendingAction) {
          pendingAction();
      }
      setShowConfirm(false);
      setPendingAction(null);
  };

  const checkMatching = () => {
    if (!isMatchingContent(rawContent)) return;
    const correctItems = rawContent.options.filter(o => o.isCorrect).map(o => o.id);
    const userCorrect = selectedItems.filter(id => correctItems.includes(id)).length;
    const userWrong = selectedItems.filter(id => !correctItems.includes(id)).length;
    const rawScore = Math.max(0, userCorrect - userWrong);
    const maxPossible = correctItems.length;
    const finalScore = Math.round((rawScore / maxPossible) * activity.maxScore);

    setScore(finalScore);
    setCompleted(true);
    if (isAutoGrade) {
      saveActivityResult(activity.id, finalScore, 'graded');
    }
  };

  const checkOrdering = () => {
    if (!isOrderingContent(rawContent)) return;
    const correctOrder = rawContent.correctOrder as string[];
    const userOrder = orderItems;
    
    let correctCount = 0;
    correctOrder.forEach((item, index) => {
        if (userOrder[index] === item) {
            correctCount++;
        }
    });
    
    const finalScore = Math.round((correctCount / correctOrder.length) * activity.maxScore);

    // Immediately complete and save score
    setScore(finalScore);
    setCompleted(true);
    if (isAutoGrade) {
      saveActivityResult(activity.id, finalScore, 'graded');
    }
  };

  const moveOrder = (index: number, direction: 'up' | 'down') => {
    const newItems = [...orderItems];
    if (direction === 'up' && index > 0) {
      [newItems[index], newItems[index - 1]] = [newItems[index - 1], newItems[index]];
    } else if (direction === 'down' && index < newItems.length - 1) {
      [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
    }
    setOrderItems(newItems);
  };

  const checkFillBlank = () => {
    if (!isFillBlankContent(rawContent)) return;
    let correctCount = 0;
    if (blankAnswers.input === rawContent.input.correct) correctCount++;
    if (blankAnswers.process === rawContent.process.correct) correctCount++;
    if (blankAnswers.output === rawContent.output.correct) correctCount++;
    
    if (correctCount === 3) {
        setFeedback({ status: 'success', message: 'เก่งมาก! ตอบถูกครบทุกช่อง' });
    } else {
        setFeedback({ status: 'error', message: `ถูก ${correctCount} ข้อ ลองดูใหม่นะ` });
    }

    const finalScore = Math.round((correctCount / 3) * activity.maxScore);
    
    setTimeout(() => {
        setScore(finalScore);
        setCompleted(true);
        if (isAutoGrade) {
          saveActivityResult(activity.id, finalScore, 'graded');
        }
    }, 3000);
  };

  const selectMcqOption = (option: string) => {
      if (mcqState.answered) return;
      setMcqState({...mcqState, selected: option});
  }

  const confirmMcqAnswer = () => {
    if (!mcqState.selected) return;
    
    if (!isMCQContent(rawContent)) return;
    const currentQ = rawContent[mcqState.current];
    const isCorrect = mcqState.selected === currentQ.correct;
    
    if (isCorrect) {
        setFeedback({ status: 'success', message: 'ถูกต้อง! 👍' });
    } else {
        setFeedback({ status: 'error', message: `ผิดนะ... ข้อที่ถูกคือ ${currentQ.correct}` });
    }

    const pointsPerQ = activity.maxScore / (isMCQContent(rawContent) ? rawContent.length : 1);
    const newScore = mcqState.score + (isCorrect ? pointsPerQ : 0);

    setMcqState({ ...mcqState, score: newScore, answered: true });
  }

  const nextMcqQuestion = () => {
        if (mcqState.current < (isMCQContent(rawContent) ? rawContent.length : 1) - 1) {
          setMcqState({ ...mcqState, current: mcqState.current + 1, answered: false, selected: '' });
          setFeedback({ status: null, message: '' });
      } else {
          // Finish MCQ
          requestSubmit(() => {
              setMcqState({ ...mcqState, finished: true });
              setScore(Math.round(mcqState.score));
              setCompleted(true);
              if (isAutoGrade) {
                saveActivityResult(activity.id, Math.round(mcqState.score), 'graded');
              }
          });
      }
  };

  const prevMcqQuestion = () => {
      if (mcqState.current > 0) {
          setMcqState({ ...mcqState, current: mcqState.current - 1 }); 
      }
  };

    const checkShortAnswer = () => {
      const keywords = (rawContent as ShortAnswerContent).correctKeywords || [];
      // Simple keyword matching
      const hasKeyword = keywords ? keywords.some(k => shortAnswerText.toLowerCase().includes(k.toLowerCase())) : true;
      const finalScore = hasKeyword ? activity.maxScore : 0;
      setScore(finalScore);
      setCompleted(true);
      if (isAutoGrade) {
        saveActivityResult(activity.id, finalScore, 'graded');
      }
  };

  // --- Drawing Logic (Mouse) ---
  const startDrawing = (e: React.MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      ctx.beginPath();
      ctx.moveTo(x, y);
      setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent) => {
      if (!isDrawing) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      ctx.lineTo(x, y);
      ctx.stroke();
  };

  // --- Drawing Logic (Touch - Mobile) ---
  const getTouchPos = (canvas: HTMLCanvasElement, touchEvent: React.TouchEvent) => {
    const rect = canvas.getBoundingClientRect();
    return {
      x: touchEvent.touches[0].clientX - rect.left,
      y: touchEvent.touches[0].clientY - rect.top
    };
  };

  const startDrawingTouch = (e: React.TouchEvent) => {
      // Prevent defaults if needed via CSS touch-action
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      const pos = getTouchPos(canvas, e);
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
      setIsDrawing(true);
  };

  const drawTouch = (e: React.TouchEvent) => {
      if (!isDrawing) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const pos = getTouchPos(canvas, e);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
  };

  const stopDrawing = () => {
      setIsDrawing(false);
  };

  const clearCanvas = () => {
      const canvas = canvasRef.current;
      if (canvas) {
          const ctx = canvas.getContext('2d');
          ctx?.clearRect(0, 0, canvas.width, canvas.height);
      }
  };

  const submitDrawing = () => {
      setScore(activity.maxScore);
      setCompleted(true);
      if (isAutoGrade) {
        saveActivityResult(activity.id, activity.maxScore);
      }
  };

  if (completed) {
    return (
      <div className="max-w-2xl mx-auto glass-card p-10 rounded-[30px] shadow-2xl text-center animate-fade-in border border-white/50 relative overflow-hidden">
        <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg border-4 border-white/50 relative z-10">
          <Trophy size={40} />
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2 font-cute relative z-10">
            {score === activity.maxScore ? "ยอดเยี่ยม!" : "ทำได้ดี!"}
        </h2>
        <p className="text-gray-600 mb-8 font-medium relative z-10">
            {score === activity.maxScore ? "คุณทำคะแนนได้เต็มเปี่ยม!" : "กิจกรรมเสร็จสิ้น"}
        </p>
        <div className="text-7xl font-black text-gray-800 mb-2 font-cute relative z-10">{score}</div>
        <div className="text-gray-400 font-bold mb-4 tracking-widest uppercase text-sm relative z-10">คะแนนเต็ม {activity.maxScore}</div>
        <p className="text-gray-500 mt-4 text-sm font-medium">
            กำลังกลับไปหน้าหลักใน {countdown} วินาที...
        </p>
        <button onClick={onBack} className="mt-4 px-8 py-3 bg-gray-800 text-white rounded-xl font-bold hover:scale-105 shadow-lg transition-all relative z-10">กลับสู่หน้าหลัก</button>
      </div>
    );
  }

  const existingResult = userProgress?.activities?.[activity.id];

  if (existingResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} className="text-green-600"/>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">กิจกรรมนี้เสร็จสิ้นแล้ว</h2>
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="text-sm text-gray-600 mb-2">คะแนนที่ได้</div>
            <div className="text-3xl font-black text-indigo-600">{existingResult.score}</div>
            <div className="text-sm text-gray-500">/ {activity.maxScore} คะแนน</div>
          </div>
          <div className="text-sm text-gray-500 mb-6">
            ส่งเมื่อ: {new Date(existingResult.submittedAt).toLocaleString('th-TH')}
          </div>
          <button 
            onClick={onBack}
            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors"
          >
            กลับสู่หน้าหลัก
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto animate-fade-in pb-20 relative">
      
      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl transform transition-all scale-100">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mb-4">
                <HelpCircle size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2 font-cute">ยืนยันคำตอบ?</h3>
              <p className="text-slate-500 mb-6 text-sm">
                คุณต้องการส่งคำตอบสำหรับกิจกรรมนี้ใช่หรือไม่?
              </p>
              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                >
                  ยกเลิก
                </button>
                <button 
                  onClick={confirmAction}
                  className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg transition-all"
                >
                  ยืนยัน
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Toast */}
      {feedback.status && (
          <div className={`fixed top-20 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-full shadow-xl z-50 flex items-center gap-2 text-white font-bold animate-fade-in ${feedback.status === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
              {feedback.status === 'success' ? <CheckCircle2 size={20}/> : <XCircle size={20}/>}
              {feedback.message}
          </div>
      )}

      <div className="glass-card rounded-[30px] shadow-xl border border-white/50 p-8 md:p-10 relative">
        <div className="mb-8 border-b border-gray-200/50 pb-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-2 font-cute">{activity.title}</h2>
          <p className="text-gray-500 font-medium">{activity.description}</p>
        </div>

        {/* TYPE: MATCHING */}
        {activity.type === 'matching' && isMatchingContent(rawContent) && (
          <div className="space-y-6">
            <h3 className="font-bold text-lg text-gray-700 font-cute">{((rawContent as Record<string, unknown>).question as string) ?? ''}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(rawContent as MatchingContent).options.map((opt) => (
                <div 
                  key={opt.id}
                  onClick={() => {
                    if (selectedItems.includes(opt.id)) {
                      setSelectedItems(selectedItems.filter(id => id !== opt.id));
                    } else {
                      setSelectedItems([...selectedItems, opt.id]);
                    }
                  }}
                  className={`p-5 rounded-2xl border cursor-pointer flex items-center justify-between transition-all shadow-sm noselect
                    ${selectedItems.includes(opt.id) 
                      ? 'border-indigo-500 bg-indigo-500 text-white shadow-md transform scale-[1.02]' 
                      : 'border-white bg-white/60 hover:bg-white text-gray-600'}`}
                >
                  <span className="font-medium">{((opt as Record<string, unknown>).text as string) ?? opt.label ?? String(opt)}</span>
                  {selectedItems.includes(opt.id) && <CheckCircle2 size={24} className="text-white"/>}
                </div>
              ))}
            </div>
            <button onClick={() => requestSubmit(checkMatching)} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold mt-6 hover:scale-105 shadow-lg transition-all">ส่งคำตอบ</button>
          </div>
        )}

        {/* TYPE: ORDERING */}
        {activity.type === 'ordering' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500 text-center font-bold bg-white/50 py-2 rounded-lg mb-4">เรียงลำดับขั้นตอนให้ถูกต้อง</p>
            {orderItems.map((item, index) => (
              <div key={index} className="flex items-center gap-4 bg-white/60 p-5 rounded-2xl border border-white/60 shadow-sm animate-fade-in noselect">
                <span className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-bold text-gray-400 shadow-sm">{index+1}</span>
                <span className="flex-grow font-bold text-gray-700 text-lg">{item}</span>
                <div className="flex flex-col gap-1">
                  <button onClick={() => moveOrder(index, 'up')} disabled={index === 0} className="p-1 hover:bg-white rounded disabled:opacity-30">🔼</button>
                  <button onClick={() => moveOrder(index, 'down')} disabled={index === orderItems.length - 1} className="p-1 hover:bg-white rounded disabled:opacity-30">🔽</button>
                </div>
              </div>
            ))}
            <button onClick={() => requestSubmit(checkOrdering)} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold mt-6 hover:scale-105 shadow-lg transition-all">ส่งคำตอบ</button>
          </div>
        )}

        {/* TYPE: FILL BLANK */}
        {activity.type === 'fill_blank' && isFillBlankContent(rawContent) && (
          <div className="space-y-8">
             <div className="grid gap-8">
               {['input', 'process', 'output'].map((part) => (
                 <div key={part} className="bg-white/40 p-6 rounded-[25px] border border-white/60 shadow-sm">
                   <h4 className="font-black uppercase text-gray-400 mb-4 tracking-widest text-sm">{part}</h4>
                   <div className="flex gap-3 flex-wrap">
                     {((((rawContent as Record<string, unknown>)[part] as Record<string, unknown>) || {}).options as string[] || []).map((opt: string) => (
                       <button
                         key={opt}
                         onClick={() => setBlankAnswers({...blankAnswers, [part]: opt})}
                         className={`px-5 py-2.5 rounded-xl text-sm border font-bold transition-all noselect ${
                           (blankAnswers[part as keyof typeof blankAnswers] === opt)
                           ? 'bg-indigo-500 text-white border-indigo-500 shadow-md' 
                           : 'bg-white text-gray-600 border-white hover:border-indigo-300'
                         }`}
                       >
                         {opt}
                       </button>
                     ))}
                   </div>
                 </div>
               ))}
             </div>
             <button onClick={() => requestSubmit(checkFillBlank)} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold mt-6 hover:scale-105 shadow-lg transition-all">ส่งคำตอบ</button>
          </div>
        )}

        {/* TYPE: MCQ */}
        {activity.type === 'multiple_choice_game' && (() => {
          const mcqQ: MCQQuestion[] = isMCQContent(rawContent) ? (rawContent as MCQQuestion[]) : [];
          const totalQ = mcqQ.length || 1;
          const currentQ = mcqQ[mcqState.current];
          return (
            <div>
              <div className="mb-6 flex justify-between text-sm font-bold text-gray-400 uppercase tracking-wider">
                <span>ข้อที่ {mcqState.current + 1}/{totalQ}</span>
                <span>คะแนนสะสม: {Math.round(mcqState.score)}</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-8 leading-relaxed font-cute">{currentQ ? (currentQ.q ?? currentQ.question) : ''}</h3>
              <div className="space-y-4">
                {(currentQ ? currentQ.options : []).map((opt: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => selectMcqOption(opt)}
                    disabled={mcqState.answered}
                    className={`w-full p-5 rounded-2xl border text-left font-bold transition-all shadow-sm flex items-center justify-between noselect
                      ${mcqState.selected === opt 
                          ? 'border-indigo-500 bg-indigo-500 text-white' 
                          : 'border-white bg-white/60 text-gray-600 hover:bg-white'}
                        ${mcqState.answered && mcqState.selected === opt ? (opt === (currentQ ? (currentQ.correct ?? currentQ.correctAnswer) : '') ? 'bg-green-500 border-green-500' : 'bg-red-500 border-red-500') : ''}
                    `}
                  >
                    {opt}
                    {mcqState.answered && mcqState.selected === opt && (
                        opt === (currentQ ? (currentQ.correct ?? currentQ.correctAnswer) : '') ? <CheckCircle2 /> : <span className="text-white font-bold">X</span>
                    )}
                  </button>
                ))}
              </div>
              <div className="mt-8 flex justify-between gap-4">
                  {/* Internal Navigation for MCQ */}
                  <button 
                      onClick={prevMcqQuestion}
                      disabled={mcqState.current === 0}
                      className="px-6 py-3 rounded-xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 disabled:opacity-30"
                  >
                      ย้อนกลับ
                  </button>
                  {!mcqState.answered ? (
                      <button 
                          onClick={confirmMcqAnswer}
                          disabled={!mcqState.selected}
                          className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-lg"
                      >
                          ยืนยันคำตอบ
                      </button>
                  ) : (
                      <button 
                          onClick={nextMcqQuestion}
                          className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg flex items-center justify-center gap-2"
                      >
                          {mcqState.current < totalQ - 1 ? 'ข้อถัดไป' : 'จบเกม'} <ArrowRight size={20}/>
                      </button>
                  )}
              </div>
            </div>
          );
        })()}

        {/* TYPE: SHORT ANSWER */}
        {activity.type === 'short_answer' && (
            <div className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-xl text-blue-800 text-sm border border-blue-100 flex gap-2">
                  <span>💡</span> <span>{((rawContent as Record<string, unknown>).hint as string) ?? ''}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-700">{((rawContent as Record<string, unknown>).question as string) ?? ''}</h3>
                <textarea 
                    value={shortAnswerText}
                    onChange={(e) => setShortAnswerText(e.target.value)}
                    className="w-full p-4 rounded-2xl border border-slate-200 bg-white/80 focus:ring-2 focus:ring-indigo-400 outline-none min-h-[120px]"
                    placeholder="พิมพ์คำตอบของคุณที่นี่..."
                ></textarea>
                <button onClick={() => requestSubmit(checkShortAnswer)} disabled={!shortAnswerText.trim()} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:scale-105 shadow-lg transition-all disabled:opacity-50">ส่งคำตอบ</button>
            </div>
        )}

        {/* TYPE: DRAWING */}
        {activity.type === 'drawing' && (
            <div className="space-y-4">
                <p className="font-bold text-gray-700">{((rawContent as Record<string, unknown>).instruction as string) ?? ''}</p>
                <div className="bg-white rounded-xl shadow-inner border-2 border-slate-200 overflow-hidden relative touch-none">
                    <canvas 
                        ref={canvasRef}
                        width={600}
                        height={400}
                        className="w-full h-[300px] cursor-crosshair bg-white touch-none"
                        style={{ touchAction: 'none' }}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawingTouch}
                        onTouchMove={drawTouch}
                        onTouchEnd={stopDrawing}
                        onTouchCancel={stopDrawing}
                    />
                    <div className="absolute top-2 right-2 flex gap-2">
                        <button onClick={clearCanvas} className="p-2 bg-red-100 text-red-500 rounded-full hover:bg-red-200" title="ล้างกระดาน">
                            <Eraser size={20}/>
                        </button>
                        <div className="p-2 bg-indigo-100 text-indigo-500 rounded-full cursor-default">
                            <PenTool size={20}/>
                        </div>
                    </div>
                </div>
                <p className="text-xs text-center text-gray-400">วาดลงในพื้นที่ว่างด้านบน (รองรับการวาดด้วยนิ้วมือ)</p>
                <button onClick={() => requestSubmit(submitDrawing)} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold mt-4 hover:scale-105 shadow-lg transition-all">ส่งผลงาน</button>
            </div>
        )}

      </div>

      {/* Global Navigation Bottom */}
      <div className="fixed bottom-0 left-0 right-0 p-4 flex justify-center pointer-events-none z-20">
          <button 
            onClick={onBack}
            className="pointer-events-auto px-6 py-3 bg-white/90 backdrop-blur text-slate-600 rounded-full font-bold shadow-lg border border-slate-200 hover:bg-white hover:scale-105 transition-all flex items-center gap-2"
          >
              <ArrowLeft size={18}/> ย้อนกลับสู่หน้าหลัก
          </button>
      </div>
    </div>
  );
};

export default ActivityView;