import React, { useState, useEffect, useRef } from 'react';
import type { QuizData, Question } from '../types';
import { CheckCircle2, ArrowRight, Trophy, Maximize, ShieldAlert, AlertCircle, X } from './icons/EmojiIcons';
import { useData } from '../contexts/DataContext';
import { useError } from '../contexts/ErrorContext';

interface QuizViewProps {
  quiz: QuizData;
  onBack: () => void;
  onComplete: (quizId: string) => void;
}

const CHEAT_LIMIT = 3;

const QuizView: React.FC<QuizViewProps> = ({ quiz, onBack, onComplete }) => {
  const { saveQuizResult, userProgress } = useData();
  const { logError } = useError();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [countdown, setCountdown] = useState(5);
  
  // Anti-cheat states
  const [examStarted, setExamStarted] = useState(false);
  const [cheatCount, setCheatCount] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);
  const [, setIsFullscreen] = useState(false);
  const [isCheatDetected, setIsCheatDetected] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const currentQuestion = questions[currentQIndex];

  // 1. Initial Setup: Shuffle Questions & Options
  useEffect(() => {
    let shuffledQuestions = [...quiz.questions].sort(() => Math.random() - 0.5);
    shuffledQuestions = shuffledQuestions.map(q => {
      const originalOptions = [...q.options];
      const correctOptionText = originalOptions[q.correctAnswer];
      const shuffledOptions = originalOptions.sort(() => Math.random() - 0.5);
      const newCorrectIndex = shuffledOptions.indexOf(correctOptionText);
      return { ...q, options: shuffledOptions, correctAnswer: newCorrectIndex };
    });
    setQuestions(shuffledQuestions);
    setAnswers(new Array(shuffledQuestions.length).fill(null));
  }, [quiz]);

  // 2. Anti-cheat: Visibility & Fullscreen Listeners
  useEffect(() => {
    if (!examStarted || showResult) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        const newCount = cheatCount + 1;
        setCheatCount(newCount);
        
        if (newCount >= CHEAT_LIMIT) {
            logError(`สลับหน้าจอเกิน ${CHEAT_LIMIT} ครั้ง ระบบส่งข้อสอบอัตโนมัติทันที`, 'error');
            handleSubmitQuiz(true);
        } else {
            setIsCheatDetected(true);
            logError(`ห้ามสลับหน้าจอ! ระบบบันทึกพฤติกรรมแล้ว (${newCount}/${CHEAT_LIMIT})`, 'warning');
        }
      }
    };

    const handleFullscreenChange = () => {
      const isFull = !!document.fullscreenElement;
      setIsFullscreen(isFull);
      if (!isFull && examStarted && !showResult && !isCheatDetected) { // Only trigger if exited unexpectedly
          const newCount = cheatCount + 1;
          setCheatCount(newCount);
          if (newCount >= CHEAT_LIMIT) {
              handleSubmitQuiz(true);
          } else {
              setIsCheatDetected(true);
              logError(`กรุณาทำข้อสอบในโหมดเต็มหน้าจอเท่านั้น (${newCount}/${CHEAT_LIMIT})`, 'warning');
          }
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        // Disable Ctrl+C, Ctrl+V, Ctrl+U, F12
        if ((e.ctrlKey || e.metaKey) && ['c', 'v', 'u', 's', 'p'].includes(e.key) || e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
            e.preventDefault();
            logError('ปิดการใช้งานคีย์ลัดเพื่อความปลอดภัย', 'warning');
        }
    };

    const handleContextMenu = (e: MouseEvent) => {
        e.preventDefault();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [examStarted, cheatCount, showResult, logError, isCheatDetected]);

  // Auto-redirect on result screen
  useEffect(() => {
    if (showResult) {
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
  }, [showResult, onBack]);

  const requestFullscreen = async () => {
    try {
        if (containerRef.current && containerRef.current.requestFullscreen) {
            await containerRef.current.requestFullscreen();
            setIsFullscreen(true);
        }
    } catch (e) {
        console.error("Fullscreen error:", e);
        logError('เบราว์เซอร์ของคุณอาจไม่รองรับโหมดเต็มหน้าจออัตโนมัติ', 'warning');
    }
  };

  const handleStartExam = async () => {
    await requestFullscreen();
    setExamStarted(true);
  };

  const handleOptionSelect = (index: number) => {
    if (showResult || isCheatDetected) return;
    setSelectedOption(index);
    const newAnswers = [...answers];
    newAnswers[currentQIndex] = index;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex(currentQIndex + 1);
      setSelectedOption(answers[currentQIndex + 1]);
    } else {
      setShowConfirm(true);
    }
  };

  const handlePrev = () => {
    if (currentQIndex > 0) {
      setCurrentQIndex(currentQIndex - 1);
      setSelectedOption(answers[currentQIndex - 1]);
    }
  };

  const handleSubmitQuiz = (_isForced = false) => {
    if (_isForced) {
      logError('การบังคับส่งข้อสอบ (forced submit) ถูกเรียก', 'info');
    }
    setShowConfirm(false);
    setIsCheatDetected(false);
    setExamStarted(false); // Stop listeners
    
    let newScore = 0;
    answers.forEach((ans, idx) => {
      if (ans === questions[idx].correctAnswer) {
        newScore++;
      }
    });

    const finalScore = Math.round((newScore / (questions.length || 1)) * quiz.maxScore);

    setScore(finalScore);
    setShowResult(true);
    saveQuizResult(quiz.id, finalScore, cheatCount);
    onComplete(quiz.id);
    
    // Exit fullscreen after finishing
    if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
    }
  };
  
  const resumeTest = async () => {
      await requestFullscreen();
      setIsCheatDetected(false);
  }

  // --- RENDERING ---

  if (!examStarted) {
      return (
          <div className="max-w-2xl mx-auto bg-white p-8 md:p-10 rounded-[40px] shadow-2xl text-center animate-fade-in border-2 border-slate-100">
              <div className="w-24 h-24 bg-indigo-100 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg rotate-3">
                  <ShieldAlert size={56} />
              </div>
              <h2 className="text-3xl font-black text-slate-800 mb-4 font-cute">ข้อตกลงการทำข้อสอบ</h2>
              <div className="bg-slate-50 p-6 rounded-3xl text-left border border-slate-200 mb-8 space-y-4">
                  <div className="flex gap-4 items-start">
                      <div className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center shrink-0"><X size={20} strokeWidth={3}/></div>
                      <div>
                        <p className="font-bold text-slate-700">ห้ามสลับหน้าต่าง</p>
                        <p className="text-sm text-slate-500">ห้ามสลับหน้าต่าง, เปิดแท็บใหม่, หรือย่อหน้าจอเด็ดขาด</p>
                      </div>
                  </div>
                  <div className="flex gap-4 items-start">
                      <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center shrink-0"><Maximize size={20} strokeWidth={3}/></div>
                      <div>
                        <p className="font-bold text-slate-700">โหมดเต็มหน้าจอ</p>
                        <p className="text-sm text-slate-500">ระบบจะเข้าสู่โหมดเต็มหน้าจอ (Full-screen) โดยอัตโนมัติ</p>
                      </div>
                  </div>
                  <p className="text-sm text-red-600 font-black text-center pt-4 border-t border-slate-200">
                    ⚠️ หากทำผิดกฎเกิน {CHEAT_LIMIT} ครั้ง ระบบจะส่งข้อสอบและบันทึกคะแนนทันที
                  </p>
              </div>
              <button 
                onClick={handleStartExam}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-lg shadow-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-3"
              >
                  รับทราบและเริ่มทำข้อสอบ <ArrowRight size={24}/>
              </button>
              <button onClick={onBack} className="mt-4 text-slate-400 font-bold hover:text-slate-600 transition-colors text-sm">ยกเลิก</button>
          </div>
      );
  }

  if (showResult) {
    return (
      <div className="max-w-2xl mx-auto glass-card p-10 rounded-[30px] shadow-2xl text-center animate-fade-in relative overflow-hidden bg-white">
        <div className="absolute top-0 right-0 w-40 h-40 bg-yellow-200 rounded-full blur-3xl -mr-16 -mt-16"></div>
        <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-orange-500 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg border-4 border-white/50 relative z-10">
          <Trophy size={40} />
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2 font-cute">ทำข้อสอบเสร็จแล้ว!</h2>
        <p className="text-gray-600 mb-8">นี่คือคะแนนของคุณ</p>
        <div className="text-7xl font-black text-gray-800 mb-2 font-cute">{score}</div>
        <div className="text-gray-400 font-bold mb-6 tracking-widest uppercase text-sm">คะแนนเต็ม {quiz.maxScore}</div>
        {cheatCount > 0 && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-xs font-bold mb-6">ตรวจพบพฤติกรรมสลับหน้าจอ {cheatCount} ครั้ง</div>
        )}
        <p className="text-gray-500 mt-4 text-sm font-medium">
            กำลังกลับไปหน้าหลักใน {countdown} วินาที...
        </p>
        <button onClick={onBack} className="mt-4 px-8 py-3 bg-gray-800 text-white rounded-xl font-bold hover:scale-105 shadow-lg transition-all">กลับสู่หน้าหลัก</button>
      </div>
    );
  }

  if (!currentQuestion) {
    return <div className="text-center text-gray-500">กำลังโหลดคำถาม...</div>;
  }

  const existingResult = userProgress?.quizzes?.[quiz.id];

  if (existingResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} className="text-green-600"/>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">แบบทดสอบนี้เสร็จสิ้นแล้ว</h2>
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="text-sm text-gray-600 mb-2">คะแนนที่ได้</div>
            <div className="text-3xl font-black text-indigo-600">{existingResult.score}</div>
            <div className="text-sm text-gray-500">/ {quiz.maxScore} คะแนน</div>
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
    <div ref={containerRef} className="w-full h-full bg-slate-50 flex flex-col p-4 md:p-8">
      {/* Cheat Detection Overlay */}
      {isCheatDetected && (
          <div className="absolute inset-0 bg-red-600/95 z-50 flex flex-col items-center justify-center text-white text-center p-8 animate-fade-in">
              <AlertCircle size={80} className="animate-bounce"/>
              <h2 className="text-4xl font-black mt-6">ตรวจพบพฤติกรรมน่าสงสัย!</h2>
              <p className="text-xl mt-2 mb-8">คุณพยายามออกจากหน้าทำข้อสอบ ({cheatCount}/{CHEAT_LIMIT})</p>
              <button 
                onClick={resumeTest} 
                className="px-8 py-4 bg-white text-red-600 font-black rounded-xl text-lg hover:bg-red-50"
              >
                  ฉันเข้าใจแล้ว (กลับเข้าสู่โหมดเต็มจอ)
              </button>
          </div>
      )}

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mb-4">
                <Trophy size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2 font-cute">ยืนยันการส่งข้อสอบ?</h3>
              <p className="text-slate-500 mb-6 text-sm">
                คุณตอบครบทุกข้อแล้ว และต้องการส่งคำตอบใช่หรือไม่?
              </p>
              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                >
                  กลับไปแก้ไข
                </button>
                <button 
                  onClick={() => handleSubmitQuiz()}
                  className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg transition-all"
                >
                  ส่งข้อสอบ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-4xl mx-auto flex-1 flex flex-col">
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-bold text-gray-700 text-sm md:text-base line-clamp-1">{quiz.title}</h2>
            <div className="text-xs font-bold text-gray-400 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">{currentQIndex + 1} / {questions.length}</div>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full">
            <div className="bg-indigo-500 h-full rounded-full transition-all duration-300" style={{ width: `${((currentQIndex + 1) / questions.length) * 100}%` }}></div>
          </div>
        </div>
        
        <div className="bg-white flex-1 p-6 md:p-10 rounded-[30px] shadow-sm border border-slate-200 flex flex-col">
            <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-8 leading-relaxed font-cute">{currentQuestion.question}</h3>
            
            <div className="space-y-4 flex-1">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleOptionSelect(index)}
                  className={`w-full p-5 rounded-2xl border text-left font-bold transition-all shadow-sm flex items-center gap-4
                    ${selectedOption === index 
                        ? 'border-indigo-500 bg-indigo-500 text-white ring-4 ring-indigo-200' 
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-gray-600'}`}
                >
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${selectedOption === index ? 'border-white bg-white/20' : 'border-slate-300'}`}>
                      {selectedOption === index && <CheckCircle2 size={16} className="text-white"/>}
                  </div>
                  <span>{option}</span>
                </button>
              ))}
            </div>
        </div>
        
        <div className="flex justify-between mt-6">
          <button 
            onClick={handlePrev} 
            disabled={currentQIndex === 0}
            className="px-6 py-3 bg-white text-gray-500 rounded-xl font-bold hover:bg-slate-100 disabled:opacity-50 transition-colors shadow-sm border border-slate-200"
          >
            ย้อนกลับ
          </button>
          <button 
            onClick={handleNext} 
            disabled={selectedOption === null}
            className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-lg flex items-center gap-2"
          >
            {currentQIndex === questions.length - 1 ? 'ส่งคำตอบ' : 'ข้อถัดไป'} <ArrowRight size={18}/>
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizView;