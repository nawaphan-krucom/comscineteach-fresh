
import React, { useState, useEffect } from 'react';
import type { User, UserProgress, Submission } from '../types';
import { X, BarChart3, ClipboardCheck, Trophy, CheckCircle, Clock, Gift, PlusCircle, AlertTriangle, Edit, Save, XCircle, FileText } from './icons/EmojiIcons';
import { UNIT_QUIZZES, FINAL_EXAM, UNIT_ACTIVITIES, UNIT_ASSIGNMENTS, NOTEBOOK_MAX_SCORE, DEFAULT_COURSE_UNITS, ACHIEVEMENTS_LIST, MIDTERM_EXAM } from '../constants';
import { useData } from '../contexts/DataContext';

interface StudentPortfolioViewProps {
    student: User & { score: number, percent: number, totalCheats: number };
    progress: UserProgress;
    maxTotalScore: number;
    onClose: () => void;
    onGradeAssignment: (studentId: string, assignmentId: string, score: number, feedback: string) => void;
    onGradeNotebook?: (studentId: string, unitId: string, score: number, feedback: string) => void;
    onGradeActivity?: (studentId: string, activityId: string, score: number, feedback: string) => void;
}

const StudentPortfolioView: React.FC<StudentPortfolioViewProps> = ({ student, progress, maxTotalScore, onClose, onGradeNotebook, onGradeActivity }) => {
    const { awardBonusToStudent, gradeAssignment } = useData();
    const [activeTab, setActiveTab] = useState('overview');
    
    // Award State
    const [xpAward, setXpAward] = useState('');
    const [coinsAward, setCoinsAward] = useState('');

    // Grading State
    const [editingAssignment, setEditingAssignment] = useState<string | null>(null);
    const [editScore, setEditScore] = useState('');
    const [editFeedback, setEditFeedback] = useState('');
    const [gradingError, setGradingError] = useState('');

    // Notebook Grading State
    const [editingNotebook, setEditingNotebook] = useState<string | null>(null);
    const [editNotebookScore, setEditNotebookScore] = useState('');
    const [editNotebookFeedback, setEditNotebookFeedback] = useState('');

    // Activity Grading State
    const [editingActivity, setEditingActivity] = useState<string | null>(null);
    const [editActivityScore, setEditActivityScore] = useState('');
    const [editActivityFeedback, setEditActivityFeedback] = useState('');

    // Confirmation Dialog State
    const [showConfirmGrade, setShowConfirmGrade] = useState(false);
    const [pendingGrade, setPendingGrade] = useState<{assignmentId: string, score: number, feedback: string} | null>(null);

    // Loading State
    const [isGrading, setIsGrading] = useState(false);
    const [gradingSuccess, setGradingSuccess] = useState('');

    // Bulk Grading State
    const [selectedAssignments, setSelectedAssignments] = useState<Set<string>>(new Set());
    const [bulkScore, setBulkScore] = useState('');
    const [bulkFeedback, setBulkFeedback] = useState('');
    const [showBulkGrade, setShowBulkGrade] = useState(false);

    // Sorting and Filtering State
    const [filterType, setFilterType] = useState<'all' | 'ungraded' | 'assignment'>('all');
    const [searchTerm, setSearchTerm] = useState('');

    // Submission View State
    const [viewingSubmission, setViewingSubmission] = useState<Submission | null>(null);

    // Notebook View State
    const [viewingNotebook, setViewingNotebook] = useState<{unitId: string, content: string, score?: number, feedback?: string} | null>(null);

    // Activity View State
    const [viewingActivity, setViewingActivity] = useState<{id: string, title: string, score: number, submittedAt: string, feedback?: string} | null>(null);

    const TABS = [
        { id: 'overview', label: 'ภาพรวม', icon: <BarChart3 size={16}/> },
        { id: 'assessments', label: 'คะแนนเก็บ', icon: <ClipboardCheck size={16}/> },
        { id: 'achievements', label: 'ความสำเร็จ', icon: <Trophy size={16}/> },
        { id: 'awards', label: 'มอบรางวัล', icon: <Gift size={16}/> },
    ];
    
    const unitOrder = ['overall', 'unit_1', 'unit_2', 'unit_3', 'unit_4', 'unit_5', 'midterm', 'final'];

    const allAssessments = [
        ...UNIT_ACTIVITIES.map(a => ({...a, type: 'Activity', unitId: a.unitId})),
        ...UNIT_QUIZZES.map(q => ({...q, type: 'Quiz', unitId: q.id})),
        {...MIDTERM_EXAM, type: 'Midterm Exam', unitId: 'midterm'},
        ...UNIT_ASSIGNMENTS.map(a => ({...a, type: 'Assignment', unitId: a.unitId})),
        ...DEFAULT_COURSE_UNITS.map(u => ({id: `notebook_${u.id}`, title: `สมุดบันทึก: ${u.title}`, maxScore: NOTEBOOK_MAX_SCORE, type: 'Notebook', unitId: u.id})),
        {...FINAL_EXAM, type: 'Final Exam', unitId: 'final'}
    ];

    // Create extended assessments with totals
    const extendedAssessments = [];
    extendedAssessments.push({ id: 'overall_total', title: 'รวมคะแนนทั้งหมด', type: 'Total', unitId: 'overall', maxScore: maxTotalScore });
    for (const unit of DEFAULT_COURSE_UNITS) {
        const unitAssessments = allAssessments.filter(a => a.unitId === unit.id);
        const unitMaxScore = unitAssessments.reduce((sum, a) => sum + a.maxScore, 0);
        extendedAssessments.push({ id: `${unit.id}_total`, title: `รวมคะแนน${unit.subtitle}`, type: 'Unit Total', unitId: unit.id, maxScore: unitMaxScore });
        extendedAssessments.push(...unitAssessments);
    }
    extendedAssessments.push(...allAssessments.filter(a => a.unitId === 'midterm' || a.unitId === 'final'));

    const typeOrder = ['Total', 'Unit Total', 'Activity', 'Quiz', 'Assignment', 'Notebook', 'Midterm Exam', 'Final Exam'];

    // Filtered assessments
    const filteredAssessments = extendedAssessments
        .filter(item => {
            // Filter by type
            if (filterType === 'ungraded' && item.type === 'Assignment') {
                return !progress.assignments?.[item.id]?.score && progress.assignments?.[item.id];
            }
            if (filterType === 'assignment') {
                return item.type === 'Assignment';
            }
            return true;
        })
        .filter(item => {
            // Search filter
            if (searchTerm) {
                return item.title.toLowerCase().includes(searchTerm.toLowerCase());
            }
            return true;
        })
        .sort((a, b) => {
            // Sort by unit order first
            const aUnitIndex = unitOrder.indexOf(a.unitId);
            const bUnitIndex = unitOrder.indexOf(b.unitId);
            if (aUnitIndex !== bUnitIndex) {
                return aUnitIndex - bUnitIndex;
            }
            // Then by type order
            const aTypeIndex = typeOrder.indexOf(a.type);
            const bTypeIndex = typeOrder.indexOf(b.type);
            return aTypeIndex - bTypeIndex;
        });
    
    const handleStartEdit = (assignmentId: string) => {
        const submission = progress.assignments?.[assignmentId];
        setEditingAssignment(assignmentId);
        setEditScore(submission?.score?.toString() || '');
        setEditFeedback(submission?.feedback || '');
    };

    const handleSaveGrade = () => {
        if (editingAssignment) {
            // Feature 1: Validation for grading - prevent scores > maxScore, validate numbers only
            const trimmedScore = editScore.trim();
            
            if (!trimmedScore) {
                setGradingError('กรุณาใส่คะแนน');
                return;
            }
            
            // Validate number only
            if (!/^\d+(\.\d+)?$/.test(trimmedScore)) {
                setGradingError('กรุณาใส่คะแนนเป็นตัวเลขเท่านั้น');
                return;
            }
            
            const score = parseFloat(trimmedScore);
            
            // Check if score is negative
            if (score < 0) {
                setGradingError('คะแนนต้องไม่ติดลบ');
                return;
            }
            
            const assignment = allAssessments.find(a => a.id === editingAssignment);
            
            // Prevent scores exceeding maxScore
            if (assignment && score > assignment.maxScore) {
                setGradingError(`❌ คะแนนต้องไม่เกิน ${assignment.maxScore}`);
                return;
            }
            
            setGradingError('');
            // Feature 2: Confirmation Dialog - show dialog with old vs new scores before saving
            setPendingGrade({ assignmentId: editingAssignment, score: Math.round(score * 100) / 100, feedback: editFeedback });
            setShowConfirmGrade(true);
        }
    };

    const handleCancelEdit = () => {
        setEditingAssignment(null);
        setEditScore('');
        setEditFeedback('');
        setGradingError('');
    };

    const confirmGrade = async () => {
        if (pendingGrade) {
            setIsGrading(true);
            setGradingError('');
            try {
                await gradeAssignment(student.id, pendingGrade.assignmentId, pendingGrade.score, pendingGrade.feedback);
                setEditingAssignment(null);
                setEditScore('');
                setEditFeedback('');
                setShowConfirmGrade(false);
                setPendingGrade(null);
                setGradingSuccess('✓ ให้คะแนนเรียบร้อยแล้ว!');
                setTimeout(() => setGradingSuccess(''), 3000);
            } catch {
                setGradingError('❌ เกิดข้อผิดพลาดในการบันทึกคะแนน กรุณาลองใหม่อีกครั้ง');
            } finally {
                setIsGrading(false);
            }
        }
    };

    const cancelGrade = () => {
        setShowConfirmGrade(false);
        setPendingGrade(null);
    };

    const handleViewNotebook = (unitId: string) => {
        const submission = progress.notebookSubmissions?.[unitId];
        const score = progress.notebookScores?.[unitId];
        const feedback = submission?.feedback;
        // Prefer the stored notebook draft/content, but fall back to the submitted
        // notebook content (older records might only have been saved under
        // `notebookSubmissions[unitId].content`). This ensures teachers see
        // student answers when grading.
        const content = progress.notebook?.[unitId] || submission?.content || '';
        setViewingNotebook({ unitId, content, score, feedback });
    };

    const handleStartEditNotebook = (notebookId: string) => {
        const unitId = notebookId.replace('notebook_', '');
        const submission = progress.notebookSubmissions?.[unitId];
        const score = progress.notebookScores?.[unitId];
        setEditingNotebook(notebookId);
        setEditNotebookScore(score?.toString() || '');
        setEditNotebookFeedback(submission?.feedback || '');
    };

    const handleSaveNotebookGrade = async (unitId: string) => {
        if (!onGradeNotebook) return;
        const score = parseInt(editNotebookScore) || 0;
        const feedback = editNotebookFeedback;
        try {
            setIsGrading(true);
            await onGradeNotebook(student.id, unitId, score, feedback);
            setEditingNotebook(null);
            setEditNotebookScore('');
            setEditNotebookFeedback('');
            setGradingSuccess('✓ ให้คะแนนสมุดบันทึกเรียบร้อยแล้ว!');
            setTimeout(() => setGradingSuccess(''), 3000);
        } catch {
            setGradingError('❌ เกิดข้อผิดพลาดในการบันทึกคะแนน กรุณาลองใหม่อีกครั้ง');
        } finally {
            setIsGrading(false);
        }
    };

    const handleStartEditActivity = (activityId: string) => {
        const activity = progress.activities?.[activityId];
        setEditingActivity(activityId);
        setEditActivityScore(activity?.score?.toString() || '');
        setEditActivityFeedback(activity?.feedback || '');
    };

    const handleSaveActivityGrade = async (activityId: string) => {
        if (!onGradeActivity) return;
        const score = parseInt(editActivityScore) || 0;
        const feedback = editActivityFeedback;
        try {
            setIsGrading(true);
            await onGradeActivity(student.id, activityId, score, feedback);
            setEditingActivity(null);
            setEditActivityScore('');
            setEditActivityFeedback('');
            setGradingSuccess('✓ ให้คะแนนกิจกรรมเรียบร้อยแล้ว!');
            setTimeout(() => setGradingSuccess(''), 3000);
        } catch {
            setGradingError('❌ เกิดข้อผิดพลาดในการบันทึกคะแนน กรุณาลองใหม่อีกครั้ง');
        } finally {
            setIsGrading(false);
        }
    };

    const toggleAssignmentSelection = (assignmentId: string) => {
        const newSelected = new Set(selectedAssignments);
        if (newSelected.has(assignmentId)) {
            newSelected.delete(assignmentId);
        } else {
            newSelected.add(assignmentId);
        }
        setSelectedAssignments(newSelected);
    };

    const selectAllAssignments = () => {
        const allAssignmentIds = filteredAssessments
            .filter(item => item.type === 'Assignment' && progress.assignments?.[item.id])
            .map(item => item.id);
        setSelectedAssignments(new Set(allAssignmentIds));
    };

    const clearSelection = () => {
        setSelectedAssignments(new Set());
    };

    const handleBulkGrade = () => {
        if (selectedAssignments.size === 0) {
            setGradingError('กรุณาเลือกการบ้านอย่างน้อย 1 รายการ');
            return;
        }
        
        const trimmedScore = bulkScore.trim();
        
        if (!trimmedScore) {
            setGradingError('กรุณาใส่คะแนน');
            return;
        }
        
        // Validate number only
        if (!/^\d+(\.\d+)?$/.test(trimmedScore)) {
            setGradingError('กรุณาใส่คะแนนเป็นตัวเลขเท่านั้น');
            return;
        }
        
        const score = parseFloat(trimmedScore);
        
        if (score < 0) {
            setGradingError('คะแนนต้องไม่ติดลบ');
            return;
        }
        
        // Validate max scores for all selected assignments
        for (const assignmentId of selectedAssignments) {
            const assignment = allAssessments.find(a => a.id === assignmentId);
            if (assignment && score > assignment.maxScore) {
                setGradingError(`❌ คะแนนเกินค่าสูงสุดสำหรับ "${assignment.title}" (max: ${assignment.maxScore})`);
                return;
            }
        }
        
        setGradingError('');
        setPendingGrade({ assignmentId: 'bulk', score: Math.round(score * 100) / 100, feedback: bulkFeedback });
        setShowBulkGrade(true);
    };

    const confirmBulkGrade = async () => {
        if (pendingGrade && selectedAssignments.size > 0) {
            setIsGrading(true);
            setGradingError('');
            try {
                const promises = Array.from(selectedAssignments).map(assignmentId =>
                    gradeAssignment(student.id, assignmentId, pendingGrade.score, pendingGrade.feedback)
                );
                await Promise.all(promises);
                
                setSelectedAssignments(new Set());
                setBulkScore('');
                setBulkFeedback('');
                setShowBulkGrade(false);
                setPendingGrade(null);
                setGradingSuccess(`✓ ให้คะแนน ${selectedAssignments.size} การบ้านเรียบร้อยแล้ว!`);
                setTimeout(() => setGradingSuccess(''), 3000);
            } catch {
                setGradingError('❌ เกิดข้อผิดพลาดในการบันทึกคะแนน กรุณาลองใหม่อีกครั้ง');
            } finally {
                setIsGrading(false);
            }
        }
    };

    // Feature 8: Export to CSV - export scores to CSV file
    const exportToCSV = () => {
        try {
            const headers = ['หัวข้อ', 'ประเภท', 'วันที่ส่ง', 'สถานะ', 'คะแนน'];
            const rows = filteredAssessments.map(item => {
                let status, score, submittedAt;
                if (item.type === 'Activity') {
                    const p = progress.activities?.[item.id];
                    status = p?.submitted ? 'ส่งแล้ว' : 'ยังไม่ได้ส่ง';
                    score = p?.score || '';
                    submittedAt = p?.submittedAt || '';
                } else if (item.type === 'Quiz' || item.type === 'Final Exam' || item.type === 'Midterm Exam') {
                    const p = progress.quizzes?.[item.id];
                    status = p?.submitted ? 'ส่งแล้ว' : 'ยังไม่ได้ส่ง';
                    score = p?.score || '';
                    submittedAt = p?.submittedAt || '';
                } else if (item.type === 'Assignment') {
                    const p = progress.assignments?.[item.id];
                    status = p?.status === 'graded' ? '✓ ให้คะแนนแล้ว' : (p ? '✓ ส่งแล้ว' : 'ยังไม่ได้ส่ง');
                    score = p?.score || '';
                    submittedAt = p?.submittedAt || '';
                } else {
                    const unitId = item.id.replace('notebook_', '');
                    const p = progress.notebookScores?.[unitId];
                    const sub = progress.notebookSubmissions?.[unitId];
                    status = p ? 'ส่งแล้ว' : 'ยังไม่ได้ส่ง';
                    score = p || '';
                    submittedAt = sub?.submittedAt || '';
                }
                
                return [
                    item.title,
                    item.type,
                    submittedAt ? new Date(submittedAt).toLocaleString('th-TH') : '-',
                    status,
                    score
                ];
            });
            
            const csvContent = [headers, ...rows]
                .map(row => row.map(cell => `"${cell}"`).join(','))
                .join('\n');
            
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `คะแนน_${student.name}_${new Date().toISOString().split('T')[0]}.csv`;
            link.click();
            setGradingSuccess('✓ ส่งออก CSV เรียบร้อยแล้ว');
            setTimeout(() => setGradingSuccess(''), 3000);
        } catch {
            setGradingError('❌ เกิดข้อผิดพลาดในการส่งออก');
        }
    };

    const handleViewSubmission = (item: { id: string; type: string }) => {
        if (item.type === 'Assignment') {
            const submission = progress.assignments?.[item.id];
            if (submission) {
                setViewingSubmission(submission);
            }
        }
    };

    const handleViewActivity = (item: { id: string; type: string; title?: string }) => {
        if (item.type === 'Activity') {
            const activity = progress.activities?.[item.id];
            if (activity) {
                setViewingActivity({
                    id: item.id,
                    title: item.title || 'กิจกรรม',
                    score: activity.score,
                    submittedAt: activity.submittedAt,
                    feedback: activity.feedback
                });
            }
        }
    };

    const handleCloseSubmissionView = () => {
        setViewingSubmission(null);
    };

    const handleCloseNotebookView = () => {
        setViewingNotebook(null);
    };
    
    const handleAward = (e: React.FormEvent) => {
        e.preventDefault();
        const xp = parseInt(xpAward) || 0;
        const coins = parseInt(coinsAward) || 0;
        if (xp > 0 || coins > 0) {
            awardBonusToStudent(student.id, { xp, coins });
            setXpAward('');
            setCoinsAward('');
        }
    };

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (showConfirmGrade || showBulkGrade) {
                if (e.key === 'Enter' && !isGrading) {
                    e.preventDefault();
                    if (showConfirmGrade) confirmGrade();
                    else if (showBulkGrade) confirmBulkGrade();
                } else if (e.key === 'Escape') {
                    e.preventDefault();
                    if (showConfirmGrade) cancelGrade();
                    else if (showBulkGrade) setShowBulkGrade(false);
                }
            }
        };

        if (showConfirmGrade || showBulkGrade) {
            document.addEventListener('keydown', handleKeyDown);
            return () => document.removeEventListener('keydown', handleKeyDown);
        }
    }, [showConfirmGrade, showBulkGrade, isGrading]);

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-slate-50 rounded-[35px] w-full max-w-5xl h-[90vh] shadow-2xl overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="p-6 border-b border-slate-200 flex justify-between items-start">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 text-4xl bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100">{student.avatar}</div>
                        <div>
                            <h3 className="text-2xl font-bold font-cute text-slate-800">{student.name}</h3>
                            <p className="text-sm text-slate-500 font-mono">รหัสนักเรียน: {student.username}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600"><X/></button>
                </header>
                <div className="flex-1 flex overflow-hidden">
                    <nav className="w-56 border-r border-slate-200 p-4">
                        {TABS.map(tab => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-bold flex items-center gap-3 transition-all ${activeTab === tab.id ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:bg-slate-100'}`}>
                                {tab.icon} {tab.label}
                            </button>
                        ))}
                    </nav>
                    <main className="flex-1 p-6 overflow-y-auto custom-scrollbar">
                        {student.totalCheats > 0 && (
                            <div className="bg-red-50 p-4 rounded-xl border border-red-200 flex items-center gap-3 mb-6">
                                <AlertTriangle size={24} className="text-red-500"/>
                                <div>
                                    <h4 className="font-bold text-red-700">ตรวจพบพฤติกรรมน่าสงสัย</h4>
                                    <p className="text-sm text-red-600">มีการสลับหน้าจอระหว่างทำข้อสอบ {student.totalCheats} ครั้ง</p>
                                </div>
                            </div>
                        )}
                        {activeTab === 'overview' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                   <div className="bg-white rounded-2xl p-6 border border-slate-100">
                                       <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">คะแนนรวม</h4>
                                       <p className="text-4xl font-black text-indigo-600">{student.score} <span className="text-lg text-slate-300">/ {maxTotalScore}</span></p>
                                   </div>
                                   <div className="bg-white rounded-2xl p-6 border border-slate-100">
                                       <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">ความก้าวหน้า</h4>
                                        <div className="flex items-center gap-4">
                                            <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                                                <div className="bg-green-500 h-full" style={{width: `${student.percent}%`}}></div>
                                            </div>
                                            <p className="text-4xl font-black text-green-600">{student.percent}<span className="text-lg">%</span></p>
                                        </div>
                                   </div>
                                </div>
                            </div>
                        )}
                        {activeTab === 'assessments' && (
                            <div>
                            <div className="space-y-4 mb-6">
                                {/* Success/Error Messages */}
                                {gradingError && (
                                    <div className="bg-red-50 p-4 rounded-xl border border-red-200 flex items-center gap-3">
                                        <XCircle size={20} className="text-red-500"/>
                                        <span className="text-red-700">{gradingError}</span>
                                        <button onClick={() => setGradingError('')} className="ml-auto text-red-500 hover:text-red-700">
                                            <X size={16}/>
                                        </button>
                                    </div>
                                )}
                                {gradingSuccess && (
                                    <div className="bg-green-50 p-4 rounded-xl border border-green-200 flex items-center gap-3">
                                        <CheckCircle size={20} className="text-green-500"/>
                                        <span className="text-green-700">{gradingSuccess}</span>
                                        <button onClick={() => setGradingSuccess('')} className="ml-auto text-green-500 hover:text-green-700">
                                            <X size={16}/>
                                        </button>
                                    </div>
                                )}

                                {/* Search and Filter Controls */}
                                <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
                                    <div className="flex-1 min-w-[200px]">
                                        <input
                                            type="text"
                                            placeholder="ค้นหาการบ้าน..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <select
                                            value={filterType}
                                            onChange={(e) => setFilterType(e.target.value as 'all' | 'ungraded' | 'assignment')}
                                            className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none text-sm"
                                        >
                                            <option value="all">ทั้งหมด</option>
                                            <option value="assignment">เฉพาะการบ้าน</option>
                                            <option value="ungraded">ยังไม่ได้ให้คะแนน</option>
                                        </select>
                                        <button
                                            onClick={exportToCSV}
                                            className="px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                                            title="ส่งออกเป็น CSV"
                                        >
                                            📄
                                        </button>
                                    </div>
                                </div>

                                {/* Bulk Actions */}
                                {selectedAssignments.size > 0 && (
                                    <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-200">
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                            <span className="text-indigo-700 font-medium">
                                                เลือก {selectedAssignments.size} การบ้าน
                                            </span>
                                            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                                                <div className="flex gap-2">
                                                    <input
                                                        type="number"
                                                        placeholder="คะแนน"
                                                        value={bulkScore}
                                                        onChange={(e) => setBulkScore(e.target.value)}
                                                        className="w-20 px-3 py-1 border border-slate-200 rounded text-center text-sm"
                                                        min="0"
                                                    />
                                                    <input
                                                        type="text"
                                                        placeholder="ความคิดเห็น (ไม่บังคับ)"
                                                        value={bulkFeedback}
                                                        onChange={(e) => setBulkFeedback(e.target.value)}
                                                        className="flex-1 px-3 py-1 border border-slate-200 rounded text-sm min-w-[150px]"
                                                    />
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={handleBulkGrade}
                                                        className="px-4 py-1 bg-indigo-600 text-white text-sm font-bold rounded hover:bg-indigo-700"
                                                    >
                                                        ให้คะแนนทั้งหมด
                                                    </button>
                                                    <button
                                                        onClick={clearSelection}
                                                        className="px-4 py-1 bg-slate-100 text-slate-700 text-sm font-bold rounded hover:bg-slate-200"
                                                    >
                                                        ยกเลิก
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                           <div className="overflow-x-auto">
                           <table className="w-full text-sm min-w-[600px]">
                                <thead className="text-xs text-slate-400 uppercase bg-slate-100 rounded-t-lg">
                                    <tr>
                                        <th className="p-3 text-center rounded-tl-lg w-12">
                                            <input
                                                type="checkbox"
                                                onChange={(e) => e.target.checked ? selectAllAssignments() : clearSelection()}
                                                className="rounded border-slate-300"
                                            />
                                        </th>
                                        <th className="p-3 text-left">หัวข้อ</th>
                                        <th className="p-3 text-left">วันที่ส่ง</th>
                                        <th className="p-3 text-center">สถานะ</th>
                                        <th className="p-3 text-center">การดำเนินการ</th>
                                        <th className="p-3 text-right rounded-tr-lg">คะแนน</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredAssessments.map(item => {
                                        let status, score, maxScore, submittedAt;
                                        if (item.type === 'Total') {
                                            status = true; score = student.score; maxScore = item.maxScore; submittedAt = null;
                                        } else if (item.type === 'Unit Total') {
                                            const unitAssessments = allAssessments.filter(a => a.unitId === item.unitId);
                                            let totalScore = 0;
                                            for (const a of unitAssessments) {
                                                if (a.type === 'Activity') totalScore += progress.activities?.[a.id]?.score || 0;
                                                else if (a.type === 'Quiz') totalScore += progress.quizzes?.[a.id]?.score || 0;
                                                else if (a.type === 'Assignment') totalScore += progress.assignments?.[a.id]?.score || 0;
                                                else if (a.type === 'Notebook') {
                                                    const unitId = a.id.replace('notebook_', '');
                                                    totalScore += progress.notebookScores?.[unitId] || 0;
                                                }
                                            }
                                            status = true; score = totalScore; maxScore = item.maxScore; submittedAt = null;
                                        } else if (item.type === 'Activity') {
                                            const p = progress.activities?.[item.id];
                                            status = p?.status === 'graded'; score = p?.score; maxScore = item.maxScore; submittedAt = p?.submittedAt;
                                        } else if (item.type === 'Quiz' || item.type === 'Final Exam' || item.type === 'Midterm Exam') {
                                            const p = progress.quizzes?.[item.id];
                                            status = p?.submitted; score = p?.score; maxScore = item.maxScore; submittedAt = p?.submittedAt;
                                        } else if (item.type === 'Assignment') {
                                            const p = progress.assignments?.[item.id];
                                            status = p?.status === 'graded'; score = p?.score; maxScore = item.maxScore; submittedAt = p?.submittedAt;
                                        } else { // Notebook
                                            const unitId = item.id.replace('notebook_', '');
                                            const p = progress.notebookScores?.[unitId];
                                            const sub = progress.notebookSubmissions?.[unitId];
                                            status = !!p; score = p; maxScore = NOTEBOOK_MAX_SCORE; submittedAt = sub?.submittedAt;
                                        }
                                        return (
                                            <tr key={item.id} className="border-b border-slate-100 hover:bg-white">
                                                <td className="p-3 text-center">
                                                    {item.type === 'Assignment' && progress.assignments?.[item.id] && (
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedAssignments.has(item.id)}
                                                            onChange={() => toggleAssignmentSelection(item.id)}
                                                            className="rounded border-slate-300"
                                                        />
                                                    )}
                                                </td>
                                                <td className="p-3 font-medium text-slate-700">{item.title}</td>
                                                <td className="p-3 text-left text-slate-500 text-xs">
                                                    {submittedAt ? new Date(submittedAt).toLocaleString('th-TH', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}
                                                </td>
                                                <td className="p-3 text-center">
                                                    {status ? <CheckCircle size={14} className="text-green-500 inline"/> : <Clock size={14} className="text-slate-400 inline"/>}
                                                </td>
                                                <td className="p-3 text-center">
                                                    {item.type === 'Assignment' && progress.assignments?.[item.id] ? (
                                                        <div className="flex items-center justify-center gap-1">
                                                            {editingAssignment === item.id ? (
                                                                <div className="flex gap-1">
                                                                    <button 
                                                                        onClick={handleSaveGrade}
                                                                        disabled={isGrading}
                                                                        className="px-2 py-1 bg-green-500 text-white text-xs font-bold rounded hover:bg-green-600 disabled:opacity-50"
                                                                    >
                                                                        <Save size={12}/>
                                                                    </button>
                                                                    <button 
                                                                        onClick={handleCancelEdit}
                                                                        disabled={isGrading}
                                                                        className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded hover:bg-red-600 disabled:opacity-50"
                                                                    >
                                                                        <X size={12}/>
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <div className="flex gap-1">
                                                                    <button 
                                                                        onClick={() => handleViewSubmission(item)}
                                                                        className="px-2 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded hover:bg-blue-100"
                                                                    >
                                                                        ดูคำตอบ
                                                                    </button>
                                                                    <button 
                                                                        onClick={() => handleStartEdit(item.id)}
                                                                        className="px-2 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded hover:bg-indigo-100"
                                                                    >
                                                                        <Edit size={12}/>
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : item.type === 'Notebook' && progress.notebookSubmissions?.[item.id.replace('notebook_', '')] ? (
                                                        <div className="flex items-center justify-center gap-1">
                                                            {editingNotebook === item.id ? (
                                                                <div className="flex gap-1">
                                                                    <button 
                                                                        onClick={() => handleSaveNotebookGrade(item.id.replace('notebook_', ''))}
                                                                        disabled={isGrading}
                                                                        className="px-2 py-1 bg-green-500 text-white text-xs font-bold rounded hover:bg-green-600 disabled:opacity-50"
                                                                    >
                                                                        <Save size={12}/>
                                                                    </button>
                                                                    <button 
                                                                        onClick={() => setEditingNotebook(null)}
                                                                        disabled={isGrading}
                                                                        className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded hover:bg-red-600 disabled:opacity-50"
                                                                    >
                                                                        <X size={12}/>
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <div className="flex gap-1">
                                                                    <button 
                                                                        onClick={() => handleViewNotebook(item.id.replace('notebook_', ''))}
                                                                        className="px-2 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded hover:bg-blue-100"
                                                                    >
                                                                        ดูบันทึก
                                                                    </button>
                                                                    <button 
                                                                        onClick={() => handleStartEditNotebook(item.id)}
                                                                        className="px-2 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded hover:bg-indigo-100"
                                                                    >
                                                                        <Edit size={12}/>
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : item.type === 'Activity' && progress.activities?.[item.id]?.submitted ? (
                                                        <div className="flex items-center justify-center gap-1">
                                                            {editingActivity === item.id ? (
                                                                <div className="flex gap-1">
                                                                    <button 
                                                                        onClick={() => handleSaveActivityGrade(item.id)}
                                                                        disabled={isGrading}
                                                                        className="px-2 py-1 bg-green-500 text-white text-xs font-bold rounded hover:bg-green-600 disabled:opacity-50"
                                                                    >
                                                                        <Save size={12}/>
                                                                    </button>
                                                                    <button 
                                                                        onClick={() => setEditingActivity(null)}
                                                                        disabled={isGrading}
                                                                        className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded hover:bg-red-600 disabled:opacity-50"
                                                                    >
                                                                        <X size={12}/>
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <div className="flex gap-1">
                                                                    <button 
                                                                        onClick={() => handleViewActivity(item)}
                                                                        className="px-2 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded hover:bg-blue-100"
                                                                    >
                                                                        ดูกิจกรรม
                                                                    </button>
                                                                    <button 
                                                                        onClick={() => handleStartEditActivity(item.id)}
                                                                        className="px-2 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded hover:bg-indigo-100"
                                                                    >
                                                                        <Edit size={12}/>
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-slate-400">-</span>
                                                    )}
                                                </td>
                                                <td className="p-3 text-right font-bold text-slate-600">
                                                    {editingAssignment === item.id ? (
                                                        <div className="flex flex-col items-end gap-2">
                                                            <div className="flex items-center gap-2">
                                                                <input
                                                                    type="number"
                                                                    value={editScore}
                                                                    onChange={(e) => setEditScore(e.target.value)}
                                                                    className="w-16 px-2 py-1 border border-slate-200 rounded text-center text-sm"
                                                                    min="0"
                                                                    max={maxScore}
                                                                    placeholder="คะแนน"
                                                                />
                                                                <span className="text-slate-400">/ {maxScore}</span>
                                                            </div>
                                                            <input
                                                                type="text"
                                                                value={editFeedback}
                                                                onChange={(e) => setEditFeedback(e.target.value)}
                                                                placeholder="ความคิดเห็น"
                                                                className="w-full px-2 py-1 border border-slate-200 rounded text-sm text-left"
                                                            />
                                                        </div>
                                                    ) : editingNotebook === item.id ? (
                                                        <div className="flex flex-col items-end gap-2">
                                                            <div className="flex items-center gap-2">
                                                                <input
                                                                    type="number"
                                                                    value={editNotebookScore}
                                                                    onChange={(e) => setEditNotebookScore(e.target.value)}
                                                                    className="w-16 px-2 py-1 border border-slate-200 rounded text-center text-sm"
                                                                    min="0"
                                                                    max={NOTEBOOK_MAX_SCORE}
                                                                    placeholder="คะแนน"
                                                                />
                                                                <span className="text-slate-400">/ {NOTEBOOK_MAX_SCORE}</span>
                                                            </div>
                                                            <input
                                                                type="text"
                                                                value={editNotebookFeedback}
                                                                onChange={(e) => setEditNotebookFeedback(e.target.value)}
                                                                placeholder="ความคิดเห็น"
                                                                className="w-full px-2 py-1 border border-slate-200 rounded text-sm text-left"
                                                            />
                                                        </div>
                                                    ) : editingActivity === item.id ? (
                                                        <div className="flex flex-col items-end gap-2">
                                                            <div className="flex items-center gap-2">
                                                                <input
                                                                    type="number"
                                                                    value={editActivityScore}
                                                                    onChange={(e) => setEditActivityScore(e.target.value)}
                                                                    className="w-16 px-2 py-1 border border-slate-200 rounded text-center text-sm"
                                                                    min="0"
                                                                    max={maxScore}
                                                                    placeholder="คะแนน"
                                                                />
                                                                <span className="text-slate-400">/ {maxScore}</span>
                                                            </div>
                                                            <input
                                                                type="text"
                                                                value={editActivityFeedback}
                                                                onChange={(e) => setEditActivityFeedback(e.target.value)}
                                                                placeholder="ความคิดเห็น"
                                                                className="w-full px-2 py-1 border border-slate-200 rounded text-sm text-left"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <span>{typeof score === 'number' ? score : '-'} / {maxScore}</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                           </table>
                           </div>
                            </div>
                        )}
                         {activeTab === 'achievements' && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {ACHIEVEMENTS_LIST.map(ach => {
                                    const isEarned = progress.achievements?.includes(ach.id);
                                    return (
                                        <div key={ach.id} className={`p-4 rounded-2xl flex flex-col items-center text-center ${isEarned ? 'bg-white shadow-sm border border-amber-200' : 'bg-slate-100 opacity-70'}`}>
                                            <div className={`text-3xl mb-2 ${!isEarned && 'grayscale'}`}>{ach.icon}</div>
                                            <div className="font-bold text-xs text-slate-700">{ach.title}</div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                        {activeTab === 'awards' && (
                            <div className="bg-white p-6 rounded-2xl border border-slate-200">
                                <h4 className="font-bold text-indigo-700 mb-4">มอบรางวัลพิเศษ</h4>
                                <form onSubmit={handleAward} className="space-y-4">
                                    <input type="number" value={xpAward} onChange={e => setXpAward(e.target.value)} placeholder="ให้รางวัล XP" className="w-full p-3 border rounded-lg"/>
                                    <input type="number" value={coinsAward} onChange={e => setCoinsAward(e.target.value)} placeholder="ให้รางวัล Coins" className="w-full p-3 border rounded-lg"/>
                                    <button type="submit" className="w-full py-3 bg-indigo-600 text-white font-bold rounded-lg flex items-center justify-center gap-2">
                                        <PlusCircle size={18}/> มอบรางวัล
                                    </button>
                                </form>
                            </div>
                        )}
                    </main>
                </div>
            </div>

            {/* Submission View Modal */}
            {viewingSubmission && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[300] flex items-center justify-center p-4 animate-fade-in" onClick={handleCloseSubmissionView}>
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] shadow-2xl overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
                        <header className="p-6 border-b border-slate-200 flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">
                                    {allAssessments.find(a => a.id === viewingSubmission.assignmentId)?.title || 'การบ้าน'}
                                </h3>
                                <p className="text-sm text-slate-500">
                                    ส่งเมื่อ: {new Date(viewingSubmission.submittedAt).toLocaleString('th-TH')}
                                </p>
                            </div>
                            <button onClick={handleCloseSubmissionView} className="p-2 text-slate-400 hover:text-slate-600">
                                <X size={20}/>
                            </button>
                        </header>
                        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
                            {viewingSubmission.answerText && (
                                <div className="mb-4">
                                    <h4 className="font-bold text-slate-700 mb-2">คำตอบ:</h4>
                                    <div className="bg-slate-50 p-4 rounded-lg border whitespace-pre-wrap">
                                        {viewingSubmission.answerText}
                                    </div>
                                </div>
                            )}
                            {viewingSubmission.fileUrl && (
                                <div className="mb-4">
                                    <h4 className="font-bold text-slate-700 mb-2">ไฟล์แนบ:</h4>
                                    <a 
                                        href={viewingSubmission.fileUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                                    >
                                        <FileText size={16}/>
                                        {viewingSubmission.fileName || 'ดาวน์โหลดไฟล์'}
                                    </a>
                                </div>
                            )}
                            {viewingSubmission.score !== undefined && (
                                <div className="mb-4">
                                    <h4 className="font-bold text-slate-700 mb-2">คะแนน:</h4>
                                    <p className="text-lg font-bold text-indigo-600">
                                        {viewingSubmission.score} / {allAssessments.find(a => a.id === viewingSubmission.assignmentId)?.maxScore || 0}
                                    </p>
                                </div>
                            )}
                            {viewingSubmission.feedback && (
                                <div>
                                    <h4 className="font-bold text-slate-700 mb-2">ความคิดเห็น:</h4>
                                    <div className="bg-slate-50 p-4 rounded-lg border">
                                        {viewingSubmission.feedback}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Activity View Modal */}
            {viewingActivity && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[300] flex items-center justify-center p-4 animate-fade-in" onClick={() => setViewingActivity(null)}>
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] shadow-2xl overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
                        <header className="p-6 border-b border-slate-200 flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">
                                    {viewingActivity.title}
                                </h3>
                                <p className="text-sm text-slate-500">
                                    ส่งเมื่อ: {new Date(viewingActivity.submittedAt).toLocaleString('th-TH')}
                                </p>
                            </div>
                            <button onClick={() => setViewingActivity(null)} className="p-2 text-slate-400 hover:text-slate-600">
                                <X size={20}/>
                            </button>
                        </header>
                        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
                            <div className="mb-4">
                                <h4 className="font-bold text-slate-700 mb-2">คะแนน:</h4>
                                <p className="text-lg font-bold text-indigo-600">
                                    {viewingActivity.score} / {allAssessments.find(a => a.id === viewingActivity.id)?.maxScore || 0}
                                </p>
                            </div>
                            {viewingActivity.feedback && (
                                <div>
                                    <h4 className="font-bold text-slate-700 mb-2">ความคิดเห็น:</h4>
                                    <div className="bg-slate-50 p-4 rounded-lg border">
                                        {viewingActivity.feedback}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

        {/* Confirmation Dialog for Grading */}
        {showConfirmGrade && pendingGrade && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[300] flex items-center justify-center p-4 animate-fade-in" onClick={cancelGrade}>
                <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                    <header className="p-6 border-b border-slate-200">
                        <h3 className="text-xl font-bold text-slate-800">ยืนยันการให้คะแนน</h3>
                    </header>
                    <div className="p-6">
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-slate-600 mb-2">การบ้าน:</p>
                                <p className="font-medium">{allAssessments.find(a => a.id === pendingGrade.assignmentId)?.title}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-slate-600 mb-1">คะแนนเดิม</p>
                                    <p className="text-lg font-bold text-slate-500">
                                        {progress.assignments?.[pendingGrade.assignmentId]?.score ?? '-'} / {allAssessments.find(a => a.id === pendingGrade.assignmentId)?.maxScore}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-600 mb-1">คะแนนใหม่</p>
                                    <p className="text-lg font-bold text-indigo-600">
                                        {pendingGrade.score} / {allAssessments.find(a => a.id === pendingGrade.assignmentId)?.maxScore}
                                    </p>
                                </div>
                            </div>
                            {pendingGrade.feedback && (
                                <div>
                                    <p className="text-sm text-slate-600 mb-1">ความคิดเห็น</p>
                                    <p className="text-sm bg-slate-50 p-3 rounded-lg">{pendingGrade.feedback}</p>
                                </div>
                            )}
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button 
                                onClick={cancelGrade}
                                className="flex-1 py-3 px-4 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                                disabled={isGrading}
                            >
                                ยกเลิก
                            </button>
                            <button 
                                onClick={confirmGrade}
                                className="flex-1 py-3 px-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50"
                                disabled={isGrading}
                            >
                                {isGrading ? 'กำลังบันทึก...' : 'ยืนยัน'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* Bulk Grading Confirmation Dialog */}
        {showBulkGrade && pendingGrade && selectedAssignments.size > 0 && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[300] flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowBulkGrade(false)}>
                <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                    <header className="p-6 border-b border-slate-200">
                        <h3 className="text-xl font-bold text-slate-800">ยืนยันการให้คะแนนแบบกลุ่ม</h3>
                    </header>
                    <div className="p-6">
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-slate-600 mb-2">จำนวนการบ้านที่เลือก</p>
                                <p className="font-medium">{selectedAssignments.size} การบ้าน</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-600 mb-1">คะแนนที่จะให้</p>
                                <p className="text-lg font-bold text-indigo-600">{pendingGrade.score} คะแนน</p>
                            </div>
                            {pendingGrade.feedback && (
                                <div>
                                    <p className="text-sm text-slate-600 mb-1">ความคิดเห็น</p>
                                    <p className="text-sm bg-slate-50 p-3 rounded-lg">{pendingGrade.feedback}</p>
                                </div>
                            )}
                            <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                                <p className="text-sm text-yellow-700">
                                    ⚠️ การดำเนินการนี้จะให้คะแนนเดียวกันกับการบ้านทั้งหมดที่เลือก
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button 
                                onClick={() => setShowBulkGrade(false)}
                                className="flex-1 py-3 px-4 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                                disabled={isGrading}
                            >
                                ยกเลิก
                            </button>
                            <button 
                                onClick={confirmBulkGrade}
                                className="flex-1 py-3 px-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50"
                                disabled={isGrading}
                            >
                                {isGrading ? 'กำลังบันทึก...' : 'ยืนยัน'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* Notebook View Modal */}
        {viewingNotebook && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[300] flex items-center justify-center p-4 animate-fade-in" onClick={handleCloseNotebookView}>
                <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[80vh] shadow-2xl overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
                    <header className="p-6 border-b border-slate-200 flex justify-between items-center">
                        <div>
                            <h3 className="text-xl font-bold text-slate-800">
                                สมุดบันทึก: {DEFAULT_COURSE_UNITS.find(u => u.id === viewingNotebook.unitId)?.subtitle || viewingNotebook.unitId}
                            </h3>
                            <p className="text-sm text-slate-500">
                                ส่งเมื่อ: {progress.notebookSubmissions?.[viewingNotebook.unitId]?.submittedAt ? new Date(progress.notebookSubmissions[viewingNotebook.unitId].submittedAt).toLocaleString('th-TH') : 'ยังไม่ได้ส่ง'}
                            </p>
                        </div>
                        <button onClick={handleCloseNotebookView} className="p-2 text-slate-400 hover:text-slate-600">
                            <X size={20}/>
                        </button>
                    </header>
                    <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
                        <div className="mb-4">
                            <h4 className="font-bold text-slate-700 mb-2">เนื้อหาสมุดบันทึก:</h4>
                            <div className="bg-slate-50 p-4 rounded-lg border whitespace-pre-wrap min-h-[200px]">
                                {viewingNotebook.content || 'ยังไม่มีเนื้อหา'}
                            </div>
                        </div>
                        {viewingNotebook.score !== undefined && (
                            <div className="mb-4">
                                <h4 className="font-bold text-slate-700 mb-2">คะแนน:</h4>
                                <p className="text-lg font-bold text-indigo-600">
                                    {viewingNotebook.score} / {NOTEBOOK_MAX_SCORE}
                                </p>
                            </div>
                        )}
                        {viewingNotebook.feedback && (
                            <div>
                                <h4 className="font-bold text-slate-700 mb-2">ความคิดเห็น:</h4>
                                <div className="bg-slate-50 p-4 rounded-lg border">
                                    {viewingNotebook.feedback}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}
    </div>
    );
};

export default StudentPortfolioView;