import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { useError } from '../contexts/ErrorContext';
import { Book, ArrowLeft, PenLine, StickyNote, CheckCircle, Clock } from './icons/EmojiIcons';
import { NOTEBOOK_MAX_SCORE, MIDTERM_EXAM, FINAL_EXAM } from '../constants';

interface NotebookViewProps {
  onBack: () => void;
}

const NotebookView: React.FC<NotebookViewProps> = ({ onBack }) => {
  const { userProgress, submitNotebook, courseUnits } = useData();
  const { logError } = useError();
  const [activeUnit, setActiveUnit] = useState(courseUnits[0]?.id || 'unit_1');
  const [noteContent, setNoteContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const units = courseUnits
    .slice()
    .sort((a, b) => a.order - b.order)
    .map(u => ({ id: u.id, title: u.title, subtitle: u.subtitle || '' }));

  const currentSubmission = userProgress?.notebookSubmissions?.[activeUnit];
  const currentScore = userProgress?.notebookScores?.[activeUnit] || 0;
  const isSubmitted = !!currentSubmission;
  const isGraded = currentSubmission?.score !== undefined;

  // Effect to load data when unit changes or user logs in
  useEffect(() => {
    if (!userProgress) return;

    // Priority: Cloud Data -> Local Draft -> Empty
    if (userProgress.notebook && userProgress.notebook[activeUnit]) {
      setNoteContent(userProgress.notebook[activeUnit]);
    } else {
      const draftKey = `notebook_draft_${userProgress.studentId}_${activeUnit}`;
      const draft = localStorage.getItem(draftKey);
      setNoteContent(draft || '');
    }
  }, [activeUnit, userProgress?.studentId]);

  const handleSaveDraft = () => {
    if (!userProgress || isSubmitted) return;
    const draftKey = `notebook_draft_${userProgress.studentId}_${activeUnit}`;
    localStorage.setItem(draftKey, noteContent);
  };
  
  // Debounced auto-save for drafts
  useEffect(() => {
    const handler = setTimeout(() => {
      if (!isSubmitted) { // Only save drafts for non-submitted notes
        handleSaveDraft();
      }
    }, 1000); // Save 1 second after user stops typing

    return () => {
      clearTimeout(handler);
    };
  }, [noteContent, activeUnit, isSubmitted, userProgress]);


  const handleSubmit = () => {
    if (noteContent.trim().length < 20) {
        logError("กรุณาเขียนสรุปเนื้อหาอย่างน้อย 20 ตัวอักษรเพื่อส่งงาน", 'warning');
        return;
    }
    setIsSaving(true);
    submitNotebook(activeUnit, noteContent);
    
    setTimeout(() => {
        setIsSaving(false);
        logError("ส่งสมุดบันทึกเรียบร้อยแล้ว! รอครูตรวจสอบ", 'success');
    }, 800);
  };

  const handleDownload = () => {
      const element = document.createElement("a");
      const file = new Blob([noteContent], {type: 'text/plain'});
      element.href = URL.createObjectURL(file);
      element.download = `my_notes_${activeUnit}.txt`;
      document.body.appendChild(element);
      element.click();
  };

  return (
    <div data-testid="notebook-view" className="animate-fade-in h-full flex flex-col">
      <header className="flex items-center gap-4 mb-6 shrink-0">
        <button onClick={onBack} aria-label="ย้อนกลับ" className="p-3 bg-white rounded-full shadow-sm hover:bg-slate-100 transition">
          <ArrowLeft size={20}/>
        </button>
        <div>
            <h1 className="text-3xl font-bold text-slate-800 font-cute flex items-center gap-2">
                <Book className="text-indigo-500" size={32}/> สมุดจดบันทึก (Digital Notebook)
            </h1>
            <p className="text-slate-500 text-sm">บันทึกสรุปความรู้เพื่อรับคะแนนพิเศษ ({NOTEBOOK_MAX_SCORE} คะแนน/หน่วย)</p>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row gap-6 overflow-hidden">
        {/* Unit Selector + Unit Details (matches other unit templates) */}
        <div className="md:w-64 flex flex-col gap-4 shrink-0">
          <div className="flex flex-col gap-2 bg-white/50 p-4 rounded-[25px] border border-white h-fit proto-card">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 pl-2">เลือกหน่วยการเรียนรู้</h3>
            {units.map(u => {
                const score = userProgress?.notebookScores?.[u.id] || 0;

                return (
                  <button
                    key={u.id}
                    onClick={() => setActiveUnit(u.id)}
                    className={`text-left px-4 py-3 rounded-lg text-sm font-medium transition-all flex items-center justify-between
                      ${activeUnit === u.id 
                        ? 'bg-indigo-600 text-white shadow-sm' 
                        : 'bg-white text-slate-600 hover:bg-slate-50'}`}
                    aria-label={`เลือกหน่วย ${u.title}`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <div className={`w-2 h-2 rounded-full ${activeUnit === u.id ? 'bg-white' : 'bg-slate-300'}`}></div>
                      <div className="truncate">
                        <div className="font-semibold truncate">{u.title}</div>
                      </div>
                    </div>
                    {score > 0 && <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full">{score}/{NOTEBOOK_MAX_SCORE}</span>}
                  </button>
                );
            })}
          </div>

          {/* Unit details: mirrors the pattern used across Unit pages and Portfolio */}
          <div data-testid="unit-details" className="bg-white p-4 rounded-[25px] border border-slate-100 proto-card">
            <h4 className="text-sm font-bold text-slate-700 mb-2">รายละเอียดหน่วย</h4>
            <p className="text-sm text-slate-500 mb-3">{units.find(u => u.id === activeUnit)?.title || ''}</p>

            <div data-testid="unit-objectives" className="mb-3">
              <h5 className="text-xs font-bold text-slate-400 uppercase mb-2">วัตถุประสงค์</h5>
              <ul className="text-sm text-slate-600 space-y-1">
                {(units.find(u => u.id === activeUnit)?.subtitle || '').split(' · ').slice(0,3).map((o, i) => (
                  <li key={i} className="truncate">• {o.trim()}</li>
                ))}
              </ul>
            </div>

            <div data-testid="unit-resources" className="text-sm text-slate-500">
              <h5 className="text-xs font-bold text-slate-400 uppercase mb-2">แหล่งข้อมูล</h5>
              <div className="flex flex-col gap-2">
                {/* non-destructive: prefer unit-level resources if available else show generic link */}
                <a className="text-indigo-600 font-medium text-sm" href="#" onClick={(e) => e.preventDefault()}>ดูสื่อการเรียนรู้สำหรับหน่วยนี้</a>
                <span className="text-xs text-slate-400">ประมาณเวลา: 20–40 นาที</span>
              </div>
            </div>
          </div>
        </div>

        {/* Editor Area — two-column layout similar to teacher grading modal */}
        <div className="flex-1 bg-white rounded-[30px] shadow-lg border border-slate-200 flex overflow-hidden relative proto-card">
          <div className="w-1/2 p-6 overflow-y-auto border-r border-slate-200">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2">
                <PenLine size={18}/> {units.find(u => u.id === activeUnit)?.title}
              </h3>
              <p className="text-sm text-slate-500">เขียนสรุปความรู้เพื่อส่งให้ครูตรวจ</p>
            </div>

            <textarea
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              aria-label="บันทึกสมุดพก"
              placeholder="เขียนสรุปความรู้ที่ได้จากบทเรียนนี้... (ต้องเขียนอย่างน้อย 20 ตัวอักษรเพื่อส่งงาน)"
              className="w-full p-6 bg-[url('https://www.transparenttextures.com/patterns/notebook.png')] bg-white focus:outline-none text-slate-700 leading-8 resize-none font-medium text-lg custom-scrollbar rounded-lg border border-slate-100 min-h-[50vh] whitespace-pre-wrap proto-input"
              disabled={isSubmitted}
              style={{
                backgroundImage: 'linear-gradient(#e5e7eb 1px, transparent 1px)',
                backgroundSize: '100% 2rem',
                lineHeight: '2rem',
                backgroundAttachment: 'local'
              }}
            />

            <div className="mt-4 text-xs text-slate-400 flex items-center justify-between">
              <span>{noteContent.length} ตัวอักษร {noteContent.length < 20 && !isSubmitted && <span className="text-red-400">(ต้องการอีก {20 - noteContent.length})</span>}</span>
              {!isSubmitted && <span className="flex items-center gap-1"><StickyNote size={12}/> บันทึกร่างอัตโนมัติ</span>}
            </div>
          </div>

          <div className="w-1/2 p-6 flex flex-col gap-6">
            {/* Unit details (desktop inline) — mirrors the left-column details for consistency */}
            <div data-testid="unit-details-inline" className="bg-white p-4 rounded-lg border border-slate-100 proto-card">
              <h4 className="text-sm font-bold text-slate-700 mb-2">เกี่ยวกับหน่วย</h4>
              <p className="text-sm text-slate-500 mb-2">{units.find(u => u.id === activeUnit)?.title || ''}</p>
              <div className="text-sm text-slate-600">
                <div className="text-xs text-slate-400 uppercase mb-1 font-bold">วัตถุประสงค์</div>
                <div className="text-sm text-slate-500">{(units.find(u => u.id === activeUnit)?.subtitle || '').split(' · ').slice(0,2).join(' • ')}</div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">สถานะการส่ง</h4>
              <div className={`px-3 py-2 rounded-md text-sm font-bold flex items-center gap-2 border ${
                isGraded ? 'bg-green-100 text-green-700 border-green-200' : 
                isSubmitted ? 'bg-blue-100 text-blue-700 border-blue-200' : 
                'bg-yellow-100 text-yellow-700 border-yellow-200'
              }`}>
                {isGraded ? <CheckCircle size={14}/> : isSubmitted ? <Clock size={14}/> : <PenLine size={14}/>}
                <span>{isGraded ? `ตรวจแล้ว (${currentScore} คะแนน)` : isSubmitted ? 'ส่งแล้ว รอตรวจ' : 'ฉบับร่าง'}</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">ผลการตรวจ (ครู)</h4>
              <div className="min-h-[120px] p-3 border rounded-lg bg-slate-50 text-sm text-slate-600">
                {currentSubmission?.feedback ? currentSubmission.feedback : (isGraded ? `${currentScore} / ${NOTEBOOK_MAX_SCORE}` : 'ยังไม่มีผลการตรวจ')}
              </div>

              {/* Exams summary (kept here for student convenience, also used by E2E visual tests) */}
              <div className="mt-4">
                <h5 className="text-xs font-bold text-slate-400 uppercase mb-2">การประเมินรวม</h5>
                <div className="flex flex-col gap-2 text-sm">
                  <div data-testid="unit-exam-midterm" className="flex items-center justify-between px-3 py-2 bg-white border rounded-lg">
                    <div className="text-sm font-medium">สอบกลางภาค</div>
                    <div className="text-sm text-slate-600" data-testid="exam-midterm-score">{userProgress?.quizzes?.[MIDTERM_EXAM.id]?.score !== undefined ? `${userProgress.quizzes[MIDTERM_EXAM.id].score} / ${MIDTERM_EXAM.maxScore}` : `- / ${MIDTERM_EXAM.maxScore}`}</div>
                  </div>

                  <div data-testid="unit-exam-final" className="flex items-center justify-between px-3 py-2 bg-white border rounded-lg">
                    <div className="text-sm font-medium">สอบปลายภาค</div>
                    <div className="text-sm text-slate-600" data-testid="exam-final-score">{userProgress?.quizzes?.[FINAL_EXAM.id]?.score !== undefined ? `${userProgress.quizzes[FINAL_EXAM.id].score} / ${FINAL_EXAM.maxScore}` : `- / ${FINAL_EXAM.maxScore}`}</div>
                  </div>

                  <div className="flex items-center justify-between px-3 py-2 bg-white border rounded-lg font-bold">
                    <div className="text-sm">คะแนนรวม</div>
                    <div className="text-sm text-slate-700" data-testid="aggregate-score">
                      {(() => {
                        const mid = userProgress?.quizzes?.[MIDTERM_EXAM.id]?.score || 0;
                        const fin = userProgress?.quizzes?.[FINAL_EXAM.id]?.score || 0;
                        const nbTotal = Object.values(userProgress?.notebookScores || {}).reduce((s, v) => s + (v || 0), 0);
                        const total = mid + fin + nbTotal;
                        const maxTotal = MIDTERM_EXAM.maxScore + FINAL_EXAM.maxScore + (NOTEBOOK_MAX_SCORE * Math.max(1, (units || []).length));
                        return `${total} / ${maxTotal}`;
                      })()}
                    </div>
                  </div>
                </div>
              </div>

            </div>

            <div className="mt-auto flex gap-3">
              <button 
                onClick={() => { handleSaveDraft(); logError('บันทึกร่างสำเร็จ', 'info'); }}
                aria-label="บันทึกร่าง"
                className="flex-1 py-3 bg-white border rounded-xl text-slate-600 font-bold proto-btn proto-ghost"
                disabled={isSubmitted}
              >
                บันทึกร่าง
              </button>
              <button 
                onClick={handleDownload}
                aria-label="ดาวน์โหลดสมุด"
                className="py-3 px-4 bg-white border rounded-xl text-slate-600 font-bold proto-btn proto-ghost"
                title="ดาวน์โหลด"
              >ดาวน์โหลด</button>
              <button 
                onClick={handleSubmit}
                aria-label="ส่งงานครู"
                disabled={isSubmitted || isSaving}
                className={`py-3 px-6 rounded-xl font-bold proto-btn ${isSaving ? 'bg-green-500 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>
                {isSaving ? 'กำลังส่ง...' : isSubmitted ? 'ส่งแล้ว' : 'ส่งงานครู'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotebookView;