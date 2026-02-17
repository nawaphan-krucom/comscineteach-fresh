
import React, { useState, useEffect } from 'react';
import type { Assignment, Submission } from '../types';
import { UNIT_ASSIGNMENTS } from '../constants';
// FIX: Replaced AlertCircle with ArrowLeft for the back button.
import { Link as LinkIcon, CheckCircle, FileText, Clock, ArrowLeft, Edit3, Send, HelpCircle, ExternalLink, UploadCloud, X } from './icons/EmojiIcons';
import { useData } from '../contexts/DataContext';
import { useError } from '../contexts/ErrorContext';
import { ListSkeleton } from './Skeleton';

interface AssignmentViewProps {
  studentId: string;
  onBack: () => void;
  unitIdFilter?: string | null;
}

const AssignmentView: React.FC<AssignmentViewProps> = ({ studentId, onBack, unitIdFilter }) => {
  const { userProgress, submitAssignment } = useData();
  const { logError } = useError();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Record<string, Submission>>({});
  const [isLoading, setIsLoading] = useState(true);
  
  // Input States
  const [answerText, setAnswerText] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [file, setFile] = useState<{ url: string; name: string; type: string } | null>(null);
  
  // Special State for Unit 3 (System Analysis)
  const [systemAnalysis, setSystemAnalysis] = useState({ input: '', process: '', output: '' });
  
  const [activeAssignmentId, setActiveAssignmentId] = useState<string | null>(null);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  
  // Confirmation Dialog State
  const [showConfirm, setShowConfirm] = useState(false);
  const [assignmentToSubmit, setAssignmentToSubmit] = useState<Assignment | null>(null);

  // PDF Viewer Modal State
  const [viewingFile, setViewingFile] = useState<{ url: string; name: string } | null>(null);

  useEffect(() => {
    setIsLoading(true);
    // Filter assignments based on unitId if provided
    if (unitIdFilter) {
        setAssignments(UNIT_ASSIGNMENTS.filter(a => a.unitId === unitIdFilter));
    } else {
        setAssignments(UNIT_ASSIGNMENTS);
    }

    if (userProgress && userProgress.assignments) {
        setSubmissions(userProgress.assignments);
    }
    setIsLoading(false);
  }, [unitIdFilter, userProgress]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) {
          // File size validation (Max 1MB)
          if (selectedFile.size > 1024 * 1024) {
              logError('ไฟล์มีขนาดใหญ่เกินไป (จำกัดไม่เกิน 1MB)', 'warning');
              e.target.value = ''; // Reset input
              return;
          }

          const reader = new FileReader();
          reader.onload = (event) => {
              setFile({
                  url: event.target?.result as string,
                  name: selectedFile.name,
                  type: selectedFile.type,
              });
          };
          reader.readAsDataURL(selectedFile);
      }
  };

  const initiateSubmit = (assignment: Assignment) => {
    const isFileMode = assignment.submissionType === 'file'; 
    const isUnit3 = assignment.unitId === 'unit_3';

    if (isUnit3) {
        if (!systemAnalysis.input.trim() || !systemAnalysis.process.trim() || !systemAnalysis.output.trim()) {
            logError('กรุณากรอกข้อมูลให้ครบทุกช่อง', 'warning');
            return;
        }
    } else if (isFileMode) {
        // Require either a link OR a file preview
        if (!linkUrl.trim() && !file) {
            logError('กรุณาแนบไฟล์หรือลิงก์ส่งงาน', 'warning');
            return;
        }
    } else {
        if (!answerText.trim()) {
            logError('กรุณาเขียนคำตอบก่อนส่ง', 'warning');
            return;
        }
    }

    setAssignmentToSubmit(assignment);
    setShowConfirm(true);
  };

  const processSubmission = () => {
    if (!assignmentToSubmit) return;
    
    const assignment = assignmentToSubmit;
    const isFileMode = assignment.submissionType === 'file';
    const isUnit3 = assignment.unitId === 'unit_3';
    
    setShowConfirm(false);
    setSubmittingId(assignment.id);

    // Simulate submission delay
    setTimeout(() => {
      let finalAnswerText = answerText;
      if (isUnit3) {
          finalAnswerText = `INPUT: ${systemAnalysis.input}\nPROCESS: ${systemAnalysis.process}\nOUTPUT: ${systemAnalysis.output}`;
      }

      // Create submission object, omitting optional fields that are not set.
      const newSubmission: Submission = {
        assignmentId: assignment.id,
        studentId,
        fileName: file ? file.name : (linkUrl ? 'External Link' : 'Text Answer'),
        fileUrl: file ? file.url : linkUrl || '#', 
        submittedAt: new Date().getTime(),
        status: 'pending', // Set to pending for teacher review
        feedback: 'รอการตรวจจากคุณครู' // Initial feedback
      };

      if ((!isFileMode || isUnit3)) {
          newSubmission.answerText = finalAnswerText;
      }
      
      // The `score` field is now omitted, which is valid since it's optional.

      submitAssignment(newSubmission);
      
      setSubmittingId(null);
      resetForm();
      setActiveAssignmentId(null);
      setAssignmentToSubmit(null);

      logError('ส่งงานสำเร็จ! รอการตรวจจากคุณครู', 'success');
    }, 1000);
  };

  const resetForm = () => {
      setActiveAssignmentId(null);
      setLinkUrl('');
      setAnswerText('');
      setFile(null);
      setSystemAnalysis({ input: '', process: '', output: '' });
  };
  
  const renderFilePreview = (fileData: { url: string; name: string; type: string }) => {
    if (fileData.type.startsWith('image/')) {
        return <img src={fileData.url} alt="Preview" className="max-h-48 mx-auto rounded shadow-sm"/>;
    }
    if (fileData.type === 'application/pdf') {
        return (
            <div className="text-center p-4 bg-slate-100 rounded-lg">
                <FileText size={48} className="mx-auto text-red-500"/>
                <p className="text-sm font-bold text-slate-700 mt-2 truncate">{fileData.name}</p>
                <p className="text-xs text-slate-500">PDF Document</p>
            </div>
        );
    }
    return (
        <div className="text-center p-4 bg-slate-100 rounded-lg">
            <FileText size={48} className="mx-auto text-slate-500"/>
            <p className="text-sm font-bold text-slate-700 mt-2 truncate">{fileData.name}</p>
            <p className="text-xs text-slate-500">Document File</p>
        </div>
    );
  };

  const renderSubmittedFile = (submission: Submission) => {
    const url = submission.fileUrl || '';
    const name = submission.fileName || '';
    
    if (url.startsWith('data:image')) {
        return <img src={url} alt="Submitted" className="h-32 w-auto object-contain rounded border border-slate-200 bg-white"/>;
    }
    if (url.startsWith('data:application/pdf') || name.toLowerCase().endsWith('.pdf')) {
        return (
            <button onClick={() => setViewingFile({ url, name })} className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-100 hover:bg-red-100 w-full text-left">
                <FileText size={24} className="text-red-500 shrink-0"/>
                <div className="min-w-0">
                    <p className="text-sm font-bold text-red-800 truncate">{name}</p>
                    <p className="text-xs text-red-600">คลิกเพื่อดูตัวอย่าง PDF</p>
                </div>
            </button>
        );
    }
    if (url.startsWith('data:')) { // Other documents
        return (
            <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-slate-100 rounded-lg border border-slate-200 hover:bg-slate-200">
                <FileText size={24} className="text-slate-500 shrink-0"/>
                <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{name}</p>
                    <p className="text-xs text-slate-600">เปิดเอกสาร</p>
                </div>
            </a>
        );
    }
    // This is for external links
    return (
        <a href={url} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 font-medium underline flex items-center gap-1 hover:text-indigo-800">
            {url} <ExternalLink size={12}/>
        </a>
    );
  };

  return (
    <div className="animate-fade-in space-y-8 relative">
      
      {/* PDF Viewer Modal */}
      {viewingFile && (
        <div className="fixed inset-0 z-50 flex flex-col p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <header className="flex justify-between items-center p-4 bg-slate-800 text-white rounded-t-xl shrink-0">
            <h3 className="font-bold truncate">{viewingFile.name}</h3>
            <button onClick={() => setViewingFile(null)} className="p-2 rounded-full hover:bg-white/20"><X size={20}/></button>
          </header>
          <div className="flex-1 bg-slate-600 rounded-b-xl overflow-hidden">
            <iframe src={viewingFile.url} className="w-full h-full border-none" title={viewingFile.name} />
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl transform transition-all scale-100">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mb-4">
                <HelpCircle size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2 font-cute">ยืนยันการส่งงาน?</h3>
              <p className="text-slate-500 mb-6 text-sm">
                คุณแน่ใจหรือไม่ว่าต้องการส่งงาน? <br/> หากเคยส่งแล้ว งานใหม่จะถูกส่งไปให้ครูตรวจอีกครั้ง
              </p>
              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                >
                  ยกเลิก
                </button>
                <button 
                  onClick={processSubmission}
                  className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg transition-all"
                >
                  ส่งงาน
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <header className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="p-2 bg-white rounded-full shadow-sm hover:bg-slate-100">
          {/* FIX: Replaced incorrect icon with a back arrow for consistency. */}
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="font-cute text-3xl text-gray-700">ส่งงาน / การบ้าน</h1>
          <p className="text-gray-500 text-sm">รายการงานที่ได้รับมอบหมาย {unitIdFilter ? `(หน่วยที่ ${unitIdFilter.split('_')[1]})` : ''}</p>
        </div>
      </header>

      {isLoading ? (
        <ListSkeleton items={3} />
      ) : assignments.length === 0 ? (
          <div className="text-center py-20 text-slate-400 bg-white/50 rounded-3xl border border-dashed border-slate-300">
              ไม่พบการบ้านสำหรับหน่วยการเรียนรู้นี้
          </div>
      ) : (
        <div className="grid gap-6">
            {assignments.map(assign => {
            const submission = submissions[assign.id];
            const isSubmitted = !!submission;
            const isGraded = submission?.status === 'graded';
            const isPending = submission?.status === 'pending';
            const isActive = activeAssignmentId === assign.id;
            
            const isLinkType = assign.submissionType === 'file';
            const isUnit3 = assign.unitId === 'unit_3';

            return (
                <div key={assign.id} className="glass-card p-6 rounded-[25px] relative overflow-hidden group">
                <div className={`absolute top-0 left-0 w-2 h-full ${isGraded ? 'bg-green-500' : isPending ? 'bg-yellow-500' : 'bg-slate-300'}`}></div>
                
                <div className="flex flex-col gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-xs font-bold uppercase tracking-widest text-indigo-500 bg-indigo-50 px-2 py-1 rounded">
                            {assign.unitId.replace('_', ' ')}
                            </span>
                            {isSubmitted && (
                                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${isGraded ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                    {isGraded ? <CheckCircle size={14}/> : <Clock size={14}/>}
                                    <span>{isGraded ? 'ตรวจแล้ว' : 'รอตรวจ'}</span>
                                </div>
                            )}
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{assign.title}</h3>
                        <p className="text-gray-600 text-sm mb-4">{assign.description}</p>
                        
                        <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
                            {/* FIX: Called toLocaleDateString as a function. */}
                            <span className="flex items-center gap-1"><Clock size={14}/> กำหนดส่ง: {new Date(assign.deadline).toLocaleDateString()}</span>
                            <span className="flex items-center gap-1"><CheckCircle size={14}/> คะแนนเต็ม: {assign.maxScore}</span>
                        </div>
                    </div>

                    {isSubmitted && !isActive ? (
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                            <div className="flex items-start gap-3">
                                {isLinkType ? <LinkIcon className="text-indigo-500 mt-1 shrink-0"/> : <FileText className="text-indigo-500 mt-1 shrink-0"/>}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-slate-700 mb-2">สิ่งที่คุณส่ง:</p>
                                    {submission.answerText ? (
                                        <div className="text-sm text-slate-600 whitespace-pre-line bg-white p-3 rounded border border-slate-100">{submission.answerText}</div>
                                    ) : (
                                        <div className="flex flex-col gap-2">
                                            {renderSubmittedFile(submission)}
                                        </div>
                                    )}
                                    <p className="text-xs text-gray-400 mt-2">
                                        ส่งเมื่อ: {new Date(submission.submittedAt).toLocaleString('th-TH', {
                                            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                            </div>
                            {isGraded && (
                                <div className="mt-3 pt-3 border-t border-slate-200">
                                    <p className="text-green-700 text-sm font-bold">คะแนนที่ได้: {submission.score} / {assign.maxScore}</p>
                                    {submission.feedback && <p className="text-xs text-slate-500 mt-1 italic">Feedback: {submission.feedback}</p>}
                                </div>
                            )}
                            {isPending && (
                                 <div className="mt-3 pt-3 border-t border-slate-200 text-center">
                                    <p className="text-yellow-700 text-sm font-bold">{submission.feedback || 'รอการตรวจจากคุณครู'}</p>
                                </div>
                            )}
                            <button 
                                onClick={() => setActiveAssignmentId(assign.id)}
                                className="w-full mt-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 flex items-center justify-center gap-2 border border-slate-200 text-sm"
                            >
                                <Edit3 size={16}/> ส่งงานอีกครั้ง
                            </button>
                        </div>
                    ) : (
                        <div>
                            {!isActive ? (
                                <button 
                                    onClick={() => setActiveAssignmentId(assign.id)}
                                    className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 border transition-all ${
                                        isSubmitted 
                                        ? 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100' 
                                        : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:scale-[1.02]'}`}
                                >
                                    {isSubmitted ? <Edit3 size={18}/> : <Send size={18}/>}
                                    {isSubmitted ? 'ส่งใหม่' : 'เริ่มทำ'}
                                </button>
                            ) : (
                                <div className="bg-indigo-50 p-6 rounded-2xl border-2 border-dashed border-indigo-200 animate-fade-in">
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="font-bold text-indigo-800">กรอกข้อมูลเพื่อส่งงาน</h4>
                                        <button onClick={resetForm} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-indigo-100"><X size={16}/></button>
                                    </div>
                                    
                                    {isUnit3 ? (
                                        <div className="space-y-4">
                                            <textarea value={systemAnalysis.input} onChange={e => setSystemAnalysis({...systemAnalysis, input: e.target.value})} placeholder="Input (ตัวป้อน) คืออะไร..." className="w-full p-3 border rounded-lg h-16"/>
                                            <textarea value={systemAnalysis.process} onChange={e => setSystemAnalysis({...systemAnalysis, process: e.target.value})} placeholder="Process (กระบวนการ) คืออะไร..." className="w-full p-3 border rounded-lg h-16"/>
                                            <textarea value={systemAnalysis.output} onChange={e => setSystemAnalysis({...systemAnalysis, output: e.target.value})} placeholder="Output (ผลผลิต) คืออะไร..." className="w-full p-3 border rounded-lg h-16"/>
                                        </div>
                                    ) : isLinkType ? (
                                        <div className="space-y-4">
                                            {file ? (
                                                <div className="relative">
                                                    {renderFilePreview(file)}
                                                    <button onClick={() => setFile(null)} className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"><X size={14}/></button>
                                                </div>
                                            ) : (
                                                <label className="w-full p-8 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-100">
                                                    <UploadCloud className="text-slate-400 mb-2"/>
                                                    <span className="font-bold text-slate-600">อัปโหลดไฟล์</span>
                                                    <span className="text-xs text-slate-500">(รูปภาพ, PDF, etc. ไม่เกิน 1MB)</span>
                                                    <input type="file" onChange={handleFileSelect} className="hidden"/>
                                                </label>
                                            )}
                                            <div className="text-center text-sm font-bold text-slate-400">หรือ</div>
                                            <div className="relative">
                                                <LinkIcon className="absolute left-3 top-4 text-slate-400" size={16}/>
                                                <input type="text" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="วางลิงก์ (เช่น Google Drive, Canva)..." className="w-full p-3 pl-9 rounded-lg border"/>
                                            </div>
                                        </div>
                                    ) : (
                                        <textarea value={answerText} onChange={(e) => setAnswerText(e.target.value)} className="w-full p-4 h-32 rounded-lg border" placeholder="พิมพ์คำตอบของคุณที่นี่..."></textarea>
                                    )}

                                    <button 
                                        onClick={() => initiateSubmit(assign)}
                                        disabled={submittingId === assign.id}
                                        className="w-full mt-4 py-3 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 disabled:opacity-50"
                                    >
                                        <Send size={18}/>
                                        {submittingId === assign.id ? 'กำลังส่ง...' : 'ยืนยันการส่ง'}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                </div>
            );
            })}
        </div>
      )}
    </div>
  );
};

export default AssignmentView;